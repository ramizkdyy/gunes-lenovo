import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateMessageDto, MessageTopicDto } from './dto';

/** Aynı IP'den arka arkaya gelen gönderimler için basit bir set. */
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 5;

@Injectable()
export class MessagesService {
  private readonly recent = new Map<string, number[]>();

  constructor(private readonly prisma: PrismaService) {}

  // ─── Konular ────────────────────────────────────────────────────

  /** Formda gösterilecek konular — pasife alınanlar hariç. */
  activeTopics() {
    return this.prisma.messageTopic.findMany({
      where: { active: true },
      orderBy: [{ sort: 'asc' }, { id: 'asc' }],
      select: { id: true, label: true },
    });
  }

  allTopics() {
    return this.prisma.messageTopic.findMany({
      orderBy: [{ sort: 'asc' }, { id: 'asc' }],
      include: { _count: { select: { messages: true } } },
    });
  }

  createTopic(dto: MessageTopicDto) {
    return this.prisma.messageTopic.create({ data: this.topicData(dto) });
  }

  async updateTopic(id: number, dto: MessageTopicDto) {
    await this.topicById(id);
    return this.prisma.messageTopic.update({ where: { id }, data: this.topicData(dto) });
  }

  /**
   * Konu silinince ona bağlı mesajlar durur; `topicLabel` kopyası
   * sayesinde hangi konuda yazıldıkları kaybolmaz.
   */
  async deleteTopic(id: number) {
    await this.topicById(id);
    await this.prisma.messageTopic.delete({ where: { id } });
    return { ok: true };
  }

  async reorderTopics(items: { id: number; sort: number }[]) {
    await this.prisma.$transaction(
      items.map(({ id, sort }) => this.prisma.messageTopic.update({ where: { id }, data: { sort } }))
    );
    return { ok: true };
  }

  // ─── Mesajlar ───────────────────────────────────────────────────

  /** Siteden gelen gönderim. Konu ve ürün adları kopyalanarak saklanır. */
  async create(dto: CreateMessageDto, ip: string) {
    this.checkRate(ip);

    // Geri dönüş yapacak bir kanal olmadan mesaj işe yaramaz.
    if (!dto.phone?.trim() && !dto.email?.trim()) {
      throw new BadRequestException('Telefon ya da e-postadan en az birini yazın');
    }

    const topic = dto.topicId
      ? await this.prisma.messageTopic.findUnique({ where: { id: dto.topicId } })
      : null;
    const product = dto.productId
      ? await this.prisma.product.findUnique({ where: { id: dto.productId } })
      : null;

    await this.prisma.message.create({
      data: {
        name: dto.name.trim(),
        company: dto.company?.trim() ?? '',
        phone: dto.phone?.trim() ?? '',
        email: dto.email?.trim() ?? '',
        body: dto.body.trim(),
        topicId: topic?.id ?? null,
        topicLabel: topic?.label ?? '',
        productId: product?.id ?? null,
        productLabel: product?.model ?? '',
        sourcePath: dto.sourcePath?.slice(0, 300) ?? '',
      },
    });

    // Ziyaretçiye kayıt ayrıntısı dönmüyoruz; yalnızca alındı bilgisi.
    return { ok: true };
  }

  list(status?: 'NEW' | 'READ' | 'ARCHIVED') {
    return this.prisma.message.findMany({
      where: status ? { status } : { status: { not: 'ARCHIVED' } },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  /** Panelde rozet için: okunmamış sayısı. */
  async unreadCount() {
    return { count: await this.prisma.message.count({ where: { status: 'NEW' } }) };
  }

  async byId(id: number) {
    const message = await this.prisma.message.findUnique({ where: { id } });
    if (!message) throw new NotFoundException('Mesaj bulunamadı');
    return message;
  }

  async setStatus(id: number, status: 'NEW' | 'READ' | 'ARCHIVED') {
    await this.byId(id);
    return this.prisma.message.update({ where: { id }, data: { status } });
  }

  async remove(id: number) {
    await this.byId(id);
    await this.prisma.message.delete({ where: { id } });
    return { ok: true };
  }

  // ─── Yardımcılar ────────────────────────────────────────────────

  private topicData(dto: MessageTopicDto) {
    return {
      label: dto.label.trim(),
      sort: dto.sort ?? 0,
      active: dto.active ?? true,
    };
  }

  private async topicById(id: number) {
    const topic = await this.prisma.messageTopic.findUnique({ where: { id } });
    if (!topic) throw new NotFoundException('Konu bulunamadı');
    return topic;
  }

  /** Form kötüye kullanılmasın diye dakikada beş gönderim sınırı. */
  private checkRate(ip: string): void {
    const now = Date.now();
    const hits = (this.recent.get(ip) ?? []).filter((time) => now - time < RATE_WINDOW_MS);

    if (hits.length >= RATE_LIMIT) {
      throw new BadRequestException('Çok fazla gönderim yaptınız, birkaç dakika sonra tekrar deneyin.');
    }

    hits.push(now);
    this.recent.set(ip, hits);

    // Eski kayıtlar birikmesin.
    if (this.recent.size > 5000) {
      for (const [key, times] of this.recent) {
        if (!times.some((time) => now - time < RATE_WINDOW_MS)) this.recent.delete(key);
      }
    }
  }
}

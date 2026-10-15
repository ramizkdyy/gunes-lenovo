import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { UpdateSettingsDto } from './dto';

/** Ayarlar tek satırda durur; ilk okumada şemadaki varsayılanlarla oluşur. */
const SETTINGS_ID = 1;

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  private row() {
    return this.prisma.siteSettings.upsert({
      where: { id: SETTINGS_ID },
      create: { id: SETTINGS_ID },
      update: {},
    });
  }

  /** Sitenin gördüğü kısım — bildirim adresi dışarı verilmez. */
  async publicSettings() {
    const { phone } = await this.row();
    return { phone };
  }

  async adminSettings() {
    const { phone, notifyEmail } = await this.row();
    return { phone, notifyEmail };
  }

  async update(dto: UpdateSettingsDto) {
    const data: { phone?: string; notifyEmail?: string } = {};
    if (dto.phone !== undefined) data.phone = dto.phone.trim().replace(/\s+/g, ' ');
    if (dto.notifyEmail !== undefined) data.notifyEmail = splitEmails(dto.notifyEmail).join(', ');

    const { phone, notifyEmail } = await this.prisma.siteSettings.upsert({
      where: { id: SETTINGS_ID },
      create: { id: SETTINGS_ID, ...data },
      update: data,
    });
    return { phone, notifyEmail };
  }
}

/** "a@x.com, b@y.com" → ["a@x.com", "b@y.com"] */
export function splitEmails(value: string): string[] {
  return value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

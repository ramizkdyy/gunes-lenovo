import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { CategoryDto, HeroSlideDto, ProductDto, ReorderDto } from './dto';

/** Görsel ilişkisi ve yayın filtresi her yerde aynı olsun diye kısayollar. */
const PUBLISHED = { status: 'PUBLISHED' as const };
const WITH_IMAGE = { image: true };

@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Kategoriler ────────────────────────────────────────────────

  categories(includeDrafts = false) {
    return this.prisma.category.findMany({
      where: includeDrafts ? {} : PUBLISHED,
      include: { ...WITH_IMAGE, _count: { select: { products: true } } },
      orderBy: [{ sort: 'asc' }, { id: 'asc' }],
    });
  }

  async category(slug: string, includeDrafts = false) {
    const category = await this.prisma.category.findFirst({
      where: { slug, ...(includeDrafts ? {} : PUBLISHED) },
      include: {
        ...WITH_IMAGE,
        products: {
          where: includeDrafts ? {} : PUBLISHED,
          include: WITH_IMAGE,
          orderBy: [{ sort: 'asc' }, { id: 'asc' }],
        },
      },
    });
    if (!category) throw new NotFoundException('Kategori bulunamadı');
    return category;
  }

  async categoryById(id: number) {
    const category = await this.prisma.category.findUnique({ where: { id }, include: WITH_IMAGE });
    if (!category) throw new NotFoundException('Kategori bulunamadı');
    return category;
  }

  createCategory(dto: CategoryDto) {
    return this.guardUnique(() =>
      this.prisma.category.create({ data: this.categoryData(dto), include: WITH_IMAGE })
    );
  }

  async updateCategory(id: number, dto: CategoryDto) {
    await this.categoryById(id);
    return this.guardUnique(() =>
      this.prisma.category.update({ where: { id }, data: this.categoryData(dto), include: WITH_IMAGE })
    );
  }

  /** Kategori silinince içindeki ürünler de gider (şemada Cascade). */
  async deleteCategory(id: number) {
    await this.categoryById(id);
    await this.prisma.category.delete({ where: { id } });
    return { ok: true };
  }

  // ─── Ürünler ────────────────────────────────────────────────────

  products(includeDrafts = false) {
    return this.prisma.product.findMany({
      where: includeDrafts ? {} : PUBLISHED,
      include: { ...WITH_IMAGE, category: { select: { id: true, slug: true, name: true } } },
      orderBy: [{ categoryId: 'asc' }, { sort: 'asc' }, { id: 'asc' }],
    });
  }

  async product(categorySlug: string, slug: string, includeDrafts = false) {
    const product = await this.prisma.product.findFirst({
      where: {
        slug,
        ...(includeDrafts ? {} : PUBLISHED),
        category: { slug: categorySlug, ...(includeDrafts ? {} : PUBLISHED) },
      },
      include: { ...WITH_IMAGE, category: { select: { id: true, slug: true, name: true } } },
    });
    if (!product) throw new NotFoundException('Ürün bulunamadı');
    return product;
  }

  async productById(id: number) {
    const product = await this.prisma.product.findUnique({ where: { id }, include: WITH_IMAGE });
    if (!product) throw new NotFoundException('Ürün bulunamadı');
    return product;
  }

  createProduct(dto: ProductDto) {
    return this.guardUnique(
      () => this.prisma.product.create({ data: this.productData(dto), include: WITH_IMAGE }),
      'Bu kategoride aynı URL adına sahip bir ürün zaten var'
    );
  }

  async updateProduct(id: number, dto: ProductDto) {
    await this.productById(id);
    return this.guardUnique(
      () => this.prisma.product.update({ where: { id }, data: this.productData(dto), include: WITH_IMAGE }),
      'Bu kategoride aynı URL adına sahip bir ürün zaten var'
    );
  }

  async deleteProduct(id: number) {
    await this.productById(id);
    await this.prisma.product.delete({ where: { id } });
    return { ok: true };
  }

  // ─── Hero panelleri ─────────────────────────────────────────────

  heroSlides(includeDrafts = false) {
    return this.prisma.heroSlide.findMany({
      where: includeDrafts ? {} : PUBLISHED,
      include: WITH_IMAGE,
      orderBy: [{ sort: 'asc' }, { id: 'asc' }],
    });
  }

  async heroSlideById(id: number) {
    const slide = await this.prisma.heroSlide.findUnique({ where: { id }, include: WITH_IMAGE });
    if (!slide) throw new NotFoundException('Panel bulunamadı');
    return slide;
  }

  createHeroSlide(dto: HeroSlideDto) {
    return this.prisma.heroSlide.create({ data: this.heroData(dto), include: WITH_IMAGE });
  }

  async updateHeroSlide(id: number, dto: HeroSlideDto) {
    await this.heroSlideById(id);
    return this.prisma.heroSlide.update({ where: { id }, data: this.heroData(dto), include: WITH_IMAGE });
  }

  async deleteHeroSlide(id: number) {
    await this.heroSlideById(id);
    await this.prisma.heroSlide.delete({ where: { id } });
    return { ok: true };
  }

  // ─── Sıralama ───────────────────────────────────────────────────

  /**
   * Panelde sürükleyip bıraktıktan sonra yeni sıra tek istekte yazılır.
   * Hepsi tek işlemde; biri hata verirse hiçbiri değişmez.
   */
  async reorder(collection: 'category' | 'product' | 'heroSlide', items: ReorderDto[]) {
    await this.prisma.$transaction(
      items.map(({ id, sort }) => {
        const where = { id };
        const data = { sort };
        if (collection === 'category') return this.prisma.category.update({ where, data });
        if (collection === 'product') return this.prisma.product.update({ where, data });
        return this.prisma.heroSlide.update({ where, data });
      })
    );
    return { ok: true };
  }

  // ─── Yardımcılar ────────────────────────────────────────────────

  private categoryData(dto: CategoryDto) {
    return {
      slug: dto.slug,
      status: dto.status ?? 'DRAFT',
      sort: dto.sort ?? 0,
      families: dto.families ?? '',
      name: dto.name,
      desc: dto.desc ?? '',
      imageId: dto.imageId || null,
    };
  }

  private productData(dto: ProductDto) {
    return {
      slug: dto.slug,
      status: dto.status ?? 'DRAFT',
      sort: dto.sort ?? 0,
      categoryId: dto.categoryId,
      model: dto.model,
      title: dto.title ?? '',
      desc: dto.desc ?? '',
      datasheetUrl: dto.datasheetUrl ?? '',
      formFactor: dto.formFactor ?? '',
      processor: dto.processor ?? '',
      gpu: dto.gpu ?? '',
      memory: dto.memory ?? '',
      driveBays: dto.driveBays ?? '',
      expansionSlots: dto.expansionSlots ?? '',
      imageId: dto.imageId || null,
    };
  }

  private heroData(dto: HeroSlideDto) {
    return {
      status: dto.status ?? 'DRAFT',
      sort: dto.sort ?? 0,
      theme: dto.theme ?? 'dark',
      eyebrow: dto.eyebrow ?? '',
      title: dto.title,
      body: dto.body ?? '',
      ctaLabel: dto.ctaLabel ?? '',
      ctaHref: dto.ctaHref ?? '',
      imageId: dto.imageId || null,
    };
  }

  /** Prisma'nın tekil alan çakışmasını anlaşılır bir mesaja çevirir. */
  private async guardUnique<T>(run: () => Promise<T>, message = 'Bu URL adı zaten kullanılıyor'): Promise<T> {
    try {
      return await run();
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(message);
      }
      throw error;
    }
  }
}

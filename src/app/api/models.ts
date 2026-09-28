/** API'nin döndürdüğü kayıtlar. Alan adları Prisma şemasıyla birebir. */

export type Status = 'DRAFT' | 'PUBLISHED';

export interface Media {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  width: number;
  height: number;
  alt: string;
  createdAt: string;
}

export interface Category {
  id: number;
  slug: string;
  status: Status;
  sort: number;
  families: string;
  name: string;
  desc: string;
  imageId: string | null;
  image: Media | null;
  products?: Product[];
  _count?: { products: number };
}

export interface Product {
  id: number;
  slug: string;
  status: Status;
  sort: number;
  model: string;
  title: string;
  desc: string;
  datasheetUrl: string;

  formFactor: string;
  processor: string;
  gpu: string;
  memory: string;
  driveBays: string;
  expansionSlots: string;

  imageId: string | null;
  image: Media | null;
  categoryId: number;
  category?: Pick<Category, 'id' | 'slug' | 'name'>;
}

export interface HeroSlide {
  id: number;
  status: Status;
  sort: number;
  theme: 'dark' | 'dark-product' | 'light';
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  imageId: string | null;
  image: Media | null;
}

/**
 * Her üründe görünen sabit özellik satırları — Lenovo'nun kendi ürün
 * listelerindeki düzen. Başlıklar burada yazılı, veritabanında yalnızca
 * değerler durur. Sıra buradaki sıradır.
 *
 * Alan eklenirse `api/prisma/schema.prisma` ve panel formu da
 * güncellenmeli, yoksa girilecek yeri olmaz.
 */
export const SPEC_FIELDS = [
  { field: 'formFactor', label: 'Gövde tipi' },
  { field: 'processor', label: 'İşlemci' },
  { field: 'gpu', label: 'GPU desteği' },
  { field: 'memory', label: 'Bellek' },
  { field: 'driveBays', label: 'Disk yuvaları' },
  { field: 'expansionSlots', label: 'Genişletme yuvaları' },
] as const;

export interface Spec {
  label: string;
  value: string;
}

/**
 * Ürünün dolu olan özelliklerini sabit sırada döndürür.
 * Boş bırakılan satır listede yer almaz.
 */
export function specsOf(product: Product): Spec[] {
  return SPEC_FIELDS.map((spec) => ({
    label: spec.label,
    value: (product as unknown as Record<string, string>)[spec.field] ?? '',
  })).filter((spec) => spec.value.trim().length > 0);
}

export type MessageStatus = 'NEW' | 'READ' | 'ARCHIVED';

/** Siteden gelen teklif/iletişim talebi. */
export interface Message {
  id: number;
  status: MessageStatus;
  name: string;
  company: string;
  phone: string;
  email: string;
  body: string;
  /** Konu silinse de mesajda ne yazdığı kalsın diye kopya tutuluyor. */
  topicLabel: string;
  productLabel: string;
  sourcePath: string;
  createdAt: string;
}

/** Formdaki konu seçeneği — panelden yönetilir. */
export interface MessageTopicAdmin {
  id: number;
  label: string;
  sort: number;
  active: boolean;
  _count?: { messages: number };
}

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
  /** Bu kategoride yeni ürün açılınca gelen özellik başlıkları. */
  specTemplate: string[];
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

  /** Sitede bu sırayla görünür; değeri boş satır atlanır. */
  specs: Spec[];

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

export interface Spec {
  label: string;
  value: string;
  /** Kategori sayfasındaki ürün kartında gösterilir. */
  featured?: boolean;
}

/** Ürün kartında en fazla bu kadar özellik öne çıkar (API ile aynı sınır). */
export const MAX_FEATURED_SPECS = 5;

/** Ürünün dolu olan özellikleri, paneldeki sırayla. */
export function specsOf(product: Product): Spec[] {
  return (product.specs ?? []).filter((spec) => spec.value.trim().length > 0);
}

/**
 * Ürün kartındaki özellikler: öne çıkarılanlar. Hiçbiri seçilmemişse
 * ilk dolu özellikler gösterilir, kart boş kalmasın.
 */
export function cardSpecsOf(product: Product): Spec[] {
  const filled = specsOf(product);
  const featured = filled.filter((spec) => spec.featured);
  return (featured.length ? featured : filled).slice(0, MAX_FEATURED_SPECS);
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

/** Panelden düzenlenen site ayarları. Boş telefon sitede gösterilmez. */
export interface SiteSettings {
  phone: string;
}

/** Panelin gördüğü ayarlar — bildirim adresi siteye açılmaz. */
export interface SiteSettingsAdmin extends SiteSettings {
  notifyEmail: string;
}

/** "+90 342 325 55 55" → "tel:+903423255555" */
export function telHref(phone: string): string {
  return 'tel:' + phone.replace(/[^\d+]/g, '');
}

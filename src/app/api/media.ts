import { environment } from '../../environments/environment';

/**
 * Görsel adreslerinin tek çıkış noktası. Şu an API kendi diskinden
 * boyutlandırıp servis ediyor, CDN yok. İleride CDN ya da object
 * storage'a geçilirse değişecek tek yer burası — şablonlarda asla
 * elle adres yazma.
 */

export interface MediaOptions {
  /** İstenen genişlik (px). Yükseklik oranla belirlenir. */
  width?: number;
  height?: number;
  /** `cover` çerçeveyi doldurup taşanı kırpar, `contain` sığdırır. */
  fit?: 'cover' | 'contain' | 'inside';
}

/** Görsel yüklenmemişse gösterilecek yer tutucu. */
export const PLACEHOLDER = 'img/placeholder.svg';

export function mediaUrl(id: string | null | undefined, options: MediaOptions = {}): string {
  if (!id) return PLACEHOLDER;

  const params = new URLSearchParams();
  if (options.width) params.set('w', String(options.width));
  if (options.height) params.set('h', String(options.height));
  params.set('fit', options.fit ?? 'contain');
  params.set('format', 'webp');

  return `${environment.apiUrl}/media/${id}?${params}`;
}

/** `srcset` için 1x/2x çift üretir; retina ekranda bulanıklaşmasın diye. */
export function mediaSrcset(
  id: string | null | undefined,
  width: number,
  options: MediaOptions = {}
): string | null {
  if (!id) return null;
  return [
    `${mediaUrl(id, { ...options, width })} ${width}w`,
    `${mediaUrl(id, { ...options, width: width * 2 })} ${width * 2}w`,
  ].join(', ');
}

/**
 * Belirli genişlik basamaklarından `srcset` üretir. Tam ekran görsellerde
 * kullanılır: tarayıcı ekran genişliğine ve piksel yoğunluğuna göre
 * (retina'da 2 kat) en uygun olanı seçer.
 */
export function mediaSrcsetSteps(
  id: string | null | undefined,
  widths: number[],
  options: MediaOptions = {}
): string | null {
  if (!id) return null;
  return widths.map((width) => `${mediaUrl(id, { ...options, width })} ${width}w`).join(', ');
}

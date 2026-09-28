/** Panel ekranlarının paylaştığı küçük yardımcılar. */

/** Başlıktan URL adı üretir: "Rack Sunucular" → "rack-sunucular". */
export function slugify(value: string): string {
  const turkish: Record<string, string> = {
    ç: 'c', ğ: 'g', ı: 'i', İ: 'i', ö: 'o', ş: 's', ü: 'u',
    Ç: 'c', Ğ: 'g', Ö: 'o', Ş: 's', Ü: 'u',
  };
  return value
    .split('')
    .map((char) => turkish[char] ?? char)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** Sunucudan gelen doğrulama hatasını tek satıra indirir. */
export function errorMessage(error: unknown): string {
  const body = (error as { error?: { message?: string | string[] } })?.error;
  const message = body?.message;
  if (Array.isArray(message)) return message.join('. ');
  if (typeof message === 'string') return message;
  return 'Kaydedilemedi. Bağlantıyı kontrol edin.';
}

/** Yayın durumu seçenekleri — her formda aynı. */
export const STATUS_OPTIONS = [
  { value: 'PUBLISHED' as const, label: 'Yayında' },
  { value: 'DRAFT' as const, label: 'Taslak' },
];

/** Form alanlarında kullanılan ortak sınıf. */
export const INPUT_CLASS =
  'w-full rounded-md border border-[var(--line)] px-3 py-2.5 text-[14.5px] outline-none focus:border-[var(--fg)]';

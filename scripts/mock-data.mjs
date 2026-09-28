/**
 * Panelde oynamak için gerçekçi örnek içerik doldurur: Lenovo'nun kendi
 * ürün görselleri indirilip API'ye yüklenir, kategorilere ve ürünlere
 * bağlanır.
 *
 *   node scripts/mock-data.mjs
 *
 * Tekrar çalıştırılabilir: görseller `alt` alanındaki "mock:" imiyle
 * tanınır, ürünler slug üzerinden güncellenir. Elle eklediğiniz içeriğe
 * dokunmaz.
 */
import { readFile } from 'node:fs/promises';
import { categories, products, heroSlides } from './mock-data.js';

const API = process.env.API_URL ?? 'http://localhost:3000';
const EMAIL = process.env.ADMIN_EMAIL ?? 'admin@lenovo-sunucu.local';
const PASSWORD = process.env.ADMIN_PASSWORD ?? 'admin1234';

let auth = {};

async function api(path, { method = 'GET', body, raw } = {}) {
  const res = await fetch(API + path, {
    method,
    headers: { ...auth, ...(raw ? {} : { 'content-type': 'application/json' }) },
    body: raw ?? (body ? JSON.stringify(body) : undefined),
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${json?.message ?? text}`);
  return json;
}

/** Aynı görsel iki kez yüklenmesin: "mock:<ad>" imiyle eşleştirilir. */
const mediaCache = new Map();

/**
 * Ürün görsellerinin etrafındaki boşluğu kırpar (şeffaf ya da beyaz).
 * sharp API'nin bağımlılığı; ayrı kurmamak için oradan yükleniyor.
 */
async function trimmed(buffer, type) {
  const { default: sharp } = await import('../api/node_modules/sharp/lib/index.js');
  const transparent = type.includes('png');
  const background = transparent ? { r: 0, g: 0, b: 0, alpha: 0 } : '#ffffff';
  const image = sharp(buffer).trim(transparent ? {} : { background: '#ffffff', threshold: 8 })
    .extend({ top: 40, bottom: 40, left: 40, right: 40, background });
  return transparent
    ? image.png({ compressionLevel: 9 }).toBuffer()
    : image.jpeg({ quality: 92, mozjpeg: true }).toBuffer();
}

async function ensureMedia(name, url, trim = false) {
  if (mediaCache.has(name)) return mediaCache.get(name);

  const existing = (await api('/admin/media')).find((m) => m.alt === `mock:${name}`);
  if (existing) {
    mediaCache.set(name, existing.id);
    return existing.id;
  }

  // Adres http ile başlamıyorsa repodaki yerel dosya
  let type, buffer;
  if (/^https?:/.test(url)) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`görsel indirilemedi (${res.status}): ${url}`);
    type = res.headers.get('content-type') ?? 'image/png';
    buffer = Buffer.from(await res.arrayBuffer());
  } else {
    buffer = await readFile(url);
    type = url.endsWith('.png') ? 'image/png' : 'image/jpeg';
  }
  if (trim) buffer = await trimmed(buffer, type);
  const extension = type.includes('jpeg') ? 'jpg' : 'png';

  const form = new FormData();
  form.append('file', new Blob([buffer], { type }), `${name}.${extension}`);
  form.append('alt', `mock:${name}`);

  const media = await api('/admin/media', { method: 'POST', raw: form });
  console.log(`  ↑ ${name} (${Math.round(buffer.length / 1024)} kB)`);
  mediaCache.set(name, media.id);
  return media.id;
}

function strip(record) {
  const { image, products: _p, category, _count, createdAt, updatedAt, id, ...rest } = record;
  return rest;
}

async function main() {
  const login = await api('/auth/login', { method: 'POST', body: { email: EMAIL, password: PASSWORD } });
  auth = { authorization: `Bearer ${login.token}` };
  console.log(`Giriş: ${login.user.email}\n`);

  console.log('Kategoriler');
  const existingCategories = await api('/admin/categories');
  const categoryIdBySlug = {};

  for (const entry of categories) {
    const imageId = await ensureMedia(entry.slug, entry.imageUrl);
    const { imageUrl, ...data } = entry;
    const current = existingCategories.find((c) => c.slug === entry.slug);

    const saved = current
      ? await api(`/admin/categories/${current.id}`, {
          method: 'PUT',
          body: { ...strip(current), ...data, imageId },
        })
      : await api('/admin/categories', { method: 'POST', body: { ...data, imageId } });

    categoryIdBySlug[entry.slug] = saved.id;
  }
  console.log(`  ${categories.length} kategori hazır\n`);

  console.log('Ürünler');
  const existingProducts = await api('/admin/products');

  for (const entry of products) {
    const imageId = await ensureMedia(entry.slug, entry.imageUrl);
    const { imageUrl, categorySlug, ...data } = entry;
    const categoryId = categoryIdBySlug[categorySlug];
    if (!categoryId) throw new Error(`kategori bulunamadı: ${categorySlug}`);

    const current = existingProducts.find((p) => p.slug === entry.slug && p.categoryId === categoryId);

    if (current) {
      await api(`/admin/products/${current.id}`, {
        method: 'PUT',
        body: { ...strip(current), ...data, categoryId, imageId },
      });
    } else {
      await api('/admin/products', { method: 'POST', body: { ...data, categoryId, imageId } });
    }
  }
  console.log(`  ${products.length} ürün hazır\n`);

  console.log('Ana sayfa panelleri');
  const existingSlides = await api('/admin/hero-slides');

  for (const [index, entry] of heroSlides.entries()) {
    const imageId = await ensureMedia(`hero-${index + 1}`, entry.imageFile ?? entry.imageUrl, entry.trim);
    const { imageUrl, imageFile, trim, ...data } = entry;
    const current = existingSlides[index];

    if (current) {
      await api(`/admin/hero-slides/${current.id}`, {
        method: 'PUT',
        body: { ...strip(current), ...data, imageId },
      });
    } else {
      await api('/admin/hero-slides', { method: 'POST', body: { ...data, imageId } });
    }
  }
  console.log(`  ${heroSlides.length} panel hazır\n`);

  const summary = await api('/admin/products');
  console.log(`Toplam: ${(await api('/admin/categories')).length} kategori, ${summary.length} ürün`);
  console.log(`Görselsiz kalan ürün: ${summary.filter((p) => !p.imageId).length}`);
}

main().catch((error) => {
  console.error('\nHATA: ' + error.message);
  process.exit(1);
});

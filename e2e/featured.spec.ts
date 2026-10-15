import { adminLogin, api, apiToken, expect, test } from './helpers';

/** Öne çıkan özellikler: panelde seçim (en fazla 5), ürün kartında gösterim ve kart boyu. */

test.describe.configure({ mode: 'serial' });

interface Spec {
  label: string;
  value: string;
  featured?: boolean;
}
interface AdminProduct {
  id: number;
  slug: string;
  model: string;
  categoryId: number;
  specs: Spec[];
  category?: { slug: string };
  [key: string]: unknown;
}

let token: string;
let first: AdminProduct;
let second: AdminProduct;
let categorySlug: string;
const originals = new Map<number, Spec[]>();

/** Ürünü panelin gönderdiği gövdeyle günceller. */
async function saveSpecs(product: AdminProduct, specs: Spec[]): Promise<void> {
  const { id, category, image, createdAt, updatedAt, ...rest } = product;
  void category; void image; void createdAt; void updatedAt;
  await api(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify({ ...rest, specs }) }, token);
}

test.beforeAll(async () => {
  token = await apiToken();
  const products = await api<AdminProduct[]>('/admin/products', {}, token);
  // Aynı kategoride, en az 6 dolu özelliği olan iki yayındaki ürün.
  const filled = (p: AdminProduct) => p.specs.filter((s) => s.value.trim()).length;
  const byCategory = new Map<number, AdminProduct[]>();
  for (const p of products.filter((p) => p['status'] === 'PUBLISHED' && filled(p) >= 6)) {
    byCategory.set(p.categoryId, [...(byCategory.get(p.categoryId) ?? []), p]);
  }
  const pair = [...byCategory.values()].find((list) => list.length >= 2);
  test.skip(!pair, 'aynı kategoride 6+ özellikli iki yayındaki ürün yok');
  [first, second] = pair!;
  first = await api<AdminProduct>(`/admin/products/${first.id}`, {}, token);
  second = await api<AdminProduct>(`/admin/products/${second.id}`, {}, token);
  const categories = await api<{ id: number; slug: string }[]>('/admin/categories', {}, token);
  categorySlug = categories.find((c) => c.id === first.categoryId)!.slug;
  originals.set(first.id, first.specs);
  originals.set(second.id, second.specs);
});

test.afterAll(async () => {
  for (const product of [first, second].filter(Boolean)) {
    await saveSpecs(product, originals.get(product.id)!);
  }
});

test('panelde en fazla 5 özellik öne çıkarılabilir', async ({ page }) => {
  await adminLogin(page);
  await page.goto(`/admin/urunler/${first.id}`);
  await expect(page.getByRole('heading', { level: 1, name: first.model })).toBeVisible();

  const boxes = page.getByRole('checkbox', { name: /öne çıkar$/ });
  // Önce hepsini temizle
  for (const box of await boxes.all()) if (await box.isChecked()) await box.uncheck();
  await expect(page.getByText('0/5')).toBeVisible();

  for (let i = 0; i < 5; i++) await boxes.nth(i).check();
  await expect(page.getByText('5/5')).toBeVisible();
  // 6. kutu kilitli
  await expect(boxes.nth(5)).toBeDisabled();

  // Birini bırakınca kilit açılır
  await boxes.nth(4).uncheck();
  await expect(boxes.nth(5)).toBeEnabled();
  await boxes.nth(4).check();

  await page.getByRole('button', { name: 'Kaydet' }).click();
  await expect(page.getByText('Kaydedildi')).toBeVisible();

  const saved = await api<AdminProduct>(`/admin/products/${first.id}`, {}, token);
  expect(saved.specs.filter((s) => s.featured)).toHaveLength(5);
});

test('API 5ten fazla öne çıkan özelliği reddeder', async () => {
  const specs = first.specs.map((s, i) => ({ ...s, featured: i < 6 }));
  await expect(saveSpecs(first, specs)).rejects.toThrow(/400/);
});

test('kartta yalnızca öne çıkanlar görünür, kart boyu sabit', async ({ page }) => {
  const filled = (p: AdminProduct) => originals.get(p.id)!.filter((s) => s.value.trim());

  // 1. ürün: tek özellik; 2. ürün: 5 özellik
  const one = filled(first)[2];
  await saveSpecs(first, originals.get(first.id)!.map((s) => ({ ...s, featured: s.label === one.label })));
  const five = filled(second).slice(0, 5).map((s) => s.label);
  await saveSpecs(second, originals.get(second.id)!.map((s) => ({ ...s, featured: five.includes(s.label) })));

  await page.goto(`/kategoriler/${categorySlug}`);
  const cardOf = (model: string) =>
    page.locator('article').filter({ has: page.getByRole('heading', { name: model, exact: true }) });

  const firstCard = cardOf(first.model);
  const secondCard = cardOf(second.model);
  await expect(firstCard.locator('ul li')).toHaveCount(1);
  await expect(firstCard.locator('ul li')).toContainText(one.label);
  await expect(secondCard.locator('ul li')).toHaveCount(5);

  // Aynı boy: 1 özellikli kart ile 5 özellikli kart
  const [a, b] = [await firstCard.boundingBox(), await secondCard.boundingBox()];
  expect(Math.round(a!.height)).toBe(Math.round(b!.height));
  const [la, lb] = [await firstCard.locator('ul').boundingBox(), await secondCard.locator('ul').boundingBox()];
  expect(Math.round(la!.height)).toBe(Math.round(lb!.height));
});

test('detay sayfasında tüm dolu özellikler görünür', async ({ page }) => {
  await page.goto(`/kategoriler/${categorySlug}/${first.slug}`);
  for (const spec of originals.get(first.id)!.filter((s) => s.value.trim())) {
    await expect(page.getByText(spec.value, { exact: false }).first()).toBeAttached();
  }
});

test('hiç seçilmemişse kartta ilk 5 dolu özellik görünür', async ({ page }) => {
  await saveSpecs(first, originals.get(first.id)!.map((s) => ({ ...s, featured: false })));
  await page.goto(`/kategoriler/${categorySlug}`);
  const card = page.locator('article').filter({ has: page.getByRole('heading', { name: first.model, exact: true }) });
  await expect(card.locator('ul li')).toHaveCount(5);
});

test('footerda şirket unvanı yazar', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('footer')).toContainText('Güneş Bilgisayar İletişim Sistemleri A.Ş. · Tüm hakları saklıdır.');
});

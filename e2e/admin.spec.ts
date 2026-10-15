import { adminLogin, api, apiToken, expect, publishedCatalog, test } from './helpers';

/** Yönetim paneli: giriş, sayfalar, ürün filtresi, site ayarları ve gelen talepler. */

test.describe.configure({ mode: 'serial' });

test('yanlış şifreyle giriş yapılamaz', async ({ page, consoleErrors }) => {
  await page.goto('/admin/giris');
  await page.locator('input[name="email"]').fill('yanlis@ornek.com');
  await page.locator('input[name="password"]').fill('yanlis-sifre');
  await page.getByRole('button', { name: 'Giriş yap' }).click();
  await expect(page).toHaveURL(/\/admin\/giris/);
  await expect(page.locator('form p').last()).toBeVisible();
  consoleErrors.splice(0, consoleErrors.length, ...consoleErrors.filter((e) => !/401/.test(e)));
});

test('oturum olmadan panel açılmaz', async ({ page }) => {
  await page.goto('/admin/urunler');
  await expect(page).toHaveURL(/\/admin\/giris/);
});

test('paneldeki tüm sayfalar açılır', async ({ page }) => {
  await adminLogin(page);
  const pages: [string, string][] = [
    ['Mesajlar', 'Mesajlar'],
    ['Kategoriler', 'Kategoriler'],
    ['Ürünler', 'Ürünler'],
    ['Ana sayfa panelleri', 'Ana sayfa panelleri'],
    ['Görseller', 'Görseller'],
    ['Mesaj konuları', 'Mesaj konuları'],
    ['Site ayarları', 'Site ayarları'],
    ['Özet', 'Özet'],
  ];
  const nav = page.locator('aside nav');
  for (const [link, heading] of pages) {
    await nav.getByRole('link', { name: link, exact: false }).first().click();
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
  }
});

test('ürün listesi kategoriye göre süzülür', async ({ page }) => {
  const token = await apiToken();
  const products = await api<{ categoryId: number }[]>('/admin/products', {}, token);
  const categories = await api<{ id: number; name: string }[]>('/admin/categories', {}, token);

  await adminLogin(page);
  await page.goto('/admin/urunler');
  const count = page.getByText(/ürün listeleniyor/);
  await expect(count).toHaveText(`${products.length} ürün listeleniyor.`);

  const select = page.locator('select[name="category"]');
  for (const category of categories) {
    const expected = products.filter((p) => p.categoryId === category.id).length;
    await select.selectOption(String(category.id));
    await expect(count, category.name).toHaveText(`${expected} ürün listeleniyor.`);
  }
  await select.selectOption('');
  await expect(count).toHaveText(`${products.length} ürün listeleniyor.`);
});

test('her ürünün düzenleme sayfası açılır', async ({ page }) => {
  const token = await apiToken();
  const products = await api<{ id: number; model: string }[]>('/admin/products', {}, token);
  await adminLogin(page);
  for (const product of products) {
    await page.goto(`/admin/urunler/${product.id}`);
    await expect(page.getByRole('heading', { level: 1, name: product.model })).toBeVisible();
  }
});

test.describe('site ayarları', () => {
  let original: { phone: string; notifyEmail: string };

  test.beforeAll(async () => {
    original = await api('/admin/settings', {}, await apiToken());
  });

  test.afterAll(async () => {
    await api('/admin/settings', { method: 'PUT', body: JSON.stringify(original) }, await apiToken());
  });

  test('kayıtlı değerler gelir', async ({ page }) => {
    await adminLogin(page);
    await page.goto('/admin/ayarlar');
    await expect(page.locator('#settings-phone')).toHaveValue(original.phone);
    await expect(page.locator('#settings-notify')).toHaveValue(original.notifyEmail);
  });

  test('hatalı e-posta ve telefon reddedilir', async ({ page, consoleErrors }) => {
    await adminLogin(page);
    await page.goto('/admin/ayarlar');
    await page.locator('#settings-notify').fill('latif@');
    await page.getByRole('button', { name: 'Kaydet' }).click();
    await expect(page.getByText('E-posta adreslerini kontrol edin')).toBeVisible();

    await page.locator('#settings-notify').fill(original.notifyEmail);
    await page.locator('#settings-phone').fill('123');
    await page.getByRole('button', { name: 'Kaydet' }).click();
    await expect(page.getByText('Geçerli bir telefon numarası yazın')).toBeVisible();
    consoleErrors.splice(0, consoleErrors.length, ...consoleErrors.filter((e) => !/400/.test(e)));
  });

  test('telefon boşaltılınca sitede görünmez, girilince görünür', async ({ page }) => {
    await adminLogin(page);
    await page.goto('/admin/ayarlar');
    await page.locator('#settings-phone').fill('');
    await page.getByRole('button', { name: 'Kaydet' }).click();
    await expect(page.getByText('Kaydedildi')).toBeVisible();

    await page.goto('/teklif');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('a[href^="tel:"]')).toHaveCount(0);

    await page.goto('/admin/ayarlar');
    await page.locator('#settings-phone').fill('+90 555 000 11 22');
    await page.getByRole('button', { name: 'Kaydet' }).click();
    await expect(page.getByText('Kaydedildi')).toBeVisible();

    await page.goto('/teklif');
    await expect(page.locator('footer a[href="tel:+905550001122"]')).toHaveText('+90 555 000 11 22');
  });

  test('birden fazla bildirim adresi kaydedilir', async ({ page }) => {
    await adminLogin(page);
    await page.goto('/admin/ayarlar');
    await page.locator('#settings-notify').fill('latif@gunesbilgisayar.com.tr ,satis@ornek.com');
    await page.getByRole('button', { name: 'Kaydet' }).click();
    await expect(page.getByText('Kaydedildi')).toBeVisible();
    await expect(page.locator('#settings-notify')).toHaveValue('latif@gunesbilgisayar.com.tr, satis@ornek.com');
  });

  test('bildirim adresi siteye açık uçtan dışarı verilmez', async () => {
    const pub = await api<Record<string, unknown>>('/settings');
    expect(Object.keys(pub)).toEqual(['phone']);
  });
});

test('siteden gelen talep panelde görünür', async ({ page }) => {
  const marker = `E2E-${Date.now()}`;
  await api('/messages', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Deneme Kişi',
      company: marker,
      email: 'e2e@ornek.com',
      body: 'Bu bir otomatik test mesajıdır, dikkate almayın.',
    }),
  });

  try {
    await adminLogin(page);
    await page.goto('/admin/mesajlar');
    await expect(page.getByText(marker).first()).toBeVisible();
  } finally {
    const token = await apiToken();
    const messages = await api<{ id: number; company: string }[]>('/admin/messages', {}, token);
    for (const m of messages.filter((x) => x.company === marker)) {
      await api(`/admin/messages/${m.id}`, { method: 'DELETE' }, token);
    }
  }
});

test('yayındaki her kategori panelde de var', async () => {
  const token = await apiToken();
  const adminCategories = await api<{ slug: string }[]>('/admin/categories', {}, token);
  const published = await publishedCatalog();
  for (const category of published) {
    expect(adminCategories.map((c) => c.slug)).toContain(category.slug);
  }
});

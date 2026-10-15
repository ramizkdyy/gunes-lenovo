import { api, apiToken, expect, publishedCatalog, test, type CategoryWithProducts } from './helpers';

/** Ziyaretçinin gördüğü site: sayfalar, gezinme, iletişim numarası ve teklif formu. */

let catalog: CategoryWithProducts[] = [];

test.beforeAll(async () => {
  catalog = await publishedCatalog();
  expect(catalog.length, 'yerel veritabanında yayında kategori olmalı').toBeGreaterThan(0);
});

test('ana sayfa: kategoriler listelenir', async ({ page }) => {
  await page.goto('/');
  for (const category of catalog) {
    await expect(page.locator(`a[href="/kategoriler/${category.slug}"]`).first()).toBeAttached();
  }
});

test('her kategori sayfası ve ürünleri açılır', async ({ page }) => {
  for (const category of catalog) {
    await page.goto(`/kategoriler/${category.slug}`);
    await expect(page.getByRole('heading', { level: 1, name: category.name })).toBeVisible();
    for (const product of category.products) {
      await expect(page.locator(`a[href="/kategoriler/${category.slug}/${product.slug}"]`).first()).toBeAttached();
    }
  }
});

test('her ürün sayfası açılır', async ({ page }) => {
  for (const category of catalog) {
    for (const product of category.products) {
      await page.goto(`/kategoriler/${category.slug}/${product.slug}`);
      await expect(page.getByRole('heading', { level: 1, name: product.model })).toBeVisible();
    }
  }
});

test('bilinmeyen adres ana sayfaya döner', async ({ page }) => {
  await page.goto('/boyle-bir-sayfa-yok');
  await expect(page).toHaveURL(/\/$/);
});

test('telefon numarası ayardan gelir ve tıklanınca aranır', async ({ page }) => {
  const { phone } = await api<{ phone: string }>('/settings');
  test.skip(!phone, 'ayarlarda telefon boş');
  const tel = 'tel:' + phone.replace(/[^\d+]/g, '');

  await page.goto('/');
  await expect(page.locator('footer').locator(`a[href="${tel}"]`)).toHaveText(phone);

  await page.goto('/teklif');
  await expect(page.getByText('Telefonla ulaşmak isterseniz').locator(`a[href="${tel}"]`)).toHaveText(phone);
});

test.describe('teklif formu', () => {
  const marker = `E2E-${Date.now()}`;

  test.afterAll(async () => {
    // Testin bıraktığı mesajı temizle.
    const token = await apiToken();
    const messages = await api<{ id: number; company: string }[]>('/admin/messages', {}, token);
    for (const m of messages.filter((x) => x.company === marker)) {
      await api(`/admin/messages/${m.id}`, { method: 'DELETE' }, token);
    }
  });

  test('telefon ve e-posta boşsa uyarır', async ({ page, consoleErrors }) => {
    await page.goto('/teklif');
    await page.locator('#cf-name').fill('Deneme Kişi');
    await page.locator('#cf-body').fill('Bu bir otomatik test mesajıdır, dikkate almayın.');
    await page.getByRole('button', { name: 'Gönder' }).click();
    await expect(page.getByText('Telefon ya da e-postadan en az birini yazın')).toBeVisible();
    // 400 yanıtı tarayıcı konsoluna "Failed to load resource" düşürür; beklenen durum.
    consoleErrors.splice(0, consoleErrors.length, ...consoleErrors.filter((e) => !/400/.test(e)));
  });

  test('geçerli talep gönderilir', async ({ page }) => {
    await page.goto('/teklif');
    await page.locator('#cf-name').fill('Deneme Kişi');
    await page.locator('#cf-company').fill(marker);
    await page.locator('#cf-email').fill('e2e@ornek.com');
    await page.locator('#cf-body').fill('Bu bir otomatik test mesajıdır, dikkate almayın.');
    await page.getByRole('button', { name: 'Gönder' }).click();
    await expect(page.getByText('Mesajınız bize ulaştı')).toBeVisible();
  });
});

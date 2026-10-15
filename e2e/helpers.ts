import { expect, test as base, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const API = process.env['API_URL'] ?? 'http://localhost:3000';

/** Yönetici bilgileri: ortam değişkeni, yoksa api/.env, yoksa seed varsayılanı. */
function readEnv(): Record<string, string> {
  try {
    const text = readFileSync(join(__dirname, '..', 'api', '.env'), 'utf8');
    return Object.fromEntries(
      text
        .split('\n')
        .map((line) => line.match(/^\s*([A-Z_]+)\s*=\s*"?(.*?)"?\s*$/))
        .filter((m): m is RegExpMatchArray => !!m)
        .map((m) => [m[1], m[2]])
    );
  } catch {
    return {};
  }
}
const fileEnv = readEnv();
export const ADMIN_EMAIL = process.env['ADMIN_EMAIL'] ?? fileEnv['ADMIN_EMAIL'] ?? 'admin@lenovo-sunucu.local';
export const ADMIN_PASSWORD = process.env['ADMIN_PASSWORD'] ?? fileEnv['ADMIN_PASSWORD'] ?? 'admin1234';

/**
 * Her testte tarayıcı konsolundaki hataları ve yakalanmamış istisnaları toplar;
 * test sonunda boş olmalarını bekler.
 */
export const test = base.extend<{ consoleErrors: string[] }>({
  consoleErrors: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text());
      });
      page.on('pageerror', (err) => errors.push(err.message));
      await use(errors);
      expect(errors, 'tarayıcı konsolunda hata olmamalı').toEqual([]);
    },
    { auto: true },
  ],
});
export { expect };

export async function apiToken(): Promise<string> {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (!res.ok) throw new Error(`API girişi başarısız: ${res.status}`);
  return ((await res.json()) as { token: string }).token;
}

export async function api<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(`${init.method ?? 'GET'} ${path} → ${res.status}`);
  return (await res.json()) as T;
}

export async function adminLogin(page: Page): Promise<void> {
  await page.goto('/admin/giris');
  await page.locator('input[name="email"]').fill(ADMIN_EMAIL);
  await page.locator('input[name="password"]').fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Giriş yap' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Özet' })).toBeVisible();
}

export interface CategoryWithProducts {
  slug: string;
  name: string;
  id: number;
  products: { slug: string; model: string }[];
}

/** Sitenin gördüğü kategoriler ve yayındaki ürünleri. */
export async function publishedCatalog(): Promise<CategoryWithProducts[]> {
  const list = await api<{ slug: string }[]>('/categories');
  return Promise.all(list.map((c) => api<CategoryWithProducts>(`/categories/${c.slug}`)));
}

import { defineConfig, devices } from '@playwright/test';

/**
 * Regresyon testleri yerel ortamda koşar: `ng serve` (4200) + API (3000).
 * Canlıda koşturmayın — test formları gerçek talep gibi panele düşer.
 *
 * API'yi e-posta anahtarı olmadan ve form sınırını yükselterek başlatın,
 * yoksa art arda koşularda "dakikada 5 gönderim" sınırına takılır:
 *   cd api && npm run build && MESSAGE_RATE_LIMIT=1000 node dist/main.js
 */
export default defineConfig({
  testDir: '.',
  timeout: 30_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: process.env['WEB_URL'] ?? 'http://localhost:4200',
    locale: 'tr-TR',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 860 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'] }, testMatch: /site\.spec/ },
  ],
});

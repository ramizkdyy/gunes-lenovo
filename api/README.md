# API

Sitenin içeriğini tutan servis ve panelin konuştuğu uçlar.
NestJS + Prisma + Postgres; hepsi bizim kodumuz, dışarıdan bir CMS yok.

## Başlatma

```bash
npm run db           # Postgres'i Docker'da başlatır
npm run api:setup    # bağımlılıklar + şema + ilk kullanıcı ve örnek içerik
npm run api          # API: http://localhost:3000
npm start            # Site: http://localhost:4200, panel: /admin
```

İlk giriş bilgileri `api/.env` içindeki `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
Varsayılan: `admin@lenovo-sunucu.local` / `admin1234` — **canlıya çıkmadan değiştirin.**

## Uçlar

Herkese açık (yalnızca yayındaki kayıtlar):

| Uç | Döndürdüğü |
|---|---|
| `GET /categories` | Kategori listesi, ürün sayılarıyla |
| `GET /categories/:slug` | Kategori + içindeki ürünler |
| `GET /categories/:kategori/:urun` | Tek ürün |
| `GET /hero-slides` | Ana sayfa panelleri |
| `GET /media/:id?w=600&format=webp` | Görsel, istenen boyutta |

Oturum ister (`Authorization: Bearer <jeton>`):

`POST /auth/login` · `GET /auth/me` · `/admin/categories` · `/admin/products` ·
`/admin/hero-slides` · `/admin/media` — hepsinde liste, tekil, oluştur, güncelle,
sil; içeriklerde ayrıca `POST .../reorder` ile sıralama.

Taslak kayıtlar yalnızca `/admin` uçlarından görünür.

## Görseller

Yüklenen dosya `api/uploads/` içinde `<uuid>.<uzantı>` olarak durur.
İstenen boyut ilk çağrıda sharp ile üretilir, `api/uploads/cache/` altına yazılır,
sonraki isteklerde diskten okunur. Yanıtlar 30 gün önbelleğe alınır.

CDN kullanmıyoruz. Frontend'de görsel adresi elle yazılmaz, tek çıkış noktası
[`src/app/api/media.ts`](../src/app/api/media.ts) → `mediaUrl()`. İleride CDN'e ya da
object storage'a geçilirse değişecek tek yer orası.

**Yedek = `api/uploads/` klasörü + Postgres dökümü.**

## Teknik özellikler

Ürünlerde her kayıtta aynı altı başlık görünür: `Gövde tipi`, `İşlemci`,
`GPU desteği`, `Bellek`, `Disk yuvaları`, `Genişletme yuvaları`. Başlıklar
veritabanında tutulmaz, kodda yazılıdır; panelde yalnızca değerleri girilir.

Site yalnızca Türkçe; içerik alanları tek dilli.

Başlık eklemek/çıkarmak için üç yer birlikte güncellenmeli:
`api/prisma/schema.prisma`, `api/src/content/dto.ts` ve
`src/app/api/models.ts` → `SPEC_FIELDS` (panel formu bu listeden üretilir).

## Canlıya alırken

- `.env` içindeki `JWT_SECRET` ve `ADMIN_PASSWORD` mutlaka değişecek
- `CORS_ORIGIN` sitenin gerçek adresi olacak
- `src/environments/environment.prod.ts` → `apiUrl` güncellenecek
- `npm run build` (api) → `node dist/main.js`

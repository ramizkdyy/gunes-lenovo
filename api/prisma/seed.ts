/**
 * İlk yönetici kullanıcısını ve örnek içeriği oluşturur.
 * Tekrar çalıştırılabilir: yalnızca eksik kayıtları ekler, var olanlara
 * dokunmaz — panelden yapılan düzenlemeler kaybolmasın diye.
 *
 *   npm run db:seed
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { categories, heroSlides, products } from './seed-data';

/** Örnek içerik sunucu kategorileri için; hepsi aynı başlıklarla başlar. */
const SERVER_SPECS = [
  ['formFactor', 'Gövde tipi'],
  ['processor', 'İşlemci'],
  ['gpu', 'GPU desteği'],
  ['memory', 'Bellek'],
  ['driveBays', 'Disk yuvaları'],
  ['expansionSlots', 'Genişletme yuvaları'],
] as const;

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const email = (process.env['ADMIN_EMAIL'] ?? 'admin@lenovo-sunucu.local').toLowerCase();
  const password = process.env['ADMIN_PASSWORD'] ?? 'admin1234';

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: process.env['ADMIN_NAME'] ?? 'Yönetici',
      passwordHash: await bcrypt.hash(password, 10),
    },
  });
  console.log(`Yönetici hazır: ${user.email}`);

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: { ...category, specTemplate: SERVER_SPECS.map(([, label]) => label) },
    });
  }
  console.log(`${categories.length} kategori`);

  for (const { categorySlug, ...row } of products) {
    const product = Object.fromEntries(
      Object.entries(row).filter(([key]) => !SERVER_SPECS.some(([field]) => field === key))
    ) as Omit<typeof row, (typeof SERVER_SPECS)[number][0]>;
    const specs = SERVER_SPECS.map(([field, label]) => ({ label, value: row[field] }));

    const category = await prisma.category.findUnique({ where: { slug: categorySlug } });
    if (!category) throw new Error(`Kategori yok: ${categorySlug}`);

    await prisma.product.upsert({
      where: { categoryId_slug: { categoryId: category.id, slug: product.slug } },
      update: {},
      create: { ...product, specs, categoryId: category.id },
    });
  }
  console.log(`${products.length} ürün`);

  // Form konuları — panelden değiştirilebilir, burada yalnızca ilk liste.
  const topics = [
    { label: 'Fiyat teklifi istiyorum' },
    { label: 'Hangi model bana uygun, yardım istiyorum' },
    { label: 'Mevcut sunucumu büyütmek/yenilemek istiyorum' },
    { label: 'Kurulum ve yerinde destek hizmeti' },
    { label: 'Garanti, arıza ve servis talebi' },
    { label: 'Diğer' },
  ];
  for (const [index, topic] of topics.entries()) {
    const existing = await prisma.messageTopic.findFirst({ where: { label: topic.label } });
    if (!existing) await prisma.messageTopic.create({ data: { ...topic, sort: index } });
  }
  console.log(`${topics.length} mesaj konusu`);

  // Hero panellerinde eşleştirecek slug yok. Panelden düzenlenmiş
  // içeriğin üzerine yazmamak için yalnızca hiç panel yoksa oluşturulur.
  const slideCount = await prisma.heroSlide.count();
  if (slideCount === 0) {
    await prisma.heroSlide.createMany({ data: heroSlides });
    console.log(`${heroSlides.length} hero paneli`);
  } else {
    console.log(`${slideCount} hero paneli zaten var, dokunulmadı`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());

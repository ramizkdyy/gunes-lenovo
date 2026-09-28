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
      create: category,
    });
  }
  console.log(`${categories.length} kategori`);

  for (const { categorySlug, ...product } of products) {
    const category = await prisma.category.findUnique({ where: { slug: categorySlug } });
    if (!category) throw new Error(`Kategori yok: ${categorySlug}`);

    await prisma.product.upsert({
      where: { categoryId_slug: { categoryId: category.id, slug: product.slug } },
      update: {},
      create: { ...product, categoryId: category.id },
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

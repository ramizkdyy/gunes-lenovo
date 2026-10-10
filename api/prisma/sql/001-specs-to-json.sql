-- Teknik özellikler sabit kolonlardan (formFactor, processor…) sıralı
-- [{label, value}] listesine taşınır; kategoriler aynı başlıkları şablon
-- olarak alır. Her açılışta çalışır ama eski kolonlar yoksa hiçbir şey
-- yapmaz. Boş veritabanında tabloları zaten prisma db push kurar.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Product' AND column_name = 'formFactor'
  ) THEN
    RETURN;
  END IF;

  ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "specs" JSONB NOT NULL DEFAULT '[]';
  ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "specTemplate" JSONB NOT NULL DEFAULT '[]';

  UPDATE "Product" SET "specs" = jsonb_build_array(
    jsonb_build_object('label', 'Gövde tipi', 'value', "formFactor"),
    jsonb_build_object('label', 'İşlemci', 'value', "processor"),
    jsonb_build_object('label', 'GPU desteği', 'value', "gpu"),
    jsonb_build_object('label', 'Bellek', 'value', "memory"),
    jsonb_build_object('label', 'Disk yuvaları', 'value', "driveBays"),
    jsonb_build_object('label', 'Genişletme yuvaları', 'value', "expansionSlots")
  );

  UPDATE "Category" SET "specTemplate" =
    '["Gövde tipi", "İşlemci", "GPU desteği", "Bellek", "Disk yuvaları", "Genişletme yuvaları"]'::jsonb;

  ALTER TABLE "Product"
    DROP COLUMN "formFactor",
    DROP COLUMN "processor",
    DROP COLUMN "gpu",
    DROP COLUMN "memory",
    DROP COLUMN "driveBays",
    DROP COLUMN "expansionSlots";
END $$;

/**
 * Oynamalık örnek içerik. Görseller Lenovo'nun kendi ürün sayfalarından;
 * metinler bizim. Gerçek içerik girilince bu dosya silinebilir.
 */

const IMG = {
  rack: 'https://p3-ofp.static.pub//fes/cms/2025/05/09/9x267a7hfmjb9qfeh33moeum72665i404979.png?width=800',
  sr650v4: 'https://p3-ofp.static.pub//fes/cms/2025/05/20/kq2ongd7y9ez3ag0d4a43edcvmx2t2494798.png?width=800',
  sr630v4: 'https://p1-ofp.static.pub//fes/cms/2024/11/19/7ola2xurb13cgdwlk0uaex4ojkb92i272866.png?width=800',
  sr665v3: 'https://p2-ofp.static.pub//fes/cms/2024/11/22/26ytuujk76w94wbjg8s1k973rcr5h7837447.png?width=800',
  sr645v3: 'https://p3-ofp.static.pub/ShareResource/na/products/thinksystem/400x300/lenovo-thinksystem-sr645-v3.png?width=800',
  sr655v3: 'https://p2-ofp.static.pub/ShareResource/na/products/thinksystem/400x300/lenovo-amd-server-3.png?width=800',
  sr250v3: 'https://p1-ofp.static.pub/medias/bWFzdGVyfHJvb3R8MTMyMzd8aW1hZ2UvcG5nfGhmMC9oZWEvMTc1NzcwMzI2MTM5MTgucG5nfDQ2ZDZhMDViYzZiNGExYjg3NjE1OTNmNmZkYTNhMzgwMTViYjUzMjkwMGQxZWE4ZGIzOTgxNzU5ODBmYWZlYjU/lenovo-thinksystem-sr250-v3-series.png?width=800',
  sr670v2: 'https://p1-ofp.static.pub//fes/cms/2024/11/20/sjlqy4oa4jrczxw109ffpxnraey37c618525.png?width=800',
  sr675v3: 'https://p4-ofp.static.pub/ShareResource/na/products/thinksystem/400x300/lenovo-thinksystem-sr675-v3-controlled-gpu.png?width=800',
  sr680a: 'https://p1-ofp.static.pub//fes/cms/2025/09/02/7x0q1hzoqhkjzy6bfczfl2ia8pfded129802.png?width=800',
  sr780a: 'https://p2-ofp.static.pub//fes/cms/2024/08/16/bez89txgb6xsf43ytxcskhivpgoaxm472081.png?width=800',
  st650v3: 'https://p3-ofp.static.pub/fes/cms/2023/05/01/tbb2iv1mlp7t51kozte1cwbxe4j7cp265720.png?width=800',
  st250v3: 'https://p1-ofp.static.pub//fes/cms/2024/11/25/5y2sxu8ubl9k4ml53pwpkaqpe8mlub659993.png?width=800',
  st50v3: 'https://p1-ofp.static.pub//fes/cms/2024/05/02/th18kk74a42l8nfmm5up3om2jlv0xt676056.png?width=800',
  se455v3: 'https://p1-ofp.static.pub//fes/cms/2023/11/13/m3qy73zecfivv9zj5yl2wkkj5q186w286449.png?width=800',
  se100: 'https://p3-ofp.static.pub//fes/cms/2025/02/18/da9l6y839mby4ib31bc8u8sfdj7a9i375443.png?width=800',
  se350v2: 'https://p1-ofp.static.pub/medias/bWFzdGVyfHJvb3R8MTc5OTl8aW1hZ2UvcG5nfGhhZS9oZGEvMTczMTgxODAwOTM5ODIucG5nfGExNjdjMzMxZDMwMTA4NzIyYzJhOWFiNTJmNmVlNWZmZjRmZjNkOWNlOWMwODFlOGZhMTcwZDVlMThlN2JjYjQ/lenovo-thinkedge-se350-v2-series.png?width=800',
  dm: 'https://p3-ofp.static.pub/ShareResource/ww/img/storage/storage-lp-dm-series.jpg',
  dg: 'https://p4-ofp.static.pub/ShareResource/ww/img/storage/storage-lp-dg-series.jpg',
  de: 'https://p4-ofp.static.pub/ShareResource/ww/img/storage/storage-lp-de-series.jpg',
  // Hero: yüksek çözünürlüklü resmi ürün görselleri (Lenovo doküman sitesi
  // ve Lenovo Press). Satış sitesindeki görseller 600px'i geçmiyor.
  heroSr650v4: 'https://pubs.lenovo.com/sr650-v4/sr650_v4.png',
  heroSr680a: 'https://pubs.lenovo.com/sr680a-v4/SR680a_V4_image.jpg',
  heroSr675: 'https://lenovopress.lenovo.com/assets/images/LP1611/SR675%20V3%20Talladega%20Front%20View%208DW%20Left.png',
};

export const categories = [
  { slug: 'rack-sunucular', imageUrl: IMG.rack, status: 'PUBLISHED', sort: 0, families: 'ThinkSystem SR',
    name: 'Rack Sunucular',
    desc: 'Standart 19" kabine monte edilen 1U–8U sunucular. Kurumsal iş yüklerinin büyük çoğunluğu burada.' },

  { slug: 'kule-sunucular', imageUrl: IMG.st650v3, status: 'PUBLISHED', sort: 1, families: 'ThinkSystem ST',
    name: 'Kule Sunucular',
    desc: 'Kabin gerektirmeyen, ofis ortamında çalışabilen dikey gövde. Küçük işletme ve şube için.' },

  { slug: 'gpu-ai-sunuculari', imageUrl: IMG.sr675v3, status: 'PUBLISHED', sort: 2, families: 'ThinkSystem SR / SD',
    name: 'GPU & Yapay Zekâ Sunucuları',
    desc: 'Model eğitimi ve çıkarım için 4–8 GPU taşıyan gövdeler; sıvı soğutmalı seçenekler dahil.' },

  { slug: 'edge-sunucular', imageUrl: IMG.se455v3, status: 'PUBLISHED', sort: 3, families: 'ThinkEdge SE',
    name: 'Edge & Şube Sunucuları',
    desc: 'Veri merkezi dışında, mağaza ve üretim sahasında çalışacak kompakt ve dayanıklı gövdeler.' },

  { slug: 'depolama', imageUrl: IMG.dm, status: 'PUBLISHED', sort: 4, families: 'ThinkSystem DM / DG / DE',
    name: 'Depolama Sistemleri',
    desc: 'Blok ve dosya tabanlı diziler, tam flash ve hibrit seçenekler.' },

  { slug: 'yuksek-yogunluk', imageUrl: IMG.sr670v2, status: 'PUBLISHED', sort: 5, families: 'ThinkSystem SD / SR',
    name: 'Yüksek Yoğunluklu Sunucular',
    desc: 'Tek kabinde en çok işlemciyi barındıran çok düğümlü gövdeler. HPC ve sanallaştırma için.' },
];

/**
 * Kısaltma: bir ürünü tek çağrıda tanımlar.
 * Dizi sırası: [başlık, açıklama, ...altı özellik].
 */
const p = (categorySlug, slug, model, imageUrl, sort, tr) => ({
  categorySlug, slug, model, imageUrl, sort, status: 'PUBLISHED', datasheetUrl: '',
  title: tr[0], desc: tr[1],
  formFactor: tr[2], processor: tr[3], gpu: tr[4],
  memory: tr[5], driveBays: tr[6], expansionSlots: tr[7],
});

export const products = [
  // ─── Rack ──────────────────────────────────────────────────────
  p('rack-sunucular', 'sr650-v4', 'ThinkSystem SR650 V4', IMG.sr650v4, 0,
    ['Çift soketli 2U ana iş gücü',
     'Sanallaştırma, veritabanı ve karma iş yükleri için en çok tercih edilen 2U gövde.',
     '2U raf', '2x Intel Xeon 6 işlemciye kadar', '8x tek genişlik veya 3x çift genişlik GPU',
     '32x TruDDR5 yuva, 8 TB’a kadar', '20x 3,5" veya 40x 2,5" sürücüye kadar',
     '12x PCIe 5.0 yuvaya kadar; 1x OCP 3.0']),

  p('rack-sunucular', 'sr630-v4', 'ThinkSystem SR630 V4', IMG.sr630v4, 1,
    ['Yoğun ortamlar için 1U',
     'Kabin alanının kısıtlı olduğu yerlerde çift soketli performans.',
     '1U raf', '2x Intel Xeon 6 işlemciye kadar', '3x tek genişlik GPU’ya kadar',
     '32x TruDDR5 yuva, 4 TB’a kadar', '12x 2,5" veya 16x EDSFF sürücüye kadar',
     '3x PCIe 5.0 yuva; 1x OCP 3.0']),

  p('rack-sunucular', 'sr665-v3', 'ThinkSystem SR665 V3', IMG.sr665v3, 2,
    ['AMD EPYC ile 2U',
     'Çekirdek başına yoğunluk arayan sanallaştırma ve analitik iş yükleri için.',
     '2U raf', '2x 4. veya 5. nesil AMD EPYC işlemciye kadar', '8x tek genişlik LP veya 3x çift genişlik GPU',
     '24x TruDDR5 yuva, 3DS RDIMM ile 6 TB’a kadar', '20x 3,5" veya 40x 2,5" sürücüye kadar',
     '12x PCIe yuvaya kadar (9x PCIe 5.0); 1x OCP 3.0']),

  p('rack-sunucular', 'sr645-v3', 'ThinkSystem SR645 V3', IMG.sr645v3, 3,
    ['AMD EPYC ile 1U',
     'Tek üniteye sığan çift soketli AMD performansı; grafik yoğun iş yükleri için GPU desteği.',
     '1U raf', '2x 4. veya 5. nesil AMD EPYC işlemciye kadar', '4x tek genişlik GPU’ya kadar',
     '24x TruDDR5 RDIMM yuva', '4x 3,5", 12x 2,5" veya 16x EDSFF sürücü',
     '3x PCIe 4.0 + 2x PCIe 5.0 yuva; 1x OCP 3.0']),

  p('rack-sunucular', 'sr655-v3', 'ThinkSystem SR655 V3', IMG.sr655v3, 4,
    ['Tek soketli 2U',
     'İki soketin maliyetine girmeden yüksek çekirdek sayısı isteyen iş yükleri için.',
     '2U raf', '1x 4. nesil AMD EPYC, 96 çekirdeğe kadar', '3x çift genişlik GPU’ya kadar',
     '12x TruDDR5 yuva, 3 TB’a kadar', '20x 3,5" veya 40x 2,5" sürücüye kadar',
     '8x PCIe 5.0 yuvaya kadar']),

  p('rack-sunucular', 'sr250-v3', 'ThinkSystem SR250 V3', IMG.sr250v3, 5,
    ['Giriş seviyesi tek soket 1U',
     'Küçük ofis ve şube için uygun maliyetli, tek işlemcili raf sunucusu.',
     '1U raf', '1x Intel Xeon E-2400/6300 serisi', 'Opsiyonel NVIDIA Quadro T1000 veya T400',
     '4x UDIMM yuva, 128 GB TruDDR5 4400MHz ECC’ye kadar', '4x 3,5" veya 10x 2,5" HDD/SSD; M.2 NVMe',
     '1x PCIe Gen5 x16 veya 2x PCIe Gen4 x8']),

  // ─── Kule ──────────────────────────────────────────────────────
  p('kule-sunucular', 'st650-v3', 'ThinkSystem ST650 V3', IMG.st650v3, 0,
    ['Ofiste çalışabilen kule',
     'Sessiz çalışma ve geniş disk kapasitesi; kabin gerektirmez, istenirse rafa da monte edilir.',
     '4U kule (rafa monte edilebilir)', '2x Intel Xeon Silver/Gold işlemciye kadar', '2x çift genişlik GPU’ya kadar',
     '32x TruDDR5 yuva, 2 TB’a kadar', '16x 3,5" veya 32x 2,5" sürücüye kadar',
     '9x PCIe yuvaya kadar']),

  p('kule-sunucular', 'st250-v3', 'ThinkSystem ST250 V3', IMG.st250v3, 1,
    ['Küçük işletme kulesi',
     'İlk sunucusunu alan işletmeler için; masa altında sessizce çalışır.',
     '4U kule', '1x Intel Xeon E-2400 serisi', 'Opsiyonel giriş seviyesi GPU',
     '4x UDIMM yuva, 128 GB’a kadar', '8x 3,5" veya 16x 2,5" sürücüye kadar',
     '4x PCIe yuva']),

  p('kule-sunucular', 'st50-v3', 'ThinkSystem ST50 V3', IMG.st50v3, 2,
    ['En kompakt kule',
     'Dosya paylaşımı ve yedekleme gibi tek işli senaryolar için giriş seviyesi gövde.',
     '4U kompakt kule', '1x Intel Xeon E-2400 serisi', '—',
     '4x UDIMM yuva, 128 GB’a kadar', '4x 3,5" sürücü',
     '2x PCIe yuva']),

  // ─── GPU / yapay zekâ ──────────────────────────────────────────
  p('gpu-ai-sunuculari', 'sr675-v3', 'ThinkSystem SR675 V3', IMG.sr675v3, 0,
    ['8 GPU’ya kadar 3U',
     'Model eğitimi ve çıkarım için yüksek GPU yoğunluğu; hava ve sıvı soğutma seçenekleri.',
     '3U raf', '2x AMD EPYC 9004/9005 serisi', '8x NVIDIA H100/H200 veya 4x çift genişlik GPU',
     '24x TruDDR5 yuva, 3 TB’a kadar', '8x 2,5" NVMe/SATA sürücüye kadar',
     '10x PCIe 5.0 yuvaya kadar']),

  p('gpu-ai-sunuculari', 'sr680a-v4', 'ThinkSystem SR680a V4', IMG.sr680a, 1,
    ['Sekiz SXM GPU ile 8U',
     'Büyük dil modeli eğitimi için NVSwitch bağlantılı HGX platformu.',
     '8U raf', '2x Intel Xeon 6 (Granite Rapids SP), 350W’a kadar', '8x NVIDIA HGX B300 SXM (CX8 NVSwitch)',
     '32x TruDDR5 RDIMM, 6400MHz, 4 TB’a kadar', '8x 2,5" hot-swap NVMe + 2x M.2 NVMe boot',
     '4x PCIe Gen5 x16 FHHL, 1x OCP, 8x OSFP']),

  p('gpu-ai-sunuculari', 'sr780a-v3', 'ThinkSystem SR780a V3', IMG.sr780a, 2,
    ['Sıvı soğutmalı 5U',
     'Neptune sıvı soğutma ile yüksek güçlü GPU’ları sessiz ve verimli çalıştırır.',
     '5U raf (Neptune sıvı soğutma)', '2x Intel Xeon 4./5. nesil', '4x NVIDIA HGX H100 SXM',
     '32x TruDDR5 yuva, 4 TB’a kadar', '8x 2,5" NVMe sürücü',
     '6x PCIe 5.0 yuva']),

  // ─── Edge ──────────────────────────────────────────────────────
  p('edge-sunucular', 'se455-v3', 'ThinkEdge SE455 V3', IMG.se455v3, 0,
    ['Saha için 2U kısa gövde',
     'Sunucu odası olmayan yerler için kısa derinlikli, tozdan ve sıcaktan etkilenmeyen tasarım.',
     '2U kısa derinlik (raf/duvar)', '1x AMD EPYC 8004 serisi', '2x çift genişlik GPU’ya kadar',
     '6x TruDDR5 yuva, 576 GB’a kadar', '4x 3,5" veya 8x 2,5" sürücü',
     '4x PCIe 5.0 yuva']),

  p('edge-sunucular', 'se350-v2', 'ThinkEdge SE350 V2', IMG.se350v2, 1,
    ['Duvara asılabilen kompakt gövde',
     'Mağaza, şube ve üretim sahası için; kilitli kapak ve fiziksel güvenlik özellikleriyle.',
     '1U yarım genişlik / duvara monte', '1x Intel Xeon D-2700 serisi', '1x NVIDIA A2 veya L4',
     '4x DDR4 yuva, 256 GB’a kadar', '4x M.2 NVMe veya 2x 2,5" SSD',
     '2x PCIe 4.0 x16 yuva']),

  p('edge-sunucular', 'se100', 'ThinkEdge SE100', IMG.se100, 2,
    ['Avuç içi boyutunda uç nokta',
     'Perakende kasası, kiosk ve şube dolabı gibi yer olmayan noktalar için en küçük gövde.',
     'Ultra kompakt masaüstü / DIN ray', '1x Intel Core Ultra', 'Tümleşik NPU, opsiyonel NVIDIA L4',
     '2x SODIMM yuva, 96 GB’a kadar', '2x M.2 NVMe',
     '1x PCIe yuva']),

  // ─── Depolama ──────────────────────────────────────────────────
  p('depolama', 'dm-serisi', 'ThinkSystem DM Serisi', IMG.dm, 0,
    ['Birleşik (unified) depolama',
     'Blok, dosya ve nesne erişimini tek dizide toplar; buluta kademeleme desteğiyle.',
     '2U–4U raf dizisi', 'Çift denetleyici (aktif-aktif)', '—',
     '256 GB’a kadar denetleyici önbelleği', '24x 2,5" NVMe/SAS veya 12x 3,5" sürücü',
     '32Gb FC, 25/100GbE bağlantı seçenekleri']),

  p('depolama', 'dg-serisi', 'ThinkSystem DG Serisi', IMG.dg, 1,
    ['Tam flash QLC dizi',
     'Yüksek kapasiteyi flash hızıyla birleştirir; yedekleme ve arşivden üretim yüklerine kadar.',
     '2U raf dizisi', 'Çift denetleyici', '—',
     '—', '24x QLC NVMe SSD’ye kadar',
     '25/100GbE, 32Gb FC']),

  p('depolama', 'de-serisi', 'ThinkSystem DE Serisi', IMG.de, 2,
    ['Blok tabanlı ekonomik dizi',
     'Sanallaştırma ve yedekleme için öngörülebilir performanslı, uygun maliyetli SAN.',
     '2U–4U raf dizisi', 'Çift denetleyici', '—',
     '—', '60x 3,5" sürücüye kadar (genişletme ile)',
     '16/32Gb FC, 10/25GbE iSCSI']),

  // ─── Yüksek yoğunluk ───────────────────────────────────────────
  p('yuksek-yogunluk', 'sr670-v2', 'ThinkSystem SR670 V2', IMG.sr670v2, 0,
    ['GPU yoğun 3U',
     'Sekiz adede kadar çift genişlik GPU’yu tek gövdede toplar; HPC ve görselleştirme için.',
     '3U raf', '2x Intel Xeon 3. nesil', '8x çift genişlik veya 4x SXM GPU',
     '32x DDR4 yuva, 4 TB’a kadar', '8x 2,5" NVMe sürücü',
     '10x PCIe 4.0 yuva']),

  p('yuksek-yogunluk', 'sd650-v3', 'ThinkSystem SD650 V3', IMG.sr670v2, 1,
    ['Sıvı soğutmalı çok düğümlü',
     'Neptune doğrudan su soğutma ile bir kabine en çok işlemciyi sığdıran HPC düğümü.',
     '1U tepside 2 düğüm (6U muhafaza)', 'Düğüm başına 2x Intel Xeon 4./5. nesil', 'Opsiyonel',
     'Düğüm başına 16x TruDDR5 yuva', 'Düğüm başına 1x M.2 NVMe',
     'Düğüm başına 1x PCIe 5.0 x16']),
];

export const heroSlides = [
  { status: 'PUBLISHED', sort: 0, theme: 'dark-product', imageUrl: IMG.heroSr650v4, trim: true,
    eyebrow: 'Lenovo ThinkSystem',
    title: 'Lenovo ThinkSystem Sunucular',
    body: 'Stoktan teslim, yerinde kurulum, resmi garanti.',
    ctaLabel: 'Ürünleri inceleyin', ctaHref: '/#urunler' },

  { status: 'PUBLISHED', sort: 1, theme: 'light', imageUrl: IMG.heroSr680a, trim: true,
    eyebrow: 'Ürün Ailesi',
    title: "1U'dan 8U'ya kadar her iş yükü",
    body: 'Rack, kule, uç nokta ve GPU sunucuları. Hangisinin size uyduğunu birlikte belirleriz.',
    ctaLabel: 'Kategorilere göz atın', ctaHref: '/#urunler' },

  { status: 'PUBLISHED', sort: 2, theme: 'dark-product', imageUrl: IMG.heroSr675, trim: true,
    eyebrow: '',
    title: 'Lenovo 360 Platinum iş ortağı',
    body: 'Faturalı, resmi garantili donanım. Kurulumu ve satış sonrası desteği kendi ekibimiz yürütür.',
    ctaLabel: 'Teklif alın', ctaHref: '/teklif' },
];

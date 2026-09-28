import puppeteer from "puppeteer-core";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const b = await puppeteer.launch({ executablePath: CHROME, headless: "new", args:["--no-sandbox"] });
const p = await b.newPage();
const errors = [];
p.on("console", m => m.type() === "error" && errors.push(m.text()));
p.on("pageerror", e => errors.push(String(e)));

async function visit(url, label) {
  await p.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
  await new Promise(r => setTimeout(r, 800));
  const out = await p.evaluate(() => ({
    h: [...document.querySelectorAll("h1,h2,h3")].map(e => e.textContent.trim()).slice(0, 6),
    imgs: [...document.querySelectorAll("img")].map(i => ({
      src: i.currentSrc || i.src, ok: i.naturalWidth > 0
    })),
  }));
  console.log(`\n--- ${label} (${url})`);
  console.log("  başlıklar:", JSON.stringify(out.h));
  for (const i of out.imgs) console.log(`  img ${i.ok ? "OK " : "KIRIK"} ${i.src.replace("http://localhost:8055","CMS")}`);
}

await visit("http://localhost:4200/", "ana sayfa");
await visit("http://localhost:4200/kategoriler", "kategoriler");
await visit("http://localhost:4200/kategoriler/rack-sunucular", "kategori detay");
await visit("http://localhost:4200/kategoriler/rack-sunucular/sr650-v4", "ürün detay");
console.log("\nkonsol hataları:", errors.length ? errors : "yok");
await b.close();

import puppeteer from "puppeteer-core";
const b = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: "new", args: ["--no-sandbox"] });
const p = await b.newPage();
await p.setViewport({ width: 1440, height: 900 });
const wait = ms => new Promise(r => setTimeout(r, ms));
const order = () => p.$$eval("li a[href^='/admin/kategoriler/']", els => els.map(e => e.textContent.trim()));

await p.goto("http://localhost:4200/admin/giris", { waitUntil: "networkidle0" });
await p.type('input[name="email"]', "admin@lenovo-sunucu.local");
await p.type('input[name="password"]', "admin1234");
await p.click('button[type="submit"]');
await wait(1500);

await p.goto("http://localhost:4200/admin/kategoriler", { waitUntil: "networkidle0" });
await wait(900);
console.log("ok butonu kaldı mı:", (await p.$$('button[aria-label="Yukarı taşı"]')).length ? "EVET (kalmamalıydı)" : "hayır");
console.log("tutamaç sayısı:", (await p.$$("ui-drag-handle")).length);
console.log("başlangıç:", (await order()).join(" → "));

// Klavyeyle taşı: ilk satırın tutamacına odaklan, aşağı ok
await p.$eval("ui-drag-handle span", el => el.focus());
await p.keyboard.press("ArrowDown");
await wait(1200);
console.log("klavye ↓ sonrası:", (await order()).join(" → "));

// Sunucuya yazıldı mı — sayfayı baştan yükle
await p.reload({ waitUntil: "networkidle0" });
await wait(900);
const afterReload = await order();
console.log("yenileme sonrası:", afterReload.join(" → "));

// Sitede de aynı sıra mı
const site = await b.newPage();
await site.goto("http://localhost:4200/kategoriler", { waitUntil: "networkidle0" });
await wait(900);
const siteOrder = await site.$$eval("app-category-grid h3", els => els.map(e => e.textContent.trim()));
console.log("sitedeki sıra:   ", siteOrder.join(" → "));
console.log("\npanel ve site aynı mı:", JSON.stringify(afterReload) === JSON.stringify(siteOrder) ? "EVET" : "HAYIR");

// Eski haline döndür
await p.$eval("ui-drag-handle span", el => el.focus());
await p.keyboard.press("ArrowDown");
await wait(1200);
console.log("geri alındı:", (await order()).join(" → "));
await b.close();

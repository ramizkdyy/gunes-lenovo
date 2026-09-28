import puppeteer from "puppeteer-core";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const b = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-sandbox"] });
const p = await b.newPage();
await p.setViewport({ width: 1440, height: 900 });
const errors = [];
p.on("pageerror", e => errors.push(String(e)));
p.on("console", m => m.type() === "error" && errors.push(m.text()));
const wait = (ms) => new Promise(r => setTimeout(r, ms));

// 1. Korumalı sayfa giriş ekranına atıyor mu
await p.goto("http://localhost:4200/admin/urunler", { waitUntil: "networkidle0" });
await wait(500);
console.log("1. oturumsuz /admin/urunler →", p.url().replace("http://localhost:4200", ""));

// 2. Yanlış şifre
await p.type('input[name="email"]', "admin@lenovo-sunucu.local");
await p.type('input[name="password"]', "yanlissifre");
await p.click('button[type="submit"]');
await wait(1200);
console.log("2. yanlış şifre mesajı:", await p.$eval("form p", el => el.textContent.trim()).catch(() => "YOK"));

// 3. Doğru giriş
await p.$eval('input[name="password"]', el => { el.value = ""; });
await p.type('input[name="password"]', "admin1234");
await p.click('button[type="submit"]');
await wait(1800);
console.log("3. giriş sonrası →", p.url().replace("http://localhost:4200", ""));
console.log("   özet kartları:", await p.$$eval("a[href^='/admin/'] p:nth-child(2)", els => els.map(e => e.textContent.trim()).join(" / ")).catch(() => "-"));
console.log("   uyarılar:", await p.$$eval("section li span:last-child", els => els.map(e => e.textContent.trim())).catch(() => []));

// 4. Ürün listesi ve form
await p.goto("http://localhost:4200/admin/urunler", { waitUntil: "networkidle0" });
await wait(900);
console.log("4. ürün satırı:", (await p.$$("li")).length);
const firstLink = await p.$eval("li a[href^='/admin/urunler/']", el => el.getAttribute("href"));
await p.goto(`http://localhost:4200${firstLink}`, { waitUntil: "networkidle0" });
await wait(900);
const specRows = await p.$$eval("section:nth-of-type(2) .grid > span", els => els.map(e => e.textContent.trim()));
console.log("5. formdaki sabit özellik başlıkları:", JSON.stringify(specRows));
console.log("   model alanı dolu mu:", await p.$eval('input[name="model"]', el => el.value));

console.log("\nkonsol hataları:", errors.length ? errors.slice(0, 3) : "yok");
await b.close();

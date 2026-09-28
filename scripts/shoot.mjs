import puppeteer from "puppeteer-core";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const b = await puppeteer.launch({ executablePath: CHROME, headless: "new", args:["--no-sandbox","--hide-scrollbars"] });
const p = await b.newPage();
await p.setViewport({ width: 1440, height: 800 });
await p.goto("http://localhost:4200/", { waitUntil: "networkidle0", timeout: 60000 });
await new Promise(r=>setTimeout(r,2000));
await p.screenshot({ path: "/tmp/ng-1.png" });
// ikinci slayta geç
await p.evaluate(() => document.querySelectorAll('[aria-label^="Görsel"]')[1]?.click());
await new Promise(r=>setTimeout(r,1400));
await p.screenshot({ path: "/tmp/ng-2.png" });
await b.close(); console.log("ok");

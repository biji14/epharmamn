import puppeteer from 'puppeteer';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const url   = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] ? `-${process.argv[3]}` : '';
const dir   = join(__dirname, 'temporary screenshots');
if (!existsSync(dir)) await mkdir(dir, { recursive: true });

let n = 1;
while (existsSync(join(dir, `screenshot-${n}${label}.png`))) n++;
const out = join(dir, `screenshot-${n}${label}.png`);

const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
const page    = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(url, { waitUntil: 'networkidle2' });

// Force all scroll-reveal elements visible
await page.evaluate(() => {
  ['reveal','reveal-left','reveal-right','reveal-scale'].forEach(cls =>
    document.querySelectorAll('.' + cls).forEach(el => el.classList.add('in-view','visible'))
  );
});
await new Promise(r => setTimeout(r, 400));
await page.screenshot({ path: out, fullPage: true });
await browser.close();
console.log('Saved:', out);

// Genera entregables/02-pitch-deck.pdf desde entregables/fuente/deck/index.html (1920×1080 por slide).
// Uso: node entregables/fuente/deck/build-deck.mjs [--png <carpeta>]
//   --png <carpeta>  además guarda una vista PNG de cada slide (para revisar) en esa carpeta.
/* global document */
import { chromium } from '@playwright/test';
import { mkdirSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const html = resolve(here, 'index.html');
const out = resolve(here, '../../02-pitch-deck.pdf');
const pngIdx = process.argv.indexOf('--png');
const pngDir = pngIdx > -1 ? resolve(process.argv[pngIdx + 1]) : null;

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.emulateMedia({ media: 'print' });
  await page.goto(pathToFileURL(html).href, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const missing = await page.evaluate(() => [...document.images].filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.src));
  if (missing.length) throw new Error(`Imágenes sin cargar: ${missing.join(', ')}`);

  await page.pdf({ path: out, width: '1920px', height: '1080px', printBackground: true, preferCSSPageSize: true });
  const slides = await page.locator('section.slide').count();
  console.log(`PDF: ${out} · ${slides} slides · ${(statSync(out).size / 1024 / 1024).toFixed(2)} MB`);

  if (pngDir) {
    mkdirSync(pngDir, { recursive: true });
    for (let i = 0; i < slides; i++) {
      await page.locator('section.slide').nth(i).screenshot({ path: resolve(pngDir, `slide-${String(i + 1).padStart(2, '0')}.png`) });
    }
    console.log(`PNG: ${pngDir}`);
  }
} finally {
  await browser.close();
}

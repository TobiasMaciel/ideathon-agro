// Convierte un .md de entregables/fuente a un PDF formal A4 con la identidad de Circular NEA.
//
// Uso:
//   node entregables/fuente/build-pdf.mjs <entrada.md> <salida.pdf> [--html <salida.html>]
//   node entregables/fuente/build-pdf.mjs entregables/fuente/01-propuesta.md entregables/01-propuesta.pdf
//
// Qué hace:
//   - Portada en la primera página, tomada del bloque de título del .md: el primer "# Título" y los párrafos que
//     le siguen hasta el primer "---" o "##" (línea en negrita = subtítulo, "[Equipo]" o "Equipo…" = equipo,
//     "16 de octubre de 2026" = fecha). Si el título empieza con "Circular NEA — ", ese prefijo va a la marca.
//   - Encabezado en las demás páginas: ícono + "Circular NEA" a la izquierda, título del documento a la derecha.
//   - Pie: "Ideathon NEA Tech 2026" a la izquierda y "página / total" a la derecha.
//   - Geist y Geist Mono embebidas (entregables/fuente/deck/fonts, SIL OFL 1.1). A4, márgenes de 20 mm.
//   - Markdown: encabezados, párrafos, listas (anidadas, numeradas), tablas con alineación, citas, separadores,
//     bloques de código, negrita, cursiva, links, código inline e imágenes locales. Sin dependencias nuevas:
//     solo usa Playwright, que ya está en el repo.
/* global document */
import { chromium } from '@playwright/test';
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const ICON = resolve(here, '../../apps/web/public/favicon.svg');
const FONTS = resolve(here, 'deck/fonts');

// ---------------------------------------------------------------- Markdown → HTML

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function dataUri(file) {
  const mime = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.gif': 'image/gif', '.webp': 'image/webp' }[extname(file).toLowerCase()];
  return mime && existsSync(file) ? `data:${mime};base64,${readFileSync(file).toString('base64')}` : null;
}

function inline(text, baseDir) {
  const codes = [];
  let t = text.replace(/`([^`]+)`/g, (_, c) => `\uE000${codes.push(c) - 1}\uE001`);
  t = t.replace(/(^|[\s([])"([^"\n]+?)"(?=[\s.,;:!?)\]]|$)/g, '$1\u201c$2\u201d');
  t = esc(t);
  t = t.replace(/&lt;br\s*\/?&gt;/gi, '<br>');
  t = t.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;[^&]*&quot;)?\)/g, (_, alt, src) => {
    const local = /^[a-z]+:/i.test(src) ? null : dataUri(resolve(baseDir, src.replace(/&amp;/g, '&')));
    return `<img src="${local ?? src}" alt="${alt}">`;
  });
  t = t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => `<a href="${href}">${label}</a>`);
  t = t.replace(/(^|[^\w<])(https?:\/\/[^\s<)]+[^\s<).,;:])/g, (m, pre, url) => (pre.endsWith('"') || pre.endsWith('>') ? m : `${pre}<a href="${url}">${url}</a>`));
  t = t.replace(/\*\*(?=\S)([\s\S]+?)\*\*/g, '<strong>$1</strong>').replace(/__(?=\S)([\s\S]+?)__/g, '<strong>$1</strong>');
  t = t.replace(/(^|[^*\w])\*(?=\S)([^*]+?)\*(?!\*)/g, '$1<em>$2</em>').replace(/(^|[^\w])_(?=\S)([^_]+?)_(?!\w)/g, '$1<em>$2</em>');
  t = t.replace(/ {2,}\n/g, '<br>');
  // Geist (subset latino) no trae subíndices Unicode: CO₂ → CO<sub>2</sub>.
  t = t.replace(/[₀-₉]+/g, (s) => `<sub>${[...s].map((c) => c.charCodeAt(0) - 0x2080).join('')}</sub>`);
  return t.replace(/\uE000(\d+)\uE001/g, (_, i) => `<code>${esc(codes[Number(i)])}</code>`);
}

const RE = {
  fence: /^\s*(```|~~~)/,
  heading: /^(#{1,6})\s+(.*?)\s*#*\s*$/,
  hr: /^\s{0,3}([-*_])(\s*\1){2,}\s*$/,
  quote: /^\s{0,3}>\s?/,
  list: /^(\s*)([-*+]|\d+[.)])\s+(.*)$/,
  tableSep: /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/,
};

function splitRow(line) {
  let s = line.trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|') && !s.endsWith('\\|')) s = s.slice(0, -1);
  return s.split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, '|'));
}

function renderList(items, baseDir) {
  // items: [{ indent, ordered, start, text }] → HTML anidado según la sangría.
  let html = '';
  const stack = [];
  for (const it of items) {
    while (stack.length && it.indent < stack.at(-1).indent) html += `</li></${stack.pop().tag}>`;
    const top = stack.at(-1);
    if (!top || it.indent > top.indent) {
      const tag = it.ordered ? 'ol' : 'ul';
      html += `<${tag}${it.ordered && it.start !== 1 ? ` start="${it.start}"` : ''}>`;
      stack.push({ indent: it.indent, tag });
    } else {
      html += '</li>';
    }
    html += `<li>${inline(it.text, baseDir)}`;
  }
  while (stack.length) html += `</li></${stack.pop().tag}>`;
  return html;
}

export function markdownToHtml(md, baseDir = '.') {
  const lines = md.replace(/\r\n?/g, '\n').split('\n');
  const out = [];
  let i = 0;
  const isBlockStart = (l, next) =>
    RE.fence.test(l) || RE.heading.test(l) || RE.hr.test(l) || RE.quote.test(l) || RE.list.test(l) || (l.trim().startsWith('|') && next !== undefined && RE.tableSep.test(next));

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }

    if (RE.fence.test(line)) {
      const fence = line.trim().slice(0, 3);
      const body = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith(fence)) body.push(lines[i++]);
      i++;
      out.push(`<pre><code>${esc(body.join('\n'))}</code></pre>`);
      continue;
    }
    let m = line.match(RE.heading);
    if (m) { out.push(`<h${m[1].length}>${inline(m[2], baseDir)}</h${m[1].length}>`); i++; continue; }
    if (RE.hr.test(line)) { out.push('<hr>'); i++; continue; }

    if (line.trim().startsWith('|') && i + 1 < lines.length && RE.tableSep.test(lines[i + 1])) {
      const head = splitRow(line);
      const align = splitRow(lines[i + 1]).map((c) => (c.startsWith(':') && c.endsWith(':') ? 'center' : c.endsWith(':') ? 'right' : 'left'));
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) rows.push(splitRow(lines[i++]));
      const cell = (tag, c, k) => `<${tag}${align[k] && align[k] !== 'left' ? ` style="text-align:${align[k]}"` : ''}>${inline(c, baseDir)}</${tag}>`;
      out.push(
        `<table><thead><tr>${head.map((c, k) => cell('th', c, k)).join('')}</tr></thead><tbody>${rows
          .map((r) => `<tr>${head.map((_, k) => cell('td', r[k] ?? '', k)).join('')}</tr>`)
          .join('')}</tbody></table>`,
      );
      continue;
    }

    if (RE.quote.test(line)) {
      const body = [];
      while (i < lines.length && lines[i].trim() && RE.quote.test(lines[i])) body.push(lines[i++].replace(RE.quote, ''));
      out.push(`<blockquote>${markdownToHtml(body.join('\n'), baseDir)}</blockquote>`);
      continue;
    }

    if (RE.list.test(line)) {
      const items = [];
      while (i < lines.length) {
        const l = lines[i];
        const lm = l.match(RE.list);
        if (lm) {
          items.push({ indent: lm[1].replace(/\t/g, '    ').length, ordered: /\d/.test(lm[2]), start: parseInt(lm[2], 10) || 1, text: lm[3] });
          i++;
        } else if (l.trim() && /^\s+/.test(l) && items.length) {
          items.at(-1).text += '\n' + l.trim();
          i++;
        } else if (!l.trim() && i + 1 < lines.length && RE.list.test(lines[i + 1])) {
          i++;
        } else break;
      }
      out.push(renderList(items, baseDir));
      continue;
    }

    const para = [];
    while (i < lines.length && lines[i].trim() && !(para.length && isBlockStart(lines[i], lines[i + 1]))) para.push(lines[i++]);
    out.push(`<p>${inline(para.join('\n'), baseDir)}</p>`);
  }
  return out.join('\n');
}

// ---------------------------------------------------------------- Portada

const DATE_RE = /\b\d{1,2}\s+de\s+[a-záéíóú]+\s+de\s+\d{4}\b|\b\d{4}-\d{2}-\d{2}\b|\b\d{1,2}\/\d{1,2}\/\d{4}\b/i;
const strip = (s) => s.replace(/\*\*|__|`/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim();

export function extractCover(md) {
  const lines = md.replace(/\r\n?/g, '\n').split('\n');
  const h1 = lines.findIndex((l) => /^#\s+/.test(l));
  if (h1 === -1) return { cover: null, body: md };
  let end = h1 + 1;
  while (end < lines.length && !RE.hr.test(lines[end]) && !/^#{1,6}\s/.test(lines[end])) end++;
  const meta = lines.slice(h1 + 1, end).map((l) => l.trim()).filter(Boolean);
  const skipHr = end < lines.length && RE.hr.test(lines[end]) ? 1 : 0;

  const full = strip(lines[h1].replace(/^#\s+/, ''));
  const prefix = full.match(/^Circular NEA\s*[—–:-]\s*/);
  const cover = { title: prefix ? full.slice(prefix[0].length) : full, fullTitle: full, subtitle: [], team: null, date: null, notes: [] };
  for (const raw of meta) {
    const l = strip(raw);
    if (!cover.date && DATE_RE.test(l) && l.length < 60) cover.date = l;
    else if (!cover.team && (/^\[.*\]$/.test(l) || /^equipo\b/i.test(l))) cover.team = l;
    else if (/^>/.test(raw)) cover.notes.push(l.replace(/^>\s*/, ''));
    else cover.subtitle.push(l);
  }
  const body = [...lines.slice(0, h1), ...lines.slice(end + skipHr)].join('\n');
  return { cover, body };
}

// ---------------------------------------------------------------- Documento

function fontFace(family, file, range) {
  const src = `data:font/woff2;base64,${readFileSync(resolve(FONTS, file)).toString('base64')}`;
  return `@font-face { font-family: "${family}"; src: url("${src}") format("woff2-variations"); font-weight: 100 900; font-display: block;${range ? ` unicode-range: ${range};` : ''} }`;
}

const cssString = (s) => `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;

export function buildHtml(md, baseDir) {
  const { cover, body } = extractCover(md);
  const icon = readFileSync(ICON, 'utf8');
  const iconUri = `data:image/svg+xml;base64,${Buffer.from(icon).toString('base64')}`;
  const headerTitle = cover?.title ?? 'Documento';
  const latinExt = 'U+0100-02BA, U+1E00-1EFF, U+20A0-20C0';

  const coverHtml = cover
    ? `<section class="cover">
  <div class="brand"><img src="${iconUri}" alt=""><span>Circular <b>NEA</b></span></div>
  <div class="cover-main">
    ${cover.subtitle.some((s) => /ideathon/i.test(s)) ? '' : '<p class="kicker">Ideathon NEA Tech 2026</p>'}
    <h1>${inline(cover.title, baseDir)}</h1>
    ${cover.subtitle.map((s) => `<p class="subtitle">${inline(s, baseDir)}</p>`).join('\n    ')}
  </div>
  <dl class="cover-meta">
    ${cover.team ? `<div><dt>Equipo</dt><dd>${inline(cover.team, baseDir)}</dd></div>` : ''}
    ${cover.date ? `<div><dt>Fecha</dt><dd>${inline(cover.date, baseDir)}</dd></div>` : ''}
    ${cover.notes.map((n) => `<div><dt>Nota</dt><dd>${inline(n, baseDir)}</dd></div>`).join('')}
  </dl>
</section>`
    : '';

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>${esc(cover?.fullTitle ?? 'Circular NEA')}</title>
<style>
${fontFace('Geist', 'geist-latin-wght-normal.woff2')}
${fontFace('Geist', 'geist-latin-ext-wght-normal.woff2', latinExt)}
${fontFace('Geist Mono', 'geist-mono-latin-wght-normal.woff2')}
${fontFace('Geist Mono', 'geist-mono-latin-ext-wght-normal.woff2', latinExt)}

:root { --fg: #141a17; --muted: #55605b; --subtle: #5f6a65; --line: #dfe4e1; --soft: #f0f2f1; --sage: #3a7254; --sage-bg: rgb(58 114 84 / .08); }

@page {
  size: A4; margin: 20mm;
  @top-left { content: "Circular NEA"; font: 600 8.5pt "Geist", sans-serif; color: #141a17; padding-left: 17pt;
    background: url("${iconUri}") no-repeat left center / 12pt 12pt; vertical-align: middle; }
  @top-right { content: ${cssString(headerTitle)}; font: 400 8.5pt "Geist", sans-serif; color: #5f6a65; vertical-align: middle; }
  @bottom-left { content: "Ideathon NEA Tech 2026"; font: 400 7.5pt "Geist Mono", monospace; letter-spacing: .06em; color: #5f6a65; text-transform: uppercase; }
  @bottom-right { content: counter(page) " / " counter(pages); font: 400 7.5pt "Geist Mono", monospace; color: #5f6a65; }
}
${cover ? '@page :first { @top-left { content: none; background: none; } @top-right { content: none; } @bottom-left { content: none; } @bottom-right { content: none; } }' : ''}

* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: #fff; }
body { font-family: "Geist", "Segoe UI", sans-serif; font-size: 10.25pt; line-height: 1.55; color: var(--fg); -webkit-font-smoothing: antialiased; font-variant-numeric: tabular-nums; }

/* Portada */
.cover { height: 252mm; display: flex; flex-direction: column; break-after: page; }
.cover .brand { display: flex; align-items: center; gap: 12pt; font-size: 15pt; font-weight: 600; letter-spacing: -0.01em; }
.cover .brand img { width: 34pt; height: 34pt; }
.cover .brand b { color: #447d5f; font-weight: 600; }
.cover-main { margin-top: auto; margin-bottom: auto; padding-top: 30mm; }
.cover .kicker { font-family: "Geist Mono", monospace; font-size: 9pt; letter-spacing: .1em; text-transform: uppercase; color: var(--sage); margin: 0 0 14pt; }
.cover h1 { font-size: 40pt; line-height: 1.04; letter-spacing: -0.035em; font-weight: 650; margin: 0; max-width: 150mm; text-wrap: balance; border: 0; padding: 0; }
.cover .subtitle { font-size: 14pt; line-height: 1.4; color: var(--muted); margin: 16pt 0 0; max-width: 140mm; }
.cover-meta { margin: 0; padding-top: 14pt; border-top: 1px solid var(--fg); display: grid; grid-template-columns: repeat(3, 1fr); gap: 16pt; }
.cover-meta dt { font-family: "Geist Mono", monospace; font-size: 7.5pt; letter-spacing: .1em; text-transform: uppercase; color: var(--subtle); margin-bottom: 4pt; }
.cover-meta dd { margin: 0; font-size: 10.5pt; font-weight: 500; }

/* Cuerpo */
h1, h2, h3, h4, h5, h6 { break-after: avoid; page-break-after: avoid; text-wrap: balance; }
h1 { font-size: 22pt; line-height: 1.1; letter-spacing: -0.03em; font-weight: 650; margin: 0 0 12pt; }
h2 { font-size: 15pt; line-height: 1.2; letter-spacing: -0.02em; font-weight: 600; margin: 22pt 0 8pt; padding-top: 10pt; border-top: 1px solid var(--line); }
h3 { font-size: 11.5pt; line-height: 1.3; letter-spacing: -0.01em; font-weight: 600; margin: 16pt 0 5pt; }
h4, h5, h6 { font-family: "Geist Mono", monospace; font-size: 8pt; letter-spacing: .1em; text-transform: uppercase; color: var(--subtle); font-weight: 500; margin: 14pt 0 4pt; }
body > h2:first-child, .cover + h2 { border-top: 0; padding-top: 0; margin-top: 0; }
p { margin: 0 0 7pt; orphans: 3; widows: 3; }
strong { font-weight: 600; }
em { font-style: italic; }
a { color: var(--sage); text-decoration: underline; text-decoration-thickness: .5pt; text-underline-offset: 1.5pt; word-break: break-word; }
code { font-family: "Geist Mono", monospace; font-size: .86em; background: var(--soft); border-radius: 3pt; padding: .5pt 3pt; }
pre { font-family: "Geist Mono", monospace; font-size: 8.25pt; line-height: 1.5; background: var(--soft); border: 1px solid var(--line); border-radius: 6pt; padding: 9pt 11pt; margin: 4pt 0 10pt; white-space: pre-wrap; break-inside: avoid; }
pre code { background: none; padding: 0; font-size: inherit; }
ul, ol { margin: 0 0 8pt; padding-left: 15pt; }
li { margin: 2pt 0; }
li::marker { color: var(--subtle); }
ul ul, ol ol, ul ol, ol ul { margin: 2pt 0 2pt; }
hr { border: 0; border-top: 1px solid var(--line); margin: 14pt 0; }
hr:has(+ h2), hr:first-child { display: none; }
blockquote { margin: 6pt 0 10pt; padding: 6pt 0 6pt 12pt; border-left: 2pt solid var(--sage); color: var(--muted); background: var(--sage-bg); }
blockquote p:last-child { margin-bottom: 0; }
img { max-width: 100%; }
sub { font-size: .7em; line-height: 0; vertical-align: -0.25em; }

table { width: 100%; border-collapse: collapse; margin: 6pt 0 12pt; font-size: 8.75pt; line-height: 1.42; break-inside: auto; }
thead { display: table-header-group; }
tr { break-inside: avoid; page-break-inside: avoid; }
th { text-align: left; font-family: "Geist Mono", monospace; font-weight: 500; font-size: 7.25pt; letter-spacing: .08em; text-transform: uppercase; color: var(--subtle); padding: 0 8pt 5pt 0; border-bottom: 1px solid var(--fg); vertical-align: bottom; }
td { padding: 5pt 8pt 5pt 0; border-bottom: 1px solid var(--line); vertical-align: top; }
th:last-child, td:last-child { padding-right: 0; }
td strong { font-weight: 600; }
</style></head>
<body>
${coverHtml}
${markdownToHtml(body, baseDir)}
</body></html>`;
}

// ---------------------------------------------------------------- CLI

async function main() {
  const args = process.argv.slice(2);
  const htmlIdx = args.indexOf('--html');
  const htmlOut = htmlIdx > -1 ? resolve(args.splice(htmlIdx, 2)[1]) : null;
  const [input, output] = args;
  if (!input || !output) {
    console.error('Uso: node entregables/fuente/build-pdf.mjs <entrada.md> <salida.pdf> [--html <salida.html>]');
    process.exit(1);
  }
  const src = resolve(input);
  const md = readFileSync(src, 'utf8');
  const html = buildHtml(md, dirname(src));
  if (htmlOut) writeFileSync(htmlOut, html);

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.pdf({ path: resolve(output), format: 'A4', printBackground: true, preferCSSPageSize: true });
  } finally {
    await browser.close();
  }
  console.log(`PDF: ${resolve(output)} · ${(statSync(resolve(output)).size / 1024).toFixed(0)} KB`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();

#!/usr/bin/env node
/**
 * 把 example-src/project-memory 底下的 Markdown 印成 PDF，放到 example/project-memory（保留子資料夾）。
 * 只處理「定版文件」（議事錄、規範）；決議追蹤日誌／提案單追蹤表是 Drive 用的 docx／xlsx，不在此列。
 *
 * 用法：node course/tahoho/example-src/build-pdf.mjs
 * 依賴：repo 根目錄的 puppeteer（course-page-generator 的 generate-og.mjs 也用它）
 */
import { readFileSync, readdirSync, mkdirSync, statSync } from 'fs';
import { dirname, join, relative, basename } from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const here = dirname(fileURLToPath(import.meta.url));
const SRC = join(here, 'project-memory');
const OUT = join(here, '..', 'example', 'project-memory');
const SKIP = new Set(['決議追蹤日誌.md', '提案單追蹤表.md']);

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return walk(p);
    return name.endsWith('.md') && !SKIP.has(name) ? [p] : [];
  });
}

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function inline(s) {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

// 夠用的 Markdown 子集：標題、表格、清單、引言、分隔線、段落（單一換行 = <br>）
function mdToHtml(md) {
  const lines = md.split('\n');
  const out = [];
  let i = 0;
  const isTableRow = (l) => /^\|.*\|\s*$/.test(l);
  const isListItem = (l) => /^\s*([-*]|\d+\.)\s+/.test(l);
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    let m;
    if ((m = line.match(/^(#{1,4})\s+(.*)$/))) {
      out.push(`<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`); i++; continue;
    }
    if (/^---+\s*$/.test(line)) { out.push('<hr>'); i++; continue; }
    if (isTableRow(line)) {
      const rows = [];
      while (i < lines.length && isTableRow(lines[i])) rows.push(lines[i++]);
      const cells = (r) => r.trim().slice(1, -1).split('|').map((c) => inline(c.trim()));
      const [head, sep, ...body] = rows;
      const hasSep = sep && /^\|[\s:|-]+\|$/.test(sep);
      const bodyRows = hasSep ? body : rows.slice(1);
      out.push('<table><thead><tr>' + cells(head).map((c) => `<th>${c}</th>`).join('') + '</tr></thead><tbody>' +
        bodyRows.map((r) => '<tr>' + cells(r).map((c) => `<td>${c}</td>`).join('') + '</tr>').join('') + '</tbody></table>');
      continue;
    }
    if (/^>\s?/.test(line)) {
      const q = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) q.push(lines[i++].replace(/^>\s?/, ''));
      out.push(`<blockquote>${q.map(inline).join('<br>')}</blockquote>`); continue;
    }
    if (isListItem(line)) {
      // 巢狀清單：以縮排（每 2 格一層）決定層級
      const items = [];
      while (i < lines.length && isListItem(lines[i])) {
        const mm = lines[i].match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
        items.push({ depth: Math.floor(mm[1].length / 2), ordered: /\d/.test(mm[2]), text: mm[3] });
        i++;
      }
      const render = (list, depth) => {
        let html = '';
        let k = 0;
        while (k < list.length) {
          const tag = list[k].ordered ? 'ol' : 'ul';
          html += `<${tag}>`;
          while (k < list.length && list[k].depth === depth && list[k].ordered === (tag === 'ol')) {
            const it = list[k++];
            const kids = [];
            while (k < list.length && list[k].depth > depth) kids.push(list[k++]);
            html += `<li>${inline(it.text)}${kids.length ? render(kids, depth + 1) : ''}</li>`;
          }
          html += `</${tag}>`;
        }
        return html;
      };
      out.push(render(items, 0)); continue;
    }
    const para = [];
    while (i < lines.length && lines[i].trim() && !/^(#|---|\||>)/.test(lines[i]) && !isListItem(lines[i])) para.push(lines[i++]);
    out.push(`<p>${para.map(inline).join('<br>')}</p>`);
  }
  return out.join('\n');
}

const CSS = `
  body { font-family: "PingFang TC", "Noto Sans TC", "Microsoft JhengHei", sans-serif; font-size: 10.5pt; line-height: 1.75; color: #222; margin: 0; }
  h1 { font-size: 16pt; text-align: center; margin: 0 0 14px; letter-spacing: .5px; }
  h2 { font-size: 12.5pt; margin: 20px 0 8px; padding-bottom: 4px; border-bottom: 1px solid #999; }
  h3 { font-size: 11pt; margin: 14px 0 6px; }
  p { margin: 4px 0; }
  ul, ol { margin: 4px 0 8px; padding-left: 1.6em; }
  li { margin: 2px 0; }
  li > ul, li > ol { margin: 2px 0; }
  blockquote { margin: 8px 0; padding: 6px 12px; border-left: 3px solid #999; background: #f5f5f5; color: #444; font-size: 10pt; }
  table { border-collapse: collapse; width: 100%; margin: 8px 0 12px; font-size: 9.5pt; }
  th, td { border: 1px solid #999; padding: 5px 8px; vertical-align: top; text-align: left; }
  th { background: #efefef; font-weight: 600; }
  tr { page-break-inside: avoid; }
  hr { border: 0; border-top: 1px solid #bbb; margin: 14px 0; }
  code { font-family: inherit; background: #f0f0f0; padding: 0 3px; border-radius: 2px; }
  h2, h3 { page-break-after: avoid; }
`;

const files = walk(SRC).sort();
const browser = await puppeteer.launch();
try {
  for (const src of files) {
    const rel = relative(SRC, src).replace(/\.md$/, '.pdf');
    const dest = join(OUT, rel);
    mkdirSync(dirname(dest), { recursive: true });
    const html = `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><title>${esc(basename(rel, '.pdf'))}</title><style>${CSS}</style></head><body>${mdToHtml(readFileSync(src, 'utf8'))}</body></html>`;
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    await page.pdf({
      path: dest, format: 'A4', printBackground: true, displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: '<div style="width:100%;text-align:center;font-size:8px;color:#888;font-family:sans-serif"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
      margin: { top: '18mm', right: '18mm', bottom: '20mm', left: '18mm' },
    });
    await page.close();
    console.log(`✅ ${rel}`);
  }
} finally {
  await browser.close();
}

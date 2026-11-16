// build.mjs：把 content/ 裡的 Markdown 轉成 site/ 裡的網頁
// 用法：npm run build
import { marked } from 'marked';
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'content'; // 老師改這個資料夾
const OUT = 'site';    // 產生出來的網站（不要手動改）
const SCHOOL = '星光國小 五年三班';

// 導覽列固定順序，其他新增的分頁排在後面
const ORDER = ['index', 'timetable', 'contact-book'];

// 版型樣式：直接內嵌在每一頁，不需要外部檔案
const CSS = `
  body { margin: 0; font: 18px/1.8 "PingFang TC", "Noto Sans TC", "Microsoft JhengHei", sans-serif; color: #3d3226; background: #fff8ec; }
  header { background: #f4a340; color: #fff; padding: 16px 20px 0; }
  header h1 { color: #fff; margin: 0 0 10px; font-size: 1.4rem; }
  nav { display: flex; gap: 6px; overflow-x: auto; }
  nav a { padding: 8px 16px; border-radius: 10px 10px 0 0; color: #fff; text-decoration: none; white-space: nowrap; }
  nav a.current { background: #fff8ec; color: #c2650a; font-weight: bold; }
  main { max-width: 760px; margin: 0 auto; padding: 20px; }
  h1 { color: #c2650a; }
  h2 { border-left: 6px solid #f4a340; padding-left: 10px; margin-top: 1.8em; }
  table { border-collapse: collapse; display: block; overflow-x: auto; }
  th, td { border: 1px solid #e3c999; padding: 6px 12px; }
  img { max-width: 100%; height: auto; }
  a { color: #c2650a; }
  footer { text-align: center; color: #8a7a66; font-size: 0.85rem; padding: 20px; }
`;

// 1. 清掉舊的 site/，重新開始
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

// 2. 找出所有 .md，依固定順序排好；導覽文字取第一個「# 」標題
const names = fs.readdirSync(SRC).filter((f) => f.endsWith('.md')).map((f) => f.slice(0, -3));
const rank = (n) => (ORDER.includes(n) ? ORDER.indexOf(n) : ORDER.length);
names.sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));

const pages = names.map((name) => {
  const md = fs.readFileSync(path.join(SRC, name + '.md'), 'utf8');
  const title = (md.match(/^# (.+)$/m) || [null, name])[1].trim();
  return { name, md, title };
});

// 3. 每一頁套上同一個版型（連結都用相對路徑）
const today = new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' });
for (const page of pages) {
  const nav = pages
    .map((p) => `<a href="${p.name}.html"${p.name === page.name ? ' class="current"' : ''}>${p.title}</a>`)
    .join('');
  const html = `<!DOCTYPE html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${page.title}｜${SCHOOL}</title>
<style>${CSS}</style>
</head>
<body>
<header><h1>${SCHOOL}</h1><nav>${nav}</nav></header>
<main>${marked.parse(page.md)}</main>
<footer>最後更新：${today}</footer>
</body>
</html>
`;
  fs.writeFileSync(path.join(OUT, page.name + '.html'), html);
}

// 4. 複製附件資料夾與圖片，讓 Markdown 裡的相對路徑可以顯示
fs.cpSync(path.join(SRC, 'files'), path.join(OUT, 'files'), { recursive: true });
for (const f of fs.readdirSync(SRC)) {
  if (/\.(png|jpe?g)$/i.test(f)) fs.copyFileSync(path.join(SRC, f), path.join(OUT, f));
}

console.log(`完成：產生 ${pages.length} 個網頁 → ${OUT}/`);

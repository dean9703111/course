#!/usr/bin/env node
/**
 * 課程頁 → PDF 講義（選用，需要 puppeteer）
 *
 * Usage:
 *   node <本 Skill 資料夾>/scripts/export-pdf.mjs <course-dir> [--out assets/講義.pdf]
 *
 * 流程：開 <course-dir>/index.html?print=1 → 頁面的 PDF packer 在載入時排好 #print-slides
 * → page.pdf()。頁面還不支援 ?print=1 時自動改走相容模式（見 lib/browser.mjs openPrintMode）。
 *
 * 頁面尺寸：theme.css 的 @media print { @page { size: 1280px 720px; margin: 0 } }，
 * 這裡 width/height 寫同樣的值，preferCSSPageSize 讓 @page 優先。
 *
 * 用 headless: 'shell'：新版 headless 的 page.pdf() 曾有 CJK 字型子集渲染成空白的問題。
 * 另一個已知坑：部分 mac 的 PingFang TC 在 Chrome PDF 管線會整段隱形；課程頁用 Google Fonts 的
 * Noto Sans TC，所以要能連網，字型沒載到就會退回系統字型。
 *
 * --out 相對路徑以課程目錄為準（--out assets/講義.pdf → <course-dir>/assets/講義.pdf），絕對路徑照用；
 * 預設 <course-dir>/assets/講義.pdf。
 *
 * 溢出頁：app.js 的 ?print=1 只暴露 printReady／failed，沒有逐頁溢出資訊，所以這裡量每張 .slide 內
 * 可見文字與圖片的實際底緣是否超出 slide 底緣（slide 被收成 max-height:720＋overflow:hidden，超出的內容
 * PDF 裡會被裁掉），有的話印 ⚠️ 與頁碼；只是提醒，exit code 不變。不用 scrollHeight，它含底部 padding
 * 會把只是留白不夠的頁也報出來。
 */

import { existsSync, mkdirSync, readFileSync, statSync } from 'fs';
import { resolve, join, dirname } from 'path';
import { launchBrowser, openPrintMode } from './lib/browser.mjs';

const PRINT_TIMEOUT = 180000; // ?print=1 的 packer 是同步長任務，200+ 頁的課（tahoho 264 張）要 40 秒上下，預設 30 秒不夠

function usage() {
  console.log('用法：node export-pdf.mjs <course-dir> [--out assets/講義.pdf]');
  console.log('  預設輸出 <course-dir>/assets/講義.pdf；--out 相對路徑以課程目錄為準；需先 build 出 index.html');
}

function countPdfPages(buf) {
  // Chrome 產的 PDF 物件未壓縮成 object stream，/Type /Page（非 /Pages）出現次數＝頁數
  return (buf.toString('latin1').match(/\/Type\s*\/Page(?![a-zA-Z])/g) || []).length;
}

async function main() {
  const argv = process.argv.slice(2);
  if (!argv.length || argv.includes('--help') || argv.includes('-h')) {
    usage();
    process.exit(argv.length ? 0 : 1);
  }
  let courseArg = null;
  let outArg = null;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--out') outArg = argv[++i];
    else if (argv[i].startsWith('--out=')) outArg = argv[i].slice(6);
    else if (!courseArg) courseArg = argv[i];
  }
  const courseDir = resolve(courseArg);
  const indexPath = join(courseDir, 'index.html');
  if (!existsSync(indexPath)) {
    console.error(`✗ 找不到 ${indexPath}，請先 build：node <本 Skill 資料夾>/scripts/build.mjs ${courseArg}`);
    process.exit(1);
  }
  const outPath = outArg ? resolve(courseDir, outArg) : join(courseDir, 'assets', '講義.pdf');

  const t0 = Date.now();
  const browser = await launchBrowser({ headless: 'shell' });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
    // headless 預設就是 light；明寫出來，產出才不會跟著環境變
    await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);
    const { mode, slides } = await openPrintMode(page, indexPath, { timeout: PRINT_TIMEOUT });
    if (mode === 'fallback') console.log('⚠️  使用相容模式（頁面尚未支援 ?print=1，改用匯出按鈕＋stub window.print）');

    mkdirSync(dirname(outPath), { recursive: true });
    await page.pdf({
      path: outPath,
      width: '1280px',
      height: '720px',
      printBackground: true,
      preferCSSPageSize: true,
    });
    const pages = countPdfPages(readFileSync(outPath));
    const mb = (statSync(outPath).size / 1024 / 1024).toFixed(2);
    const sec = ((Date.now() - t0) / 1000).toFixed(1);
    console.log(`✅ ${outPath}`);
    console.log(`   ${pages} 頁（#print-slides ${slides} 張）、${mb} MB、${sec}s`);
    if (pages !== slides) console.log(`⚠️  PDF 頁數與 slide 數不一致：有 slide 跨頁或被切掉，請用瀏覽器開 index.html?print=1 檢查`);
    const over = await page.evaluate(() => Array.from(document.querySelectorAll('#print-slides .slide')).map((s, i) => {
      const limit = s.getBoundingClientRect().bottom;
      let bottom = -Infinity;
      const walker = document.createTreeWalker(s, NodeFilter.SHOW_TEXT);
      for (let t = walker.nextNode(); t; t = walker.nextNode()) {
        if (!t.nodeValue.trim() || !t.parentElement || t.parentElement.closest('script,style')) continue;
        const range = document.createRange();
        range.selectNodeContents(t);
        const r = range.getBoundingClientRect();
        if (r.width * r.height >= 1) bottom = Math.max(bottom, r.bottom);
      }
      s.querySelectorAll('img,svg,video,canvas,iframe').forEach((m) => {
        const r = m.getBoundingClientRect();
        if (r.width * r.height >= 64) bottom = Math.max(bottom, r.bottom);
      });
      return { no: i + 1, px: Math.round(bottom - limit) };
    }).filter((x) => x.px > 1));
    if (over.length) {
      const list = over.slice(0, 20).map((x) => `p.${x.no}（+${x.px}px）`).join('、') + (over.length > 20 ? '…' : '');
      console.log(`⚠️  ${over.length} 頁的文字或圖片超出 720px，超出部分 PDF 裡會被裁掉：${list}`);
      console.log('   （用瀏覽器開 index.html?print=1 可以看到實際分頁）');
    }
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(`✗ ${e.message}`);
  process.exit(1);
});

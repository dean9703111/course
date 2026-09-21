#!/usr/bin/env node
/**
 * build.mjs — content.md → index.html（可預覽）→ 逐卡 PNG
 *
 * 用法：node build.mjs <deck-dir> [--theme dark|light|both] [--force]
 *   --theme  覆蓋 config 的 brand.theme
 *   --force  略過 lint error 與溢版檢查（僅供快速迭代，正式出圖不可用）
 *
 * 產出：
 *   <deck-dir>/index.html                  預覽頁（右下角可切深淺色）
 *   <deck-dir>/assets/cards/<theme>/NN.png 1080×1350（× export.scale）
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { parseDeck, cardHTML, esc } from './dsl.mjs';
import { loadConfig, applyFrontmatter } from './config.mjs';
import { runLint, printReport } from './lint.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const argAfter = (flag, def) => {
  const i = process.argv.indexOf(flag);
  return i > -1 ? process.argv[i + 1] : def;
};
const force = process.argv.includes('--force');

/* ── 讀取輸入 ── */
const deckDir = path.resolve(process.argv[2] || '');
const mdPath = path.join(deckDir, 'content.md');
if (!process.argv[2] || !fs.existsSync(mdPath)) {
  console.error('用法：node build.mjs <deck-dir> [--theme dark|light|both] [--force]');
  process.exit(1);
}
const md = fs.readFileSync(mdPath, 'utf8');
const deck = parseDeck(md);
const cfg = applyFrontmatter(loadConfig(deckDir), deck.meta);
const themeArg = argAfter('--theme', cfg.brand.theme);
const themes = themeArg === 'both' ? ['dark', 'light'] : [themeArg];
if (!themes.every((t) => ['dark', 'light'].includes(t))) {
  console.error(`✘ 無效的 theme：${themeArg}（dark | light | both）`);
  process.exit(1);
}

/* ── Step 1：Lint（Eval）── */
const rep = runLint(deck, cfg);
printReport(rep, deck);
if (rep.errors.length && !force) {
  console.error('\n✘ lint 未通過，停止出圖。修正後重跑，或 --force 強制略過（不建議）。');
  process.exit(1);
}

/* ── Step 2：品牌 token 注入（品牌固定，accent / hot / background 可微調）── */
const hex2n = (hex) => {
  const h = hex.replace('#', '');
  return parseInt(h.length === 3 ? [...h].map((c) => c + c).join('') : h, 16);
};
const hexRgba = (hex, a) => {
  const n = hex2n(hex);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};
const luminance = (hex) => {
  const n = hex2n(hex);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const tokenBlock = (theme) => {
  const acc = cfg.brand.accent[theme];
  const hot = cfg.brand.hot[theme];
  const onAcc = luminance(acc) > 0.42
    ? (theme === 'dark' ? '#231602' : '#2C2318')   // 亮 accent → 深色字
    : '#FFF6E3';                                    // 深 accent → 米白字
  return `html[data-theme="${theme}"]{--acc:${acc};--acc-soft:${hexRgba(acc, 0.14)};--hot:${hot};--hot-soft:${hexRgba(hot, 0.12)};--on-acc:${onAcc};}`;
};
const tokens = tokenBlock('dark') + '\n' + tokenBlock('light');

/* ── Step 3：渲染 index.html ── */
const ch = cfg.export.ratio === '1:1' ? 1080 : 1350;
const backgroundStyle = (bg) => {
  if (typeof bg === 'string') return bg;
  if (bg && typeof bg === 'object') return bg.style || bg.type || 'halo';
  return 'halo';
};
const layoutCfg = cfg.brand.layout || {};
const ctx = {
  label: cfg.brand.label || '',
  background: backgroundStyle(cfg.brand.background),
  layout: {
    mode: layoutCfg.mode || 'tutorial',
    coverVisual: layoutCfg.cover_visual || layoutCfg.coverVisual || 'none',
    coverSteps: Array.isArray(layoutCfg.cover_steps) ? layoutCfg.cover_steps
      : Array.isArray(layoutCfg.coverSteps) ? layoutCfg.coverSteps : [],
    rhythm: layoutCfg.rhythm || 'steady',
  },
};
const cardsHTML = deck.cards
  .map((c, i) => `<div class="vslot">${cardHTML(c, i, deck.cards.length, ctx)}</div>`)
  .join('\n');
const base = fs.readFileSync(path.join(__dirname, '..', 'reference', 'base.html'), 'utf8');
const html = base
  .replaceAll('%%TITLE%%', esc(cfg.page.title))
  .replaceAll('%%CH%%', ch + 'px')
  .replaceAll('%%DEFAULT_THEME%%', themes[0])
  .replace('/*%%TOKENS%%*/', tokens)
  .replace('<!--%%CARDS%%-->', cardsHTML);
fs.writeFileSync(path.join(deckDir, 'index.html'), html);
console.log('\n✔ index.html 已產出（瀏覽器可預覽，右下角切換深淺色）');

/* ── Step 4：Puppeteer 逐卡截圖 ── */
function firstExisting(paths) {
  for (const p of paths) if (p && fs.existsSync(p)) return p;
  return null;
}
function scanChromeCaches() {
  const found = [];
  const roots = [
    process.env.PUPPETEER_CACHE_DIR,
    path.join(os.homedir(), '.cache', 'puppeteer'),
    '/root/.cache/puppeteer',
  ].filter(Boolean);
  // root 執行時 homedir 是 /root，一併掃描各使用者家目錄的快取（沙盒常見情境）
  try {
    for (const u of fs.readdirSync('/home')) roots.push(path.join('/home', u, '.cache', 'puppeteer'));
  } catch { /* /home 不存在就略過 */ }
  for (const root of roots) {
    const chromeRoot = path.join(root, 'chrome');
    if (!fs.existsSync(chromeRoot)) continue;
    for (const v of fs.readdirSync(chromeRoot)) {
      for (const sub of ['chrome-linux64/chrome', 'chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing', 'chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing']) {
        found.push(path.join(chromeRoot, v, sub));
      }
    }
  }
  return found;
}
const cwdRequire = createRequire(path.join(process.cwd(), 'noop.js'));
async function loadDep(name) {
  try { const m = await import(name); return m.default ?? m; }
  catch { try { return cwdRequire(name); } catch { return null; } }
}
async function launchBrowser() {
  const args = ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--font-render-hinting=none'];
  const pp = await loadDep('puppeteer');
  if (pp?.launch) return await pp.launch({ args });
  const core = await loadDep('puppeteer-core');
  if (!core?.launch) {
    console.error('✘ 缺瀏覽器驅動：工作目錄 npm i puppeteer-core（或 repo 根目錄 npm i -D puppeteer）');
    process.exit(1);
  }
  const exe = firstExisting([
    process.env.PUPPETEER_EXECUTABLE_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    ...scanChromeCaches(),
  ]);
  if (!exe) {
    console.error('✘ 找不到 Chrome 執行檔。可設環境變數 PUPPETEER_EXECUTABLE_PATH 指定路徑。');
    process.exit(1);
  }
  return await core.launch({ executablePath: exe, args });
}

const browser = await launchBrowser();
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: ch + 200, deviceScaleFactor: cfg.export.scale });
  const fileUrl = 'file://' + path.join(deckDir, 'index.html');

  for (const theme of themes) {
    await page.goto(`${fileUrl}?shot=1&theme=${theme}`, { waitUntil: 'networkidle0' });
    await page.evaluate(() => document.fonts.ready.then(() => true));

    // 溢版檢查（layout 層的 Eval，lint 管不到的部分）
    const ovf = await page.evaluate(() =>
      [...document.querySelectorAll('.card')]
        .map((c, i) => {
          const n = c.querySelector('.inner');
          return n.scrollHeight > n.clientHeight + 6 ? i + 1 : 0;
        })
        .filter(Boolean));
    if (ovf.length && !force) {
      console.error(`\n✘ [${theme}] 第 ${ovf.join('、')} 張內容超出畫布 —— 請精簡文字或拆卡（--force 可強制出圖）`);
      process.exit(1);
    }
    if (ovf.length) console.warn(`△ [${theme}] 溢版但 --force 續行：卡 ${ovf.join('、')}`);

    const outDir = path.join(deckDir, 'assets', 'cards', theme);
    fs.mkdirSync(outDir, { recursive: true });
    const els = await page.$$('.card');
    for (let i = 0; i < els.length; i++) {
      const p = path.join(outDir, String(i + 1).padStart(2, '0') + '.png');
      await els[i].screenshot({ path: p });
      console.log(`  ✔ [${theme}] ${path.relative(process.cwd(), p)}`);
    }
  }
} finally {
  await browser.close();
}

console.log(`\n完成：${deck.cards.length} 張 × ${themes.length} 主題（${cfg.export.ratio}，@${cfg.export.scale}x）`);
console.log('PNG 可直接放進簡報、公告或群組；要改內容就改 content.md 重跑。');

// 產生「手寫填好的親子共讀夜報名表」紙本圖（PNG，透明邊界外為白紙）。
// 用法：node render.mjs <輸出資料夾>
// 之後由 photo.py 加上桌面、透視、光線、模糊與 JPEG 壓縮，變成「手機拍的照片」。
import puppeteer from 'puppeteer';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(process.argv[2] || path.join(here, 'paper'));
// 手寫字型（開源授權，不放進 repo）：Iansui、LXGW WenKai TC、清松手寫體 1／4／6、辰宇落雁體
const fontDir = path.resolve(process.argv[3] || process.env.FONT_DIR || path.join(here, 'fonts'));
const FONT_FILES = { Iansui: 'Iansui-Regular.ttf', WenKai: 'LXGWWenKaiTC-Light.ttf', Jason1: 'JasonHandwriting1.ttf', Jason4: 'JasonHandwriting4.ttf', Jason6: 'JasonHandwriting6.ttf', Luoyan: 'ChenYuluoyan-Thin.ttf' };
const fontFaces = Object.entries(FONT_FILES).map(([n, f]) => `@font-face{font-family:"${n}";src:url("file://${path.join(fontDir, f)}");}`).join('\n');
fs.mkdirSync(outDir, { recursive: true });
const entries = JSON.parse(fs.readFileSync(path.join(here, 'entries.json'), 'utf8'));

// 簡單的可重現亂數
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

const HANDS = {
  // font-family、字級倍率
  a: { font: "'Jason1', 'Iansui'", scale: 1.0 },
  b: { font: "'Jason4', 'Iansui'", scale: 1.0 },
  c: { font: "'Luoyan', 'Iansui'", scale: 1.22 },
  d: { font: "'Jason6', 'Iansui'", scale: 1.0 },
  e: { font: "'Iansui'", scale: 0.95 },
};
const INKS = { blue: '#1d3a8f', black: '#1c1c1e', pencil: '#5a5a5e', lightblue: '#2f55b8' };

function hw(text, e, r, opt = {}) {
  // 每個字各自微幅旋轉、位移、縮放，模擬手寫的不整齊
  const hand = HANDS[e.hand];
  const size = (opt.size || 46) * hand.scale;
  const chars = [...String(text)].map((ch) => {
    const rot = (r() - 0.5) * 9;
    const dy = (r() - 0.5) * 5;
    const sc = 0.92 + r() * 0.18;
    const sp = (r() - 0.5) * 3;
    const digitFont = /[0-9]/.test(ch) && e.hand === 'c' ? "font-family:'Iansui';font-size:0.8em;" : '';
    return `<span style="${digitFont}display:inline-block;transform:translateY(${dy.toFixed(1)}px) rotate(${rot.toFixed(1)}deg) scale(${sc.toFixed(2)});margin-right:${sp.toFixed(1)}px">${ch === ' ' ? '&nbsp;' : ch}</span>`;
  }).join('');
  const tilt = (r() - 0.5) * 4;
  const cls = opt.strike ? 'hw strike' : 'hw';
  return `<span class="${cls}" style="font-family:${hand.font};font-size:${size}px;color:${INKS[e.ink]};opacity:${e.ink === 'pencil' ? 0.78 : 0.93};transform:rotate(${tilt.toFixed(1)}deg) translate(${((r() - 0.5) * 10).toFixed(1)}px, ${(opt.dy || 0) + (r() - 0.5) * 6}px)">${chars}</span>`;
}

function tick(e, r, shift = 0) {
  // 手畫的打勾；shift 可把勾勾推到兩格中間
  const j = () => (r() - 0.5) * 5;
  const d = `M ${4 + j()} ${20 + j()} Q ${12 + j()} ${26 + j()} ${15 + j()} ${34 + j()} Q ${24 + j()} ${14 + j()} ${44 + j()} ${-2 + j()}`;
  return `<svg class="tick" style="left:${-6 + shift}px" width="56" height="44" viewBox="-4 -8 56 48"><path d="${d}" fill="none" stroke="${INKS[e.ink]}" stroke-width="${e.ink === 'pencil' ? 2.6 : 3.2}" stroke-linecap="round" stroke-linejoin="round" opacity="${e.ink === 'pencil' ? 0.75 : 0.92}"/></svg>`;
}

function scribbleDigit(e, r) {
  // 寫得像 1 又像 7 的數字：一條斜線加一小段橫勾
  return `<svg class="scrib" width="40" height="54" viewBox="0 0 34 46"><path d="M 9 9 Q 14 6 21 7 Q 19 20 15 40" fill="none" stroke="${INKS[e.ink]}" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round" opacity="0.92"/></svg>`;
}

function signature(e, r) {
  const pts = [];
  let x = 4;
  for (let i = 0; i < 9; i++) { pts.push(`${x.toFixed(0)} ${(14 + (r() - 0.5) * 22).toFixed(0)}`); x += 10 + r() * 9; }
  return `<svg class="sig" width="130" height="34" viewBox="0 0 130 30"><path d="M ${pts.join(' Q ' + (20 + r() * 60).toFixed(0) + ' ' + (r() * 28).toFixed(0) + ' ')}" fill="none" stroke="${INKS[e.ink]}" stroke-width="2.4" stroke-linecap="round" opacity="0.9"/></svg>`;
}

function formHtml(e) {
  const r = rng(e.seed);
  const agreeTick = e.consent === '同意' ? tick(e, r) : '';
  const disagreeTick = e.consent === '不同意' ? tick(e, r) : '';
  const midTick = e.consent === 'between' ? tick(e, r, -40) : '';
  const parents = e.parentsScribble ? scribbleDigit(e, r) : hw(e.parents, e, r, { size: 48 });
  let book = e.book ? hw(e.book, e, r) : '';
  if (e.bookStrike) book = hw(e.bookStrike, e, r, { strike: true }) + '&nbsp;' + book;
  return `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8">
<style>
  ${fontFaces}
  * { box-sizing: border-box; }
  html, body { margin: 0; background: #fff; }
  body { width: 1500px; height: 760px; font-family: "Heiti TC", "Noto Sans TC", sans-serif; color: #111; position: relative; }
  .form { position: absolute; inset: 34px 40px; border: 3px solid #111; border-radius: 22px; padding: 30px 46px; }
  .head { display: flex; justify-content: space-between; align-items: baseline; border-bottom: 2px solid #111; padding-bottom: 14px; margin-bottom: 30px; }
  .head h1 { font-size: 36px; margin: 0; letter-spacing: 2px; }
  .head small { font-size: 21px; }
  .row { display: flex; gap: 52px; font-size: 30px; margin-bottom: 40px; align-items: flex-end; white-space: nowrap; }
  .line { display: inline-flex; align-items: flex-end; justify-content: flex-start; border-bottom: 2px solid #111; height: 58px; padding: 0 10px 0 16px; vertical-align: bottom; position: relative; }
  .w1 { width: 130px; } .w2 { width: 230px; } .w3 { width: 250px; } .wl { width: 1040px; } .wn { width: 1150px; } .ws { width: 240px; }
  .box { display: inline-block; width: 34px; height: 34px; border: 2.4px solid #111; vertical-align: -5px; margin: 0 10px 0 28px; position: relative; }
  .note { font-size: 20px; margin: 0; position: absolute; left: 46px; bottom: 22px; }
  .signrow { position: absolute; right: 46px; bottom: 14px; font-size: 24px; display: flex; align-items: flex-end; }
  .hw { display: inline-block; line-height: 1; position: relative; top: -2px; filter: url(#wobble); white-space: nowrap; }
  .hw.strike::after { content: ""; position: absolute; left: -6px; right: -6px; top: 48%; border-top: 3px solid currentColor; transform: rotate(-3deg); }
  .tick { position: absolute; top: -12px; filter: url(#wobble); overflow: visible; }
  .scrib, .sig { filter: url(#wobble); position: relative; top: 4px; }
</style></head><body>
<svg width="0" height="0" style="position:absolute"><filter id="wobble" x="-10%" y="-20%" width="120%" height="140%">
  <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="${e.seed}" result="n"/>
  <feDisplacementMap in="SourceGraphic" in2="n" scale="${e.wobble || 4}" xChannelSelector="R" yChannelSelector="G"/>
</filter></svg>
<div class="form">
  <div class="head"><h1>親子共讀夜 報名表</h1><small>12/4（五）前交回導師</small></div>
  <div class="row"><span>班級：<span class="line w2">${hw(e.cls, e, r)}</span></span><span>座號：<span class="line w1">${hw(e.seat, e, r, { size: 48 })}</span></span><span>學生姓名：<span class="line w3">${hw(e.name, e, r)}</span></span></div>
  <div class="row"><span>陪同家長：<span class="line w1">${parents}</span>位</span><span>孩子入鏡：<span class="box">${agreeTick}</span>同意<span class="box">${disagreeTick}${midTick}</span>不同意</span></div>
  <div class="row"><span>想分享的書名：<span class="line wl">${book}</span></span></div>
  <div class="row"><span>備註：<span class="line wn">${e.note ? hw(e.note, e, r, { size: 42 }) : ''}</span></span></div>
  <p class="note">每位學生最多 2 位家長陪同；不同意入鏡者，當天拍照會避開。</p>
  <div class="signrow">家長簽名：<span class="line ws">${signature(e, r)}</span></div>
</div>
</body></html>`;
}

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 1500, height: 760, deviceScaleFactor: 1.6 });
for (const e of entries) {
  const tmp = path.join(outDir, `${e.id}.html`);
  fs.writeFileSync(tmp, formHtml(e));
  await page.goto('file://' + tmp, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(outDir, `${e.id}.png`) });
  fs.unlinkSync(tmp);
  console.log('paper', e.id);
}
await browser.close();

#!/usr/bin/env node
/**
 * 課程圖片轉 WebP：<course-dir>/assets/**／*.{png,jpg,jpeg} → 同名 .webp（原檔保留）
 *
 * Usage:
 *   node optimize-images.mjs <course-dir> [--quality 88] [--replace-refs]
 *
 *   --quality N      cwebp 品質（預設 88，截圖類通常省 60〜80%）
 *   --replace-refs   順便把 content.md 裡指向已轉檔圖片的 .png／.jpg 路徑改寫成 .webp
 *                    （不加也沒關係：build 看到較新的同名 .webp 會自動改用）
 *
 * - 需要 cwebp（macOS：brew install webp）。選用工具，build 本身不依賴它。
 * - 已存在且不比原檔舊的 .webp 會跳過，可重複執行；原檔一律不刪（OG 圖 og-*.jpg 不轉，社群平台不一定吃 WebP）。
 * - 轉出來反而比原檔大的（小圖示、平塗色塊）不保留，build 繼續用原檔。
 */
import { readdirSync, statSync, existsSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import { join, resolve, relative, extname } from 'path';
import { execFileSync } from 'child_process';

const args = process.argv.slice(2);
if (!args.length || args.includes('--help') || args.includes('-h')) {
  console.log('Usage: node optimize-images.mjs <course-dir> [--quality 88] [--replace-refs]');
  process.exit(args.length ? 0 : 1);
}

let quality = 88;
let replaceRefs = false;
let courseArg = null;
for (let k = 0; k < args.length; k++) {
  const a = args[k];
  if (a === '--quality') quality = Number(args[++k]);
  else if (a.startsWith('--quality=')) quality = Number(a.slice('--quality='.length));
  else if (a === '--replace-refs') replaceRefs = true;
  else if (a.startsWith('--')) { console.error(`❌ 不認得的選項：${a}`); process.exit(1); }
  else courseArg = a;
}
if (!Number.isFinite(quality) || quality < 0 || quality > 100) {
  console.error('❌ --quality 要是 0〜100 的數字');
  process.exit(1);
}
if (!courseArg) { console.error('❌ 請指定課程目錄'); process.exit(1); }

const courseDir = resolve(courseArg.endsWith('.md') ? join(courseArg, '..') : courseArg);
const assetsDir = join(courseDir, 'assets');
if (!existsSync(assetsDir) || !statSync(assetsDir).isDirectory()) {
  console.error(`❌ 找不到 ${assetsDir}（圖片要放在課程目錄的 assets/ 底下）`);
  process.exit(1);
}

// cwebp：Homebrew 固定路徑優先，其次 PATH
function findCwebp() {
  for (const p of ['/opt/homebrew/bin/cwebp', '/usr/local/bin/cwebp']) if (existsSync(p)) return p;
  try {
    execFileSync('cwebp', ['-version'], { stdio: 'ignore' });
    return 'cwebp';
  } catch { return null; }
}
const CWEBP = findCwebp();
if (!CWEBP) {
  console.error('❌ 找不到 cwebp：macOS 請先 brew install webp，其他平台見 https://developers.google.com/speed/webp/download');
  console.error('   （build 不需要它；沒轉 webp 也能 build，只是頁面比較大）');
  process.exit(1);
}

function* walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.')) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (/^\.(png|jpe?g)$/i.test(extname(e.name)) && !/^og-.*\.jpe?g$/i.test(e.name)) yield p;
  }
}

const kb = (b) => `${Math.round(b / 1024)}K`;
let before = 0, after = 0, done = 0, skipped = 0, kept = 0, failed = 0;
const converted = new Set(); // 有可用 .webp 的原檔（絕對路徑）

for (const src of walk(assetsDir)) {
  const out = src.replace(/\.(png|jpe?g)$/i, '.webp');
  const srcStat = statSync(src);
  if (existsSync(out) && statSync(out).mtimeMs >= srcStat.mtimeMs) {
    skipped++;
    converted.add(src);
    continue;
  }
  try {
    execFileSync(CWEBP, ['-quiet', '-q', String(quality), '-metadata', 'none', src, '-o', out], { stdio: ['ignore', 'ignore', 'pipe'] });
  } catch (err) {
    failed++;
    console.warn(`   ⚠️  ${relative(courseDir, src)} 轉檔失敗：${String(err.stderr || err.message).trim()}`);
    continue;
  }
  const outSize = statSync(out).size;
  if (outSize >= srcStat.size) {
    unlinkSync(out); // 轉了反而更大：不留 webp，build 會繼續用原檔
    kept++;
    console.log(`   ${relative(courseDir, src)}  webp 沒比較小（${kb(srcStat.size)} → ${kb(outSize)}），保留原檔`);
    continue;
  }
  before += srcStat.size;
  after += outSize;
  done++;
  converted.add(src);
  const pct = Math.round((1 - outSize / srcStat.size) * 100);
  console.log(`   ${relative(courseDir, src)} → .webp  ${kb(srcStat.size)} → ${kb(outSize)}（-${pct}%）`);
}

const saved = before - after;
console.log(`✅ 轉換 ${done} 張、跳過 ${skipped} 張已是最新、${kept} 張保留原檔${failed ? `、${failed} 張失敗` : ''}`
  + (done ? `：${kb(before)} → ${kb(after)}，省 ${kb(saved)}（-${Math.round(saved / before * 100)}%）` : ''));

if (replaceRefs) {
  const contentPath = join(courseDir, 'content.md');
  if (!existsSync(contentPath)) {
    console.warn(`   ⚠️  找不到 ${contentPath}，略過 --replace-refs`);
  } else {
    const md = readFileSync(contentPath, 'utf-8');
    let count = 0;
    // 只改 Markdown 圖片 ![alt](path) 裡、對應檔案確實有 .webp 的本地路徑
    const next = md.replace(/(!\[[^\]]*\]\()([^)\s]+\.(?:png|jpe?g))(\)|\s)/gi, (m, head, p, tail) => {
      if (/^(https?:|data:|\/\/)/i.test(p)) return m;
      if (!converted.has(resolve(courseDir, p))) return m;
      count++;
      return head + p.replace(/\.(png|jpe?g)$/i, '.webp') + tail;
    });
    if (count) {
      writeFileSync(contentPath, next, 'utf-8');
      console.log(`✏️  content.md：${count} 處圖片路徑改成 .webp`);
    } else {
      console.log('   content.md 沒有需要改寫的圖片路徑');
    }
  }
}

process.exit(failed ? 1 : 0);

/**
 * config.mjs — 兩層 config 載入（與 course-page-generator 同規則）
 *   config/global.yaml（從 deck 目錄向上搜尋 ≤ 4 層祖層）
 *   <deck-dir>/config.yaml（deep merge 覆蓋；arrays 整個取代）
 *   content.md frontmatter（title/label/ratio/theme/background 快速覆蓋，優先權最高）
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

let parseYAML;
try {
  ({ parse: parseYAML } = await import('yaml'));
} catch {
  try {
    // Skill 可能掛在唯讀路徑（如 claude.ai 的 /mnt/skills/user/...），
    // 該路徑向上找不到 node_modules —— 改從「工作目錄」解析依賴
    ({ parse: parseYAML } = createRequire(path.join(process.cwd(), 'noop.js'))('yaml'));
  } catch {
    console.error('缺少依賴：工作目錄執行  npm i yaml puppeteer-core（或 repo 根目錄 npm i -D yaml puppeteer）');
    process.exit(1);
  }
}

export const DEFAULTS = {
  page: { title: '未命名知識卡' },
  brand: {
    label: '',                           // 每張卡底部的標示（部門／系列名），空字串＝不顯示
    theme: 'dark',                       // dark | light | both（預設出圖模式）
    accent: { dark: '#FFC24D', light: '#7E570F' },
    hot:    { dark: '#FF6B4A', light: '#A93B22' },
    background: 'halo',                  // minimal | grid | gradient | halo
    layout: {
      mode: 'tutorial',                  // tutorial | punchy | editorial
      cover_visual: 'none',              // none | pain-flow
      cover_steps: [],                   // cover_visual 的自訂步驟，例：['翻規範', '問前輩', '被退件']
      rhythm: 'steady',                  // steady | varied
    },
  },
  export: { ratio: '4:5', scale: 2 },    // ratio: 4:5 | 1:1；scale: deviceScaleFactor
  criteria: {                            // Define：這副圖卡「點先算對」的尺
    cards: { min: 5, max: 10 },
    chars: { cover: 60, point: 160, summary: 100 },
    forbidden: ['作為一個 AI', '以下是', '總而言之', '綜上所述'],
    require_recap: true,                 // 結尾卡必含重點回顧（條列／tip／引言 擇一）
    require_source: false,               // 結尾卡必含「依據：」或「來源：」（規範類建議開）
    allow_unverified_numbers: false,
  },
};

export function deepMerge(a, b) {
  if (b === undefined || b === null) return a;
  if (Array.isArray(a) && Array.isArray(b)) return b.slice();
  if (a && b && typeof a === 'object' && typeof b === 'object'
      && !Array.isArray(a) && !Array.isArray(b)) {
    const o = { ...a };
    for (const k of Object.keys(b)) o[k] = k in a ? deepMerge(a[k], b[k]) : b[k];
    return o;
  }
  return b;
}

function findUp(start, rel, depth = 4) {
  let d = path.resolve(start);
  for (let i = 0; i <= depth; i++) {
    const p = path.join(d, rel);
    if (fs.existsSync(p)) return p;
    const parent = path.dirname(d);
    if (parent === d) break;
    d = parent;
  }
  return null;
}

function readYaml(p) {
  try { return parseYAML(fs.readFileSync(p, 'utf8')) || {}; }
  catch (e) { console.error(`✘ YAML 解析失敗：${p}\n  ${e.message}`); process.exit(1); }
}

export function loadConfig(deckDir) {
  let cfg = structuredClone(DEFAULTS);
  const g = findUp(deckDir, path.join('config', 'global.yaml'));
  if (g) cfg = deepMerge(cfg, readYaml(g));
  const d = path.join(deckDir, 'config.yaml');
  if (fs.existsSync(d)) cfg = deepMerge(cfg, readYaml(d));
  return cfg;
}

/** frontmatter 快速覆蓋（title / label / ratio / theme / background） */
export function applyFrontmatter(cfg, meta) {
  if (meta.title) cfg.page.title = meta.title;
  if (meta.label !== undefined) cfg.brand.label = meta.label;
  if (meta.ratio) cfg.export.ratio = meta.ratio;
  if (meta.theme) cfg.brand.theme = meta.theme;
  if (meta.background) cfg.brand.background = meta.background;
  return cfg;
}

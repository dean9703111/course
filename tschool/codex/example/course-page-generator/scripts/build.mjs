#!/usr/bin/env node
/**
 * Course Page Generator
 *
 * Usage:
 *   node build.mjs <course-dir> [<course-dir>...]   # auto-discover config + content
 *   node build.mjs <course-dir>/content.md           # explicit content path
 *   node build.mjs --all <root>                      # build 底下所有含 content.md 的目錄
 *
 * Options:
 *   --check                      lint／config 有 error 就失敗（不寫 index.html，exit 2）
 *   --images=embed|link|auto     圖片處理：全部內嵌／全部相對路徑／≤150 KB 內嵌其餘連結（預設 auto）
 *   --json                       把 build report 印成 JSON 陣列（單一目錄也是陣列）
 *   --quiet                      不印進度與摘要（error 等級的 lint／config 與失敗訊息仍印到 stderr）
 *   exit code：0 成功、1 硬錯誤（content.md 不存在、YAML 引號未閉合、模板 placeholder 殘留、內部錯誤 internal-error）、2 --check 未過
 *   多個目錄時某門課失敗（含非預期例外）不中斷，其餘照常 build
 *
 * Config layering:
 *   1. config/global.yaml  (base — instructor, socials, footer, defaults)
 *   2. <course-dir>/config.yaml  (override — page, quotes, nav, etc.)
 *   Deep merge: course config wins on conflict, arrays are replaced not appended.
 *
 * Output: <course-dir>/index.html
 *
 * 程式介面：
 *   import { build, BuildError } from './build.mjs';
 *   const report = build(dir, { check, images, quiet });  // 失敗丟 BuildError（e.rule、e.report）
 *
 * 模組結構（scripts/lib/，皆零依賴）：
 *   yaml.mjs    精簡 YAML parser（行內註解、未閉合引號偵測）
 *   config.mjs  config 分層載入 / deep merge / GitHub Pages 偵測 / validateConfig
 *   text.mjs    escape、行內 Markdown、id 生成、屬性解析
 *   blocks.mjs  ★ 區塊元件 registry（新增元件只需要改這裡＋文件）
 *   parse.mjs   講稿結構 parser（章節/卡片/清單，元件交給 registry）
 *   render.mjs  頁面骨架與結構型區塊的 HTML 組裝
 *   lint.mjs    content.md 作者檢查（rule id、等級、行號、修法）
 *   zip.mjs     example/ 打包為跨平台 zip（固定時間戳，位元可重現）
 *   image-size.mjs  讀圖檔頭取寬高（寫進 <img width height>）
 */

import { readFileSync, writeFileSync, existsSync, statSync, realpathSync } from 'fs';
import { resolve, dirname, join, relative } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { execFileSync } from 'child_process';

import { parseYamlFull, YamlError } from './lib/yaml.mjs';
import { deepMerge, detectGitHubPagesBase, findGlobalConfig, loadConfig, validateConfig } from './lib/config.mjs';
import { esc, raw } from './lib/text.mjs';
import { parseContent } from './lib/parse.mjs';
import { lintContent, formatLint, countLevels, resolveLocalImage, findCourseDirs } from './lib/lint.mjs';
import { imageSize } from './lib/image-size.mjs';
import {
  buildTocItems, buildBranchTags, buildInstructor, buildQuote,
  buildFooterSocials, buildContentSections,
} from './lib/render.mjs';
import { packageExamples } from './lib/zip.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
// 模板拆成三份原始檔（好編輯），build 時組回單一 HTML（輸出不變）：
//   base.html＝頁面骨架、theme.css＝全部樣式、app.js＝互動邏輯
const BASE_HTML = resolve(__dirname, '../reference/base.html');
const THEME_CSS = resolve(__dirname, '../reference/theme.css');
const APP_JS = resolve(__dirname, '../reference/app.js');

// 供 generate-og.mjs、dev.mjs 與測試 import
export { deepMerge, parseYamlFull, findGlobalConfig, loadConfig, parseContent, build, BuildError };

// build 失敗（任何模式都不產出 index.html）。rule：content-missing／yaml-unterminated-quote／
// placeholder-left／check-failed／invalid-option；check-failed 時 report 帶 lint 與 config 結果。
class BuildError extends Error {
  constructor(message, { rule = 'build-error', report = null } = {}) {
    super(message);
    this.name = 'BuildError';
    this.rule = rule;
    this.report = report;
  }
}

export const IMAGE_MODES = ['embed', 'link', 'auto'];
const IMAGE_EMBED_LIMIT = 150 * 1024; // auto 模式：單檔 ≤ 150 KB 內嵌
const HTML_WARN_BYTES = 15 * 1024 * 1024;

// ─── QR code（vendored generator，無外部依賴；僅 build 時產課程頁 QR） ───

const __qrRequire = createRequire(import.meta.url);
const __qrcode = __qrRequire('./qrcode-vendor.cjs');
function qrSvg(text) {
  const qr = __qrcode(0, 'M');
  qr.addData(text);
  qr.make();
  const n = qr.getModuleCount();
  const pad = 2;
  const dim = n + pad * 2;
  let rects = '';
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (qr.isDark(r, c)) rects += '<rect x="' + (c + pad) + '" y="' + (r + pad) + '" width="1" height="1"/>';
    }
  }
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + dim + ' ' + dim + '" shape-rendering="crispEdges" width="100%" height="100%" role="img" aria-label="QR code">'
    + '<rect width="' + dim + '" height="' + dim + '" fill="#ffffff"/>'
    + '<g fill="#000000">' + rects + '</g></svg>';
}

// ─── 本地圖片：內嵌 base64 或改成相對路徑（--images），有較新的同名 .webp 一律改用 ───

const MIME = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', svg: 'image/svg+xml', webp: 'image/webp' };
const mimeOf = (p) => { const ext = p.split('.').pop().toLowerCase(); return MIME[ext] || `image/${ext}`; };

function rewriteImg(tag, courseDir, mode, stats, origin) {
  return tag.replace(/<img\s([^>]*?)src="([^"]+)"([^>]*?)>/g, (match, pre, src, post) => {
    const r = resolveLocalImage(courseDir, src);
    if (!r) return match; // data:／http(s): 不動
    stats.total++;
    if (!r.exists) {
      stats.missing++;
      stats.missingSrcs.push({ src, origin });
      return match;
    }
    if (r.webp) stats.webp++;
    else if (/\.(png|jpe?g)$/i.test(r.file)) stats.nonWebp++;
    // 寫入實際檔案（含改用的 webp）的寬高：連結的大圖還沒載完就先佔好比例，列印 packer 才量得準。
    // 標籤自己已有 width／height 就不動
    const dims = /(?:^|\s)(?:width|height)\s*=/i.test(`${pre} ${post}`) ? null : imageSize(r.file);
    const size = dims ? ` width="${dims.width}" height="${dims.height}"` : '';
    const embed = mode === 'embed' || (mode === 'auto' && statSync(r.file).size <= IMAGE_EMBED_LIMIT);
    if (embed) {
      const b64 = readFileSync(r.file).toString('base64');
      stats.embedded++;
      stats.embeddedBytes += b64.length;
      return `<img ${pre}src="data:${mimeOf(r.file)};base64,${b64}"${size}${post}>`;
    }
    stats.linked++;
    // 相對路徑維持 content.md 寫的路徑，只把副檔名換成 webp
    const linked = r.webp ? src.replace(/\.(png|jpe?g)(?=([?#].*)?$)/i, '.webp') : src;
    return linked === src && !size ? match : `<img ${pre}src="${linked}"${size}${post}>`;
  });
}

// <script>／<style> 原樣保留；[html] 的 iframe srcdoc（" 已被跳脫成 &quot;）解碼後套同一套規則再編回去。
// srcdoc 文件的相對網址以父頁 URL 為基底（Chrome 實測 file:// 與 http 皆然），所以 link 模式維持相對路徑即可，
// 不注入 <base href>（會連帶改掉 [html] 內連結的解析，且 file:// 絕對路徑不可攜）。
function processImages(html, courseDir, mode, stats, origin = 'page') {
  return html.replace(/<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>|\ssrcdoc="([^"]*)"|<img\s[^>]*>/g, (seg, srcdoc) => {
    if (seg.startsWith('<script') || seg.startsWith('<style')) return seg;
    if (srcdoc !== undefined) {
      const inner = srcdoc.replace(/&quot;/g, '"').replace(/&amp;/g, '&');
      const out = processImages(inner, courseDir, mode, stats, 'html');
      if (out === inner) return seg;
      return ` srcdoc="${out.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"`;
    }
    return rewriteImg(seg, courseDir, mode, stats, origin);
  });
}

// ─── 版本標記：<meta name="generator" content="course-page-generator <sha>"> ───
// sha 取本 skill 所在 repo 的 HEAD；skill 目錄有未 commit 的改動（含未追蹤檔）時加 -dirty，
// 表示產出不完全對應該 commit 的 generator。課程目錄不在任何 git 工作樹內（測試、golden 的暫存目錄）時一律寫 dev，
// 這類輸出本來就無從追溯，也讓測試快照不隨 commit 變動。
let SKILL_SHA;
function generatorVersion(courseDir) {
  try {
    execFileSync('git', ['rev-parse', '--is-inside-work-tree'], { cwd: courseDir, stdio: 'ignore' });
  } catch { return 'dev'; }
  if (SKILL_SHA === undefined) {
    const git = (...args) => execFileSync('git', args, {
      cwd: __dirname, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    try {
      SKILL_SHA = git('rev-parse', '--short', 'HEAD') || 'dev';
      if (SKILL_SHA !== 'dev' && git('status', '--porcelain', '--', resolve(__dirname, '..'))) SKILL_SHA += '-dirty';
    } catch { SKILL_SHA = SKILL_SHA || 'dev'; }
  }
  return SKILL_SHA;
}

// ─── 錯誤訊息與摘要 ───

function isDir(p) {
  try { return statSync(p).isDirectory(); } catch { return false; }
}

function missingContentMessage(courseDir, contentPath) {
  const roots = isDir(courseDir) ? [courseDir, dirname(courseDir)] : [dirname(courseDir)];
  const seen = new Set([courseDir]);
  const cands = [];
  for (const root of roots) {
    for (const d of findCourseDirs(root, { maxDepth: 3, limit: 40 })) {
      if (!seen.has(d)) { seen.add(d); cands.push(d); }
    }
  }
  let msg = `找不到 content.md：${contentPath}`;
  if (cands.length) {
    msg += '\n   候選目錄（含 content.md）：\n'
      + cands.slice(0, 15).map(d => `     ${relative(process.cwd(), d) || '.'}`).join('\n')
      + (cands.length > 15 ? `\n     …共 ${cands.length} 個` : '');
  } else {
    msg += '\n   附近找不到含 content.md 的目錄';
  }
  return msg + '\n   → 用法：node build.mjs <課程目錄>（例：node build.mjs my-course），或 --all <根目錄> 一次 build 全部';
}

function formatConfigIssue(c) {
  const icon = c.level === 'error' ? '❌' : c.level === 'info' ? 'ℹ️' : '⚠️';
  return `   ${icon}  config:${c.path} [${c.level}/${c.rule}] ${c.msg}`;
}

function countBlocks(sections, headerBlocks) {
  const counts = {};
  const all = [...headerBlocks, ...sections.flatMap(s => s.blocks)];
  for (const b of all) counts[b.type] = (counts[b.type] || 0) + 1;
  return Object.fromEntries(Object.entries(counts).sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1)));
}

function printSummary(report, log) {
  const s = report.summary;
  const img = s.images;
  const mb = (b) => `${(b / 1048576).toFixed(2)} MB`;
  const mark = (bad) => (bad ? '⚠️  ' : '   ');
  const lv = countLevels(report.lint);
  const cfgErr = report.config.filter(c => c.level === 'error').length;
  const big = s.htmlBytes > HTML_WARN_BYTES;
  const blockLine = Object.entries(s.blocks).map(([k, v]) => `${k} ${v}`).join('、');

  log(`✅ Generated: ${report.outputPath}`);
  log(`   章節 ${s.sections}、小節 ${s.subs}｜元件：${blockLine || '（無）'}`);
  log(`${mark(img.missing > 0)}圖片 ${img.total} 張（內嵌 ${img.embedded}／連結 ${img.linked}${img.missing ? `／缺檔 ${img.missing}` : ''}）`
    + `｜內嵌 ${mb(img.embeddedBytes)}｜已用 webp ${img.webp} 張｜未轉 webp ${img.nonWebp} 張`);
  if (img.linked) log(`   ⓘ 有 ${img.linked} 張圖片以相對路徑連結：部署時要連同 assets/ 一起上傳（只傳 index.html 會破圖）`);
  log(`${mark(big)}HTML ${mb(s.htmlBytes)}${big ? '（超過 15 MB：先跑 optimize-images.mjs <課程目錄> 轉 webp，或改用 --images=auto／link）' : ''}`);
  log(`${mark(lv.error > 0 || cfgErr > 0)}lint：error ${lv.error}／warn ${lv.warn}／info ${lv.info}｜config：${report.config.length} 項`);
  log(`   耗時 ${report.durationMs} ms`);
}

// ─── Main build ───

function build(courseDir, opts = {}) {
  const { check = false, images = 'auto', quiet = false } = opts;
  if (!IMAGE_MODES.includes(images)) {
    throw new BuildError(`--images 只接受 ${IMAGE_MODES.join('／')}（收到 ${images}）`, { rule: 'invalid-option' });
  }
  const t0 = Date.now();
  const log = quiet ? () => {} : (msg) => console.log(msg);
  const warn = quiet ? () => {} : (msg) => console.warn(msg);
  const contentPath = join(courseDir, 'content.md');
  const outputPath = join(courseDir, 'index.html');

  if (!existsSync(contentPath)) {
    throw new BuildError(missingContentMessage(courseDir, contentPath), { rule: 'content-missing' });
  }

  log(`\n🔨 Building: ${courseDir}`);

  let cfg, globalRoot, layers;
  try {
    ({ cfg, globalRoot, layers } = loadConfig(courseDir, { quiet }));
  } catch (e) {
    if (e instanceof YamlError) throw new BuildError(e.message, { rule: e.rule });
    throw e;
  }
  const configIssues = validateConfig(cfg, { layers });
  for (const c of configIssues) warn(formatConfigIssue(c));

  if (cfg.instructor?.avatar) {
    let absAvatar = resolve(globalRoot, cfg.instructor.avatar);
    if (!existsSync(absAvatar)) {
      for (const ext of ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg']) {
        const candidate = absAvatar + '.' + ext;
        if (existsSync(candidate)) { absAvatar = candidate; break; }
      }
    }
    if (existsSync(absAvatar)) {
      const b64 = readFileSync(absAvatar).toString('base64');
      cfg.instructor.avatar = `data:${mimeOf(absAvatar)};base64,${b64}`;
    } else {
      cfg.instructor.avatar = relative(courseDir, absAvatar);
    }
  }

  const contentSource = readFileSync(contentPath, 'utf-8').replace(/^﻿/, '');

  // 作者檢查：預設只警告；--check 時 error 等級讓 build 失敗
  const lint = lintContent(contentSource, { courseDir });
  // error／warn 全印；info 每條 rule 只印前 3 則（舊課的 ./assets/ 動輒上百則，會蓋掉真正的警告），report 保留全部
  const infoShown = {};
  for (const w of lint) {
    if (w.level === 'info' && (infoShown[w.rule] = (infoShown[w.rule] || 0) + 1) > 3) continue;
    warn(formatLint(w));
  }
  for (const [rule, n] of Object.entries(infoShown)) {
    if (n > 3) warn(`   ℹ️  content.md：另有 ${n - 3} 則 [info/${rule}] 未列出（--json 可看全部）`);
  }

  const report = { ok: false, courseDir, outputPath, durationMs: 0, lint, config: configIssues, summary: null };

  if (check) {
    const errors = [...lint.filter(l => l.level === 'error').map(l => formatLint(l)),
      ...configIssues.filter(c => c.level === 'error').map(formatConfigIssue)];
    if (errors.length) {
      report.durationMs = Date.now() - t0;
      throw new BuildError(`--check 未通過（${relative(process.cwd(), courseDir) || '.'}）：${errors.length} 個 error，未寫出 index.html\n${errors.slice(0, 20).join('\n')}`
        + (errors.length > 20 ? `\n   …共 ${errors.length} 個` : ''), { rule: 'check-failed', report });
    }
  }

  // [html src="..."] → 展開為 [html]...[/html]（檔案不存在或是資料夾時由 lint 的 html-src-missing 回報）
  const contentRaw = contentSource.replace(
    /^\[html\s+src="([^"]+)"\]\s*$/gm,
    (_, src) => {
      const absPath = resolve(courseDir, src);
      if (!statSync(absPath, { throwIfNoEntry: false })?.isFile()) return '';
      return `[html]\n${readFileSync(absPath, 'utf-8')}\n[/html]`;
    }
  );
  // 以函式回傳值注入，避免 css/js 內容中的 $ 序列被 replace 樣板展開
  const templateRaw = readFileSync(BASE_HTML, 'utf-8')
    .replace('{{THEME_CSS}}', () => readFileSync(THEME_CSS, 'utf-8'))
    .replace('{{APP_JS}}', () => readFileSync(APP_JS, 'utf-8'));

  const { sections, headerBlocks, branchSegments } = parseContent(contentRaw);
  // 單次 build 的渲染上下文（branch flag 需要知道每個區段起點）
  const ctx = { branchStartMap: new Map(branchSegments.map(s => [s.anchorId, s])) };

  const navSource = cfg.nav && cfg.nav.length
    ? cfg.nav
    : sections.map(sec => ({
      text: sec.label.replace(/[：:].*/, '').trim(),
      href: `#${sec.id}`,
    }));
  const navItems = navSource.map((n) =>
    `<a href="${esc(n.href)}">${esc(n.text)}</a>`
  ).join('\n    ');

  const sectionIds = ['instructor', ...sections.map(s => s.id)];
  const allAnchorIds = ['instructor'];
  for (const sec of sections) {
    allAnchorIds.push(sec.id);
    // 依文件順序收集子章節、帶 branch 的卡片、與收合群組的分頁列錨點
    //（順序需與捲動順序一致，scroll-spy 才能正確定位）
    for (const b of sec.blocks) {
      if ((b.type === 'sub-title' || b.type === 'card' || b.type === 'tab-bar') && b.id) allAnchorIds.push(b.id);
    }
  }

  const instructorName = cfg.instructor?.name || '';
  const heroAuthor = `${instructorName} — ${cfg.instructor?.tagline || ''}`;
  const sidebarBrand = (cfg.page?.title || '').replace(/\s*[—–-]\s*/, '<br>');

  let html = templateRaw;
  html = html.replace(/<!--[\s\S]*?-->\n?/g, '');

  // Auto-detect GitHub Pages URL as fallback for SEO fields
  const ghPagesBase = detectGitHubPagesBase(globalRoot);
  const coursePath = relative(globalRoot, courseDir);
  const autoUrl = ghPagesBase ? `${ghPagesBase}/${coursePath}/` : '';
  const autoImage = ghPagesBase ? `${ghPagesBase}/${coursePath}/assets/og-image.jpg` : '';

  const og = {
    title: cfg.seo?.title || cfg.page?.title || '',
    description: cfg.seo?.description || cfg.page?.subtitle || '',
    image: cfg.seo?.image || cfg.seo?.default_image || autoImage,
    url: cfg.seo?.url || autoUrl,
    type: cfg.seo?.type || 'article',
    siteName: cfg.seo?.site_name || cfg.instructor?.name || '',
  };

  if (!cfg.seo?.image && autoImage) {
    log(`   SEO image (auto): ${autoImage}`);
  }
  if (!cfg.seo?.url && autoUrl) {
    log(`   SEO url   (auto): ${autoUrl}`);
  }

  const replacements = {
    '{{PAGE_LANG}}': cfg.page?.lang || 'zh-TW',
    '{{PAGE_MODE}}': cfg.page?.mode ? `data-mode="${cfg.page.mode}"` : '',
    '{{PAGE_TITLE}}': cfg.page?.title || '',
    '{{FAVICON}}': cfg.page?.favicon || '',
    '{{OG_TYPE}}': esc(og.type),
    '{{OG_TITLE}}': esc(og.title),
    '{{OG_DESCRIPTION}}': esc(og.description),
    '{{OG_IMAGE}}': og.image || '',
    '{{OG_URL}}': og.url || '',
    '{{QR_SVG}}': og.url ? qrSvg(og.url) : '',
    '{{QR_URL}}': esc(og.url || ''),
    '{{OG_SITE_NAME}}': esc(og.siteName),
    '{{SIDEBAR_BRAND}}': sidebarBrand,
    '{{TOC_ITEMS}}': buildTocItems(sections),
    '{{HERO_BADGE}}': cfg.page?.badge || '',
    '{{HERO_TITLE}}': raw(cfg.page?.hero_title || cfg.page?.title || ''),
    '{{HERO_SUBTITLE}}': esc(cfg.page?.subtitle || ''),
    '{{HERO_AUTHOR}}': esc(heroAuthor),
    '{{HERO_NAV_ITEMS}}': navItems,
    '{{OPENING_QUOTE}}': buildQuote(cfg.quotes?.opening),
    '{{INSTRUCTOR_SECTION}}': buildInstructor(cfg),
    '{{CONTENT_SECTIONS}}': buildContentSections(sections, headerBlocks, ctx),
    '{{CLOSING_QUOTE}}': buildQuote(cfg.quotes?.closing),
    '{{FOOTER_SOCIAL_LINKS}}': buildFooterSocials(cfg),
    '{{FOOTER_COPYRIGHT}}': esc(cfg.footer?.copyright || ''),
    '{{SECTION_IDS}}': JSON.stringify(sectionIds),
    '{{ALL_ANCHOR_IDS}}': JSON.stringify(allAnchorIds),
    '{{BRANCH_TAGS}}': buildBranchTags(branchSegments),
  };

  // 模板（base.html／theme.css／app.js）裡 build 不認得的 placeholder → 硬錯誤。
  // 只檢查模板本身，不檢查講稿內容（prompt 裡示範 {{NAME}} 是合法的）。
  const unknownPlaceholders = [...new Set([...html.matchAll(/\{\{\s*([A-Z_]+)\s*\}\}/g)].map(m => m[1]))]
    .filter(name => !(`{{${name}}}` in replacements));
  if (unknownPlaceholders.length) {
    throw new BuildError(`模板裡有 build 不認得的 placeholder：${unknownPlaceholders.map(n => `{{${n}}}`).join('、')}`
      + '\n   → 在 build.mjs 的 replacements 補上對應值，或從 reference/base.html／theme.css／app.js 移除', { rule: 'placeholder-left' });
  }

  html = html.replace(/<meta charset="[^"]*">/i, (m) =>
    `${m}\n  <meta name="generator" content="course-page-generator ${generatorVersion(courseDir)}">`);

  for (const [key, val] of Object.entries(replacements)) {
    // 容許 formatter 在 {{ }} 內加空格，e.g. {{ SECTION_IDS }}
    const name = key.replace(/^\{\{/, '').replace(/\}\}$/, '');
    const pattern = new RegExp(`\\{\\{\\s*${name}\\s*\\}\\}`, 'g');
    // 以函式回傳值替換，避免內容中的 $& / $1 被 replace 當成特殊樣板展開
    html = html.replace(pattern, () => val);
  }

  const imgStats = { total: 0, embedded: 0, linked: 0, webp: 0, nonWebp: 0, embeddedBytes: 0, missing: 0, missingSrcs: [] };
  html = processImages(html, courseDir, images, imgStats);
  // 講稿裡的圖已由 lint 帶行號回報；這裡只補 lint 看不到的（[html] 內、config 來的圖）
  for (const { src, origin } of imgStats.missingSrcs) {
    if (lint.some(l => l.rule === 'image-missing' && l.msg.includes(src))) continue;
    warn(`   ⚠️  圖片不存在，保留原路徑：${src}${origin === 'html' ? '（在 [html] 區塊內）' : ''}`);
  }
  delete imgStats.missingSrcs;

  writeFileSync(outputPath, html, 'utf-8');

  const zips = packageExamples(courseDir, { quiet });

  report.ok = true;
  report.summary = {
    sections: sections.length,
    subs: sections.reduce((a, s) => a + s.subs.length, 0),
    blocks: countBlocks(sections, headerBlocks),
    images: imgStats,
    htmlBytes: Buffer.byteLength(html, 'utf-8'),
    zips,
  };
  report.durationMs = Date.now() - t0;
  if (!quiet) printSummary(report, log);
  return report;
}

// ─── CLI (only when run directly, not when imported) ───

function printUsage() {
  console.log('Usage:');
  console.log('  node build.mjs <course-dir> [<course-dir>...]   # e.g. node build.mjs my-course');
  console.log('  node build.mjs <course-dir>/content.md           # explicit content path');
  console.log('  node build.mjs --all <root>                      # build 所有含 content.md 的子目錄');
  console.log('');
  console.log('Options:');
  console.log('  --check                    lint／config 有 error 就失敗（exit 2，不寫 index.html）');
  console.log('  --images=embed|link|auto   圖片內嵌／相對路徑／≤150 KB 內嵌（預設 auto）');
  console.log('  --json                     印出 build report JSON 陣列（單一目錄也是陣列）');
  console.log('  --quiet                    不印進度與摘要（error 仍印到 stderr）');
  console.log('');
  console.log('Config layering:');
  console.log('  1. config/global.yaml     (base: instructor, socials, footer)');
  console.log('  2. <course-dir>/config.yaml  (override: page, quotes, nav)');
}

function resolveCourseDir(input) {
  const resolved = resolve(input);
  if (existsSync(resolved) && statSync(resolved).isDirectory()) return resolved;
  if (input.endsWith('.md')) return dirname(resolved);
  return resolved;
}

function runCli(argv) {
  const opts = { dirs: [], all: [], check: false, json: false, quiet: false, images: 'auto' };
  for (let k = 0; k < argv.length; k++) {
    const a = argv[k];
    if (a === '--check') opts.check = true;
    else if (a === '--json') opts.json = true;
    else if (a === '--quiet') opts.quiet = true;
    else if (a === '--help' || a === '-h') { printUsage(); return 0; }
    else if (a === '--all') opts.all.push(argv[++k] ?? '');
    else if (a.startsWith('--all=')) opts.all.push(a.slice('--all='.length));
    else if (a === '--images') opts.images = argv[++k] ?? '';
    else if (a.startsWith('--images=')) opts.images = a.slice('--images='.length);
    else if (a.startsWith('--')) { console.error(`❌ 不認得的選項：${a}`); printUsage(); return 1; }
    else opts.dirs.push(a);
  }
  if (!IMAGE_MODES.includes(opts.images)) {
    console.error(`❌ --images 只接受 ${IMAGE_MODES.join('／')}（收到 ${opts.images || '空值'}）`);
    return 1;
  }
  if (opts.all.some(r => !r)) { console.error('❌ --all 後面要接根目錄，例：--all course'); return 1; }
  if (!opts.dirs.length && !opts.all.length) { printUsage(); return 1; }

  const targets = opts.dirs.map(resolveCourseDir);
  for (const root of opts.all) {
    const found = findCourseDirs(resolve(root), { maxDepth: 6 });
    if (!found.length) { console.error(`❌ --all ${root}：底下找不到任何含 content.md 的目錄`); return 1; }
    targets.push(...found);
  }
  const uniqueTargets = [...new Set(targets)];

  let exitCode = 0;
  const results = [];
  for (const dir of uniqueTargets) {
    const base = { courseDir: dir, outputPath: join(dir, 'index.html'), durationMs: 0, lint: [], config: [], summary: null };
    try {
      const report = build(dir, { check: opts.check, images: opts.images, quiet: opts.quiet || opts.json });
      results.push(report);
      // --quiet 不印摘要，但 error 等級的 lint／config 仍要讓人看到
      if (opts.quiet && !opts.json) {
        const file = relative(process.cwd(), join(dir, 'content.md'));
        for (const l of report.lint) if (l.level === 'error') console.error(formatLint(l, file));
        for (const c of report.config) if (c.level === 'error') console.error(formatConfigIssue(c));
      }
    } catch (e) {
      if (!(e instanceof BuildError)) {
        // 非預期例外（程式 bug、檔案系統錯誤）：記下這門課、繼續 build 下一門
        exitCode = 1;
        results.push({ ...base, ok: false, error: e.message, rule: 'internal-error', errors: [{ rule: 'internal-error', message: e.message }] });
        if (!opts.json) console.error(`❌ ${relative(process.cwd(), dir) || '.'}：內部錯誤 ${e.message}`);
        continue;
      }
      const code = e.rule === 'check-failed' ? 2 : 1;
      if (code === 1) exitCode = 1;
      else if (exitCode === 0) exitCode = 2;
      results.push({ ...(e.report || base), ok: false, error: e.message, rule: e.rule });
      if (!opts.json) console.error(`❌ ${e.message}`);
    }
  }

  if (opts.json) {
    process.stdout.write(JSON.stringify(results, null, 2) + '\n');
  } else if (uniqueTargets.length > 1 && !opts.quiet) {
    const ok = results.filter(r => r.ok).length;
    console.log(`\n🏁 ${ok}／${uniqueTargets.length} 個課程 build 成功${ok < uniqueTargets.length ? '（失敗的見上方 ❌）' : ''}`);
  }
  return exitCode;
}

// 技能資料夾可能是 symlink：argv[1] 與 import.meta.url 的寫法會不同，兩邊都轉成真實路徑再比，
// 否則直接執行時這一段不會跑、沒有任何輸出。
const __build_filename = fileURLToPath(import.meta.url);
const __realpath = (p) => { try { return realpathSync(p); } catch { return resolve(p); } };
if (process.argv[1] && __realpath(process.argv[1]) === __realpath(__build_filename)) {
  process.exitCode = runCli(process.argv.slice(2));
}

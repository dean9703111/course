// ─── content.md lint（介面 A）：作者友善的檢查，每條帶 rule id、等級、行號與修法 ───
//
// lintContent(md, { courseDir }) → [{ line, rule, level, msg, fix? }]
//   level：error（build --check 時讓 build 失敗）｜warn｜info
//   courseDir：給了才做「檔案是否存在」類檢查（圖片、[download]、[html src]）
//
// 掃描順序刻意與 parse.mjs 一致（標題 → 容器區塊 → 單行區塊 → 卡片 → 引言 → 清單 → 段落），
// 判定「這行最後會被渲染成什麼」才不會誤報。容器內文依渲染方式決定檢查哪些項目。
// lint 只讀不改，build 輸出不受影響。

import { statSync, readdirSync } from 'fs';
import { resolve, dirname, basename, join, relative } from 'path';
import { BLOCKS, KNOWN_TAGS, findFenceClose, isBlockStart } from './blocks.mjs';
import { parseAttrs, closest } from './text.mjs';
import { SECTION_ICON_RE, CARD_ICON_RE } from './parse.mjs';

// rule id → 等級（id 為跨工作包契約，WP2 edge fixture 以此斷言，勿改名）
export const LINT_RULES = {
  'unclosed-container': 'warn',
  'unknown-tag': 'warn',
  'orphan-close': 'warn',
  'image-missing': 'error',
  'download-target-missing': 'error',
  'html-src-missing': 'error',
  'missing-attr': 'warn',
  'invalid-value': 'warn',
  'empty-block': 'warn',
  'loose-paragraph': 'warn',
  'card-no-emoji': 'warn',
  'tag-color-outside-tags': 'warn',
  'summary-no-separator': 'warn',
  'qa-missing-answer': 'warn',
  'todo-left': 'warn',
  'duplicate-heading': 'warn',
  'bare-lt': 'warn',
  'empty-heading': 'warn',
  'unclosed-bold': 'warn',
  'fullpage-before-section': 'warn',
  'control-char': 'warn',
  'section-no-colon': 'info',
  'asset-path-style': 'info',
  'fence-lang-case': 'info',
  'table-ragged': 'info',
  'nested-too-deep': 'info',
  'tab-label-pipe': 'info',
  'branch-empty': 'info',
  'list-marker-mixed': 'info',
  'nested-tabs': 'info',
};

const LEVEL_ICON = { error: '❌', warn: '⚠️', info: 'ℹ️' };

// CLI 輸出：   ⚠️  content.md:12 [warn/rule-id] 訊息 → 修法
export function formatLint(item, file = 'content.md') {
  return `   ${LEVEL_ICON[item.level] || '⚠️'}  ${file}:${item.line} [${item.level}/${item.rule}] ${item.msg}${item.fix ? ` → ${item.fix}` : ''}`;
}

// ─── 本地圖片解析（lint 與 build 的 embed 共用，判定才會一致） ───
// 回傳 null（非本地：data:／http(s):／// 等）或 { abs, file, webp, exists }
//   file：實際要讀的檔（有較新的同名 .webp 時就是 webp）
//   webp：是否改用了同名 .webp（x.png 旁有 x.webp 且 mtime 不早於原檔；原檔不在時也用）
export function resolveLocalImage(courseDir, src) {
  if (!src || /^(data:|https?:|\/\/|mailto:|blob:)/i.test(src)) return null;
  const pathPart = src.split(/[?#]/)[0];
  const tries = [pathPart];
  try {
    const decoded = decodeURIComponent(pathPart);
    if (decoded !== pathPart) tries.push(decoded);
  } catch { /* 非法 % 編碼：只試原字串 */ }
  for (const p of tries) {
    const abs = resolve(courseDir, p);
    const orig = isFile(abs) ? abs : null;
    let webp = null;
    if (/\.(png|jpe?g)$/i.test(abs)) {
      const w = abs.replace(/\.(png|jpe?g)$/i, '.webp');
      if (isFile(w) && (!orig || statSync(w).mtimeMs >= statSync(orig).mtimeMs)) webp = w;
    }
    if (orig || webp) return { abs, file: webp || orig, webp: !!webp, exists: true };
  }
  return { abs: resolve(courseDir, pathPart), file: null, webp: false, exists: false };
}

function isFile(p) {
  try { return statSync(p).isFile(); } catch { return false; }
}
function isDir(p) {
  try { return statSync(p).isDirectory(); } catch { return false; }
}
// 資料夾內是否有任何一般檔案（略過 dotfiles，與 zip.mjs 打包規則一致）
function hasFiles(dir, depth = 0) {
  if (depth > 8) return false;
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return false; }
  for (const e of entries) {
    if (e.name.startsWith('.')) continue;
    if (e.isFile()) return true;
    if (e.isDirectory() && hasFiles(join(dir, e.name), depth + 1)) return true;
  }
  return false;
}

// ─── 規則用到的常數 ───

const CONTAINER_BLOCKS = BLOCKS.filter(b => b.close);
const blockTag = (def) => def.tag || def.name;

// 「容器內沒有任何非空行」要警告的區塊（qa／lab／interactive 有 title 屬性時允許空：當成純標題頁）
const EMPTY_CHECK = new Set(['flow', 'tags', 'summary', 'case', 'class-timeline', 'gallery', 'warning',
  'interactive', 'bonus', 'feedback', 'qa-session', 'lab-session']);
const EMPTY_OK_WITH_TITLE = new Set(['qa-session', 'lab-session', 'interactive']);

const TAG_COLORS = ['green', 'orange', 'purple', 'blue'];
const INLINE_COLORS = ['red', 'green', 'orange', 'purple', 'blue'];
const FEEDBACK_PANELS = ['stats', 'bars', 'compare', 'quotes', 'changes'];
const PR_STATUS = ['merged', 'open', 'draft', 'closed'];

const BRANCH_RE = /\s*\|\s*branch:\s*([^\s|]*)\s*$/i; // 含空值（與 parse.mjs extractBranch 一致：空值也剝掉）
const TAB_RE = /^\[([^\]\n]+)\]\s+(.+)$/;
const IMAGE_LINE_RE = /^!\[[^\]]*\]\([^)]+\)/;
const TAG_COLOR_LINE_RE = /^-\s+\[(green|orange|purple|blue)\]\s/;
const TABLE_WIDTH_MARK = /\[width\s*[:：]\s*([^\]]+)\]/i;
const MAX_WIDTH_OK = /^(?:\d+(?:\.\d+)?(?:px|%|rem|em|ch|vw|vh)|none)$/;
// NUL 與其他 C0 控制字元（tab、換行除外；\r 已在讀入時正規化）
const CONTROL_CHAR_RE = /[\x00-\x08\x0B\x0C\x0E-\x1F]/g;
// 剝除標題標記後是否沒有任何文字（只剩 emoji、冒號或空白）
const isEmptyTitle = (s) => !/[^\s：:]/.test(s.replace(CARD_ICON_RE, '$2'));

// 寫在文字裡會被瀏覽器當成「真的標籤」而不是文字顯示的常見 HTML 標籤名
const HTML_TAGS = new Set(('a abbr b bdi bdo blockquote br button caption center cite code col colgroup dd del details '
  + 'dfn div dl dt em figcaption figure font h1 h2 h3 h4 h5 h6 hr i iframe img input ins kbd label li mark nobr ol '
  + 'p picture pre q rp rt ruby s samp section small source span strong sub summary sup table tbody td tfoot th '
  + 'thead time tr u ul var video audio wbr svg path rect circle g line polyline polygon text').split(' '));

// [time] 精簡寫法（與 blocks.mjs isClassTimelineLine 相同判定）
function isCompactTimeline(trimmed) {
  if (!trimmed || trimmed.startsWith('|') || !trimmed.includes('|')) return false;
  const cells = trimmed.split('|').map(c => c.trim());
  if (cells.length < 2) return false;
  const dateOk = /^\d{1,2}\s*\/\s*\d{1,2}(?:\s*[（(][^）)]+[）)])?$/.test(cells[0]);
  const timeOk = /\d{1,2}:\d{2}\s*(?:~|-|–|—|到|至)\s*\d{1,2}:\d{2}/.test(cells[1]);
  return dateOk && timeOk;
}

function tableCells(line) {
  return line.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
}
function isTableSeparator(line) {
  const t = (line || '').trim();
  if (!t.includes('|')) return false;
  const cells = tableCells(t);
  return cells.length > 0 && cells.every(c => /^:?-{3,}:?$/.test(c));
}

const snip = (s, n = 18) => {
  const t = s.trim();
  return t.length > n ? t.slice(0, n) + '…' : t;
};

// ─── 主程式 ───

export function lintContent(md, opts = {}) {
  const courseDir = opts.courseDir || null;
  const lines = md.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').split('\n');
  const out = [];
  const add = (idx, rule, msg, fix) => {
    const item = { line: idx + 1, rule, level: LINT_RULES[rule], msg };
    if (fix) item.fix = fix;
    out.push(item);
  };

  // ── 共用檢查 ──

  const dirCache = new Map();
  const listDir = (dir) => {
    if (!dirCache.has(dir)) {
      let names = null;
      try { names = readdirSync(dir); } catch { /* 資料夾不存在 */ }
      dirCache.set(dir, names);
    }
    return dirCache.get(dir);
  };

  function checkImage(idx, src) {
    if (!src || /^(data:|https?:|\/\/|mailto:|blob:)/i.test(src)) return;
    if (/^\.\/assets\//.test(src) || /^(\.\/)?images\//.test(src)) {
      const fixed = src.replace(/^\.\//, '').replace(/^images\//, 'assets/');
      add(idx, 'asset-path-style', `圖片路徑請統一用 assets/ 開頭、不加 ./（目前是 ${src}）`,
        /^(\.\/)?images\//.test(src) ? `把圖搬進 assets/ 並改成 ${fixed}` : fixed);
    }
    if (!courseDir) return;
    const r = resolveLocalImage(courseDir, src);
    if (!r) return;
    const dir = dirname(r.abs);
    const names = listDir(dir) || [];
    if (r.exists) {
      // macOS 不分大小寫，本機看得到；部署到 GitHub Pages（分大小寫）就會破圖
      if (!r.webp && names.length && !names.includes(basename(r.file))) {
        const actual = names.find(n => n.toLowerCase() === basename(r.file).toLowerCase());
        if (actual) add(idx, 'image-missing', `圖片檔名大小寫不符：寫的是 ${basename(r.file)}、實際檔案是 ${actual}；本機看得到，部署後會破圖`, `改成 ${actual}`);
      }
      return;
    }
    const want = basename(r.abs);
    const stem = want.replace(/\.[^.]+$/, '').toLowerCase();
    const guess = names.find(n => n.toLowerCase() === want.toLowerCase())
      || names.find(n => n.replace(/\.[^.]+$/, '').toLowerCase() === stem)
      || closest(want, names);
    const pathPart = src.split(/[?#]/)[0];
    const prefix = pathPart.slice(0, pathPart.lastIndexOf('/') + 1);
    add(idx, 'image-missing', `圖片檔不存在：${src}`
      + (guess ? `；同資料夾有 ${guess}，是不是這張？`
        : (listDir(dir) ? '；請確認檔名，或把圖放進這個資料夾' : `；連資料夾 ${relative(courseDir, dir) || '.'}/ 都不存在`)),
    guess ? `改成 ${prefix}${guess}` : undefined);
  }

  // inlineFormat 不跳脫行內程式碼以外的 <，每行只報第一個問題。兩種訊息：
  //   1. `<` 後接字母／/／!／? → 會被瀏覽器當成標籤：不認得的標籤名會吞字；認得的標籤帶 on… 事件屬性或 javascript: 會真的執行
  //   2. 其餘裸 `<`（a < b、<=、<3）→ 目前照字面顯示，但只要後面改成緊接字母就會變成標籤吞字
  // 行內程式碼（`<type>`、`< 0.3 秒`）render 時會整段跳脫、照字面顯示，不報
  function checkBareLt(idx, s) {
    const codeSpans = [];
    s.replace(/`([^`]+)`/g, (m, _inner, off) => { codeSpans.push([off, off + m.length]); return m; });
    const inCode = (pos) => codeSpans.some(([a, b]) => pos > a && pos < b);
    const re = /<(!--|\/?[A-Za-z][\w-]*|[/!?])?/g;
    let m;
    while ((m = re.exec(s))) {
      const close = s.indexOf('>', m.index);
      const piece = close > 0 && close - m.index <= 30 ? s.slice(m.index, close + 1) : s.slice(m.index, m.index + 12);
      const tok = m[1];
      if (inCode(m.index)) continue;
      if (tok === undefined) {
        const around = s.slice(Math.max(0, m.index - 6), m.index + 7).trim();
        add(idx, 'bare-lt', `「${around}」裡的 < 沒有跳脫：目前照字面顯示，但只要 < 後面緊接英文字母（例如 a <b）就會被當成 HTML 標籤、吞掉後面的文字；請寫成 &lt;`,
          '把 < 改成 &lt;');
        return;
      }
      if (tok === '!--') continue;
      const name = tok.replace(/^\//, '').toLowerCase();
      const tagM = HTML_TAGS.has(name) && s.slice(m.index).match(new RegExp(`^<\\/?${name}(?:\\s+[^<>]*)?\\/?>`, 'i'));
      if (tagM && !/\son[a-z]+\s*=|javascript:/i.test(tagM[0])) continue;
      if (tagM) {
        add(idx, 'bare-lt', `「${snip(tagM[0], 30)}」會被當成真的 HTML 標籤（含 on… 事件屬性或 javascript:，瀏覽器會執行）；`
          + '要顯示成文字請寫 &lt;，要放互動內容請改用 [html]…[/html]');
        return;
      }
      add(idx, 'bare-lt', `「${piece}」會被瀏覽器當成 HTML 標籤吞掉，後面的文字可能消失；要顯示 < 請寫 &lt;`);
      return;
    }
  }

  // ** 要成對（行內程式碼裡的不算）；不成對的那個會原樣顯示星號
  function checkBold(idx, s) {
    const n = (s.replace(/`[^`]+`/g, '').match(/\*\*/g) || []).length;
    if (n % 2) add(idx, 'unclosed-bold', `這行的 ** 沒有成對，粗體不會生效、星號會原樣顯示`, '補上結尾的 **；要顯示 ** 本身（例如 glob）請包進 `反引號`');
  }

  // 走 inlineFormat（不跳脫）的文字：圖片、[[color:]]、連結括號、裸 <、未成對 **
  // lt：false 表示這段文字會被跳脫（獨立圖片行、[gallery] 的 alt），不檢查 < 與 **
  function inlineChecks(idx, s, { lt = true } = {}) {
    for (const m of s.matchAll(/!\[[^\]]*\]\(([^)]+)\)(?:\{max-width=([^}]*)\})?/g)) {
      checkImage(idx, m[1].trim());
      if (m[2] !== undefined && !MAX_WIDTH_OK.test(m[2].trim())) {
        const v = m[2].trim();
        add(idx, 'invalid-value', `圖片 {max-width=${v}} 不是合法的寬度，會被瀏覽器忽略；可用 200px、50%、20rem 這類寫法`,
          /^\d+(?:\.\d+)?$/.test(v) ? `改成 {max-width=${v}px}` : undefined);
      }
    }
    for (const m of s.replace(/`[^`]+`/g, '').matchAll(/!?\[[^\]]+\]\(([^)]*)\)/g)) {
      if (!m[1].includes('(')) continue;
      add(idx, 'invalid-value', `連結網址含括號，會在第一個 ) 就截斷（只剩「${snip(m[1], 30)}」）、後面的字掉出連結`,
        '把網址裡的 ( ) 改寫成 %28 %29');
    }
    for (const m of s.matchAll(/\[\[([A-Za-z]+):/g)) {
      if (INLINE_COLORS.includes(m[1])) continue;
      const lower = m[1].toLowerCase();
      add(idx, 'invalid-value', `[[${m[1]}:…]] 的顏色不認得，會整段當成無色標籤顯示；只能用 red／green／orange／purple／blue（小寫）`,
        INLINE_COLORS.includes(lower) ? `改成 [[${lower}:…]]` : undefined);
    }
    if (lt) { checkBareLt(idx, s); checkBold(idx, s); }
  }

  function checkTagColor(idx, t) {
    if (!TAG_COLOR_LINE_RE.test(t)) return false;
    add(idx, 'tag-color-outside-tags', `「${snip(t)}」只有放在 [tags]…[/tags] 裡才會變成彩色標籤，這裡會原樣顯示成文字`,
      '包進 [tags] 區塊，或行內改用 [[green:文字]]');
    return true;
  }

  function checkFenceCase(idx, t) {
    const m = t.match(/^```([A-Za-z]\w*)/);
    if (!m || m[1] === m[1].toLowerCase()) return;
    add(idx, 'fence-lang-case', `程式碼區塊語言請用小寫（目前是 \`\`\`${m[1]}）`, t.replace('```' + m[1], '```' + m[1].toLowerCase()));
  }

  // 屬性只認雙引號 key="value"；沒引號或單引號的屬性會被靜默忽略
  function checkAttrQuotes(idx, line) {
    const m = line.replace(/"[^"]*"/g, '""').match(/\s([\w-]+)=(?!")([^\s\]]*)/);
    if (!m) return;
    add(idx, 'invalid-value', `屬性 ${m[1]}=${m[2]} 沒有用雙引號包起來，會被忽略`, `寫成 ${m[1]}="${m[2].replace(/^'(.*)'$/, '$1')}"`);
  }
  const attrPresent = (line, name) => new RegExp(`\\s${name}=`).test(line);

  function headingCommon(idx, title) {
    if (/\|\s*branch:\s*$/i.test(title)) {
      add(idx, 'branch-empty', '`| branch:` 後面沒寫分支名，空的 branch 標記會被忽略', '寫成 | branch:feature/x，要回主線請寫 | branch:none');
    }
  }
  function checkTabLabel(idx, label) {
    if (label.split('|').length > 2) {
      add(idx, 'tab-label-pipe', `分頁標記 [${label}] 只能有一個 |（[名稱|顏色]），第二個 | 之後會被忽略`);
    }
  }
  // ##／### 開頭的 [名稱|顏色] 分頁標記 → { title, tab }（與 parse.mjs extractTab 一致：名稱空白就不成立分頁）
  function splitTab(idx, title) {
    if (/^\[\]/.test(title)) {
      add(idx, 'invalid-value', '空的 [] 分頁標記不會成立分頁，會原樣留在標題上', '寫成 [工具名] 標題，或刪掉 []');
      return { title, tab: null };
    }
    const tm = title.match(TAB_RE);
    if (!tm) return { title, tab: null };
    checkTabLabel(idx, tm[1]);
    const tab = tm[1].split('|')[0].trim();
    if (!tab) {
      add(idx, 'invalid-value', `分頁標記 [${tm[1]}] 沒有名稱，不會成立分頁（標記會被剝掉）`, '寫成 [工具名|顏色] 標題');
    }
    return { title: tm[2].trim(), tab: tab || null };
  }
  function checkEmptyHeading(idx, title, what) {
    if (isEmptyTitle(title)) add(idx, 'empty-heading', `${what}沒有文字（只剩 emoji、冒號或空白），目錄與頁面上會是空的標題`, '補上標題文字，或刪掉這行');
  }
  // 引言／prompt 的 [label=…] 要用雙引號，否則 label 會被忽略
  function checkLabelQuotes(idx, line) {
    const m = line.match(/\[label\s*=\s*([^\]]*)\]/);
    if (!m || /^"[^"]*"$/.test(m[1].trim())) return;
    const v = m[1].trim().replace(/^['"]|['"]$/g, '');
    add(idx, 'invalid-value', `[label=${m[1]}] 沒有用雙引號包起來，label 會被忽略`, `寫成 [label="${v}"]`);
  }
  // 往回找：這行是否在 ### 卡片的內文裡（卡片遇空行、標題、分隔線或任何區塊起點就結束）
  function inCardBody(idx) {
    for (let k = idx - 1; k >= 0; k--) {
      const l = lines[k];
      if (l.trim() === '') return false;
      if (/^### /.test(l)) return true;
      if (/^#{1,4} /.test(l) || /^---\s*$/.test(l.trim()) || isBlockStart(l, lines[k + 1])) return false;
    }
    return false;
  }

  // ── 容器區塊內文檢查 ──

  function inspectContainer(def, start, end) {
    const name = def.name;
    const tag = blockTag(def);
    const open = lines[start];
    const attrs = parseAttrs(open);
    const body = [];
    for (let k = start + 1; k < end; k++) if (lines[k].trim() !== '') body.push(k);

    if (name === 'prompt') { checkFenceCase(start, open.trim()); checkLabelQuotes(start, open); return; }
    if (name === 'raw-html') return;
    checkAttrQuotes(start, open);

    if (EMPTY_CHECK.has(name) && body.length === 0) {
      if (!(EMPTY_OK_WITH_TITLE.has(name) && attrs.title !== undefined)) {
        add(start, 'empty-block', `[${tag}] 區塊裡沒有任何內容，頁面上會出現一個空的元件`, '補上內容，或把整段刪掉');
      }
      return;
    }

    const textLines = () => body.forEach(k => { const t = lines[k].trim(); if (!checkTagColor(k, t)) inlineChecks(k, t); });

    switch (name) {
      case 'youtube':
        if (!attrs.id && !attrPresent(open, 'id')) {
          add(start, 'missing-attr', '[youtube] 沒有 id，整段影片不會顯示', '寫成 [youtube id="影片ID"]（網址 watch?v= 後面那串）');
        }
        textLines();
        return;

      case 'image-text': {
        if (!body.some(k => IMAGE_LINE_RE.test(lines[k].trim()))) {
          add(start, 'missing-attr', '[image-text] 裡沒有圖片行，圖文並排會少掉圖片', '在區塊內加一行 ![圖說](assets/x.png)');
        }
        const wm = open.match(/\swidth="([^"]*)"/);
        if (wm && !/^\d+%?$/.test(wm[1])) {
          add(start, 'invalid-value', `[image-text] width="${wm[1]}" 不是數字，會退回預設 40%`, '寫成 width="50"（圖片佔的百分比）');
        }
        textLines();
        return;
      }

      case 'gallery':
        for (const k of body) {
          const t = lines[k].trim();
          if (!IMAGE_LINE_RE.test(t)) add(k, 'invalid-value', '[gallery] 只收圖片行（![圖說](assets/x.png)），這行會被略過');
          else inlineChecks(k, t, { lt: false });
        }
        return;

      case 'flow':
        for (const k of body) {
          const t = lines[k].trim();
          if (!/^(?:\d+\.\s+|-\s+)/.test(t)) {
            add(k, 'invalid-value', '[flow] 只認步驟行（1. 標題 — 說明 或 - 標題 — 說明），這行會被略過');
          } else if (!checkTagColor(k, t)) {
            inlineChecks(k, t);
          }
        }
        return;

      case 'tags':
        for (const k of body) {
          const t = lines[k].trim();
          if (/^-\s+\[(green|orange|purple|blue)\]\s+\S/.test(t)) continue;
          const cm = t.match(/^-\s+\[([^\]]+)\]/);
          if (cm) {
            const lower = cm[1].toLowerCase();
            add(k, 'invalid-value', `[tags] 的顏色「${cm[1]}」不認得，這個標籤會被略過；只能用 green／orange／purple／blue（小寫）`,
              TAG_COLORS.includes(lower) ? t.replace(`[${cm[1]}]`, `[${lower}]`) : undefined);
          } else {
            add(k, 'invalid-value', '[tags] 每行要寫成 `- [green] 文字`，這行會被略過');
          }
        }
        return;

      case 'case': {
        let started = false;
        for (const k of body) {
          const t = lines[k].trim();
          if (/^(情境|痛點|(?:處理)?方案)[：:]/.test(t)) started = true;
          else if (!started) add(k, 'invalid-value', '[case] 要從「情境：」「痛點：」或「方案：」開始，這行會被略過');
          if (!checkTagColor(k, t)) inlineChecks(k, t);
        }
        return;
      }

      case 'summary':
        for (const k of body) {
          const t = lines[k].trim();
          if (!/^- /.test(t)) {
            add(k, 'invalid-value', '[summary] 只認 `- emoji **標題** | 說明`，這行會被略過');
          } else if (!t.includes('|')) {
            add(k, 'summary-no-separator', `「${snip(t)}」少了 | 分隔標題與說明，這張總結卡會被略過`, '寫成 - 🎯 **標題** | 一句話說明');
          } else if (!/^-\s+(\S+)\s+\*\*(.+?)\*\*\s*\|\s*(.*)/.test(t)) {
            add(k, 'invalid-value', '[summary] 格式要是 `- emoji **標題** | 說明`（emoji 與 **粗體標題** 都要有），這張卡會被略過');
          } else {
            inlineChecks(k, t.slice(t.indexOf('|') + 1));
          }
        }
        return;

      case 'class-timeline': {
        const items = [];
        let item = null;
        const setField = (it, key, value) => {
          const kk = key.toLowerCase();
          if (kk === 'date') it.date = value.trim() !== '';
          if (kk === 'time') it.time = value.trim() !== '';
        };
        for (const k of body) {
          const t = lines[k].trim();
          const bf = t.match(/^-\s+([\w-]+):\s*(.*)$/);
          const f = t.match(/^([\w-]+):\s*(.*)$/);
          if (bf) {
            item = { line: k, date: false, time: false };
            items.push(item);
            setField(item, bf[1], bf[2]);
          } else if (f && item) {
            setField(item, f[1], f[2]);
          } else if (isCompactTimeline(t.replace(/^-\s+/, ''))) { // 精簡寫法，前面加不加 `- ` 都可以
            item = { line: k, date: true, time: true };
            items.push(item);
          } else if (f) {
            add(k, 'invalid-value', `[time] 的「${f[1]}:」前面還沒有任何一堂課，會被略過；每堂課用 \`- label: 第 1 堂\` 或 \`- date: …\` 開頭`);
          } else {
            add(k, 'invalid-value', '[time] 看不懂這行，會被略過；每堂課用 `- date: 5/30（六）` 開頭再接 `time:`／`des:`，或寫精簡格式 `5/30（六）| 13:30~16:30 | 主題`');
          }
          if (f || bf) inlineChecks(k, (bf ? bf[2] : f[2]));
        }
        for (const it of items) {
          const missing = [!it.date && 'date', !it.time && 'time'].filter(Boolean);
          if (missing.length) {
            add(it.line, 'invalid-value', `[time] 這堂課缺 ${missing.join('、')}，時間軸上會少一欄`, '補上 date: 6/6（六）／time: 13:30~16:30');
          }
        }
        return;
      }

      case 'qa-session': {
        let awaitingA = false; // parse：- Q: 之後第一個 A: 才是答案，其餘 A: 行都會被丟掉
        body.forEach((k, n) => {
          const t = lines[k].trim();
          if (/^- Q:/.test(t)) {
            awaitingA = true;
            let answered = false;
            for (let m = n + 1; m < body.length; m++) {
              const u = lines[body[m]].trim();
              if (/^A:/.test(u)) { answered = true; break; }
              if (/^- Q:/.test(u)) break;
            }
            if (!answered) add(k, 'qa-missing-answer', `問題「${snip(t.replace(/^- Q:\s*/, ''))}」後面沒有 A: 答案，展開會是空白`, '下一行補上 A: 答案');
            inlineChecks(k, t.replace(/^- Q:\s*/, ''));
          } else if (/^A:/.test(t)) {
            if (!awaitingA) add(k, 'invalid-value', '這個 A: 前面沒有對應的 `- Q: 問題`（或那題已經有答案了），不會顯示', '在上一行補 - Q: 問題');
            awaitingA = false;
            inlineChecks(k, t.replace(/^A:\s*/, ''));
          } else {
            add(k, 'invalid-value', 'Q&A 只認 `- Q: 問題` 與下一行 `A: 答案`（各一行），這行不會顯示');
          }
        });
        return;
      }

      case 'lab-session':
        for (const k of body) {
          const t = lines[k].trim();
          if (/^- /.test(t)) inlineChecks(k, t.slice(2));
          else add(k, 'invalid-value', '實作區塊只顯示 `- ` 開頭的任務行，這行會被略過；說明文字請放進 hint="…" 屬性');
        }
        return;

      case 'feedback':
        for (const k of body) {
          const t = lines[k].trim();
          const head = t.match(/^([A-Za-z]+)\s*[:：](?!\/\/)/); // 排除 https:// 這類網址
          // 只有和面板名相近（多半是拼錯）才報；Note: 說明、AI：… 這類一般說明行照常當文字顯示
          const guess = head && !FEEDBACK_PANELS.includes(head[1]) ? closest(head[1], FEEDBACK_PANELS) : null;
          if (guess) {
            add(k, 'invalid-value', `回饋面板「${head[1]}」不認得，這行會被當成一般說明文字；可用 stats／bars／compare／quotes／changes`,
              `改成 ${guess}:`);
          }
          inlineChecks(k, t);
        }
        return;

      case 'interactive':
      case 'warning':
        textLines();
        return;

      case 'survey':
        if (!attrs.url && !attrPresent(open, 'url')) {
          add(start, 'missing-attr', '[survey] 沒有 url，問卷頁不會出現填寫按鈕', '寫成 [survey title="…" url="https://forms.gle/…"]');
        }
        return;

      default:
        // bonus（前端 renderMd 渲染）：不檢查內文
        return;
    }
  }

  function findClose(def, i) {
    if (def.close === '```') {
      const idx = findFenceClose(lines, i);
      return idx < lines.length ? idx : -1;
    }
    for (let j = i + 1; j < lines.length; j++) {
      if (lines[j].trim().startsWith(def.close)) return j;
    }
    return -1;
  }

  // ── 全文：殘留 TODO（不論在哪個區塊裡都要清） ──
  lines.forEach((l, idx) => {
    const m = l.match(/<!--\s*TODO\b.*?(?:-->|$)/i);
    if (m) add(idx, 'todo-left', `殘留 TODO 註解「${snip(m[0], 30)}」，上線前請補完或刪除`);
    const cc = [...new Set(l.match(CONTROL_CHAR_RE) || [])];
    if (cc.length) {
      const codes = cc.map(c => 'U+' + c.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')).join('、');
      add(idx, 'control-char', `這行有看不見的控制字元（${codes}），會原樣進 HTML，可能讓複製貼上或搜尋出錯；多半是從終端機或其他文件貼過來的`, '刪掉這些字元');
    }
  });

  // ── 結構掃描 ──

  let inComment = false;
  let cardScope = false;     // 在 ### 卡片的群組內（render 的 groupBlocks 會把後續區塊收進卡片，直到下一個 ###／##）
  let list = null;           // 清單脈絡：{ l1 } 第二層縮排基準；空行不中斷、縮排續行屬於清單
  let subTitles = new Map(); // 本章節 ## 標題 → [{ line, run }]
  let tabRun = null;         // 目前 ## 分頁群組編號（null＝不在群組內）
  let runSeq = 0;
  let seenSection = false;   // 遇過第一個 # 了嗎（之前的內容會落在 header 區）
  const sectionTitles = new Map(); // # 章節標題 → 第一次出現的行
  let i = 0;

  outer:
  while (i < lines.length) {
    const line = lines[i];
    const t = line.trim();

    // HTML 註解（作者暫時藏起來的內容）不檢查
    if (inComment) { if (t.includes('-->')) inComment = false; i++; continue; }
    if (t.startsWith('<!--')) { if (!t.includes('-->')) inComment = true; i++; continue; }

    if (t === '') { i++; continue; }
    if (/^---\s*$/.test(t)) { list = null; i++; continue; }

    // ── # 主章節 ──
    if (/^# /.test(line)) {
      const title = line.replace(/^# /, '').trim();
      headingCommon(i, title);
      const bare = title.replace(BRANCH_RE, '').trim();
      // 「emoji＋空白＋文字」開頭的附加單元（課後問題、補充資料）不編號，也不要求冒號式命題（與 parse.mjs 同一條判定）
      const im = bare.match(SECTION_ICON_RE);
      if (!im && !/[：:]/.test(bare)) {
        add(i, 'section-no-colon', `主章節「${snip(bare)}」建議寫成冒號式命題「標籤：一句賣點」，側欄才會顯示短標籤`, '例：# 常見痛點：穩定性不足、難以維護');
      }
      checkEmptyHeading(i, bare, '章節標題');
      const key = (im ? im[2] : bare).trim();
      if (!isEmptyTitle(key)) {
        if (sectionTitles.has(key)) {
          add(i, 'duplicate-heading', `已有同名章節「${snip(key)}」（第 ${sectionTitles.get(key) + 1} 行），目錄會出現兩筆一樣的條目、錨點會變成 -2`, '改成不同的章節標題');
        } else {
          sectionTitles.set(key, i);
        }
      }
      seenSection = true;
      subTitles = new Map();
      tabRun = null;
      cardScope = false;
      list = null;
      i++;
      // 章節 lead：緊接在 # 後面的 `> `（非 `> **`）行
      while (i < lines.length && /^> /.test(lines[i]) && !/^> \*\*/.test(lines[i])) {
        inlineChecks(i, lines[i].replace(/^> /, ''));
        i++;
      }
      continue;
    }

    // ── ## 小節 ──
    if (/^## /.test(line)) {
      let title = line.replace(/^## /, '').trim();
      headingCommon(i, title);
      title = title.replace(BRANCH_RE, '').trim();
      const st = splitTab(i, title);
      title = st.title;
      let run = null;
      if (st.tab) {
        if (tabRun === null) tabRun = ++runSeq;
        run = tabRun;
      } else {
        tabRun = null;
      }
      inlineChecks(i, title);
      checkEmptyHeading(i, title, '小節標題');
      const prev = subTitles.get(title) || [];
      const clash = !isEmptyTitle(title) && prev.find(p => !(p.run !== null && p.run === run));
      if (clash) {
        add(i, 'duplicate-heading', `同一章節已有「${snip(title)}」小節（第 ${clash.line + 1} 行），目錄會出現兩筆一樣的條目、深連結也分不清`,
          '改成不同的標題，或用 ## [工具名] 標題 做成分頁');
      }
      prev.push({ line: i, run });
      subTitles.set(title, prev);
      cardScope = false;
      list = null;
      i++;
      continue;
    }

    // ── 容器區塊（[flow]…[/flow]、```prompt…```、[html]…[/html] …） ──
    for (const def of CONTAINER_BLOCKS) {
      if (!def.test(line, lines[i + 1])) continue;
      if (def.needsClose && !def.needsClose(line, lines, i)) break; // 單行形式（[youtube id=…]）交給下方
      const closeIdx = findClose(def, i);
      list = null;
      if (def.fullPage && !seenSection) {
        add(i, 'fullpage-before-section', `全版區塊 [${blockTag(def)}] 放在第一個 # 章節之前，會落在頁首區：網頁上不會自成一頁，列印與簡報模式也不會出現`,
          '移到第一個 # 章節底下（要當開場就放在第一章開頭）');
      }
      if (closeIdx < 0) {
        add(i, 'unclosed-container', `「${snip(t, 30)}」沒有對應的 ${def.close}，後面的內容會被整段吞掉`, `在區塊結尾補一行 ${def.close}`);
        i++;
        continue outer;
      }
      inspectContainer(def, i, closeIdx);
      if (def.fullPage) cardScope = false; // 全版區塊會切開 section，之後的內容不再屬於前一張卡
      i = closeIdx + 1;
      continue outer;
    }

    // 不支援的 fence（```js、裸 ```）：parser 會把整段當成一般段落
    if (/^```/.test(t)) {
      const lang = (t.match(/^```(\S*)/) || [])[1] || '';
      let j = i + 1;
      while (j < lines.length && lines[j].trim() !== '```') j++;
      add(i, 'unknown-tag', lang
        ? `\`\`\`${lang} 不是支援的程式碼區塊（只認 prompt／terminal／code），整段會被當成一般段落`
        : '沒標語言的 ``` 不會變成程式碼區塊，整段會被當成一般段落',
      lang ? t.replace('```' + lang, '```code') : '改成 ```code、```prompt 或 ```terminal');
      if (j >= lines.length) {
        // 常見成因：```prompt 裡想放巢狀 ```json，但巢狀的 ``` 沒配對，外層在第一個裸 ``` 就收尾
        add(i, 'unclosed-container', `「${snip(t, 30)}」後面沒有對應的 \`\`\`；如果它是上一個 prompt／code 區塊裡的巢狀程式碼，那個區塊已經提早結束了`,
          '補齊巢狀與外層的 ```（巢狀一組、外層一個）');
      }
      list = null;
      i = j < lines.length ? j + 1 : i + 1;
      continue;
    }

    // ── 單行區塊 ──
    if (/^\[html\s/.test(t)) {
      const m = line.match(/^\[html\s+src="([^"]+)"\]\s*$/);
      if (!m) {
        add(i, 'invalid-value', '[html …] 要寫成單獨一行的 [html src="檔名.html"]，目前這行會原樣顯示成文字');
      } else if (courseDir && !isFile(resolve(courseDir, m[1]))) {
        add(i, 'html-src-missing', `[html src] 指向的檔案不存在：${m[1]}（路徑相對於課程目錄），這段會整個消失`);
      }
      list = null;
      i++;
      continue;
    }

    if (/^\[youtube/.test(t)) {
      checkAttrQuotes(i, line);
      if (!parseAttrs(line).id && !attrPresent(line, 'id')) {
        add(i, 'missing-attr', '[youtube] 沒有 id，整段影片不會顯示', '寫成 [youtube id="影片ID"]（網址 watch?v= 後面那串）');
      }
      list = null;
      i++;
      continue;
    }

    if (/^\[download\b/.test(t)) {
      checkAttrQuotes(i, line);
      const a = parseAttrs(line);
      if (!a.dir && !a.file) {
        if (!attrPresent(line, 'dir') && !attrPresent(line, 'file')) {
          add(i, 'missing-attr', '[download] 要有 dir="example 底下的資料夾" 或 file="assets/檔名"，否則整張下載卡不會出現');
        }
      } else if (courseDir) {
        if (a.dir) {
          const d = join(courseDir, 'example', a.dir);
          if (!isDir(d)) {
            add(i, 'download-target-missing', `找不到 example/${a.dir}/ 資料夾，build 不會打包出 assets/${a.dir}.zip，下載連結會 404`);
          } else if (!hasFiles(d)) {
            add(i, 'download-target-missing', `example/${a.dir}/ 是空資料夾，不會產生 zip，下載連結會 404`);
          }
        }
        if (a.file && !/^https?:\/\//i.test(a.file)) {
          const zm = a.file.match(/^assets\/([^/]+)\.zip$/);
          const fromExample = zm && isDir(join(courseDir, 'example', zm[1]));
          if (!fromExample && !isFile(resolve(courseDir, a.file))) {
            add(i, 'download-target-missing', `file="${a.file}" 這個檔案不存在（路徑相對於課程目錄），下載連結會 404`);
          }
        }
      }
      list = null;
      i++;
      continue;
    }

    if (/^\[pr\b/.test(t)) {
      checkAttrQuotes(i, line);
      const a = parseAttrs(line);
      const miss = ['from', 'to'].filter(k => !a[k] && !attrPresent(line, k));
      if (miss.length) {
        add(i, 'missing-attr', `[pr] 缺 ${miss.join('、')}，分支路線會是空白的 chip`, '寫成 [pr from="feature/x" to="main"]');
      }
      if (a.status !== undefined && !PR_STATUS.includes(a.status.toLowerCase())) {
        add(i, 'invalid-value', `[pr] status="${a.status}" 不認得，狀態標籤不會顯示；可用 merged／open／draft／closed`);
      }
      list = null;
      i++;
      continue;
    }

    if (IMAGE_LINE_RE.test(t)) {
      inlineChecks(i, t, { lt: false }); // alt 文字會被跳脫
      list = null;
      i++;
      continue;
    }

    // 表格：表頭＋分隔列，之後連續含 | 的行
    if (line.includes('|') && isTableSeparator(lines[i + 1])) {
      const header = tableCells(line);
      header.forEach((cell) => {
        const wm = cell.match(TABLE_WIDTH_MARK);
        if (!wm) return;
        let v = wm[1].trim();
        if (/^\d+(?:\.\d+)?$/.test(v)) v += 'px';
        if (!/^(auto|\d+(?:\.\d+)?(px|%|rem|em|ch))$/.test(v)) {
          add(i, 'invalid-value', `表格欄寬 [width:${wm[1]}] 不合法，會原樣顯示在表頭；可用數字（px）、%、rem、em、ch 或 auto`);
        }
      });
      inlineChecks(i, line);
      let j = i + 2;
      let ragged = 0;
      let firstRagged = -1;
      while (j < lines.length && lines[j].trim() !== '' && lines[j].includes('|')) {
        if (tableCells(lines[j]).length !== header.length) {
          ragged++;
          if (firstRagged < 0) firstRagged = j;
        }
        inlineChecks(j, lines[j]);
        j++;
      }
      if (ragged) {
        add(firstRagged, 'table-ragged', `表格有 ${ragged} 列的欄數和表頭（${header.length} 欄）不一樣，多的欄會被丟掉、少的會補空白`);
      }
      if (j === i + 2) add(i, 'empty-block', '表格只有表頭、沒有任何資料列', '在分隔列下面補上資料列，或把整個表格刪掉');
      list = null;
      i = j;
      continue;
    }

    // ── ### 卡片 ──
    if (/^### /.test(line)) {
      let title = line.replace(/^### /, '').trim();
      headingCommon(i, title);
      title = title.replace(BRANCH_RE, '').trim();
      const st = splitTab(i, title);
      title = st.title;
      if (st.tab && tabRun !== null) {
        add(i, 'nested-tabs', `## 分頁裡的 ### [${st.tab}] 不會再形成第二層分頁，只會變成一般卡片（列印／簡報模式多一個 chip）`,
          '改用不同的 ## 分頁，或拿掉 ### 的 [標記]');
      }
      if (!CARD_ICON_RE.test(title)) {
        add(i, 'card-no-emoji', `卡片標題「${snip(title)}」沒有 emoji 開頭，標題列會少了圖示`, `標題前加 emoji，例：🎯 ${snip(title)}`);
      }
      checkEmptyHeading(i, title, '卡片標題');
      inlineChecks(i, title);
      cardScope = true;
      list = null;
      i++;
      continue;
    }

    if (/^#### /.test(line)) {
      inlineChecks(i, line.replace(/^#### /, ''));
      checkEmptyHeading(i, line.replace(/^#### /, ''), '#### 標題');
      list = null;
      i++;
      continue;
    }

    // ── 引言／洞察框（連續的 > 行，含 > ```lang 程式碼） ──
    if (/^>/.test(line)) {
      const runStart = i;
      let fenceAt = -1; // 未收尾的 > ```lang 所在行
      let hasText = false;
      // 洞察框標題要成對的 **（blocks.mjs insight）；不成對時整段變一般引言、星號原樣顯示
      const openBold = /^> \*\*/.test(line) && !/^> \*\*.+?\*\*/.test(line);
      if (openBold) add(i, 'unclosed-bold', '洞察框標題的 ** 沒有關閉，整段會變成一般引言、星號原樣顯示', '寫成 > **標題**');
      while (i < lines.length && /^>/.test(lines[i])) {
        const c = lines[i].replace(/^>\s?/, '');
        const ct = c.trim();
        if (ct) hasText = true;
        if (fenceAt >= 0) {
          if (ct === '```') fenceAt = -1;
        } else if (/^```/.test(ct)) {
          fenceAt = i;
          checkFenceCase(i, ct);
          checkLabelQuotes(i, ct);
        } else if (i === runStart && openBold) {
          inlineChecks(i, c, { lt: false });
          checkBareLt(i, c);
        } else {
          inlineChecks(i, c);
        }
        i++;
      }
      if (fenceAt >= 0) {
        add(fenceAt, 'unclosed-container', `引言裡的「${snip(lines[fenceAt].replace(/^>\s?/, ''), 30)}」沒有對應的 > \`\`\`，引言剩下的內容都會被當成程式碼`, '在程式碼結尾補一行 > ```');
      }
      if (!hasText) add(runStart, 'empty-block', '引言裡沒有任何文字（只有 >），頁面上會是空的引言框或一個孤零零的「>」', '補上內容，或刪掉這幾行');
      list = null;
      continue;
    }

    if (/^- \[x\]/.test(line)) {
      inlineChecks(i, t);
      i++;
      continue;
    }

    if (checkTagColor(i, t)) { i++; continue; }

    // ── 清單（含巢狀與縮排續行） ──
    const lm = line.match(/^(\s*)(\d+\.|-)\s+(.*)$/);
    if (lm && !(lm[2] === '-' && /^\[(x|green|orange|purple|blue)\]/.test(lm[3])) && (lm[1].length === 0 || list)) {
      const indent = lm[1].length;
      const kind = lm[2] === '-' ? 'ul' : 'ol';
      // 同一層混用 1. 與 -：parse 依第一項決定 ol／ul，其餘併進同一個清單（空行不會斷開）。
      // 卡片內文不是清單（1. 行是段落），不檢查；卡片空行後的清單是新的清單。
      const mixed = (prev) => {
        if (prev && prev !== kind) {
          add(i, 'list-marker-mixed', `同一層清單混用編號（1.）與符號（-），這項會被併進上面的${prev === 'ol' ? '編號' : '符號'}清單`,
            '整層改成同一種標記（清單之間空行不會斷開，要分開請在中間放段落或卡片）');
        }
      };
      if (indent === 0) {
        const card = inCardBody(i);
        const same = list && !card && !list.card;
        if (same) mixed(list.m0);
        list = { l1: -1, m0: same ? list.m0 : kind, m1: null, card };
      } else if (list.l1 === -1 || indent < list.l1) {
        list.l1 = indent;
        list.m1 = kind;
      } else if (indent > list.l1) {
        add(i, 'nested-too-deep', '清單第三層以上的縮排會被併進上一層的文字（最多兩層）', '改成兩層，或拆成另一張卡片');
      } else if (!list.card) {
        mixed(list.m1);
      }
      inlineChecks(i, lm[3]);
      i++;
      continue;
    }
    if (list && /^\s/.test(line)) { // 縮排續行
      inlineChecks(i, t);
      i++;
      continue;
    }
    list = null;

    // ── 未知 [tag]／孤兒 [/tag]（排除 Markdown 連結 [text](url)） ──
    const tagMatch = t.match(/^\[(\/?)([a-z][\w-]*)/i);
    if (tagMatch && !/^\[[^\]]*\]\(/.test(t)) {
      const [, slash, name] = tagMatch;
      if (slash) {
        // 走到這裡的 [/xxx] 都是沒有對應開頭的孤兒結尾標籤
        add(i, 'orphan-close', `[/${name}] 沒有對應的開頭標籤，會原樣顯示成文字`, `檢查上方的 [${name}] 是否拼錯，或刪掉這行`);
        i++;
        continue;
      }
      if (!KNOWN_TAGS.has(name.toLowerCase())) {
        const guess = closest(name, [...KNOWN_TAGS]);
        add(i, 'unknown-tag', `[${name}] 不是已知的區塊語法，會被當成一般文字渲染`, guess ? `是不是 [${guess}]？` : undefined);
        i++;
        continue;
      }
    }

    // ── 一般段落 ──
    inlineChecks(i, t);
    if (!cardScope) {
      add(i, 'loose-paragraph', `裸段落「${snip(t)}」不在任何卡片或元件裡，會直接貼在章節底色上`,
        '放到 ### emoji 卡片底下，或改用 > **洞察**、[warning] 等元件');
    }
    i++;
  }

  return out.sort((a, b) => a.line - b.line);
}

// 給 build 摘要用：依等級計數
export function countLevels(items) {
  const c = { error: 0, warn: 0, info: 0 };
  for (const it of items) c[it.level] = (c[it.level] || 0) + 1;
  return c;
}

// ─── 找候選課程目錄（content.md 不存在時的錯誤訊息、--all 掃描共用） ───
// 往下最多 maxDepth 層找含 content.md 的資料夾；略過 dot 目錄、node_modules、assets，
// 以及課程目錄（本身有 content.md）底下的 example/（[download] 的範例檔，不是課程）；
// 父目錄不是課程時 example/ 照常往下找（例：資料夾名稱剛好叫 example 的課程）
const SKIP_DIRS = new Set(['node_modules', 'assets']);
export function findCourseDirs(root, { maxDepth = 4, limit = 500 } = {}) {
  const found = [];
  let visited = 0;
  const walk = (dir, depth) => {
    if (found.length >= limit || visited > 5000) return;
    visited++;
    let entries;
    try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
    const isCourse = entries.some(e => e.isFile() && e.name === 'content.md');
    if (isCourse) found.push(dir);
    if (depth >= maxDepth) return;
    for (const e of entries) {
      if (!e.isDirectory() || e.name.startsWith('.') || SKIP_DIRS.has(e.name)) continue;
      if (e.name === 'example' && isCourse) continue;
      walk(join(dir, e.name), depth + 1);
    }
  };
  walk(root, 0);
  return found.sort();
}

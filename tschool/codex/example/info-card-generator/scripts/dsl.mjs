/**
 * dsl.mjs — 知識卡 Markdown DSL 轉譯器
 * 供 build.mjs / lint.mjs 共用。零 DOM 依賴，純字串函式。
 *
 * DSL 摘要：
 *   ===            分卡（獨立一行）
 *   @cover|@point|@code|@summary   卡片類型（卡片第一行）
 *   [badge] [ok] [no] [warn] [tip] [flow] [big] [stamp]  區塊元件
 *   # ## ###       標題階層
 *   > 引言 / 1. 編號盒 / - 條列盒 / ``` 程式碼視窗 / *** 分隔飾線
 *   inline：**重點** ==標記== !!衝擊!! `code`
 */

export function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function attr(s) {
  return esc(s).replace(/"/g, '&quot;');
}

/* ── Inline 記號（順序：code → hot → mark → strong）── */
export function inline(s) {
  s = esc(s);
  s = s.replace(/`([^`]+)`/g, '<code class="ic">$1</code>');
  s = s.replace(/!!([^!]+)!!/g, '<span class="hot">$1</span>');
  s = s.replace(/==([^=]+)==/g, '<mark>$1</mark>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  return s;
}

/* ── 依 code fence 狀態切卡，避免程式碼中的 === 被誤判 ── */
function splitCards(body) {
  const cards = [];
  let cur = [];
  let fence = false;
  body.split('\n').forEach((l) => {
    if (/^```/.test(l)) fence = !fence;
    if (!fence && /^===+\s*$/.test(l)) {
      cards.push(cur.join('\n'));
      cur = [];
    } else cur.push(l);
  });
  cards.push(cur.join('\n'));
  return cards.map((c) => c.trim()).filter(Boolean);
}

/**
 * parseDeck(src) → { meta, cards }
 * meta：frontmatter（title / label / ratio / theme / background，皆選填，優先於 config）
 * cards：[{ type, raw, blocks }]
 */
export function parseDeck(src) {
  const meta = {};
  src = String(src).replace(/\r/g, '');
  const fm = src.match(/^---\n([\s\S]*?)\n---\n?/);
  if (fm) {
    fm[1].split('\n').forEach((l) => {
      const m = l.match(/^(\w+):\s*(.+)$/);
      if (m) meta[m[1]] = m[2].trim();
    });
    src = src.slice(fm[0].length);
  }
  const cards = splitCards(src).map((block) => {
    const lines = block.split('\n');
    let type = 'point';
    if (/^@\w+/.test(lines[0])) {
      type = lines[0].slice(1).trim();
      lines.shift();
    }
    return { type, raw: lines.join('\n'), blocks: parseBlocks(lines) };
  });
  return { meta, cards };
}

const DIRECTIVES = /^\[(badge|ok|no|warn|tip|flow|big|stamp)\]\s*(.*)$/;

function parseBlocks(lines) {
  const B = [];
  let para = [];
  const flush = () => {
    if (para.length) {
      B.push({ t: 'p', txt: para.join('\n'), html: para.map(inline).join('<br>') });
      para = [];
    }
  };
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    const cf = l.match(/^```(.*)$/);
    if (cf) {
      flush();
      const info = cf[1].trim().split(/\s+/);
      const lang = info[0] || '';
      const file = info.slice(1).join(' ');
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) { buf.push(lines[i]); i++; }
      B.push({ t: 'code', lang, file, body: buf.join('\n') });
      continue;
    }
    if (!l.trim()) { flush(); continue; }
    const dir = l.match(DIRECTIVES);
    if (dir) { flush(); B.push({ t: dir[1], raw: dir[2], txt: dir[2] }); continue; }
    const h = l.match(/^(#{1,3})\s+(.*)$/);
    if (h) { flush(); B.push({ t: 'h' + h[1].length, txt: h[2], html: inline(h[2]) }); continue; }
    if (/^>\s?/.test(l)) {
      flush();
      const q = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) { q.push(lines[i].replace(/^>\s?/, '')); i++; }
      i--;
      B.push({ t: 'quote', txt: q.join('\n'), html: q.map(inline).join('<br>') });
      continue;
    }
    if (/^\d+\.\s/.test(l)) {
      flush();
      const it = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) { it.push(lines[i].replace(/^\d+\.\s/, '')); i++; }
      i--;
      B.push({ t: 'ol', itemsTxt: it, items: it.map(inline) });
      continue;
    }
    if (/^-\s/.test(l)) {
      flush();
      const it = [];
      while (i < lines.length && /^-\s/.test(lines[i])) { it.push(lines[i].replace(/^-\s/, '')); i++; }
      i--;
      B.push({ t: 'ul', itemsTxt: it, items: it.map(inline) });
      continue;
    }
    if (/^\*\*\*+\s*$/.test(l)) { flush(); B.push({ t: 'hr' }); continue; }
    para.push(l);
  }
  flush();
  return B;
}

/* ── 極簡語法上色（yaml / js 夠用）：key、字串、註解 ── */
function hiLine(raw) {
  let s = esc(raw);
  let com = '';
  const m = s.match(/^(.*?)(\s*(#|\/\/).*)$/);
  if (m) { s = m[1]; com = '<span class="c-com">' + m[2] + '</span>'; }
  s = s.replace(/("[^"]*"|「[^」]*」)/g, '<span class="c-str">$1</span>');
  s = s.replace(/^(\s*-?\s*)([\w\u4e00-\u9fff_.\-]+)(\s*:)/, '$1<span class="c-key">$2</span>$3');
  return s + com;
}

function codeHTML(b) {
  const body = b.body.split('\n').map(hiLine).join('\n');
  const fname = b.file || b.lang || 'code';
  return `<div class="codewin"><div class="chead"><i></i><i></i><i></i><span class="fname">${esc(fname)}</span></div><pre>${body}</pre></div>`;
}

function renderBlock(b) {
  switch (b.t) {
    case 'p': return `<p>${b.html}</p>`;
    case 'h1': return `<h1>${b.html}</h1>`;
    case 'h2': return `<h2>${b.html}</h2>`;
    case 'h3': return `<h3>${b.html}</h3>`;
    case 'badge': return `<div class="badge">${inline(b.raw)}</div>`;
    case 'big': return `<div class="bigline">${inline(b.raw)}</div>`;
    case 'stamp': return `<div class="stamp">${inline(b.raw)}</div>`;
    case 'ok':
    case 'no':
      return `<div class="call ${b.t}"><span class="icx">${b.t === 'ok' ? '✓' : '✕'}</span><div>${inline(b.raw)}</div></div>`;
    case 'warn': return `<div class="note warn"><span class="em">⚠️</span><div>${inline(b.raw)}</div></div>`;
    case 'tip': return `<div class="note tip"><span class="em">💡</span><div>${inline(b.raw)}</div></div>`;
    case 'flow': {
      const parts = b.raw.split(/->/).map((s) => s.trim()).filter(Boolean);
      // 依「視覺寬度」決定橫排（rail）或兩欄 stepper（stack）：
      // CJK 一字 ≈ 29px、拉丁／數字 ≈ 16px；每格固定開銷（內距＋編號圓）≈ 120px；格與格之間箭頭區 36px。
      // 內容區寬 1080 − 92×2 = 896px；估算總寬放得下就橫排，否則轉 stepper。
      const estW = (label) => [...label].reduce((w, ch) => w + (/[\u2E80-\u9FFF\uF900-\uFAFF\uFF00-\uFFEF]/.test(ch) ? 29 : 16), 0) + 120;
      const total = parts.reduce((w, p) => w + estW(p.replace(/^\*/, '').trim()), 0) + (parts.length - 1) * 36;
      const layout = total <= 896 ? 'rail' : 'stack';
      return `<div class="flow flow-${layout}">` + parts.map((p, k) => {
        const hot = p.startsWith('*');
        const label = esc(hot ? p.slice(1).trim() : p);
        return `<span class="step${hot ? ' hotstep' : ''}"><span class="num">${k + 1}</span><span class="chip">${label}</span></span>`;
      }).join('') + '</div>';
    }
    case 'ol': return `<ol>${b.items.map((x) => `<li>${x}</li>`).join('')}</ol>`;
    case 'ul': return `<ul>${b.items.map((x) => `<li>${x}</li>`).join('')}</ul>`;
    case 'quote': return `<blockquote>${b.html}</blockquote>`;
    case 'hr': return '<div class="orn"><i></i><span>✦</span><i></i></div>';
    case 'code': return codeHTML(b);
    default: return '';
  }
}

function visualDensity(card) {
  if (card.type === 'cover') return 'hero';
  if (card.type === 'code') return 'dense';
  const len = charCount(cardText(card));
  const liWeight = card.type === 'summary' ? 30 : 18;   // 結尾卡的自檢清單通常一行一項，佔高比字數多
  const structuralWeight = card.blocks.reduce((sum, b) => {
    if (b.t === 'ol' || b.t === 'ul') return sum + (b.items?.length || 0) * liWeight;
    if (b.t === 'flow') return sum + 24;
    if (b.t === 'quote' || b.t === 'ok' || b.t === 'no' || b.t === 'warn' || b.t === 'tip') return sum + 16;
    return sum;
  }, 0);
  const load = len + structuralWeight;
  if (load <= 115) return 'airy';
  if (load <= 185) return 'balanced';
  return 'dense';
}

function rhythmRole(card, i) {
  if (card.type === 'cover' || card.type === 'summary') return card.type;
  if (card.blocks.some((b) => b.t === 'big' || b.t === 'quote')) return 'punch';
  if (card.blocks.some((b) => b.t === 'flow')) return 'flow';
  if (card.blocks.some((b) => b.t === 'ol' || b.t === 'ul')) return 'list';
  if (card.blocks.some((b) => b.t === 'ok' || b.t === 'no')) return 'contrast';
  return i % 2 ? 'plain' : 'panel';
}

function coverVisualHTML(ctx) {
  if (ctx.layout?.coverVisual !== 'pain-flow') return '';
  const steps = (ctx.layout.coverSteps?.length ? ctx.layout.coverSteps : ['翻規範', '問前輩', '被退件'])
    .map((s) => String(s).trim()).filter(Boolean).slice(0, 4);
  if (!steps.length) return '';
  return `<div class="cover-visual" aria-hidden="true">${steps.map((s, i) => {
    const isLast = i === steps.length - 1;
    return `${i ? '<i>→</i>' : ''}<span class="${isLast ? 'bad' : ''}">${inline(s)}</span>`;
  }).join('')}</div>`;
}

/** 單張卡片 → HTML（含底部標示與進度點；label 為空時只顯示進度點） */
export function cardHTML(card, i, n, ctx) {
  const inner = card.blocks.map(renderBlock).join('');
  const coverVisual = card.type === 'cover' ? coverVisualHTML(ctx) : '';
  const label = ctx.label ? `<span class="hd">${esc(ctx.label)}</span>` : '<span class="hd"></span>';
  const dots = Array.from({ length: n }, (_, k) => `<i class="${k === i ? 'on' : ''}"></i>`).join('');
  return `<article class="card t-${attr(card.type)} r-${rhythmRole(card, i)}" data-i="${i + 1}" data-bg="${attr(ctx.background || 'halo')}" data-density="${visualDensity(card)}" data-mode="${attr(ctx.layout?.mode || 'tutorial')}" data-rhythm="${attr(ctx.layout?.rhythm || 'steady')}">
<div class="bgfx"></div>
<div class="inner">${coverVisual}${inner}</div>
<footer class="foot">${label}<span class="dots">${dots}</span></footer>
</article>`;
}

/* ── Lint 用：卡片純文字（計字規則）──
 * 納入：h1/h2/h3、段落、引言、清單項、ok/no/warn/tip/big/stamp、flow 節點
 * 排除：badge（裝飾標籤）、code 內容（程式碼不計字）
 */
const demark = (s) => String(s).replace(/!!|==|\*\*|`/g, '');

export function cardText(card) {
  const parts = [];
  for (const b of card.blocks) {
    switch (b.t) {
      case 'h1': case 'h2': case 'h3': case 'p': case 'quote': case 'big': case 'stamp':
        parts.push(demark(b.txt)); break;
      case 'ok': case 'no': case 'warn': case 'tip':
        parts.push(demark(b.raw)); break;
      case 'flow':
        parts.push(demark(b.raw.replace(/->/g, ' ').replace(/\*/g, ''))); break;
      case 'ol': case 'ul':
        parts.push(...b.itemsTxt.map(demark)); break;
      default: break;
    }
  }
  return parts.join('\n');
}

/** 去空白字元數（中英混排以字元計） */
export function charCount(s) {
  return [...String(s).replace(/\s+/g, '')].length;
}

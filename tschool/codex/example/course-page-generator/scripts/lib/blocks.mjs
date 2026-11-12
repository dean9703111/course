// ─── Block Registry：content.md 區塊元件的單一擴充點 ───
//
// 每種區塊元件 = 一個 registry 物件，集中宣告：
//   name     產出的 block.type
//   phase    'pre-card'：在 ### 卡片判斷之前檢查（youtube/image/table 等）
//            'post-card'：在 ### 卡片判斷之後檢查（多數 [tag] 區塊）
//   test     (line, nextLine) => 此行是否為該區塊起點（語意須與 parse 一致）
//   parse    (lines, i) => { block|null, nextIdx }（block 為 null 表示消耗了行但不輸出）
//   render   (block) => HTML 字串
//   fullPage 全版區塊（qa/lab/survey/interactive）：{ pageClass, suffix }
//   close    容器結尾標籤（lint 用）；needsClose(line) 可宣告「此起點行是否需要結尾」
//
// 新增元件時：在此檔加一個物件即可 —— 卡片（###）的終止條件、全版切頁、
// lint 的已知標籤清單都會自動涵蓋，不需要再改 parse/render 的其他地方。

import { esc, raw, inlineFormat, inlineFormatWithBreaks, parseAttrs, branchColorKey, tabTag, EMOJI_ICON_SRC } from './text.mjs';

// [case] 標題開頭的 emoji 圖示（與 ### 卡片同一套 emoji 序列判定，🛡️ 的 U+FE0F 不會殘留在標題文字）
const CASE_ICON_RE = new RegExp(`^(${EMOJI_ICON_SRC})\\s*(.*)`, 'u');

// ── 共用：prompt/code 區塊 ──

// blockquote 內 fenced code 的 header 類型判斷（沿用 prompt block 的啟發式）
function codeFenceHeaderType(lang, body) {
  const isTerminal = /^(npm |npx |pnpm |yarn |openspec |git |docker |curl |wget |brew |apt |pip |cargo |cd |ls |mkdir |rm |cat |echo |\/init)/.test(body.trim());
  if (lang === 'terminal') return 'Terminal';
  if (lang === 'code') return 'Code';
  if (lang === 'prompt') return isTerminal ? 'Terminal' : 'Prompt';
  if (lang) return 'Code';
  return isTerminal ? 'Terminal' : 'Code';
}

// ── prompt/terminal/code 區塊的巢狀 fence 支援 ──
// 區塊主體允許再放 ``` fence（例：prompt 裡示範另一段 prompt）。
// 裸 ``` 的角色判定（巢狀起點 vs 外層收尾）：往後掃描，若在遇到
// 標題／分隔線／其他區塊起點之前還有 ≥2 個裸 ```（巢狀收尾＋外層收尾），
// 視為巢狀起點；否則就是外層收尾。判定失敗時退回「第一個 ``` 收尾」的舊行為。
function isNestedFenceOpener(lines, i) {
  let bareCount = 0;
  for (let j = i + 1; j < lines.length; j++) {
    const t = lines[j].trim();
    if (t === '```') {
      bareCount++;
      if (bareCount >= 2) return true;
      continue;
    }
    if (/^```\S/.test(t)) return false;
    if (/^#{1,4} /.test(lines[j]) || /^---\s*$/.test(t)) return false;
    if (isBlockStart(lines[j], lines[j + 1])) return false;
  }
  return false;
}

// 回傳 fence 區塊外層收尾 ``` 的行號（i 為 ```lang 起始行）；未收尾時回傳 lines.length。
// 帶語言的 ```lang 行一律視為巢狀起點，其後第一個裸 ``` 收巢狀。
export function findFenceClose(lines, i) {
  let inner = false;
  let j = i + 1;
  for (; j < lines.length; j++) {
    const t = lines[j].trim();
    if (t === '```') {
      if (inner) { inner = false; continue; }
      if (isNestedFenceOpener(lines, j)) { inner = true; continue; }
      return j;
    }
    if (!inner && /^```\S/.test(t)) inner = true;
  }
  return j;
}

export function renderPromptBlock(block) {
  return `<div class="prompt-block">
      <div class="prompt-header">
        <div class="dots"><span></span><span></span><span></span></div>
        ${block.headerType}
        <span class="label">${esc(block.label || '')}</span>
        <button class="copy-btn" aria-label="複製" onclick="copyPrompt(this)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        </button>
      </div>
      <div class="prompt-body">${esc(block.body)}</div>
    </div>`;
}

// ── 共用：insight（blockquote）主體解析 ──

// 解析 blockquote 主體（連續 `>` 行）為有序 parts（para / code / bullets）。
// firstLine：起始段落文字（title 行剩餘文字或純引言首行）。
// enableBullets：true 時 `- ` 收為 bullets part（帶標題 insight）；false 維持純文字行為。
function parseInsightBody(lines, startIdx, firstLine, enableBullets) {
  const parts = [];
  let para = firstLine || '';
  let i = startIdx;

  const flushPara = () => {
    const t = para.trim();
    if (t) parts.push({ type: 'para', html: inlineFormatWithBreaks(t) });
    para = '';
  };

  const pushBullet = (text) => {
    const last = parts[parts.length - 1];
    if (last && last.type === 'bullets') last.items.push(text);
    else parts.push({ type: 'bullets', items: [text] });
  };

  while (i < lines.length && /^>/.test(lines[i])) {
    const content = lines[i].replace(/^>\s?/, '').trim();

    const fence = content.match(/^```(\w*)/);
    if (fence) {
      flushPara();
      const lang = (fence[1] || '').toLowerCase();
      const labelMatch = content.match(/\[label="([^"]+)"\]/);
      const label = labelMatch ? labelMatch[1] : '';
      let body = '';
      i++;
      while (i < lines.length && /^>/.test(lines[i])) {
        const inner = lines[i].replace(/^>\s?/, '');
        if (inner.trim() === '```') { i++; break; }
        body += (body ? '\n' : '') + inner;
        i++;
      }
      parts.push({ type: 'code', body, headerType: codeFenceHeaderType(lang, body), label });
      continue;
    }

    if (content === '') {
      flushPara();
    } else if (enableBullets && /^- /.test(content)) {
      flushPara();
      pushBullet(inlineFormat(content.replace(/^- /, '').trim()));
    } else {
      para += (para ? '\n' : '') + content;
    }
    i++;
  }
  flushPara();
  return { parts, nextIdx: i };
}

// ── 共用：Markdown 表格 ──

function isMarkdownTableSeparator(line) {
  const trimmed = (line || '').trim();
  if (!trimmed.includes('|')) return false;
  const cells = trimmed.replace(/^\||\|$/g, '').split('|').map(cell => cell.trim());
  return cells.length > 0 && cells.every(cell => /^:?-{3,}:?$/.test(cell));
}

export function isMarkdownTableHeader(line, nextLine) {
  return !!line && !!nextLine && line.includes('|') && isMarkdownTableSeparator(nextLine);
}

function parseMarkdownTableRow(line) {
  return line.trim().replace(/^\||\|$/g, '').split('|').map(cell => cell.trim());
}

function parseMarkdownTableAlignments(line) {
  return parseMarkdownTableRow(line).map(cell => {
    const isLeft = cell.startsWith(':');
    const isRight = cell.endsWith(':');
    if (isLeft && isRight) return 'center';
    if (isRight) return 'right';
    return 'left';
  });
}

// 表格欄寬標記：標題儲存格尾附 [width:120]（裸數字＝px，也接受 %／rem／em／ch）
// 例：| 指令[width:120] | 說明 | → 第一欄 120px，未標的欄一律 auto。
// 值不合法時不視為標記，原樣留在標題文字裡讓作者看見。
const TABLE_WIDTH_MARK = /\s*\[width\s*[:：]\s*([^\]]+)\]\s*/i;

function extractHeaderWidth(cell) {
  const m = cell.match(TABLE_WIDTH_MARK);
  if (!m) return { text: cell, width: null };
  let v = m[1].trim();
  if (/^\d+(?:\.\d+)?$/.test(v)) v += 'px';
  if (!/^(auto|\d+(?:\.\d+)?(px|%|rem|em|ch))$/.test(v)) return { text: cell, width: null };
  return { text: cell.replace(TABLE_WIDTH_MARK, '').trim(), width: v };
}

// 第一欄是列標籤：自動粗體。儲存格用 <br> 分行時只粗體第一行（第二行起是補充說明）；
// 第一行已含 <strong>（作者手寫 **…**）或是空的就原樣保留，不重複包。
const TABLE_CELL_BREAK = /<br\s*\/?>/i;

export function boldTableLabel(html) {
  const m = html.match(TABLE_CELL_BREAK);
  const first = m ? html.slice(0, m.index) : html;
  if (!first.trim() || /<strong>/i.test(first)) return html;
  return `<strong>${first}</strong>${m ? html.slice(m.index) : ''}`;
}

// ── 共用：課程時間軸 ──

function isClassTimelineLine(line) {
  const trimmed = (line || '').trim();
  if (!trimmed || trimmed.startsWith('|') || !trimmed.includes('|')) return false;
  const cells = trimmed.split('|').map(cell => cell.trim());
  if (cells.length < 2) return false;
  const dateOk = /^\d{1,2}\s*\/\s*\d{1,2}(?:\s*[（(][^）)]+[）)])?$/.test(cells[0]);
  const timeOk = /\d{1,2}:\d{2}\s*(?:~|-|–|—|到|至)\s*\d{1,2}:\d{2}/.test(cells[1]);
  return dateOk && timeOk;
}

function parseClassTimelineLine(line, index) {
  const cells = line.trim().split('|').map(cell => cell.trim());
  const parsedDate = parseTimelineDate(cells[0]);
  return {
    index,
    date: parsedDate.date,
    weekday: parsedDate.weekday,
    time: cells[1] || '',
    des: cells.slice(2).join(' | ').trim(),
  };
}

function assignTimeItemField(item, key, value) {
  const normalizedKey = key.toLowerCase();
  const cleanValue = value.trim();

  if (normalizedKey === 'date') {
    const parsed = parseTimelineDate(cleanValue);
    item.date = parsed.date;
    if (parsed.weekday && !item.weekday) item.weekday = parsed.weekday;
  } else if (normalizedKey === 'weekday' || normalizedKey === 'day') {
    item.weekday = cleanValue;
  } else if (normalizedKey === 'time') {
    item.time = cleanValue;
  } else if (normalizedKey === 'des' || normalizedKey === 'desc' || normalizedKey === 'description'
    || normalizedKey === 'title' || normalizedKey === 'topic') {
    item.des = cleanValue;
  } else if (normalizedKey === 'link' || normalizedKey === 'url' || normalizedKey === 'href') {
    const md = cleanValue.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (md) item.link = { text: md[1].trim(), url: md[2].trim() };
    else if (cleanValue) item.link = { text: '', url: cleanValue };
  } else if (normalizedKey === 'label') {
    item.label = cleanValue;
  } else if (normalizedKey === 'marker') {
    item.marker = cleanValue;
  } else if (normalizedKey === 'status' || normalizedKey === 'state') {
    const v = cleanValue.toLowerCase();
    if (v === 'past' || v === 'done' || v === 'completed' || v === 'finished') item.status = 'past';
    else if (v === 'current' || v === 'now' || v === 'active') item.status = 'current';
    else if (v === 'upcoming' || v === 'future' || v === 'next' || v === 'todo') item.status = 'upcoming';
  } else if (normalizedKey === 'active' || normalizedKey === 'current' || normalizedKey === 'now' || normalizedKey === 'here') {
    const v = cleanValue.toLowerCase();
    item.active = !(v === 'false' || v === 'no' || v === '0' || v === 'off');
  }
}

function resolveTimelineStatus(items) {
  if (!items || items.length === 0) return;
  const explicit = items.some(it => it.status);
  if (explicit) return;
  const activeIdx = items.findIndex(it => it.active);
  if (activeIdx < 0) return;
  items.forEach((it, idx) => {
    if (idx < activeIdx) it.status = 'past';
    else if (idx === activeIdx) it.status = 'current';
    else it.status = 'upcoming';
  });
}

function parseTimelineDate(value) {
  const dateMatch = value.match(/^(\d{1,2})\s*\/\s*(\d{1,2})(?:\s*[（(]([^）)]+)[）)])?$/);
  return {
    date: dateMatch ? `${dateMatch[1]}/${dateMatch[2]}` : value,
    weekday: dateMatch && dateMatch[3] ? dateMatch[3].trim() : '',
  };
}

function statusLabel(status) {
  if (status === 'past') return '已完成';
  if (status === 'current') return '進行中';
  if (status === 'upcoming') return '即將開始';
  return '';
}

function formatWeekdayLabel(weekday) {
  if (!weekday) return '';
  if (/^(週|周|星期|禮拜)/.test(weekday)) return weekday;
  if (/^[日一二三四五六天]$/.test(weekday)) return `週${weekday}`;
  return weekday;
}

// ── 共用：youtube 區塊形式判定 ──
// 區塊形式 = 開頭行未以 ] 完整收尾，或往後掃描時「在遇到任何其他區塊/標題之前」
// 存在配對的 [/youtube]。parse 與 lint 共用此判斷，行為才會一致。
function hasYoutubeBlockClose(lines, i) {
  if (!/^\[youtube\b[^\]]*\]\s*$/.test(lines[i].trim())) return true; // 開頭行未完整收尾 → 一定是區塊形式
  for (let j = i + 1; j < lines.length; j++) {
    const t = lines[j].trim();
    if (/^\[\/youtube\]/.test(t)) return true;
    if (t === '') continue;
    if (/^#{1,4} /.test(lines[j]) || /^---\s*$/.test(t)) return false;
    if (isBlockStart(lines[j], lines[j + 1])) return false;
  }
  return false;
}

// ── [interactive] 講師話術：一般文字保留換行；連續的「- 」行渲染為條列 ──
function renderInteractiveScript(script) {
  const segments = [];
  for (const line of script.split('\n')) {
    const m = line.match(/^\s*- (.*)$/);
    const kind = m ? 'list' : 'text';
    const last = segments[segments.length - 1];
    if (!last || last.kind !== kind) segments.push({ kind, lines: [] });
    segments[segments.length - 1].lines.push(m ? m[1] : line);
  }
  return segments.map((seg) => {
    if (seg.kind === 'list') {
      return `<ul class="interactive-script__list">${seg.lines.map((t) => `<li>${inlineFormat(t)}</li>`).join('')}</ul>`;
    }
    // 條列前後的空行由清單本身的間距取代，避免多出一行空白
    const lines = seg.lines.slice();
    while (lines.length && lines[0].trim() === '') lines.shift();
    while (lines.length && lines[lines.length - 1].trim() === '') lines.pop();
    return lines.length ? inlineFormatWithBreaks(lines.join('\n')) : '';
  }).join('');
}

// ── [feedback] 回饋儀表板：面板渲染（stats / bars / compare / quotes / changes） ──
// 圖表全以 CSS 繪製（寬度走 --w 變數），不依賴外部函式庫，並跟著主題色與深淺色切換。

function fbPct(value, max) {
  return max > 0 ? Math.max(0, Math.min(100, value / max * 100)).toFixed(1) : '0';
}

// 「8.9 小時」→ 數字放大、單位縮小；「2.1 → 3.3」「8／9 人」也適用
function fbStatValue(value) {
  const m = value.match(/^([+\-−]?[\d.,]+(?:\s*[／/→~～]\s*[\d.,]+)?)\s*(.*)$/);
  if (!m) return inlineFormat(value);
  const num = esc(m[1]).replace(/\s*([／/→~～])\s*/g, '<span class="fb-stat-sep">$1</span>');
  return m[2] ? `${num}<small>${inlineFormat(m[2])}</small>` : num;
}

// 數字部分超過 5 字（如「2.1 → 3.3」）時縮小字級，避免撐破數字磚
function fbIsLongStat(value) {
  const m = value.match(/^([+\-−]?[\d.,]+(?:\s*[／/→~～]\s*[\d.,]+)?)/);
  return !!m && m[1].replace(/\s/g, '').length > 5;
}

function fbBar(value, label, max, unit) {
  const u = unit ? ` <small>${esc(unit)}</small>` : '';
  return `<span class="fb-bar-track"><span class="fb-bar-fill" style="--w:${fbPct(parseFloat(value) || 0, max)}%"></span></span><span class="fb-bar-value">${esc(label)}${u}</span>`;
}

const FEEDBACK_PANELS = {
  // - 數值 | 說明 | 補充（選填）
  stats(p) {
    return `<div class="fb-stats">${p.items.map(([value = '', label = '', note = '']) =>
      `<div class="fb-stat"><div class="fb-stat-value${fbIsLongStat(value) ? ' fb-stat-value--long' : ''}">${fbStatValue(value)}</div><div class="fb-stat-label">${inlineFormat(label)}</div>${note ? `<div class="fb-stat-note">${inlineFormat(note)}</div>` : ''}</div>`).join('')}</div>`;
  },
  // 標題列：bars: 標題 | 單位 | 最大值（選填，預設取最大項）；項目：- 名稱 | 數值
  bars(p) {
    const [unit = '', maxOpt = ''] = p.opts;
    const max = parseFloat(maxOpt) || Math.max(0, ...p.items.map(it => parseFloat(it[1]) || 0));
    return `<div class="fb-bars">${p.items.map(([label = '', value = '']) =>
      `<div class="fb-bar-row"><span class="fb-bar-label">${inlineFormat(label)}</span>${fbBar(value, value, max, unit)}</div>`).join('')}</div>`;
  },
  // 標題列：compare: 標題 | 前標籤 | 後標籤 | 單位；項目：- 名稱 | 前 | 後（自動算變化 %）
  compare(p) {
    const [beforeLabel = '之前', afterLabel = '之後', unit = ''] = p.opts;
    const rows = p.items.map(([label = '', b = '', a = '']) => ({ label, b, a, bv: parseFloat(b) || 0, av: parseFloat(a) || 0 }));
    const max = Math.max(0, ...rows.flatMap(r => [r.bv, r.av]));
    let s = `<div class="fb-legend"><span class="fb-legend-item fb-legend-item--before">${esc(beforeLabel)}</span><span class="fb-legend-item fb-legend-item--after">${esc(afterLabel)}</span></div><div class="fb-compare">`;
    for (const r of rows) {
      const d = r.bv ? Math.round((r.av - r.bv) / r.bv * 100) : null;
      const delta = d === null ? '' : `<span class="fb-delta">${d > 0 ? '+' : d < 0 ? '−' : '±'}${Math.abs(d)}%</span>`;
      s += `<div class="fb-cmp-row"><div class="fb-cmp-head"><span class="fb-cmp-label">${inlineFormat(r.label)}</span>${delta}</div>`
        + `<div class="fb-cmp-bar fb-cmp-bar--before" title="${esc(beforeLabel)}">${fbBar(r.b, r.b, max, unit)}</div>`
        + `<div class="fb-cmp-bar fb-cmp-bar--after" title="${esc(afterLabel)}">${fbBar(r.a, r.a, max, unit)}</div></div>`;
    }
    return s + '</div>';
  },
  // - 引言 | 出處（選填）
  quotes(p) {
    return `<div class="fb-quotes">${p.items.map(([text = '', source = '']) =>
      `<blockquote class="fb-quote"><p>${inlineFormat(text)}</p>${source ? `<cite>${inlineFormat(source)}</cite>` : ''}</blockquote>`).join('')}</div>`;
  },
  // 標題列：changes: 標題 | 左標籤 | 右標籤；項目：- 回饋 → 調整 | 目標標題（選填，點擊跳到該段）
  changes(p) {
    const [fromLabel = '回饋', toLabel = '調整'] = p.opts;
    return `<ol class="fb-changes">${p.items.map(([pair = '', target = '']) => {
      const [from, ...rest] = pair.split(/\s*(?:→|->)\s*/);
      const jump = target ? `<button class="fb-jump" type="button" data-target="${esc(target)}">前往段落 →</button>` : '';
      return `<li class="fb-change"><div class="fb-change-from"><span class="fb-change-tag">${esc(fromLabel)}</span><p>${inlineFormat(from)}</p></div>`
        + `<div class="fb-change-to"><span class="fb-change-tag">${esc(toLabel)}</span><p>${inlineFormat(rest.join(' → '))}</p>${jump}</div></li>`;
    }).join('')}</ol>`;
  },
};

function renderFeedbackBody(block) {
  let s = '<div class="fb">';
  if (block.desc) s += `<p class="fb-desc">${inlineFormat(block.desc)}</p>`;
  for (const n of block.notes) s += `<p class="fb-note">${inlineFormat(n)}</p>`;
  for (const p of block.panels) {
    s += `<section class="fb-panel fb-panel--${p.kind}">`;
    if (p.title) s += `<h4 class="fb-panel-title">${inlineFormat(p.title)}</h4>`;
    for (const n of p.notes) s += `<p class="fb-note">${inlineFormat(n)}</p>`;
    s += FEEDBACK_PANELS[p.kind](p) + '</section>';
  }
  return s + '</div>';
}

// ─── Registry ───

export const BLOCKS = [

  // ══ pre-card：在 ### 卡片之前檢查 ══

  {
    name: 'youtube',
    phase: 'pre-card',
    doc: {
      syntax: '[youtube id="…" title="…"]／[youtube id="…"]說明[/youtube]',
      summary: 'YouTube 影片 16:9 嵌入；單行或區塊形式（中間文字當說明）；`id` 是網址 `v=` 後的值；列印模式改顯示連結',
      example: ['[youtube id="dQw4w9WgXcQ" title="Demo 影片"]', '', '[youtube id="dQw4w9WgXcQ"]', '這是一段示範影片的說明', '[/youtube]'].join('\n'),
    },
    close: '[/youtube]',
    // 單行完整形式且後面沒有配對的 [/youtube] 時，不需要結尾標籤
    needsClose: (line, lines, i) => hasYoutubeBlockClose(lines, i),
    test: (line) => /^\[youtube/.test(line.trim()),
    parse(lines, i) {
      const line = lines[i];
      const a = parseAttrs(line);
      const vid = a.id || '';
      let caption = a.title || '';
      // 區塊形式（收集說明文字直到 [/youtube]）：開頭行未以 ] 收尾，
      // 或開頭行完整、但接續內容在遇到其他區塊/標題前就有配對的 [/youtube]
      if (hasYoutubeBlockClose(lines, i)) {
        i++;
        const captionLines = [];
        while (i < lines.length && !/^\[\/youtube\]/.test(lines[i].trim())) {
          if (lines[i].trim() !== '') captionLines.push(lines[i].trim());
          i++;
        }
        i++; // skip [/youtube]
        if (!caption && captionLines.length) caption = captionLines.join(' ');
      } else {
        i++;
      }
      return { block: vid ? { type: 'youtube', id: vid, caption } : null, nextIdx: i };
    },
    render(block) {
      return `<div class="youtube-embed">
      <div class="youtube-wrapper" data-id="${esc(block.id)}">
        <iframe src="https://www.youtube.com/embed/${esc(block.id)}" title="${esc(block.caption || 'YouTube video')}" frameborder="0" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>
        <div class="youtube-local-notice">
          <p>本機直接開啟 HTML 時，YouTube 可能因缺少 HTTP referrer 而拒絕播放。請改用本機伺服器預覽，或直接前往 <a href="https://www.youtube.com/watch?v=${esc(block.id)}" target="_blank" rel="noopener">YouTube 觀看影片</a>。</p>
        </div>
      </div>
      ${block.caption ? `<p class="youtube-caption">${inlineFormat(block.caption)}</p>` : ''}
    </div>`;
    },
  },

  {
    name: 'image-text',
    phase: 'pre-card',
    doc: {
      syntax: '[image-text position="left|right" width="N"]…[/image-text]',
      summary: '圖文並排：內含一張 `![](…)` 與段落／`- ` 條列；`width` 為圖片佔比 %（預設 40）；單張直式圖用 `position="right"`、`width` 25〜32；≤ 900px 改上下排列',
      example: ['[image-text position="right" width="30"]', '![產品的主要介面](assets/screenshot.png)', '這是產品的主要介面，提供 **直覺式操作**。', '- 支援拖放操作', '- 即時預覽結果', '[/image-text]'].join('\n'),
    },
    close: '[/image-text]',
    test: (line) => /^\[image-text/.test(line.trim()),
    parse(lines, i) {
      const line = lines[i];
      const posMatch = line.match(/position="(left|right)"/);
      const position = posMatch ? posMatch[1] : 'left';
      const widthMatch = line.match(/width="(\d+)%?"/);
      const imgWidth = widthMatch ? parseInt(widthMatch[1], 10) : 40;
      let imgSrc = '', imgAlt = '';
      const textLines = [];
      i++;
      while (i < lines.length && !/^\[\/image-text\]/.test(lines[i].trim())) {
        const imgMatch = lines[i].trim().match(/^!\[([^\]]*)\]\(([^)]+)\)/);
        if (imgMatch && !imgSrc) {
          imgAlt = imgMatch[1];
          imgSrc = imgMatch[2];
        } else if (lines[i].trim() !== '') {
          textLines.push(lines[i]);
        }
        i++;
      }
      i++; // skip [/image-text]
      return { block: { type: 'image-text', position, imgWidth, imgSrc, imgAlt, textLines }, nextIdx: i };
    },
    render(block) {
      const imgPos = block.position === 'right' ? 'image-text--img-right' : '';
      const widthStyle = block.imgWidth !== 40 ? ` style="--img-width:${block.imgWidth}%"` : '';
      let bodyHtml = '';
      for (const tl of block.textLines) {
        if (/^- /.test(tl)) {
          bodyHtml += `<li>${inlineFormat(tl.replace(/^- /, '').trim())}</li>\n`;
        } else {
          bodyHtml += `<p>${inlineFormat(tl.trim())}</p>\n`;
        }
      }
      bodyHtml = bodyHtml.replace(/((?:<li>.*<\/li>\n)+)/g, '<ul>\n$1</ul>\n');
      return `<div class="image-text ${imgPos}"${widthStyle}>
      <div class="image-text__img">
        <img src="${esc(block.imgSrc)}" alt="${esc(block.imgAlt)}" loading="lazy">
      </div>
      <div class="image-text__body">
        ${bodyHtml.trim()}
      </div>
    </div>`;
    },
  },

  {
    name: 'gallery',
    phase: 'pre-card',
    doc: {
      syntax: '[gallery]…[/gallery]',
      summary: '多圖相簿：每行一張 `![圖說](路徑)`，等高排列、寬度依比例，超出容器橫向捲動；適合連續多張直式圖或比例不一的一組圖',
      example: ['[gallery]', '![端午節賀卡成果](assets/card-dragon.png)', '![中秋節賀卡成果](assets/card-moon.png)', '![春節賀卡成果](assets/card-cny.png)', '[/gallery]'].join('\n'),
    },
    close: '[/gallery]',
    test: (line) => /^\[gallery\]/.test(line.trim()),
    parse(lines, i) {
      const items = [];
      i++;
      while (i < lines.length && !/^\[\/gallery\]/.test(lines[i].trim())) {
        const imgMatch = lines[i].trim().match(/^!\[([^\]]*)\]\(([^)]+)\)/);
        if (imgMatch) items.push({ alt: imgMatch[1], src: imgMatch[2] });
        i++;
      }
      i++; // skip [/gallery]
      return { block: items.length ? { type: 'gallery', items } : null, nextIdx: i };
    },
    render(block) {
      const scroll = block.items.length > 3 ? ' gallery--scroll' : '';
      const items = block.items.map((it) => `<figure class="gallery__item">
        <img src="${esc(it.src)}" alt="${esc(it.alt)}" loading="lazy">
        ${it.alt ? `<figcaption>${esc(it.alt)}</figcaption>` : ''}
      </figure>`).join('\n');
      return `<div class="gallery${scroll}">
      ${items}
    </div>`;
    },
  },

  {
    name: 'image',
    phase: 'pre-card',
    doc: {
      syntax: '![alt](src)／![alt](src){max-width=200px}',
      summary: '獨立一行的圖片：置中顯示、alt 成為圖說（寫成完整句子）；`{max-width=…}` 限寬；路徑寫 `assets/`（不加 `./`）；寫在段落或列點中則為行內圖',
      example: '![架構示意圖：三層服務之間的資料流](assets/architecture.png)',
    },
    test: (line) => /^!\[([^\]]*)\]\(([^)]+)\)/.test(line.trim()),
    parse(lines, i) {
      const imgMatch = lines[i].trim().match(/^!\[([^\]]*)\]\(([^)]+)\)(?:\{max-width=([^}]+)\})?/);
      return {
        block: { type: 'image', alt: imgMatch[1], src: imgMatch[2], maxWidth: imgMatch[3] || null },
        nextIdx: i + 1,
      };
    },
    render(block) {
      const maxWidthStyle = block.maxWidth ? ` style="max-width:${esc(block.maxWidth)};margin-inline:auto"` : '';
      return `<figure class="content-image"${maxWidthStyle}>
      <img src="${esc(block.src)}" alt="${esc(block.alt)}" loading="lazy">
      ${block.alt ? `<figcaption>${esc(block.alt)}</figcaption>` : ''}
    </figure>`;
    },
  },

  {
    name: 'table',
    phase: 'pre-card',
    doc: {
      syntax: '| 欄 | 欄 |＋|---|---|；欄名尾附 [width:120]',
      summary: '標準 Markdown 表格；分隔列 `:---:`／`---:` 控制對齊；標題儲存格尾附 `[width:值]` 指定欄寬（裸數字＝px，也接受 %／rem／em／ch，未標的欄 auto）；儲存格可用 `[[標籤]]`；儲存格內用 `<br>` 換行；**第一欄自動粗體**（不用手寫 `**`），用 `<br>` 分兩行時只有第一行粗體',
      example: ['| 情境 | 模糊指令[width:120] | 完整指令 |', '|---|---|---|', '| 寫程式<br>給工程師 | 幫我寫 | 幫我用 Python 寫排序 [[green:推薦]] |'].join('\n'),
    },
    test: (line, nextLine) => isMarkdownTableHeader(line, nextLine),
    parse(lines, i) {
      const widths = [];
      let hasWidths = false;
      const headers = parseMarkdownTableRow(lines[i]).map(cell => {
        const { text, width } = extractHeaderWidth(cell);
        widths.push(width || 'auto');
        if (width && width !== 'auto') hasWidths = true;
        return text;
      });
      const aligns = parseMarkdownTableAlignments(lines[i + 1]);
      const rows = [];
      i += 2;
      while (i < lines.length) {
        const rowLine = lines[i];
        if (rowLine.trim() === '' || !rowLine.includes('|')) break;
        rows.push(parseMarkdownTableRow(rowLine));
        i++;
      }
      const block = { type: 'table', headers, aligns, rows };
      if (hasWidths) block.widths = widths;
      return { block, nextIdx: i };
    },
    render(block) {
      const hasWidths = Array.isArray(block.widths) && block.widths.length > 0;
      // 只有明確指定寬度的欄位掛 col-w（取消預設 min-width）；auto 欄行為完全不變
      const cellClass = (idx) => {
        const w = hasWidths ? block.widths[idx] : null;
        return `align-${block.aligns[idx] || 'left'}${(w && w !== 'auto') ? ' col-w' : ''}`;
      };
      let s = `<div class="table-wrap">\n      <table class="content-table">\n`;
      if (hasWidths) {
        s += `        <colgroup>\n`;
        block.headers.forEach((_, idx) => {
          const w = block.widths[idx];
          s += (w && w !== 'auto') ? `          <col style="width:${w}">\n` : `          <col>\n`;
        });
        s += `        </colgroup>\n`;
      }
      s += `        <thead>\n          <tr>\n`;
      block.headers.forEach((header, idx) => {
        s += `            <th class="${cellClass(idx)}">${inlineFormat(header)}</th>\n`;
      });
      s += `          </tr>\n        </thead>\n        <tbody>\n`;
      block.rows.forEach((row) => {
        s += `          <tr>\n`;
        block.headers.forEach((_, idx) => {
          const cell = inlineFormat(row[idx] || '');
          s += `            <td class="${cellClass(idx)}">${idx === 0 ? boldTableLabel(cell) : cell}</td>\n`;
        });
        s += `          </tr>\n`;
      });
      s += `        </tbody>\n      </table>\n    </div>`;
      return s;
    },
  },

  // ══ post-card：在 ### 卡片之後檢查 ══

  {
    name: 'prompt',
    phase: 'post-card',
    doc: {
      syntax: '```prompt [label="…"]／```terminal／```code … ```',
      summary: '可複製的 Prompt／終端機／程式碼區塊：`prompt` 內容以 shell 指令開頭時 header 顯示 Terminal、`code` 固定顯示 Code；主體可再放巢狀 fence；超過 10 行自動折疊；語言標識一律小寫',
      example: ['```prompt [label="安裝指令"]', 'npm install -g @fission-ai/openspec@latest', '```', '', '```prompt [label="口語化意圖"]', '幫我把這份講稿轉成課程頁', '```'].join('\n'),
    },
    close: '```',
    test: (line) => /^```(prompt|terminal|Terminal|Prompt|code|Code)/i.test(line),
    parse(lines, i) {
      const line = lines[i];
      const langMatch = line.match(/^```(\w+)/);
      const lang = langMatch ? langMatch[1].toLowerCase() : 'prompt';
      const labelMatch = line.match(/\[label="([^"]+)"\]/);
      const label = labelMatch ? labelMatch[1] : '';
      const closeIdx = findFenceClose(lines, i);
      const body = lines.slice(i + 1, closeIdx).join('\n');
      i = closeIdx + 1;
      let headerType;
      if (lang === 'terminal') {
        headerType = 'Terminal';
      } else if (lang === 'code') {
        headerType = 'Code';
      } else if (lang === 'prompt') {
        const isTerminal = /^(npm |npx |openspec |git |docker |curl |brew |apt |pip |cargo |\/init)/.test(body.trim());
        headerType = isTerminal ? 'Terminal' : 'Prompt';
      } else {
        headerType = 'Prompt';
      }
      return { block: { type: 'prompt', label, body, headerType }, nextIdx: i };
    },
    render: renderPromptBlock,
  },

  {
    name: 'raw-html',
    phase: 'post-card',
    doc: {
      syntax: '[html]…[/html]／[html src="檔案.html"]',
      summary: '自訂 HTML，以 `iframe srcdoc` 渲染（CSS 與外層隔離、高度自動延展）；`[html src="…"]` 單行形式在 build 前讀入課程目錄下的 HTML 檔（路徑相對課程目錄，檔案不存在報 `html-src-missing`）；內容裡的本地 `<img src>` 與頁面圖片走同一套處理：依 `--images` 內嵌 base64 或維持相對路徑，有較新的同名 .webp 就改用',
      example: ['[html]', '<div style="display:flex;gap:12px">', '  <div style="flex:1;padding:16px">面板 A</div>', '  <div style="flex:1;padding:16px">面板 B</div>', '</div>', '[/html]', '', '[html src="diagram.html"]'].join('\n'),
    },
    tag: 'html',
    close: '[/html]',
    test: (line) => /^\[html\]/.test(line.trim()),
    parse(lines, i) {
      let htmlContent = '';
      i++;
      while (i < lines.length && !/^\[\/html\]/.test(lines[i].trim())) {
        htmlContent += (htmlContent ? '\n' : '') + lines[i];
        i++;
      }
      i++; // skip [/html]
      return { block: { type: 'raw-html', content: htmlContent }, nextIdx: i };
    },
    render(block) {
      const srcdoc = block.content
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;');
      // 高度量法：框高先設 0 再讀 <html> 的 scrollHeight（含 body margin；100vh 內容不會跟著框長高），與 app.js fitRawHtml 相同
      const onloadHandler = `(function(f){var sync=function(){try{var d=f.contentDocument;if(!d||!d.documentElement)return;var s=f.style,p=s.height;s.height='0px';var h=d.documentElement.scrollHeight;s.height=h?h+'px':p;}catch(e){}};sync();try{var d=f.contentDocument;if(d&&'ResizeObserver' in window){var ro=new ResizeObserver(sync);ro.observe(d.documentElement);if(d.body)ro.observe(d.body);}if(f.contentWindow){f.contentWindow.addEventListener('resize',sync);}window.addEventListener('resize',sync);if(d&&d.fonts&&d.fonts.ready)d.fonts.ready.then(sync);}catch(e){}})(this)`;
      return `<iframe class="raw-html-frame" srcdoc="${srcdoc}" frameborder="0" scrolling="no" style="width:100%;border:none;overflow:hidden" onload="${onloadHandler.replace(/"/g, '&quot;')}"></iframe>`;
    },
  },

  {
    name: 'flow',
    phase: 'post-card',
    doc: {
      syntax: '[flow]…[/flow]',
      summary: '流程步驟：每行 `1. ` 或 `- ` 一步，` — `（或 ` – `／` - `，前後要有空白）前為步驟標題、後為說明',
      example: ['[flow]', '1. proposal.md — 確認目標與範圍', '2. design.md — 技術選型與風險評估', '3. task.md — 任務清單，完成自動打勾', '[/flow]'].join('\n'),
    },
    close: '[/flow]',
    test: (line) => /^\[flow\]/.test(line.trim()),
    parse(lines, i) {
      const steps = [];
      i++;
      while (i < lines.length && !/^\[\/flow\]/.test(lines[i].trim())) {
        const stepMatch = lines[i].trim().match(/^(?:\d+\.\s+|-\s+)(.*)/);
        if (stepMatch) {
          const parts = stepMatch[1].split(/\s[—–-]\s/);
          steps.push({ title: parts[0].trim(), desc: parts[1] ? parts[1].trim() : '' });
        }
        i++;
      }
      i++;
      return { block: { type: 'flow', steps }, nextIdx: i };
    },
    render(block) {
      let s = `<div class="flow">\n`;
      block.steps.forEach((step, idx) => {
        s += `      <div class="flow-step">
        <div class="step-num">${idx + 1}</div>
        <div class="step-content">
          <div class="step-title">${inlineFormat(step.title)}</div>
          <div class="step-desc">${inlineFormat(step.desc)}</div>
        </div>
      </div>\n`;
      });
      s += `    </div>`;
      return s;
    },
  },

  {
    name: 'tags',
    phase: 'post-card',
    doc: {
      syntax: '[tags]…[/tags]',
      summary: '彩色標籤列：每行 `- [green|orange|purple|blue] 文字`；帶色的 `- [color]` 行必須包在 `[tags]` 內，獨立使用不套色',
      example: ['[tags]', '- [orange] 人工手打：耗時且風格不一致', '- [purple] AI 自動生成：長短隨機', '- [green] 解法：git-smart-commit Skill', '[/tags]'].join('\n'),
    },
    close: '[/tags]',
    test: (line) => /^\[tags\]/.test(line.trim()),
    parse(lines, i) {
      const tags = [];
      i++;
      while (i < lines.length && !/^\[\/tags\]/.test(lines[i].trim())) {
        const tagMatch = lines[i].trim().match(/^-\s+\[(green|orange|purple|blue)\]\s+(.*)/);
        if (tagMatch) {
          tags.push({ color: tagMatch[1], text: tagMatch[2] });
        }
        i++;
      }
      i++;
      return { block: { type: 'tags', tags }, nextIdx: i };
    },
    render(block) {
      let s = `<div class="tags">\n`;
      for (const t of block.tags) {
        s += `      <span class="tag ${t.color}">${esc(t.text)}</span>\n`;
      }
      s += `    </div>`;
      return s;
    },
  },

  {
    name: 'case',
    phase: 'post-card',
    doc: {
      syntax: '[case title="…"]…[/case]',
      summary: '情境／痛點／方案三段式案例卡：每段冒號後寫文字或下接 `- ` 條列（可並存），`處理方案：` 視同 `方案：`；多個案例寫多個 `[case]`',
      example: ['[case title="📄 文件生成"]', '情境：每天要產出大量 Email、公文、會議記錄', '痛點：', '- 格式重複、內容大同小異，卻吃掉大量工時', '方案：', '- 提供「範本」讓 AI `參考格式`', '- 人負責審核結果', '[/case]'].join('\n'),
    },
    close: '[/case]',
    test: (line) => /^\[case[\s\]]/.test(line.trim()),
    parse(lines, i) {
      const title = parseAttrs(lines[i]).title || '';
      const LABELS = [
        { re: /^情境[：:]\s*(.*)$/, key: 'scenario', label: '情境' },
        { re: /^痛點[：:]\s*(.*)$/, key: 'pain', label: '痛點' },
        { re: /^(?:處理)?方案[：:]\s*(.*)$/, key: 'solution', label: '方案' },
      ];
      const steps = [];
      i++;
      while (i < lines.length && !/^\[\/case\]/.test(lines[i].trim())) {
        const t = lines[i].trim();
        const hit = LABELS.find(l => l.re.test(t));
        if (hit) {
          steps.push({ key: hit.key, label: hit.label, text: t.match(hit.re)[1].trim(), items: [] });
        } else if (steps.length > 0 && /^- /.test(t)) {
          steps[steps.length - 1].items.push(t.replace(/^- /, '').trim());
        } else if (steps.length > 0 && t !== '') {
          const last = steps[steps.length - 1];
          last.text += (last.text ? '\n' : '') + t;
        }
        i++;
      }
      i++; // skip [/case]
      return { block: { type: 'case', title, steps }, nextIdx: i };
    },
    render(block) {
      // 渲染為 group-block 變體：網頁／列印／簡報模式的卡片配套（含簡報一卡一頁）自動繼承
      let s = `<div class="group-block case-card">\n`;
      if (block.title) {
        const m = block.title.match(CASE_ICON_RE);
        const iconHtml = m ? `<span class="icon">${m[1]}</span> ` : '';
        s += `      <div class="group-header">${iconHtml}${inlineFormat(m ? m[2] : block.title)}</div>\n`;
      }
      s += `      <div class="group-body">\n      <div class="case-flow">\n`;
      for (const step of block.steps) {
        s += `      <div class="case-step case-step--${step.key}">
        <span class="case-step__label">${esc(step.label)}</span>
        <div class="case-step__body">\n`;
        if (step.text) s += `          <p>${inlineFormatWithBreaks(step.text)}</p>\n`;
        if (step.items.length > 0) {
          s += `          <ul>\n`;
          for (const it of step.items) s += `            <li>${inlineFormat(it)}</li>\n`;
          s += `          </ul>\n`;
        }
        s += `        </div>\n      </div>\n`;
      }
      s += `      </div>\n      </div>\n    </div>`;
      return s;
    },
  },

  {
    name: 'summary',
    phase: 'post-card',
    doc: {
      syntax: '[summary]…[/summary]',
      summary: '總結卡片格：每行 `- emoji **標題** | 描述`，缺 `|` 的行不會出現；課程最後一段用它收束',
      example: ['[summary]', '- 🏗️ **新專案 — SDD** | 讓 AI 根據規格建立專案', '- ⚙️ **舊專案 — Skills** | 讓 AI 有規範可循', '[/summary]'].join('\n'),
    },
    close: '[/summary]',
    test: (line) => /^\[summary\]/.test(line.trim()),
    parse(lines, i) {
      const items = [];
      i++;
      while (i < lines.length && !/^\[\/summary\]/.test(lines[i].trim())) {
        const sumMatch = lines[i].trim().match(/^-\s+(\S+)\s+\*\*(.+?)\*\*\s*\|\s*(.*)/);
        if (sumMatch) {
          items.push({ icon: sumMatch[1], title: sumMatch[2], desc: sumMatch[3].trim() });
        }
        i++;
      }
      i++;
      return { block: { type: 'summary', items }, nextIdx: i };
    },
    render(block) {
      let s = `<div class="summary-grid">\n`;
      for (const item of block.items) {
        s += `      <div class="summary-card">
        <div class="sc-icon">${item.icon}</div>
        <h4>${esc(item.title)}</h4>
        <p>${inlineFormat(item.desc)}</p>
      </div>\n`;
      }
      s += `    </div>`;
      return s;
    },
  },

  {
    name: 'class-timeline',
    phase: 'post-card',
    doc: {
      syntax: '[time]…[/time]',
      summary: '課程時間軸：每堂以 `- label:`（或任一 `- 欄位:`）起頭、其餘欄位縮排兩格；`date`、`time` 必填（缺了報 `invalid-value`），`des`／`link`／`marker` 選填；`time` 寫上課起訖時刻（如 `19:00~21:00`），不寫「約 100 分鐘」這類時長或節奏說明（節奏分配放講師備註 `<!-- -->`）；`active: true`（或 `status: past|current|upcoming`）標記目前堂；也可一行寫一堂的精簡寫法 `5/30（六）| 13:30~16:30 | 主題`，前面加不加 `- ` 都可以',
      example: ['[time]', '- label: 第 1 堂', '  date: 5/30（六）', '  time: 13:30~16:30', '  des: 打造懂你的 AI 助手', '  link: [課程錄影](https://example.com/replay)', '- label: 第 2 堂', '  date: 6/6（六）', '  time: 13:30~16:30', '  des: 規格驅動開發', '  active: true', '[/time]'].join('\n'),
    },
    tag: 'time',
    close: '[/time]',
    test: (line) => /^\[time\]/.test(line.trim()),
    parse(lines, i) {
      const items = [];
      let currentItem = null;
      i++;
      while (i < lines.length && !/^\[\/time\]/.test(lines[i].trim())) {
        const trimmed = lines[i].trim();
        const bulletField = trimmed.match(/^-\s+([\w-]+):\s*(.*)$/);
        const field = trimmed.match(/^([\w-]+):\s*(.*)$/);
        // 精簡寫法前面多寫了 `- `（跟其他堂的 `- label:` 對齊）也接受
        const compactLine = trimmed.replace(/^-\s+/, '');
        const compact = isClassTimelineLine(compactLine);

        if (bulletField) {
          currentItem = { index: items.length + 1, label: '', marker: '', date: '', weekday: '', time: '', des: '', link: null, status: '', active: false };
          assignTimeItemField(currentItem, bulletField[1], bulletField[2]);
          items.push(currentItem);
        } else if (field && currentItem) {
          assignTimeItemField(currentItem, field[1], field[2]);
        } else if (compact) {
          const parsed = parseClassTimelineLine(compactLine, items.length + 1);
          currentItem = { ...parsed, label: '', marker: '', link: null, status: '', active: false };
          items.push(currentItem);
        }
        i++;
      }
      i++;
      const visibleItems = items.filter(item => item.date || item.time || item.des);
      resolveTimelineStatus(visibleItems);
      return { block: { type: 'class-timeline', items: visibleItems }, nextIdx: i };
    },
    render(block) {
      const hasStatus = block.items.some(it => it.status);
      let s = `<div class="class-timeline${hasStatus ? ' class-timeline--has-status' : ''}">\n`;
      block.items.forEach((item) => {
        const weekday = formatWeekdayLabel(item.weekday);
        const status = item.status || '';
        const itemClass = `class-timeline__item${status ? ` is-${status}` : ''}`;
        const markerDisplay = status === 'past' && !item.marker
          ? '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>'
          : esc(String(item.marker || item.index));
        const label = item.label || `第 ${item.index} 堂`;
        s += `      <div class="${itemClass}"${status ? ` data-status="${status}"` : ''}>
        <div class="class-timeline__marker">${markerDisplay}</div>
        <div class="class-timeline__card">
          ${status === 'current' ? `<span class="class-timeline__pin" aria-label="目前進度">You are here</span>` : ''}
          <div class="class-timeline__meta">
            ${label ? `<span class="class-timeline__label">${esc(label)}</span>` : ''}
            ${item.date ? `<span class="class-timeline__date">${esc(item.date)}</span>` : ''}
            ${weekday ? `<span class="class-timeline__weekday">${esc(weekday)}</span>` : ''}
            ${status ? `<span class="class-timeline__status-tag is-${status}">${esc(statusLabel(status))}</span>` : ''}
          </div>
          ${item.time ? `<div class="class-timeline__time">${esc(item.time)}</div>` : ''}
          ${item.des ? `<div class="class-timeline__des">${inlineFormat(item.des)}</div>` : ''}
          ${item.link ? `<a class="class-timeline__link" href="${esc(item.link.url)}" target="_blank" rel="noopener">${esc(item.link.text || '課程連結')}<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 17L17 7M9 7h8v8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></a>` : ''}
        </div>
      </div>\n`;
      });
      s += `    </div>`;
      return s;
    },
  },

  {
    name: 'qa-session',
    phase: 'post-card',
    doc: {
      syntax: '[qa-session title="…"]…[/qa-session]',
      summary: '全版 QA 頁：內容空白＝等待提問畫面；`- Q:` 下一行兩格縮排 `A:` 組成 accordion；`title` 預設「Q&A 時間」',
      example: ['[qa-session title="常見問題"]', '- Q: 這套工具適合初學者嗎？', '  A: 完全適合，不需要先懂程式。', '[/qa-session]', '', '[qa-session title="Q&A 時間"]', '[/qa-session]'].join('\n'),
    },
    close: '[/qa-session]',
    fullPage: { pageClass: 'qa-page', suffix: 'qa' },
    test: (line) => /^\[qa-session/.test(line.trim()),
    parse(lines, i) {
      const title = parseAttrs(lines[i]).title || 'Q&A 時間';
      const items = [];
      i++;
      while (i < lines.length && !/^\[\/qa-session\]/.test(lines[i].trim())) {
        const qMatch = lines[i].trim().match(/^- Q:\s*(.*)/);
        if (qMatch) {
          const q = qMatch[1].trim();
          let a = '';
          i++;
          while (i < lines.length) {
            const aMatch = lines[i].trim().match(/^A:\s*(.*)/);
            if (aMatch) { a = aMatch[1].trim(); i++; break; }
            if (/^\[\/qa-session\]/.test(lines[i].trim()) || /^- Q:/.test(lines[i].trim())) break;
            i++;
          }
          if (q) items.push({ q, a });
        } else {
          i++;
        }
      }
      i++; // skip [/qa-session]
      return { block: { type: 'qa-session', title, items }, nextIdx: i };
    },
    render(block) {
      let listHtml = '';
      if (block.items && block.items.length > 0) {
        listHtml = `<div class="qa-list">\n`;
        block.items.forEach((item) => {
          listHtml += `      <div class="qa-item">
        <button class="qa-question" aria-expanded="false" onclick="toggleQA(this)">
          <span class="qa-badge qa-badge--q">Q</span>
          <span class="qa-q-text">${inlineFormat(item.q)}</span>
          <svg class="qa-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </button>
        <div class="qa-answer">
          <div class="qa-answer-inner">
            <span class="qa-badge qa-badge--a">A</span>
            <div class="qa-a-text">${inlineFormat(item.a)}</div>
          </div>
        </div>
      </div>\n`;
        });
        listHtml += `    </div>`;
      }
      return `<div class="qa-session">
    <div class="qa-session__deco" aria-hidden="true">?</div>
    <div class="qa-session__inner">
      <h3 class="qa-session__title">${esc(block.title)}${tabTag(block)}</h3>
      <p class="qa-session__hint">歡迎提問，一起深入探討</p>
    </div>
    ${listHtml}
  </div>`;
    },
  },

  {
    name: 'lab-session',
    phase: 'post-card',
    doc: {
      syntax: '[lab-session title="…" duration="…" hint="…"]…[/lab-session]',
      summary: '全版實作時間頁：`- ` 行為編號任務（可空白）；`title` 預設「🛠️ 實作時間」、`duration` 顯示時間膠囊、`hint` 有預設提示語',
      example: ['[lab-session title="🛠️ 實作時間" duration="15 分鐘" hint="有問題歡迎提出，你的問題可能是大家的問題"]', '- 設定你的第一個 Agent Skill', '- 執行 build 並確認 HTML 正確輸出', '[/lab-session]'].join('\n'),
    },
    close: '[/lab-session]',
    fullPage: { pageClass: 'lab-page', suffix: 'lab' },
    test: (line) => /^\[lab-session/.test(line.trim()),
    parse(lines, i) {
      const a = parseAttrs(lines[i]);
      const title = a.title || '🛠️ 實作時間';
      const duration = a.duration || '';
      const hint = a.hint || '有問題歡迎提出，你的問題可能是大家的問題';
      const tasks = [];
      i++;
      while (i < lines.length && !/^\[\/lab-session\]/.test(lines[i].trim())) {
        const taskMatch = lines[i].trim().match(/^- (.*)/);
        if (taskMatch) tasks.push(taskMatch[1].trim());
        i++;
      }
      i++; // skip [/lab-session]
      return { block: { type: 'lab-session', title, duration, hint, tasks }, nextIdx: i };
    },
    render(block) {
      let taskHtml = '';
      if (block.tasks && block.tasks.length > 0) {
        taskHtml = `<div class="lab-task-list">\n`;
        block.tasks.forEach((task, idx) => {
          taskHtml += `      <div class="lab-task-item">
        <span class="lab-task-num">${idx + 1}</span>
        <span class="lab-task-text">${inlineFormat(task)}</span>
      </div>\n`;
        });
        taskHtml += `    </div>`;
      }
      const durationHtml = block.duration
        ? `<div class="lab-session__duration">⏱ ${esc(block.duration)}</div>`
        : '';
      return `<div class="lab-session">
    <div class="lab-session__deco" aria-hidden="true">⚙</div>
    <div class="lab-session__inner">
      <h3 class="lab-session__title">${esc(block.title)}${tabTag(block)}</h3>
      ${block.hint ? `<p class="lab-session__hint">${esc(block.hint)}</p>` : ''}
      ${durationHtml}
    </div>
    ${taskHtml}
  </div>`;
    },
  },

  {
    name: 'interactive',
    phase: 'post-card',
    doc: {
      syntax: '[interactive title="…"]…[/interactive]',
      summary: '全版互動環節頁（說明會／直播停下來和聽眾說話）：內文為講師話術、保留換行，連續 `- ` 行渲染為條列；`title` 預設「💬 互動環節」',
      example: ['[interactive title="開場 warm-up"]', '看過類似翻車經驗的，在留言區打「`+1`」', '- 也歡迎分享你看過最瞎的翻車現場', '[/interactive]'].join('\n'),
    },
    close: '[/interactive]',
    fullPage: { pageClass: 'interactive-page', suffix: 'interactive' },
    test: (line) => /^\[interactive/.test(line.trim()),
    parse(lines, i) {
      const title = parseAttrs(lines[i]).title || '💬 互動環節';
      const scriptLines = [];
      i++;
      while (i < lines.length && !/^\[\/interactive\]/.test(lines[i].trim())) {
        scriptLines.push(lines[i]);
        i++;
      }
      i++; // skip [/interactive]
      while (scriptLines.length && scriptLines[0].trim() === '') scriptLines.shift();
      while (scriptLines.length && scriptLines[scriptLines.length - 1].trim() === '') scriptLines.pop();
      const script = scriptLines.join('\n');
      return { block: { type: 'interactive', title, script }, nextIdx: i };
    },
    render(block) {
      const scriptHtml = block.script
        ? `<div class="interactive-script">
        <div class="interactive-script__mark" aria-hidden="true">"</div>
        <div class="interactive-script__body">${renderInteractiveScript(block.script)}</div>
      </div>`
        : '';
      return `<div class="interactive-session">
    <div class="interactive-session__deco" aria-hidden="true">💬</div>
    <div class="interactive-session__inner">
      <h3 class="interactive-session__title">${esc(block.title)}${tabTag(block)}</h3>
    </div>
    ${scriptHtml}
  </div>`;
    },
  },

  {
    name: 'warning',
    phase: 'post-card',
    doc: {
      syntax: '[warning title="…"]…[/warning]',
      summary: '警告框：`title` 自動加 ⚠️；內容可混用段落與 `- ` 條列，單換行同段換行、空行分段；權限／金流／個資等敏感場景用',
      example: ['[warning title="權限注意"]', '執行前請確認已備份資料，此操作無法復原。', '- 不要無腦 Accept', '- 涉及金流要再三確認', '[/warning]'].join('\n'),
    },
    close: '[/warning]',
    test: (line) => /^\[warning\b/.test(line.trim()),
    parse(lines, i) {
      const title = parseAttrs(lines[i]).title || '';
      const contentLines = [];
      i++;
      while (i < lines.length && !/^\[\/warning\]/.test(lines[i].trim())) {
        contentLines.push(lines[i]);
        i++;
      }
      i++; // skip [/warning]
      const parts = [];
      let paraLines = [];
      for (const cl of contentLines) {
        const bm = cl.trim().match(/^- (.*)/);
        if (bm) {
          if (paraLines.length) { parts.push(paraLines.join('\n').trim()); paraLines = []; }
          const last = parts[parts.length - 1];
          if (last && typeof last === 'object' && last.type === 'bullets') last.items.push(bm[1].trim());
          else parts.push({ type: 'bullets', items: [bm[1].trim()] });
        } else if (cl.trim() === '') {
          if (paraLines.length) { parts.push(paraLines.join('\n').trim()); paraLines = []; }
        } else {
          paraLines.push(cl.trim());
        }
      }
      if (paraLines.length) parts.push(paraLines.join('\n').trim());
      return { block: { type: 'warning', title, parts }, nextIdx: i };
    },
    render(block) {
      let s = `<div class="warning">\n`;
      if (block.title) s += `      <div class="warning-title">⚠️ ${inlineFormat(block.title)}</div>\n`;
      let pIdx = 0;
      for (const part of (block.parts || [])) {
        if (typeof part === 'object' && part.type === 'bullets') {
          s += `      <ul>\n`;
          for (const b of part.items) s += `        <li>${inlineFormat(b)}</li>\n`;
          s += `      </ul>\n`;
        } else {
          s += `      <p${pIdx > 0 ? ' style="margin-top:.5rem"' : ''}>${inlineFormatWithBreaks(part)}</p>\n`;
          pIdx++;
        }
      }
      s += `    </div>`;
      return s;
    },
  },

  {
    name: 'bonus',
    phase: 'post-card',
    doc: {
      syntax: '[bonus title="…"]…[/bonus]',
      summary: 'Bonus 按鈕＋彈窗：內容支援段落（空行分段）、`- ` 清單、粗體、行內程式碼；`title` 預設「Bonus」；點遮罩、✕ 或 Esc 關閉',
      example: ['[bonus title="🎁 幕後製作心得"]', '這裡是**彈窗內容**，支援基本 Markdown：', '', '- 清單用 `- item`', '- 粗體用 `**文字**`', '[/bonus]'].join('\n'),
    },
    close: '[/bonus]',
    test: (line) => /^\[bonus/.test(line.trim()),
    parse(lines, i) {
      const title = parseAttrs(lines[i]).title || 'Bonus';
      let content = '';
      i++;
      while (i < lines.length && !/^\[\/bonus\]/.test(lines[i].trim())) {
        content += (content ? '\n' : '') + lines[i];
        i++;
      }
      i++;
      return { block: { type: 'bonus', title, content }, nextIdx: i };
    },
    render(block) {
      return `<button class="bonus-btn" data-bonus-title="${esc(block.title)}" data-bonus-content="${esc(block.content)}">
      ${esc(block.title)}
    </button>`;
    },
  },

  {
    // 回饋儀表板：按鈕＋彈窗（沿用 bonus modal 外框），內容於 build 時渲染成圖表，放在 <template> 內
    name: 'feedback',
    phase: 'post-card',
    doc: {
      syntax: '[feedback title="…" btn="…" desc="…"]…[/feedback]',
      summary: '回饋儀表板（按鈕＋彈窗）：面板以 `stats:`／`bars:`／`compare:`／`quotes:`／`changes:` 開頭，下接 `- ` 項目、欄位以 `|` 分隔；`changes` 的目標標題可跳到該段；問卷資料先去識別化',
      example: ['[feedback title="上一堂課的回饋" btn="📊 上一堂課的回饋" desc="成效問卷｜9 份回覆"]', 'stats:', '- 8.9 小時 | 每週自評省下的時間', '', 'compare: 每週花在各類工作的時間 | 訓練前 | 目前 | 小時', '- 資料整理與分析 | 11.9 | 5.4', '', 'bars: 使用時遇到的困難 | 人 | 9', '- 操作介面不熟悉 | 5', '', 'quotes: 同仁分享的實際案例', '- 每月報表現在一個指令完成 | 財務部', '', 'changes: 這堂課怎麼回應你們的回饋 | 你們說 | 這堂課', '- 操作介面不熟悉 → 每個功能都附操作截圖 | 使用時機', '[/feedback]'].join('\n'),
    },
    close: '[/feedback]',
    test: (line) => /^\[feedback/.test(line.trim()),
    parse(lines, i) {
      const a = parseAttrs(lines[i]);
      const title = a.title || '課程回饋';
      const block = { type: 'feedback', title, btn: a.btn || title, desc: a.desc || '', notes: [], panels: [] };
      let cur = null;
      i++;
      while (i < lines.length && !/^\[\/feedback\]/.test(lines[i].trim())) {
        const t = lines[i].trim();
        const head = t.match(/^(stats|bars|compare|quotes|changes)\s*[:：]\s*(.*)$/);
        if (head) {
          const [panelTitle, ...opts] = head[2].split('|').map(s => s.trim());
          cur = { kind: head[1], title: panelTitle, opts, notes: [], items: [] };
          block.panels.push(cur);
        } else if (/^- /.test(t) && cur) {
          cur.items.push(t.replace(/^- /, '').split('|').map(s => s.trim()));
        } else if (t) {
          (cur ? cur.notes : block.notes).push(t);
        }
        i++;
      }
      i++;
      return { block, nextIdx: i };
    },
    render(block) {
      return `<div class="feedback-wrap">
      <button class="feedback-btn" type="button" data-feedback-title="${esc(block.title)}">${inlineFormat(block.btn)}</button>
      <template class="feedback-tpl">${renderFeedbackBody(block)}</template>
    </div>`;
    },
  },

  {
    name: 'survey',
    phase: 'post-card',
    doc: {
      syntax: '[survey title="…" url="…" hint="…" btn="…"]…[/survey]',
      summary: '全版滿意度問卷頁：`url` 有值才顯示按鈕；結尾標籤必寫；實體企業課放在 qa-session 前',
      example: ['[survey title="課程滿意度問卷" url="https://forms.gle/xxxx" btn="填寫問卷"]', '[/survey]'].join('\n'),
    },
    close: '[/survey]',
    fullPage: { pageClass: 'survey-page', suffix: 'survey' },
    test: (line) => /^\[survey/.test(line.trim()),
    parse(lines, i) {
      const a = parseAttrs(lines[i]);
      const title = a.title || '課程滿意度問卷';
      const url = a.url || '';
      const hint = a.hint || '您的意見是我們進步的動力';
      const btn = a.btn || '填寫問卷';
      i++;
      while (i < lines.length && !/^\[\/survey\]/.test(lines[i].trim())) {
        i++;
      }
      i++; // skip [/survey]
      return { block: { type: 'survey', title, url, hint, btn }, nextIdx: i };
    },
    render(block) {
      const linkHtml = block.url
        ? `<a class="survey-btn" href="${esc(block.url)}" target="_blank" rel="noopener">${esc(block.btn)}</a>`
        : '';
      return `<div class="survey-session">
    <div class="survey-session__deco" aria-hidden="true">★</div>
    <div class="survey-session__inner">
      <h3 class="survey-session__title">${esc(block.title)}${tabTag(block)}</h3>
      <p class="survey-session__hint">${esc(block.hint)}</p>
      ${linkHtml}
    </div>
  </div>`;
    },
  },

  {
    name: 'download',
    phase: 'post-card',
    doc: {
      syntax: '[download dir="…" label="…" desc="…"]／[download file="assets/…"]',
      summary: '下載卡（單行）：`dir` 對應 `example/<dir>/`，build 自動打包成 `assets/<dir>.zip`；`file` 直接連既有檔，副檔名標籤自動顯示；zip 要與 index.html 一起部署',
      example: ['[download dir="brand-copywriting" label="下載「品牌文案」範例包" desc="品牌指南、產品資訊（解壓即用）"]', '[download file="assets/proposal-refiner.skill" label="下載 Proposal Refiner Skill"]'].join('\n'),
    },
    // 單行語法（指向 example/<dir> 打包出的 assets/<dir>.zip，或 file= 指定既有檔案）
    test: (line) => /^\[download\b/.test(line.trim()),
    parse(lines, i) {
      const a = parseAttrs(lines[i]);
      const dir = a.dir || '';
      const file = a.file || (dir ? `assets/${dir}.zip` : '');
      const label = a.label || (dir || file || '下載範例檔');
      const desc = a.desc || '';
      return { block: file ? { type: 'download', file, label, desc } : null, nextIdx: i + 1 };
    },
    render(block) {
      const href = esc(block.file);
      // 副檔名標籤依實際檔案動態顯示（.zip→ZIP、.skill→SKILL、.pdf→PDF…），無副檔名則顯示 FILE
      const extMatch = block.file.match(/\.([a-z0-9]+)$/i);
      const ext = extMatch ? extMatch[1].toUpperCase() : 'FILE';
      return `<a class="download-card" href="${href}" download>
    <span class="download-card__icon" aria-hidden="true">⬇</span>
    <span class="download-card__body">
      <span class="download-card__label">${inlineFormat(block.label)}</span>
      ${block.desc ? `<span class="download-card__desc">${inlineFormat(block.desc)}</span>` : ''}
    </span>
    <span class="download-card__ext">${esc(ext)}</span>
  </a>`;
    },
  },

  {
    name: 'pr',
    phase: 'post-card',
    doc: {
      syntax: '[pr from="…" to="…" title="…" desc="…" url="…" status="…"]',
      summary: 'Git PR／MR 卡片（單行）：`from`／`to` 為分支（必填）；`status` 為 merged／open／draft／closed；`number` 省略時從 `url` 解析',
      example: '[pr from="feature/login" to="main" title="新增登入流程" desc="補上表單驗證" url="https://github.com/owner/repo/pull/42" status="merged"]',
    },
    // 單行語法：merge A → B 卡片，可附 PR 連結
    test: (line) => /^\[pr\b/.test(line.trim()),
    parse(lines, i) {
      const a = parseAttrs(lines[i]);
      const url = a.url || '';
      let number = a.number || '';
      if (!number && url) {
        const numMatch = url.match(/\/(?:pull|merge_requests|pull-requests)\/(\d+)/);
        if (numMatch) number = numMatch[1];
      }
      const status = (a.status || '').toLowerCase();
      return {
        block: {
          type: 'pr',
          from: a.from || '',
          to: a.to || '',
          title: a.title || '',
          desc: a.desc || '',
          url,
          number,
          status: ['merged', 'open', 'draft', 'closed'].includes(status) ? status : '',
        },
        nextIdx: i + 1,
      };
    },
    render(block) {
      const STATUS = {
        merged: { label: 'Merged', icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M5.45 5.154A4.25 4.25 0 0 0 9.25 7.5h1.378a2.251 2.251 0 1 1 0 1.5H9.25A5.734 5.734 0 0 1 5 7.123v3.505a2.251 2.251 0 1 1-1.5 0V5.372a2.25 2.25 0 1 1 1.95-.218ZM4.25 13.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm8.5-4.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM5 3.25a.75.75 0 1 0 0 .005V3.25Z"/></svg>' },
        open: { label: 'Open', icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm8.25.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z"/></svg>' },
      };
      STATUS.draft = { label: 'Draft', icon: STATUS.open.icon };
      STATUS.closed = { label: 'Closed', icon: STATUS.open.icon };
      const st = STATUS[block.status] || STATUS.merged;
      const statusHtml = block.status ? `<span class="pr-status">${st.label}</span>` : '';
      const titleHtml = block.title ? inlineFormat(block.title) : `${esc(block.from)} → ${esc(block.to)}`;
      const numberHtml = block.number ? `<span class="pr-card__number">#${esc(block.number)}</span>` : '';
      const chip = (name) => `<span class="pr-chip pr-chip--${branchColorKey(name)}">${esc(name)}</span>`;
      const arrow = '<svg class="pr-card__arrow" width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8.22 2.97a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734L11.19 8.5H3.75a.75.75 0 0 1 0-1.5h7.44L8.22 4.03a.75.75 0 0 1 0-1.06Z"/></svg>';
      const descHtml = block.desc ? `\n        <span class="pr-card__desc">${inlineFormat(block.desc)}</span>` : '';
      const extHtml = block.url
        ? '\n        <svg class="pr-card__ext" width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M3.75 2h3.5a.75.75 0 0 1 0 1.5h-3.5a.25.25 0 0 0-.25.25v8.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-3.5a.75.75 0 0 1 1.5 0v3.5A1.75 1.75 0 0 1 12.25 14h-8.5A1.75 1.75 0 0 1 2 12.25v-8.5C2 2.784 2.784 2 3.75 2Zm6.854-1h4.146a.25.25 0 0 1 .25.25v4.146a.25.25 0 0 1-.427.177L13.03 4.03 9.28 7.78a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042l3.75-3.75-1.543-1.543A.25.25 0 0 1 10.604 1Z"/></svg>'
        : '';
      const tag = block.url ? 'a' : 'div';
      const linkAttrs = block.url ? ` href="${esc(block.url)}" target="_blank" rel="noopener"` : '';
      const statusClass = block.status ? ` pr-card--${block.status}` : '';
      const metaHtml = (statusHtml || extHtml)
        ? `\n      <span class="pr-card__meta">
        ${statusHtml}${extHtml}
      </span>`
        : '';
      return `<${tag} class="pr-card${statusClass}"${linkAttrs}>
      <span class="pr-card__icon" aria-hidden="true">${st.icon}</span>
      <span class="pr-card__main">
        <span class="pr-card__title">${titleHtml}${numberHtml}</span>
        <span class="pr-card__route">${chip(block.from)}${arrow}${chip(block.to)}</span>${descHtml}
      </span>${metaHtml}
    </${tag}>`;
    },
  },

  {
    name: 'insight',
    phase: 'post-card',
    doc: {
      syntax: '> **標題**＋後續 > 行',
      summary: '洞察框（講者旁白的主要載體，常用問句標題自問自答）：後續 `>` 行為內文、`>` 空行分段，支援 `- ` 條列與 fenced code；不以粗體開頭則為純引言；標題的 `**` 要成對，`> **標題` 沒有結尾 `**` 時整段當一般引言、星號原樣顯示（lint `unclosed-bold`）',
      example: ['> **為什麼要有洞察框？**', '> 因為講者的旁白需要載體。', '>', '> 第二段落用空行分隔。', '> - 也支援條列'].join('\n'),
    },
    // `> **標題**` 洞察框，或無標題純引言；主體支援段落 / 條列 / fenced code
    test: (line) => /^> /.test(line),
    parse(lines, i) {
      const line = lines[i];
      // 標題要成對的 **；`> **沒有關閉` 整段當一般引言（lint：unclosed-bold）
      if (/^> \*\*.+?\*\*/.test(line)) {
        const titleMatch = line.match(/^> \*\*(.+?)\*\*/);
        const insightTitle = titleMatch ? titleMatch[1] : '';
        const restOfLine = line.replace(/^> \*\*.+?\*\*\s*/, '').trim();
        const { parts, nextIdx } = parseInsightBody(lines, i + 1, restOfLine, true);
        return { block: { type: 'insight', title: insightTitle, parts }, nextIdx };
      }
      const restOfLine = line.replace(/^>\s?/, '').trim();
      const { parts, nextIdx } = parseInsightBody(lines, i + 1, restOfLine, false);
      return { block: { type: 'insight', title: '', parts }, nextIdx };
    },
    render(block) {
      let s = `<div class="insight">\n`;
      if (block.title) s += `      <div class="insight-title">${inlineFormat(block.title)}</div>\n`;
      let pIdx = 0;
      for (const part of (block.parts || [])) {
        if (part.type === 'code') {
          s += `      ${renderPromptBlock(part)}\n`;
        } else if (part.type === 'bullets') {
          s += `      <ul>\n`;
          for (const b of part.items) s += `        <li>${b}</li>\n`;
          s += `      </ul>\n`;
        } else {
          s += `      <p${pIdx > 0 ? ' style="margin-top:.5rem"' : ''}>${part.html}</p>\n`;
          pIdx++;
        }
      }
      s += `    </div>`;
      return s;
    },
  },

  {
    name: 'checklist',
    phase: 'post-card',
    doc: {
      syntax: '- [x] 項目',
      summary: '勾選清單（行首不縮排）：只用於已驗證／已完成的事項（測試情境、踩坑紀錄）；一般重點改用卡片條列',
      example: ['- [x] 電子郵件格式錯誤 → 前端擋住、不呼叫 API', '- [x] 格式正確 → 呼叫 Mock API → 成功取得 Token'].join('\n'),
    },
    test: (line) => /^- \[x\]/.test(line),
    parse(lines, i) {
      const items = [];
      while (i < lines.length && /^- \[x\]/.test(lines[i])) {
        items.push(lines[i].replace(/^- \[x\]\s*/, '').trim());
        i++;
      }
      return { block: { type: 'checklist', items }, nextIdx: i };
    },
    render(block) {
      let s = `<ul class="checklist">\n`;
      for (const item of block.items) s += `      <li>${inlineFormat(item)}</li>\n`;
      s += `    </ul>`;
      return s;
    },
  },

];

// ─── 衍生索引（由 registry 自動導出，新增元件不需要改這裡） ───

export const PRE_CARD_BLOCKS = BLOCKS.filter(b => b.phase === 'pre-card');
export const POST_CARD_BLOCKS = BLOCKS.filter(b => b.phase === 'post-card');

// type → render 函式
export const BLOCK_RENDERERS = new Map(BLOCKS.map(b => [b.name, b.render]));

// type → { pageClass, suffix }（全版區塊）
export const FULL_PAGE_BLOCKS = new Map(BLOCKS.filter(b => b.fullPage).map(b => [b.name, b.fullPage]));

// 任一區塊元件的起點行？（### 卡片的終止條件由此自動涵蓋所有元件）
export function isBlockStart(line, nextLine) {
  for (const b of BLOCKS) {
    if (b.test(line, nextLine)) return true;
  }
  return false;
}

// lint 用：已知的 [tag] 名稱（含 open/close 形式）
export const KNOWN_TAGS = new Set([
  ...BLOCKS.map(b => b.tag || b.name),
  'html', // [html src="..."] 於 build 前置展開，lint 仍視為已知
]);

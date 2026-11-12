// ─── Markdown 講稿 parser ───
// 結構（章節/卡片/清單/段落）在此處理；區塊元件（[flow]、[time]、```prompt…）
// 一律由 blocks.mjs 的 registry 認領 —— 新增元件時不需要動這支檔案。

import { inlineFormat, stripInlineMarkdown, generateId, branchColorKey, tabColorKey, resolveTabKey, EMOJI_ICON_SRC } from './text.mjs';
import { PRE_CARD_BLOCKS, POST_CARD_BLOCKS, FULL_PAGE_BLOCKS, isBlockStart } from './blocks.mjs';

// 標題開頭的 emoji 圖示（共用 text.mjs 的 EMOJI_ICON_SRC）：
// # 章節要「圖示＋空白＋文字」才算非編號章節；### 卡片的圖示後可以沒有空白或沒有文字
export const SECTION_ICON_RE = new RegExp(`^(${EMOJI_ICON_SRC})\\s+(.+)$`, 'u');
export const CARD_ICON_RE = new RegExp(`^(${EMOJI_ICON_SRC})\\s*(.*)$`, 'u');

// 從標題尾端解析 `| branch:xxx` 標記（含 branch:none）。回傳剝除標記後的純標題。
// - 有 branch:xxx → { branch: 'xxx', isNone:false }
// - branch:none   → { branch: undefined, isNone:true }（結束分支、回主線）
// - 無標記        → { branch: undefined, isNone:false }（沿用繼承狀態）
// - `| branch:` 空值 → 剝掉標記、視同無標記（lint 的 branch-empty 會提醒）
export function extractBranch(title) {
  const m = title.match(/\s*\|\s*branch:\s*([^\s|]*)\s*$/i);
  if (!m) return { title, branch: undefined, isNone: false };
  if (!m[1]) return { title: title.slice(0, m.index).trim(), branch: undefined, isNone: false };
  const cleaned = title.slice(0, m.index).trim();
  if (/^none$/i.test(m[1])) return { title: cleaned, branch: undefined, isNone: true };
  return { title: cleaned, branch: m[1], isNone: false };
}

// 從 ##/### 標題開頭解析 `[工具名]` 工具分頁標記（ex: `## [ChatGPT] 生成圖片`）。
// 回傳剝除標記後的純標題；無標記時 tab 為 undefined。
export function extractTab(title) {
  const m = title.match(/^\[([^\]\n]+)\]\s+(.+)$/);
  if (!m) return { title, tab: undefined };
  const parts = m[1].split('|');
  const tab = parts[0].trim();
  const tabColor = parts[1] ? parts[1].trim() : undefined;
  return { title: m[2].trim(), tab, tabColor };
}

// ── 工具分頁群組後處理 ──
// 連續帶 tab 標記的同層標題（## 或 ###）組成一個 tab group：
//   - 群組起點插入 {type:'tab-bar'}，pane 內每個 block 標上 tabGroup/tabPane
//   - 連續相同 label 的標題合併為同一 pane（一系列內容同一分頁）
//   - 未標記的同層標題、章節分隔（下一個 ##/###）會結束群組
//   - ## 級群組內同名小節在 TOC 收合為單一條目（同一主題只是分工具呈現）
function assignTabGroups(sections, uniqueId) {
  let seq = 0;
  for (const section of sections) {
    const blocks = section.blocks;
    const out = [];
    let i = 0;
    while (i < blocks.length) {
      const b = blocks[i];
      const level = (b.type === 'sub-title' && b.tab) ? 'sub'
        : (b.type === 'card' && b.tab) ? 'card' : null;
      if (!level) { out.push(b); i++; continue; }

      // 收集連續帶標記的 heading run，切成 panes
      const panes = [];
      while (i < blocks.length) {
        const h = blocks[i];
        const isHead = level === 'sub'
          ? (h.type === 'sub-title' && h.tab)
          : (h.type === 'card' && h.tab);
        if (!isHead) break;
        const paneBlocks = [h];
        i++;
        while (i < blocks.length) {
          const nb = blocks[i];
          if (level === 'sub' && nb.type === 'sub-title') break;
          if (level === 'card' && (nb.type === 'sub-title' || nb.type === 'card')) break;
          paneBlocks.push(nb);
          i++;
        }
        const last = panes[panes.length - 1];
        if (last && last.label === h.tab) last.blocks.push(...paneBlocks);
        else panes.push({ label: h.tab, key: h.tabKey, blocks: paneBlocks });
      }

      seq++;
      const gid = `tabs-${seq}`;
      const tabBar = { type: 'tab-bar', group: gid, level, tabs: panes.map(p => ({ label: p.label, key: p.key || tabColorKey(p.label) })) };
      out.push(tabBar);
      panes.forEach((p, pi) => {
        for (const pb of p.blocks) {
          pb.tabGroup = gid;
          pb.tabPane = pi;
          pb.tabLevel = level;
          // 全版區塊（lab/qa 等）自身不帶 [工具名] 標記，但列印／簡報展開時
          // 需要 chip 標示所屬分頁 —— 補上 pane 的 label 與配色 key
          if (FULL_PAGE_BLOCKS.has(pb.type) && !pb.tab) {
            pb.tab = p.label;
            pb.tabKey = p.key || tabColorKey(p.label);
          }
        }
        out.push(...p.blocks);
      });

      // ── TOC 收合：## 級群組內同名小節在側邊欄只留一筆 ──
      // 各 pane 講同一主題（剝除 [工具名] 後標題相同）時，重複條目自 subs 移除；
      // 收合到只剩一筆時，錨點改指到分頁列（分頁列永遠可見 → 點擊只捲動、
      // 不切換使用者選中的分頁；scroll-spy 的「最近前一個 TOC 錨點」規則會把
      // 群組內所有 pane 的錨點都映回這一筆）。標題相異的群組維持逐條收錄。
      if (level === 'sub') {
        const groupSubIds = new Set();
        for (const p of panes) for (const pb of p.blocks) if (pb.type === 'sub-title') groupSubIds.add(pb.id);
        const seen = new Map();
        const dropped = new Set();
        for (const s of section.subs) {
          if (!groupSubIds.has(s.id)) continue;
          const key = stripInlineMarkdown(s.title);
          if (seen.has(key)) dropped.add(s.id);
          else seen.set(key, s);
        }
        if (dropped.size > 0) {
          section.subs = section.subs.filter(s => !dropped.has(s.id));
          if (seen.size === 1) {
            const only = seen.values().next().value;
            tabBar.id = uniqueId('tabs-' + (generateId(stripInlineMarkdown(only.title)) || 'group'));
            only.id = tabBar.id; // 原 sub-title 的 id 保留在各 pane 標題上，深連結不受影響
          }
        }
      }
    }
    section.blocks = out;
  }
}

// ── 一般條列／編號清單（支援 1 層巢狀） ──

function getListMarker(line) {
  const m = line.match(/^(\s*)(\d+\.|-)\s+(.*)$/);
  if (!m) return null;
  if (m[2] === '-' && /^\[(x|green|orange|purple|blue)\]/.test(m[3])) return null;
  return { indent: m[1].length, marker: m[2] === '-' ? 'ul' : 'ol', text: m[3] };
}

function isListItemLine(line, requiredIndent) {
  const info = getListMarker(line);
  return info !== null && info.indent === requiredIndent;
}

function parseListBlock(lines, startIdx, baseIndent, depth) {
  const firstInfo = getListMarker(lines[startIdx]);
  const ordered = firstInfo.marker === 'ol';
  const items = [];
  let i = startIdx;

  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '') { i++; continue; }

    const info = getListMarker(line);

    if (info && info.indent === baseIndent) {
      items.push({ text: inlineFormat(info.text.trim()), children: null });
      i++;
      continue;
    }

    if (info && info.indent > baseIndent && items.length > 0) {
      if (depth >= 1) {
        items[items.length - 1].text += ' ' + inlineFormat(info.text.trim());
        i++;
        continue;
      }
      const parsed = parseListBlock(lines, i, info.indent, depth + 1);
      items[items.length - 1].children = parsed.block;
      i = parsed.nextIdx;
      continue;
    }

    if (!info && items.length > 0 && line.search(/\S/) > baseIndent) {
      items[items.length - 1].text += ' ' + inlineFormat(line.trim());
      i++;
      continue;
    }

    break;
  }

  return { block: { type: 'list', ordered, items }, nextIdx: i };
}

// ── 主 parser ──

export function parseContent(md) {
  const lines = md.replace(/^﻿/, '').replace(/\r\n?/g, '\n').split('\n');
  const sections = [];
  const headerBlocks = [];
  const preSection = { blocks: headerBlocks };
  let current = preSection;
  let currentSub = null;
  let i = 0;
  let sectionNum = 0;
  let subNum = 0;
  const usedIds = new Set();

  // ── Branch 區段狀態 ──
  let currentBranch = null;   // 目前繼承中的分支名（主線為 null）
  let curSeg = 0;             // 區段序號，每次分支狀態變化遞增
  const branchSegments = [];  // 每個分支區段一筆（含起止錨點），供左側 git rail 渲染
  let openSeg = null;         // 目前開放中的分支區段（用於回填 endAnchorId）

  // 依標題上的 branch token 更新區段狀態。切換或結束時，回填上一區段的 endAnchorId（= 此標題錨點）。
  function enterBranch(token, anchorId, label) {
    if (token.isNone) {
      if (currentBranch !== null) {
        curSeg++;
        currentBranch = null;
        if (openSeg) { openSeg.endAnchorId = anchorId; openSeg.endKind = 'none'; openSeg = null; }
      }
    } else if (token.branch !== undefined && token.branch !== currentBranch) {
      curSeg++;
      currentBranch = token.branch;
      if (openSeg) { openSeg.endAnchorId = anchorId; openSeg.endKind = 'branch'; }
      // endKind 預設 'end'（最後未被 close 的區段 = 延伸到內容結尾）
      openSeg = { seg: curSeg, branch: token.branch, key: branchColorKey(token.branch), anchorId, endAnchorId: null, endKind: 'end', label };
      branchSegments.push(openSeg);
    }
  }

  function uniqueId(base) {
    const seed = base || 'section';
    let candidate = seed;
    let suffix = 2;
    while (usedIds.has(candidate)) {
      candidate = `${seed}-${suffix}`;
      suffix++;
    }
    usedIds.add(candidate);
    return candidate;
  }

  // 依 registry 嘗試解析區塊元件；認領成功時推入 current.blocks 並回傳新的行號
  function tryBlocks(defs, idx) {
    for (const def of defs) {
      if (def.test(lines[idx], lines[idx + 1])) {
        const { block, nextIdx } = def.parse(lines, idx);
        if (block && current) current.blocks.push(block);
        return nextIdx;
      }
    }
    return -1;
  }

  while (i < lines.length) {
    const line = lines[i];

    if (/^---\s*$/.test(line.trim())) { i++; continue; }

    if (/^# /.test(line)) {
      let title = line.replace(/^# /, '').trim();
      const bt = extractBranch(title);
      title = bt.title;
      // 非編號章節：標題以 emoji 開頭 → 用該 emoji 取代 1/2/3 數字序號，且不計入章節編號
      let icon = null;
      const iconMatch = title.match(SECTION_ICON_RE);
      if (iconMatch) {
        icon = iconMatch[1];
        title = iconMatch[2].trim();
      } else {
        sectionNum++;
      }
      let label, h2;
      const colonMatch = title.match(/^(.+?)[：:]\s*(.+)/);
      if (colonMatch) {
        label = colonMatch[1].trim();
        h2 = colonMatch[2].trim();
      } else {
        label = title;
        h2 = title;
      }

      const id = uniqueId(generateId(title) || `section-${sectionNum || 'x'}`);
      enterBranch(bt, id, stripInlineMarkdown(label));
      current = { type: 'section', num: icon ? null : sectionNum, icon, label, h2, id, seg: curSeg, branch: currentBranch, lead: '', subs: [], blocks: [] };
      currentSub = null;
      sections.push(current);

      if (i + 1 < lines.length && /^> /.test(lines[i + 1]) && !/^> \*\*/.test(lines[i + 1])) {
        i++;
        let lead = lines[i].replace(/^> /, '');
        while (i + 1 < lines.length && /^> /.test(lines[i + 1]) && !/^> \*\*/.test(lines[i + 1])) {
          i++;
          lead += '\n' + lines[i].replace(/^> /, '');
        }
        current.lead = lead.trim();
      }
      i++; continue;
    }

    if (/^## /.test(line)) {
      let title = line.replace(/^## /, '').trim();
      const bt = extractBranch(title);
      title = bt.title;
      const tt = extractTab(title);
      title = tt.title;
      subNum++;
      const subId = uniqueId('sub-' + (generateId(title) || `section-${subNum}`));
      enterBranch(bt, subId, stripInlineMarkdown(title));
      currentSub = { title, id: subId, seg: curSeg, branch: currentBranch };
      if (current) {
        current.subs.push(currentSub);
        const subBlock = { type: 'sub-title', title, id: subId, seg: curSeg, branch: currentBranch };
        if (tt.tab) { subBlock.tab = tt.tab; subBlock.tabKey = resolveTabKey(tt.tab, tt.tabColor); }
        current.blocks.push(subBlock);
      }
      i++; continue;
    }

    // ── 區塊元件（卡片之前檢查的組：youtube / image-text / image / table）──
    {
      const next = tryBlocks(PRE_CARD_BLOCKS, i);
      if (next >= 0) { i = next; continue; }
    }

    if (/^### /.test(line)) {
      let title = line.replace(/^### /, '').trim();
      const bt = extractBranch(title);
      title = bt.title;
      const tt = extractTab(title);
      title = tt.title;
      const hasBranchToken = bt.isNone || bt.branch !== undefined;
      const emojiMatch = title.match(CARD_ICON_RE);
      const icon = emojiMatch ? emojiMatch[1] : '';
      const cardTitle = emojiMatch ? emojiMatch[2] : title;
      let cardId;
      if (hasBranchToken) {
        // 帶 branch token 的卡片需有 id 作為 scroll-spy / 浮層跳轉錨點
        cardId = uniqueId('card-' + (generateId(title) || 'card'));
        enterBranch(bt, cardId, stripInlineMarkdown(cardTitle));
      }
      const card = { type: 'card', icon, title: cardTitle, items: [], seg: curSeg, branch: currentBranch };
      if (cardId) card.id = cardId;
      if (tt.tab) { card.tab = tt.tab; card.tabKey = resolveTabKey(tt.tab, tt.tabColor); }

      i++;
      let childIndent = -1; // 目前 li 的子列點縮排基準（同 loose list，最多 1 層巢狀）
      while (i < lines.length) {
        const cl = lines[i];
        if (/^#{1,4} /.test(cl) || /^---\s*$/.test(cl.trim())) break;
        // 任何 registry 區塊的起點都結束卡片（新元件自動涵蓋，不需要另外維護清單）
        if (isBlockStart(cl, lines[i + 1])) break;

        // Blank line after content → end this card, let remaining lines parse independently
        if (cl.trim() === '' && card.items.length > 0) {
          i++;
          break;
        }

        const nestedM = cl.match(/^(\s+)- (.*)$/);
        if (/^- /.test(cl) && !/^- \[/.test(cl)) {
          card.items.push({ type: 'li', text: inlineFormat(cl.replace(/^- /, '').trim()) });
          childIndent = -1;
        } else if (nestedM && !/^\[/.test(nestedM[2]) && card.items.length > 0 && card.items[card.items.length - 1].type === 'li') {
          const last = card.items[card.items.length - 1];
          if (childIndent === -1) childIndent = nestedM[1].length;
          if (nestedM[1].length > childIndent && last.children && last.children.length) {
            // 更深的子項併入上一個子項的文字（同 loose list 的 depth 上限行為）
            last.children[last.children.length - 1] += ' ' + inlineFormat(nestedM[2].trim());
          } else {
            (last.children ||= []).push(inlineFormat(nestedM[2].trim()));
          }
        } else if (cl.trim() !== '') {
          card.items.push({ type: 'p', text: inlineFormat(cl.trim()) });
        }
        i++;
      }
      if (current) current.blocks.push(card);
      continue;
    }

    if (/^#### /.test(line) && current) {
      const title = line.replace(/^#### /, '').trim();
      current.blocks.push({ type: 'minor-title', title });
      i++;
      continue;
    }

    // ── 區塊元件（其餘：prompt / [flow] / [tags] / insight / checklist …）──
    {
      const next = tryBlocks(POST_CARD_BLOCKS, i);
      if (next >= 0) { i = next; continue; }
    }

    if (isListItemLine(line, 0) && current) {
      const { block, nextIdx } = parseListBlock(lines, i, 0, 0);
      current.blocks.push(block);
      i = nextIdx;
      continue;
    }

    if (line.trim() !== '' && current && !/^#{1,4} /.test(line)) {
      current.blocks.push({ type: 'paragraph', text: inlineFormat(line.trim()) });
      i++; continue;
    }

    i++;
  }

  assignTabGroups(sections, uniqueId);

  return { sections, headerBlocks, branchSegments };
}

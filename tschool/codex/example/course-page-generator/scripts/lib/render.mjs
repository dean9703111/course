// ─── HTML generators：頁面骨架（TOC / 講師 / 引言 / 章節）與結構型區塊 ───
// 區塊元件的 HTML 由 blocks.mjs registry 提供；此處負責結構型區塊
//（sub-title / group / card-items / list / paragraph）與整頁組裝。
//
// ctx：單次 build 的渲染上下文（避免模組層級的可變全域狀態）
//   ctx.branchStartMap：區段起點錨點 id → 區段資料（branch flag 用）

import { esc, raw, inlineFormat, inlineFormatWithBreaks, stripInlineMarkdown, tabTag } from './text.mjs';
import { BLOCK_RENDERERS, FULL_PAGE_BLOCKS } from './blocks.mjs';

// ── Social SVG icons ──

const SOCIAL_SVGS = {
  Medium: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zm7.42 0c0 3.54-1.51 6.42-3.38 6.42S14.2 15.54 14.2 12s1.51-6.42 3.38-6.42 3.38 2.88 3.38 6.42zm2.94 0c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75c.66 0 1.19 2.58 1.19 5.75z"/></svg>',
  Facebook: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
  Threads: '<svg width="16" height="16" viewBox="0 0 878 1000" fill="currentColor"><path d="M446.7,1000h-0.3c-149.2-1-263.9-50.2-341-146.2C36.9,768.3,1.5,649.4,0.3,500.4v-0.7c1.2-149.1,36.6-267.9,105.2-353.4C182.5,50.2,297.3,1,446.4,0h0.3h0.3c114.4,0.8,210.1,30.2,284.4,87.4c69.9,53.8,119.1,130.4,146.2,227.8l-85,23.7c-46-165-162.4-249.3-346-250.6c-121.2,0.9-212.9,39-272.5,113.2C118.4,271,89.6,371.4,88.5,500c1.1,128.6,29.9,229,85.7,298.5c59.6,74.3,151.3,112.4,272.5,113.2c109.3-0.8,181.6-26.3,241.7-85.2c68.6-67.2,67.4-149.7,45.4-199.9c-12.9-29.6-36.4-54.2-68.1-72.9c-8,56.3-25.9,101.9-53.5,136.3c-36.9,45.9-89.2,71-155.4,74.6c-50.1,2.7-98.4-9.1-135.8-33.4c-44.3-28.7-70.2-72.5-73-123.5c-2.7-49.6,17-95.2,55.4-128.4c36.7-31.7,88.3-50.3,149.3-53.8c44.9-2.5,87-0.5,125.8,5.9c-5.2-30.9-15.6-55.5-31.2-73.2c-21.4-24.4-54.5-36.8-98.3-37.1c-0.4,0-0.8,0-1.2,0c-35.2,0-83,9.7-113.4,55L261.2,327c40.8-60.6,107-94,186.6-94c0.6,0,1.2,0,1.8,0c133.1,0.8,212.4,82.3,220.3,224.5c4.5,1.9,9,3.9,13.4,5.9c62.1,29.2,107.5,73.4,131.4,127.9c33.2,75.9,36.3,199.6-64.5,298.3C673.1,965,579.6,999.1,447,1000L446.7,1000L446.7,1000z M488.5,512.9c-10.1,0-20.3,0.3-30.8,0.9c-76.5,4.3-124.2,39.4-121.5,89.3c2.8,52.3,60.5,76.6,116,73.6c51-2.7,117.4-22.6,128.6-154.6C552.6,516,521.7,512.9,488.5,512.9z"/></svg>',
  YouTube: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
  GitHub: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>',
  LinkedIn: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
  Email: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>',
};

export function socialLink(platform, url) {
  const svg = SOCIAL_SVGS[platform] || '';
  return `<a href="${esc(url)}" target="_blank" rel="noopener">${svg} ${esc(platform)}</a>`;
}

// ── TOC ──

export function buildTocItems(sections) {
  let html = '';
  html += `<li class="toc-group" data-section="instructor">
      <a href="#instructor" class="toc-group-title">
        <span class="toc-num">\u{1F464}</span> 講師簡介
      </a>
      <ul class="toc-sub"></ul>
    </li>\n`;

  for (const sec of sections) {
    const navLabel = sec.label.replace(/[：:].*/, '').trim();
    const numDisplay = sec.icon ? sec.icon : (sec.label === '總結' ? '★' : sec.num);
    html += `    <li class="toc-group" data-section="${sec.id}">
      <a href="#${sec.id}" class="toc-group-title">
        <span class="toc-num">${numDisplay}</span> ${esc(navLabel)}
      </a>
      <ul class="toc-sub">\n`;
    for (const sub of sec.subs) {
      html += `        <li><a href="#${sub.id}">${esc(stripInlineMarkdown(sub.title))}</a></li>\n`;
    }
    html += `      </ul>
    </li>\n`;
  }
  return html;
}

// ── Branch 指示線 ──

// 在區段起點標題前插入的 branch tag（真實內容流元件，佔垂直空間、不疊加；非起點回傳空字串）。
// 點擊可複製分支名稱：data-branch 保存原始名稱（複製來源），避免複製回饋文字污染。
function branchFlag(anchorId, ctx) {
  const s = anchorId && ctx.branchStartMap.get(anchorId);
  if (!s) return '';
  return `<span class="branch-flag branch-flag--${s.key}" data-anchor="${anchorId}" data-branch="${esc(s.branch)}" role="button" tabindex="0" title="點擊複製分支名稱">${esc(s.branch)}</span>`;
}

// 每個分支區段一個 rail 容器（CSS 以 border 畫彎出+竪線+彎入+收尾）；JS 定位連到對應的 branch-flag。
// data-anchor=區段起點標題、data-end=區段結束標題（無則延伸到內容結尾）。
export function buildBranchTags(branchSegments) {
  if (!branchSegments || branchSegments.length === 0) return '';
  return branchSegments.map(n =>
    `<div class="branch-seg branch-seg--${n.key}" data-anchor="${n.anchorId}"${n.endAnchorId ? ` data-end="${n.endAnchorId}"` : ''} data-endkind="${n.endKind}" data-branch="${esc(n.branch)}"></div>`
  ).join('\n      ');
}

// ── 講師 / 引言 / 頁尾 ──

export function buildInstructor(cfg) {
  const inst = cfg.instructor || {};
  const placeholderHtml = '<div class="instructor-avatar-placeholder">\u{1F464}</div>';
  const onerrorHtml = placeholderHtml.replace(/"/g, '&quot;').replace(/'/g, "\\'");
  const avatar = inst.avatar
    ? `<img class="instructor-avatar" src="${esc(inst.avatar)}" alt="${esc(inst.name)}" onerror="this.outerHTML='${onerrorHtml}';">`
    : placeholderHtml;

  const statsHtml = (inst.stats || []).map(s => {
    const label = s.value
      ? `${raw(s.icon)} ${esc(s.text)} <strong>${esc(s.value)}</strong> ${esc(s.unit)}`
      : inlineFormat(s.text || '');
    return `<a href="${esc(s.url)}" target="_blank" rel="noopener">${label}</a>`;
  }).join('\n          ');

  const socialsHtml = (inst.socials || []).map(s =>
    `          ${socialLink(s.platform, s.url)}`
  ).join('\n');

  return `<section class="section">
  <div class="reveal">
    <span class="section-label" id="instructor"><span class="num">\u{1F464}</span> 講師簡介</span>
    <h2>關於講師</h2>
  </div>
  <div class="reveal">
    <div class="instructor">
      ${avatar}
      <div class="instructor-info">
        <h3>${esc(inst.name)}</h3>
        <div class="tagline">${esc(inst.tagline)}</div>
        <p>${esc(inst.bio).replace(/&lt;br\s*\/?&gt;/gi, '<br>')}</p>
        <div class="instructor-stats">
          ${statsHtml}
        </div>
        <div class="social-links">
${socialsHtml}
        </div>
      </div>
    </div>
  </div>
</section>`;
}

export function buildQuote(quoteObj) {
  if (!quoteObj || !quoteObj.text) return '';
  const authorHtml = quoteObj.author
    ? `\n    <div class="quote-author">— ${esc(quoteObj.author)}</div>` : '';
  return `<section class="quote-page">
  <div class="reveal">
    <div class="quote-mark">“</div>
    <blockquote>${raw(quoteObj.text)}</blockquote>${authorHtml}
    <div class="quote-line"></div>
  </div>
</section>`;
}

export function buildFooterSocials(cfg) {
  if (!cfg.footer?.show_socials) return '';
  const socials = cfg.instructor?.socials || [];
  if (!socials.length) return '';

  let html = `<p style="font-size:.9rem;color:var(--text);margin-bottom:1rem">${esc(cfg.footer.cta || '')}</p>
  <div class="social-links" style="justify-content:center;margin-bottom:1.5rem">\n`;
  for (const s of socials) {
    html += `    ${socialLink(s.platform, s.url)}\n`;
  }
  html += `  </div>`;
  return html;
}

// ── 結構型區塊 ──

// Collect all blocks under a ### into a group (until next ### / sub-title / end)
export function groupBlocks(blocks) {
  const result = [];
  let i = 0;
  while (i < blocks.length) {
    const b = blocks[i];
    if (b.type === 'card') {
      const group = { type: 'group', icon: b.icon, title: b.title, id: b.id, seg: b.seg, children: [] };
      if (b.tabGroup) {
        group.tabGroup = b.tabGroup;
        group.tabPane = b.tabPane;
        group.tabLevel = b.tabLevel;
        if (b.tab) { group.tab = b.tab; group.tabKey = b.tabKey; }
      }
      if (b.items.length > 0) {
        group.children.push({ type: 'card-items', items: b.items });
      }
      i++;
      while (i < blocks.length) {
        const nb = blocks[i];
        if (nb.type === 'card' || nb.type === 'sub-title' || nb.type === 'tab-bar') break;
        group.children.push(nb);
        i++;
      }
      result.push(group);
    } else {
      result.push(b);
      i++;
    }
  }
  return result;
}

function renderListBlock(block, depth) {
  const tag = block.ordered ? 'ol' : 'ul';
  const cls = `loose-list${block.ordered ? ' ordered' : ''}${depth > 0 ? ' nested' : ''}`;
  const pad = '      '.padEnd(6 + depth * 2);
  let s = `<${tag} class="${cls}">\n`;
  for (const item of block.items) {
    s += `${pad}<li>${item.text}`;
    if (item.children && item.children.items && item.children.items.length) {
      s += `\n${pad}  ${renderListBlock(item.children, depth + 1)}\n${pad}`;
    }
    s += `</li>\n`;
  }
  s += `${pad.slice(2)}</${tag}>`;
  return s;
}

// Returns inner HTML for a block (no reveal wrapper) — used for both top-level and group children
export function renderBlockBody(block, ctx) {
  switch (block.type) {
    case 'sub-title':
      return branchFlag(block.id, ctx) + `<div class="sub-title" id="${block.id}" data-seg="${block.seg}"><span class="bar"></span>${inlineFormat(block.title)}${tabTag(block)}</div>`;

    case 'tab-bar': {
      const lvl = block.level === 'card' ? 'card' : 'sub';
      const btns = block.tabs.map((t, idx) =>
        `<button class="tab-btn tab-btn--${t.key}${idx === 0 ? ' is-active' : ''}" role="tab" aria-selected="${idx === 0}" data-tabgroup="${block.group}" data-pane="${idx}">${esc(t.label)}</button>`
      ).join('\n        ');
      // block.id 僅在 TOC 收合（同名 ## 群組）時存在，作為側邊欄單一條目的錨點
      return `<div class="tab-bar tab-bar--${lvl}"${block.id ? ` id="${block.id}"` : ''} role="tablist" data-tabgroup="${block.group}">\n        ${btns}\n      </div>`;
    }

    case 'minor-title':
      return `<h4 class="minor-title">${inlineFormat(block.title)}</h4>`;

    case 'card-items': {
      let s = '';
      let inList = false;
      for (const item of block.items) {
        if (item.type === 'li') {
          if (!inList) { s += `<ul>\n`; inList = true; }
          if (item.children && item.children.length) {
            s += `  <li>${item.text}\n    <ul class="nested">\n`;
            for (const c of item.children) s += `      <li>${c}</li>\n`;
            s += `    </ul>\n  </li>\n`;
          } else {
            s += `  <li>${item.text}</li>\n`;
          }
        } else {
          if (inList) { s += `</ul>\n`; inList = false; }
          s += `<p>${item.text}</p>\n`;
        }
      }
      if (inList) s += `</ul>`;
      return s.trimEnd();
    }

    case 'group': {
      const childrenHtml = block.children
        .map(c => `        ${renderBlockBody(c, ctx)}`)
        .join('\n');
      const groupAttrs = `${block.id ? ` id="${block.id}"` : ''}${block.seg != null ? ` data-seg="${block.seg}"` : ''}`;
      return branchFlag(block.id, ctx) + `<div class="group-block"${groupAttrs}>
      <div class="group-header">${block.icon ? `<span class="icon">${block.icon}</span> ` : ''}${inlineFormat(block.title)}${tabTag(block)}</div>
      <div class="group-body">
${childrenHtml}
      </div>
    </div>`;
    }

    case 'list':
      return renderListBlock(block, 0);

    case 'paragraph':
      return `<p class="loose-text">${block.text}</p>`;

    default: {
      const render = BLOCK_RENDERERS.get(block.type);
      return render ? render(block, ctx) : '';
    }
  }
}

// ── 章節組裝 ──

// 工具分頁：reveal wrapper／全版 section 的 class 與 data 屬性。
// pane 0 預設作用中；非作用中 pane 由 CSS display:none 隱藏，JS 切換。
function tabPaneClass(block) {
  if (!block || block.tabGroup == null) return '';
  return ` tab-pane-el tab-pane-el--${block.tabLevel === 'card' ? 'card' : 'sub'}${block.tabPane === 0 ? ' tab-pane-active' : ''}`;
}
function tabPaneAttrs(block) {
  if (!block || block.tabGroup == null) return '';
  return ` data-tabgroup="${block.tabGroup}" data-tabpane="${block.tabPane}"`;
}

export function buildContentSections(sections, headerBlocks = [], ctx) {
  let html = '';

  if (headerBlocks && headerBlocks.length > 0) {
    const grouped = groupBlocks(headerBlocks);
    if (grouped.length > 0) {
      html += `\n<section class="section section--header">\n`;
      for (const block of grouped) {
        const inner = renderBlockBody(block, ctx);
        if (!inner) continue;
        html += `  <div class="reveal">\n    ${inner}\n  </div>\n`;
      }
      html += `</section>\n`;
    }
  }

  for (const sec of sections) {
    // Split blocks into segments at full-page block boundaries (qa/lab/survey/interactive)
    // to preserve their position in output
    const segments = [];
    let buf = [];
    for (const b of sec.blocks) {
      if (FULL_PAGE_BLOCKS.has(b.type)) {
        segments.push({ regular: buf, special: b });
        buf = [];
      } else {
        buf.push(b);
      }
    }
    if (buf.length > 0 || segments.length === 0) segments.push({ regular: buf, special: null });

    const hasAnyRegular = segments.some(s => s.regular.length > 0);
    let headerDone = false;
    let specialIdx = 0;

    for (const seg of segments) {
      const grouped = groupBlocks(seg.regular);

      if (grouped.length > 0) {
        html += `\n<hr class="divider">
<section class="section">`;
        if (!headerDone) {
          html += `
  <div class="reveal">
    ${branchFlag(sec.id, ctx)}
    <span class="section-label" id="${sec.id}" data-seg="${sec.seg}"><span class="num">${sec.icon ? sec.icon : (sec.label === '總結' ? '★' : sec.num)}</span> ${esc(sec.label.replace(/[：:].*/, '').trim())}</span>
    <h2>${esc(sec.h2)}</h2>
    ${sec.lead ? `<p class="lead">${inlineFormatWithBreaks(sec.lead)}</p>` : ''}
  </div>\n`;
          headerDone = true;
        }

        for (const block of grouped) {
          const inner = renderBlockBody(block, ctx);
          if (!inner) continue;
          const extraClass = block.type === 'bonus' ? ' bonus-btn-wrap' : (block.type === 'tab-bar' ? ` tab-bar-wrap tab-bar-wrap--${block.level === 'card' ? 'card' : 'sub'}` : '');
          html += `\n  <div class="reveal${extraClass}${tabPaneClass(block)}"${tabPaneAttrs(block)}>\n    ${inner}\n  </div>\n`;
        }
        html += `</section>\n`;
      }

      if (seg.special) {
        specialIdx++;
        const { pageClass, suffix } = FULL_PAGE_BLOCKS.get(seg.special.type);
        const qaId = hasAnyRegular
          ? `${sec.id}-${suffix}${specialIdx > 1 ? `-${specialIdx}` : ''}`
          : sec.id;
        html += `\n<hr class="divider${tabPaneClass(seg.special)}"${tabPaneAttrs(seg.special)}>
<section class="${pageClass}${tabPaneClass(seg.special)}"${tabPaneAttrs(seg.special)} id="${qaId}">
  ${renderBlockBody(seg.special, ctx)}
</section>\n`;
      }
    }
  }

  return html;
}

/**
 * lint.mjs — criteria 檢查（Define → Eval 的機器可判定部分）
 *
 * errors（阻擋 build）：
 *   deck.count / deck.cover / deck.summary   結構
 *   cover.hook                            封面缺 !!…!! 或 ==…== 強調記號
 *   chars                                 超過該卡型字數上限
 *   point.single                          一張 @point 出現多個 ##（一卡一概念）
 *   summary.recap / summary.source        結尾卡缺重點回顧／缺「依據：」出處
 *   forbidden                             出現禁用語（AI 腔）
 *
 * warnings（列出但不擋）：
 *   numbers        含 %、N 倍等統計式數字 → 需確認出自素材（反捏造）
 *   cover.count    封面寫「N 張」但與實際卡數不符
 *   cover.readability 封面主標行數／每行字數偏多
 *   point.component 整卡皆裸段落，建議至少 1 個結構元件
 *   rhythm         相鄰兩卡主元件相同（視覺節奏）
 *   flow.hotstep   flow 的 * 落在最後一步／一個 flow 多個 *／每個 flow 都有 *（習慣性標記）
 *
 * CLI：node lint.mjs <deck-dir>
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseDeck, cardText, charCount } from './dsl.mjs';
import { loadConfig, applyFrontmatter } from './config.mjs';

const MAIN_PRIORITY = ['code', 'flow', 'ol', 'ul', 'quote'];
const COMPONENTS = ['ol', 'ul', 'ok', 'no', 'warn', 'tip', 'flow', 'quote', 'code'];
const BACKGROUNDS = ['minimal', 'grid', 'gradient', 'halo'];
const LAYOUT_MODES = ['tutorial', 'punchy', 'editorial'];
const COVER_VISUALS = ['none', 'pain-flow'];
const RHYTHMS = ['steady', 'varied'];

function backgroundStyle(bg) {
  if (typeof bg === 'string') return bg;
  if (bg && typeof bg === 'object') return bg.style || bg.type || '';
  return '';
}

function mainComponent(card) {
  for (const t of MAIN_PRIORITY) if (card.blocks.some((b) => b.t === t)) return t;
  return 'text';
}

function coverLines(card, type) {
  return card.blocks.filter((b) => b.t === type).map((b) => b.txt || b.raw || '');
}

function runCoverReadabilityChecks(card, warn) {
  const h1 = coverLines(card, 'h1');
  const body = card.blocks
    .filter((b) => b.t === 'p' || b.t === 'quote')
    .flatMap((b) => String(b.txt || '').split('\n').filter(Boolean));

  if (h1.length > 2)
    warn(1, 'cover.readability', `封面主標 ${h1.length} 行，建議壓到 2 行以內，3 秒內看得懂主題`);
  h1.forEach((line) => {
    if (charCount(line) > 13)
      warn(1, 'cover.readability', `封面主標「${line}」偏長，建議每行 8–13 字`);
  });
  body.forEach((line) => {
    if (charCount(line) > 20)
      warn(1, 'cover.readability', `封面副標「${line}」偏長，建議拆成 1–2 短句`);
  });
}

export function runLint(deck, cfg) {
  const C = cfg.criteria;
  const E = [], W = [];
  const err = (card, rule, msg) => E.push({ card, rule, msg });
  const warn = (card, rule, msg) => W.push({ card, rule, msg });
  const n = deck.cards.length;

  if (n < C.cards.min || n > C.cards.max)
    err(0, 'deck.count', `共 ${n} 張，須介於 ${C.cards.min}–${C.cards.max} 張`);
  if (deck.cards[0]?.type !== 'cover')
    err(1, 'deck.cover', '第 1 張必須是 @cover');
  if (deck.cards[n - 1]?.type !== 'summary')
    err(n, 'deck.summary', '最後 1 張必須是 @summary（重點回顧）');

  const bg = backgroundStyle(cfg.brand.background);
  if (bg && !BACKGROUNDS.includes(bg))
    err(0, 'config.background', `brand.background 必須是 ${BACKGROUNDS.join(' / ')}，目前是「${bg}」`);
  const layout = cfg.brand.layout || {};
  if (layout.mode && !LAYOUT_MODES.includes(layout.mode))
    err(0, 'config.layout', `brand.layout.mode 必須是 ${LAYOUT_MODES.join(' / ')}，目前是「${layout.mode}」`);
  const cv = layout.cover_visual || layout.coverVisual;
  if (cv && !COVER_VISUALS.includes(cv))
    err(0, 'config.layout', `brand.layout.cover_visual 必須是 ${COVER_VISUALS.join(' / ')}，目前是「${cv}」`);
  if (layout.rhythm && !RHYTHMS.includes(layout.rhythm))
    err(0, 'config.layout', `brand.layout.rhythm 必須是 ${RHYTHMS.join(' / ')}，目前是「${layout.rhythm}」`);

  const flowStats = { total: 0, hot: 0 };

  deck.cards.forEach((c, i) => {
    const no = i + 1;
    const text = cardText(c);
    const len = charCount(text);
    const limit = c.type === 'cover' ? C.chars.cover
      : c.type === 'summary' ? C.chars.summary : C.chars.point;
    if (len > limit)
      err(no, 'chars', `${len} 字 > 上限 ${limit}，請精簡（計字不含 badge 與程式碼）`);

    if (c.type === 'cover' && !/!![^!\n]+!!|==[^=\n]+==/.test(c.raw))
      err(no, 'cover.hook', '封面缺強調記號：至少一處 !!衝擊!! 或 ==標記==');
    if (c.type === 'cover') runCoverReadabilityChecks(c, warn);

    if (c.type === 'point') {
      const h2 = c.blocks.filter((b) => b.t === 'h2').length;
      if (h2 > 1) err(no, 'point.single', `出現 ${h2} 個 ## —— 一卡一概念，請拆卡`);
      if (!c.blocks.some((b) => COMPONENTS.includes(b.t)))
        warn(no, 'point.component', '整卡皆裸段落，建議至少 1 個結構元件（清單/對照/flow/引言…）');
    }

    if (c.type === 'summary') {
      if (C.require_recap && !c.blocks.some((b) => ['ol', 'ul', 'tip', 'quote'].includes(b.t)))
        err(no, 'summary.recap', '結尾卡缺重點回顧：至少 1 個條列／[tip]／引言');
      if (C.require_source && !/(依據|來源|出處)[：:]/.test(text))
        err(no, 'summary.source', '結尾卡缺出處，格式：依據：<文件名／條號>');
    }

    for (const f of C.forbidden)
      if (text.includes(f)) err(no, 'forbidden', `出現禁用語「${f}」`);

    // flow 強調節點：* 只標本卡在講的那一步，不是最後一步
    for (const b of c.blocks.filter((x) => x.t === 'flow')) {
      const parts = String(b.raw || '').split(/->/).map((s) => s.trim()).filter(Boolean);
      const hots = parts.map((p, k) => (p.startsWith('*') ? k : -1)).filter((k) => k >= 0);
      flowStats.total++;
      if (hots.length) flowStats.hot++;
      if (hots.length > 1)
        warn(no, 'flow.hotstep', `flow 有 ${hots.length} 個強調節點，只留這張卡在講的那一步`);
      if (hots.length === 1 && hots[0] === parts.length - 1)
        warn(no, 'flow.hotstep',
          `強調節點「${parts[hots[0]].slice(1).trim()}」落在最後一步 —— 確認這一步真的是本卡重點；導覽路徑或沒有特定重點就拿掉 *`);
    }

    if (!C.allow_unverified_numbers) {
      const m = text.match(/\d+(?:\.\d+)?\s*%|\d+\s*倍/g);
      if (m) warn(no, 'numbers',
        `含統計式數字（${[...new Set(m)].join('、')}）—— 確認出自素材可考證，否則改用非數字 hook`);
    }
  });

  // 封面「N 張」與實際卡數一致性
  if (deck.cards[0]) {
    const cm = cardText(deck.cards[0]).match(/(\d+)\s*張/);
    if (cm && Number(cm[1]) !== n)
      warn(1, 'cover.count', `封面寫「${cm[1]} 張」但實際 ${n} 張`);
  }

  // 每個 flow 都有 *，多半是習慣性標記
  if (flowStats.total >= 2 && flowStats.hot === flowStats.total)
    warn(0, 'flow.hotstep', `${flowStats.total} 個 flow 全都有強調節點 —— 只保留真的在講某一步的那幾張，其餘拿掉 *`);

  // 相鄰卡節奏
  for (let i = 1; i < n - 1; i++) {
    const a = mainComponent(deck.cards[i]);
    if (a !== 'text' && a === mainComponent(deck.cards[i + 1]))
      warn(i + 2, 'rhythm', `與上一卡主元件相同（${a}），建議換版型維持滑動節奏`);
  }

  return { errors: E, warns: W };
}

export function printReport(rep, deck) {
  console.log('── Lint Report ──────────────────────────');
  if (!rep.errors.length && !rep.warns.length) {
    console.log(`✔ 全部通過 · ${deck.cards.length} 張卡`);
  } else {
    for (const e of rep.errors) console.log(`✘ 卡 ${e.card} · ${e.rule}\n    → ${e.msg}`);
    for (const w of rep.warns) console.log(`△ 卡 ${w.card} · ${w.rule}\n    → ${w.msg}`);
  }
  console.log('─────────────────────────────────────────');
  console.log(`${rep.errors.length} error · ${rep.warns.length} warning`);
}

/* ── CLI ── */
const isCLI = process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCLI) {
  const deckDir = path.resolve(process.argv[2] || '');
  const mdPath = path.join(deckDir, 'content.md');
  if (!process.argv[2] || !fs.existsSync(mdPath)) {
    console.error('用法：node lint.mjs <deck-dir>（目錄內須有 content.md）');
    process.exit(1);
  }
  const cfg = applyFrontmatter(loadConfig(deckDir), parseDeck(fs.readFileSync(mdPath, 'utf8')).meta);
  const deck = parseDeck(fs.readFileSync(mdPath, 'utf8'));
  const rep = runLint(deck, cfg);
  printReport(rep, deck);
  process.exit(rep.errors.length ? 1 : 0);
}

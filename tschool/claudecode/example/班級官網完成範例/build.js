#!/usr/bin/env node
/*
  五年三班 班級網站產生器
  讀 content/*.md → 產生 site/index.html、site/schedule.html、site/homework.html
  不需要安裝任何套件，只要有 Node.js。

  用法：
    node build.js           產生一次
    node build.js --watch   存檔就自動重新產生（按 Ctrl+C 停止）
*/
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const CONTENT = path.join(ROOT, "content");
const SITE = path.join(ROOT, "site");

let warnings = [];
const warn = (file, msg) => warnings.push(`  ⚠️  ${file}：${msg}`);

/* ================= 小工具 ================= */

const esc = (s) => String(s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// 行內語法：**粗體**、[文字](網址)
function inline(s) {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, u) => `<a href="${u}">${t}</a>`);
}

const KV = /^([^:：]+?)\s*[:：]\s*(.+)$/;

function read(name) {
  const file = path.join(CONTENT, name);
  let text = fs.readFileSync(file, "utf8").replace(/\r\n?/g, "\n");
  text = text.replace(/<!--[\s\S]*?-->/g, ""); // 註解不輸出
  let meta = {};
  const fm = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (fm) {
    fm[1].split("\n").forEach((l) => { const m = l.match(KV); if (m) meta[m[1].trim()] = m[2].trim(); });
    text = text.slice(fm[0].length);
  }
  return { meta, lines: text.split("\n") };
}

// 依標題層級切段落：level=1 切 "# "，level=2 切 "## "…
function sections(lines, level) {
  const mark = "#".repeat(level) + " ";
  const out = [];
  let cur = { title: null, body: [] };
  for (const l of lines) {
    if (l.startsWith(mark)) { out.push(cur); cur = { title: l.slice(mark.length).trim(), body: [] }; }
    else cur.body.push(l);
  }
  out.push(cur);
  return { pre: out[0].body, list: out.slice(1) };
}

// 把一段文字切成區塊：段落、- 清單、1. 清單、表格、特定「鍵: 值」行
const SPECIAL = /^(印章|署名|電話)\s*[:：]\s*(.+)$/;
function blocks(lines) {
  const out = [];
  let cur = null;
  const flush = () => { if (cur) out.push(cur); cur = null; };
  for (const raw of lines) {
    const l = raw.trim();
    if (!l) { flush(); continue; }
    let m;
    if ((m = l.match(SPECIAL))) { flush(); out.push({ type: "kv", key: m[1], value: m[2].trim() }); continue; }
    if ((m = l.match(/^[-*]\s+(.*)$/))) {
      if (!cur || cur.type !== "ul") { flush(); cur = { type: "ul", items: [] }; }
      cur.items.push(m[1]); continue;
    }
    if ((m = l.match(/^\d+[.、]\s*(.*)$/))) {
      if (!cur || cur.type !== "ol") { flush(); cur = { type: "ol", items: [] }; }
      cur.items.push(m[1]); continue;
    }
    if (l.startsWith("|")) {
      if (!cur || cur.type !== "table") { flush(); cur = { type: "table", rows: [] }; }
      if (/^\|[\s:|-]+\|$/.test(l)) continue; // 分隔線
      cur.rows.push(l.replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim()));
      continue;
    }
    if (!cur || cur.type !== "p") { flush(); cur = { type: "p", lines: [] }; }
    cur.lines.push(l);
  }
  flush();
  return out;
}

// 一般內容轉 HTML（段落內換行保留）
function render(bs) {
  return bs.map((b) => {
    if (b.type === "p") return `<p>${b.lines.map(inline).join("<br>")}</p>`;
    if (b.type === "ul") return `<ul>${b.items.map((i) => `<li>${inline(i)}</li>`).join("")}</ul>`;
    if (b.type === "ol") return `<ol>${b.items.map((i) => `<li>${inline(i)}</li>`).join("")}</ol>`;
    return "";
  }).join("\n");
}

const find = (secs, title, file) => {
  const s = secs.list.find((x) => x.title === title);
  if (!s) warn(file, `找不到「# ${title}」這一段`);
  return s ? s.body : [];
};

/* ================= 檢查 ================= */

const WD = "日一二三四五六";
function checkText(file, text, meta) {
  // 日期星期是否正確
  const yearBase = parseInt((meta.學期 || "").match(/(\d+)\s*學年度/)?.[1] || "0", 10);
  if (yearBase) {
    for (const m of text.matchAll(/(\d{1,2})\/(\d{1,2})（([一二三四五六日])）/g)) {
      const mo = +m[1], d = +m[2];
      const y = 1911 + yearBase + (mo >= 8 ? 0 : 1);
      const real = WD[new Date(y, mo - 1, d).getDay()];
      if (real !== m[3]) warn(file, `${m[0]} 的星期不對，${y} 年 ${mo}/${d} 是星期${real}`);
    }
  }
  for (const m of text.matchAll(/\d{1,2}\/\d{1,2}\s*\([一二三四五六日]\)/g))
    warn(file, `${m[0]} 請改用全形括號，例如 12/4（五）`);
  // 公開網站隱私提醒
  for (const m of text.matchAll(/09\d{2}[-\s]?\d{3}[-\s]?\d{3}/g))
    warn(file, `出現疑似手機號碼 ${m[0]}，公開網站請勿放私人電話`);
  if (/!\[[^\]]*\]\(/.test(text) || /<img/i.test(text))
    warn(file, `出現圖片，公開網站請勿放學生照片`);
}

/* ================= 共用版面 ================= */

const ICONS = {
  home: '<svg viewBox="0 0 24 24"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></svg>',
  cal: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4M9 10v11M15 10v11"/></svg>',
  book: '<svg viewBox="0 0 24 24"><path d="M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6z"/><path d="M6 3v18M4 7h4M4 12h4M4 17h4M11 8h5M11 12h5"/></svg>',
};
const PAGES = [
  ["index.html", "首頁", "home"],
  ["schedule.html", "課表", "cal"],
  ["homework.html", "聯絡簿", "book"],
];

function layout(site, { file, title, description, body, script = "" }) {
  const cur = (f) => (f === file ? ' aria-current="page"' : "");
  return `<!doctype html>
<html lang="zh-Hant-TW">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(site.班級)}｜${esc(title)}</title>
${description ? `<meta name="description" content="${esc(description)}">\n` : ""}<meta name="theme-color" content="#233a30">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=LXGW+WenKai+TC:wght@400;700&display=swap">
<link rel="stylesheet" href="style.css">
</head>
<body>
<!-- 這個檔案由 build.js 依 content/ 自動產生，請改 Markdown，不要直接改這裡 -->
<header class="topbar">
  <div class="wrap">
    <a class="brand" href="index.html"><b>${esc(site.班級)}</b><span>${esc(site.學校)}</span></a>
    <nav class="topnav" aria-label="主要導覽">
${PAGES.map(([f, n]) => `      <a href="${f}"${cur(f)}>${n}</a>`).join("\n")}
    </nav>
  </div>
</header>

<main class="wrap">
${body}

  <footer>${esc(site.學校)} ${esc(site.班級)}</footer>
</main>

<nav class="tabs" aria-label="主要導覽">
${PAGES.map(([f, n, i]) => `  <a href="${f}"${cur(f)}>${ICONS[i]}${n}</a>`).join("\n")}
</nav>
${script}</body>
</html>
`;
}

const slimBoard = (title, sub) => `  <section class="board slim">
    <h1>${esc(title)}</h1>
    ${sub.length ? `<p>${sub.map(inline).join("<br>")}</p>` : ""}
  </section>`;

/* ================= 首頁 ================= */

function buildHome() {
  const F = "index.md";
  const { meta: site, lines } = read(F);
  checkText(F, lines.join("\n"), site);
  for (const k of ["學校", "班級", "學期", "導師", "教室"]) if (!site[k]) warn(F, `最上面的設定少了「${k}」`);
  const top = sections(lines, 1);

  // 班呼
  const cheer = find(top, "班呼", F).map((l) => l.trim()).filter(Boolean);

  // 公告
  const news = sections(find(top, "最新公告", F), 2).list.map((a) => {
    const parts = sections(a.body, 3);
    const main = blocks(parts.pre);
    const stamp = main.find((b) => b.type === "kv" && b.key === "印章");
    const intro = main.filter((b) => b.type === "p").map((b) => `        <p>${b.lines.map(inline).join("<br>")}</p>`).join("\n");
    const facts = main.filter((b) => b.type === "ul").flatMap((b) => b.items).map((i) => {
      const m = i.match(KV);
      if (!m) { warn(F, `公告「${a.title}」的「${i}」少了冒號，應寫成「- 項目: 內容」`); return ""; }
      return `          <dt>${inline(m[1])}</dt><dd>${inline(m[2])}</dd>`;
    }).join("\n");
    let due = "", more = "";
    for (const s of parts.list) {
      const items = blocks(s.body).filter((b) => b.type === "ul").flatMap((b) => b.items);
      if (s.title === "截止日") {
        due = `        <ul class="due">\n` + items.map((i) => {
          const m = i.match(KV);
          if (!m) { warn(F, `截止日「${i}」少了冒號，應寫成「- 12/4（五）: 要做的事」`); return ""; }
          return `          <li><time>${inline(m[1])}</time><span>${inline(m[2])}</span></li>`;
        }).join("\n") + `\n        </ul>`;
      } else {
        more += `        <details>\n          <summary>看${esc(s.title)}</summary>\n          <ul>\n` +
          items.map((i) => `            <li>${inline(i)}</li>`).join("\n") + `\n          </ul>\n        </details>\n`;
      }
    }
    return `      <article class="notice">
${stamp ? `        <span class="stamp">${esc(stamp.value)}</span>\n` : ""}        <h3>${inline(a.title)}</h3>
${intro}
${facts ? `        <dl class="facts">\n${facts}\n        </dl>\n` : ""}${due}
${more}      </article>`;
  }).join("\n\n");

  // 導師的話
  const letterB = blocks(find(top, "導師的話", F));
  const sign = letterB.find((b) => b.type === "kv" && b.key === "署名");
  const letter = render(letterB) + (sign ? `\n<p class="sign">${esc(sign.value)}</p>` : "");

  // 班級公約
  const rules = blocks(find(top, "班級公約", F)).filter((b) => b.type === "ol" || b.type === "ul").flatMap((b) => b.items);

  // 聯絡老師
  const contactB = blocks(find(top, "聯絡老師", F));
  const tel = contactB.find((b) => b.type === "kv" && b.key === "電話");
  let telHtml = "";
  if (tel) {
    const [num, ext] = tel.value.split(/轉/).map((s) => s.trim());
    const digits = num.replace(/\D/g, "").replace(/^0/, "");
    telHtml = `\n          <a class="tel" href="tel:+886${digits}${ext ? "," + ext.replace(/\D/g, "") : ""}">${esc(tel.value)}</a>`;
  }

  const body = `  <section class="board" aria-label="班呼">
    <div>
      <p class="term">${esc(site.學期)}</p>
      <h1>${esc(site.班級)}</h1>
      <p class="cheer">${cheer.map((l) => `<span>${inline(l)}</span>`).join("")}</p>
    </div>
    <p class="who">導師　${esc(site.導師)}<br>${esc(site.教室)}</p>
  </section>

  <div class="home-grid">
    <section aria-labelledby="news">
      <h2 id="news">最新公告</h2>

${news}
    </section>

    <aside class="side">
      <section aria-labelledby="letter">
        <h2 id="letter">導師的話</h2>
        <div class="letter">
${letter}
        </div>
      </section>

      <section aria-labelledby="rules">
        <h2 id="rules">班級公約</h2>
        <ol class="rules">
${rules.map((r) => `          <li>${inline(r)}</li>`).join("\n")}
        </ol>
      </section>

      <section aria-labelledby="contact">
        <h2 id="contact">聯絡老師</h2>
        <div class="contact">
          ${render(contactB)}${telHtml}
        </div>
      </section>
    </aside>
  </div>`;

  const script = `<script>
  // 班呼粉筆動畫：3 秒後一定移除，確保文字完整顯示
  const cheer = document.querySelector(".cheer");
  cheer.classList.add("writing");
  setTimeout(() => cheer.classList.remove("writing"), 3000);
</script>
`;
  return {
    site,
    html: layout(site, {
      file: "index.html", title: "首頁", body, script,
      description: `${site.學校}${site.班級}班級網站：導師的話、最新公告、課表與每日聯絡簿。`,
    }),
  };
}

/* ================= 課表 ================= */

const CATS = ["國語", "數學", "英語", "自然", "社會", "健體", "藝術", "綜合", "本土語", "彈性"];

function buildTimetable(site) {
  const F = "timetable.md";
  const { lines } = read(F);
  checkText(F, lines.join("\n"), site);
  const top = sections(lines, 1);
  const page = top.list[0] || { title: "功課表", body: [] };
  const sub = sections(page.body, 2);
  const subtitle = blocks(sub.pre).filter((b) => b.type === "p").flatMap((b) => b.lines);
  const part = (t) => { const s = sub.list.find((x) => x.title === t); if (!s) warn(F, `找不到「## ${t}」這一段`); return s ? s.body : []; };

  // 科目顏色
  const catOf = {};
  const legend = [];
  const mapTable = blocks(part("科目顏色")).find((b) => b.type === "table");
  (mapTable ? mapTable.rows.slice(1) : []).forEach(([cat, subs = ""]) => {
    if (!CATS.includes(cat)) { warn(F, `顏色「${cat}」不在可用顏色裡（${CATS.join("、")}）`); return; }
    legend.push(cat);
    subs.split(/[、,，]/).map((s) => s.trim()).filter(Boolean).forEach((s) => (catOf[s] = cat));
  });

  // 課表
  const t = blocks(part("課表")).find((b) => b.type === "table");
  if (!t) { warn(F, "「## 課表」下面找不到表格"); }
  const head = t ? t.rows[0] : [];
  const days = head.slice(2).map((d) => d.replace(/^週/, ""));
  const SLOTS = [];
  const DAYS = Object.fromEntries(days.map((d) => [d, []]));
  (t ? t.rows.slice(1) : []).forEach((row) => {
    if (row.length !== head.length) warn(F, `「${row[0]}」這一列有 ${row.length} 格，應該是 ${head.length} 格`);
    const cells = row.slice(2);
    const isBreak = cells.every((c) => !c);
    SLOTS.push(isBreak ? [row[0], row[1], "break"] : [row[0], row[1]]);
    days.forEach((d, i) => {
      const c = cells[i] || "";
      if (isBreak) return DAYS[d].push(null);
      let m;
      if ((m = c.match(/^放學\s*([^（(]*?)\s*(?:[（(](.+)[）)])?$/))) return DAYS[d].push(m[2] ? { off: m[1], note: m[2] } : { off: m[1] });
      if (!c) return DAYS[d].push(["", ""]);
      m = c.match(/^(.+?)\s*[（(](.+)[）)]$/);
      const subj = m ? m[1] : c, note = m ? m[2] : "";
      DAYS[d].push(note ? [subj, catOf[subj] || "", note] : [subj, catOf[subj] || ""]);
    });
  });

  const tips = blocks(part("小提醒")).filter((b) => b.type === "ul" || b.type === "ol").flatMap((b) => b.items);

  const body = `${slimBoard(page.title, subtitle)}

  <!-- 手機：一次看一天 -->
  <div class="mobile-day">
    <div class="day-tabs" role="tablist" aria-label="選擇星期"></div>
    <ol class="periods" id="periods"></ol>
  </div>

  <!-- 桌機：整週 -->
  <div class="week" id="week"></div>

  <ul class="legend" id="legend"></ul>

  <h2>小提醒</h2>
  <ul class="tips">
${tips.map((x) => `    <li>${inline(x)}</li>`).join("\n")}
  </ul>`;

  const script = `<script>
const SLOTS = ${JSON.stringify(SLOTS)};
const DAYS = ${JSON.stringify(DAYS)};
const LEGEND = ${JSON.stringify(legend)};
const NAMES = Object.keys(DAYS);

const todayIdx = new Date().getDay() - 1; // 週一 = 0
const isSchoolDay = todayIdx >= 0 && todayIdx < NAMES.length;
const after = (time) => (time.slice(0, 2) >= "12" ? "下午" : "之後");

/* ---- 手機：單日 ---- */
const tabs = document.querySelector(".day-tabs");
const list = document.getElementById("periods");

function renderDay(day) {
  tabs.querySelectorAll("button").forEach(b => b.setAttribute("aria-selected", b.dataset.day === day));
  let html = "", offShown = false;
  SLOTS.forEach(([label, time, kind], i) => {
    const c = DAYS[day][i];
    if (kind === "break") {
      html += \`<li class="break"><div class="when"><b>\${label}</b>\${time}</div><div class="subj">休息</div></li>\`;
    } else if (c && c.off !== undefined) {
      if (!offShown) html += \`<li class="off"><div class="when"><b>\${after(time)}</b></div><div class="subj">\${c.off} 放學\${c.note ? \`<small>\${c.note}</small>\` : ""}</div></li>\`;
      offShown = true;
    } else {
      offShown = false;
      const [subj, cat, note] = c;
      html += \`<li><div class="when"><b>\${label}</b>\${time}</div>\` +
              \`<div class="subj \${cat ? "c-" + cat : ""}">\${cat ? '<i class="dot"></i>' : ""}<div>\${subj}\${note ? \`<small>\${note}</small>\` : ""}</div></div></li>\`;
    }
  });
  list.innerHTML = html;
}

NAMES.forEach((d, i) => {
  const b = document.createElement("button");
  b.type = "button";
  b.setAttribute("role", "tab");
  b.dataset.day = d;
  b.innerHTML = \`週\${d}\` + (isSchoolDay && i === todayIdx ? \`<span class="today">今天</span>\` : "");
  b.addEventListener("click", () => renderDay(d));
  tabs.appendChild(b);
});
renderDay(NAMES[isSchoolDay ? todayIdx : 0]);

/* ---- 桌機：整週 ---- */
const td = (i) => (isSchoolDay && i === todayIdx ? " is-today" : "");
let t = \`<table><thead><tr><th scope="col">節次</th>\` +
  NAMES.map((d, i) => \`<th scope="col" class="\${td(i).trim()}">週\${d}\${isSchoolDay && i === todayIdx ? "（今天）" : ""}</th>\`).join("") +
  \`</tr></thead><tbody>\`;
SLOTS.forEach(([label, time, kind], r) => {
  if (kind === "break") {
    t += \`<tr class="break"><th scope="row"><b>\${label}</b>\${time}</th><td colspan="\${NAMES.length}">\${label}</td></tr>\`;
    return;
  }
  t += \`<tr><th scope="row"><b>\${label}</b>\${time}</th>\`;
  NAMES.forEach((d, i) => {
    const c = DAYS[d][r];
    if (c && c.off !== undefined) {
      const prev = DAYS[d][r - 1];
      if (prev && prev.off !== undefined) return; // 已被上面合併
      let span = 1;
      while (DAYS[d][r + span] && DAYS[d][r + span].off !== undefined) span++;
      t += \`<td class="off\${td(i)}" rowspan="\${span}">週\${d}\${after(time)}<br>\${c.off} 放學</td>\`;
      return;
    }
    const [subj, cat, note] = c;
    t += \`<td class="\${cat ? "c-" + cat : "mini"}\${td(i)}">\${subj}\${note ? \`<small>\${note}</small>\` : ""}</td>\`;
  });
  t += \`</tr>\`;
});
t += \`</tbody></table>\`;
document.getElementById("week").innerHTML = t;

/* ---- 圖例 ---- */
document.getElementById("legend").innerHTML =
  LEGEND.map(c => \`<li class="c-\${c}"><i></i>\${c}</li>\`).join("");
</script>
`;
  return layout(site, { file: "schedule.html", title: "課表", body, script });
}

/* ================= 聯絡簿 ================= */

function buildContactBook(site) {
  const F = "contact-book.md";
  const { lines } = read(F);
  checkText(F, lines.join("\n"), site);
  const top = sections(lines, 1);
  const page = top.list[0] || { title: "每日聯絡簿", body: [] };
  const sub = sections(page.body, 2);
  const subtitle = blocks(sub.pre).filter((b) => b.type === "p").flatMap((b) => b.lines);

  // 日期檢查：格式與新到舊
  let prev = null;
  const days = sub.list.map((d, i) => {
    const m = d.title.match(/^(\d{1,2})\/(\d{1,2})（[一二三四五六日]）$/);
    if (!m) warn(F, `「## ${d.title}」日期格式應為 11/25（三）`);
    else {
      const mo = +m[1], key = (mo >= 8 ? mo : mo + 12) * 100 + +m[2];
      if (prev !== null && key >= prev) warn(F, `「${d.title}」排在比它舊的日期下面，最新的一天要放最上面`);
      prev = key;
    }
    const items = blocks(d.body).filter((b) => b.type === "ol" || b.type === "ul").flatMap((b) => b.items);
    return `    <article class="page${i === 0 ? " latest" : ""}">
      <h3>${esc(d.title)}${i === 0 ? '<span class="new">最新</span>' : ""}</h3>
      <ol>
${items.map((x) => `        <li>${inline(x)}</li>`).join("\n")}
      </ol>
    </article>`;
  });

  const note = top.list.find((s) => s.title === "給家長");
  const body = `${slimBoard(page.title, subtitle)}

  <div class="book-grid">
${days.join("\n\n")}
  </div>
${note ? `\n  <div class="parent-note">\n    ${render(blocks(note.body))}\n  </div>` : ""}`;
  return layout(site, { file: "homework.html", title: "每日聯絡簿", body });
}

/* ================= 主程式 ================= */

function build() {
  warnings = [];
  const started = Date.now();
  try {
    const home = buildHome();
    const out = {
      "index.html": home.html,
      "schedule.html": buildTimetable(home.site),
      "homework.html": buildContactBook(home.site),
    };
    for (const [f, html] of Object.entries(out)) fs.writeFileSync(path.join(SITE, f), html);
    const time = new Date().toLocaleTimeString("zh-TW", { hour12: false });
    console.log(`✅ ${time} 網頁已更新（${Date.now() - started} ms）`);
    if (warnings.length) console.log(`請檢查：\n${warnings.join("\n")}`);
  } catch (e) {
    console.log(`❌ 產生失敗：${e.message}`);
  }
}

build();

const SERVE = process.argv.includes("--serve");
const reloaders = new Set(); // 開著預覽的瀏覽器分頁
const reload = () => reloaders.forEach((res) => res.write("data: reload\n\n"));

if (SERVE || process.argv.includes("--watch")) {
  let timer;
  fs.watch(CONTENT, () => { clearTimeout(timer); timer = setTimeout(() => { build(); reload(); }, 150); });
  // 改 style.css 也自動重新整理預覽
  fs.watch(SITE, (_, f) => { if (f === "style.css") { clearTimeout(timer); timer = setTimeout(reload, 150); } });
  if (!SERVE) console.log("👀 正在看著 content 資料夾，存檔就會自動更新（按 Ctrl+C 停止）");
}

/* ================= 即時預覽伺服器（--serve） =================
   只在預覽時把「自動重新整理」程式碼插進網頁，site/ 裡的檔案不會被改到。 */
if (SERVE) {
  const http = require("http");
  const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".ico": "image/x-icon" };
  const LIVE = `<script>new EventSource("/__reload").onmessage = () => location.reload();</script>\n</body>`;

  const server = http.createServer((req, res) => {
    const url = decodeURIComponent(req.url.split("?")[0]);
    if (url === "/__reload") {
      res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" });
      res.write(": connected\n\n");
      reloaders.add(res);
      req.on("close", () => reloaders.delete(res));
      return;
    }
    const file = path.join(SITE, url === "/" ? "index.html" : url);
    if (!file.startsWith(SITE + path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("找不到這個頁面");
    }
    const ext = path.extname(file);
    let data = fs.readFileSync(file);
    if (ext === ".html") data = data.toString("utf8").replace("</body>", LIVE);
    res.writeHead(200, { "Content-Type": TYPES[ext] || "application/octet-stream", "Cache-Control": "no-store" });
    res.end(data);
  });

  let port = parseInt(process.env.PORT || "3000", 10);
  server.on("error", (e) => {
    if (e.code === "EADDRINUSE" && port < 3010) { port++; server.listen(port, "127.0.0.1"); }
    else console.log(`❌ 預覽伺服器無法啟動：${e.message}`);
  });
  server.on("listening", () => {
    console.log(`👀 即時預覽：http://localhost:${port}`);
    console.log("   改 content 裡的 Markdown 並存檔，瀏覽器會自動更新（按 Ctrl+C 停止）");
  });
  server.listen(port, "127.0.0.1");
}

#!/usr/bin/env node
/**
 * Course Page Dev Server
 *
 * Usage:
 *   node dev.mjs <course-dir>          # e.g. node dev.mjs cake
 *   node dev.mjs <course-dir> --port 8080
 *   node dev.mjs <course-dir> --open   # 啟動後自動開瀏覽器
 *
 * Features:
 *   - Watches content.md, config.yaml, global.yaml, base.html/theme.css/app.js 與圖片
 *   - 行程內呼叫 build()（quiet），結果以 SSE JSON 事件推給頁面：
 *       { type:'build', ok:true,  summary, lint, config } → 頁面 reload；reload 後有 lint／config 就在右下角顯示黃色 overlay
 *       { type:'build', ok:false, error, lint }          → 不 reload，現有頁面右下角顯示紅色 overlay
 *   - 任何例外都在這裡攔下，dev server 不會因為 build 壞掉而停
 */

import { createServer } from 'http';
import { readFileSync, existsSync, statSync, watch } from 'fs';
import { resolve, dirname, join, extname, relative, isAbsolute, sep } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
// 用 namespace import：舊版 build.mjs 沒有 BuildError 具名匯出，具名 import 會在載入時就失敗
import * as buildMod from './build.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const { build } = buildMod;
const BuildError = buildMod.BuildError;

// ─── Args ───

const args = process.argv.slice(2);
if (args.length < 1 || args[0] === '--help') {
  console.log('Usage: node dev.mjs <course-dir> [--port 3000] [--open]');
  process.exit(1);
}

let courseDir = resolve(args[0]);
if (!statSync(courseDir, { throwIfNoEntry: false })?.isDirectory()) {
  if (args[0].endsWith('.md')) courseDir = dirname(resolve(args[0]));
}

let port = 3000;
const portIdx = args.indexOf('--port');
if (portIdx !== -1) {
  const v = args[portIdx + 1];
  if (!/^\d+$/.test(v || '') || +v < 1 || +v > 65535) {
    console.error(`❌ --port 要接 1〜65535 的數字（收到 ${v ?? '空值'}）`);
    process.exit(1);
  }
  port = parseInt(v, 10);
}
const openOnStart = args.includes('--open');
const HOST = '127.0.0.1'; // 只聽本機：dev server 會把課程目錄整個開放讀取

// 最後手段：任何漏網的例外只記錄，不讓 dev server 結束
process.on('uncaughtException', (e) => console.error('⚠️  dev server 例外（已攔下，繼續執行）：', e));
process.on('unhandledRejection', (e) => console.error('⚠️  dev server 未處理的 Promise 拒絕（已攔下）：', e));

// ─── Build helper ───

let lastEvent = null; // 最近一次 build 結果；注入到頁面，reload 後據此顯示 overlay

function formatLint(w) {
  return `content.md:${w.line ?? '?'} [${w.level || 'warn'}/${w.rule || '?'}] ${w.msg || ''}${w.fix ? ` → ${w.fix}` : ''}`;
}
function formatConfig(c) {
  return `config ${c.path || ''} [${c.level || 'warn'}/${c.rule || '?'}] ${c.msg || ''}`;
}
// 終端與頁面警告框只列 error／warn；info 只給一行計數（舊課的 info 動輒上百則，會蓋掉真正的警告）
const isInfo = (w) => w.level === 'info';

function runBuild() {
  const started = Date.now();
  let event;
  try {
    // 舊版 build()（尚無 BuildError）在 content.md 不存在時會直接 process.exit，先在這裡擋下
    const contentPath = join(courseDir, 'content.md');
    if (!BuildError && !existsSync(contentPath)) throw new Error(`找不到 content.md：${contentPath}`);
    const report = build(courseDir, { quiet: true }) || {};
    event = {
      type: 'build',
      ok: report.ok !== false,
      summary: report.summary || {},
      lint: report.lint || [],
      config: report.config || [],
    };
    if (!event.ok) event.error = report.error || 'build 未成功（report.ok = false）';
  } catch (e) {
    event = { type: 'build', ok: false, error: String((e && e.message) || e), lint: (e && (e.lint || e.report?.lint)) || [] };
    if (!(BuildError && e instanceof BuildError)) console.error(e);
  }
  const ms = Date.now() - started;
  if (event.ok) {
    console.log(`✅ 建置完成（${ms}ms）`);
    const notes = [...event.lint.filter(w => !isInfo(w)).map(formatLint), ...event.config.filter(c => !isInfo(c)).map(formatConfig)];
    if (notes.length) {
      console.log(`   ⚠️  ${notes.length} 則 lint／config 警告（頁面右下角也會顯示）`);
      for (const n of notes) console.log(`      ${n}`);
    }
    const infos = event.lint.filter(isInfo).length + event.config.filter(isInfo).length;
    if (infos) console.log(`   ℹ️  另有 ${infos} 則 info 建議未列出（build.mjs --json 可看全部）`);
  } else {
    console.error(`❌ Build 失敗：${event.error}`);
    console.error('   頁面保留上一版並顯示錯誤；修正後存檔會自動重建');
  }
  lastEvent = event;
  return event;
}

// ─── SSE clients ───

const sseClients = new Set();

// 只在 dev server 回應時注入，不進正式輸出。__DEV_LAST__ 於回應時換成最近一次 build 事件（JSON）
const LIVE_RELOAD_SNIPPET = `
<!-- dev server live reload -->
<script>
(function(){
  var last = __DEV_LAST__;
  var BOX_ID = '__course-dev-overlay';
  function el(tag, css, text) {
    var e = document.createElement(tag);
    if (css) e.style.cssText = css;
    if (text != null) e.textContent = text;
    return e;
  }
  function fmtLint(w) {
    return 'content.md:' + (w.line != null ? w.line : '?') + ' [' + (w.level || 'warn') + '/' + (w.rule || '?') + '] ' + (w.msg || '') + (w.fix ? ' → ' + w.fix : '');
  }
  function fmtConfig(c) {
    return 'config ' + (c.path || '') + ' [' + (c.level || 'warn') + '/' + (c.rule || '?') + '] ' + (c.msg || '');
  }
  function show(ev) {
    var old = document.getElementById(BOX_ID);
    if (old) old.remove();
    if (!ev || ev.type !== 'build') return;
    var notInfo = function (w) { return w.level !== 'info'; };
    var lines = (ev.lint || []).filter(notInfo).map(fmtLint).concat((ev.config || []).filter(notInfo).map(fmtConfig));
    var infos = (ev.lint || []).concat(ev.config || []).length - lines.length;
    var failed = ev.ok === false;
    if (!failed && !lines.length) return;
    var box = el('div', 'position:fixed;right:16px;bottom:16px;max-height:40vh;overflow:auto;z-index:99999;'
      + 'max-width:min(720px,calc(100vw - 32px));box-sizing:border-box;padding:12px 40px 12px 14px;border-radius:10px;'
      + 'font:12.5px/1.55 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;white-space:pre-wrap;word-break:break-word;'
      + 'text-align:left;box-shadow:0 8px 28px rgba(0,0,0,.35);'
      + (failed ? 'background:#2a0d10;color:#ffd9d9;border:1px solid #ff6b6b;' : 'background:#2a2306;color:#fff2c2;border:1px solid #f2c94c;'));
    box.id = BOX_ID;
    var close = el('button', 'position:absolute;top:6px;right:8px;border:0;background:transparent;color:inherit;font:16px/1 sans-serif;cursor:pointer;opacity:.8', '✕');
    close.setAttribute('aria-label', '關閉');
    close.onclick = function () { box.remove(); };
    box.appendChild(close);
    box.appendChild(el('div', 'font-weight:700;margin-bottom:6px', failed ? 'Build 失敗（頁面仍是上一版）' : lines.length + ' 則 lint／config 警告'));
    if (failed) box.appendChild(el('div', lines.length ? 'margin-bottom:8px' : '', ev.error || '未知錯誤'));
    lines.forEach(function (t) { box.appendChild(el('div', '', t)); });
    if (infos) box.appendChild(el('div', 'margin-top:6px;opacity:.75', '另有 ' + infos + ' 則 info 建議未列出（build.mjs --json 可看全部）'));
    document.body.appendChild(box);
  }
  show(last);
  var es = new EventSource('/__sse');
  es.onmessage = function (e) {
    var ev;
    try { ev = JSON.parse(e.data); } catch (_) { return; }
    if (!ev || ev.type !== 'build') return;
    if (ev.ok) location.reload(); else show(ev);
  };
  es.onerror = function () { setTimeout(function () { location.reload(); }, 2000); };
})();
</script>
`;

function liveReloadSnippet() {
  // JSON 放進 <script>：把 < 轉義，內容裡的 </script> 才不會提前結束標籤
  const json = JSON.stringify(lastEvent).replace(/</g, '\\u003c');
  return LIVE_RELOAD_SNIPPET.replace('__DEV_LAST__', () => json);
}

// ─── HTTP server ───

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.mp4': 'video/mp4',
  '.pdf': 'application/pdf',
};

function handleRequest(req, res) {
  const url = new URL(req.url, `http://localhost:${port}`);

  // SSE endpoint
  if (url.pathname === '/__sse') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });
    res.write(': connected\n\n'); // SSE 註解行，頁面不會收到 message
    sseClients.add(res);
    req.on('close', () => sseClients.delete(res));
    res.on('error', () => sseClients.delete(res));
    return;
  }

  // Serve static files from courseDir（pathname 需先解碼，否則中文檔名會 404）
  let pathname = url.pathname;
  try { pathname = decodeURIComponent(pathname); } catch { /* 保留原值 */ }
  let filePath = resolve(courseDir, '.' + (pathname === '/' ? '/index.html' : pathname));

  // 路徑穿越（/..%2f..%2fetc/hosts 這類）：解碼後不在課程目錄底下一律拒絕
  const rel = relative(courseDir, filePath);
  if (rel === '..' || rel.startsWith('..' + sep) || isAbsolute(rel)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  if (!existsSync(filePath)) {
    // 首次 build 就失敗、還沒有 index.html：回一頁只有錯誤框與 SSE 重載的頁面，修好存檔後會自動載入
    if (pathname === '/' || pathname === '/index.html') {
      res.writeHead(200, { 'Content-Type': MIME['.html'], 'Cache-Control': 'no-cache' });
      res.end('<!doctype html><html lang="zh-TW"><head><meta charset="utf-8"><title>Course Dev Server</title></head>'
        + '<body style="font:15px/1.6 system-ui,sans-serif;padding:24px">'
        + '<p>index.html 不存在（build 失敗時錯誤顯示在右下角）。修正後存檔，頁面會自動重新載入。</p>'
        + liveReloadSnippet() + '</body></html>');
      return;
    }
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  if (statSync(filePath).isDirectory()) {
    filePath = join(filePath, 'index.html');
    if (!existsSync(filePath)) { res.writeHead(404); res.end('Not found'); return; }
  }

  const ext = extname(filePath).toLowerCase();
  const mime = MIME[ext] || 'application/octet-stream';

  let content = readFileSync(filePath);

  // Inject live-reload snippet into HTML（插在最後一個 </body> 前：[html] iframe 的 srcdoc 裡也可能有 </body>）
  if (ext === '.html') {
    let html = content.toString('utf-8');
    const at = html.lastIndexOf('</body>');
    html = at === -1 ? html + liveReloadSnippet() : html.slice(0, at) + liveReloadSnippet() + html.slice(at);
    res.writeHead(200, { 'Content-Type': mime, 'Cache-Control': 'no-cache' });
    res.end(html);
    return;
  }

  res.writeHead(200, { 'Content-Type': mime });
  res.end(content);
}

const server = createServer((req, res) => {
  try {
    handleRequest(req, res);
  } catch (e) {
    console.error(`⚠️  回應 ${req.url} 失敗：`, e);
    try { if (!res.headersSent) res.writeHead(500); res.end('Internal error'); } catch { /* 連線已斷 */ }
  }
});

// ─── File watcher ───

function notifyBuild(event) {
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  for (const client of sseClients) {
    try { client.write(payload); } catch { sseClients.delete(client); }
  }
}

let buildTimeout = null;
function scheduleBuild() {
  if (buildTimeout) clearTimeout(buildTimeout);
  buildTimeout = setTimeout(() => {
    try {
      console.log(`\n♻️  Change detected, rebuilding...`);
      notifyBuild(runBuild());
    } catch (e) {
      console.error('⚠️  重建流程例外：', e);
    }
  }, 200);
}

// Watch course dir (content.md, config.yaml)
const watchPaths = [courseDir];

// Also watch base.html template
const baseHtmlDir = resolve(__dirname, '../reference');
if (existsSync(baseHtmlDir)) watchPaths.push(baseHtmlDir);

// Also watch global config if it exists
function findGlobalConfigDir() {
  let dir = dirname(courseDir);
  for (let i = 0; i < 4; i++) {
    const candidate = join(dir, 'config');
    if (existsSync(candidate)) return candidate;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}
const globalConfigDir = findGlobalConfigDir();
if (globalConfigDir) watchPaths.push(globalConfigDir);

const WATCH_EXTS = new Set(['.md', '.yaml', '.yml', '.html', '.css', '.js', '.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg']);
const IGNORE_FILES = new Set(['index.html']);

for (const dir of watchPaths) {
  try {
    watch(dir, { recursive: true }, (eventType, filename) => {
      if (!filename) return;
      const parts = filename.split(/[\\/]/);
      if (IGNORE_FILES.has(parts[parts.length - 1])) return;
      if (parts.includes('.visual-check')) return; // visual-check 的截圖輸出，不是講稿改動
      const ext = extname(filename).toLowerCase();
      if (WATCH_EXTS.has(ext)) scheduleBuild();
    });
  } catch (e) {
    console.warn(`⚠️  Cannot watch ${dir}: ${e.message}`);
  }
}

// ─── Start ───

console.log(`\n🚀 Course Dev Server`);
console.log(`   Course: ${courseDir}`);
console.log(`   Watching: ${watchPaths.map(p => relative(process.cwd(), p) || '.').join(', ')}`);

// Initial build
runBuild();

function openBrowser(url) {
  const [cmd, cmdArgs] = process.platform === 'darwin' ? ['open', [url]]
    : process.platform === 'win32' ? ['cmd', ['/c', 'start', '', url]]
      : ['xdg-open', [url]];
  try {
    const child = spawn(cmd, cmdArgs, { stdio: 'ignore', detached: true });
    child.on('error', (e) => console.warn(`   ⚠️  無法自動開啟瀏覽器（${e.message}），請手動開 ${url}`));
    child.unref();
  } catch (e) {
    console.warn(`   ⚠️  無法自動開啟瀏覽器（${e.message}），請手動開 ${url}`);
  }
}

const origPort = port;
// listening 只註冊一次（每次重試都掛 listen callback 會在成功時觸發多次：--open 開多個分頁、log 印錯 port）
server.on('listening', () => {
  port = server.address().port;
  if (port !== origPort) {
    console.log(`\n   ✅ Port ${origPort} was in use → using port ${port} instead`);
  }
  console.log(`\n   🌐 http://localhost:${port}\n`);
  if (openOnStart) openBrowser(`http://localhost:${port}`);
});
function tryListen(p) {
  server.once('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`   ⚠️  Port ${p} in use, trying ${p + 1}…`);
      tryListen(p + 1);
    } else {
      console.error(`❌ 無法啟動 server：${err.message}`);
      process.exit(1);
    }
  });
  server.listen(p, HOST);
}
tryListen(port);

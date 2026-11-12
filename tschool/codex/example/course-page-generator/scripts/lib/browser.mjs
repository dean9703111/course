/**
 * Puppeteer 共用工具（選用：只給 export-pdf.mjs／generate-og.mjs 用，build 不會 import）
 *
 *   launchBrowser({ headless })   找 Chrome → 啟動
 *   pageUrl(indexPath, query)     index.html 的 file:// URL
 *   waitPageReady(page)           等字型與圖片
 *   openPrintMode(page, indexPath) 開 ?print=1；頁面不支援時走相容模式（舊版 hack）
 *
 * Chrome 尋找順序：
 *   1. 環境變數 PUPPETEER_EXECUTABLE_PATH
 *   2. ~/.cache/puppeteer/chrome/<ver>/chrome-mac*\/Google Chrome for Testing.app/...（取最大版本）
 *   3. puppeteer 預設（它釘的版本；快取裡常常沒有，例如套件要 148、快取只有 152）
 * headless: 'shell'（export-pdf）先找 ~/.cache/puppeteer/chrome-headless-shell/<ver>/chrome-headless-shell-mac*\/chrome-headless-shell，
 * 找不到才走上面的順序：完整版 Chrome for Testing 152 的 page.pdf() 遇到大份文件（demo 75 頁）丟
 * 「Printing failed」，前後半各自印都正常；chrome-headless-shell 同一份印得出來（7 MB）。
 *
 * puppeteer 用動態 import：沒裝 puppeteer 時只有呼叫 launchBrowser 才報錯，訊息附安裝指令。
 */

import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { pathToFileURL } from 'url';

const INSTALL_HINT =
  '安裝方式（擇一）：\n' +
  '  1. 在本 Skill 資料夾（scripts/ 的上一層）執行 npm install puppeteer，再執行 npx puppeteer browsers install chrome\n' +
  '  2. 指定現有的 Chrome：export PUPPETEER_EXECUTABLE_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"';

function versionKey(dirName) {
  // mac_arm-152.0.7977.42 → [152, 0, 7977, 42]
  const m = dirName.match(/(\d+(?:\.\d+)*)$/);
  return m ? m[1].split('.').map(Number) : [];
}

function compareVersion(a, b) {
  const va = versionKey(a), vb = versionKey(b);
  for (let i = 0; i < Math.max(va.length, vb.length); i++) {
    const d = (va[i] || 0) - (vb[i] || 0);
    if (d) return d;
  }
  return 0;
}

function findCachedChrome(shell = false) {
  const root = join(homedir(), '.cache', 'puppeteer', shell ? 'chrome-headless-shell' : 'chrome');
  if (!existsSync(root)) return null;
  const versions = readdirSync(root).sort(compareVersion).reverse();
  for (const ver of versions) {
    const verDir = join(root, ver);
    let subs = [];
    try { subs = readdirSync(verDir).filter((d) => d.startsWith(shell ? 'chrome-headless-shell-mac' : 'chrome-mac')); } catch { continue; }
    for (const sub of subs) {
      const exe = shell
        ? join(verDir, sub, 'chrome-headless-shell')
        : join(verDir, sub, 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing');
      if (existsSync(exe)) return exe;
    }
  }
  return null;
}

export function resolveChromePath({ shell = false } = {}) {
  if (shell) {
    const exe = findCachedChrome(true);
    if (exe) return exe;
  }
  const env = process.env.PUPPETEER_EXECUTABLE_PATH;
  if (env) {
    if (!existsSync(env)) throw new Error(`PUPPETEER_EXECUTABLE_PATH 指向的檔案不存在：${env}\n${INSTALL_HINT}`);
    return env;
  }
  return findCachedChrome(); // null → 交給 puppeteer 預設
}

export async function launchBrowser({ headless = true } = {}) {
  let puppeteer;
  try {
    puppeteer = (await import('puppeteer')).default;
  } catch {
    throw new Error(`找不到 puppeteer 套件。\n${INSTALL_HINT}`);
  }
  const executablePath = resolveChromePath({ shell: headless === 'shell' }) || undefined;
  try {
    return await puppeteer.launch({ headless, executablePath });
  } catch (e) {
    const where = executablePath ? `（executablePath：${executablePath}）` : '（puppeteer 預設路徑）';
    throw new Error(`無法啟動 Chrome${where}：${e.message}\n${INSTALL_HINT}`);
  }
}

export function pageUrl(indexPath, query = '') {
  return pathToFileURL(indexPath).href + (query ? `?${query}` : '');
}

/** 等 web font 與頁內所有 <img> 載完（失敗的圖也算完成）；loading="lazy" 的圖改 eager，否則畫面外的永遠不載。 */
export async function waitPageReady(page, timeout = 15000) {
  await page.evaluate(() => document.querySelectorAll('img[loading="lazy"]').forEach((img) => { img.loading = 'eager'; }));
  await page.evaluate(() => document.fonts && document.fonts.ready.then(() => true));
  await page.waitForFunction(
    () => Array.from(document.images).every((img) => img.complete),
    { timeout, polling: 200 },
  ).catch(() => { /* 逾時就照現況繼續：缺圖由檢查項目自己反映 */ });
}

/**
 * 進入 PDF 列印版面，回傳 { mode: 'native'|'fallback', slides }。
 *
 * native：頁面支援 ?print=1（契約介面 D）——載入後自動跑 packer、不呼叫 window.print()、
 *   #print-slides 留在 DOM。
 * fallback（相容模式，頁面尚未支援 ?print=1）：三段 workaround：
 *   - stub window.print：真的 print dialog 會讓 headless 卡死。
 *   - 擋 Node.prototype.removeChild：頁面在 print() 後 setTimeout(500) 會移除 #print-slides，
 *     page.evaluate 輪詢的來回很容易超過 500ms，不擋就量不到。
 *   - 用 element.click()（在 page.evaluate 裡）觸發 #export-pdf-btn，不要用 page.click()：
 *     列印媒體下 body>*:not(#print-slides) 是 display:none，page.click 要可見性會逾時。
 *   同一個 setTimeout 也會拿掉 body.printing（列印時 body 寬 1280、無側欄內距），所以等它跑完再補回。
 *
 * 兩種模式最後都切 emulateMediaType('print')，而且都在 packer 跑完「之後」才切：
 * 記憶裡是導航後立刻切，但列印媒體下 html{font-size:var(--print-font-size,24px)!important}
 * 會蓋掉 packer 量測用的字級（19.2px），量出來的分頁會跟真的按「匯出 PDF」不一樣。
 * 真實瀏覽器裡 packer 是在螢幕媒體下量測的，這裡照做。
 */
export async function openPrintMode(page, indexPath, { timeout = 30000 } = {}) {
  await page.goto(pageUrl(indexPath, 'print=1'), { waitUntil: 'load' });
  await waitPageReady(page);

  const native = await page.waitForSelector('#print-slides', { timeout: 3000 }).then(() => true, () => false);

  if (native) {
    // 完成訊號：window.__coursePage.printReady（app.js 在 packer 收尾時設）；
    // 沒有這個旗標的版本看 packer 結尾的 removeAttribute('style')（拿掉離屏量測樣式）；
    // 都沒有就退而求其次：slide 數量連續 4 秒不變（舊版 packer 只等圖 3 秒；新版等全部圖載完、上限 90 秒）。
    await page.waitForFunction(() => {
      const cp = window.__coursePage;
      if (cp && cp.failed && cp.failed.some((f) => f.name === 'pdf')) return true;
      const ps = document.getElementById('print-slides');
      if (!ps) return false;
      const n = ps.querySelectorAll('.slide').length;
      const now = Date.now();
      const st = window.__vcPrintWatch || (window.__vcPrintWatch = { n: -1, since: now });
      if (st.n !== n) { st.n = n; st.since = now; }
      const imgsDone = Array.from(ps.querySelectorAll('img')).every((i) => i.complete);
      if (cp && cp.printReady) return imgsDone;
      const styleGone = !ps.hasAttribute('style');
      return n > 0 && imgsDone && ((styleGone && now - st.since >= 500) || now - st.since >= 4000);
    }, { timeout, polling: 250 });
    const failed = await page.evaluate(() => {
      const f = window.__coursePage && window.__coursePage.failed.find((x) => x.name === 'pdf');
      return f ? f.message : null;
    });
    if (failed) throw new Error(`頁面的 PDF packer 失敗（?print=1）：${failed}`);
  } else {
    const ok = await page.evaluate(() => {
      const btn = document.getElementById('export-pdf-btn');
      if (!btn) return false;
      window.__printCalled = false;
      window.print = () => { window.__printCalled = true; };
      const origRemove = Node.prototype.removeChild;
      Node.prototype.removeChild = function (child) {
        if (child && child.id === 'print-slides') return child;
        return origRemove.call(this, child);
      };
      btn.click();
      return true;
    });
    if (!ok) throw new Error('頁面沒有 #print-slides，也找不到 #export-pdf-btn：這不是 course-page-generator 產出的頁面，或版本太舊');
    // packer 先等圖片（舊版 3 秒、新版等全部載完）才開始量，輪詢旗標，不要固定 sleep
    await page.waitForFunction(() => window.__printCalled === true, { timeout, polling: 250 });
    await new Promise((r) => setTimeout(r, 700)); // 讓頁面那個 setTimeout(500) 先跑完
    await page.evaluate(() => document.body.classList.add('printing'));
  }

  await page.emulateMediaType('print');
  const slides = await page.evaluate(() => document.querySelectorAll('#print-slides .slide').length);
  return { mode: native ? 'native' : 'fallback', slides };
}

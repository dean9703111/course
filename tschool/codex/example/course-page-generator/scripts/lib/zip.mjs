// ─── Example folders → downloadable zips ───
// 將 <course-dir>/example/ 下的每個子資料夾，個別打包成 <course-dir>/assets/<name>.zip。
// 不依賴系統 zip 指令，改用 Node 內建 zlib 自行輸出 ZIP，刻意做到「Mac 與 Windows 都能直接解壓」：
//   • 設定 UTF-8 檔名旗標（general purpose bit 11）→ 中文檔名在 Windows 不會變亂碼
//   • 只收一般檔案、略過 dotfiles → 不會夾帶 .DS_Store / __MACOSX 等系統垃圾
//   • 壓縮內容帶一層同名資料夾（解壓後得到 <name>/...），對使用者最直覺
// 因為不靠外部工具，連沒裝 zip 的 build 環境（含 Windows）也能正常產生。

import { readFileSync, writeFileSync, existsSync, statSync, readdirSync, mkdirSync } from 'fs';
import { join } from 'path';
import { deflateRawSync } from 'zlib';

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = CRC32_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

// 所有檔案的時間戳固定為 1980-01-01T00:00:00（DOS 格式的起點），不取 mtime：
// 內容相同 → zip 位元相同，連續 build 不會產生假的 diff。
const DOS_TIME = 0;                                // 00:00:00
const DOS_DATE = ((1980 - 1980) << 9) | (1 << 5) | 1; // 1980-01-01

// entries: [{ name(string, 用 / 分隔), data(Buffer) }]（舊呼叫端傳的 mtime 會被忽略）
export function buildZip(entries) {
  const FLAG_UTF8 = 0x0800; // bit 11：檔名為 UTF-8，跨平台正確顯示中文
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const e of entries) {
    const nameBuf = Buffer.from(e.name, 'utf8');
    const crc = crc32(e.data);
    const deflated = deflateRawSync(e.data, { level: 9 });
    const useDeflate = deflated.length < e.data.length;
    const method = useDeflate ? 8 : 0;
    const body = useDeflate ? deflated : e.data;
    const time = DOS_TIME;
    const date = DOS_DATE;

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(FLAG_UTF8, 6);
    local.writeUInt16LE(method, 8);
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(date, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(body.length, 18);
    local.writeUInt32LE(e.data.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28);
    localParts.push(local, nameBuf, body);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(FLAG_UTF8, 8);
    central.writeUInt16LE(method, 10);
    central.writeUInt16LE(time, 12);
    central.writeUInt16LE(date, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(body.length, 20);
    central.writeUInt32LE(e.data.length, 24);
    central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);
    centralParts.push(central, nameBuf);

    offset += local.length + nameBuf.length + body.length;
  }

  const localBuf = Buffer.concat(localParts);
  const centralBuf = Buffer.concat(centralParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralBuf.length, 12);
  end.writeUInt32LE(localBuf.length, 16);
  return Buffer.concat([localBuf, centralBuf, end]);
}

function collectExampleFiles(absDir, prefix, out) {
  for (const d of readdirSync(absDir, { withFileTypes: true })) {
    if (d.name.startsWith('.')) continue; // 略過 .DS_Store 等 dotfiles
    const abs = join(absDir, d.name);
    const rel = `${prefix}/${d.name}`;
    if (d.isDirectory()) {
      collectExampleFiles(abs, rel, out);
    } else if (d.isFile()) {
      out.push({ name: rel, data: readFileSync(abs) });
    }
  }
}

// 回傳 [{ dir, files, bytes }]（build 摘要用）；opts.quiet 不印進度
export function packageExamples(courseDir, opts = {}) {
  const log = opts.quiet ? () => {} : (msg) => console.log(msg);
  const warn = opts.quiet ? () => {} : (msg) => console.warn(msg);
  const zips = [];
  const exampleDir = join(courseDir, 'example');
  if (!existsSync(exampleDir) || !statSync(exampleDir).isDirectory()) return zips;

  const dirs = readdirSync(exampleDir, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith('.'));
  if (!dirs.length) return zips;

  const assetsDir = join(courseDir, 'assets');
  if (!existsSync(assetsDir)) mkdirSync(assetsDir, { recursive: true });

  for (const d of dirs) {
    const entries = [];
    collectExampleFiles(join(exampleDir, d.name), d.name, entries);
    if (!entries.length) continue;
    entries.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0)); // 穩定輸出
    const zipPath = join(assetsDir, `${d.name}.zip`);
    try {
      const buf = buildZip(entries);
      writeFileSync(zipPath, buf);
      zips.push({ dir: d.name, files: entries.length, bytes: buf.length });
      const kb = Math.max(1, Math.round(buf.length / 1024));
      log(`   📦 example/${d.name} → assets/${d.name}.zip (${entries.length} 檔, ${kb} KB)`);
    } catch (err) {
      warn(`   ⚠️  無法打包 example/${d.name}：${err.message}`);
    }
  }
  return zips;
}

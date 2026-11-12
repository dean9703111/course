// ─── 本地圖片尺寸：讀檔頭取寬高（PNG／JPEG／GIF／WebP／SVG），零依賴 ───
// build 把結果寫進 <img width height>：圖片還沒載完就先佔好比例，列印 packer 與捲動錨點不會因為高度 0 而算錯。
// 認不出格式、檔頭壞掉、SVG 的 width／height 用 %／em 這類相對單位時回 null（呼叫端照舊不寫）。

import { readFileSync } from 'node:fs';

export function imageSize(file) {
  let buf;
  try { buf = readFileSync(file); } catch { return null; }
  try {
    return pngSize(buf) || gifSize(buf) || webpSize(buf) || jpegSize(buf) || svgSize(buf);
  } catch { return null; } // 檔頭被截斷：讀超出範圍
}

const ok = (width, height) => (width > 0 && height > 0 ? { width, height } : null);

// PNG：8 bytes 簽章，第一個 chunk 是 IHDR（寬、高各 4 bytes big-endian）
function pngSize(b) {
  if (b.length < 24 || b.readUInt32BE(0) !== 0x89504e47 || b.toString('latin1', 12, 16) !== 'IHDR') return null;
  return ok(b.readUInt32BE(16), b.readUInt32BE(20));
}

// GIF：GIF87a／GIF89a，邏輯畫面寬高各 2 bytes little-endian
function gifSize(b) {
  if (b.length < 10 || !/^GIF8[79]a$/.test(b.toString('latin1', 0, 6))) return null;
  return ok(b.readUInt16LE(6), b.readUInt16LE(8));
}

// WebP：RIFF....WEBP 後第一個 chunk 決定格式
function webpSize(b) {
  if (b.length < 16 || b.toString('latin1', 0, 4) !== 'RIFF' || b.toString('latin1', 8, 12) !== 'WEBP') return null;
  const kind = b.toString('latin1', 12, 16);
  if (kind === 'VP8 ') { // 有損：frame tag 3 bytes＋起始碼 9d 01 2a，之後寬高各 14 bits
    if (b[23] !== 0x9d || b[24] !== 0x01 || b[25] !== 0x2a) return null;
    return ok(b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff);
  }
  if (kind === 'VP8L') { // 無損：簽章 0x2f，之後 (寬-1)、(高-1) 各 14 bits
    if (b[20] !== 0x2f) return null;
    const bits = b.readUInt32LE(21);
    return ok((bits & 0x3fff) + 1, ((bits >>> 14) & 0x3fff) + 1);
  }
  if (kind === 'VP8X') { // 延伸格式：canvas (寬-1)、(高-1) 各 24 bits
    return ok(b.readUIntLE(24, 3) + 1, b.readUIntLE(27, 3) + 1);
  }
  return null;
}

// JPEG：從 SOI 之後逐個 marker 跳，遇到 SOF0／1／2 讀高、寬（各 2 bytes big-endian）
function jpegSize(b) {
  if (b.length < 4 || b[0] !== 0xff || b[1] !== 0xd8) return null;
  let i = 2;
  while (i + 3 < b.length) {
    if (b[i] !== 0xff) return null;
    const marker = b[i + 1];
    if (marker === 0xff) { i++; continue; } // 填充位元組
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { i += 2; continue; } // 沒有長度欄位
    if (marker === 0xd9 || marker === 0xda) return null; // EOI／SOS：到這裡還沒看到 SOF
    if (marker >= 0xc0 && marker <= 0xc2) return ok(b.readUInt16BE(i + 7), b.readUInt16BE(i + 5));
    i += 2 + b.readUInt16BE(i + 2);
  }
  return null;
}

// SVG：根 <svg> 的 width／height（無單位或 px）；缺一或都缺時用 viewBox 補比例
function svgSize(b) {
  const tag = /<svg\b[^>]*>/i.exec(b.toString('utf8'));
  if (!tag) return null;
  const attr = (name) => {
    const m = new RegExp(`\\s${name}\\s*=\\s*["']([^"']*)["']`, 'i').exec(tag[0]);
    return m ? m[1].trim() : undefined;
  };
  const len = (v) => {
    if (v === undefined || v === '') return undefined;
    const m = /^(\d+(?:\.\d+)?|\.\d+)(px)?$/i.exec(v);
    return m ? parseFloat(m[1]) : null; // null：相對單位，無法決定像素尺寸
  };
  let w = len(attr('width'));
  let h = len(attr('height'));
  if (w === null || h === null) return null;
  if (!(w && h)) {
    const vb = (attr('viewBox') || '').split(/[\s,]+/).map(Number);
    if (vb.length !== 4 || !(vb[2] > 0) || !(vb[3] > 0)) return null;
    if (w) h = w * vb[3] / vb[2];
    else if (h) w = h * vb[2] / vb[3];
    else { w = vb[2]; h = vb[3]; }
  }
  return ok(Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));
}

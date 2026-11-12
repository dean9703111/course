// ─── Minimal YAML parser (handles our config structure without deps) ───
// 刻意零依賴的精簡實作：支援巢狀物件、`- ` 陣列（含 `- key: value` 物件）、`>` 摺疊多行、行內 # 註解。
// 不支援：inline array/object、anchor、多層陣列、跨行引號字串。夠用於 config/global.yaml 與課程 config.yaml。
//
// 一定是寫錯的輸入直接丟 YamlError（build 轉成硬錯誤），不再靜默產出：
//   值以 " 或 ' 開頭卻找不到對應的結尾引號（例：title: "AI 課程）→ rule = yaml-unterminated-quote

export class YamlError extends Error {
  constructor(message, { rule, file, line } = {}) {
    super(message);
    this.name = 'YamlError';
    this.rule = rule;
    this.file = file;
    this.line = line;
  }
}

// 內部用：parse 過程中發現的錯誤（parseYamlFull 會補上檔名後轉成 YamlError）
class LineError extends Error {
  constructor(rule, lineIdx) { super(rule); this.rule = rule; this.lineIdx = lineIdx; }
}

// 去掉值後面的行內註解，回傳原始值（引號保留，交給 unquote 處理）。
//   引號值：取「後面只剩空白或 ` # 註解`」的第一個同種引號當結尾；找不到 → 未閉合
//   非引號值：` # ` 起算是註解（`#fff` 這種緊貼的 # 仍屬於值）
function stripInlineComment(v, lineIdx) {
  v = v.trim();
  if (v.startsWith('"') || v.startsWith("'")) {
    const q = v[0];
    for (let k = 1; k < v.length; k++) {
      if (v[k] !== q) continue;
      const rest = v.slice(k + 1);
      if (rest.trim() === '' || /^\s+#/.test(rest)) return v.slice(0, k + 1);
    }
    throw new LineError('yaml-unterminated-quote', lineIdx);
  }
  if (v === '#' || v.startsWith('# ')) return '';
  const m = v.match(/\s#(\s|$)/);
  return m ? v.slice(0, m.index).trimEnd() : v;
}

function unquote(s) {
  if (!s) return '';
  s = s.trim();
  if (s.length >= 2 && ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'")))) {
    return s.slice(1, -1);
  }
  if (s === 'true') return true;
  if (s === 'false') return false;
  return s;
}

// file：錯誤訊息用的來源路徑（選填）
export function parseYamlFull(text, file = '') {
  const cleanLines = text.replace(/^﻿/, '').split('\n').map(l => l.replace(/\s+$/, ''));
  try {
    return parseYamlBlock(cleanLines, 0, cleanLines.length, -1);
  } catch (e) {
    if (!(e instanceof LineError)) throw e;
    const line = e.lineIdx + 1;
    const where = `${file || 'YAML'}:${line}`;
    throw new YamlError(
      `${where} 引號沒有閉合：${cleanLines[e.lineIdx].trim()}\n`
      + '   → 字串要用成對的引號包起來（"…" 或 \'…\'），結尾引號後面只能接 # 註解',
      { rule: e.rule, file, line },
    );
  }
}

// 鍵名接受 - （hero-title: 這類寫法不再被靜默略過，交給 validateConfig 報 unknown-key）
const KEY_RE = /^([\w-]+):\s*(.*)/;

function matchKey(s) {
  return s.match(KEY_RE);
}

function parseYamlBlock(lines, start, end, parentIndent) {
  const result = {};
  let i = start;

  while (i < end) {
    const line = lines[i];

    if (line.trim() === '' || /^\s*#/.test(line)) { i++; continue; }

    const indent = line.search(/\S/);
    if (indent <= parentIndent) break;

    if (line.trim().startsWith('- ')) { i++; continue; }

    const kvMatch = matchKey(line.trim());
    if (!kvMatch) { i++; continue; }

    const key = kvMatch[1];
    const val = stripInlineComment(kvMatch[2], i);

    if (val === '>') {
      let mlVal = '';
      i++;
      while (i < end) {
        const nl = lines[i];
        if (nl.trim() === '' || /^\s*#/.test(nl)) { i++; continue; }
        const ni = nl.search(/\S/);
        if (ni <= indent) break;
        mlVal += (mlVal ? ' ' : '') + nl.trim();
        i++;
      }
      result[key] = mlVal;
      continue;
    }

    const nextNonEmpty = findNextNonEmpty(lines, i + 1, end);
    if (nextNonEmpty < end && lines[nextNonEmpty].trim().startsWith('- ')) {
      const nextIndent = lines[nextNonEmpty].search(/\S/);
      if (nextIndent > indent) {
        result[key] = parseYamlArray(lines, i + 1, end, indent);
        i = skipBlock(lines, i + 1, end, indent);
        continue;
      }
    }

    if (val === '') {
      const ni = findNextNonEmpty(lines, i + 1, end);
      if (ni < end && lines[ni].search(/\S/) > indent) {
        result[key] = parseYamlBlock(lines, i + 1, end, indent);
        i = skipBlock(lines, i + 1, end, indent);
        continue;
      }
    }

    result[key] = unquote(val);
    i++;
  }

  return result;
}

function parseYamlArray(lines, start, end, parentIndent) {
  const result = [];
  let i = start;

  while (i < end) {
    const line = lines[i];
    if (line.trim() === '' || /^\s*#/.test(line)) { i++; continue; }

    const indent = line.search(/\S/);
    if (indent <= parentIndent) break;

    if (line.trim().startsWith('- ')) {
      const content = line.trim().slice(2).trim();
      const kvMatch = matchKey(content);

      if (kvMatch) {
        const obj = {};
        const firstVal = stripInlineComment(kvMatch[2], i);
        obj[kvMatch[1]] = firstVal === '>'
          ? (() => { let v = ''; i++; while (i < end) { const l = lines[i]; if (l.trim() === '' || /^\s*#/.test(l)) { i++; continue; } if (l.search(/\S/) <= indent + 2) break; v += (v ? ' ' : '') + l.trim(); i++; } return v; })()
          : unquote(firstVal);

        if (firstVal !== '>') i++;

        while (i < end) {
          const nl = lines[i];
          if (nl.trim() === '' || /^\s*#/.test(nl)) { i++; continue; }
          const ni = nl.search(/\S/);
          if (ni <= indent) break;
          if (nl.trim().startsWith('- ')) break;
          const nkv = matchKey(nl.trim());
          if (nkv) {
            const nval = stripInlineComment(nkv[2], i);
            if (nval === '>') {
              let v = ''; i++;
              while (i < end) { const l = lines[i]; if (l.trim() === '' || /^\s*#/.test(l)) { i++; continue; } if (l.search(/\S/) <= ni) break; v += (v ? ' ' : '') + l.trim(); i++; }
              obj[nkv[1]] = v;
            } else {
              obj[nkv[1]] = unquote(nval);
              i++;
            }
          } else {
            i++;
          }
        }
        result.push(obj);
      } else {
        result.push(unquote(stripInlineComment(content, i)));
        i++;
      }
    } else {
      i++;
    }
  }

  return result;
}

function findNextNonEmpty(lines, start, end) {
  for (let i = start; i < end; i++) {
    if (lines[i].trim() !== '' && !/^\s*#/.test(lines[i])) return i;
  }
  return end;
}

function skipBlock(lines, start, end, parentIndent) {
  let i = start;
  while (i < end) {
    const line = lines[i];
    if (line.trim() === '' || /^\s*#/.test(line)) { i++; continue; }
    if (line.search(/\S/) <= parentIndent) return i;
    i++;
  }
  return i;
}

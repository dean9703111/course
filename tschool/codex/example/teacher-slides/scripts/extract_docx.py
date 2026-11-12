#!/usr/bin/env python3
"""把 Word（.docx）圖文教材拆成「文字稿＋圖片」，方便照內容設計簡報。

只用 Python 3 內建模組（不需要 pip 安裝任何套件）。

用法：
  python3 extract_docx.py 教材.docx                  # 產出到 output/教材_素材/
  python3 extract_docx.py 教材.docx --out 資料夾      # 指定輸出資料夾
  python3 extract_docx.py 講義1.docx 講義2.docx       # 一次拆多份，每份各自一個資料夾

產出（每份 Word 一個資料夾）：
  內容.md            標題、段落、清單、表格照原本的順序；圖片出現的位置標成 ![圖 N｜圖說](圖片/圖NN.png)
  圖片/圖NN.副檔名    Word 裡的圖片，依出現順序編號
"""
import os
import re
import struct
import sys
import zipfile
import xml.etree.ElementTree as ET

W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
A = "http://schemas.openxmlformats.org/drawingml/2006/main"
R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
V = "urn:schemas-microsoft-com:vml"
PKG_REL = "http://schemas.openxmlformats.org/package/2006/relationships"
DECK_IMAGE_EXT = {"png", "jpg", "jpeg", "gif"}  # build_deck.py 可以自動放進簡報的格式
SUBSCRIPT = str.maketrans("0123456789+-−=()", "₀₁₂₃₄₅₆₇₈₉₊₋₋₌₍₎")
SUPERSCRIPT = str.maketrans("0123456789+-−=()n", "⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁻⁼⁽⁾ⁿ")
CAPTION_RE = re.compile(r"^\s*(▲|△|圖\s*[\d一二三四五六七八九十]|Figure|Fig\.)")


def w(tag):
    return "{%s}%s" % (W, tag)


def image_size(data):
    """回傳 (寬, 高) 像素；讀不出來回傳 None。"""
    try:
        if data[:8] == b"\x89PNG\r\n\x1a\n":
            return struct.unpack(">II", data[16:24])
        if data[:6] in (b"GIF87a", b"GIF89a"):
            return struct.unpack("<HH", data[6:10])
        if data[:2] == b"\xff\xd8":
            i = 2
            while i + 9 < len(data):
                if data[i] != 0xFF:
                    i += 1
                    continue
                m = data[i + 1]
                if 0xC0 <= m <= 0xCF and m not in (0xC4, 0xC8, 0xCC):
                    h, wd = struct.unpack(">HH", data[i + 5:i + 9])
                    return (wd, h)
                if m in (0xD8, 0x01, 0xFF) or 0xD0 <= m <= 0xD7:
                    i += 2
                    continue
                i += 2 + struct.unpack(">H", data[i + 2:i + 4])[0]
    except (struct.error, IndexError):
        pass
    return None


def load_styles(z):
    """styleId → 樣式名稱（小寫），用來判斷標題與清單。"""
    out = {}
    if "word/styles.xml" in z.namelist():
        for st in ET.fromstring(z.read("word/styles.xml")).iter(w("style")):
            name = st.find(w("name"))
            out[st.get(w("styleId"))] = (name.get(w("val")) if name is not None else "").lower()
    return out


def load_numbering(z):
    """numId → {ilvl: 是否為編號清單}。"""
    out = {}
    if "word/numbering.xml" not in z.namelist():
        return out
    root = ET.fromstring(z.read("word/numbering.xml"))
    abstract = {}
    for an in root.iter(w("abstractNum")):
        lv = {}
        for lvl in an.iter(w("lvl")):
            fmt = lvl.find(w("numFmt"))
            lv[lvl.get(w("ilvl"), "0")] = fmt is not None and fmt.get(w("val")) != "bullet"
        abstract[an.get(w("abstractNumId"))] = lv
    for num in root.iter(w("num")):
        ref = num.find(w("abstractNumId"))
        if ref is not None:
            out[num.get(w("numId"))] = abstract.get(ref.get(w("val")), {})
    return out


def load_rels(z):
    out = {}
    name = "word/_rels/document.xml.rels"
    if name in z.namelist():
        for rel in ET.fromstring(z.read(name)):
            if rel.get("TargetMode") == "External":
                continue
            t = rel.get("Target", "")
            out[rel.get("Id")] = t.lstrip("/") if t.startswith("/") else os.path.normpath("word/" + t).replace(os.sep, "/")
    return out


class Extractor:
    def __init__(self, docx_path, out_dir):
        self.z = zipfile.ZipFile(docx_path)
        self.out_dir = out_dir
        self.img_dir = os.path.join(out_dir, "圖片")
        self.styles = load_styles(self.z)
        self.numbering = load_numbering(self.z)
        self.rels = load_rels(self.z)
        self.lines = []          # 內容.md 的每一行
        self.images = []         # {no, file, size, heading, caption, line}
        self.by_part = {}        # 同一張圖重複使用時只存一次
        self.heading = "（文件開頭）"
        self.counts = {"段落": 0, "表格": 0}
        self.pending_caption = None  # 等下一段文字當圖說的圖片

    # ---- 文字與圖片 ----
    def para_text(self, p):
        """段落文字；Word 的上標、下標轉成 Unicode（H₂SO₄、OH⁻），化學式才不會變成 H2SO4。"""
        out = []
        for run in p.iter(w("r")):
            va = run.find(w("rPr") + "/" + w("vertAlign"))
            kind = va.get(w("val")) if va is not None else ""
            for el in run:
                if el.tag == w("t"):
                    t = el.text or ""
                    out.append(t.translate(SUBSCRIPT) if kind == "subscript" else
                               t.translate(SUPERSCRIPT) if kind == "superscript" else t)
                elif el.tag in (w("tab"), w("br"), w("cr")):
                    out.append(" ")
        return re.sub(r"[ \t]+", " ", "".join(out)).strip()

    def para_images(self, p):
        rids = []
        for el in p.iter():
            if el.tag == "{%s}blip" % A:
                rid = el.get("{%s}embed" % R)
            elif el.tag == "{%s}imagedata" % V:
                rid = el.get("{%s}id" % R)
            else:
                continue
            if rid and rid in self.rels and self.rels[rid] in self.z.namelist():
                rids.append(rid)
        return rids

    def save_image(self, rid):
        part = self.rels[rid]
        if part in self.by_part:
            return self.by_part[part]
        data = self.z.read(part)
        ext = os.path.splitext(part)[1].lower().lstrip(".") or "bin"
        ext = "jpg" if ext == "jpeg" else ext
        no = len(self.images) + 1
        fname = f"圖{no:02d}.{ext}"
        os.makedirs(self.img_dir, exist_ok=True)
        with open(os.path.join(self.img_dir, fname), "wb") as f:
            f.write(data)
        info = {"no": no, "file": fname, "ext": ext, "size": image_size(data), "heading": self.heading,
                "caption": "", "line": None}
        self.images.append(info)
        self.by_part[part] = info
        return info

    def emit_image(self, info):
        info["line"] = len(self.lines)
        self.lines.append("")  # 之後回填（等圖說）
        self.lines.append("")
        self.pending_caption = info

    # ---- 段落 ----
    def handle_paragraph(self, p):
        ppr = p.find(w("pPr"))
        style_id = ""
        num_pr = None
        if ppr is not None:
            ps = ppr.find(w("pStyle"))
            style_id = ps.get(w("val")) if ps is not None else ""
            num_pr = ppr.find(w("numPr"))
        style = self.styles.get(style_id, style_id.lower())
        text = self.para_text(p)
        rids = self.para_images(p)

        if text:
            self.counts["段落"] += 1
            m = re.search(r"(heading|標題)\s*(\d)", style)
            is_caption = "caption" in style or "圖說" in style or CAPTION_RE.match(text)
            if self.pending_caption is not None and is_caption and not rids:
                self.pending_caption["caption"] = re.sub(r"^\s*[▲△]\s*", "", text)
                self.pending_caption = None
            elif style == "title":
                self.lines += [f"# {text}", ""]
            elif m:
                level = min(int(m.group(2)) + 1, 4)
                self.heading = text
                self.lines += ["#" * level + " " + text, ""]
            elif "list number" in style or (num_pr is not None and self.is_numbered(num_pr)):
                self.lines.append(f"1. {text}")
            elif "list bullet" in style or num_pr is not None:
                self.lines.append(f"- {text}")
            else:
                self.lines += [text, ""]
            if not is_caption:
                self.pending_caption = None
        for rid in rids:
            self.emit_image(self.save_image(rid))

    def is_numbered(self, num_pr):
        nid = num_pr.find(w("numId"))
        lvl = num_pr.find(w("ilvl"))
        levels = self.numbering.get(nid.get(w("val")) if nid is not None else "", {})
        return levels.get(lvl.get(w("val")) if lvl is not None else "0", False)

    # ---- 表格 ----
    def handle_table(self, tbl):
        rows = []
        for tr in tbl.findall(w("tr")):
            cells = []
            for tc in tr.findall(w("tc")):
                parts = []
                for p in tc.iter(w("p")):
                    t = self.para_text(p)
                    if t:
                        parts.append(t)
                    for rid in self.para_images(p):
                        info = self.save_image(rid)
                        parts.append(f"（圖 {info['no']}：圖片/{info['file']}）")
                cells.append("<br>".join(parts).replace("|", "｜"))
            rows.append(cells)
        if not rows:
            return
        ncols = max(len(r) for r in rows)
        if ncols == 1:  # 單欄表格通常是「提醒框」，當成引言
            for r in rows:
                if r[0]:
                    self.lines.append("> " + r[0].replace("<br>", "\n> "))
            self.lines.append("")
            return
        self.counts["表格"] += 1
        rows = [r + [""] * (ncols - len(r)) for r in rows]
        self.lines.append("| " + " | ".join(rows[0]) + " |")
        self.lines.append("|" + "---|" * ncols)
        for r in rows[1:]:
            self.lines.append("| " + " | ".join(r) + " |")
        self.lines.append("")
        self.pending_caption = None

    def walk(self, parent):
        for el in parent:
            if el.tag == w("p"):
                self.handle_paragraph(el)
            elif el.tag == w("tbl"):
                self.handle_table(el)
            elif el.tag == w("sdt"):
                content = el.find(w("sdtContent"))
                if content is not None:
                    self.walk(content)

    def run(self):
        os.makedirs(self.out_dir, exist_ok=True)
        body = ET.fromstring(self.z.read("word/document.xml")).find(w("body"))
        self.walk(body)
        for info in self.images:  # 回填圖片行（圖說要等下一段才知道）
            if info["line"] is not None:
                alt = f"圖 {info['no']}" + (f"｜{info['caption']}" if info["caption"] else "")
                self.lines[info["line"]] = f"![{alt}](圖片/{info['file']})"
        text = re.sub(r"\n{3,}", "\n\n", "\n".join(self.lines)).strip() + "\n"
        with open(os.path.join(self.out_dir, "內容.md"), "w", encoding="utf-8") as f:
            f.write(text)
        return self


def describe(info):
    size = info["size"]
    if not size:
        shape = "尺寸不明"
    else:
        ratio = size[0] / size[1]
        shape = f"{size[0]}×{size[1]}，" + ("橫式" if ratio > 1.15 else "直式" if ratio < 0.87 else "接近方形")
    note = "" if info["ext"] in DECK_IMAGE_EXT else "｜⚠️ 這個格式無法自動放進簡報，請在 PowerPoint 手動放"
    return f"{shape}{note}"


def main():
    args = sys.argv[1:]
    if not args or args[0] in ("-h", "--help"):
        print(__doc__)
        return 0
    out = None
    if "--out" in args:
        i = args.index("--out")
        if i + 1 >= len(args):
            print("--out 後面要接資料夾")
            return 1
        out = args[i + 1]
        del args[i:i + 2]
    code = 0
    for path in args:
        if not os.path.isfile(path):
            print(f"❌ 找不到檔案：{path}")
            code = 1
            continue
        if not zipfile.is_zipfile(path):
            print(f"❌ 不是 .docx 檔（舊版 .doc 請先在 Word 另存成 .docx）：{path}")
            code = 1
            continue
        stem = os.path.splitext(os.path.basename(path))[0]
        if out and len(args) == 1:
            out_dir = out
        else:
            out_dir = os.path.join(out or "output", f"{stem}_素材")
        ex = Extractor(path, out_dir).run()
        rel = os.path.relpath(out_dir)
        print(f"✅ {os.path.basename(path)} → {rel}/內容.md（{ex.counts['段落']} 段文字、{ex.counts['表格']} 個表格、{len(ex.images)} 張圖片）")
        for info in ex.images:
            cap = info["caption"] or "（沒有圖說）"
            print(f"   圖 {info['no']}：{rel}/圖片/{info['file']}｜{describe(info)}｜所在段落：{info['heading']}｜圖說：{cap}")
    return code


if __name__ == "__main__":
    sys.exit(main())

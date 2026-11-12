#!/usr/bin/env python3
"""依「簡報計畫 JSON」套用校園簡報模板，產出 .pptx。

只用 Python 3 內建模組（不需要 pip 安裝任何套件）。

用法：
  python3 build_deck.py plan.json                # 依計畫產出簡報
  python3 build_deck.py --list                   # 列出每個版型可以填的文字框名稱

plan.json 範例（完整說明見 references/layouts.md）：
{
  "output": "output/班親會簡報.pptx",
  "footer": "星光國小｜五年三班｜班親會",
  "slides": [
    {"layout": 1, "text": {"badge": "下學期班親會", "title": "一起陪孩子\\n讀得更有依據",
                           "subtitle": "...", "meta": "2027/2/27｜王老師｜五年三班"}},
    {"layout": 6, "text": {"title": "晨讀時間長這樣", "lead": "每天 20 分鐘"},
     "image": "output/教材_素材/圖片/圖01.png"},
    {"layout": 10, "text": {"title": "下學期學習重點"},
     "table": [["科目", "重點"], ["國語", "閱讀理解與摘要"]]}
  ]
}

圖片："image" 只能用在有照片框的版型（01、06、14），支援 PNG／JPG／GIF；
預設完整顯示整張圖（不裁切），加上 "image-fit": "cover" 會裁切成填滿照片框。
"""
import hashlib
import json
import os
import re
import struct
import sys
import zipfile
import xml.etree.ElementTree as ET

HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_TEMPLATE = os.path.join(HERE, "..", "assets", "School_Slides_Template.pptx")

NS = {
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
    "p": "http://schemas.openxmlformats.org/presentationml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "pr": "http://schemas.openxmlformats.org/package/2006/relationships",
    "ct": "http://schemas.openxmlformats.org/package/2006/content-types",
}
SLIDE_REL = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide"
SLIDE_CT = "application/vnd.openxmlformats-officedocument.presentationml.slide+xml"
IMAGE_REL = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image"
IMAGE_CT = {"png": "image/png", "jpg": "image/jpeg", "gif": "image/gif"}
IMAGE_LAYOUTS = "01、06、14"

# 版型編號 → 模板第幾頁（第 1 頁封面、第 2 頁使用說明、第 3～15 頁為版型 02～14）
LAYOUT_TO_PAGE = {1: 1, 0: 2}
LAYOUT_TO_PAGE.update({n: n + 1 for n in range(2, 15)})
LAYOUT_NAMES = {0: "使用說明", 1: "封面", 2: "今天的流程", 3: "章節分隔", 4: "一句話重點", 5: "三個重點",
                6: "左文右圖", 7: "雙欄比較", 8: "步驟流程", 9: "時間軸", 10: "表格", 11: "分工與窗口",
                12: "請家長配合", 13: "數字亮點", 14: "結尾與聯絡"}
# 可以少填的項目群組：沒填的項目會整組（含裝飾）移除
ITEM_GROUPS = ("agenda", "point", "step", "milestone", "role", "check", "stat")
# 字數上限（超過只警告，不會中斷）
LIMITS = [
    (r"^title$", 22), (r"^subtitle$", 30), (r"^statement$", 32), (r"^support$", 40),
    (r"^badge$", 18), (r"^meta$", 32), (r"^lead$", 24), (r"^action$", 30), (r"^conclusion$", 32),
    (r"^note$", 40), (r"^interpretation$", 40), (r"^reminder-title$", 10), (r"^reminder-text$", 44),
    (r"^deadline$", 20), (r"^contact$", 40), (r"^sticky-note$", 16),
    (r"^agenda-\d-title$", 12), (r"^agenda-\d-desc$", 24), (r"^agenda-\d-time$", 7),
    (r"^point-\d-title$", 10), (r"^point-\d-desc$", 40),
    (r"^compare-\d-head$", 12), (r"^compare-\d-fit$", 20),
    (r"^step-\d-title$", 8), (r"^step-\d-desc$", 26),
    (r"^milestone-\d-date$", 10), (r"^milestone-\d-title$", 8), (r"^milestone-\d-desc$", 22),
    (r"^role-\d-name$", 8), (r"^role-\d-duty$", 26), (r"^role-\d-contact$", 14),
    (r"^check-\d$", 26), (r"^stat-\d-number$", 6), (r"^stat-\d-unit$", 6), (r"^stat-\d-label$", 20),
]
LIST_ITEM_LIMIT = 22  # bullets / compare-N-bullets 每一項


def q(tag):
    pre, local = tag.split(":")
    return "{%s}%s" % (NS[pre], local)


def register_namespaces(xml_bytes):
    for prefix, uri in re.findall(rb'xmlns:([A-Za-z0-9]+)="([^"]+)"', xml_bytes):
        try:
            ET.register_namespace(prefix.decode(), uri.decode())
        except ValueError:
            pass


def shape_name(el):
    for path in ("p:nvSpPr/p:cNvPr", "p:nvGraphicFramePr/p:cNvPr", "p:nvCxnSpPr/p:cNvPr", "p:nvPicPr/p:cNvPr"):
        c = el.find(path, NS)
        if c is not None:
            return c.get("name", "")
    return ""


def shape_text(el):
    return "".join(t.text or "" for t in el.iter(q("a:t")))


def set_paragraphs(tx_body, lines):
    """把 txBody 的段落換成 lines，沿用第一段的段落與文字格式。"""
    paras = tx_body.findall("a:p", NS)
    first = paras[0]
    ppr = first.find("a:pPr", NS)
    run = first.find("a:r", NS)
    rpr = run.find("a:rPr", NS) if run is not None else None
    end = first.find("a:endParaRPr", NS)
    bullet = ""
    if run is not None and (run.find("a:t", NS).text or "").startswith("•  "):
        bullet = "•  "
    for p in paras:
        tx_body.remove(p)
    for line in lines:
        p = ET.SubElement(tx_body, q("a:p"))
        if ppr is not None:
            p.append(ET.fromstring(ET.tostring(ppr)))
        r = ET.SubElement(p, q("a:r"))
        if rpr is not None:
            r.append(ET.fromstring(ET.tostring(rpr)))
        t = ET.SubElement(r, q("a:t"))
        t.text = bullet + line
        if end is not None:
            p.append(ET.fromstring(ET.tostring(end)))


def to_lines(value):
    if isinstance(value, list):
        return [str(v) for v in value]
    return str(value).split("\n")


def fill_table(frame, rows, warnings, page):
    tbl = frame.find(".//a:tbl", NS)
    trs = tbl.findall("a:tr", NS)
    # 欄數比模板少：刪掉多的欄，把寬度平均分給留下的欄（第一欄窄一點）
    grid = tbl.find("a:tblGrid", NS)
    cols = grid.findall("a:gridCol", NS)
    ncols = max((len(r) for r in rows), default=len(cols))
    if 0 < ncols < len(cols):
        total = sum(int(c.get("w")) for c in cols)
        for c in cols[ncols:]:
            grid.remove(c)
        for tr in trs:
            for tc in tr.findall("a:tc", NS)[ncols:]:
                tr.remove(tc)
        first = int(total * (0.28 if ncols == 2 else 0.8 / ncols))
        rest = (total - first) // (ncols - 1) if ncols > 1 else 0
        for i, c in enumerate(grid.findall("a:gridCol", NS)):
            c.set("w", str(first if i == 0 else rest) if ncols > 1 else str(total))
    if len(rows) > len(trs):
        warnings.append(f"第 {page} 頁：表格最多 {len(trs)} 列（含標題列），多的 {len(rows) - len(trs)} 列沒有放進去，請拆頁")
    for i, tr in enumerate(trs):
        if i >= len(rows):
            tbl.remove(tr)
            continue
        tcs = tr.findall("a:tc", NS)
        if len(rows[i]) > len(tcs):
            warnings.append(f"第 {page} 頁：表格最多 {len(tcs)} 欄，第 {i + 1} 列多的欄位沒有放進去")
        for j, tc in enumerate(tcs):
            val = rows[i][j] if j < len(rows[i]) else ""
            set_paragraphs(tc.find("a:txBody", NS), to_lines(val))


def image_info(data):
    """回傳 (副檔名, 寬, 高)；不是 PNG／JPG／GIF 或讀不出尺寸就回傳 None。"""
    try:
        if data[:8] == b"\x89PNG\r\n\x1a\n":
            w, h = struct.unpack(">II", data[16:24])
            return ("png", w, h)
        if data[:6] in (b"GIF87a", b"GIF89a"):
            w, h = struct.unpack("<HH", data[6:10])
            return ("gif", w, h)
        if data[:2] == b"\xff\xd8":
            i = 2
            while i + 9 < len(data):
                if data[i] != 0xFF:
                    i += 1
                    continue
                m = data[i + 1]
                if 0xC0 <= m <= 0xCF and m not in (0xC4, 0xC8, 0xCC):
                    h, w = struct.unpack(">HH", data[i + 5:i + 9])
                    return ("jpg", w, h)
                if m in (0xD8, 0x01, 0xFF) or 0xD0 <= m <= 0xD7:
                    i += 2
                    continue
                i += 2 + struct.unpack(">H", data[i + 2:i + 4])[0]
    except (struct.error, IndexError):
        pass
    return None


def load_image(spec, base, page, warnings):
    """讀取簡報計畫指定的圖片；找不到或格式不支援就警告並回傳 None（保留照片框）。"""
    ref = spec.get("image")
    if not ref:
        return None
    candidates = [ref] if os.path.isabs(ref) else [os.path.join(os.getcwd(), ref), os.path.join(base, ref)]
    path = next((c for c in candidates if os.path.isfile(c)), None)
    if not path:
        warnings.append(f"第 {page} 頁：找不到圖片 {ref}，照片框先保留")
        return None
    with open(path, "rb") as f:
        data = f.read()
    info = image_info(data)
    if not info or not info[1] or not info[2]:
        warnings.append(f"第 {page} 頁：圖片 {ref} 不是 PNG／JPG／GIF，無法自動放入，請在 PowerPoint 手動放")
        return None
    return {"data": data, "ext": info[0], "w": info[1], "h": info[2], "ref": ref,
            "fit": spec.get("image-fit", "contain"), "alt": spec.get("image-alt", "")}


def make_picture(frame, image, shape_id, alt):
    """依照片框的位置產生圖片圖形：預設完整顯示（等比例縮放置中），fit=cover 時裁切填滿。"""
    off = frame.find("p:spPr/a:xfrm/a:off", NS)
    ext = frame.find("p:spPr/a:xfrm/a:ext", NS)
    fx, fy, fw, fh = int(off.get("x")), int(off.get("y")), int(ext.get("cx")), int(ext.get("cy"))
    pad = int(min(fw, fh) * 0.04)
    ax, ay, aw, ah = fx + pad, fy + pad, fw - 2 * pad, fh - 2 * pad
    ia, fa = image["w"] / image["h"], aw / ah
    crop = {}
    if image["fit"] == "cover":
        x, y, w, h = ax, ay, aw, ah
        if ia > fa:
            side = int((1 - fa / ia) / 2 * 100000)
            crop = {"l": str(side), "r": str(side)}
        else:
            side = int((1 - ia / fa) / 2 * 100000)
            crop = {"t": str(side), "b": str(side)}
    else:
        w, h = (aw, int(aw / ia)) if ia > fa else (int(ah * ia), ah)
        x, y = ax + (aw - w) // 2, ay + (ah - h) // 2
    pic = ET.Element(q("p:pic"))
    nv = ET.SubElement(pic, q("p:nvPicPr"))
    ET.SubElement(nv, q("p:cNvPr"), {"id": str(shape_id), "name": "image", "descr": alt})
    cnv = ET.SubElement(nv, q("p:cNvPicPr"))
    ET.SubElement(cnv, q("a:picLocks"), {"noChangeAspect": "1"})
    ET.SubElement(nv, q("p:nvPr"))
    fill = ET.SubElement(pic, q("p:blipFill"))
    ET.SubElement(fill, q("a:blip"), {q("r:embed"): image["rid"]})
    if crop:
        ET.SubElement(fill, q("a:srcRect"), crop)
    ET.SubElement(ET.SubElement(fill, q("a:stretch")), q("a:fillRect"))
    sp = ET.SubElement(pic, q("p:spPr"))
    xf = ET.SubElement(sp, q("a:xfrm"))
    ET.SubElement(xf, q("a:off"), {"x": str(x), "y": str(y)})
    ET.SubElement(xf, q("a:ext"), {"cx": str(w), "cy": str(h)})
    ET.SubElement(ET.SubElement(sp, q("a:prstGeom"), {"prst": "rect"}), q("a:avLst"))
    return pic


def frame_to_card(frame):
    """照片框變成圖片底下的襯底卡片：拿掉提示文字、虛線改實線。"""
    c = frame.find("p:nvSpPr/p:cNvPr", NS)
    c.set("name", "deco-image-card")
    for dash in frame.findall("p:spPr/a:ln/a:prstDash", NS):
        frame.find("p:spPr/a:ln", NS).remove(dash)
    body = frame.find("p:txBody", NS)
    if body is not None:
        paras = body.findall("a:p", NS)
        for p in paras[1:]:
            body.remove(p)
        for r in paras[0].findall("a:r", NS):
            paras[0].remove(r)


def check_limit(key, value, warnings, page):
    if key in ("bullets",) or re.match(r"^compare-\d-bullets$", key):
        for item in to_lines(value):
            if len(item) > LIST_ITEM_LIMIT:
                warnings.append(f"第 {page} 頁「{key}」有一項 {len(item)} 字（建議 ≤ {LIST_ITEM_LIMIT}）：{item}")
        return
    text = "".join(to_lines(value))
    for pat, limit in LIMITS:
        if re.match(pat, key) and len(text) > limit:
            warnings.append(f"第 {page} 頁「{key}」{len(text)} 字（建議 ≤ {limit}），可能塞不下：{text}")


def build_slide(src_xml, spec, page, footer, warnings, image=None):
    root = ET.fromstring(src_xml)
    tree = root.find("p:cSld/p:spTree", NS)
    text = dict(spec.get("text", {}))
    shapes = [el for el in list(tree) if shape_name(el)]
    names = {shape_name(el) for el in shapes}

    # 角色圓形徽章沒填時，用角色名稱第一個字
    for n in range(1, 5):
        if f"role-{n}-name" in text and f"role-{n}-badge" not in text:
            text[f"role-{n}-badge"] = str(text[f"role-{n}-name"])[:1]

    unknown = [k for k in text if k not in names]
    if unknown:
        warnings.append(f"第 {page} 頁：版型 {spec['layout']:02d} 沒有這些文字框，已略過：{', '.join(unknown)}")

    # 沒填的項目群組整組移除
    remove = set(spec.get("remove", [])) | {"layout-label"}
    for g in ITEM_GROUPS:
        idx = {int(m.group(1)) for nm in names for m in [re.match(rf"^{g}-(\d)(-|$)", nm)] if m}
        if not idx:
            continue
        filled = {int(m.group(1)) for k in text for m in [re.match(rf"^{g}-(\d)(-|$)", k)] if m}
        for n in idx - filled:
            for nm in names:
                if re.match(rf"^{g}-{n}(-|$)", nm) or re.match(rf"^deco-{g}-[a-z-]+-{n}$", nm):
                    remove.add(nm)

    placed = False
    for el in shapes:
        nm = shape_name(el)
        if nm in remove or any(nm.startswith(r[:-1]) for r in remove if r.endswith("*")):
            tree.remove(el)
            continue
        if nm == "image-placeholder" and image:
            ids = [int(c.get("id", "0")) for c in root.iter(q("p:cNvPr"))]
            alt = image["alt"] or "".join(to_lines(text.get("title", ""))) or os.path.basename(image["ref"])
            pic = make_picture(el, image, max(ids) + 1, alt)
            frame_to_card(el)
            tree.insert(list(tree).index(el) + 1, pic)
            placed = True
            continue
        if nm == "footer" and footer:
            set_paragraphs(el.find("p:txBody", NS), [footer])
        elif nm == "page-no":
            set_paragraphs(el.find("p:txBody", NS), [f"{page:02d}"])
        elif nm == "table" and "table" in spec:
            fill_table(el, spec["table"], warnings, page)
        elif nm in text:
            body = el.find("p:txBody", NS)
            if body is None:
                warnings.append(f"第 {page} 頁：「{nm}」不是文字框")
                continue
            set_paragraphs(body, to_lines(text[nm]))
            check_limit(nm, text[nm], warnings, page)

    # 檢查還留著的範本文字
    for el in list(tree):
        nm = shape_name(el)
        if nm.startswith("deco-"):
            continue
        t = shape_text(el)
        if nm == "image-placeholder":
            warnings.append(f"第 {page} 頁：保留了照片框，請用 \"image\" 指定圖片、在 PowerPoint 放入照片，或用 \"remove\" 刪掉照片框")
        elif re.search(r"\[[^\]]+\]", t):
            warnings.append(f"第 {page} 頁：「{nm}」還是範本文字 {t}")
    if image and not placed:
        warnings.append(f"第 {page} 頁：版型 {spec['layout']:02d} 沒有照片框（或已被 remove），圖片 {image['ref']} 沒有放進去；有照片框的版型：{IMAGE_LAYOUTS}")
    return ET.tostring(root, encoding="UTF-8", xml_declaration=True), placed


def tostring_default_ns(el):
    """單一命名空間的 .rels／[Content_Types].xml：輸出成預設命名空間（不帶前綴）。"""
    xml = ET.tostring(el, encoding="UTF-8", xml_declaration=True)
    xml = re.sub(rb"xmlns:ns\d+=", b"xmlns=", xml)
    return re.sub(rb"(</?)ns\d+:", rb"\1", xml)


def read_pkg(path):
    with zipfile.ZipFile(path) as z:
        return {n: z.read(n) for n in z.namelist()}, [i for i in z.infolist()]


def template_slides(pkg):
    pres = ET.fromstring(pkg["ppt/presentation.xml"])
    rels = ET.fromstring(pkg["ppt/_rels/presentation.xml.rels"])
    target = {r.get("Id"): r.get("Target") for r in rels}
    out = []
    for sid in pres.find("p:sldIdLst", NS):
        t = target[sid.get(q("r:id"))]
        out.append(t.lstrip("/") if t.startswith("/") else "ppt/" + t)
    return out


def list_layouts(template):
    pkg, _ = read_pkg(template)
    slides = template_slides(pkg)
    for layout in sorted(LAYOUT_TO_PAGE, key=lambda n: LAYOUT_TO_PAGE[n]):
        if layout == 0:
            continue
        root = ET.fromstring(pkg[slides[LAYOUT_TO_PAGE[layout] - 1]])
        tree = root.find("p:cSld/p:spTree", NS)
        print(f"\n版型 {layout:02d}｜{LAYOUT_NAMES[layout]}")
        for el in tree:
            nm = shape_name(el)
            if not nm or nm.startswith("deco-") or nm in ("layout-label", "footer", "page-no"):
                continue
            if nm == "image-placeholder":
                print(f"  {'image（照片框）':22} 用 \"image\": \"圖片路徑\" 自動放圖；不放就用 \"remove\": [\"image-placeholder\", \"deco-tape\"]")
                continue
            t = shape_text(el).replace("\n", " ")
            print(f"  {nm:22} {t[:40]}")


def main():
    args = sys.argv[1:]
    if not args or args[0] in ("-h", "--help"):
        print(__doc__)
        return 0
    if args[0] == "--list":
        list_layouts(args[1] if len(args) > 1 else DEFAULT_TEMPLATE)
        return 0

    plan_path = args[0]
    with open(plan_path, encoding="utf-8") as f:
        plan = json.load(f)
    base = os.path.dirname(os.path.abspath(plan_path))
    template = plan.get("template") or DEFAULT_TEMPLATE
    if not os.path.isabs(template) and plan.get("template"):
        template = os.path.join(base, template)
    out = plan.get("output") or "output/簡報.pptx"
    if not os.path.isabs(out):
        out = os.path.join(os.getcwd(), out)
    os.makedirs(os.path.dirname(out), exist_ok=True)

    pkg, infos = read_pkg(template)
    for name in ("ppt/presentation.xml", "ppt/_rels/presentation.xml.rels", "[Content_Types].xml"):
        register_namespaces(pkg[name])
    src_slides = template_slides(pkg)
    for s in src_slides:
        register_namespaces(pkg[s])

    pres = ET.fromstring(pkg["ppt/presentation.xml"])
    prels = ET.fromstring(pkg["ppt/_rels/presentation.xml.rels"])
    ctypes = ET.fromstring(pkg["[Content_Types].xml"])
    sld_lst = pres.find("p:sldIdLst", NS)

    # 移除模板原本的投影片
    for sid in list(sld_lst):
        sld_lst.remove(sid)
    for rel in list(prels):
        if rel.get("Type") == SLIDE_REL:
            prels.remove(rel)
    for ov in list(ctypes):
        if ov.get("ContentType") == SLIDE_CT:
            ctypes.remove(ov)
    new_pkg = {k: v for k, v in pkg.items() if not k.startswith("ppt/slides/")}

    warnings = []
    media = {}          # 圖片內容雜湊 → 簡報內的檔名（同一張圖只存一次）
    image_exts = set()
    footer = plan.get("footer", "")
    used_ids = {r.get("Id") for r in prels}
    for i, spec in enumerate(plan.get("slides", []), start=1):
        layout = int(spec.get("layout", -1))
        if layout not in LAYOUT_TO_PAGE or layout == 0:
            warnings.append(f"第 {i} 頁：沒有版型 {layout}，已略過（可用 01～14）")
            continue
        src = src_slides[LAYOUT_TO_PAGE[layout] - 1]
        src_rels = src.replace("ppt/slides/", "ppt/slides/_rels/") + ".rels"
        page = len(sld_lst) + 1
        image = load_image(spec, base, page, warnings)
        if image:
            image["rid"] = "rIdDeckImage"
        xml, placed = build_slide(pkg[src], spec, page, footer, warnings, image)
        name = f"ppt/slides/slide{page}.xml"
        new_pkg[name] = xml
        rels_name = name.replace("ppt/slides/", "ppt/slides/_rels/") + ".rels"
        if src_rels in pkg:
            new_pkg[rels_name] = pkg[src_rels]
        if placed:
            digest = hashlib.sha1(image["data"]).hexdigest()
            if digest not in media:
                media[digest] = f"ppt/media/deck-image{len(media) + 1}.{image['ext']}"
                new_pkg[media[digest]] = image["data"]
            srels = ET.fromstring(new_pkg[rels_name]) if rels_name in new_pkg else ET.Element(q("pr:Relationships"))
            ET.SubElement(srels, q("pr:Relationship"), {"Id": image["rid"], "Type": IMAGE_REL,
                                                         "Target": "../media/" + os.path.basename(media[digest])})
            new_pkg[rels_name] = tostring_default_ns(srels)
            image_exts.add(image["ext"])
        rid = f"rIdS{page}"
        while rid in used_ids:
            rid += "x"
        used_ids.add(rid)
        ET.SubElement(prels, q("pr:Relationship"), {"Id": rid, "Type": SLIDE_REL, "Target": f"slides/slide{page}.xml"})
        ET.SubElement(sld_lst, q("p:sldId"), {"id": str(255 + page), q("r:id"): rid})
        ET.SubElement(ctypes, q("ct:Override"), {"PartName": f"/{name}", "ContentType": SLIDE_CT})

    if not len(sld_lst):
        print("沒有產生任何投影片，請檢查 plan.json 的 slides")
        return 1

    known = {d.get("Extension", "").lower() for d in ctypes if d.tag == q("ct:Default")}
    for ext in sorted(image_exts - known):
        ctypes.insert(0, ET.Element(q("ct:Default"), {"Extension": ext, "ContentType": IMAGE_CT[ext]}))

    new_pkg["ppt/presentation.xml"] = ET.tostring(pres, encoding="UTF-8", xml_declaration=True)
    new_pkg["ppt/_rels/presentation.xml.rels"] = tostring_default_ns(prels)
    new_pkg["[Content_Types].xml"] = tostring_default_ns(ctypes)
    if "docProps/app.xml" in new_pkg:
        new_pkg["docProps/app.xml"] = re.sub(rb"<Slides>\d+</Slides>", b"<Slides>%d</Slides>" % len(sld_lst), new_pkg["docProps/app.xml"])

    order = ["[Content_Types].xml"] + [n for n in new_pkg if n != "[Content_Types].xml"]
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
        for n in order:
            z.writestr(n, new_pkg[n])

    print(f"✅ 已產出：{out}（{len(sld_lst)} 頁、{len(media)} 張圖片）")
    if warnings:
        print("\n需要確認的地方：")
        for w in warnings:
            print(" - " + w)
    return 0


if __name__ == "__main__":
    sys.exit(main())

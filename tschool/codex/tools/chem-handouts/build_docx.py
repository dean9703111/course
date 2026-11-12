#!/usr/bin/env python3
"""產生「化學課教材」練習包：4 份國中理化（酸、鹼、鹽）圖文講義 .docx。

需要 python-docx（pip install python-docx）。

用法：
  python3 build_docx.py [輸出資料夾]      # 預設 ../../example/化學課教材

行內標記（只在這支腳本裡用）：
  **粗體**   ~下標~   ^上標^   {{教師版紅字答案}}
"""
import os
import re
import sys

from docx import Document
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor

HERE = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.join(HERE, "images")
BODY_FONT = "標楷體"
HEAD_FONT = "微軟正黑體"
LATIN_FONT = "Times New Roman"
RED = RGBColor(0xC0, 0x00, 0x00)
SCHOOL = "星光國中"
TERM = "114 學年度第 2 學期"
COURSE = "八年級自然科學（理化）"
CHAPTER = "第三章　酸、鹼、鹽"

TOKEN = re.compile(r"(\*\*.+?\*\*|~[^~]+~|\^[^^]+\^|\{\{.+?\}\})")


# ---------- 基礎工具 ----------
def set_fonts(rpr, east, latin=LATIN_FONT):
    rfonts = rpr.find(qn("w:rFonts"))
    if rfonts is None:
        rfonts = OxmlElement("w:rFonts")
        rpr.insert(0, rfonts)
    for attr in ("w:asciiTheme", "w:hAnsiTheme", "w:eastAsiaTheme", "w:cstheme"):
        if rfonts.get(qn(attr)) is not None:
            del rfonts.attrib[qn(attr)]
    rfonts.set(qn("w:ascii"), latin)
    rfonts.set(qn("w:hAnsi"), latin)
    rfonts.set(qn("w:eastAsia"), east)


def style_font(doc, name, east, size, bold=None, color=None, latin=LATIN_FONT):
    st = doc.styles[name]
    set_fonts(st.element.get_or_add_rPr(), east, latin)
    st.font.size = Pt(size)
    if bold is not None:
        st.font.bold = bold
    if color is not None:
        st.font.color.rgb = color
    return st


def rich(par, text, bold=False, size=None, color=None, east=None):
    """把含行內標記的文字寫進段落。"""
    for part in TOKEN.split(text):
        if not part:
            continue
        if part.startswith("**"):
            rich(par, part[2:-2], bold=True, size=size, color=color, east=east)
            continue
        if part.startswith("{{"):
            rich(par, part[2:-2], bold=True, size=size, color=RED, east=east)
            continue
        sub = part.startswith("~") and part.endswith("~") and len(part) > 2
        sup = part.startswith("^") and part.endswith("^") and len(part) > 2
        run = par.add_run(part[1:-1] if (sub or sup) else part)
        run.bold = bold or None
        if sub:  # 上下標共用同一個屬性，只設定用到的那一個
            run.font.subscript = True
        elif sup:
            run.font.superscript = True
        if size:
            run.font.size = Pt(size)
        if color is not None:
            run.font.color.rgb = color
        if east:
            set_fonts(run._element.get_or_add_rPr(), east)
    return par


def shade(cell, fill):
    tc_pr = cell._element.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"), fill)
    tc_pr.append(shd)


def add_field(par, code):
    run = par.add_run()
    for kind, text in (("begin", None), (None, code), ("end", None)):
        if kind:
            el = OxmlElement("w:fldChar")
            el.set(qn("w:fldCharType"), kind)
        else:
            el = OxmlElement("w:instrText")
            el.set(qn("xml:space"), "preserve")
            el.text = text
        run._element.append(el)
    return run


# ---------- 文件骨架 ----------
def new_doc(tag):
    doc = Document()
    sec = doc.sections[0]
    sec.page_width, sec.page_height = Cm(21), Cm(29.7)
    sec.left_margin = sec.right_margin = Cm(2)
    sec.top_margin, sec.bottom_margin = Cm(2), Cm(1.8)

    normal = style_font(doc, "Normal", BODY_FONT, 12)
    normal.paragraph_format.space_after = Pt(4)
    normal.paragraph_format.line_spacing = 1.25
    style_font(doc, "Title", HEAD_FONT, 22, bold=True, color=RGBColor(0x1F, 0x3A, 0x5F), latin="Arial")
    style_font(doc, "Heading 1", HEAD_FONT, 15, bold=True, color=RGBColor(0x1F, 0x3A, 0x5F), latin="Arial")
    style_font(doc, "Heading 2", HEAD_FONT, 13, bold=True, color=RGBColor(0x2E, 0x5C, 0x8A), latin="Arial")
    cap = style_font(doc, "Caption", BODY_FONT, 10.5, bold=False, color=RGBColor(0x40, 0x40, 0x40))
    cap.font.italic = False
    doc.styles["Heading 1"].paragraph_format.space_before = Pt(14)
    doc.styles["Heading 1"].paragraph_format.space_after = Pt(6)

    hp = sec.header.paragraphs[0]
    rich(hp, f"{SCHOOL}　{TERM}　{COURSE}　｜　{CHAPTER}", size=9.5, east=HEAD_FONT, color=RGBColor(0x59, 0x59, 0x59))
    hp.add_run("\t")
    rich(hp, tag, size=9.5, bold=True, east=HEAD_FONT, color=RGBColor(0x59, 0x59, 0x59))
    hp.paragraph_format.tab_stops.add_tab_stop(Cm(17), WD_ALIGN_PARAGRAPH.RIGHT)

    fp = sec.footer.paragraphs[0]
    fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    rich(fp, f"{SCHOOL}自然領域｜114 學年度修訂｜第 ", size=9, color=RGBColor(0x59, 0x59, 0x59))
    add_field(fp, "PAGE").font.size = Pt(9)
    rich(fp, " 頁", size=9, color=RGBColor(0x59, 0x59, 0x59))
    return doc


def title(doc, text, sub):
    doc.add_paragraph(text, style="Title")
    p = doc.add_paragraph()
    rich(p, sub, size=10.5, color=RGBColor(0x59, 0x59, 0x59))
    p = doc.add_paragraph()
    rich(p, "班級：＿＿＿＿＿　座號：＿＿＿＿　姓名：＿＿＿＿＿＿＿＿＿＿")
    p.alignment = WD_ALIGN_PARAGRAPH.RIGHT


def h1(doc, text):
    doc.add_paragraph(text, style="Heading 1")


def h2(doc, text):
    doc.add_paragraph(text, style="Heading 2")


def para(doc, text, indent=0.0):
    p = doc.add_paragraph()
    rich(p, text)
    if indent:
        p.paragraph_format.left_indent = Cm(indent)
    return p


def bullets(doc, items):
    for it in items:
        rich(doc.add_paragraph(style="List Bullet"), it)


def numbered(doc, items):
    """手打編號（老師常見的寫法），每一段重新從 1 開始。"""
    for i, it in enumerate(items, 1):
        p = doc.add_paragraph()
        rich(p, f"{i}. {it}")
        p.paragraph_format.left_indent = Cm(0.9)
        p.paragraph_format.first_line_indent = Cm(-0.6)


def figure(doc, filename, caption, width_cm=11.0):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(2)
    p.add_run().add_picture(os.path.join(IMG, filename), width=Cm(width_cm))
    c = doc.add_paragraph(style="Caption")
    c.alignment = WD_ALIGN_PARAGRAPH.CENTER
    rich(c, "▲ " + caption)


def table(doc, rows, widths, header_fill="DCE6F1", size=11):
    t = doc.add_table(rows=len(rows), cols=len(rows[0]))
    t.style = "Table Grid"
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    t.autofit = False
    for i, row in enumerate(rows):
        for j, text in enumerate(row):
            cell = t.cell(i, j)
            cell.width = Cm(widths[j])
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(1)
            p.paragraph_format.line_spacing = 1.15
            rich(p, text, bold=(i == 0), size=size, east=HEAD_FONT if i == 0 else None)
            if i == 0:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                shade(cell, header_fill)
            elif j == 0:
                shade(cell, "F5F8FC")
    doc.add_paragraph().paragraph_format.space_after = Pt(0)
    return t


def box(doc, head, lines, fill="FFF4CE"):
    t = doc.add_table(rows=1, cols=1)
    t.style = "Table Grid"
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = t.cell(0, 0)
    shade(cell, fill)
    rich(cell.paragraphs[0], head, bold=True, east=HEAD_FONT)
    for line in lines:
        rich(cell.add_paragraph(), line)
    doc.add_paragraph().paragraph_format.space_after = Pt(0)


def practice(doc, items):
    for i, (q, a) in enumerate(items, 1):
        p = doc.add_paragraph()
        rich(p, f"{i}. {q}")
        p.paragraph_format.left_indent = Cm(0.9)
        p.paragraph_format.first_line_indent = Cm(-0.6)
        p = doc.add_paragraph()
        rich(p, "答：{{" + a + "}}")
        p.paragraph_format.left_indent = Cm(0.9)


# ---------- 四份講義 ----------
def doc_acid_base(out):
    doc = new_doc("講義 3-2")
    title(doc, "3-2　常見的酸與鹼", "編寫：自然領域　陳老師｜教師版（紅字為填空與參考答案）")
    box(doc, "學習目標", [
        "1. 能說出酸性與鹼性水溶液的共同性質。",
        "2. 能舉出生活中與實驗室裡常見的酸和鹼，並說明用途。",
        "3. 能說出使用酸、鹼時的安全注意事項。",
    ], fill="E8F1E4")

    h1(doc, "一、生活中的酸與鹼")
    bullets(doc, [
        "許多食物嚐起來有酸味，是因為含有酸性物質，例如：{{檸檬汁、食醋、汽水}}。",
        "肥皂水、小蘇打水、洗衣精的水溶液摸起來有滑膩感，屬於{{鹼性}}物質。",
        "酸和鹼溶於水後都能導電，都是**電解質**。",
    ])
    figure(doc, "fig1-daily.jpg", "圖 3-2-1　生活中常見的酸性物質（左）與鹼性物質（右）")
    box(doc, "老師叮嚀", ["實驗室的藥品**不可以用嚐的、也不可以用手摸**來判斷酸鹼，一定要用指示劑檢驗。"])

    h1(doc, "二、酸與鹼的共同性質")
    table(doc, [
        ["比較項目", "酸性水溶液", "鹼性水溶液"],
        ["解離出的共同離子", "{{氫離子}}（H^+^）", "{{氫氧根離子}}（OH^−^）"],
        ["石蕊試紙", "藍色石蕊試紙變{{紅}}色", "紅色石蕊試紙變{{藍}}色"],
        ["酚酞指示劑", "無色", "{{紅}}色"],
        ["和大理石（碳酸鈣）反應", "產生{{二氧化碳}}", "不反應"],
        ["觸感", "—", "有滑膩感（有腐蝕性，不可用手試）"],
    ], [4.6, 5.9, 6.2])
    figure(doc, "fig2-litmus.jpg", "圖 3-2-2　石蕊試紙的變色：酸性溶液使藍色試紙變紅（左），鹼性溶液使紅色試紙變藍（右）", 10.0)

    h1(doc, "三、實驗室常見的酸")
    table(doc, [
        ["名稱", "化學式", "性質", "用途"],
        ["鹽酸", "HCl", "氯化氫氣體的水溶液，無色、有刺激性氣味", "清除金屬表面的鏽；胃液中含有鹽酸，可幫助消化"],
        ["硫酸", "H~2~SO~4~", "無色油狀液體；濃硫酸有脫水性，稀釋時會放出大量的熱", "鉛蓄電池的電解液、製造肥料"],
        ["硝酸", "HNO~3~", "無色液體，照光容易分解，要用棕色瓶盛裝", "製造肥料、炸藥"],
        ["醋酸（乙酸）", "CH~3~COOH", "弱酸，有刺激性酸味；食醋中大約含 3%～5%", "調味、食品加工"],
    ], [2.8, 2.6, 6.2, 5.1], size=10.5)

    h1(doc, "四、實驗室常見的鹼")
    table(doc, [
        ["名稱", "化學式", "性質", "用途"],
        ["氫氧化鈉", "NaOH", "白色固體，俗稱苛性鈉；容易吸收水氣而潮解，溶於水會放熱", "製造肥皂、水管疏通劑"],
        ["氫氧化鈣", "Ca(OH)~2~", "白色粉末，俗稱熟石灰；水溶液稱為石灰水", "檢驗二氧化碳、改良酸性土壤"],
        ["氨水", "NH~3~ 的水溶液", "弱鹼，有刺激性臭味", "製造肥料、清潔劑"],
    ], [2.8, 2.6, 6.2, 5.1], size=10.5)

    h1(doc, "五、使用酸、鹼的安全守則")
    numbered(doc, [
        "進實驗室要戴**護目鏡**與手套，長頭髮要綁起來。",
        "稀釋濃硫酸時，要把{{濃硫酸沿著玻璃棒慢慢倒入水中}}，並不斷攪拌；**絕對不可以把水倒進濃硫酸**。",
        "聞氣味時，用手在瓶口輕輕搧動，不可以把鼻子直接湊近。",
        "藥品濺到皮膚或眼睛，立刻用**大量清水**沖洗，並馬上報告老師。",
    ])
    figure(doc, "fig5-dilute.jpg", "圖 3-2-3　稀釋濃硫酸的正確做法：酸沿著玻璃棒緩緩倒入水中", 9.5)

    h1(doc, "課堂練習")
    practice(doc, [
        ("小華把紅色石蕊試紙放進某水溶液，試紙變成藍色。這個水溶液是酸性還是鹼性？", "鹼性"),
        ("大理石地板不適合用含鹽酸的清潔劑清洗，為什麼？", "鹽酸會和大理石（碳酸鈣）反應產生二氧化碳，地板會被腐蝕"),
        ("寫出兩種生活中常見的鹼性物質。", "肥皂水、小蘇打水（合理即可）"),
    ])
    doc.save(os.path.join(out, "114下_3-2_常見的酸與鹼_講義.docx"))


def doc_ph(out):
    doc = new_doc("講義 3-3")
    title(doc, "3-3　酸鹼的濃度與 pH 值", "編寫：自然領域　陳老師｜教師版（紅字為填空與參考答案）")
    box(doc, "學習目標", [
        "1. 能用 pH 值判斷水溶液是酸性、中性或鹼性。",
        "2. 能比較不同水溶液的酸鹼強弱。",
        "3. 能選用合適的指示劑檢驗水溶液的酸鹼性。",
    ], fill="E8F1E4")

    h1(doc, "一、pH 值是什麼")
    bullets(doc, [
        "科學家用 **pH 值**表示水溶液的酸鹼程度，常見的範圍是 0～14。",
        "25 ℃ 時：pH ＜ 7 是{{酸性}}；pH ＝ 7 是{{中性}}；pH ＞ 7 是{{鹼性}}。",
        "pH 值越小，氫離子濃度越大，酸性越{{強}}；pH 值越大，鹼性越{{強}}。",
        "pH 值每相差 1，氫離子濃度就相差 **10 倍**（例如 pH 3 的氫離子濃度是 pH 5 的 100 倍）。",
    ])
    figure(doc, "ph.png", "圖 3-3-1　pH 值與常見物質的酸鹼性", 16.0)

    h1(doc, "二、常見物質的 pH 值")
    table(doc, [
        ["物質", "大約的 pH 值", "酸鹼性", "補充說明"],
        ["胃液", "1～2", "酸性", "含有鹽酸"],
        ["檸檬汁", "2～3", "酸性", "含有檸檬酸"],
        ["食醋", "約 3", "酸性", "含有醋酸"],
        ["汽水", "3～4", "酸性", "二氧化碳溶於水形成碳酸"],
        ["純水", "7", "中性", "—"],
        ["小蘇打水", "8～9", "弱鹼性", "小蘇打是碳酸氫鈉"],
        ["肥皂水", "9～10", "鹼性", "—"],
        ["漂白水", "11～13", "鹼性", "不可以和含鹽酸的清潔劑混用"],
    ], [3.2, 3.2, 2.8, 7.5])

    h1(doc, "三、酸鹼指示劑")
    para(doc, "指示劑在不同酸鹼性的水溶液中，會呈現不同的顏色：")
    table(doc, [
        ["指示劑", "酸性", "中性", "鹼性"],
        ["石蕊", "{{紅}}色", "紫色", "{{藍}}色"],
        ["酚酞", "無色", "無色", "{{紅}}色"],
        ["廣用試紙", "紅、橙、黃", "綠", "藍、紫"],
        ["紫甘藍汁", "紅色", "紫色", "藍、綠、黃"],
    ], [3.6, 4.4, 4.2, 4.5])
    figure(doc, "fig3-cabbage.jpg", "圖 3-3-2　紫甘藍汁在不同酸鹼性水溶液中的顏色（由左到右：酸性 → 鹼性）")
    bullets(doc, [
        "廣用試紙變色後，和**標準色卡**比對，就能知道大約的 pH 值。",
        "想知道更精確的數值，可以使用 **pH 計**。",
    ])

    h1(doc, "四、加水稀釋對 pH 值的影響")
    bullets(doc, [
        "酸性水溶液加水稀釋：氫離子濃度變小，pH 值{{變大}}，逐漸接近 7，但不會超過 7。",
        "鹼性水溶液加水稀釋：pH 值{{變小}}，逐漸接近 7，但不會小於 7。",
    ])
    box(doc, "常見迷思", ["「pH 值越大越酸」是錯的！pH 值越**小**，酸性才越強。"])

    h1(doc, "課堂練習")
    practice(doc, [
        ("甲溶液 pH ＝ 2、乙溶液 pH ＝ 5，哪一杯的酸性比較強？兩杯的氫離子濃度相差幾倍？", "甲；1000 倍"),
        ("在某水溶液中滴入酚酞後呈現紅色，這杯水溶液的 pH 值可能是下列何者？（A）3　（B）7　（C）10", "C"),
        ("把 pH ＝ 3 的食醋加入大量的水，pH 值會怎麼變化？", "變大，接近 7 但不會超過 7"),
    ])
    doc.save(os.path.join(out, "114下_3-3_酸鹼的濃度與pH值_講義.docx"))


def doc_neutral(out):
    doc = new_doc("講義 3-4")
    title(doc, "3-4　酸鹼中和", "編寫：自然領域　陳老師｜教師版（紅字為填空與參考答案）")
    box(doc, "學習目標", [
        "1. 能說明酸鹼中和的意義與產物。",
        "2. 能操作並描述鹽酸與氫氧化鈉的中和實驗。",
        "3. 能舉出生活中應用酸鹼中和的例子。",
    ], fill="E8F1E4")

    h1(doc, "一、什麼是酸鹼中和")
    bullets(doc, [
        "酸和鹼混合後，酸的氫離子（H^+^）和鹼的氫氧根離子（OH^−^）結合成**水**，這個反應稱為{{酸鹼中和}}。",
        "通式：酸 ＋ 鹼 → {{鹽}} ＋ {{水}}",
        "例如：HCl ＋ NaOH → NaCl ＋ H~2~O",
        "酸鹼中和是**放熱**反應，溶液的溫度會{{上升}}。",
    ])
    figure(doc, "neutral.png", "圖 3-4-1　鹽酸與氫氧化鈉水溶液中和的粒子示意圖", 15.5)

    h1(doc, "二、實驗：鹽酸與氫氧化鈉的中和")
    para(doc, "**器材與藥品**：錐形瓶、滴定管（或滴管）、量筒、溫度計、蒸發皿、酒精燈、稀鹽酸、氫氧化鈉水溶液、酚酞指示劑")
    h2(doc, "實驗步驟")
    numbered(doc, [
        "用量筒量取 10 mL 稀鹽酸倒入錐形瓶，滴入 2 滴酚酞指示劑，記錄顏色與溫度。",
        "把氫氧化鈉水溶液裝進滴定管，一滴一滴加入錐形瓶，並輕輕搖晃錐形瓶。",
        "溶液剛好變成**淡粉紅色**、搖晃後不褪色時，停止滴加，記錄溫度。",
        "取少量中和後的溶液放進蒸發皿，加熱到水分蒸乾，觀察留下的物質。",
    ])
    figure(doc, "fig4-neutral.jpg", "圖 3-4-2　酸鹼中和的實驗裝置", 9.5)
    h2(doc, "實驗記錄")
    table(doc, [
        ["觀察項目", "滴加氫氧化鈉前", "中和後"],
        ["溶液的顏色", "{{無色}}", "{{淡粉紅色}}"],
        ["溫度（℃）", "＿＿＿＿", "＿＿＿＿（比滴加前{{高}}）"],
        ["蒸乾後留下的物質", "—", "{{白色晶體（氯化鈉）}}"],
    ], [5.0, 5.4, 6.3])
    figure(doc, "fig6-evaporate.jpg", "圖 3-4-3　加熱蒸乾後，蒸發皿裡留下白色的氯化鈉晶體", 9.0)

    h1(doc, "三、生活中的酸鹼中和")
    table(doc, [
        ["情境", "做法", "原理"],
        ["胃酸過多", "服用制酸劑（胃藥）", "制酸劑含有鹼性物質，可以中和過多的胃酸"],
        ["土壤酸化", "在土壤中加入熟石灰", "氫氧化鈣是鹼，可以中和土壤裡的酸"],
        ["工廠的酸性廢水", "加入鹼性物質處理後再排放", "中和之後才不會汙染河川"],
    ], [3.8, 5.2, 7.7])

    h1(doc, "四、常見的鹽")
    table(doc, [
        ["名稱", "化學式", "俗名或來源", "用途"],
        ["氯化鈉", "NaCl", "食鹽", "調味、醃漬食物"],
        ["碳酸鈣", "CaCO~3~", "大理石、貝殼、灰石的主要成分", "建築材料、製造水泥"],
        ["碳酸鈉", "Na~2~CO~3~", "蘇打、洗滌鹼", "清潔、製造玻璃"],
        ["碳酸氫鈉", "NaHCO~3~", "小蘇打、焙用鹼", "烘焙、乾粉滅火器"],
        ["硫酸鈣", "CaSO~4~", "石膏的主要成分", "石膏像、固定骨折的石膏"],
    ], [2.8, 2.6, 6.0, 5.3], size=10.5)
    box(doc, "老師叮嚀", ["中和後的溶液不一定剛好是中性：酸或鹼加太多，溶液還是會偏酸或偏鹼，所以要**一滴一滴加、邊加邊觀察**。"])

    h1(doc, "課堂練習")
    practice(doc, [
        ("鹽酸和氫氧化鈉水溶液中和後，產物是什麼？", "氯化鈉（食鹽）和水"),
        ("實驗中為什麼要先滴入酚酞？", "鹽酸和氫氧化鈉水溶液都是無色，要靠指示劑的顏色變化判斷是否中和"),
        ("中和時溫度計的讀數會上升還是下降？為什麼？", "上升，因為酸鹼中和是放熱反應"),
    ])
    doc.save(os.path.join(out, "114下_3-4_酸鹼中和_講義.docx"))


def doc_worksheet(out):
    doc = new_doc("實驗活動單")
    title(doc, "實驗活動單｜自製紫甘藍指示劑", "配合單元：3-3 酸鹼的濃度與 pH 值｜活動時間：1 節課（45 分鐘）｜4 人一組｜教師版")
    p = doc.add_paragraph()
    rich(p, "組別：第 ＿＿＿ 組　　組員：＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿")

    h1(doc, "一、活動目的")
    para(doc, "利用紫甘藍汁遇到酸、鹼會變色的特性，檢驗生活中常見水溶液的酸鹼性。")

    h1(doc, "二、器材與藥品")
    table(doc, [
        ["項目", "數量", "項目", "數量"],
        ["紫甘藍葉", "3～4 片", "滴管", "1 支"],
        ["熱水", "200 mL", "標籤貼紙", "5 張"],
        ["燒杯（250 mL）", "1 個", "廣用試紙", "5 張"],
        ["透明塑膠杯", "5 個", "檸檬汁、白醋、清水、小蘇打水、肥皂水", "各 30 mL"],
    ], [4.2, 2.6, 7.2, 2.7])

    h1(doc, "三、實驗步驟")
    numbered(doc, [
        "把紫甘藍葉撕成小片放進燒杯，倒入熱水浸泡 5 分鐘，取出葉片，留下紫色的汁液。",
        "在 5 個透明杯貼上標籤，分別倒入檸檬汁、白醋、清水、小蘇打水、肥皂水各 30 mL。",
        "用滴管在每個杯子各滴入 10 滴紫甘藍汁，輕輕搖晃。",
        "觀察每一杯的顏色，記錄在下面的表格。",
        "依照顏色推測每一杯的酸鹼性，再用廣用試紙驗證。",
    ])
    figure(doc, "fig7-cups.jpg", "圖 1　滴入紫甘藍汁後，五杯水溶液呈現不同的顏色", 10.5)

    h1(doc, "四、實驗記錄")
    table(doc, [
        ["水溶液", "滴入紫甘藍汁後的顏色", "推測的酸鹼性", "廣用試紙測得的 pH 值"],
        ["檸檬汁", "{{紅色}}", "{{酸性}}", "＿＿＿＿"],
        ["白醋", "{{粉紅色}}", "{{酸性}}", "＿＿＿＿"],
        ["清水", "{{紫色}}", "{{中性}}", "＿＿＿＿"],
        ["小蘇打水", "{{藍色}}", "{{鹼性}}", "＿＿＿＿"],
        ["肥皂水", "{{綠色}}", "{{鹼性}}", "＿＿＿＿"],
    ], [3.2, 5.2, 3.6, 4.7])

    h1(doc, "五、問題與討論")
    practice(doc, [
        ("哪幾杯水溶液是酸性？你是怎麼判斷的？", "檸檬汁和白醋；紫甘藍汁變成紅色或粉紅色"),
        ("紫甘藍汁為什麼可以當作酸鹼指示劑？", "紫甘藍含有花青素，在不同酸鹼性的水溶液中會呈現不同的顏色"),
        ("如果把白醋慢慢加進小蘇打水裡，顏色可能會怎麼變化？", "由藍色逐漸變回紫色，再變成粉紅色，過程中會冒出氣泡"),
    ])
    box(doc, "安全提醒", [
        "1. 熱水由老師協助倒入，不要自己拿。",
        "2. 實驗用的水溶液不可以喝。",
        "3. 實驗結束後把桌面擦乾、把手洗乾淨。",
    ], fill="FDE9E7")
    doc.save(os.path.join(out, "114下_實驗活動單_紫甘藍指示劑.docx"))


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "..", "..", "example", "化學課教材")
    out = os.path.abspath(out)
    os.makedirs(out, exist_ok=True)
    for build in (doc_acid_base, doc_ph, doc_neutral, doc_worksheet):
        build(out)
    for name in sorted(os.listdir(out)):
        if name.endswith(".docx"):
            print(f"{os.path.getsize(os.path.join(out, name)) / 1024:7.0f} KB  {name}")


if __name__ == "__main__":
    main()

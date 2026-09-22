#!/usr/bin/env python3
"""把使用者手動整理的三表版原檔 2024_BL_ERP_原始.xlsx 去識別化，放進 example/erp-raw/。
zip 層級替換（保留格式與欄寬），詞表與 deidentify_erp.py 共用。
跑法：uv run --with openpyxl python3 _scripts/deidentify_raw.py
"""
import csv, re, zipfile
from pathlib import Path
import deidentify_erp as d

SRC = Path("/Users/lindingyuan/Downloads/cowork-needs-folder/2024_BL_ERP_原始.xlsx")
DEST_DIR = d.TAHOHO_DIR / "example" / "erp-raw"
DEST = DEST_DIR / "2024_BL_ERP_原始.xlsx"

def main():
    mapping = {r["真名"]: r["代號"] for r in csv.DictReader(open(d.NAME_MAP_CSV, encoding="utf-8-sig"))}
    pattern, lookup = d.build_pattern(mapping, d.load_extra_terms(), include_place=False)
    DEST_DIR.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(SRC) as zin, zipfile.ZipFile(DEST, "w", zipfile.ZIP_DEFLATED) as zout:
        for info in zin.infolist():
            data = zin.read(info.filename)
            if info.filename.endswith(".xml"):
                enc = "utf-16" if data[:2] in (b"\xff\xfe", b"\xfe\xff") else "utf-8"
                text = d.replace_str(data.decode(enc), pattern, lookup)
                if info.filename == d.CORE_XML_NAME:
                    text = d.scrub_core_xml(text)
                elif info.filename == d.WORKBOOK_XML_NAME:
                    text = d.scrub_workbook_xml(text)
                data = text.encode(enc)
            info.compress_type = zipfile.ZIP_DEFLATED
            zout.writestr(info, data)
    terms = list(mapping) + [t for t, _ in d.load_extra_terms()]
    hits = d.verify_terms_zero(DEST, terms)
    absp, refreshed = d.verify_abspath_and_refreshed_by(DEST)
    taho = d.verify_no_taho(DEST)
    core = re.findall(r"<(?:dc:creator|cp:lastModifiedBy)>([^<]*)<", zipfile.ZipFile(DEST).read(d.CORE_XML_NAME).decode())
    import openpyxl
    wb = openpyxl.load_workbook(DEST, read_only=True)
    rows = {ws.title: sum(1 for r in ws.iter_rows(values_only=True) if r and r[0] is not None) - 1 for ws in wb.worksheets}
    print(f"寫入 {DEST}\n殘留：{hits or 0}｜absPath：{absp}｜refreshedBy：{refreshed}｜taho：{taho}｜core：{core}\n列數：{rows}")
    assert not hits and absp == 0 and taho == 0 and rows["DATA"] == 14389 and rows["完工資料"] == 334
    print("驗證通過")

if __name__ == "__main__":
    main()

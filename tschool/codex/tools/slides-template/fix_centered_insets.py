#!/usr/bin/env python3
"""把簡報模板裡「置中文字」的文字框內距歸零。

模板的圓圈、圓角標籤原本帶 lIns/rIns=45720（上下用預設值）。PowerPoint 會正確置中，
但 Keynote 與 macOS 預覽（Quick Look）的匯入引擎會把文字往右下推一點。
只處理「垂直置中（anchor=ctr）且每一段都水平置中（algn=ctr）」的圖形；靠左的文字保留原本的內距。

用法：python3 fix_centered_insets.py <模板.pptx>      # 直接改寫該檔，只用 Python 內建模組
"""
import re
import shutil
import sys
import zipfile

SP = re.compile(r"<p:sp>.*?</p:sp>", re.S)
BODY = re.compile(r"<a:bodyPr([^>]*)/>")


def fix_shape(m):
    sp = m.group(0)
    body = BODY.search(sp)
    if not body or 'anchor="ctr"' not in body.group(1):
        return sp
    paras = re.findall(r"<a:p>.*?</a:p>", sp, re.S)
    if not paras or not all('algn="ctr"' in p for p in paras):
        return sp
    attrs = dict(re.findall(r'(\w+)="([^"]*)"', body.group(1)))
    attrs.update(lIns="0", tIns="0", rIns="0", bIns="0")
    new = "<a:bodyPr " + " ".join(f'{k}="{v}"' for k, v in attrs.items()) + "/>"
    fix_shape.count += 1
    return sp[:body.start()] + new + sp[body.end():]


def main():
    path = sys.argv[1]
    tmp = path + ".tmp"
    fix_shape.count = 0
    with zipfile.ZipFile(path) as zin, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
        for info in zin.infolist():
            data = zin.read(info.filename)
            if re.match(r"ppt/slides/slide\d+\.xml$", info.filename):
                data = SP.sub(fix_shape, data.decode("utf-8")).encode("utf-8")
            zout.writestr(info, data)
    shutil.move(tmp, path)
    print(f"已調整 {fix_shape.count} 個置中文字框：{path}")


if __name__ == "__main__":
    main()

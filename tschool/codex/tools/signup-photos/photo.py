"""把 render.mjs 產生的紙本圖，加工成「手機拍的照片」。

用法：python photo.py <紙本圖資料夾> <輸出資料夾>
依 entries.json 每筆的 photo 設定決定：桌面材質、旋轉、透視、亮度、色溫、模糊、
手震、雜訊、JPEG 品質與輸出寬度。需要 pillow、numpy。
"""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFilter

HERE = Path(__file__).parent
paper_dir, out_dir = Path(sys.argv[1]), Path(sys.argv[2])
out_dir.mkdir(parents=True, exist_ok=True)
entries = json.loads((HERE / "entries.json").read_text(encoding="utf-8"))

CANVAS = (2400, 1800)  # 4:3，跟手機照片比例一樣


def desk(kind, rng):
    w, h = CANVAS
    if kind == "wood":
        base = np.array([172, 128, 84], dtype=np.float32)
        x = np.arange(w)[None, :] / w
        y = np.arange(h)[:, None] / h
        grain = np.sin((y * 90 + np.sin(x * 9 + rng.uniform(0, 6)) * 1.6) * 2 * np.pi) * 9
        grain = grain + rng.normal(0, 5, (h, w))
        img = base[None, None, :] + grain[:, :, None] * np.array([1.0, 0.85, 0.6])
        # 木板接縫
        for sy in (int(h * 0.31), int(h * 0.72)):
            img[sy - 2 : sy + 2] *= 0.72
    elif kind == "mat":  # 綠色切割墊
        img = np.full((h, w, 3), [52, 104, 82], dtype=np.float32)
        img += rng.normal(0, 3, (h, w, 1))
        img[::90, :] += 26
        img[:, ::90] += 26
    else:  # 灰色辦公桌
        img = np.full((h, w, 3), [196, 197, 199], dtype=np.float32)
        img += rng.normal(0, 4, (h, w, 1))
        speck = rng.random((h, w)) > 0.9993
        img[speck] -= 40
    return Image.fromarray(np.clip(img, 0, 255).astype(np.uint8))


def paper_texture(im, rng):
    """白紙加一點紙紋與暖色，邊緣略暗。"""
    a = np.asarray(im.convert("RGB"), dtype=np.float32)
    h, w, _ = a.shape
    tint = np.array([252, 249, 240], dtype=np.float32) / 255
    a = a * tint
    a += rng.normal(0, 2.2, (h, w, 1))
    # 一條淡淡的摺痕
    fx = int(w * rng.uniform(0.42, 0.58))
    a[:, fx - 2 : fx + 2] *= 0.965
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def find_coeffs(dst, src):
    m = []
    for (x, y), (u, v) in zip(dst, src):
        m.append([x, y, 1, 0, 0, 0, -u * x, -u * y])
        m.append([0, 0, 0, x, y, 1, -v * x, -v * y])
    a = np.array(m, dtype=np.float64)
    b = np.array(src, dtype=np.float64).reshape(8)
    return np.linalg.solve(a, b).tolist()


def make_photo(e):
    p = e["photo"]
    rng = np.random.default_rng(e["seed"])
    paper = paper_texture(Image.open(paper_dir / f"{e['id']}.png"), rng)
    pw = int(CANVAS[0] * 0.80)
    paper = paper.resize((pw, int(pw * paper.height / paper.width)), Image.LANCZOS).convert("RGBA")
    paper = paper.rotate(p["rot"], expand=True, resample=Image.BICUBIC)

    bg = desk(p["bg"], rng).convert("RGBA")
    ox = (CANVAS[0] - paper.width) // 2 + int(rng.uniform(-60, 60))
    oy = (CANVAS[1] - paper.height) // 2 + int(rng.uniform(-50, 50))

    # 紙張落在桌面的陰影
    shadow = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    sh = Image.new("RGBA", paper.size, (0, 0, 0, 120))
    sh.putalpha(paper.getchannel("A").point(lambda v: int(v * 0.45)))
    shadow.paste(sh, (ox + 12, oy + 16), sh)
    shadow = shadow.filter(ImageFilter.GaussianBlur(14))
    bg = Image.alpha_composite(bg, shadow)
    bg.paste(paper, (ox, oy), paper)
    img = bg.convert("RGB")

    # 透視：手機沒有正對紙張
    w, h = CANVAS
    k = p["persp"]
    j = lambda: rng.uniform(0.3, 1.0) * k
    src = [(0, 0), (w, 0), (w, h), (0, h)]
    dst = [(w * j(), h * j()), (w * (1 - j()), h * j() * 0.6), (w * (1 - j() * 0.4), h * (1 - j() * 0.5)), (w * j() * 0.5, h * (1 - j()))]
    img = img.transform(CANVAS, Image.PERSPECTIVE, find_coeffs(dst, src), Image.BICUBIC, fillcolor=(40, 36, 32))
    # 裁掉透視後露出的邊
    m = int(max(w, h) * k * 1.05) + 8
    img = img.crop((m, m, w - m, h - m))

    a = np.asarray(img, dtype=np.float32)
    hh, ww, _ = a.shape
    yy, xx = np.mgrid[0:hh, 0:ww]
    # 光線：一側比較亮，加上暗角
    ang = rng.uniform(0, 2 * np.pi)
    grad = ((xx / ww - 0.5) * np.cos(ang) + (yy / hh - 0.5) * np.sin(ang)) * 0.34
    vig = 1 - 0.28 * (((xx / ww - 0.5) ** 2 + (yy / hh - 0.5) ** 2) * 2)
    a = a * (p["light"] + grad)[:, :, None] * vig[:, :, None]
    if p.get("shadow"):  # 拿手機的手擋到光
        cx, cy = ww * rng.uniform(0.05, 0.25), hh * rng.uniform(0.75, 1.0)
        d = np.sqrt(((xx - cx) / (ww * 0.42)) ** 2 + ((yy - cy) / (hh * 0.5)) ** 2)
        a *= (1 - 0.34 * np.clip(1 - d, 0, 1) ** 1.5)[:, :, None]
    warm = p.get("warm", 1.0)
    a[:, :, 0] *= warm
    a[:, :, 2] /= warm
    a += rng.normal(0, p["noise"], a.shape)
    img = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))

    if p.get("motion"):  # 手震
        n = p["motion"]
        kern = [0] * (n * n)
        for i in range(n):
            kern[i * n + i] = 1
        img = img.filter(ImageFilter.Kernel((n, n), kern, scale=n)) if n <= 5 else _motion(img, n)
    img = img.filter(ImageFilter.GaussianBlur(p["blur"]))

    tw = p["w"]
    img = img.resize((tw, int(tw * img.height / img.width)), Image.LANCZOS)
    img.save(out_dir / e["file"], "JPEG", quality=p["q"])
    print("photo", e["file"], img.size)


def _motion(img, n):
    out = img.copy()
    acc = np.asarray(img, dtype=np.float32)
    for i in range(1, n):
        acc = acc + np.asarray(ImageChops.offset(img, i, i // 2), dtype=np.float32)
    return Image.fromarray((acc / n).astype(np.uint8))


for e in entries:
    make_photo(e)

# -*- coding: utf-8 -*-
"""Contact sheets + final crops for the Lagos photo set."""
import argparse
import json
import os
import re
import sys

from PIL import Image, ImageDraw, ImageEnhance, ImageFont, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "tools", "data")
RAW = os.path.join(DATA, "raw")
OUT = os.path.join(ROOT, "assets", "img")

SPECS = {
    # slot: (width, height, focus_y, focus_x)
    "hero-lagos": (2000, 1125),
    "card-development": (800, 600),
    "about-portrait": (1800, 1000),
    "cta-building": (2000, 1250),
    "hood-lekki": (1400, 875),
    "hood-ikoyi": (1400, 875),
    "hood-vi": (1400, 875),
    "hood-ikeja": (1400, 875),
    "hood-yaba": (1400, 875),
    "hood-banana": (1400, 875),
    "hood-surulere": (1400, 875),
    "hood-ajah": (1400, 875),
    "prop-eko": (900, 675),
    "prop-marina": (900, 675),
    "prop-lekki": (900, 675),
    "prop-ikoyi": (900, 675),
    "cap-1": (700, 1027),
    "cap-2": (700, 1027),
    "cap-3": (700, 1027),
    "cap-4": (700, 1027),
    "cap-5": (700, 1027),
    "news-1": (1000, 625),
    "news-2": (1000, 625),
    "news-3": (1000, 625),
    "tile-shot": (320, 210),
    "tile-interior": (320, 210),
    "tile-people": (320, 210),
}


def load_manifest():
    with open(os.path.join(DATA, "manifest.json"), encoding="utf-8") as fh:
        return json.load(fh)


def sheets(per_sheet=20, cols=5, tw=352, th=248):
    items = [m for m in load_manifest() if os.path.exists(os.path.join(RAW, m["file"]))]
    items.sort(key=lambda m: (m["query"], m["key"]))
    font = ImageFont.load_default()
    for start in range(0, len(items), per_sheet):
        chunk = items[start:start + per_sheet]
        rows = (len(chunk) + cols - 1) // cols
        sheet = Image.new("RGB", (cols * tw, rows * th), "#111111")
        draw = ImageDraw.Draw(sheet)
        for i, m in enumerate(chunk):
            try:
                im = Image.open(os.path.join(RAW, m["file"])).convert("RGB")
            except Exception:
                continue
            im = ImageOps.fit(im, (tw - 6, th - 30), method=Image.LANCZOS)
            x = (i % cols) * tw + 3
            y = (i // cols) * th + 3
            sheet.paste(im, (x, y))
            label = f"{start + i:03d} {m['key'][:30]}"
            draw.rectangle([x, y + im.height, x + im.width, y + im.height + 24], fill="#111111")
            draw.text((x + 5, y + im.height + 6), label, fill="#ffffff", font=font)
        name = os.path.join(DATA, f"sheet-{start // per_sheet + 1}.jpg")
        sheet.save(name, quality=88)
        print("wrote", name, sheet.size)


def grade(im):
    """Light, consistent editorial grade: muted colour, cool shadows, gentle contrast."""
    im = ImageEnhance.Color(im).enhance(0.9)
    im = ImageEnhance.Contrast(im).enhance(1.06)
    r, g, b = im.split()

    def curve(v, mul, add):
        return max(0, min(255, int(v * mul + add)))

    r = r.point(lambda v: curve(v, 0.985, 2))
    b = b.point(lambda v: curve(v, 1.02, 2))
    return Image.merge("RGB", (r, g, b))


def crop(selections, quality=82):
    manifest = {}
    for name in ("manifest.json", "manifest2.json"):
        path = os.path.join(DATA, name)
        if os.path.exists(path):
            with open(path, encoding="utf-8") as fh:
                for m in json.load(fh):
                    manifest[m["key"]] = m
    used = {}
    for slot, sel in selections.items():
        key = sel["key"] if isinstance(sel, dict) else sel
        if key not in manifest:
            print("!! missing key", key, "for", slot)
            continue
        src = os.path.join(RAW, manifest[key]["file"])
        if not os.path.exists(src):
            print("!! missing file", src)
            continue
        w, h = SPECS[slot]
        fx = float(sel.get("fx", 0.5)) if isinstance(sel, dict) else 0.5
        fy = float(sel.get("fy", 0.42)) if isinstance(sel, dict) else 0.42
        im = Image.open(src).convert("RGB")
        im = ImageOps.exif_transpose(im)
        im = ImageOps.fit(im, (w, h), method=Image.LANCZOS, centering=(fx, fy))
        im = grade(im)
        dest = os.path.join(OUT, slot + ".jpg")
        im.save(dest, quality=quality, optimize=True, progressive=True)
        used[slot] = manifest[key]
        print(f"{slot:20s} <- {key:34s} {im.size} {os.path.getsize(dest)//1024}KB")
    with open(os.path.join(DATA, "used.json"), "w", encoding="utf-8") as fh:
        json.dump(used, fh, indent=1, ensure_ascii=False)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("cmd", choices=["sheets", "crop"])
    ap.add_argument("--sel", default=os.path.join(DATA, "selections.json"))
    args = ap.parse_args()
    if args.cmd == "sheets":
        sheets()
    else:
        with open(args.sel, encoding="utf-8") as fh:
            crop(json.load(fh))


if __name__ == "__main__":
    main()



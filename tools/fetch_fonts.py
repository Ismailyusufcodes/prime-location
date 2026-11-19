# -*- coding: utf-8 -*-
"""Download the site fonts (General Sans + Playfair Display italic) as woff2."""
import os
import re
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONTS = os.path.join(ROOT, "assets", "fonts")
os.makedirs(FONTS, exist_ok=True)
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120.0 Safari/537.36")


def get(url, binary=False):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        data = r.read()
    return data if binary else data.decode("utf-8", "replace")


def save(name, url):
    data = get(url, binary=True)
    path = os.path.join(FONTS, name)
    with open(path, "wb") as fh:
        fh.write(data)
    print(f"{name:32s} {len(data)//1024:4d} KB  <- {url[:70]}")


def fontshare():
    css = get("https://api.fontshare.com/v2/css?f[]=general-sans@500,600&display=swap")
    # blocks look like: @font-face{font-family:'General Sans';...font-weight:500;...src:url(...) format('woff2')}
    for m in re.finditer(r"@font-face\s*{(.*?)}", css, re.S):
        block = m.group(1)
        if "woff2" not in block:
            continue
        weight = re.search(r"font-weight:\s*(\d+)", block)
        style = re.search(r"font-style:\s*(\w+)", block)
        url = re.search(r"url\(['\"]?(//[^'\")]+\.woff2)", block)
        if not (weight and url and (style is None or style.group(1) == "normal")):
            continue
        name = f"general-sans-{weight.group(1)}.woff2"
        if os.path.exists(os.path.join(FONTS, name)):
            print("skip", name)
            continue
        try:
            save(name, 'https:' + url.group(1))
        except Exception as exc:  # noqa: BLE001
            print("!! fontshare fail", exc)


def playfair():
    css = get("https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,400..600&display=swap")
    blocks = re.findall(r"/\*\s*([\w-]+)\s*\*/\s*@font-face\s*{(.*?)}", css, re.S)
    for subset, block in blocks:
        if subset != "latin":
            continue
        url = re.search(r"url\((https?://[^)]+\.woff2)\)", block)
        if not url:
            continue
        try:
            save("playfair-display-italic.woff2", url.group(1))
        except Exception as exc:  # noqa: BLE001
            print("!! playfair fail", exc)
        return
    print("!! no latin playfair block found; blocks:", [b[0] for b in blocks])


if __name__ == "__main__":
    fontshare()
    playfair()


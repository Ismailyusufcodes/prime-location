# -*- coding: utf-8 -*-
"""Fetch candidate Lagos photographs from Wikimedia Commons (CC licensed).

Writes tools/data/raw/*.jpg and tools/data/manifest.json with license metadata.
"""
import json
import os
import re
import time
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "tools", "data")
RAW = os.path.join(DATA, "raw")
os.makedirs(RAW, exist_ok=True)

UA = "PrimeLocationDemoBuild/1.0 (real-estate demo; contact demo@example.com)"
API = "https://commons.wikimedia.org/w/api.php"

QUERIES = [
    "Lagos skyline",
    "Lagos Island aerial",
    "Victoria Island Lagos",
    "Lekki Ikoyi Link Bridge",
    "Third Mainland Bridge Lagos",
    "Lekki Lagos buildings",
    "Ikoyi Lagos",
    "Banana Island Lagos",
    "Ikeja Lagos",
    "Yaba Lagos",
    "Surulere Lagos",
    "Ajah Lagos",
    "Eko Atlantic",
    "Lagos lagoon waterfront",
    "Lagos street architecture",
    "Lagos residential building",
    "Lagos apartment block",
    "Lagos sunset lagoon",
    "Nigerian woman portrait Lagos",
    "Lagos people street",
    "Lagos National Theatre",
    "Lagos marina boats",
    "Lagos modern building facade",
    "Lagos estate houses",
]


def api(params):
    params = dict(params)
    params.setdefault("format", "json")
    params.setdefault("formatversion", "2")
    url = API + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read().decode("utf-8"))


def clean(html):
    if not html:
        return ""
    txt = re.sub(r"<[^>]+>", " ", html)
    txt = txt.replace("&amp;", "&").replace("&nbsp;", " ").replace("&quot;", '"')
    return re.sub(r"\s+", " ", txt).strip()


def search(q, limit=10):
    try:
        res = api({
            "action": "query",
            "generator": "search",
            "gsrsearch": q,
            "gsrnamespace": "6",
            "gsrlimit": str(limit),
            "prop": "imageinfo",
            "iiprop": "url|size|mime|extmetadata",
            "iiurlwidth": "1600",
        })
    except Exception as exc:  # noqa: BLE001
        print("  ! search failed", q, exc)
        return []
    return res.get("query", {}).get("pages", [])


def main():
    manifest = []
    seen = {m["title"] for m in []}
    for q in QUERIES:
        print("SEARCH", q)
        pages = search(q, 10)
        slug = re.sub(r"[^a-z0-9]+", "-", q.lower()).strip("-")
        for i, p in enumerate(pages):
            info = (p.get("imageinfo") or [{}])[0]
            mime = info.get("mime", "")
            if mime not in ("image/jpeg", "image/png"):
                continue
            if (info.get("width") or 0) < 900:
                continue
            title = p.get("title", "")
            key = f"{slug}-{i:02d}"
            if key in seen:
                continue
            seen.add(key)
            thumb = info.get("thumburl") or info.get("url")
            if not thumb:
                continue
            dest = os.path.join(RAW, key + ".jpg")
            if not os.path.exists(dest) or os.path.getsize(dest) < 8000:
                try:
                    req = urllib.request.Request(thumb, headers={"User-Agent": UA})
                    with urllib.request.urlopen(req, timeout=90) as r:
                        blob = r.read()
                    with open(dest, "wb") as fh:
                        fh.write(blob)
                    time.sleep(0.15)
                except Exception as exc:  # noqa: BLE001
                    print("  ! download failed", key, exc)
                    continue
            meta = info.get("extmetadata") or {}
            manifest.append({
                "key": key,
                "query": q,
                "title": title,
                "file": key + ".jpg",
                "source": info.get("descriptionurl", ""),
                "width": info.get("width"),
                "height": info.get("height"),
                "artist": clean((meta.get("Artist") or {}).get("value", "")),
                "license": clean((meta.get("LicenseShortName") or {}).get("value", "")),
                "credit": clean((meta.get("Credit") or {}).get("value", "")),
            })
        print(f"  total so far: {len(manifest)}")

    # de-duplicate by title, keep first
    uniq = {}
    for m in manifest:
        uniq.setdefault(m["title"], m)
    manifest = list(uniq.values())
    with open(os.path.join(DATA, "manifest.json"), "w", encoding="utf-8") as fh:
        json.dump(manifest, fh, indent=1, ensure_ascii=False)
    print(f"DONE {len(manifest)} images -> {RAW}")


if __name__ == "__main__":
    main()

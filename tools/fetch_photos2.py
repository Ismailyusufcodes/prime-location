# -*- coding: utf-8 -*-
"""Second pass: Commons categories + tighter Lagos searches."""
import json
import os
import re
import time
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "tools", "data")
RAW = os.path.join(DATA, "raw")
UA = "PrimeLocationDemoBuild/1.0 (real-estate demo; contact demo@example.com)"
API = "https://commons.wikimedia.org/w/api.php"

CATEGORIES = [
    "Category:Buildings in Lagos",
    "Category:Houses in Lagos",
    "Category:Residential buildings in Lagos",
    "Category:Lekki",
    "Category:Ikoyi",
    "Category:Victoria Island, Lagos",
    "Category:People of Lagos",
    "Category:Lagos Island",
    "Category:Apartment buildings in Nigeria",
    "Category:Real estate in Nigeria",
    "Category:Lagos State",
    "Category:Interiors of buildings in Lagos",
]

QUERIES = [
    "Lagos Nigeria house",
    "Lekki house Nigeria",
    "Ikoyi house",
    "Lagos apartment interior",
    "Lagos office interior",
    "Lagos family",
    "Lagos woman",
    "Lagos beach",
    "Lagos market woman",
    "Lagos skyline night",
    "Lagos aerial view",
    "Victoria Island Lagos skyline",
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


BAD = re.compile(r"marina de lagos|portugal|brazil|amazonas|geneva|ginevra|kavanagh|buenos aires|venice|veneza", re.I)


def collect(pages, bucket, out):
    for i, p in enumerate(pages):
        info = (p.get("imageinfo") or [{}])[0]
        if info.get("mime") not in ("image/jpeg", "image/png"):
            continue
        if (info.get("width") or 0) < 900:
            continue
        title = p.get("title", "")
        desc = clean((info.get("extmetadata", {}).get("ImageDescription") or {}).get("value", ""))
        hay = title + " " + desc
        if BAD.search(hay):
            continue
        if "lagos" not in hay.lower() and "nigeria" not in hay.lower():
            continue
        key = f"{bucket}-{i:02d}"
        if key in out:
            continue
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
                time.sleep(0.12)
            except Exception as exc:  # noqa: BLE001
                print("  ! dl", key, exc)
                continue
        meta = info.get("extmetadata") or {}
        out[key] = {
            "key": key,
            "query": bucket,
            "title": title,
            "file": key + ".jpg",
            "source": info.get("descriptionurl", ""),
            "width": info.get("width"),
            "height": info.get("height"),
            "artist": clean((meta.get("Artist") or {}).get("value", "")),
            "license": clean((meta.get("LicenseShortName") or {}).get("value", "")),
            "credit": clean((meta.get("Credit") or {}).get("value", "")),
            "desc": desc[:300],
        }


def main():
    out = {}
    for cat in CATEGORIES:
        print("CAT", cat)
        try:
            res = api({
                "action": "query", "generator": "categorymembers",
                "gcmtitle": cat, "gcmtype": "file", "gcmlimit": "40",
                "prop": "imageinfo", "iiprop": "url|size|mime|extmetadata", "iiurlwidth": "1600",
            })
        except Exception as exc:  # noqa: BLE001
            print("  ! fail", exc)
            continue
        slug = re.sub(r"[^a-z0-9]+", "-", cat.replace("Category:", "").lower()).strip("-")[:28]
        collect(res.get("query", {}).get("pages", []), "cat-" + slug, out)
        print("  ->", len(out))

    for q in QUERIES:
        print("SEARCH", q)
        try:
            res = api({
                "action": "query", "generator": "search", "gsrsearch": q,
                "gsrnamespace": "6", "gsrlimit": "15", "prop": "imageinfo",
                "iiprop": "url|size|mime|extmetadata", "iiurlwidth": "1600",
            })
        except Exception as exc:  # noqa: BLE001
            print("  ! fail", exc)
            continue
        slug = re.sub(r"[^a-z0-9]+", "-", q.lower()).strip("-")[:28]
        collect(res.get("query", {}).get("pages", []), "q-" + slug, out)
        print("  ->", len(out))

    path = os.path.join(DATA, "manifest2.json")
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(list(out.values()), fh, indent=1, ensure_ascii=False)
    print("DONE", len(out))


if __name__ == "__main__":
    main()

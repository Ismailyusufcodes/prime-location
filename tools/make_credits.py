# -*- coding: utf-8 -*-
"""Build credits.html from the photos actually used on the site."""
import html
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "tools", "data")

LABELS = {
    "hero-lagos": "Hero — Third Mainland Bridge at dusk",
    "hero-2": "Hero — Victoria Island marina",
    "hero-3": "Hero — Lekki–Ikoyi Link Bridge",
    "card-development": "Hero card — residential neighbourhood",
    "about-portrait": "About — residents in Ikoyi",
    "cta-building": "Contact — Civic Towers, Lekki",
    "hood-lekki": "Neighbourhood — Lekki",
    "hood-ikoyi": "Neighbourhood — Ikoyi",
    "hood-vi": "Neighbourhood — Victoria Island",
    "hood-ikeja": "Neighbourhood — Ikeja GRA",
    "hood-yaba": "Neighbourhood — Yaba",
    "hood-banana": "Neighbourhood — Banana Island",
    "hood-surulere": "Neighbourhood — Surulere",
    "hood-ajah": "Neighbourhood — Ajah",
    "prop-eko": "Property — The Eko",
    "prop-marina": "Property — Marina Heights",
    "prop-lekki": "Property — Lekki Pearl",
    "prop-ikoyi": "Property — Ikoyi Crescent",
    "cap-1": "Capabilities — Acquisitions",
    "cap-2": "Capabilities — Asset management",
    "cap-3": "Capabilities — Leasing",
    "cap-4": "Capabilities — Development",
    "cap-5": "Capabilities — Affordable housing",
    "news-1": "News — leasing studio",
    "news-2": "News — Lekki Phase 1",
    "news-3": "News — Marina promenade",
    "tile-shot": "In-text tile — historic blocks",
    "tile-interior": "In-text tile — spaces",
    "tile-people": "In-text tile — people",
}


def main():
    used = json.load(open(os.path.join(DATA, "used.json"), encoding="utf-8"))
    rows = []
    for slot, meta in used.items():
        title = html.escape(meta.get("title", "").replace("File:", ""))
        artist = html.escape(meta.get("artist") or "Unknown photographer")
        lic = html.escape(meta.get("license") or "see source")
        src = html.escape(meta.get("source", ""))
        label = html.escape(LABELS.get(slot, slot))
        rows.append(
            f'    <li><b>{label}</b><span>“{title}” — {artist}, '
            f'<a href="{src}" rel="noopener nofollow">{lic}</a> (Wikimedia Commons)</span></li>'
        )
    rows = sorted(set(rows))
    tpl = open(os.path.join(ROOT, "tools", "credits-template.html"), encoding="utf-8").read()
    out = tpl.replace("    <!--CREDITS-->", "\n".join(rows))
    with open(os.path.join(ROOT, "credits.html"), "w", encoding="utf-8") as fh:
        fh.write(out)
    print("credits.html:", len(rows), "entries")


if __name__ == "__main__":
    main()

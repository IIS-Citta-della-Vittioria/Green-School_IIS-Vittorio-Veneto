#!/usr/bin/env python3
"""Aggiorna data/news.json aggregando feed RSS su energia e transizione ecologica."""

from __future__ import annotations

import datetime as dt
import email.utils
import json
import re
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

FEEDS = [
    ("QualEnergia", "https://www.qualenergia.it/feed/"),
    ("UN Climate News", "https://news.un.org/feed/subscribe/en/news/topic/climate-change/feed/rss.xml"),
    ("IEA News", "https://www.iea.org/news/rss"),
    ("PV Magazine", "https://www.pv-magazine.com/feed/"),
]

MAX_ITEMS_TOTAL = 14
MAX_PER_SOURCE = 5
TIMEOUT_SECONDS = 20

ROOT = Path(__file__).resolve().parents[1]
OUT_PATH = ROOT / "data" / "news.json"


def sanitize_html(text: str) -> str:
    text = re.sub(r"<[^>]+>", " ", text or "")
    text = re.sub(r"\s+", " ", text).strip()
    return text


def now_utc_iso() -> str:
    return dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def parse_date(raw: str | None) -> str:
    if not raw:
        return now_utc_iso()

    try:
        parsed = email.utils.parsedate_to_datetime(raw)
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=dt.timezone.utc)
        return parsed.astimezone(dt.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    except Exception:
        return now_utc_iso()


def fetch_xml(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "GreenSchoolNewsBot/1.0"})
    with urllib.request.urlopen(req, timeout=TIMEOUT_SECONDS) as res:
        return res.read()


def extract_items(source_name: str, xml_bytes: bytes) -> list[dict[str, str]]:
    items: list[dict[str, str]] = []

    try:
        root = ET.fromstring(xml_bytes)
    except ET.ParseError:
        return items

    rss_items = root.findall(".//channel/item")
    if rss_items:
        for item in rss_items[:MAX_PER_SOURCE]:
            title = (item.findtext("title") or "Senza titolo").strip()
            link = (item.findtext("link") or "").strip()
            desc = sanitize_html(item.findtext("description") or "")
            pub = parse_date(item.findtext("pubDate"))
            if not link:
                continue
            items.append(
                {
                    "title": title,
                    "url": link,
                    "source": source_name,
                    "publishedAt": pub,
                    "summary": desc[:240],
                }
            )
        return items

    atom_entries = root.findall(".//{http://www.w3.org/2005/Atom}entry")
    for entry in atom_entries[:MAX_PER_SOURCE]:
        title = (entry.findtext("{http://www.w3.org/2005/Atom}title") or "Senza titolo").strip()
        links = entry.findall("{http://www.w3.org/2005/Atom}link")
        href = ""
        for link in links:
            href = link.attrib.get("href", "").strip()
            if href:
                break
        summary = entry.findtext("{http://www.w3.org/2005/Atom}summary") or entry.findtext("{http://www.w3.org/2005/Atom}content") or ""
        pub = parse_date(entry.findtext("{http://www.w3.org/2005/Atom}updated") or entry.findtext("{http://www.w3.org/2005/Atom}published"))
        if not href:
            continue
        items.append(
            {
                "title": title,
                "url": href,
                "source": source_name,
                "publishedAt": pub,
                "summary": sanitize_html(summary)[:240],
            }
        )

    return items


def main() -> None:
    collected: list[dict[str, str]] = []

    for source_name, source_url in FEEDS:
        try:
            xml_text = fetch_xml(source_url)
            items = extract_items(source_name, xml_text)
            collected.extend(items)
        except Exception:
            continue

    if not collected:
        collected = [
            {
                "title": "Nessuna notizia disponibile dalle fonti oggi",
                "url": "https://www.iea.org/news",
                "source": "Sistema Green School",
                "publishedAt": now_utc_iso(),
                "summary": "Controllare connettivita o disponibilita feed. Il sistema riprovera al prossimo aggiornamento automatico.",
            }
        ]

    dedup = {}
    for item in collected:
        dedup[item["url"]] = item

    sorted_items = sorted(
        dedup.values(),
        key=lambda x: x.get("publishedAt", ""),
        reverse=True,
    )[:MAX_ITEMS_TOTAL]

    payload = {
        "updatedAt": now_utc_iso(),
        "sourceCount": len(FEEDS),
        "items": sorted_items,
    }

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()


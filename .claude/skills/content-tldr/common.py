"""Shared parsing for the content-tldr skill.

Mirrors the extraction rules in apps/harrychang-me/scripts/backfill_alt_and_tldr.py
so the keys and section headings produced here match what build_graph.py looks up.
Standard library only, on purpose: the skill should run without the app's venv.
"""

import json
import re
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[3]
APP_DIR = REPO_ROOT / "apps" / "harrychang-me"
CONTENT_DIR = APP_DIR / "content"
SUMMARIES_PATH = CONTENT_DIR / "generated" / "section-summaries.json"

CONTENT_DIRS = {
    "post": CONTENT_DIR / "posts",
    "project": CONTENT_DIR / "projects",
    "gallery": CONTENT_DIR / "gallery",
}

MIN_SECTION_BODY = 50


def split_frontmatter(text):
    """Return (frontmatter_text, body). Matches the script's simple --- delimiters."""
    if not text.startswith("---"):
        return "", text
    end = text.find("\n---", 3)
    if end == -1:
        return "", text
    return text[3:end], text[end + 4 :].lstrip("\n")


def frontmatter_title(fm, fallback):
    """Pull `title:` without pulling in PyYAML."""
    m = re.search(r'^title:\s*["\']?(.+?)["\']?\s*$', fm, re.MULTILINE)
    return m.group(1).strip() if m else fallback


def extract_sections(body):
    """Flatten h2/h3/h4 into an ordered list of headings with bodies >= 50 chars."""
    sections = []
    for h2_part in re.split(r"\n(?=## (?!#))", body):
        h2_part = h2_part.strip()
        if not h2_part:
            continue
        h2_m = re.match(r"^##\s+(.+?)(?:\n|$)", h2_part)
        h2_heading = h2_m.group(1).strip() if h2_m else None
        h2_body = re.sub(r"^##\s+.+?\n?", "", h2_part).strip() if h2_heading else h2_part
        if h2_heading and h2_body and len(h2_body) >= MIN_SECTION_BODY:
            sections.append(h2_heading)

        for h3_part in re.split(r"\n(?=### (?!#))", h2_body):
            h3_part = h3_part.strip()
            h3_m = re.match(r"^###\s+(.+?)(?:\n|$)", h3_part)
            if not h3_m:
                continue
            h3_body = re.sub(r"^###\s+.+?\n?", "", h3_part).strip()
            if h3_body and len(h3_body) >= MIN_SECTION_BODY:
                sections.append(h3_m.group(1).strip())

            for h4_part in re.split(r"\n(?=#### (?!#))", h3_body):
                h4_part = h4_part.strip()
                h4_m = re.match(r"^####\s+(.+?)(?:\n|$)", h4_part)
                if not h4_m:
                    continue
                h4_body = re.sub(r"^####\s+.+?\n?", "", h4_part).strip()
                if h4_body and len(h4_body) >= MIN_SECTION_BODY:
                    sections.append(h4_m.group(1).strip())
    return sections


def iter_content_files():
    """Yield (key, source_type, path, title, locale, sections) for every content file."""
    for source_type, content_dir in CONTENT_DIRS.items():
        if not content_dir.exists():
            continue
        for md_file in sorted(content_dir.glob("*.md")):
            if md_file.stem.startswith((".", "_")):
                continue
            text = md_file.read_text(encoding="utf-8")
            fm, body = split_frontmatter(text)
            if not body.strip():
                continue
            slug = md_file.stem
            locale = "zh-TW" if slug.lower().endswith("_zh-tw") else "en"
            base_slug = re.sub(r"_zh-tw$", "", slug, flags=re.IGNORECASE)
            yield {
                "key": f"{source_type}/{base_slug}/{locale}",
                "source_type": source_type,
                "path": md_file,
                "title": frontmatter_title(fm, slug),
                "locale": locale,
                "sections": extract_sections(body),
            }


def load_summaries():
    if not SUMMARIES_PATH.exists():
        return {}
    return json.loads(SUMMARIES_PATH.read_text(encoding="utf-8"))

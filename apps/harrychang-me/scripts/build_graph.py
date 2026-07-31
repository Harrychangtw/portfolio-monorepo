#!/usr/bin/env python3
"""
Build script for the knowledge graph.
Reads all markdown content + locale JSONs, chunks them into a hierarchy
(file -> section -> image/video), generates embeddings via sentence-transformers
(MPS on Apple Silicon), computes similarity edges, builds structural + tag edges,
and outputs a static graph-data.json for the frontend visualization.

Usage:
    python3 scripts/build_graph.py [--threshold 0.72] [--max-edges 8] [--no-llm]

Requires: pip install -r scripts/requirements-graph.txt
"""

import argparse
import asyncio
import base64
import hashlib
import json
import os
import re
import sys
import time
from pathlib import Path

import numpy as np
import yaml

# ─── Configuration ───────────────────────────────────────────────────────────

CONTENT_DIR = Path(__file__).parent.parent / "content"
LOCALES_DIR = Path(__file__).parent.parent / "public" / "locales"
OUTPUT_PATH = Path(__file__).parent.parent / "public" / "graph-data.json"
CACHE_DIR = Path(__file__).parent.parent / "content" / "generated"
# The caches under CACHE_DIR are written minified and then pretty-printed by
# `npm run format:generated`, which build:graph chains after this script. Don't
# switch these writes to indent=2: Prettier packs several floats per line, while
# indent=2 puts each on its own, which turns the 1.5M-float multimodal cache into
# a multi-million-line file and an unreviewable diff. OUTPUT_PATH is the
# exception — it stays on Python's indent=2 and Prettier never touches it.
CACHE_PATH = CACHE_DIR / "graph-embeddings-cache.json"
MULTIMODAL_CACHE_PATH = CACHE_DIR / "graph-multimodal-cache.json"
PUBLIC_DIR = Path(__file__).parent.parent / "public"
SUMMARIES_PATH = CACHE_DIR / "section-summaries.json"

EMBEDDING_MODEL = "BAAI/bge-large-zh-v1.5"
MULTIMODAL_MODEL = "google/gemini-embedding-2-preview"
MULTIMODAL_DIM = 1536
MULTIMODAL_API_URL = "https://openrouter.ai/api/v1/embeddings"
DEFAULT_CONCURRENCY = 15
BASE_URL = "https://www.harrychang.me"

CONTENT_DIRS = {
    "post": CONTENT_DIR / "posts",
    "project": CONTENT_DIR / "projects",
    "gallery": CONTENT_DIR / "gallery",
}

# URL patterns for video detection
YOUTUBE_PATTERN = re.compile(
    r"!\[([^\]]*)\]\((https?://(?:www\.)?(?:youtube\.com/watch\?[^\s)]+|youtu\.be/[^\s)]+))\)"
)
DRIVE_PATTERN = re.compile(
    r"!\[([^\]]*)\]\((https?://drive\.google\.com/[^\s)]+)\)"
)
# Image pattern in markdown body (excludes youtube/drive URLs)
IMAGE_PATTERN = re.compile(
    r"!\[([^\]]*)\]\(([^)]+\.(?:webp|jpg|jpeg|png|gif|svg|avif))\)"
)

# ─── Frontmatter parsing ────────────────────────────────────────────────────


def parse_frontmatter(text: str) -> tuple[dict, str]:
    """Parse YAML frontmatter from markdown text."""
    match = re.match(r"^---\s*\n(.*?)\n---\s*\n?(.*)", text, re.DOTALL)
    if not match:
        return {}, text
    try:
        meta = yaml.safe_load(match.group(1)) or {}
    except yaml.YAMLError:
        meta = {}
    return meta, match.group(2)


def sha256(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def slugify_tag(tag: str) -> str:
    """Convert a tag to a slug-safe string."""
    return re.sub(r"[^a-z0-9\u4e00-\u9fff\u3400-\u4dbf-]", "-", tag.lower().strip()).strip("-")


# Mirrors `slugify` in packages/lib/lib/markdown.ts. JS \w is ASCII-only, so we
# use [^a-zA-Z0-9_\s-] explicitly here (Python \w would match Unicode).
def slugify_heading(text: str) -> str:
    s = text.lower()
    s = re.sub(r"[^a-zA-Z0-9_\s-]", "", s)
    s = re.sub(r"\s+", "-", s)
    s = re.sub(r"--+", "-", s)
    return s.strip()


class AnchorAllocator:
    """Per-document anchor id allocator with dedup matching the JS renderer."""

    def __init__(self) -> None:
        self.used: set[str] = set()
        self.img_idx = 0
        self.vid_idx = 0

    def heading(self, text: str | None) -> str | None:
        if not text or not text.strip():
            return None
        base = slugify_heading(text)
        if not base:
            return None
        candidate = base
        counter = 1
        while candidate in self.used:
            candidate = f"{base}-{counter}"
            counter += 1
        self.used.add(candidate)
        return candidate

    def next_image(self) -> str:
        anchor = f"img-{self.img_idx}"
        self.img_idx += 1
        return anchor

    def next_video(self) -> str:
        anchor = f"vid-{self.vid_idx}"
        self.vid_idx += 1
        return anchor


# ─── Content collection ─────────────────────────────────────────────────────


def collect_markdown_files() -> list[dict]:
    """Collect all markdown files from content directories."""
    items = []
    for source_type, content_dir in CONTENT_DIRS.items():
        if not content_dir.exists():
            print(f"  Warning: {content_dir} does not exist, skipping")
            continue
        for md_file in sorted(content_dir.glob("*.md")):
            filename = md_file.stem
            # Skip hidden/draft conventions
            if filename.startswith(".") or filename.startswith("_"):
                continue

            # Determine locale
            if filename.endswith("_zh-tw") or filename.endswith("_zh-TW"):
                locale = "zh-TW"
                slug = re.sub(r"_zh-tw$", "", filename, flags=re.IGNORECASE)
            else:
                locale = "en"
                slug = filename

            text = md_file.read_text(encoding="utf-8")
            meta, body = parse_frontmatter(text)

            # Skip hidden content
            if meta.get("hidden", False):
                continue

            items.append(
                {
                    "source_type": source_type,
                    "slug": slug,
                    "locale": locale,
                    "meta": meta,
                    "body": body,
                    "file": str(md_file),
                }
            )
    return items


def collect_locale_files() -> list[dict]:
    """Collect locale JSON files."""
    items = []
    for lang_dir in LOCALES_DIR.iterdir():
        if not lang_dir.is_dir():
            continue
        locale = lang_dir.name  # "en" or "zh-TW"
        for json_file in sorted(lang_dir.glob("*.json")):
            namespace = json_file.stem
            try:
                data = json.loads(json_file.read_text(encoding="utf-8"))
            except json.JSONDecodeError:
                continue
            items.append(
                {
                    "namespace": namespace,
                    "locale": locale,
                    "data": data,
                    "file": str(json_file),
                }
            )
    return items


# ─── Chunking ────────────────────────────────────────────────────────────────


def extract_media_from_text(text: str) -> tuple[list[dict], list[dict]]:
    """Extract image and video references from markdown text.
    Returns (images, videos) where each is a list of {alt, url}."""
    images = []
    videos = []

    # Extract videos first (YouTube, Drive)
    video_urls = set()
    for match in YOUTUBE_PATTERN.finditer(text):
        alt, url = match.group(1), match.group(2)
        videos.append({"alt": alt or "YouTube Video", "url": url})
        video_urls.add(url)
    for match in DRIVE_PATTERN.finditer(text):
        alt, url = match.group(1), match.group(2)
        videos.append({"alt": alt or "Video", "url": url})
        video_urls.add(url)

    # Extract images (excluding video URLs)
    for match in IMAGE_PATTERN.finditer(text):
        alt, url = match.group(1), match.group(2)
        if url not in video_urls:
            images.append({"alt": alt or "", "url": url})

    return images, videos


def split_at_level(text: str, level: int) -> list[tuple]:
    """Split markdown text at headings of *exactly* `level` hashes (no deeper).
    Returns [(heading | None, body), ...]. The first tuple has heading=None when
    content precedes the first heading of that level."""
    hashes = "#" * level
    # Lookahead: exactly `level` hashes + space, NOT immediately followed by another #
    pattern = rf"\n(?={hashes} (?!#))"
    heading_re = re.compile(rf"^{hashes}\s+(.+?)(?:\n|$)")
    strip_re   = re.compile(rf"^{hashes}\s+.+?\n?")

    parts = re.split(pattern, text)
    result = []
    for part in parts:
        part = part.strip()
        if not part:
            continue
        m = heading_re.match(part)
        heading = m.group(1).strip() if m else None
        body    = strip_re.sub("", part, count=1).strip() if heading else part
        result.append((heading, body))
    return result or [(None, text)]


def chunk_markdown(item: dict) -> dict:
    """Chunk a markdown item into a hierarchy of nodes and edges.
    Returns {file_node, section_nodes, image_nodes, video_nodes, structural_edges}.
    Only file_node and section_nodes get a 'text' field for embedding."""
    meta = item["meta"]
    body = item["body"].strip()
    source_type = item["source_type"]
    slug = item["slug"]
    locale = item["locale"]

    title = meta.get("title", slug)
    description = meta.get("description", "")
    category = meta.get("category", "")
    tags = meta.get("tags", []) or []
    technologies = meta.get("technologies", []) or []
    date = meta.get("date", "")
    image_url = meta.get("imageUrl", "")

    # Fallback: extract first image from markdown body if no frontmatter imageUrl
    if not image_url:
        img_match = re.search(r"!\[.*?\]\(([^)]+\.(?:webp|jpg|jpeg|png|gif))\)", body)
        if img_match:
            image_url = img_match.group(1)

    # Build URL
    url_map = {
        "post": f"{BASE_URL}/blog/{slug}",
        "project": f"{BASE_URL}/projects/{slug}",
        "gallery": f"{BASE_URL}/gallery/{slug}",
    }
    url = url_map.get(source_type, BASE_URL)

    # Context prefix for embedding quality
    context_parts = [f"Title: {title}"]
    if category:
        context_parts.append(f"Category: {category}")
    if tags:
        context_parts.append(f"Tags: {', '.join(str(t) for t in tags)}")
    if technologies:
        context_parts.append(
            f"Technologies: {', '.join(str(t) for t in technologies)}"
        )
    if description:
        context_parts.append(f"Description: {description}")

    # Extra metadata for gallery
    if source_type == "gallery":
        for field in ["camera", "lens", "location"]:
            val = meta.get(field)
            if val:
                context_parts.append(f"{field.capitalize()}: {val}")

    context_prefix = "\n".join(context_parts)

    file_id = f"{source_type}-{slug}-{locale}-file"

    # === File node ===
    file_text = f"{context_prefix}\n\n{body[:500]}" if body else context_prefix
    file_snippet = (description[:150] + "...") if len(description) > 150 else (description or (body[:150] + "..." if body else ""))
    file_node = {
        "id": file_id,
        "text": file_text,
        "nodeType": "file",
        "title": title,
        "snippet": file_snippet.replace("\n", " ").strip(),
        "sourceType": source_type,
        "sourceSlug": slug,
        "locale": locale,
        "url": url,
        "date": str(date) if date else None,
        "tags": [str(t) for t in tags],
        "heading": None,
        "imageUrl": image_url if image_url else None,
        "parentId": None,
        "mediaSource": None,
    }

    section_nodes = []
    image_nodes = []
    video_nodes = []
    structural_edges = []
    anchors = AnchorAllocator()

    # === Section nodes ===
    sections = re.split(r"\n(?=## )", body)
    sections = [s.strip() for s in sections if s.strip()]

    if len(sections) <= 1:
        # Single chunk — treat as one section under the file
        sec_id = f"{source_type}-{slug}-{locale}-sec-0"
        text = f"{context_prefix}\n\n{body}" if body else context_prefix
        snippet = (body[:150] + "...") if len(body) > 150 else (body or description)
        section_nodes.append(
            {
                "id": sec_id,
                "text": text,
                "nodeType": "section",
                "title": title,
                "snippet": snippet.replace("\n", " ").strip(),
                "sourceType": source_type,
                "sourceSlug": slug,
                "locale": locale,
                "url": url,
                "date": str(date) if date else None,
                "tags": [str(t) for t in tags],
                "heading": None,
                "imageUrl": image_url if image_url else None,
                "parentId": file_id,
                "mediaSource": None,
                "anchorId": None,
            }
        )
        structural_edges.append(
            {"source": file_id, "target": sec_id, "weight": 1.0, "linkType": "structural"}
        )

        # Extract media from the entire body
        images, videos = extract_media_from_text(body)
        for j, img in enumerate(images):
            img_id = f"{source_type}-{slug}-{locale}-sec-0-img-{j}"
            img_title = img["alt"].replace("framed:", "").strip() or Path(img["url"]).stem
            image_nodes.append({
                "id": img_id,
                "nodeType": "image",
                "title": img_title[:60],
                "snippet": "",
                "sourceType": source_type,
                "sourceSlug": slug,
                "locale": locale,
                "url": url,
                "date": str(date) if date else None,
                "tags": [],
                "heading": None,
                "imageUrl": img["url"],
                "parentId": sec_id,
                "mediaSource": img["url"],
                "anchorId": anchors.next_image(),
            })
            structural_edges.append(
                {"source": sec_id, "target": img_id, "weight": 0.8, "linkType": "structural"}
            )
        for j, vid in enumerate(videos):
            vid_id = f"{source_type}-{slug}-{locale}-sec-0-vid-{j}"
            video_nodes.append({
                "id": vid_id,
                "nodeType": "video",
                "title": vid["alt"][:60],
                "snippet": "",
                "sourceType": source_type,
                "sourceSlug": slug,
                "locale": locale,
                "url": url,
                "date": str(date) if date else None,
                "tags": [],
                "heading": None,
                "imageUrl": None,
                "parentId": sec_id,
                "mediaSource": vid["url"],
                "anchorId": anchors.next_video(),
            })
            structural_edges.append(
                {"source": sec_id, "target": vid_id, "weight": 0.8, "linkType": "structural"}
            )
    else:
        for i, section in enumerate(sections):
            # ── h2 node ──────────────────────────────────────────────────────
            h2_match = re.match(r"^##\s+(.+?)(?:\n|$)", section)
            h2_heading = h2_match.group(1).strip() if h2_match else None
            h2_body = (
                re.sub(r"^##\s+.+?\n?", "", section).strip() if h2_heading else section
            )

            h2_id      = f"{source_type}-{slug}-{locale}-sec-{i}"
            h2_text    = f"{context_prefix}\n\nSection: {h2_heading or 'Introduction'}\n\n{h2_body[:400]}"
            h2_snippet = (h2_body[:150] + "...") if len(h2_body) > 150 else h2_body

            h2_anchor = anchors.heading(h2_heading)
            section_nodes.append({
                "id": h2_id,
                "text": h2_text,
                "nodeType": "section",
                "title": f"{title}" if not h2_heading else f"{title} - {h2_heading}",
                "snippet": h2_snippet.replace("\n", " ").strip(),
                "sourceType": source_type,
                "sourceSlug": slug,
                "locale": locale,
                "url": url,
                "date": str(date) if date else None,
                "tags": [str(t) for t in tags],
                "heading": h2_heading,
                "imageUrl": image_url if image_url else None,
                "parentId": file_id,
                "mediaSource": None,
                "anchorId": h2_anchor,
            })
            structural_edges.append(
                {"source": file_id, "target": h2_id, "weight": 1.0, "linkType": "structural"}
            )

            # ── h3 split ─────────────────────────────────────────────────────
            h3_list = split_at_level(h2_body, 3)
            has_h3  = len(h3_list) > 1 or h3_list[0][0] is not None

            if not has_h3:
                # No h3 — attach media directly to the h2 node
                _imgs, _vids = extract_media_from_text(h2_body)
                for j, img in enumerate(_imgs):
                    img_id    = f"{h2_id}-img-{j}"
                    img_title = img["alt"].replace("framed:", "").strip() or Path(img["url"]).stem
                    image_nodes.append({
                        "id": img_id, "nodeType": "image",
                        "title": img_title[:60], "snippet": "",
                        "sourceType": source_type, "sourceSlug": slug,
                        "locale": locale, "url": url,
                        "date": str(date) if date else None,
                        "tags": [], "heading": h2_heading,
                        "imageUrl": img["url"], "parentId": h2_id,
                        "mediaSource": img["url"],
                        "anchorId": anchors.next_image(),
                    })
                    structural_edges.append(
                        {"source": h2_id, "target": img_id, "weight": 0.8, "linkType": "structural"}
                    )
                for j, vid in enumerate(_vids):
                    vid_id = f"{h2_id}-vid-{j}"
                    video_nodes.append({
                        "id": vid_id, "nodeType": "video",
                        "title": vid["alt"][:60], "snippet": "",
                        "sourceType": source_type, "sourceSlug": slug,
                        "locale": locale, "url": url,
                        "date": str(date) if date else None,
                        "tags": [], "heading": h2_heading,
                        "imageUrl": None, "parentId": h2_id,
                        "mediaSource": vid["url"],
                        "anchorId": anchors.next_video(),
                    })
                    structural_edges.append(
                        {"source": h2_id, "target": vid_id, "weight": 0.8, "linkType": "structural"}
                    )
            else:
                for j, (h3_heading, h3_body) in enumerate(h3_list):
                    # ── h3 node ───────────────────────────────────────────────
                    h3_id    = f"{h2_id}-{j}"
                    h3_label = h3_heading or "Introduction"
                    h3_title = (
                        f"{title} - {h2_heading} › {h3_heading}"
                        if h2_heading and h3_heading
                        else (f"{title} - {h3_heading}" if h3_heading else f"{title} - {h2_heading}")
                    )
                    h3_text    = (
                        f"{context_prefix}\n\nSection: {h2_heading or ''} › {h3_label}"
                        f"\n\n{h3_body[:400]}"
                    )
                    h3_snippet = (h3_body[:150] + "...") if len(h3_body) > 150 else h3_body

                    h3_anchor = anchors.heading(h3_heading)
                    section_nodes.append({
                        "id": h3_id,
                        "text": h3_text,
                        "nodeType": "section",
                        "title": h3_title,
                        "snippet": h3_snippet.replace("\n", " ").strip(),
                        "sourceType": source_type, "sourceSlug": slug,
                        "locale": locale, "url": url,
                        "date": str(date) if date else None,
                        "tags": [str(t) for t in tags],
                        "heading": h3_heading,
                        "imageUrl": image_url if image_url else None,
                        "parentId": h2_id,
                        "mediaSource": None,
                        "anchorId": h3_anchor,
                    })
                    structural_edges.append(
                        {"source": h2_id, "target": h3_id, "weight": 1.0, "linkType": "structural"}
                    )

                    # ── h4 split ──────────────────────────────────────────────
                    h4_list = split_at_level(h3_body, 4)
                    has_h4  = len(h4_list) > 1 or h4_list[0][0] is not None

                    if not has_h4:
                        # No h4 — attach media directly to the h3 node
                        _imgs, _vids = extract_media_from_text(h3_body)
                        for k, img in enumerate(_imgs):
                            img_id    = f"{h3_id}-img-{k}"
                            img_title = img["alt"].replace("framed:", "").strip() or Path(img["url"]).stem
                            image_nodes.append({
                                "id": img_id, "nodeType": "image",
                                "title": img_title[:60], "snippet": "",
                                "sourceType": source_type, "sourceSlug": slug,
                                "locale": locale, "url": url,
                                "date": str(date) if date else None,
                                "tags": [], "heading": h3_heading,
                                "imageUrl": img["url"], "parentId": h3_id,
                                "mediaSource": img["url"],
                                "anchorId": anchors.next_image(),
                            })
                            structural_edges.append(
                                {"source": h3_id, "target": img_id, "weight": 0.8, "linkType": "structural"}
                            )
                        for k, vid in enumerate(_vids):
                            vid_id = f"{h3_id}-vid-{k}"
                            video_nodes.append({
                                "id": vid_id, "nodeType": "video",
                                "title": vid["alt"][:60], "snippet": "",
                                "sourceType": source_type, "sourceSlug": slug,
                                "locale": locale, "url": url,
                                "date": str(date) if date else None,
                                "tags": [], "heading": h3_heading,
                                "imageUrl": None, "parentId": h3_id,
                                "mediaSource": vid["url"],
                                "anchorId": anchors.next_video(),
                            })
                            structural_edges.append(
                                {"source": h3_id, "target": vid_id, "weight": 0.8, "linkType": "structural"}
                            )
                    else:
                        for k, (h4_heading, h4_body) in enumerate(h4_list):
                            # ── h4 node (leaf) ────────────────────────────────
                            h4_id    = f"{h3_id}-{k}"
                            h4_title = (
                                f"{h3_title} › {h4_heading}" if h4_heading else h3_title
                            )
                            h4_text    = (
                                f"{context_prefix}\n\nSection: {h3_label} › {h4_heading or 'Intro'}"
                                f"\n\n{h4_body[:400]}"
                            )
                            h4_snippet = (h4_body[:150] + "...") if len(h4_body) > 150 else h4_body

                            h4_anchor = anchors.heading(h4_heading)
                            section_nodes.append({
                                "id": h4_id,
                                "text": h4_text,
                                "nodeType": "section",
                                "title": h4_title,
                                "snippet": h4_snippet.replace("\n", " ").strip(),
                                "sourceType": source_type, "sourceSlug": slug,
                                "locale": locale, "url": url,
                                "date": str(date) if date else None,
                                "tags": [str(t) for t in tags],
                                "heading": h4_heading,
                                "imageUrl": image_url if image_url else None,
                                "parentId": h3_id,
                                "mediaSource": None,
                                "anchorId": h4_anchor,
                            })
                            structural_edges.append(
                                {"source": h3_id, "target": h4_id, "weight": 1.0, "linkType": "structural"}
                            )

                            # Attach media to the h4 leaf node
                            _imgs, _vids = extract_media_from_text(h4_body)
                            for m_i, img in enumerate(_imgs):
                                img_id    = f"{h4_id}-img-{m_i}"
                                img_title = img["alt"].replace("framed:", "").strip() or Path(img["url"]).stem
                                image_nodes.append({
                                    "id": img_id, "nodeType": "image",
                                    "title": img_title[:60], "snippet": "",
                                    "sourceType": source_type, "sourceSlug": slug,
                                    "locale": locale, "url": url,
                                    "date": str(date) if date else None,
                                    "tags": [], "heading": h4_heading,
                                    "imageUrl": img["url"], "parentId": h4_id,
                                    "mediaSource": img["url"],
                                    "anchorId": anchors.next_image(),
                                })
                                structural_edges.append(
                                    {"source": h4_id, "target": img_id, "weight": 0.8, "linkType": "structural"}
                                )
                            for m_i, vid in enumerate(_vids):
                                vid_id = f"{h4_id}-vid-{m_i}"
                                video_nodes.append({
                                    "id": vid_id, "nodeType": "video",
                                    "title": vid["alt"][:60], "snippet": "",
                                    "sourceType": source_type, "sourceSlug": slug,
                                    "locale": locale, "url": url,
                                    "date": str(date) if date else None,
                                    "tags": [], "heading": h4_heading,
                                    "imageUrl": None, "parentId": h4_id,
                                    "mediaSource": vid["url"],
                                    "anchorId": anchors.next_video(),
                                })
                                structural_edges.append(
                                    {"source": h4_id, "target": vid_id, "weight": 0.8, "linkType": "structural"}
                                )

    # === Cover image node (from frontmatter imageUrl) ===
    if image_url:
        cover_id = f"{source_type}-{slug}-{locale}-img-cover"
        cover_title = f"{title} (cover)"
        image_nodes.append({
            "id": cover_id,
            "nodeType": "image",
            "title": cover_title[:60],
            "snippet": "",
            "sourceType": source_type,
            "sourceSlug": slug,
            "locale": locale,
            "url": url,
            "date": str(date) if date else None,
            "tags": [],
            "heading": None,
            "imageUrl": image_url,
            "parentId": file_id,
            "mediaSource": image_url,
        })
        structural_edges.append(
            {"source": file_id, "target": cover_id, "weight": 0.8, "linkType": "structural"}
        )

    # === Gallery image nodes (from frontmatter gallery: array) ===
    gallery_items = meta.get("gallery", []) or []
    for j, gal_item in enumerate(gallery_items):
        gal_url = gal_item.get("url", "") if isinstance(gal_item, dict) else str(gal_item)
        if not gal_url:
            continue
        gal_id = f"{source_type}-{slug}-{locale}-img-gal-{j}"
        gal_title = gal_item.get("caption", "") if isinstance(gal_item, dict) else ""
        if not gal_title:
            gal_title = Path(gal_url).stem
        image_nodes.append({
            "id": gal_id,
            "nodeType": "image",
            "title": gal_title[:60],
            "snippet": "",
            "sourceType": source_type,
            "sourceSlug": slug,
            "locale": locale,
            "url": url,
            "date": str(date) if date else None,
            "tags": [],
            "heading": None,
            "imageUrl": gal_url,
            "parentId": file_id,
            "mediaSource": gal_url,
        })
        structural_edges.append(
            {"source": file_id, "target": gal_id, "weight": 0.8, "linkType": "structural"}
        )

    return {
        "file_node": file_node,
        "section_nodes": section_nodes,
        "image_nodes": image_nodes,
        "video_nodes": video_nodes,
        "structural_edges": structural_edges,
    }


def flatten_json_section(data, prefix: str = "") -> str:
    """Recursively flatten a JSON structure into readable text."""
    parts = []
    if isinstance(data, dict):
        for k, v in data.items():
            new_prefix = f"{prefix}.{k}" if prefix else k
            parts.append(flatten_json_section(v, new_prefix))
    elif isinstance(data, list):
        for i, item in enumerate(data):
            parts.append(flatten_json_section(item, f"{prefix}[{i}]"))
    else:
        text = str(data).strip()
        # Strip HTML tags for cleaner embedding
        text = re.sub(r"<[^>]+>", "", text)
        if text:
            parts.append(f"{prefix}: {text}" if prefix else text)
    return "\n".join(filter(None, parts))


def chunk_locale(item: dict) -> list[dict]:
    """Chunk a locale JSON file into graph nodes.
    Returns a flat list of section-level nodes (locale files don't have hierarchy)."""
    namespace = item["namespace"]
    locale = item["locale"]
    data = item["data"]

    # Skip common.json utility strings (header labels, button text, etc.)
    skip_namespaces = {"common"}
    if namespace in skip_namespaces:
        return []

    url_map = {
        "cv": f"{BASE_URL}/cv",
        "about": f"{BASE_URL}/",
        "updates": f"{BASE_URL}/",
        "uses": f"{BASE_URL}/uses",
    }
    url = url_map.get(namespace, BASE_URL)

    chunks = []

    if namespace == "cv" and "sections" in data:
        for section_key, section_data in data["sections"].items():
            text = flatten_json_section(section_data)
            if not text.strip():
                continue
            title_val = (
                section_data.get("title", section_key.capitalize())
                if isinstance(section_data, dict)
                else section_key.capitalize()
            )
            snippet = text[:150].replace("\n", " ") + "..."
            chunks.append(
                {
                    "id": f"locale-{namespace}-{section_key}-{locale}-0",
                    "text": f"CV Section: {title_val}\n\n{text}",
                    "nodeType": "section",
                    "title": f"CV - {title_val}",
                    "snippet": snippet,
                    "sourceType": "locale",
                    "sourceSlug": f"{namespace}-{section_key}",
                    "locale": locale,
                    "url": url,
                    "date": None,
                    "tags": ["cv", section_key],
                    "heading": title_val,
                    "parentId": None,
                    "mediaSource": None,
                }
            )
    elif namespace == "about":
        text_parts = []
        for key in ["bio1", "bio2", "bio3"]:
            if key in data:
                text_parts.append(data[key])
        if "roles" in data:
            for role_key, role_data in data["roles"].items():
                if isinstance(role_data, dict):
                    text_parts.append(
                        f"{role_data.get('title', '')}: {role_data.get('description', '')}"
                    )
        text = "\n\n".join(text_parts)
        if text.strip():
            chunks.append(
                {
                    "id": f"locale-{namespace}-{locale}-0",
                    "text": f"About Harry Chang\n\n{text}",
                    "nodeType": "section",
                    "title": "About",
                    "snippet": text[:150].replace("\n", " ") + "...",
                    "sourceType": "locale",
                    "sourceSlug": namespace,
                    "locale": locale,
                    "url": url,
                    "date": None,
                    "tags": ["about"],
                    "heading": None,
                    "parentId": None,
                    "mediaSource": None,
                }
            )
    elif namespace == "updates":
        entries = data.get("entries", [])
        if entries:
            text_parts = []
            for entry in entries[:20]:
                if isinstance(entry, dict):
                    entry_text = re.sub(r"<[^>]+>", "", entry.get("text", ""))
                    text_parts.append(
                        f"{entry.get('date', '')}: {entry_text}"
                    )
            text = "\n".join(text_parts)
            if text.strip():
                chunks.append(
                    {
                        "id": f"locale-{namespace}-{locale}-0",
                        "text": f"Recent Updates\n\n{text}",
                        "nodeType": "section",
                        "title": "Updates",
                        "snippet": text[:150].replace("\n", " ") + "...",
                        "sourceType": "locale",
                        "sourceSlug": namespace,
                        "locale": locale,
                        "url": url,
                        "date": None,
                        "tags": ["updates"],
                        "heading": None,
                        "parentId": None,
                        "mediaSource": None,
                    }
                )
    elif namespace == "uses":
        text = flatten_json_section(data)
        if text.strip():
            chunks.append(
                {
                    "id": f"locale-{namespace}-{locale}-0",
                    "text": f"Uses / Setup\n\n{text}",
                    "nodeType": "section",
                    "title": "Uses",
                    "snippet": text[:150].replace("\n", " ") + "...",
                    "sourceType": "locale",
                    "sourceSlug": namespace,
                    "locale": locale,
                    "url": url,
                    "date": None,
                    "tags": ["uses", "setup"],
                    "heading": None,
                    "parentId": None,
                    "mediaSource": None,
                }
            )

    return chunks


def build_tag_nodes(all_file_nodes: list[dict]) -> tuple[list[dict], list[dict]]:
    """Build tag nodes and tag edges from file nodes.
    Returns (tag_nodes, tag_edges)."""
    tag_to_files = {}
    for node in all_file_nodes:
        for tag in (node.get("tags") or []):
            tag_str = str(tag).strip()
            if not tag_str:
                continue
            key = slugify_tag(tag_str)
            if key not in tag_to_files:
                tag_to_files[key] = {"label": tag_str, "file_ids": []}
            tag_to_files[key]["file_ids"].append(node["id"])

    tag_nodes = []
    tag_edges = []

    for key, info in tag_to_files.items():
        tag_id = f"tag-{key}"
        tag_nodes.append({
            "id": tag_id,
            "nodeType": "tag",
            "title": info["label"],
            "snippet": f"{len(info['file_ids'])} documents",
            "sourceType": "locale",  # neutral color
            "sourceSlug": key,
            "locale": "en",
            "url": "",
            "date": None,
            "tags": [],
            "heading": None,
            "imageUrl": None,
            "parentId": None,
            "mediaSource": None,
        })
        for file_id in info["file_ids"]:
            tag_edges.append({
                "source": tag_id,
                "target": file_id,
                "weight": 0.6,
                "linkType": "tag",
            })

    return tag_nodes, tag_edges


# ─── Embeddings ──────────────────────────────────────────────────────────────


def load_cache() -> dict:
    """Load embedding cache from disk."""
    if CACHE_PATH.exists():
        try:
            return json.loads(CACHE_PATH.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, IOError):
            pass
    return {}


def save_cache(cache: dict):
    """Save embedding cache to disk."""
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    CACHE_PATH.write_text(json.dumps(cache), encoding="utf-8")


def compute_embeddings(chunks: list[dict], cache: dict) -> np.ndarray:
    """Compute embeddings for chunks that have a 'text' field."""
    import torch
    from sentence_transformers import SentenceTransformer

    # Determine device
    if torch.backends.mps.is_available():
        device = "mps"
    elif torch.cuda.is_available():
        device = "cuda"
    else:
        device = "cpu"
    print(f"  Using device: {device}")

    # Check cache hits
    texts = [c["text"] for c in chunks]
    hashes = [sha256(t) for t in texts]

    uncached_indices = []
    for i, h in enumerate(hashes):
        if h not in cache:
            uncached_indices.append(i)

    if uncached_indices:
        print(
            f"  Computing embeddings for {len(uncached_indices)} new chunks "
            f"({len(chunks) - len(uncached_indices)} cached)"
        )
        model = SentenceTransformer(EMBEDDING_MODEL, device=device)

        uncached_texts = [texts[i] for i in uncached_indices]
        embeddings = model.encode(
            uncached_texts,
            batch_size=32,
            show_progress_bar=True,
            normalize_embeddings=True,
        )

        for idx, emb in zip(uncached_indices, embeddings):
            cache[hashes[idx]] = emb.tolist()

        save_cache(cache)
        print("  Embeddings cached")
    else:
        print(f"  All {len(chunks)} chunks found in cache")

    all_embeddings = np.array([cache[h] for h in hashes], dtype=np.float32)
    return all_embeddings


# ─── Multimodal embeddings (OpenRouter) ─────────────────────────────────────


def load_multimodal_cache() -> dict:
    if MULTIMODAL_CACHE_PATH.exists():
        try:
            return json.loads(MULTIMODAL_CACHE_PATH.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, IOError):
            pass
    return {}


def save_multimodal_cache(cache: dict):
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    MULTIMODAL_CACHE_PATH.write_text(json.dumps(cache), encoding="utf-8")


_MIME_BY_EXT = {
    ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
    ".webp": "image/webp", ".gif": "image/gif", ".avif": "image/avif",
    ".svg": "image/svg+xml",
}


def resolve_local_image(media: str) -> tuple[bytes, str] | None:
    """Resolve a markdown image path to (bytes, mime). Returns None if remote/missing."""
    if not media or media.startswith(("http://", "https://", "data:")):
        return None
    rel = media.lstrip("/")
    candidate = PUBLIC_DIR / rel
    if not candidate.exists():
        return None
    mime = _MIME_BY_EXT.get(candidate.suffix.lower())
    if not mime or mime == "image/svg+xml":
        return None
    return candidate.read_bytes(), mime


async def _embed_one(
    session,
    api_key: str,
    payload_input,
    dim: int,
    semaphore,
    label: str = "",
    max_retries: int = 4,
) -> list[float] | None:
    """Embed a single input (string or content-array dict). Bounded by semaphore. Retries on 429/5xx."""
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    body = {
        "model": MULTIMODAL_MODEL,
        "input": [payload_input],
        "encoding_format": "float",
        "dimensions": dim,
    }
    async with semaphore:
        for attempt in range(max_retries):
            try:
                async with session.post(MULTIMODAL_API_URL, headers=headers, json=body) as resp:
                    if resp.status == 429:
                        wait = int(resp.headers.get("Retry-After", 2 ** (attempt + 1)))
                        print(f"    rate-limited ({label}), waiting {wait}s")
                        await asyncio.sleep(wait)
                        continue
                    if resp.status >= 500:
                        await asyncio.sleep(2 ** attempt)
                        continue
                    resp.raise_for_status()
                    data = await resp.json()
                    return data["data"][0]["embedding"]
            except Exception as e:
                if attempt < max_retries - 1:
                    await asyncio.sleep(2 ** attempt)
                else:
                    print(f"    failed ({label}): {e}")
        return None


async def _embed_job(session, api_key, key, payload, label, dim, semaphore):
    """Wrapper that returns (key, embedding) so as_completed preserves identity."""
    emb = await _embed_one(session, api_key, payload, dim, semaphore, label)
    return key, emb


async def _run_embeddings(
    api_key: str,
    jobs: list[tuple[str, object, str]],
    cache: dict,
    concurrency: int,
    dim: int,
    progress_label: str,
):
    if not jobs:
        return
    import aiohttp
    sem = asyncio.Semaphore(concurrency)
    timeout = aiohttp.ClientTimeout(total=180)
    save_every = max(10, concurrency)
    completed = 0

    async with aiohttp.ClientSession(timeout=timeout) as session:
        coros = [_embed_job(session, api_key, k, p, lbl, dim, sem) for k, p, lbl in jobs]
        for fut in asyncio.as_completed(coros):
            key, emb = await fut
            completed += 1
            if emb is not None:
                cache[key] = emb
            if completed % save_every == 0 or completed == len(jobs):
                save_multimodal_cache(cache)
                print(f"    {progress_label} {completed}/{len(jobs)}")


async def compute_multimodal_embeddings_async(
    text_chunks: list[dict],
    image_chunks: list[dict],
    cache: dict,
    concurrency: int,
    dim: int = MULTIMODAL_DIM,
) -> tuple[np.ndarray, list[dict], np.ndarray]:
    """Embed text + resolvable images via OpenRouter Gemini Embedding 2 concurrently.
    Returns (text_embeddings, embeddable_image_chunks, image_embeddings)."""
    api_key = os.environ["OPENROUTER_API_KEY"]

    # --- Text jobs ---
    text_keys, text_jobs = [], []
    for c in text_chunks:
        prefixed = f"title: {c.get('title', '')} | text: {c['text']}"
        key = f"text:{dim}:{sha256(prefixed)}"
        text_keys.append(key)
        if key not in cache:
            text_jobs.append((key, prefixed, c.get("id", "")))

    cached_text = len(text_keys) - len(text_jobs)
    if text_jobs:
        print(f"  Embedding {len(text_jobs)} text chunks via OpenRouter ({cached_text} cached, concurrency={concurrency})")
        await _run_embeddings(api_key, text_jobs, cache, concurrency, dim, "text")
    else:
        print(f"  All {len(text_keys)} text chunks found in cache")

    # --- Image jobs ---
    embeddable_imgs, img_keys, img_jobs = [], [], []
    for c in image_chunks:
        media = c.get("mediaSource") or c.get("imageUrl")
        resolved = resolve_local_image(media) if media else None
        if not resolved:
            continue
        img_bytes, mime = resolved
        key = f"image:{dim}:{hashlib.sha256(img_bytes).hexdigest()}"
        embeddable_imgs.append(c)
        img_keys.append(key)
        if key not in cache:
            data_uri = f"data:{mime};base64,{base64.b64encode(img_bytes).decode('ascii')}"
            payload = {"content": [{"type": "image_url", "image_url": {"url": data_uri}}]}
            img_jobs.append((key, payload, c.get("id", "")))

    cached_img = len(img_keys) - len(img_jobs)
    if img_jobs:
        print(f"  Embedding {len(img_jobs)} images via OpenRouter ({cached_img} cached, concurrency={concurrency})")
        await _run_embeddings(api_key, img_jobs, cache, concurrency, dim, "image")
    elif embeddable_imgs:
        print(f"  All {len(img_keys)} images found in cache")
    else:
        print("  No locally-resolvable images to embed")

    save_multimodal_cache(cache)

    # Drop entries whose embedding never landed in cache (persistent failures).
    text_embeddings = np.array(
        [cache[k] for k in text_keys if k in cache], dtype=np.float32
    )
    if len(text_embeddings) != len(text_keys):
        missing = len(text_keys) - len(text_embeddings)
        sys.exit(f"ERROR: {missing} text embeddings failed and were not cached. Re-run to retry.")

    final_imgs, final_keys = [], []
    for c, k in zip(embeddable_imgs, img_keys):
        if k in cache:
            final_imgs.append(c)
            final_keys.append(k)

    img_embeddings = (
        np.array([cache[k] for k in final_keys], dtype=np.float32)
        if final_keys
        else np.zeros((0, dim), dtype=np.float32)
    )
    dropped = len(embeddable_imgs) - len(final_imgs)
    if dropped:
        print(f"  Warning: {dropped} image embeddings failed and were dropped from the graph")
    return text_embeddings, final_imgs, img_embeddings


# ─── Similarity ──────────────────────────────────────────────────────────────


def compute_edges(
    embeddings: np.ndarray,
    chunks: list[dict],
    threshold: float,
    max_edges: int,
) -> list[dict]:
    """Compute semantic similarity edges between embeddable chunks."""
    n = len(chunks)
    print(f"  Computing {n * (n - 1) // 2} pairwise similarities...")

    sim_matrix = embeddings @ embeddings.T

    pairs = []
    for i in range(n):
        for j in range(i + 1, n):
            s = float(sim_matrix[i, j])
            if s >= threshold:
                pairs.append((i, j, s))

    pairs.sort(key=lambda x: -x[2])

    node_edge_counts = {i: 0 for i in range(n)}
    edges = []

    for i, j, s in pairs:
        if node_edge_counts[i] < max_edges and node_edge_counts[j] < max_edges:
            edges.append(
                {
                    "source": chunks[i]["id"],
                    "target": chunks[j]["id"],
                    "weight": round(s, 4),
                    "linkType": "semantic",
                }
            )
            node_edge_counts[i] += 1
            node_edge_counts[j] += 1

    return edges


# ─── Optional LLM descriptions ──────────────────────────────────────────────


def generate_descriptions(chunks: list[dict]):
    """Generate LLM descriptions via OpenRouter if API key is set."""
    import requests as req

    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        print("  No OPENROUTER_API_KEY set, skipping LLM descriptions")
        return

    desc_cache_path = CACHE_DIR / "graph-descriptions-cache.json"
    desc_cache = {}
    if desc_cache_path.exists():
        try:
            desc_cache = json.loads(desc_cache_path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, IOError):
            pass

    # Only generate descriptions for chunks that have text AND no TL;DR from section-summaries.json
    embeddable = [c for c in chunks if "text" in c and not c.get("tldr")]
    skipped_tldr = sum(1 for c in chunks if "text" in c and c.get("tldr"))
    if skipped_tldr:
        print(f"  Skipping {skipped_tldr} chunks with TL;DR from section-summaries.json")
    uncached = [c for c in embeddable if sha256(c["text"]) not in desc_cache]
    if not embeddable:
        print("  All chunks covered by TL;DRs — nothing to generate")
        return
    if not uncached:
        print(f"  All {len(embeddable)} descriptions found in cache")
    else:
        print(f"  Generating descriptions for {len(uncached)} chunks via OpenRouter...")

    models = [
        "google/gemini-3-flash-preview"
    ]

    for i, chunk in enumerate(uncached):
        text_hash = sha256(chunk["text"])
        prompt_text = chunk["text"][:1000]

        for model in models:
            try:
                resp = req.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": model,
                        "messages": [
                            {
                                "role": "user",
                                "content": (
                                    "Summarize this content chunk in 1-2 concise sentences "
                                    "for a knowledge graph tooltip. Keep the same language as "
                                    "the input (English or Chinese). Be specific and informative.\n\n"
                                    f"{prompt_text}"
                                ),
                            }
                        ],
                        "max_tokens": 120,
                    },
                    timeout=30,
                )
                resp.raise_for_status()
                data = resp.json()
                description = (
                    data.get("choices", [{}])[0]
                    .get("message", {})
                    .get("content", "")
                    .strip()
                )
                if description:
                    desc_cache[text_hash] = description
                    break
            except Exception as e:
                print(f"    Warning: {model} failed for chunk {i}: {e}")
                continue

        time.sleep(0.15)

        if (i + 1) % 20 == 0:
            print(f"    {i + 1}/{len(uncached)} done")
            desc_cache_path.write_text(json.dumps(desc_cache, ensure_ascii=False), encoding="utf-8")

    desc_cache_path.write_text(json.dumps(desc_cache, ensure_ascii=False), encoding="utf-8")

    applied = 0
    for chunk in chunks:
        if "text" in chunk:
            text_hash = sha256(chunk["text"])
            if text_hash in desc_cache:
                chunk["description"] = desc_cache[text_hash]
                applied += 1

    print(f"  Applied {applied}/{len(embeddable)} descriptions")


# ─── Main ────────────────────────────────────────────────────────────────────


def main():
    parser = argparse.ArgumentParser(description="Build knowledge graph data")
    parser.add_argument(
        "--threshold", type=float, default=0.75, help="Cosine similarity threshold"
    )
    parser.add_argument(
        "--max-edges", type=int, default=8, help="Max edges per node (k-NN cap)"
    )
    parser.add_argument(
        "--no-llm", action="store_true", help="Skip LLM description generation"
    )
    parser.add_argument(
        "--no-multimodal",
        action="store_true",
        help="Force local sentence-transformers even when OPENROUTER_API_KEY is set (text-only)",
    )
    parser.add_argument(
        "--concurrency",
        type=int,
        default=DEFAULT_CONCURRENCY,
        help=f"Max concurrent OpenRouter embedding requests (default {DEFAULT_CONCURRENCY})",
    )
    args = parser.parse_args()

    start_time = time.time()
    print("=== Knowledge Graph Build ===\n")

    # Step 1: Collect content
    print("[1/6] Collecting content...")
    md_items = collect_markdown_files()
    locale_items = collect_locale_files()
    print(
        f"  Found {len(md_items)} markdown files, {len(locale_items)} locale files"
    )

    # Step 2: Chunk content into hierarchy
    print("\n[2/6] Chunking content into hierarchy...")
    all_file_nodes = []
    all_section_nodes = []
    all_image_nodes = []
    all_video_nodes = []
    all_structural_edges = []

    for item in md_items:
        result = chunk_markdown(item)
        all_file_nodes.append(result["file_node"])
        all_section_nodes.extend(result["section_nodes"])
        all_image_nodes.extend(result["image_nodes"])
        all_video_nodes.extend(result["video_nodes"])
        all_structural_edges.extend(result["structural_edges"])

    # Locale chunks (flat, no hierarchy)
    locale_chunks = []
    for item in locale_items:
        locale_chunks.extend(chunk_locale(item))

    print(f"  File nodes: {len(all_file_nodes)}")
    print(f"  Section nodes: {len(all_section_nodes)} (+{len(locale_chunks)} locale)")
    print(f"  Image nodes: {len(all_image_nodes)}")
    print(f"  Video nodes: {len(all_video_nodes)}")
    print(f"  Structural edges: {len(all_structural_edges)}")

    # Step 3: Build tag nodes
    print("\n[3/6] Building tag nodes...")
    tag_nodes, tag_edges = build_tag_nodes(all_file_nodes)
    print(f"  Tag nodes: {len(tag_nodes)}")
    print(f"  Tag edges: {len(tag_edges)}")

    # Step 3.5: Build hub (category) nodes
    print("\n[3.5/7] Building hub nodes...")

    # Load common.json translations for hub titles
    _hub_translations: dict[str, dict[str, str]] = {}
    for _loc in ("en", "zh-TW"):
        _common_path = LOCALES_DIR / _loc / "common.json"
        if _common_path.exists():
            with open(_common_path, "r", encoding="utf-8") as f:
                _common = json.load(f)
            _header = _common.get("header", {})
            _hub_translations[_loc] = {
                "post": _header.get("blog", "Blog"),
                "project": _header.get("projects", "Projects"),
                "gallery": _header.get("gallery", "Gallery"),
                "about": _header.get("about", "About"),
                "updates": _header.get("updates", "Updates"),
                "uses": _header.get("uses", "Setup"),
                "cv": _header.get("cv", "Resume"),
                "linktree": _header.get("links", "Linktree"),
                "reading": _common.get("readingList", {}).get("title", "Reading List")
                    if isinstance(_common.get("readingList"), dict)
                    else "Reading List",
                "design": _header.get("design", "Design System"),
                "privacy": _header.get("privacy", "Privacy"),
                "root": "首頁" if _loc == "zh-TW" else "Home",
            }
        else:
            _hub_translations[_loc] = {}

    def _hub_title(key: str, locale: str) -> str:
        return _hub_translations.get(locale, {}).get(key, key.capitalize())

    # --- Content-type hubs (Blog, Projects, Gallery) ---
    CONTENT_HUB_URL = {
        "post": f"{BASE_URL}/blog",
        "project": f"{BASE_URL}/projects",
        "gallery": f"{BASE_URL}/gallery",
    }
    hub_nodes = []
    hub_edges = []

    content_hub_ids = {}  # (source_type, locale) -> hub_id
    for source_type in CONTENT_DIRS:
        for locale in ("en", "zh-TW"):
            hub_id = f"hub-{source_type}-{locale}"
            title = _hub_title(source_type, locale)
            content_hub_ids[(source_type, locale)] = hub_id
            hub_nodes.append({
                "id": hub_id,
                "nodeType": "hub",
                "title": title,
                "snippet": title,
                "sourceType": source_type,
                "sourceSlug": source_type,
                "locale": locale,
                "url": CONTENT_HUB_URL[source_type],
                "date": None,
                "tags": [],
                "heading": None,
                "imageUrl": None,
                "parentId": None,
                "mediaSource": None,
            })
            # Link hub -> file nodes of this type+locale
            for fnode in all_file_nodes:
                if fnode["sourceType"] == source_type and fnode["locale"] == locale:
                    hub_edges.append({
                        "source": hub_id,
                        "target": fnode["id"],
                        "weight": 1.0,
                        "linkType": "structural",
                    })
                    fnode["parentId"] = hub_id

    # --- Locale-based hubs (About, Updates, Uses/Setup, CV/Resume) ---
    LOCALE_HUBS = [
        {"key": "about",   "url": f"{BASE_URL}/",             "id_prefix": "locale-about"},
        {"key": "updates", "url": f"{BASE_URL}/",             "id_prefix": "locale-updates"},
        {"key": "uses",    "url": f"{BASE_URL}/uses",         "id_prefix": "locale-uses"},
        {"key": "cv",      "url": f"{BASE_URL}/cv",           "id_prefix": "locale-cv"},
    ]

    locale_hub_ids = {}  # (key, locale) -> hub_id
    for hub_def in LOCALE_HUBS:
        for locale in ("en", "zh-TW"):
            hub_id = f"hub-{hub_def['key']}-{locale}"
            title = _hub_title(hub_def["key"], locale)
            locale_hub_ids[(hub_def["key"], locale)] = hub_id
            hub_nodes.append({
                "id": hub_id,
                "nodeType": "hub",
                "title": title,
                "snippet": title,
                "sourceType": "locale",
                "sourceSlug": hub_def["key"],
                "locale": locale,
                "url": hub_def["url"],
                "date": None,
                "tags": [],
                "heading": None,
                "imageUrl": None,
                "parentId": None,
                "mediaSource": None,
            })
            # Link hub -> matching locale section nodes
            for lnode in locale_chunks:
                if lnode["locale"] == locale and lnode["id"].startswith(hub_def["id_prefix"]):
                    hub_edges.append({
                        "source": hub_id,
                        "target": lnode["id"],
                        "weight": 1.0,
                        "linkType": "structural",
                    })
                    lnode["parentId"] = hub_id

    # --- Reading List hub (no existing locale nodes, standalone) ---
    for locale in ("en", "zh-TW"):
        hub_id = f"hub-reading-{locale}"
        title = _hub_title("reading", locale)
        hub_nodes.append({
            "id": hub_id,
            "nodeType": "hub",
            "title": title,
            "snippet": title,
            "sourceType": "locale",
            "sourceSlug": "reading",
            "locale": locale,
            "url": f"{BASE_URL}/paper-reading",
            "date": None,
            "tags": [],
            "heading": None,
            "imageUrl": None,
            "parentId": None,
            "mediaSource": None,
        })

    # --- Design System hub (no existing locale nodes, standalone) ---
    for locale in ("en", "zh-TW"):
        hub_id = f"hub-design-{locale}"
        title = _hub_title("design", locale)
        hub_nodes.append({
            "id": hub_id,
            "nodeType": "hub",
            "title": title,
            "snippet": title,
            "sourceType": "locale",
            "sourceSlug": "design",
            "locale": locale,
            "url": f"{BASE_URL}/design",
            "date": None,
            "tags": [],
            "heading": None,
            "imageUrl": None,
            "parentId": None,
            "mediaSource": None,
        })

    # --- Privacy hub (no existing locale nodes, standalone) ---
    for locale in ("en", "zh-TW"):
        hub_id = f"hub-privacy-{locale}"
        title = _hub_title("privacy", locale)
        hub_nodes.append({
            "id": hub_id,
            "nodeType": "hub",
            "title": title,
            "snippet": title,
            "sourceType": "locale",
            "sourceSlug": "privacy",
            "locale": locale,
            "url": f"{BASE_URL}/privacy",
            "date": None,
            "tags": [],
            "heading": None,
            "imageUrl": None,
            "parentId": None,
            "mediaSource": None,
        })



    # --- Linktree hub + social link nodes ---
    SOCIAL_LINKS = [
        {"id": "email",      "title": "Email",              "url": f"{BASE_URL}/email"},
        {"id": "discord",    "title": "Discord",            "url": f"{BASE_URL}/discord"},
        {"id": "linkedin",   "title": "LinkedIn",           "url": f"{BASE_URL}/linkedin"},
        {"id": "github",     "title": "GitHub",             "url": f"{BASE_URL}/github"},
        {"id": "instagram",  "title": "Instagram",          "url": f"{BASE_URL}/instagram"},
        {"id": "medium",     "title": "Medium",             "url": f"{BASE_URL}/medium"},
        {"id": "calendar",   "title": "Schedule a Meeting", "url": f"{BASE_URL}/cal"},
        {"id": "spotify",    "title": "Spotify",            "url": f"{BASE_URL}/spotify"},
        {"id": "letterboxd", "title": "Letterboxd",         "url": f"{BASE_URL}/letterboxd"},
    ]

    social_link_nodes = []
    for locale in ("en", "zh-TW"):
        linktree_hub_id = f"hub-linktree-{locale}"
        title = _hub_title("linktree", locale)
        hub_nodes.append({
            "id": linktree_hub_id,
            "nodeType": "hub",
            "title": title,
            "snippet": title,
            "sourceType": "locale",
            "sourceSlug": "linktree",
            "locale": locale,
            "url": f"{BASE_URL}/linktree",
            "date": None,
            "tags": [],
            "heading": None,
            "imageUrl": None,
            "parentId": None,
            "mediaSource": None,
        })
        for link in SOCIAL_LINKS:
            link_node_id = f"social-{link['id']}-{locale}"
            social_link_nodes.append({
                "id": link_node_id,
                "nodeType": "section",
                "title": link["title"],
                "snippet": link["title"],
                "sourceType": "locale",
                "sourceSlug": f"social-{link['id']}",
                "locale": locale,
                "url": link["url"],
                "date": None,
                "tags": [],
                "heading": None,
                "imageUrl": None,
                "parentId": linktree_hub_id,
                "mediaSource": None,
            })
            hub_edges.append({
                "source": linktree_hub_id,
                "target": link_node_id,
                "weight": 1.0,
                "linkType": "structural",
            })

    # --- Root hub: connects to all other hubs ---
    for locale in ("en", "zh-TW"):
        root_id = f"hub-root-{locale}"
        title = _hub_title("root", locale)
        hub_nodes.append({
            "id": root_id,
            "nodeType": "hub",
            "title": title,
            "snippet": "harrychang.me",
            "sourceType": "locale",
            "sourceSlug": "root",
            "locale": locale,
            "url": f"{BASE_URL}/",
            "date": None,
            "tags": [],
            "heading": None,
            "imageUrl": None,
            "parentId": None,
            "mediaSource": None,
        })
        # Connect root to all other hubs of this locale
        for hnode in hub_nodes:
            if hnode["locale"] == locale and hnode["id"] != root_id:
                hub_edges.append({
                    "source": root_id,
                    "target": hnode["id"],
                    "weight": 1.0,
                    "linkType": "structural",
                })
                hnode["parentId"] = root_id

    all_structural_edges.extend(hub_edges)
    print(f"  Hub nodes: {len(hub_nodes)}")
    print(f"  Hub edges: {len(hub_edges)}")
    print(f"  Social link nodes: {len(social_link_nodes)}")

    # Step 4: Generate embeddings — Gemini Embedding 2 (multimodal) is the default
    text_chunks = all_file_nodes + all_section_nodes + locale_chunks

    if args.no_multimodal:
        print("\n[4/7] Generating embeddings (local sentence-transformers, text-only)...")
        embeddable_chunks = text_chunks
        cache = load_cache()
        embeddings = compute_embeddings(embeddable_chunks, cache)
        active_model = EMBEDDING_MODEL
    else:
        if not os.environ.get("OPENROUTER_API_KEY"):
            sys.exit("ERROR: OPENROUTER_API_KEY not set. Export it, or pass --no-multimodal to use the local text-only model.")
        print(f"\n[4/7] Generating multimodal embeddings via {MULTIMODAL_MODEL} (dim={MULTIMODAL_DIM})...")
        mm_cache = load_multimodal_cache()
        text_embeddings, embedded_image_chunks, image_embeddings = asyncio.run(
            compute_multimodal_embeddings_async(
                text_chunks, all_image_nodes, mm_cache,
                concurrency=args.concurrency, dim=MULTIMODAL_DIM,
            )
        )
        embeddable_chunks = text_chunks + embedded_image_chunks
        embeddings = np.vstack([text_embeddings, image_embeddings]) if image_embeddings.size else text_embeddings
        active_model = MULTIMODAL_MODEL
        print(f"  Embedded {len(text_chunks)} text + {len(embedded_image_chunks)} image nodes")

    # Step 5: Compute semantic similarity edges
    print(f"\n[5/7] Computing semantic edges (threshold={args.threshold}, max_edges={args.max_edges})...")
    semantic_edges = compute_edges(embeddings, embeddable_chunks, args.threshold, args.max_edges)
    print(f"  Semantic edges: {len(semantic_edges)}")

    all_chunks = all_file_nodes + all_section_nodes + locale_chunks + all_image_nodes + all_video_nodes + tag_nodes + hub_nodes + social_link_nodes

    # Step 6: Apply TL;DRs from section-summaries.json (authoritative source for tooltips)
    print("\n[6/7] Applying TL;DRs from section-summaries.json...")
    tldr_applied = 0
    if SUMMARIES_PATH.exists():
        try:
            summaries = json.loads(SUMMARIES_PATH.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, IOError):
            summaries = {}

        for chunk in all_chunks:
            source_type = chunk.get("sourceType", "")
            slug = chunk.get("sourceSlug", "")
            locale = chunk.get("locale", "en")
            node_type = chunk.get("nodeType", "")
            file_key = f"{source_type}/{slug}/{locale}"

            if file_key not in summaries:
                continue

            entry = summaries[file_key]

            if node_type in ("file", "hub") and entry.get("tldr"):
                chunk["tldr"] = entry["tldr"]
                tldr_applied += 1
            elif node_type == "section":
                heading = chunk.get("heading")
                if heading and heading in entry.get("sections", {}):
                    chunk["tldr"] = entry["sections"][heading]
                    tldr_applied += 1
                elif entry.get("tldr"):
                    # Locale/single-section nodes: use file-level tldr
                    chunk["tldr"] = entry["tldr"]
                    tldr_applied += 1
    print(f"  Applied {tldr_applied} TL;DRs")

    # Step 6.5: LLM descriptions for chunks NOT covered by section-summaries.json
    print("\n[6.5/7] LLM descriptions (residual only)...")
    if not args.no_llm:
        generate_descriptions(all_chunks)
    else:
        print("  Skipped (--no-llm)")

    # Combine all edges
    all_edges = all_structural_edges + tag_edges + semantic_edges

    # Build output - strip embedding text from nodes
    nodes = []
    node_type_counts = {"hub": 0, "file": 0, "section": 0, "image": 0, "video": 0, "tag": 0}
    for chunk in all_chunks:
        node = {
            "id": chunk["id"],
            "title": chunk["title"],
            "snippet": chunk["snippet"],
            "nodeType": chunk["nodeType"],
            "sourceType": chunk["sourceType"],
            "sourceSlug": chunk["sourceSlug"],
            "locale": chunk["locale"],
            "url": chunk["url"],
            "date": chunk["date"],
            "tags": chunk.get("tags", []),
            "heading": chunk.get("heading"),
            "parentId": chunk.get("parentId"),
        }
        if "description" in chunk:
            node["description"] = chunk["description"]
        if "tldr" in chunk:
            node["tldr"] = chunk["tldr"]
        if chunk.get("imageUrl"):
            node["imageUrl"] = chunk["imageUrl"]
        if chunk.get("mediaSource"):
            node["mediaSource"] = chunk["mediaSource"]
        if chunk.get("anchorId"):
            node["anchorId"] = chunk["anchorId"]
        nodes.append(node)
        node_type_counts[chunk["nodeType"]] += 1

    output = {
        "nodes": nodes,
        "edges": all_edges,
        "metadata": {
            "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "nodeCount": len(nodes),
            "edgeCount": len(all_edges),
            "threshold": args.threshold,
            "maxEdgesPerNode": args.max_edges,
            "model": active_model,
            "nodeTypeCounts": node_type_counts,
        },
    }

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(
        json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    elapsed = time.time() - start_time
    print(f"\n=== Done in {elapsed:.1f}s ===")
    print(f"  Nodes: {len(nodes)} ({', '.join(f'{k}={v}' for k, v in node_type_counts.items())})")
    print(f"  Edges: {len(all_edges)} (structural={len(all_structural_edges)}, tag={len(tag_edges)}, semantic={len(semantic_edges)})")
    print(f"  Output: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()

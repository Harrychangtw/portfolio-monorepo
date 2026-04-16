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
CACHE_PATH = CACHE_DIR / "graph-embeddings-cache.json"

EMBEDDING_MODEL = "BAAI/bge-large-zh-v1.5"
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
            })
            structural_edges.append(
                {"source": sec_id, "target": vid_id, "weight": 0.8, "linkType": "structural"}
            )
    else:
        for i, section in enumerate(sections):
            # Extract heading if present
            heading_match = re.match(r"^##\s+(.+?)(?:\n|$)", section)
            heading = heading_match.group(1).strip() if heading_match else None
            section_body = (
                re.sub(r"^##\s+.+?\n?", "", section).strip() if heading else section
            )

            sec_id = f"{source_type}-{slug}-{locale}-sec-{i}"
            text = f"{context_prefix}\n\nSection: {heading or 'Introduction'}\n\n{section_body}"
            snippet = (
                (section_body[:150] + "...")
                if len(section_body) > 150
                else section_body
            )

            section_nodes.append(
                {
                    "id": sec_id,
                    "text": text,
                    "nodeType": "section",
                    "title": f"{title}" if not heading else f"{title} - {heading}",
                    "snippet": snippet.replace("\n", " ").strip(),
                    "sourceType": source_type,
                    "sourceSlug": slug,
                    "locale": locale,
                    "url": url,
                    "date": str(date) if date else None,
                    "tags": [str(t) for t in tags],
                    "heading": heading,
                    "imageUrl": image_url if image_url else None,
                    "parentId": file_id,
                    "mediaSource": None,
                }
            )
            structural_edges.append(
                {"source": file_id, "target": sec_id, "weight": 1.0, "linkType": "structural"}
            )

            # Extract media from this section
            images, videos = extract_media_from_text(section)
            for j, img in enumerate(images):
                img_id = f"{source_type}-{slug}-{locale}-sec-{i}-img-{j}"
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
                    "heading": heading,
                    "imageUrl": img["url"],
                    "parentId": sec_id,
                    "mediaSource": img["url"],
                })
                structural_edges.append(
                    {"source": sec_id, "target": img_id, "weight": 0.8, "linkType": "structural"}
                )
            for j, vid in enumerate(videos):
                vid_id = f"{source_type}-{slug}-{locale}-sec-{i}-vid-{j}"
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
                    "heading": heading,
                    "imageUrl": None,
                    "parentId": sec_id,
                    "mediaSource": vid["url"],
                })
                structural_edges.append(
                    {"source": sec_id, "target": vid_id, "weight": 0.8, "linkType": "structural"}
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


def generate_descriptions(chunks: list[dict], cache: dict):
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

    # Only generate descriptions for file and section nodes that have text
    embeddable = [c for c in chunks if "text" in c]
    uncached = [c for c in embeddable if sha256(c["text"]) not in desc_cache]
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
        "--threshold", type=float, default=0.72, help="Cosine similarity threshold"
    )
    parser.add_argument(
        "--max-edges", type=int, default=8, help="Max edges per node (k-NN cap)"
    )
    parser.add_argument(
        "--no-llm", action="store_true", help="Skip LLM description generation"
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
    HUB_URL_MAP = {
        "post": f"{BASE_URL}/blog",
        "project": f"{BASE_URL}/projects",
        "gallery": f"{BASE_URL}/gallery",
    }
    HUB_TITLE_MAP = {"post": "Blog", "project": "Projects", "gallery": "Gallery"}

    hub_nodes = []
    hub_edges = []
    for source_type in CONTENT_DIRS:
        for locale in ("en", "zh-TW"):
            hub_id = f"hub-{source_type}-{locale}"
            hub_nodes.append({
                "id": hub_id,
                "nodeType": "hub",
                "title": HUB_TITLE_MAP[source_type],
                "snippet": f"All {HUB_TITLE_MAP[source_type].lower()} entries",
                "sourceType": source_type,
                "sourceSlug": source_type,
                "locale": locale,
                "url": HUB_URL_MAP[source_type],
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

    all_structural_edges.extend(hub_edges)
    print(f"  Hub nodes: {len(hub_nodes)}")
    print(f"  Hub edges: {len(hub_edges)}")

    # Step 4: Generate embeddings (only for file + section nodes)
    print("\n[4/7] Generating embeddings...")
    embeddable_chunks = all_file_nodes + all_section_nodes + locale_chunks
    cache = load_cache()
    embeddings = compute_embeddings(embeddable_chunks, cache)

    # Step 5: Compute semantic similarity edges
    print(f"\n[5/7] Computing semantic edges (threshold={args.threshold}, max_edges={args.max_edges})...")
    semantic_edges = compute_edges(embeddings, embeddable_chunks, args.threshold, args.max_edges)
    print(f"  Semantic edges: {len(semantic_edges)}")

    # Step 6: Optional LLM descriptions
    print("\n[6/7] LLM descriptions...")
    all_chunks = all_file_nodes + all_section_nodes + locale_chunks + all_image_nodes + all_video_nodes + tag_nodes + hub_nodes
    if not args.no_llm:
        generate_descriptions(all_chunks, cache)
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
        if chunk.get("imageUrl"):
            node["imageUrl"] = chunk["imageUrl"]
        if chunk.get("mediaSource"):
            node["mediaSource"] = chunk["mediaSource"]
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
            "model": EMBEDDING_MODEL,
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

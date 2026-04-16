#!/usr/bin/env python3
"""
Build script for the knowledge graph.
Reads all markdown content + locale JSONs, chunks them, generates embeddings
via sentence-transformers (MPS on Apple Silicon), computes similarity edges,
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


def chunk_markdown(item: dict) -> list[dict]:
    """Chunk a markdown item into graph nodes."""
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

    chunks = []

    # Split by H2 headings
    sections = re.split(r"\n(?=## )", body)
    sections = [s.strip() for s in sections if s.strip()]

    if len(sections) <= 1:
        # No H2 sections or just one - treat as single chunk
        text = f"{context_prefix}\n\n{body}" if body else context_prefix
        snippet = (body[:150] + "...") if len(body) > 150 else (body or description)
        chunks.append(
            {
                "id": f"{source_type}-{slug}-{locale}-0",
                "text": text,
                "title": title,
                "snippet": snippet.replace("\n", " ").strip(),
                "sourceType": source_type,
                "sourceSlug": slug,
                "locale": locale,
                "url": url,
                "date": str(date) if date else None,
                "tags": [str(t) for t in tags],
                "heading": None,
            }
        )
    else:
        for i, section in enumerate(sections):
            # Extract heading if present
            heading_match = re.match(r"^##\s+(.+?)(?:\n|$)", section)
            heading = heading_match.group(1).strip() if heading_match else None
            section_body = (
                re.sub(r"^##\s+.+?\n?", "", section).strip() if heading else section
            )

            text = f"{context_prefix}\n\nSection: {heading or 'Introduction'}\n\n{section_body}"
            snippet = (
                (section_body[:150] + "...")
                if len(section_body) > 150
                else section_body
            )

            chunks.append(
                {
                    "id": f"{source_type}-{slug}-{locale}-{i}",
                    "text": text,
                    "title": f"{title}" if not heading else f"{title} - {heading}",
                    "snippet": snippet.replace("\n", " ").strip(),
                    "sourceType": source_type,
                    "sourceSlug": slug,
                    "locale": locale,
                    "url": url,
                    "date": str(date) if date else None,
                    "tags": [str(t) for t in tags],
                    "heading": heading,
                }
            )

    return chunks


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
    """Chunk a locale JSON file into graph nodes."""
    namespace = item["namespace"]
    locale = item["locale"]
    data = item["data"]

    # Skip common.json utility strings (header labels, button text, etc.)
    # Only include substantive content
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
        # CV: each section becomes a chunk
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
                    "title": f"CV - {title_val}",
                    "snippet": snippet,
                    "sourceType": "locale",
                    "sourceSlug": f"{namespace}-{section_key}",
                    "locale": locale,
                    "url": url,
                    "date": None,
                    "tags": ["cv", section_key],
                    "heading": title_val,
                }
            )
    elif namespace == "about":
        # About: concatenate all bio paragraphs + roles
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
                    "title": "About",
                    "snippet": text[:150].replace("\n", " ") + "...",
                    "sourceType": "locale",
                    "sourceSlug": namespace,
                    "locale": locale,
                    "url": url,
                    "date": None,
                    "tags": ["about"],
                    "heading": None,
                }
            )
    elif namespace == "updates":
        # Updates: group entries
        entries = data.get("entries", [])
        if entries:
            text_parts = []
            for entry in entries[:20]:  # cap at 20
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
                        "title": "Updates",
                        "snippet": text[:150].replace("\n", " ") + "...",
                        "sourceType": "locale",
                        "sourceSlug": namespace,
                        "locale": locale,
                        "url": url,
                        "date": None,
                        "tags": ["updates"],
                        "heading": None,
                    }
                )
    elif namespace == "uses":
        # Uses: each top-level category
        text = flatten_json_section(data)
        if text.strip():
            chunks.append(
                {
                    "id": f"locale-{namespace}-{locale}-0",
                    "text": f"Uses / Setup\n\n{text}",
                    "title": "Uses",
                    "snippet": text[:150].replace("\n", " ") + "...",
                    "sourceType": "locale",
                    "sourceSlug": namespace,
                    "locale": locale,
                    "url": url,
                    "date": None,
                    "tags": ["uses", "setup"],
                    "heading": None,
                }
            )

    return chunks


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
    """Compute embeddings for all chunks using sentence-transformers."""
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
        # Batch encode
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

    # Build the full embedding matrix from cache
    all_embeddings = np.array([cache[h] for h in hashes], dtype=np.float32)
    return all_embeddings


# ─── Similarity ──────────────────────────────────────────────────────────────


def compute_edges(
    embeddings: np.ndarray,
    chunks: list[dict],
    threshold: float,
    max_edges: int,
) -> list[dict]:
    """Compute similarity edges between chunks."""
    n = len(chunks)
    print(f"  Computing {n * (n - 1) // 2} pairwise similarities...")

    # Cosine similarity matrix (embeddings are already normalized)
    sim_matrix = embeddings @ embeddings.T

    # Collect edges above threshold
    edges = []
    # Track per-node edge count for k-NN cap
    node_edge_counts = {i: 0 for i in range(n)}

    # Get all above-threshold pairs, sorted by similarity descending
    pairs = []
    for i in range(n):
        for j in range(i + 1, n):
            s = float(sim_matrix[i, j])
            if s >= threshold:
                pairs.append((i, j, s))

    pairs.sort(key=lambda x: -x[2])

    for i, j, s in pairs:
        if node_edge_counts[i] < max_edges and node_edge_counts[j] < max_edges:
            edges.append(
                {
                    "source": chunks[i]["id"],
                    "target": chunks[j]["id"],
                    "weight": round(s, 4),
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

    uncached = [c for c in chunks if sha256(c["text"]) not in desc_cache]
    if not uncached:
        print(f"  All {len(chunks)} descriptions found in cache")
    else:
        print(f"  Generating descriptions for {len(uncached)} chunks via OpenRouter...")

    models = [
        "google/gemini-2.5-flash-preview",
        "google/gemini-2.0-flash-001",
    ]

    for i, chunk in enumerate(uncached):
        text_hash = sha256(chunk["text"])
        prompt_text = chunk["text"][:1000]  # Truncate for API

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

        # Rate limit
        time.sleep(0.15)

        if (i + 1) % 20 == 0:
            print(f"    {i + 1}/{len(uncached)} done")
            desc_cache_path.write_text(json.dumps(desc_cache, ensure_ascii=False), encoding="utf-8")

    # Save final cache
    desc_cache_path.write_text(json.dumps(desc_cache, ensure_ascii=False), encoding="utf-8")

    # Apply descriptions to chunks
    applied = 0
    for chunk in chunks:
        text_hash = sha256(chunk["text"])
        if text_hash in desc_cache:
            chunk["description"] = desc_cache[text_hash]
            applied += 1

    print(f"  Applied {applied}/{len(chunks)} descriptions")


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
    print("[1/5] Collecting content...")
    md_items = collect_markdown_files()
    locale_items = collect_locale_files()
    print(
        f"  Found {len(md_items)} markdown files, {len(locale_items)} locale files"
    )

    # Step 2: Chunk content
    print("\n[2/5] Chunking content...")
    chunks = []
    for item in md_items:
        chunks.extend(chunk_markdown(item))
    for item in locale_items:
        chunks.extend(chunk_locale(item))
    print(f"  Generated {len(chunks)} chunks")

    if not chunks:
        print("  No chunks generated, exiting")
        sys.exit(1)

    # Step 3: Generate embeddings
    print("\n[3/5] Generating embeddings...")
    cache = load_cache()
    embeddings = compute_embeddings(chunks, cache)

    # Step 4: Compute similarity edges
    print(f"\n[4/5] Computing edges (threshold={args.threshold}, max_edges={args.max_edges})...")
    edges = compute_edges(embeddings, chunks, args.threshold, args.max_edges)
    print(f"  Generated {len(edges)} edges")

    # Step 5: Optional LLM descriptions
    print("\n[5/5] LLM descriptions...")
    if not args.no_llm:
        generate_descriptions(chunks, cache)
    else:
        print("  Skipped (--no-llm)")

    # Build output - strip embedding text from nodes
    nodes = []
    for chunk in chunks:
        node = {
            "id": chunk["id"],
            "title": chunk["title"],
            "snippet": chunk["snippet"],
            "sourceType": chunk["sourceType"],
            "sourceSlug": chunk["sourceSlug"],
            "locale": chunk["locale"],
            "url": chunk["url"],
            "date": chunk["date"],
            "tags": chunk["tags"],
            "heading": chunk["heading"],
        }
        if "description" in chunk:
            node["description"] = chunk["description"]
        nodes.append(node)

    output = {
        "nodes": nodes,
        "edges": edges,
        "metadata": {
            "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "nodeCount": len(nodes),
            "edgeCount": len(edges),
            "threshold": args.threshold,
            "maxEdgesPerNode": args.max_edges,
            "model": EMBEDDING_MODEL,
        },
    }

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(
        json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    elapsed = time.time() - start_time
    print(f"\n=== Done in {elapsed:.1f}s ===")
    print(f"  Nodes: {len(nodes)}")
    print(f"  Edges: {len(edges)}")
    print(f"  Output: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()

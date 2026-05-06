#!/usr/bin/env python3
"""
One-time backfill script that uses google/gemini-3-flash-preview via OpenRouter to:
1. Add alt text to inline markdown images missing it (![framed:]() and ![]())
2. Add caption fields to gallery frontmatter images that lack them
3. Generate per-section and per-file TL;DR summaries → content/generated/section-summaries.json

Fully async with aiohttp for concurrent API calls.

Usage:
    python3 scripts/backfill_alt_and_tldr.py [--dry-run] [--skip-images] [--skip-tldr] [--concurrency 15]

Requires: pip install aiohttp pyyaml
"""

import argparse
import asyncio
import base64
import json
import logging
import os
import re
import sys
import time
from pathlib import Path

try:
    import aiohttp
except ImportError:
    print("Error: aiohttp is required. Install it: pip install aiohttp")
    sys.exit(1)

import yaml

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

# ─── Paths ──────────────────────────────────────────────────────────────────

APP_DIR = Path(__file__).parent.parent
CONTENT_DIR = APP_DIR / "content"
PUBLIC_DIR = APP_DIR / "public"
GENERATED_DIR = CONTENT_DIR / "generated"
SUMMARIES_PATH = GENERATED_DIR / "section-summaries.json"

CONTENT_DIRS = {
    "post": CONTENT_DIR / "posts",
    "project": CONTENT_DIR / "projects",
    "gallery": CONTENT_DIR / "gallery",
}

MODEL = "google/gemini-3-flash-preview"
API_URL = "https://openrouter.ai/api/v1/chat/completions"

IMAGE_PATTERN = re.compile(
    r"!\[([^\]]*)\]\(([^)]+\.(?:webp|jpg|jpeg|png|gif|svg|avif))\)"
)

# ─── Helpers ────────────────────────────────────────────────────────────────


def load_env() -> str:
    """Load OPENROUTER_API_KEY from .env.local."""
    env_path = APP_DIR / ".env.local"
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, _, value = line.partition("=")
                key = key.strip()
                value = value.strip().strip('"').strip("'")
                if key and value:
                    os.environ.setdefault(key, value)
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        logger.error("OPENROUTER_API_KEY not found in .env.local or environment")
        sys.exit(1)
    return api_key


def parse_frontmatter(text: str) -> tuple[dict, str, str]:
    """Parse YAML frontmatter. Returns (meta, body, raw_frontmatter_block)."""
    match = re.match(r"^(---\s*\n)(.*?)(\n---\s*\n?)(.*)", text, re.DOTALL)
    if not match:
        return {}, text, ""
    raw_fm = match.group(1) + match.group(2) + match.group(3)
    try:
        meta = yaml.safe_load(match.group(2)) or {}
    except yaml.YAMLError:
        meta = {}
    return meta, match.group(4), raw_fm


def resolve_image_path(image_url: str) -> Path | None:
    """Resolve a content image URL to its absolute file path (full-size)."""
    url = image_url.lstrip("/").replace("-thumb.webp", ".webp")
    full = PUBLIC_DIR / url
    return full if full.exists() else None


def image_to_base64_payload(image_path: Path) -> dict | None:
    """Convert an image file to a base64 data URL payload for the API."""
    if not image_path or not image_path.exists():
        return None
    mime_map = {".webp": "image/webp", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
                ".png": "image/png", ".gif": "image/gif"}
    mime = mime_map.get(image_path.suffix.lower(), "image/webp")
    data = base64.b64encode(image_path.read_bytes()).decode("utf-8")
    return {"type": "image_url", "image_url": {"url": f"data:{mime};base64,{data}"}}


def clean_llm_text(text: str) -> str:
    """Strip quotes, prefixes, trailing periods from LLM output."""
    text = re.sub(r'^["\']|["\']$', "", text.strip())
    text = re.sub(r"^(?:Alt text|Alt|Caption|Description|TL;DR):\s*", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\.$", "", text)
    return text.strip()


# ─── Async API caller ──────────────────────────────────────────────────────


async def call_llm(
    session: aiohttp.ClientSession,
    api_key: str,
    messages: list,
    max_tokens: int = 150,
    semaphore: asyncio.Semaphore | None = None,
    max_retries: int = 3,
) -> str:
    """Call OpenRouter API with retry + rate-limit backoff."""
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    payload = {"model": MODEL, "messages": messages, "max_tokens": max_tokens}

    async def _do():
        for attempt in range(max_retries):
            try:
                async with session.post(API_URL, headers=headers, json=payload) as resp:
                    if resp.status == 429:
                        retry_after = int(resp.headers.get("Retry-After", 2 ** (attempt + 1)))
                        logger.warning(f"Rate limited, waiting {retry_after}s...")
                        await asyncio.sleep(retry_after)
                        continue
                    resp.raise_for_status()
                    data = await resp.json()
                    return (
                        data.get("choices", [{}])[0]
                        .get("message", {})
                        .get("content", "")
                        .strip()
                    )
            except Exception as e:
                logger.debug(f"Attempt {attempt+1} failed: {e}")
                if attempt < max_retries - 1:
                    await asyncio.sleep(2 ** attempt)
        return ""

    if semaphore:
        async with semaphore:
            return await _do()
    return await _do()


# ─── Task 1a: Inline image alt text ────────────────────────────────────────


def find_images_needing_alt(body: str) -> list[dict]:
    """Find inline images missing alt text."""
    results = []
    for m in IMAGE_PATTERN.finditer(body):
        alt, url = m.group(1), m.group(2)
        if not alt.replace("framed:", "").strip():
            results.append({
                "full_match": m.group(0), "alt": alt, "url": url,
                "has_framed": alt.strip().lower().startswith("framed:"),
                "start": m.start(), "end": m.end(),
            })
    return results


def _build_alt_prompt(image_url, context, title, section_heading, locale):
    image_path = resolve_image_path(image_url)
    image_payload = image_to_base64_payload(image_path) if image_path else None
    lang = "Chinese (Traditional)" if locale == "zh-TW" else "English"
    prompt = (
        f"Write concise, specific alt text for this image. "
        f"Article: \"{title}\" ({lang})"
        + (f", section: \"{section_heading}\"" if section_heading else "")
        + f".\nContext:\n{context[:1500]}\n\n"
        f"Rules: {lang}, under 15 words, no 'Image of'/'Photo of'/'照片'/'圖片' prefix, "
        f"describe what's visible, no assumptions. Return ONLY the alt text."
    )
    parts = []
    if image_payload:
        parts.append(image_payload)
    parts.append({"type": "text", "text": prompt})
    return [{"role": "user", "content": parts}]


async def backfill_inline_images(session, api_key, sem, dry_run=False):
    """Backfill alt text for inline images, processing all images per file concurrently."""
    logger.info("=== Task 1a: Inline Image Alt Text Backfill ===")
    total_fixed = 0

    for _, content_dir in CONTENT_DIRS.items():
        if not content_dir.exists():
            continue
        for md_file in sorted(content_dir.glob("*.md")):
            if md_file.stem.startswith((".", "_")):
                continue

            text = md_file.read_text(encoding="utf-8")
            meta, body, raw_fm = parse_frontmatter(text)
            if not body.strip():
                continue

            title = meta.get("title", md_file.stem)
            locale = "zh-TW" if md_file.stem.endswith(("_zh-tw", "_zh-TW")) else "en"
            images = find_images_needing_alt(body)
            if not images:
                continue

            logger.info(f"  {md_file.name}: {len(images)} images need alt text")

            # Build all prompts, then fire concurrently
            tasks = []
            for img in images:
                before = body[:img["start"]]
                headings = list(re.finditer(r"^#{2,3}\s+(.+)$", before, re.MULTILINE))
                section_heading = headings[-1].group(1).strip() if headings else None
                ctx_start = max(0, img["start"] - 500)
                ctx_end = min(len(body), img["end"] + 500)
                context = body[ctx_start:ctx_end]
                msgs = _build_alt_prompt(img["url"], context, title, section_heading, locale)
                tasks.append(call_llm(session, api_key, msgs, max_tokens=60, semaphore=sem))

            results = await asyncio.gather(*tasks)

            # Apply results in order (offsets computed sequentially)
            new_body = body
            offset_adj = 0
            file_fixed = 0
            for img, raw_result in zip(images, results):
                alt_text = clean_llm_text(raw_result)
                if not alt_text:
                    logger.warning(f"    SKIP (empty): {Path(img['url']).name}")
                    continue

                new_alt = f"framed: {alt_text}" if img["has_framed"] else alt_text
                new_ref = f"![{new_alt}]({img['url']})"
                old_len = img["end"] - img["start"]
                adj_s = img["start"] + offset_adj
                adj_e = img["end"] + offset_adj
                new_body = new_body[:adj_s] + new_ref + new_body[adj_e:]
                offset_adj += len(new_ref) - old_len
                logger.info(f"    {Path(img['url']).name}: \"{alt_text}\"")
                file_fixed += 1

            if file_fixed and not dry_run:
                md_file.write_text(raw_fm + new_body, encoding="utf-8")
            total_fixed += file_fixed

    logger.info(f"  Inline images fixed: {total_fixed}")
    return total_fixed


# ─── Task 2: TL;DR generation ──────────────────────────────────────────────


def _build_shortname_prompt(text, title, locale):
    """Prompt for a 1-3 word human-feeling label for the rangefinder 404 page."""
    lang = "Chinese (Traditional)" if locale == "zh-TW" else "English"
    prompt = (
        f"Suggest a SHORT label (1-3 words, max 22 characters) for this article \"{title}\". "
        f"Used in a navigation menu — should feel human and specific, not generic. "
        f"Examples of good labels: \"Lego Fan Mount\", \"Aftersun & Paris\", \"NTU CS Admission\", "
        f"\"Unhinged Plushies\", \"US Trip\". "
        f"Use Title Case in {lang}. Skip leading articles (The/A). No quotes, no period. "
        f"Return ONLY the label.\n\nContent excerpt:\n{text[:1500]}"
    )
    return [{"role": "user", "content": prompt}]


def _build_tldr_prompt(text, title, locale, is_section=False, heading=None):
    lang = "Chinese (Traditional)" if locale == "zh-TW" else "English"
    max_w = 10 if is_section else 12
    kind = "section" if is_section else "article"
    prompt = (
        f"Write a VERY concise TL;DR (max {max_w} words) for this {kind}"
        + (f" \"{heading}\"" if heading else "")
        + f" of \"{title}\".\n"
        f"\nContent:\n{text[:2500]}\n\n"
        f"Rules: {lang}, max {max_w} words (ideally 5-8), specific not generic, "
        f"no period at end. Return ONLY the TL;DR."
    )
    return [{"role": "user", "content": prompt}]


async def generate_all_tldrs(session, api_key, sem, dry_run=False):
    """Generate per-section and per-file TL;DRs, batched per file."""
    logger.info("=== Task 2: Section & File TL;DR Generation ===")

    summaries = {}
    if SUMMARIES_PATH.exists():
        try:
            summaries = json.loads(SUMMARIES_PATH.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, IOError):
            pass

    total = 0
    files_done = 0

    for source_type, content_dir in CONTENT_DIRS.items():
        if not content_dir.exists():
            continue
        for md_file in sorted(content_dir.glob("*.md")):
            if md_file.stem.startswith((".", "_")):
                continue

            text = md_file.read_text(encoding="utf-8")
            meta, body, _ = parse_frontmatter(text)
            if not body.strip():
                continue

            title = meta.get("title", md_file.stem)
            slug = md_file.stem
            locale = "zh-TW" if slug.endswith(("_zh-tw", "_zh-TW")) else "en"
            base_slug = re.sub(r"_zh-tw$", "", slug, flags=re.IGNORECASE)
            file_key = f"{source_type}/{base_slug}/{locale}"

            existing = summaries.get(file_key)
            needs_tldr = existing is None
            # shortName only generated for English entries (used by /not-found rangefinder)
            needs_shortname = locale == "en" and (existing is None or not existing.get("shortName"))
            if not needs_tldr and not needs_shortname:
                continue

            # Fast path: existing entry that only needs a shortName backfill
            if not needs_tldr and needs_shortname:
                raw = await call_llm(
                    session, api_key,
                    _build_shortname_prompt(body, title, locale),
                    max_tokens=20, semaphore=sem,
                )
                short = clean_llm_text(raw)
                if short:
                    existing["shortName"] = short
                    logger.info(f"  {md_file.name} shortName → \"{short}\"")
                    total += 1
                files_done += 1
                if files_done % 5 == 0 and not dry_run:
                    GENERATED_DIR.mkdir(parents=True, exist_ok=True)
                    SUMMARIES_PATH.write_text(
                        json.dumps(summaries, ensure_ascii=False, indent=2), encoding="utf-8")
                continue

            # Extract sections (h2, h3, h4)
            sections = []
            h2_parts = re.split(r"\n(?=## (?!#))", body)
            for i, h2_part in enumerate(h2_parts):
                h2_part = h2_part.strip()
                if not h2_part:
                    continue
                h2_m = re.match(r"^##\s+(.+?)(?:\n|$)", h2_part)
                h2_heading = h2_m.group(1).strip() if h2_m else None
                h2_body = re.sub(r"^##\s+.+?\n?", "", h2_part).strip() if h2_heading else h2_part
                if h2_body and len(h2_body) >= 50:
                    sections.append({"heading": h2_heading, "body": h2_body, "index": i})

                # Split h3 within this h2
                h3_parts = re.split(r"\n(?=### (?!#))", h2_body)
                for j, h3_part in enumerate(h3_parts):
                    h3_part = h3_part.strip()
                    if not h3_part:
                        continue
                    h3_m = re.match(r"^###\s+(.+?)(?:\n|$)", h3_part)
                    if not h3_m:
                        continue
                    h3_heading = h3_m.group(1).strip()
                    h3_body = re.sub(r"^###\s+.+?\n?", "", h3_part).strip()
                    if h3_body and len(h3_body) >= 50:
                        sections.append({"heading": h3_heading, "body": h3_body, "index": f"{i}-{j}"})

                    # Split h4 within this h3
                    h4_parts = re.split(r"\n(?=#### (?!#))", h3_body)
                    for k, h4_part in enumerate(h4_parts):
                        h4_part = h4_part.strip()
                        if not h4_part:
                            continue
                        h4_m = re.match(r"^####\s+(.+?)(?:\n|$)", h4_part)
                        if not h4_m:
                            continue
                        h4_heading = h4_m.group(1).strip()
                        h4_body = re.sub(r"^####\s+.+?\n?", "", h4_part).strip()
                        if h4_body and len(h4_body) >= 50:
                            sections.append({"heading": h4_heading, "body": h4_body, "index": f"{i}-{j}-{k}"})

            # Build all tasks: 1 file-level + (1 shortName for en) + N section-level
            coros = [call_llm(session, api_key,
                              _build_tldr_prompt(body, title, locale), max_tokens=30, semaphore=sem)]
            if needs_shortname:
                coros.append(call_llm(
                    session, api_key,
                    _build_shortname_prompt(body, title, locale),
                    max_tokens=20, semaphore=sem,
                ))
            for sec in sections:
                coros.append(call_llm(
                    session, api_key,
                    _build_tldr_prompt(sec["body"], title, locale, is_section=True, heading=sec["heading"]),
                    max_tokens=30, semaphore=sem,
                ))

            results = await asyncio.gather(*coros)
            section_results_offset = 2 if needs_shortname else 1

            file_entry = {"title": title, "locale": locale, "sections": {}}

            # File-level
            file_tldr = clean_llm_text(results[0])
            if file_tldr:
                file_entry["tldr"] = file_tldr
                logger.info(f"  {md_file.name} → \"{file_tldr}\"")
                total += 1

            # shortName (English only)
            if needs_shortname:
                short = clean_llm_text(results[1])
                if short:
                    file_entry["shortName"] = short
                    logger.info(f"  {md_file.name} shortName → \"{short}\"")
                    total += 1

            # Section-level
            for sec, raw in zip(sections, results[section_results_offset:]):
                sec_tldr = clean_llm_text(raw)
                if sec_tldr:
                    key = sec["heading"] or f"section-{sec['index']}"
                    file_entry["sections"][key] = sec_tldr
                    logger.info(f"    {key} → \"{sec_tldr}\"")
                    total += 1

            summaries[file_key] = file_entry
            files_done += 1

            # Incremental save every 5 files
            if files_done % 5 == 0 and not dry_run:
                GENERATED_DIR.mkdir(parents=True, exist_ok=True)
                SUMMARIES_PATH.write_text(
                    json.dumps(summaries, ensure_ascii=False, indent=2), encoding="utf-8")

    if not dry_run:
        GENERATED_DIR.mkdir(parents=True, exist_ok=True)
        SUMMARIES_PATH.write_text(
            json.dumps(summaries, ensure_ascii=False, indent=2), encoding="utf-8")

    logger.info(f"  TL;DRs generated: {total}")
    logger.info(f"  Saved to: {SUMMARIES_PATH}")
    return total


# ─── Main ───────────────────────────────────────────────────────────────────


async def main_async(args):
    api_key = load_env()
    sem = asyncio.Semaphore(args.concurrency)
    start = time.time()

    logger.info(f"Backfill: Alt Text & TL;DR  |  model={MODEL}  concurrency={args.concurrency}  dry_run={args.dry_run}")

    async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=120)) as session:
        if not args.skip_images:
            await backfill_inline_images(session, api_key, sem, args.dry_run)

        if not args.skip_tldr:
            await generate_all_tldrs(session, api_key, sem, args.dry_run)

    logger.info(f"Done in {time.time() - start:.1f}s")


def main():
    parser = argparse.ArgumentParser(description="Backfill image alt text and section TL;DRs")
    parser.add_argument("--dry-run", action="store_true", help="Preview without writing")
    parser.add_argument("--skip-images", action="store_true", help="Skip image alt text backfill")
    parser.add_argument("--skip-tldr", action="store_true", help="Skip TL;DR generation")
    parser.add_argument("--concurrency", type=int, default=15, help="Max concurrent API calls (default 15)")
    args = parser.parse_args()
    asyncio.run(main_async(args))


if __name__ == "__main__":
    main()

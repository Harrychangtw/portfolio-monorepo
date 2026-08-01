#!/usr/bin/env python3
"""Validate hand-written TL;DR entries and merge them into section-summaries.json.

Usage:
    python3 .claude/skills/content-tldr/merge.py /tmp/new-entries.json [--dry-run]

Hard errors (nothing is written): unknown key, title mismatch, locale mismatch,
section heading that does not exist in the source markdown, missing tldr.
Warnings (written anyway): length overruns, trailing periods.
"""

import argparse
import json
import re
import sys
from pathlib import Path

from common import SUMMARIES_PATH, iter_content_files, load_summaries

CJK = re.compile(r"[一-鿿]")

# (file_limit, section_limit) in words for English, characters for Chinese.
LIMITS = {"en": (12, 10), "zh-TW": (34, 28)}


def measure(text, locale):
    if locale == "zh-TW" or CJK.search(text):
        return len(re.sub(r"\s", "", text)), "chars"
    return len(text.split()), "words"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("entries", type=Path)
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    new = json.loads(args.entries.read_text(encoding="utf-8"))
    index = {item["key"]: item for item in iter_content_files()}

    errors, warnings = [], []

    for key, entry in new.items():
        item = index.get(key)
        if not item:
            errors.append(f"{key}: no content file produces this key")
            continue

        if entry.get("title") != item["title"]:
            errors.append(
                f"{key}: title {entry.get('title')!r} != frontmatter {item['title']!r}"
            )
        if entry.get("locale") != item["locale"]:
            errors.append(f"{key}: locale must be {item['locale']!r}")

        tldr = entry.get("tldr")
        if not tldr:
            errors.append(f"{key}: missing tldr")
        else:
            n, unit = measure(tldr, item["locale"])
            limit = LIMITS[item["locale"]][0]
            if n > limit:
                warnings.append(f"{key}: tldr is {n} {unit} (limit {limit})")
            if tldr.rstrip().endswith((".", "。")):
                warnings.append(f"{key}: tldr ends with a period")

        if item["locale"] == "en":
            short = entry.get("shortName")
            if not short:
                warnings.append(f"{key}: no shortName (used by the 404 rangefinder)")
            elif len(short) > 22:
                warnings.append(f"{key}: shortName is {len(short)} chars (limit 22)")
        elif entry.get("shortName"):
            errors.append(f"{key}: shortName is English-only, drop it from zh-TW entries")

        valid = set(item["sections"])
        for heading, summary in entry.get("sections", {}).items():
            if heading not in valid:
                errors.append(
                    f"{key}: section {heading!r} is not a heading in {item['path'].name}"
                )
                continue
            n, unit = measure(summary, item["locale"])
            limit = LIMITS[item["locale"]][1]
            if n > limit:
                warnings.append(f"{key}: section {heading!r} is {n} {unit} (limit {limit})")
            if summary.rstrip().endswith((".", "。")):
                warnings.append(f"{key}: section {heading!r} ends with a period")

        for heading in item["sections"]:
            if heading not in entry.get("sections", {}):
                warnings.append(f"{key}: section {heading!r} has no summary")

    for w in warnings:
        print(f"warn : {w}")
    for e in errors:
        print(f"ERROR: {e}", file=sys.stderr)
    if errors:
        print(f"\n{len(errors)} error(s); nothing written.", file=sys.stderr)
        return 1

    summaries = load_summaries()
    summaries.update(new)
    if args.dry_run:
        print(f"\ndry run: would write {len(new)} entr(ies) to {SUMMARIES_PATH.name}")
        return 0

    # Minified on purpose; `pnpm build:graph` chains format:generated to pretty-print.
    SUMMARIES_PATH.write_text(
        json.dumps(summaries, ensure_ascii=False, separators=(",", ":")), encoding="utf-8"
    )
    print(f"\nmerged {len(new)} entr(ies) into {SUMMARIES_PATH}")
    print("next: cd apps/harrychang-me && set -a; . ./.env.local; set +a; pnpm build:graph")
    return 0


if __name__ == "__main__":
    sys.exit(main())

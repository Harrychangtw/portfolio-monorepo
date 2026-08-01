#!/usr/bin/env python3
"""Report content files that have no entry in section-summaries.json.

Usage:
    python3 .claude/skills/content-tldr/list_missing.py [--file NAME.md]

Exits 0 either way; "nothing missing" is a normal outcome, not a failure.
"""

import argparse
import sys

from common import iter_content_files, load_summaries


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--file", help="Report this filename even if it already has an entry")
    args = ap.parse_args()

    summaries = load_summaries()
    missing = []

    for item in iter_content_files():
        forced = args.file and item["path"].name == args.file
        entry = summaries.get(item["key"])
        if entry and not forced:
            # An English entry without a shortName still needs one.
            if item["locale"] == "en" and not entry.get("shortName"):
                missing.append((item, entry, "shortName only"))
            continue
        missing.append((item, entry, "full entry"))

    if args.file and not any(i["path"].name == args.file for i, _, _ in missing):
        print(f"No content file named {args.file}", file=sys.stderr)
        return 1

    if not missing:
        print("nothing missing: every content file has a summaries entry")
        return 0

    for item, entry, need in missing:
        print(f"\n{item['path'].relative_to(item['path'].parents[2])}  [{need}]")
        print(f"  key    : {item['key']}")
        print(f"  title  : {item['title']}")
        print(f"  locale : {item['locale']}")
        if need == "shortName only":
            continue
        print(f"  needs  : tldr" + (" + shortName" if item["locale"] == "en" else ""))
        print(f"  sections ({len(item['sections'])}):")
        for heading in item["sections"]:
            print(f"    - {heading}")

    print(f"\n{len(missing)} file(s) need work.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

#!/bin/bash

MARKDOWN_FILE="content/arxiv-papers.md"
TEMP_FILE=$(mktemp)
grep -v '^[0-9]' "$MARKDOWN_FILE" > "$TEMP_FILE"

grep '^[0-9]' "$MARKDOWN_FILE" | sort -u >> "$TEMP_FILE"

mv "$TEMP_FILE" "$MARKDOWN_FILE"

echo "The ArXiv paper IDs in $MARKDOWN_FILE have been sorted and duplicates were removed."

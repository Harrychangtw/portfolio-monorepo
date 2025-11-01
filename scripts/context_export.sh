#!/bin/bash
OUTPUT="combined.md"
> "$OUTPUT"

FILES=(
  "/Users/zhangqiwei/Documents/01_dev-project/portfolio_site/lib/markdown.ts"
  "/Users/zhangqiwei/Documents/01_dev-project/portfolio_site/components/gallery-card.tsx"
  "/Users/zhangqiwei/Documents/01_dev-project/portfolio_site/components/gallery-section.tsx"
  "/Users/zhangqiwei/Documents/01_dev-project/portfolio_site/lib/utils.ts"
)

for FILE in "${FILES[@]}"
do
  echo "<$FILE>" >> "$OUTPUT"
  cat "$FILE" >> "$OUTPUT"
  echo "</$FILE>" >> "$OUTPUT"
  echo "" >> "$OUTPUT"
done

echo "Combined files into $OUTPUT"

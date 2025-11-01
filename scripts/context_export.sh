#!/bin/bash
OUTPUT="combined.md"
> "$OUTPUT"

FILES=(
  "/Users/zhangqiwei/Documents/01_dev-project/portfolio_site/utils/scrolling.ts"
  "/Users/zhangqiwei/Documents/01_dev-project/portfolio_site/app/projects/[slug]/page.tsx"
  "/Users/zhangqiwei/Documents/01_dev-project/portfolio_site/app/layout.tsx"
  "/Users/zhangqiwei/Documents/01_dev-project/portfolio_site/styles/lcp-optimize.css"
  "/Users/zhangqiwei/Documents/01_dev-project/portfolio_site/components/footer.tsx"
  "/Users/zhangqiwei/Documents/01_dev-project/portfolio_site/components/header.tsx"
)

for FILE in "${FILES[@]}"
do
  echo "<$FILE>" >> "$OUTPUT"
  cat "$FILE" >> "$OUTPUT"
  echo "</$FILE>" >> "$OUTPUT"
  echo "" >> "$OUTPUT"
done

echo "Combined files into $OUTPUT"

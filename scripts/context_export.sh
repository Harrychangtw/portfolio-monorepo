#!/bin/bash
OUTPUT="combined.md"
> "$OUTPUT"

FILES=(
  "/Users/zhangqiwei/Documents/01_dev-project/portfolio_site/app/(studio)/studio/page.tsx"
  "/Users/zhangqiwei/Documents/01_dev-project/portfolio_site/components/letter-glitch.tsx"
  "/Users/zhangqiwei/Documents/01_dev-project/portfolio_site/app/(main)/manifesto/page.tsx"
  "/Users/zhangqiwei/Documents/01_dev-project/portfolio_site/hooks/use-mobile.tsx"
  "/Users/zhangqiwei/Documents/01_dev-project/portfolio_site/prisma/schema.prisma"
  "/Users/zhangqiwei/Documents/01_dev-project/portfolio_site/components/studio/ClientLayout.tsx"
  "/Users/zhangqiwei/Documents/01_dev-project/portfolio_site/app/(main)/layout.tsx"
  "/Users/zhangqiwei/Documents/01_dev-project/portfolio_site/app/layout.tsx"
)

for FILE in "${FILES[@]}"
do
  echo "<$FILE>" >> "$OUTPUT"
  cat "$FILE" >> "$OUTPUT"
  echo "</$FILE>" >> "$OUTPUT"
  echo "" >> "$OUTPUT"
done

echo "Combined files into $OUTPUT"

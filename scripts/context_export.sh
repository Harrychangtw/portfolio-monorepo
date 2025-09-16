#!/bin/bash
OUTPUT="combined.md"
> "$OUTPUT"
for FILE in "$@"
do
  echo "<$FILE>" >> "$OUTPUT"
  cat "$FILE" >> "$OUTPUT"
  echo "</$FILE>" >> "$OUTPUT"
  echo "" >> "$OUTPUT"
done

echo "Combined files into $OUTPUT"

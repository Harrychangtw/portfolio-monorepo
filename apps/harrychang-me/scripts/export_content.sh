#!/bin/bash

# Output file name
OUTPUT_FILE="snapshots/harrychang_content_export.md"

# Clear previous output if it exists
echo "# Harry Chang Content Export" > "$OUTPUT_FILE"
echo "Generated on: $(date)" >> "$OUTPUT_FILE"
echo "----------------------------------------" >> "$OUTPUT_FILE"

# Function to append file content with a header
append_file() {
    local file_path="$1"
    local category="$2"
    
    if [ -f "$file_path" ]; then
        echo "" >> "$OUTPUT_FILE"
        echo "## File: $file_path ($category)" >> "$OUTPUT_FILE"
        echo '```markdown' >> "$OUTPUT_FILE"
        cat "$file_path" >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"
        echo '```' >> "$OUTPUT_FILE"
        echo "----------------------------------------" >> "$OUTPUT_FILE"
        echo "Processed: $file_path"
    else
        echo "Warning: File not found - $file_path"
    fi
}

# Function to loop through a directory
append_directory() {
    local dir_path="$1"
    local category="$2"
    
    if [ -d "$dir_path" ]; then
        # Find all .md files, sort them by name to keep pairs (en/zh-tw) together
        find "$dir_path" -name "*.md" | sort | while read -r file; do
            append_file "$file" "$category"
        done
    else
        echo "Warning: Directory not found - $dir_path"
    fi
}

# --- 1. README ---
echo "Exporting README..."
append_file "README.md" "Project Readme"



# --- 3. USES (Locales) ---
echo "Exporting Uses Page (Locales)..."

append_file "public/locales/en/about.json" "About Section (English)"
append_file "public/locales/zh-TW/about.json" "About Section (Chinese)"

append_file "public/locales/en/updates.json" "Updates Section (English)"
append_file "public/locales/en/uses.json" "Uses Page (English)"

# --- 4. BLOG POSTS ---
echo "Exporting Blog Posts..."
append_directory "content/posts" "Blog Post"

# --- 5. PROJECTS ---
echo "Exporting Projects..."
append_directory "content/projects" "Project Case Study"

# --- 6. GALLERY ---
echo "Exporting Gallery..."
append_directory "content/gallery" "Gallery Entry"

# --- 2. MANIFESTO (Source Code) ---
echo "Exporting Manifesto Page..."
append_file "app/(main)/manifesto/page.tsx" "Manifesto Source"

append_file "public/locales/zh-TW/common.json" "General Locales (Chinese)"
append_file "public/locales/en/common.json" "General Locales (English)"
echo ""
echo "Export complete! Content saved to: $OUTPUT_FILE"

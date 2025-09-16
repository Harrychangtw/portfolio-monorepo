#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "🔥 Starting fresh install..."

# --- Clean Up ---
echo "🗑️  Removing build cache, node modules, and lock files..."

# Remove the Next.js build cache
rm -rf .next

# Find and remove all node_modules directories
find . -name "node_modules" -type d -exec rm -rf {} +

# Find and remove all package-lock.json files
find . -name "package-lock.json" -type f -delete

echo "✅ Clean-up complete."


# --- Reinstall ---
echo "📦 Reinstalling dependencies with --legacy-peer-deps..."
npm install --legacy-peer-deps

echo "🚀 Done! Your project is clean and ready."

#!/usr/bin/env bash
set -euo pipefail

# Run from repository root
cd "$(dirname "$0")/.."

echo "Searching for and removing all node_modules and dist directories, and any *.foxe files (this may take a while)..."

# Remove all node_modules directories
find . -type d -name node_modules -prune -print -exec rm -rf '{}' +

# Remove all dist directories
find . -type d -name dist -prune -print -exec rm -rf '{}' +

# Remove all .foxe files
find . -type f -name "*.foxe" -print -exec rm -f '{}' +

echo "Cleanup complete: removed node_modules, dist directories and .foxe files."

exit 0

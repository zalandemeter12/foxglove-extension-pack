#!/bin/bash
set -e

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
export PATH=~/.npm-global/bin:$PATH

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Load targets from config file if present, otherwise fall back to default
TARGET_FILE="$SCRIPT_DIR/targets.list"
if [ -f "$TARGET_FILE" ]; then
    # read lines into array, ignoring empty lines and comments
    mapfile -t targets < <(sed -e '/^\s*$/d' -e '/^\s*#/d' "$TARGET_FILE")
else
    targets=("common")
fi

# Save the current directory
orig_dir=$(pwd)

# Loop through each target
for t in "${targets[@]}"; do
    echo "Installing dependencies for $t..."
    cd src/$t
    npm install
    cd $orig_dir
done
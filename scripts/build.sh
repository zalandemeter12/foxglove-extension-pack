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
    # Load targets, remove blank lines and comments, and exclude any 'common' entries
    mapfile -t targets < <(sed -e '/^\s*$/d' -e '/^\s*#/d' "$TARGET_FILE" | grep -vi -E '^\s*common\s*$')
else
    targets=("circular-gauge" "value-display" "gg-display")
fi

# Save the current directory
orig_dir=$(pwd)

# Loop through each target
for t in "${targets[@]}"; do
    # Skip any accidental 'common' entries
    if [ "${t}" = "common" ]; then
        echo "Skipping 'common' target"
        continue
    fi
    echo "Building $t..."
    cd src/$t
    npm run local-install
    npm run package
    cd $orig_dir
done
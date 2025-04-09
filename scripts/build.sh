#!/bin/bash
set -e

# Define targets array
targets=("circular-gauge" "value-display" "gg-diagram")
# targets=("circular-gauge")

# Save the current directory
orig_dir=$(pwd)

# Loop through each target
for t in "${targets[@]}"; do
    echo "Building $t..."
    cd src/$t
    npm run local-install
    cd $orig_dir
done
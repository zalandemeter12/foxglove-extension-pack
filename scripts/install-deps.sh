#!/bin/bash
set -e

# Define targets array
targets=("common" "circular-gauge" "value-display" "gg-diagram")

# Save the current directory
orig_dir=$(pwd)

# Loop through each target
for t in "${targets[@]}"; do
    echo "Installing dependencies for $t..."
    cd src/$t
    npm install
    cd $orig_dir
done
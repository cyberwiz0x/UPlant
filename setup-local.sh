#!/bin/bash

cd "$(dirname "$0")" || exit 1

# Copy backend .env if it doesn't exist
if [ ! -f "backend/.env" ]; then
    cp "backend/.env.example" "backend/.env"
fi

# Copy frontend local config if it doesn't exist
if [ ! -f "UPlant/src/config.local.ts" ]; then
    cp "UPlant/src/config.example.ts" "UPlant/src/config.local.ts"
fi

echo "Local config files are ready."
echo
echo "Edit backend/.env and add your PLANTNET_API_KEY."
echo "Edit UPlant/src/config.local.ts and set your computer's network interface IP."

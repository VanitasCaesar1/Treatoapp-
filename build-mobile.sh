#!/bin/bash

# Ensure we're in the project root
cd "$(dirname "$0")"

# Cleanup function to restore API folder
cleanup() {
    if [ -d "app_api_backup" ]; then
        echo "Restoring app/api..."
        # If app/api was recreated (unlikely during build but possible), remove it
        if [ -d "app/api" ]; then
            rm -rf app/api
        fi
        mv app_api_backup app/api
    fi
}

# Set up trap to call cleanup on exit/error
trap cleanup EXIT

# Check if backup already exists (from failed run)
if [ -d "app_api_backup" ]; then
    echo "Found existing backup, restoring first..."
    if [ -d "app/api" ]; then
        echo "Error: Both app/api and app_api_backup exist. Please resolve manually."
        exit 1
    fi
    mv app_api_backup app/api
fi

# Move API folder out of the way
if [ -d "app/api" ]; then
    echo "Temporarily moving app/api to exclude from static build..."
    mv app/api app_api_backup
else
    echo "Warning: app/api not found."
fi

# Run the build
echo "Running Next.js build..."
# We use npx next build directly
npx next build

# Check if build succeeded
if [ $? -eq 0 ]; then
    echo "Build successful. Syncing Capacitor..."
    npx cap sync
else
    echo "Build failed."
    exit 1
fi

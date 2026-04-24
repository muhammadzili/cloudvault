#!/bin/bash

# CloudVault Production Starter Script
# This script ensures dependencies are installed, builds the frontend, and starts the server.

echo "--- Starting CloudVault Production Setup ---"

# Step 1: Install dependencies if node_modules don't exist
if [ ! -d "node_modules" ]; then
    echo "Installing root dependencies..."
    npm install
fi

if [ ! -d "client/node_modules" ]; then
    echo "Installing client dependencies..."
    cd client && npm install && cd ..
fi

if [ ! -d "server/node_modules" ]; then
    echo "Installing server dependencies..."
    cd server && npm install && cd ..
fi

# Step 2: Build the frontend
echo "Building optimized frontend..."
npm run build

# Step 3: Start the server in production mode
echo "Launching server in production mode..."
export NODE_ENV=production
npm run start

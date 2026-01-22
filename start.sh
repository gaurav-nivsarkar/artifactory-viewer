#!/bin/bash

# Artifactory Viewer - Quick Start Script

echo "🚀 Starting Artifactory Repository Browser..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Start the server
echo "🌐 Starting server on http://localhost:3000"
echo "📁 Press Ctrl+C to stop the server"
echo ""

npm start

#!/bin/bash

# Univo Local Testing Script
# This script sets up and runs the full stack locally

set -e

echo "🚀 Univo Local Development Setup"
echo "=================================="

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local not found. Creating from example..."
    cp .env.local.example .env.local
    echo "✅ Created .env.local - update it with your settings"
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# TypeScript check
echo ""
echo "🔍 Checking TypeScript..."
npm run check

echo ""
echo "✅ All checks passed!"
echo ""
echo "To start development:"
echo "  npm run dev"
echo ""
echo "The app will be available at:"
echo "  Client: http://localhost:5173"
echo "  API:    http://localhost:5000/api"
echo ""

#!/bin/bash

# Build script for BakaCode

set -e

echo "🚀 Building BakaCode..."

# Clean previous build
echo "📁 Cleaning previous build..."
rm -rf dist

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run linting
echo "🔍 Running linter..."
npm run lint

# Run tests
echo "🧪 Running tests..."
npm test

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

# Make CLI executable
echo "🔧 Setting up CLI..."
chmod +x dist/index.js

echo "✅ Build completed successfully!"
echo ""
echo "To test locally:"
echo "  npm link"
echo "  agent --help"
echo ""
echo "To publish:"
echo "  npm publish"

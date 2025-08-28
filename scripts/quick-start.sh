#!/bin/bash

# Quick start script for BakaCode

set -e

echo "🚀 BakaCode Quick Start Setup"
echo "==============================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm found: $(npm --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

# Link for global usage
echo "🔗 Setting up global CLI..."
npm link

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Quick Test:"
echo "  agent --help"
echo ""
echo "Configuration:"
echo "  agent config show"
echo ""
echo "Set up Ollama (recommended for local use):"
echo "  1. Install Ollama: https://ollama.ai/"
echo "  2. Run: ollama pull llama3"
echo "  3. Test: agent chat -m llama3"
echo ""
echo "Set up OpenAI (requires API key):"
echo "  1. Get API key from OpenAI"
echo "  2. Set: agent config set provider.apiKey \"your-key\""
echo "  3. Set: agent config set provider.type openai"
echo "  4. Test: agent chat -m gpt-4"
echo ""
echo "Web Search (requires Bing API key):"
echo "  1. Get API key from Microsoft Azure"
echo "  2. Set: agent config set bing_key \"your-key\""
echo "  3. Test: agent websearch \"Node.js tutorials\""

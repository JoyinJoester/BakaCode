@echo off
REM Quick start script for BakaCode on Windows

echo 🚀 BakaCode Quick Start Setup
echo ===============================

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    exit /b 1
)

echo ✅ Node.js found
node --version

REM Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    exit /b 1
)

echo ✅ npm found
npm --version

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Build the project
echo 🔨 Building project...
npm run build

REM Link for global usage
echo 🔗 Setting up global CLI...
npm link

echo.
echo 🎉 Setup completed successfully!
echo.
echo Quick Test:
echo   agent --help
echo.
echo Configuration:
echo   agent config show
echo.
echo Set up Ollama (recommended for local use):
echo   1. Install Ollama: https://ollama.ai/
echo   2. Run: ollama pull llama3
echo   3. Test: agent chat -m llama3
echo.
echo Set up OpenAI (requires API key):
echo   1. Get API key from OpenAI
echo   2. Set: agent config set provider.apiKey "your-key"
echo   3. Set: agent config set provider.type openai
echo   4. Test: agent chat -m gpt-4
echo.
echo Web Search (requires Bing API key):
echo   1. Get API key from Microsoft Azure
echo   2. Set: agent config set bing_key "your-key"
echo   3. Test: agent websearch "Node.js tutorials"

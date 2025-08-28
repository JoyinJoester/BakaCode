@echo off
REM Build script for BakaCode on Windows

echo 🚀 Building BakaCode...

REM Clean previous build
echo 📁 Cleaning previous build...
if exist dist rmdir /s /q dist

REM Install dependencies
echo 📦 Installing dependencies...
npm ci

REM Run linting
echo 🔍 Running linter...
npm run lint

REM Run tests
echo 🧪 Running tests...
npm test

REM Build TypeScript
echo 🔨 Building TypeScript...
npm run build

echo ✅ Build completed successfully!
echo.
echo To test locally:
echo   npm link
echo   agent --help
echo.
echo To publish:
echo   npm publish

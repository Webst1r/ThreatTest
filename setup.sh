#!/bin/bash

# ThreatTest Setup Script
# This script automates the initial setup process

echo "🛡️  ThreatTest Setup Script"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "⚙️  Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created (please edit with your settings)"
else
    echo "ℹ️  .env file already exists"
fi

echo ""

# Create public directory
echo "📁 Setting up directories..."
mkdir -p public
cp index.html public/

if [ $? -eq 0 ]; then
    echo "✅ Directories created"
else
    echo "⚠️  Directory setup had issues (might already exist)"
fi

echo ""
echo "================================"
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Run 'npm start' to start the server"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "For development with auto-reload:"
echo "  npm run dev"
echo ""
echo "For production deployment, see DEPLOYMENT.md"
echo "================================"

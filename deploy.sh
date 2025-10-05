#!/bin/bash
# ========================================
# Simple Deployment Script for Angular + Docker
# ========================================

# Exit on error
set -e

echo "🚀 Building Angular project..."
ng build

echo "🐳 Building Docker image: chat-dashboard"
docker build -t chat-dashboard .

echo "🧹 Removing old container (if it exists)..."
docker rm -f frontend 2>/dev/null || true

echo "🏗️ Starting new container..."
docker run -d -p 80:80 --name frontend chat-dashboard

echo "✅ Deployment complete!"
echo "🌍 Your app should be available at: http://localhost"

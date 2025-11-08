#!/bin/bash
echo "📦 Pushing InclusiAid to GitHub..."
echo ""
echo "You need a Personal Access Token:"
echo "1. Go to: https://github.com/settings/tokens"
echo "2. Generate new token (classic) with 'repo' scope"
echo "3. Copy the token"
echo ""
read -p "Press Enter when you have your token ready..."
cd "$(dirname "$0")"
git push -u origin main

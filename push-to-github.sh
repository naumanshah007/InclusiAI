#!/bin/bash

# Script to push InclusiAid to GitHub
# This will prompt for your GitHub credentials

echo "🚀 Pushing InclusiAid to GitHub..."
echo ""
echo "Repository: https://github.com/naumanshah007/InclusiAI"
echo ""
echo "You will be prompted for:"
echo "  - Username: naumanshah007"
echo "  - Password: Use a Personal Access Token (not your GitHub password)"
echo ""
echo "To create a token:"
echo "  1. Go to: https://github.com/settings/tokens"
echo "  2. Generate new token (classic)"
echo "  3. Select 'repo' scope"
echo "  4. Copy the token and use it as password"
echo ""
read -p "Press Enter to continue..."

cd "$(dirname "$0")"
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo "📦 Repository: https://github.com/naumanshah007/InclusiAI"
    echo ""
    echo "Next step: Deploy to Vercel"
    echo "  1. Go to: https://vercel.com/new"
    echo "  2. Import repository: naumanshah007/InclusiAI"
    echo "  3. Add GEMINI_API_KEY environment variable"
    echo "  4. Deploy!"
else
    echo ""
    echo "❌ Push failed. Please check your credentials."
    echo "See PUSH_AND_DEPLOY.md for detailed instructions."
fi


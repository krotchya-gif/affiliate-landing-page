#!/bin/bash

echo "🚀 AUTO-DEPLOY SCRIPT"
echo "====================="
echo ""

# Check GitHub login
if ! gh auth status &>/dev/null; then
    echo "🔑 Login GitHub..."
    gh auth login
fi

# Create repo if not exists
echo "📦 Membuat repository GitHub..."
gh repo create affiliate-landing-page --public --source=. --remote=origin --push 2>/dev/null || {
    echo "📦 Repository sudah ada, push saja..."
    git remote add origin https://github.com/$(gh api user -q .login)/affiliate-landing-page.git 2>/dev/null
}

# Push to GitHub
echo "📤 Push ke GitHub..."
git push -u origin main 2>/dev/null || git push -u origin master

echo ""
echo "✅ Push selesai!"
echo ""
echo "🛠️  Setup Secrets di GitHub:"
echo "   https://github.com/$(gh api user -q .login)/affiliate-landing-page/settings/secrets/actions"
echo ""
echo "📋 Secrets yang perlu ditambahkan:"
echo "   - VERCEL_TOKEN"
echo "   - VERCEL_ORG_ID"
echo "   - VERCEL_PROJECT_ID"
echo "   - RAILWAY_TOKEN"
echo ""
echo "📖 Lihat GITHUB_SETUP.md untuk panduan lengkap"

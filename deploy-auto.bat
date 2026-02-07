@echo off
chcp 65001 >nul
echo 🚀 AUTO-DEPLOY SCRIPT
echo =====================
echo.

:: Check GitHub login
gh auth status >nul 2>&1
if %errorlevel% neq 0 (
    echo 🔑 Login GitHub...
    gh auth login
)

:: Create repo if not exists
echo 📦 Membuat repository GitHub...
gh repo create affiliate-landing-page --public --source=. --remote=origin --push 2>nul || (
    echo 📦 Repository sudah ada, push saja...
    git remote add origin https://github.com/%GITHUB_USERNAME%/affiliate-landing-page.git 2>nul
)

:: Push to GitHub
echo 📤 Push ke GitHub...
git push -u origin main || git push -u origin master

echo.
echo ✅ Push selesai!
echo.
echo 🛠️  Setup Secrets di GitHub:
echo    https://github.com/%GITHUB_USERNAME%/affiliate-landing-page/settings/secrets/actions
echo.
echo 📋 Secrets yang perlu ditambahkan:
echo    - VERCEL_TOKEN
echo    - VERCEL_ORG_ID
echo    - VERCEL_PROJECT_ID
echo    - RAILWAY_TOKEN
echo.
echo 📖 Lihat GITHUB_SETUP.md untuk panduan lengkap
echo.
pause

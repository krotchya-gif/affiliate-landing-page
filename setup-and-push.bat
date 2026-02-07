@echo off
echo ====================================
echo 🚀 SETUP REPO & PUSH TO GITHUB
echo ====================================
echo.

:: Cek gh CLI
where gh >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ GitHub CLI (gh) tidak ditemukan
    echo 📥 Install dari: https://cli.github.com/
    echo.
    echo Atau buat repo manual:
    echo 1. Buka https://github.com/new
    echo 2. Nama: affiliate-landing-page
    echo 3. Klik Create
    pause
    exit /b 1
)

:: Cek login
gh auth status >nul 2>&1
if %errorlevel% neq 0 (
    echo 🔑 Login ke GitHub...
    gh auth login
)

:: Buat repo dan push
echo 📦 Membuat repository...
gh repo create affiliate-landing-page --public --source=. --remote=origin --push

if %errorlevel% equ 0 (
    echo.
    echo ✅ BERHASIL!
    echo 🌐 Repo: https://github.com/krotchya-gif/affiliate-landing-page
    echo.
    echo 🔧 Langkah selanjutnya:
    echo 1. Setup Vercel: vercel --prod
    echo 2. Setup Railway: railway up
    echo.
) else (
    echo ❌ Gagal, coba buat manual di https://github.com/new
)

pause

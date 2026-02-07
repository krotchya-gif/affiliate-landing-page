@echo off
chcp 65001 >nul
cls

echo ╔═══════════════════════════════════════════════════════════╗
echo ║  🚀 Push ke GitHub - Affiliate Landing Page              ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

REM Cek apakah di folder yang benar
if not exist "readme.md" (
    echo ❌ Error: Jalankan script ini dari root folder project!
    pause
    exit /b 1
)

echo 📋 Status Git saat ini:
echo ------------------------
git status
echo.

set /p COMMIT_MSG=Masukkan pesan commit (default: "Update project"): 

if "%COMMIT_MSG%"=="" set COMMIT_MSG=Update project

echo.
echo 📝 Menambahkan file...
git add .

echo.
echo 💾 Commit dengan pesan: "%COMMIT_MSG%"
git commit -m "%COMMIT_MSG%"

echo.
echo 🚀 Push ke GitHub...
git push origin main

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║  ✅ Push berhasil!                                       ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.
echo Repository: https://github.com/krotchya-gif/affiliate-landing-page
echo.
pause

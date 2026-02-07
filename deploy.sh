#!/bin/bash

# 🚀 Deployment Automation Script for Affiliate Landing Page
# Usage: ./deploy.sh

set -e

echo "🚀 Affiliate Landing Page - Deployment Script"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ File .env tidak ditemukan!${NC}"
    echo "Silakan copy dari .env.example dan isi semua variabel."
    echo ""
    echo "cp .env.example .env"
    echo ""
    exit 1
fi

# Load .env
export $(grep -v '^#' .env | xargs)

echo -e "${YELLOW}📋 Pre-deployment Checklist:${NC}"
echo ""

# Check required variables
check_var() {
    var_name=$1
    var_value=$2
    if [ -z "$var_value" ] || [ "$var_value" = "your_${var_name,,}_here" ]; then
        echo -e "  ${RED}❌ $var_name belum diisi${NC}"
        return 1
    else
        echo -e "  ${GREEN}✅ $var_name sudah diisi${NC}"
        return 0
    fi
}

# Validate environment variables
VALID=true
check_var "BOT_TOKEN" "$BOT_TOKEN" || VALID=false
check_var "SUPABASE_URL" "$SUPABASE_URL" || VALID=false
check_var "SUPABASE_ANON_KEY" "$SUPABASE_ANON_KEY" || VALID=false
check_var "SUPABASE_SERVICE_KEY" "$SUPABASE_SERVICE_KEY" || VALID=false

echo ""

if [ "$VALID" = false ]; then
    echo -e "${RED}❌ Silakan lengkapi semua environment variables di file .env${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Semua environment variables sudah diisi!${NC}"
echo ""

# Menu
echo "${YELLOW}Pilih deployment target:${NC}"
echo ""
echo "1) 🌐 Deploy Frontend ke Vercel"
echo "2) 🤖 Deploy Bot ke Railway"
echo "3) 📦 Deploy Semua (Frontend + Bot)"
echo "4) 🔧 Setup Webhook Telegram"
echo "5) 🧪 Test Koneksi"
echo ""
read -p "Pilih opsi (1-5): " choice

case $choice in
    1)
        echo ""
        echo -e "${YELLOW}🌐 Deploying Frontend ke Vercel...${NC}"
        echo ""
        
        # Check if vercel CLI installed
        if ! command -v vercel &> /dev/null; then
            echo "Installing Vercel CLI..."
            npm i -g vercel
        fi
        
        cd web
        
        # Create .env.local for Vercel
        echo "NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL" > .env.local
        echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY" >> .env.local
        echo "NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL" >> .env.local
        echo "NEXT_PUBLIC_SITE_NAME=$NEXT_PUBLIC_SITE_NAME" >> .env.local
        echo "REVALIDATE_SECRET=$REVALIDATE_SECRET" >> .env.local
        
        echo "Environment variables configured!"
        echo ""
        echo -e "${GREEN}✅ Siap untuk deploy ke Vercel!${NC}"
        echo ""
        echo "Jalankan command berikut untuk deploy:"
        echo "  cd web && vercel --prod"
        echo ""
        ;;
        
    2)
        echo ""
        echo -e "${YELLOW}🤖 Deploying Bot ke Railway...${NC}"
        echo ""
        
        # Check if railway CLI installed
        if ! command -v railway &> /dev/null; then
            echo "Installing Railway CLI..."
            npm i -g @railway/cli
        fi
        
        echo "Pastikan kamu sudah login ke Railway:"
        echo "  railway login"
        echo ""
        echo "Lalu link project:"
        echo "  railway link"
        echo ""
        echo -e "${GREEN}✅ Siap untuk deploy ke Railway!${NC}"
        echo ""
        echo "Set environment variables di Railway dashboard:"
        echo "  BOT_TOKEN=$BOT_TOKEN"
        echo "  SUPABASE_URL=$SUPABASE_URL"
        echo "  SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_KEY"
        echo "  NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL"
        echo "  NODE_ENV=production"
        echo ""
        echo "Lalu deploy:"
        echo "  cd bot && railway up"
        echo ""
        ;;
        
    3)
        echo ""
        echo -e "${YELLOW}📦 Deploy All...${NC}"
        echo ""
        echo "Opsi ini akan menjalankan deployment secara berurutan:"
        echo "1. Deploy Frontend ke Vercel"
        echo "2. Deploy Bot ke Railway"
        echo "3. Setup Webhook Telegram"
        echo ""
        read -p "Lanjutkan? (y/n): " confirm
        
        if [ "$confirm" = "y" ]; then
            echo ""
            echo "🌐 Step 1: Deploy Frontend ke Vercel"
            echo "-------------------------------------"
            cd web
            echo "NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL" > .env.local
            echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY" >> .env.local
            echo "Environment configured. Run: vercel --prod"
            cd ..
            
            echo ""
            echo "🤖 Step 2: Deploy Bot ke Railway"
            echo "----------------------------------"
            echo "Run: cd bot && railway up"
            
            echo ""
            echo "🔧 Step 3: Setup Webhook"
            echo "------------------------"
            echo "Buka URL ini di browser:"
            echo "https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${WEBHOOK_DOMAIN}/webhook"
        fi
        ;;
        
    4)
        echo ""
        echo -e "${YELLOW}🔧 Setup Webhook Telegram...${NC}"
        echo ""
        
        if [ -z "$WEBHOOK_DOMAIN" ]; then
            read -p "Masukkan domain bot (contoh: https://bot.up.railway.app): " WEBHOOK_DOMAIN
        fi
        
        WEBHOOK_URL="${WEBHOOK_DOMAIN}/webhook"
        SETWEBHOOK_URL="https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${WEBHOOK_URL}"
        
        echo ""
        echo "Webhook URL: $WEBHOOK_URL"
        echo ""
        echo "Buka URL ini di browser untuk set webhook:"
        echo ""
        echo -e "${GREEN}$SETWEBHOOK_URL${NC}"
        echo ""
        echo "Atau jalankan:"
        echo "curl -X POST \"${SETWEBHOOK_URL}\""
        echo ""
        echo "Verifikasi webhook:"
        echo "https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo"
        echo ""
        ;;
        
    5)
        echo ""
        echo -e "${YELLOW}🧪 Testing Koneksi...${NC}"
        echo ""
        
        # Test Supabase connection
        echo "Testing Supabase connection..."
        curl -s -o /dev/null -w "%{http_code}" "$SUPABASE_URL/rest/v1/" -H "apikey: $SUPABASE_ANON_KEY" | grep -q "200\|401" && echo -e "${GREEN}✅ Supabase URL reachable${NC}" || echo -e "${RED}❌ Supabase URL not reachable${NC}"
        
        # Test Telegram Bot
        echo ""
        echo "Testing Telegram Bot..."
        BOT_INFO=$(curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getMe")
        if echo "$BOT_INFO" | grep -q "\"ok\":true"; then
            echo -e "${GREEN}✅ Bot token valid${NC}"
            BOT_USERNAME=$(echo "$BOT_INFO" | grep -o '"username":"[^"]*"' | cut -d'"' -f4)
            echo "  Bot username: @$BOT_USERNAME"
        else
            echo -e "${RED}❌ Bot token invalid${NC}"
        fi
        
        echo ""
        echo -e "${GREEN}✅ Testing selesai!${NC}"
        ;;
        
    *)
        echo ""
        echo -e "${RED}❌ Pilihan tidak valid${NC}"
        exit 1
        ;;
esac

echo ""
echo "🎉 Selesai!"
echo ""

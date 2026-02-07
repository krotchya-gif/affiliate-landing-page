# 🚀 Panduan Deployment Lengkap - Affiliate Landing Page

Panduan ini akan membantu kamu mendeploy project ini ke production step-by-step.

---

## 📋 Prerequisites (Sebelum Mulai)

Pastikan kamu punya akun di:
1. [GitHub](https://github.com) - Untuk menyimpan code
2. [Vercel](https://vercel.com) - Untuk deploy frontend
3. [Supabase](https://supabase.com) - Untuk database
4. [Railway](https://railway.app) atau [Render](https://render.com) - Untuk deploy bot
5. Telegram - Untuk bot (chat @BotFather)

---

## 🗄️ STEP 1: Setup Database Supabase

### 1.1 Buat Project Supabase

1. Login ke [Supabase Dashboard](https://app.supabase.com)
2. Klik **"New Project"**
3. Isi detail:
   - **Name:** `affiliate-store` (atau nama lain)
   - **Database Password:** Buat password kuat (simpan baik-baik!)
   - **Region:** `Southeast Asia (Singapore)` 
4. Klik **"Create New Project"**
5. Tunggu ~2 menit sampai project siap

### 1.2 Jalankan Database Schema

1. Di dashboard Supabase, klik **"SQL Editor"** (sidebar kiri)
2. Klik **"New Query"**
3. Copy-paste script SQL ini:

```sql
-- =====================================================
-- Database Schema untuk Affiliate Landing Page
-- =====================================================

-- Buat tabel products
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    price TEXT NOT NULL,
    image TEXT,
    platform VARCHAR(20) NOT NULL CHECK (platform IN ('TOKOPEDIA', 'SHOPEE', 'LAZADA')),
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Buat index untuk performa query
CREATE INDEX IF NOT EXISTS idx_products_platform ON products(platform);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous read access
CREATE POLICY "Allow anonymous read access" ON products
    FOR SELECT USING (true);

-- Policy: Allow service role to insert/update/delete
CREATE POLICY "Allow service role full access" ON products
    FOR ALL USING (auth.role() = 'service_role');

-- Function untuk update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger untuk auto-update updated_at
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

4. Klik **"Run"**

### 1.3 Copy Credentials

1. Buka **Project Settings** (icon gear) → **API**
2. Copy dan simpat credentials berikut:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** → `SUPABASE_ANON_KEY` 
   - **service_role secret** → `SUPABASE_SERVICE_KEY` ⚠️ **RAHASIA!**

---

## 🤖 STEP 2: Setup Telegram Bot

1. Buka Telegram dan chat [@BotFather](https://t.me/botfather)
2. Kirim perintah: `/newbot`
3. Ikuti instruksi:
   - Masukkan nama bot (contoh: "Affiliate Store")
   - Masukkan username bot (contoh: "affiliate_store_bot") → harus unik dan diakhiri "bot"
4. Copy **Bot Token** yang diberikan → `BOT_TOKEN`
5. Simpan baik-baik token ini!

---

## 📦 STEP 3: Push Code ke GitHub

```bash
# Pastikan di root folder project
git init
git add .
git commit -m "Initial commit"
git branch -M main

# Ganti YOUR_USERNAME dengan username GitHub kamu
git remote add origin https://github.com/YOUR_USERNAME/affiliate-landing-page.git
git push -u origin main
```

---

## 🌐 STEP 4: Deploy Frontend ke Vercel

### 4.1 Import Project

1. Login ke [Vercel](https://vercel.com)
2. Klik **"Add New Project"**
3. Klik **"Import Git Repository"** → Pilih repository GitHub kamu
4. Klik **"Import"**

### 4.2 Konfigurasi Project

- **Framework Preset:** `Next.js` (otomatis terdeteksi)
- **Root Directory:** `web` ⚠️ **PENTING!**
- **Build Command:** `npm run build` (default)

### 4.3 Environment Variables

Tambahkan environment variables di Vercel:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
NEXT_PUBLIC_SITE_NAME=Affiliate Store
REVALIDATE_SECRET=random_secret_key_here
```

### 4.4 Deploy

1. Klik **"Deploy"**
2. Tunggu build selesai (~2-3 menit)
3. Copy domain yang diberikan Vercel (contoh: `https://affiliate-store-xxx.vercel.app`)

✅ **Frontend berhasil deploy!**

---

## 🚂 STEP 5: Deploy Bot ke Railway (Recommended)

### 5.1 Create Project

1. Login ke [Railway](https://railway.app)
2. Klik **"New Project"**
3. Pilih **"Deploy from GitHub repo"**
4. Pilih repository kamu
5. Railway akan otomatis mendeteksi `railway.toml`

### 5.2 Environment Variables

Buka **Variables** tab, tambahkan:

```
BOT_TOKEN=your_telegram_bot_token
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
NODE_ENV=production
```

### 5.3 Generate Domain

1. Buka **Settings** tab
2. Di bagian **Environment**, klik **"Generate Domain"**
3. Copy domain yang diberikan (contoh: `https://affiliate-bot.up.railway.app`)
4. Tambahkan ke Variables: `WEBHOOK_DOMAIN=https://affiliate-bot.up.railway.app`
5. Railway akan redeploy otomatis

✅ **Bot berhasil deploy!**

---

## 🔧 STEP 6: Setup Webhook Telegram

Setelah bot dan web berjalan, setup webhook:

### Cara 1: Via Browser (Paling Mudah)

Buka URL ini di browser (ganti `<TOKEN>` dengan bot token kamu):

```
https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://affiliate-bot.up.railway.app/webhook
```

Contoh:
```
https://api.telegram.org/bot123456789:ABCdefGHIjklMNOpqrSTUvwxyz/setWebhook?url=https://affiliate-bot.up.railway.app/webhook
```

### Cara 2: Via cURL

```bash
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://affiliate-bot.up.railway.app/webhook"}'
```

### Verifikasi Webhook

Cek status webhook:
```
https://api.telegram.org/bot<TOKEN>/getWebhookInfo
```

Respons sukses:
```json
{
  "ok": true,
  "result": {
    "url": "https://affiliate-bot.up.railway.app/webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0
  }
}
```

---

## ✅ STEP 7: Testing

### Test Frontend

1. Buka URL Vercel kamu
2. Pastikan website muncul dengan mock data (jika belum ada produk)

### Test Bot

1. Buka Telegram, cari bot kamu
2. Kirim `/start` → harus muncul pesan welcome
3. Kirim `/manual` → ikuti flow untuk tambah produk manual
4. Kirim `/list` → harus muncul daftar produk
5. Cek website lagi → produk baru harus muncul

### Test Scraping (Opsional)

Kirim link produk ke bot:
- Tokopedia: `https://www.tokopedia.com/...`
- Shopee: `https://shopee.co.id/...`
- Lazada: `https://www.lazada.co.id/...`

⚠️ **Note:** Scraping sering gagal karena proteksi anti-bot. Gunakan `/manual` untuk hasil terbaik.

---

## 🆘 Troubleshooting

### Frontend tidak muncul produk
- Cek environment variables di Vercel
- Pastikan `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` benar
- Cek Supabase RLS policies (harus enable)

### Bot tidak merespon
- Cek `BOT_TOKEN` benar
- Cek webhook sudah diset
- Cek Railway logs: Dashboard → Deployments → View Logs

### Scraping gagal
- Normal, karena proteksi anti-bot
- Gunakan `/manual` untuk tambah produk

### Database error
- Pastikan schema SQL sudah dijalankan
- Cek credentials Supabase
- Pastikan RLS policies sudah dibuat

---

## 📊 Monitoring

### Railway Logs
```bash
railway logs
```

### Vercel Analytics
- Dashboard Vercel → Analytics → Enable

### Health Check
```
GET https://your-bot.up.railway.app/health
```
Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 1234
}
```

---

## 🎉 Selamat!

Sistem affiliate kamu sekarang sudah online! 🚀

**Alur kerja:**
1. Tambah produk via Telegram Bot (`/manual` atau kirim link)
2. Produk tersimpan di Supabase Database
3. Website otomatis menampilkan produk terbaru
4. Visitor klik produk → menuju link affiliate

---

**Butuh bantuan?** Cek [DEPLOYMENT.md](./DEPLOYMENT.md) untuk info lebih detail.

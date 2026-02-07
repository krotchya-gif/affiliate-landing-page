# 🚀 Panduan Deployment

Panduan lengkap untuk mendeploy Affiliate Landing Page ke Vercel (Web) dan Railway/Render (Bot).

---

## 📋 Prerequisites

- Akun [GitHub](https://github.com)
- Akun [Vercel](https://vercel.com)
- Akun [Railway](https://railway.app) atau [Render](https://render.com)
- Akun [Supabase](https://supabase.com)
- Bot Telegram (dari [@BotFather](https://t.me/botfather))

---

## 🗄️ Step 1: Setup Database Supabase

### 1.1 Buat Project
1. Login ke [Supabase Dashboard](https://app.supabase.com)
2. Klik "New Project"
3. Isi:
   - Name: `affiliate-store`
   - Database Password: (buat password kuat)
   - Region: `Southeast Asia (Singapore)`
4. Tunggu project siap (~2 menit)

### 1.2 Jalankan Schema
1. Buka **SQL Editor** (sidebar kiri)
2. Klik **New Query**
3. Copy-paste isi `database.sql`:

```sql
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    price TEXT NOT NULL,
    image TEXT,
    platform VARCHAR(20) NOT NULL CHECK (platform IN ('TOKOPEDIA', 'SHOPEE', 'LAZADA')),
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_platform ON products(platform);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read access" ON products
    FOR SELECT USING (true);

CREATE POLICY "Allow service role full access" ON products
    FOR ALL USING (auth.role() = 'service_role');
```

4. Klik **Run**

### 1.3 Copy Credentials
Buka **Project Settings > API**:
- `SUPABASE_URL` = Project URL
- `SUPABASE_ANON_KEY` = `anon` public
- `SUPABASE_SERVICE_KEY` = `service_role` secret

---

## 🤖 Step 2: Deploy Telegram Bot (Railway)

### 2.1 Fork ke GitHub
```bash
# Push ke GitHub repository Anda
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/affiliate-bot.git
git push -u origin main
```

### 2.2 Deploy ke Railway

1. Login ke [Railway](https://railway.app)
2. Klik **New Project** > **Deploy from GitHub repo**
3. Pilih repository Anda
4. Railway akan otomatis mendeteksi `railway.toml`

### 2.3 Environment Variables
Tambahkan di Railway Dashboard > Variables:

```env
BOT_TOKEN=your_telegram_bot_token
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
NEXT_PUBLIC_SITE_URL=https://your-site.vercel.app
NODE_ENV=production
WEBHOOK_DOMAIN=https://your-bot.up.railway.app
```

### 2.4 Generate Domain
1. Railway Dashboard > Settings
2. Klik **Generate Domain**
3. Copy domain (contoh: `https://bot-production.up.railway.app`)
4. Update `WEBHOOK_DOMAIN` dengan domain ini
5. Redeploy

---

## 🌐 Step 3: Deploy Web (Vercel)

### 3.1 Import Project
1. Login ke [Vercel](https://vercel.com)
2. Klik **Add New Project**
3. Import repository GitHub

### 3.2 Konfigurasi Build
- **Framework Preset**: Next.js
- **Root Directory**: `web`
- **Build Command**: `npm run build`

### 3.3 Environment Variables
Tambahkan:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
NEXT_PUBLIC_SITE_NAME=Affiliate Store
REVALIDATE_SECRET=your_random_secret_key
```

### 3.4 Deploy
Klik **Deploy** 🚀

---

## 🔧 Step 4: Setup Webhook Telegram

Setelah bot dan web berjalan, set webhook:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-bot.up.railway.app/webhook"}'
```

Atau buka URL:
```
https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://your-bot.up.railway.app/webhook
```

**Cek webhook aktif:**
```
https://api.telegram.org/bot<TOKEN>/getWebhookInfo
```

---

## ⚡ Optimasi Performa

### Caching (Vercel)
```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/',
        headers: [
          {
            key: 'Cache-Control',
            value: 's-maxage=60, stale-while-revalidate=300',
          },
        ],
      },
    ]
  },
}
```

### Image Optimization
```javascript
// next.config.js
images: {
  unoptimized: true, // Untuk static export
  // atau
  remotePatterns: [
    { hostname: 'images.tokopedia.net' },
    { hostname: 'cf.shopee.co.id' },
  ],
}
```

### Scraping Optimization
Bot sekarang menggunakan:
1. **API scraping** (prioritas) - lebih cepat & stealth
2. **Puppeteer fallback** - jika API gagal
3. **User-Agent rotasi** - menghindari deteksi
4. **Undici** - HTTP client yang lebih cepat

---

## 🆘 Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Bot tidak merespon | Cek `BOT_TOKEN` dan webhook URL |
| Scraping gagal | Update selectors di `scraper.js` |
| Produk tidak muncul | Cek Supabase RLS policies |
| Build gagal | Pastikan Node.js >= 18 |
| Puppeteer timeout | Naikkan timeout atau gunakan API mode |
| Memory limit | Tambah `NODE_OPTIONS=--max-old-space-size=4096` |

---

## 📊 Monitoring

### Railway Logs
```bash
railway logs
```

### Vercel Analytics
Aktifkan di dashboard Vercel > Analytics

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

## 🔒 Security Checklist

- [ ] `SUPABASE_SERVICE_KEY` jangan expose ke client
- [ ] `BOT_TOKEN` jangan commit ke GitHub
- [ ] Gunakan `REVALIDATE_SECRET` untuk API routes
- [ ] Enable RLS di Supabase
- [ ] Set webhook secret (opsional)

---

## 📝 Commands Reference

| Command | Deskripsi |
|---------|-----------|
| `/start` | Mulai bot |
| `/help` | Bantuan |
| `/list` | List produk |
| `/hapus [id]` | Hapus produk |

---

**Selamat! 🎉** Sistem affiliate Anda sekarang online!

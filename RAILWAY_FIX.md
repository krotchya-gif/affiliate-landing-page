# 🛠️ Fix Error Railway - Node.js & Environment Variables

Jika kamu mendapat error seperti ini:

```
⚠️  Node.js 18 and below are deprecated...
Error: supabaseUrl is required.
```

Ikuti langkah fix berikut:

---

## 🔧 STEP 1: Update Environment Variables di Railway

### 1.1 Buka Railway Dashboard
1. Login ke [railway.app](https://railway.app)
2. Pilih project bot kamu
3. Klik tab **"Variables"**

### 1.2 Tambah/Update Environment Variables

**WAJIB diisi (Required):**

```
BOT_TOKEN=your_telegram_bot_token_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here
NODE_ENV=production
PORT=3000
```

**OPSIONAL (Untuk Webhook):**

```
WEBHOOK_DOMAIN=https://your-bot.up.railway.app
NEXT_PUBLIC_SITE_URL=https://your-vercel-site.vercel.app
```

### 1.3 Cara Menambah Variable

1. Klik tombol **"+ New Variable"**
2. Masukkan **Name** dan **Value**
3. Klik **"Add"**
4. Ulangi untuk semua variables

⚠️ **PENTING:** Pastikan tidak ada spasi di awal/akhir value!

---

## 🔄 STEP 2: Redeploy Bot

Setelah mengupdate variables:

### Opsi A: Auto Deploy
Railway akan otomatis redeploy setelah variables diupdate.

### Opsi B: Manual Deploy
1. Klik tab **"Deployments"**
2. Klik tombol **"Redeploy"** (icon refresh)

### Opsi C: Deploy Ulang dari GitHub
1. Klik tab **"Settings"**
3. Scroll ke bawah ke bagian **"Source"**
4. Klik **"Redeploy"**

---

## 🐛 STEP 3: Cek Logs

Jika masih error, cek logs:

1. Klik tab **"Deployments"**
2. Klik deployment terbaru
3. Klik **"View Logs"**

Cari pesan error yang muncul.

---

## ✅ STEP 4: Verifikasi Health Check

Setelah deploy berhasil, test health check:

```
https://your-bot.up.railway.app/health
```

Response yang benar:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123
}
```

---

## 🔧 Troubleshooting

### Error: "supabaseUrl is required"

**Penyebab:** Variable `SUPABASE_URL` tidak ter-set

**Fix:**
1. Cek Variables tab → pastikan `SUPABASE_URL` ada
2. Pastikan value benar (contoh: `https://abcdef123.supabase.co`)
3. Redeploy

---

### Error: "BOT_TOKEN is not set"

**Penyebab:** Variable `BOT_TOKEN` tidak ter-set

**Fix:**
1. Cek Variables tab → pastikan `BOT_TOKEN` ada
2. Pastikan token valid (dari @BotFather)
3. Redeploy

---

### Error: "Cannot find module 'telegraf'"

**Penyebab:** Dependencies belum di-install

**Fix:**
1. Cek apakah `package.json` ada di folder `bot/`
2. Tambah build command di Railway:
   - Buka Settings → Build
   - Build Command: `cd bot && npm install`
   - Start Command: `cd bot && npm start`

---

### Error: "Port already in use"

**Penyebab:** Port conflict

**Fix:**
1. Pastikan variable `PORT=3000` di-set
2. Jangan hardcode port di code
3. Gunakan `process.env.PORT` di code

---

## 📋 Checklist Environment Variables

Pastikan semua ini sudah diisi di Railway Variables:

- [ ] `BOT_TOKEN` - Token dari @BotFather
- [ ] `SUPABASE_URL` - URL Supabase project
- [ ] `SUPABASE_SERVICE_KEY` - Service role key (bukan anon key!)
- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `3000`
- [ ] `WEBHOOK_DOMAIN` - Domain Railway bot (opsional untuk webhook)

---

## 🚀 Quick Fix Command

Jika ingin deploy ulang total:

```bash
# Di Railway CLI
railway login
railway link
railway up
```

---

## 🆘 Masih Error?

Jika masih ada masalah:

1. **Cek format URL Supabase:**
   - ❌ Salah: `https://your-project.supabase.co/`
   - ✅ Benar: `https://your-project.supabase.co`
   (Tanpa trailing slash!)

2. **Cek Service Key:**
   - Pastikan pakai `service_role` key (bukan `anon` key)
   - Service key ada di: Supabase → Project Settings → API → service_role secret

3. **Redeploy Manual:**
   - Railway Dashboard → Deployments → ⋮ → Redeploy

4. **Check Build Logs:**
   - Railway Dashboard → Deployments → Klik deployment → View Logs

---

## 📝 Catatan Penting

### Perbedaan Anon Key vs Service Key

| Key | Gunakan Untuk | Railway Bot |
|-----|---------------|-------------|
| `anon` key | Frontend (read-only) | ❌ Jangan |
| `service_role` key | Backend (full access) | ✅ Wajib |

**Kenapa service key?**
- Bot perlu insert/update/delete data
- Service key bypass RLS (Row Level Security)
- Anon key hanya bisa read (SELECT)

---

## ✅ Verifikasi Setelah Fix

1. Health check berhasil:
   ```
   curl https://your-bot.up.railway.app/health
   ```

2. Webhook ter-set:
   ```
   https://api.telegram.org/bot<TOKEN>/getWebhookInfo
   ```

3. Bot merespon di Telegram:
   - Kirim `/start` ke bot
   - Harus muncul pesan welcome

---

**Selamat! 🎉** Bot kamu sekarang harusnya sudah running!

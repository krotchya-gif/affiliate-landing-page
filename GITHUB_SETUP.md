# 🚀 Setup GitHub Auto-Deploy

Panduan setup auto-deploy ke Vercel dan Railway via GitHub Actions.

---

## 📋 Prerequisites

- Akun GitHub (sudah login)
- Akun Vercel (sudah login)
- Akun Railway (sudah login)
- Repository sudah push ke GitHub

---

## 🛠️ Step 1: Setup GitHub Repository

### 1.1 Buat Repository Baru
```bash
# Jika belum ada repo
git remote add origin https://github.com/YOUR_USERNAME/affiliate-landing-page.git
git branch -M main
git push -u origin main
```

### 1.2 Setup Secrets di GitHub
Buka: `https://github.com/YOUR_USERNAME/affiliate-landing-page/settings/secrets/actions`

Klik **"New repository secret"** dan tambahkan:

#### Secrets untuk Vercel:
| Secret Name | Cara Mendapatkan |
|-------------|------------------|
| `VERCEL_TOKEN` | `vercel tokens create` di terminal |
| `VERCEL_ORG_ID` | Lihat di `.vercel/project.json` setelah `vercel link` |
| `VERCEL_PROJECT_ID` | Lihat di `.vercel/project.json` setelah `vercel link` |

#### Secrets untuk Railway:
| Secret Name | Cara Mendapatkan |
|-------------|------------------|
| `RAILWAY_TOKEN` | `railway login` kemudian buat token di dashboard |

---

## 🚀 Step 2: Setup Vercel

### 2.1 Link Project
```bash
cd web
vercel link
```
Pilih:
- Set up "web"? **Yes**
- Link to existing project? **No**
- Project name: **affiliate-web**

### 2.2 Get Vercel IDs
Setelah link, cek file:
```bash
cat .vercel/project.json
```
Output:
```json
{
  "orgId": "YOUR_ORG_ID",
  "projectId": "YOUR_PROJECT_ID"
}
```

Copy ke GitHub Secrets.

### 2.3 Get Vercel Token
```bash
vercel tokens create
```
Nama token: `github-actions`
Copy token ke GitHub Secrets `VERCEL_TOKEN`.

---

## 🚂 Step 3: Setup Railway

### 3.1 Login dan Buat Project
```bash
railway login
railway init
```
Pilih:
- Empty project
- Name: `affiliate-bot`

### 3.2 Deploy Manual Pertama
```bash
cd bot
railway up
```

### 3.3 Generate Domain
```bash
railway domain
```
Copy domain untuk webhook Telegram.

### 3.4 Setup Environment Variables
```bash
railway variables set BOT_TOKEN=your_token
railway variables set SUPABASE_URL=your_url
railway variables set SUPABASE_SERVICE_KEY=your_key
railway variables set WEBHOOK_DOMAIN=https://your-domain.up.railway.app
railway variables set NODE_ENV=production
```

### 3.5 Get Railway Token
Buka: https://railway.app/account/tokens

Klik **"New Token"**:
- Name: `github-actions`
- Project: `affiliate-bot`

Copy token ke GitHub Secrets `RAILWAY_TOKEN`.

---

## 🔄 Step 4: Auto-Deploy Aktif!

Setiap kali push ke branch `main`:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

GitHub Actions akan otomatis:
1. ✅ Deploy Web ke Vercel
2. ✅ Deploy Bot ke Railway

Cek status di: `https://github.com/YOUR_USERNAME/affiliate-landing-page/actions`

---

## 📝 Summary Secrets

Buka: `https://github.com/YOUR_USERNAME/affiliate-landing-page/settings/secrets/actions`

Tambahkan 4 secrets:

```
VERCEL_TOKEN=xxxxxxxx
VERCEL_ORG_ID=xxxxxxxx
VERCEL_PROJECT_ID=xxxxxxxx
RAILWAY_TOKEN=xxxxxxxx
```

---

## 🎉 Selesai!

Setiap push ke GitHub akan otomatis deploy! 🚀

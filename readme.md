# 🚀 Auto-Update Affiliate Landing Page (Milkshake Style)

Sistem otomatisasi landing page affiliate yang terintegrasi dengan Telegram Bot. Cukup kirim link produk e-commerce ke Bot, dan website "Link-in-Bio" kamu akan terupdate secara otomatis dengan hasil scraping produk terbaru.

## ✨ Fitur Utama

- **🤖 Automated Scraping:** Mengambil nama, harga, dan gambar produk secara otomatis dari link e-commerce.
- **💬 Telegram Control:** Management konten langsung dari chat Telegram (tanpa perlu buka dashboard/coding).
- **🎨 Milkshake Style UI:** Tampilan website yang bersih, estetis, dan mobile-first (mirip milkshake.app).
- **⚡ Real-time Update:** Produk yang di-input langsung muncul di website.

## 🛠️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Frontend** | [Next.js 14](https://nextjs.org/) (App Router) & [Tailwind CSS](https://tailwindcss.com/) |
| **Backend/Bot** | [Node.js](https://nodejs.org/) & [Telegraf.js](https://telegraf.js.org/) |
| **Scraper** | [Puppeteer](https://pptr.dev/) (Headless Browser) |
| **Database** | [Supabase](https://supabase.com/) (PostgreSQL) |
| **Deployment** | Vercel (Frontend) & Railway/Render (Bot) |

## 📁 Struktur Folder

```text
├── bot/                      # Telegram Bot & Scraper
│   ├── index.js              # Entry point bot (commands & handlers)
│   ├── scraper.js            # Puppeteer scraping logic
│   ├── supabase.js           # Database integration
│   └── package.json
├── web/                      # Next.js Frontend
│   ├── app/                  # Next.js App Router
│   │   ├── api/products/     # API Routes
│   │   │   └── route.ts      # REST API untuk produk
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Homepage (Server Component)
│   │   └── globals.css       # Global styles
│   ├── components/           # React Components
│   │   ├── Header.tsx        # Navigation header
│   │   ├── ProductCard.tsx   # Product card component
│   │   └── Footer.tsx        # Footer component
│   ├── lib/                  # Utilities
│   │   └── supabase.ts       # Supabase client & functions
│   ├── next.config.js        # Next.js config
│   ├── tailwind.config.js    # Tailwind config
│   └── package.json
├── database.sql              # Database schema
├── .env                      # Environment variables
├── .env.example              # Environment template
├── DEPLOYMENT.md             # Panduan deployment lengkap
└── readme.md                 # Dokumentasi ini
```

## 🚀 Quick Start

### 1. Clone & Install

```bash
# Clone repository
git clone https://github.com/username/affiliate-landing-page.git
cd affiliate-landing-page

# Install dependencies
## Bot
cd bot && npm install

## Frontend
cd ../web && npm install
```

### 2. Setup Environment

```bash
# Copy template
cp .env.example .env

# Edit .env dan isi semua variabel
```

### 3. Setup Database

1. Buat project di [Supabase](https://supabase.com)
2. Jalankan script `database.sql` di SQL Editor
3. Copy API keys ke `.env`

### 4. Setup Telegram Bot

1. Chat [@BotFather](https://t.me/botfather)
2. Buat bot baru (`/newbot`)
3. Copy token ke `BOT_TOKEN` di `.env`

### 5. Jalankan Development

```bash
# Terminal 1 - Jalankan Bot
cd bot
npm run dev

# Terminal 2 - Jalankan Frontend
cd web
npm run dev
```

## 📱 Cara Penggunaan

### Via Telegram Bot

1. **Start Bot**: Kirim `/start` untuk melihat panduan
2. **Tambah Produk**: Kirim link produk Tokopedia/Shopee/Lazada
3. **List Produk**: Kirim `/list` untuk melihat semua produk
4. **Hapus Produk**: Kirim `/hapus [id]` untuk menghapus produk

### Via Website

- Buka `http://localhost:3000`
- Produk otomatis muncul setelah ditambahkan via bot
- Klik produk untuk menuju ke link affiliate

## 🌐 Deployment

Lihat [DEPLOYMENT.md](DEPLOYMENT.md) untuk panduan deployment lengkap ke:
- 🟢 Vercel (Frontend)
- 🚂 Railway / Render (Bot)
- 🗄️ Supabase (Database)

## 🛡️ Environment Variables

| Variable | Deskripsi | Dibutuhkan Oleh |
|----------|-----------|-----------------|
| `BOT_TOKEN` | Token dari @BotFather | Bot |
| `SUPABASE_URL` | Project URL Supabase | Bot & Web |
| `SUPABASE_ANON_KEY` | Public API key Supabase | Web |
| `SUPABASE_SERVICE_KEY` | Secret service role key | Bot |
| `NEXT_PUBLIC_*` | Public env untuk Next.js | Web |

## 📝 Commands Reference

| Command | Deskripsi |
|---------|-----------|
| `/start` | Memulai bot & melihat panduan |
| `/help` | Menampilkan bantuan |
| `/list` | Melihat daftar produk |
| `/hapus [id]` | Menghapus produk berdasarkan ID |

## 🤝 Kontribusi

Pull request sangat diterima! Untuk perubahan besar, silakan buka issue dulu untuk diskusi.

## 📄 License

[MIT](LICENSE)

---

Made with ❤️ in Indonesia

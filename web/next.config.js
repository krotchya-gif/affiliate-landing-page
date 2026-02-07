/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    locales: ['id', 'en'],
    defaultLocale: 'id',
    localeDetection: true,
  },
  images: {
    domains: [
      'images.tokopedia.net', 
      'cf.shopee.co.id', 
      'laz-img-sg.alicdn.com',
      'via.placeholder.com',
      'images.unsplash.com',
      'down-id.img.susercontent.com',
      'img.lazcdn.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.tokopedia.net',
      },
      {
        protocol: 'https',
        hostname: '**.shopee.co.id',
      },
      {
        protocol: 'https',
        hostname: '**.lazada.co.id',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true, // Untuk static export jika diperlukan
  },
  // Static export opsional
  // output: 'export',
  // distDir: 'dist',
  
  // Experimental features
  experimental: {
    serverActions: true,
  },
  
  // Environment variables yang tersedia di client
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME,
  },
}

module.exports = nextConfig

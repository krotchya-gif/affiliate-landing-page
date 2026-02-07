const { fetch } = require('undici');

// Coba import puppeteer (opsional)
let puppeteer = null;
try {
  puppeteer = require('puppeteer-core');
} catch (e) {
  console.log('Puppeteer tidak tersedia');
}

// User-Agent rotasi
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Fungsi utama scraping
 */
async function scrapeProduct(url) {
  const platform = detectPlatform(url);
  
  if (platform === 'unknown') {
    throw new Error('Platform tidak didukung');
  }

  console.log(`[${platform}] 🔍 Scraping: ${url.substring(0, 80)}...`);

  // Coba API mode dulu
  try {
    const apiData = await scrapeViaAPI(url, platform);
    if (apiData && apiData.name && apiData.name !== 'Nama Produk Tidak Ditemukan') {
      console.log(`[${platform}] ✅ API mode berhasil`);
      return { ...apiData, platform: platform.toUpperCase(), url, scrapedAt: new Date().toISOString() };
    }
  } catch (err) {
    console.log(`[${platform}] ⚠️ API gagal:`, err.message);
  }

  // Coba Puppeteer
  if (puppeteer) {
    try {
      console.log(`[${platform}] 🖥️  Mencoba Puppeteer...`);
      return await scrapeWithPuppeteer(url, platform);
    } catch (err) {
      console.log(`[${platform}] ⚠️ Puppeteer gagal:`, err.message);
    }
  }

  // Fallback terakhir
  return extractFromUrl(url, platform);
}

/**
 * Scrape via API/fetch
 */
async function scrapeViaAPI(url, platform) {
  const headers = {
    'User-Agent': getRandomItem(USER_AGENTS),
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  };

  switch (platform) {
    case 'tokopedia':
      return await scrapeTokopedia(url, headers);
    case 'shopee':
      return await scrapeShopee(url, headers);
    case 'lazada':
      return await scrapeLazada(url, headers);
    default:
      return null;
  }
}

/**
 * Tokopedia Scraper
 */
async function scrapeTokopedia(url, headers) {
  const response = await fetch(url, { 
    headers: { ...headers, 'Referer': 'https://www.google.com/' },
    redirect: 'follow'
  });
  
  const html = await response.text();
  
  // Multiple patterns untuk nama
  const namePatterns = [
    /<meta[^>]*property="og:title"[^>]*content="([^"]*)"/i,
    /<meta[^>]*name="twitter:title"[^>]*content="([^"]*)"/i,
    /<h1[^>]*data-testid="pdpProductName"[^>]*>([^<]*)<\/h1>/i,
    /<h1[^>]*>([^<]{10,200})<\/h1>/i,
    /"productName":"([^"]{5,200})"/,
    /<title>([^<|]{5,200})/i
  ];

  // Multiple patterns untuk harga
  const pricePatterns = [
    /<meta[^>]*property="product:price:amount"[^>]*content="([^"]*)"/i,
    /"price":"([0-9.,]+)"/,
    /"priceValue":([0-9]+)/,
    /Rp[\s]?([0-9.,]+)/i,
    /class="[^"]*price[^"]*"[^>]*>Rp\.?\s*([0-9.,]+)/i
  ];

  // Multiple patterns untuk gambar
  const imagePatterns = [
    /<meta[^>]*property="og:image"[^>]*content="([^"]*)"/i,
    /<meta[^>]*name="twitter:image"[^>]*content="([^"]*)"/i,
    /"imageUrl":"([^"]+)"/,
    /<img[^>]*data-testid="PDPMainImage"[^>]*src="([^"]*)"/i
  ];

  let name = extractWithPatterns(html, namePatterns);
  let price = extractWithPatterns(html, pricePatterns);
  let image = extractWithPatterns(html, imagePatterns);

  // Bersihkan data
  if (name) {
    name = name.replace(/\\u002F/g, '/').replace(/\\"/g, '"').replace(/\s+/g, ' ').trim();
    name = name.replace(/\s*[|\-–]\s*Tokopedia.*/i, '').replace(/\s*\|\s*Dijual.*/i, '');
  }

  if (price) {
    price = price.replace(/[^0-9]/g, '');
    if (price) {
      price = 'Rp ' + parseInt(price).toLocaleString('id-ID');
    }
  }

  console.log('[tokopedia] Debug:', { name: name?.substring(0, 50), price, image: image?.substring(0, 50) });

  return { name: name || 'Nama Produk Tidak Ditemukan', price: price || 'Harga tidak tersedia', image };
}

/**
 * Shopee Scraper
 */
async function scrapeShopee(url, headers) {
  // Coba ekstrak dari API Shopee
  const match = url.match(/-i\.(\d+)\.(\d+)/);
  
  if (match) {
    const [, shopId, itemId] = match;
    try {
      const apiUrl = `https://shopee.co.id/api/v4/item/get?itemid=${itemId}&shopid=${shopId}`;
      const resp = await fetch(apiUrl, {
        headers: {
          ...headers,
          'Referer': url,
          'x-api-source': 'pc',
          'x-requested-with': 'XMLHttpRequest'
        }
      });
      
      const data = await resp.json();
      if (data.data) {
        const item = data.data;
        const name = item.name;
        const price = item.price ? 'Rp ' + Math.floor(item.price / 100000).toLocaleString('id-ID') : 'Harga tidak tersedia';
        const image = item.images?.[0] ? `https://down-id.img.susercontent.com/file/${item.images[0]}` : '';
        
        console.log('[shopee] API berhasil:', { name: name?.substring(0, 50), price });
        return { name, price, image };
      }
    } catch (e) {
      console.log('[shopee] API error:', e.message);
    }
  }

  // Fallback ke HTML scraping
  const response = await fetch(url, { headers: { ...headers, 'Referer': 'https://shopee.co.id/' } });
  const html = await response.text();

  const namePatterns = [
    /<meta[^>]*property="og:title"[^>]*content="([^"]*)"/i,
    /"name":"([^"]{5,200})",/,
    /<div[^>]*class="[^"]*_1nHzH4[^"]*"[^>]*>([^<]*)/i,
    /<title>([^<|]{5,200})/i
  ];

  const pricePatterns = [
    /"price":([0-9]+)/,
    /"price_min":([0-9]+)/,
    /Rp[\s]?([0-9.,]+)/i,
    /<div[^>]*class="[^"]*_2Shl1j[^"]*"[^>]*>([^<]*)/i
  ];

  const imagePatterns = [
    /<meta[^>]*property="og:image"[^>]*content="([^"]*)"/i,
    /"image":"([^"]*)"/,
    /<img[^>]*class="[^"]*_3iW4K7[^"]*"[^>]*src="([^"]*)"/i
  ];

  let name = extractWithPatterns(html, namePatterns);
  let price = extractWithPatterns(html, pricePatterns);
  let image = extractWithPatterns(html, imagePatterns);

  // Bersihkan data
  if (name) {
    name = name.replace(/\\u002F/g, '/').replace(/\\"/g, '"').replace(/\s+/g, ' ').trim();
    name = name.replace(/\s*[|\-–]\s*Shopee.*/i, '');
  }

  if (price) {
    const num = parseInt(price.replace(/[^0-9]/g, ''));
    if (num > 1000) {
      price = 'Rp ' + Math.floor(num / 100000).toLocaleString('id-ID');
    } else {
      price = 'Rp ' + num.toLocaleString('id-ID');
    }
  }

  // Fix image URL
  if (image && !image.startsWith('http')) {
    image = 'https://cf.shopee.co.id/file/' + image;
  }

  console.log('[shopee] Debug:', { name: name?.substring(0, 50), price, image: image?.substring(0, 50) });

  return { name: name || 'Nama Produk Tidak Ditemukan', price: price || 'Harga tidak tersedia', image };
}

/**
 * Lazada Scraper
 */
async function scrapeLazada(url, headers) {
  const response = await fetch(url, { headers: { ...headers, 'Referer': 'https://www.google.com/' } });
  const html = await response.text();

  const namePatterns = [
    /<meta[^>]*property="og:title"[^>]*content="([^"]*)"/i,
    /<meta[^>]*name="description"[^>]*content="([^"]{10,200})/i,
    /<h1[^>]*>([^<]{5,200})<\/h1>/i,
    /<title>([^<|]{5,200})/i,
    /"itemName":"([^"]{5,200})"/
  ];

  const pricePatterns = [
    /<meta[^>]*property="product:price:amount"[^>]*content="([^"]*)"/i,
    /"salePrice":\{[^}]*"value":([0-9.]+)/,
    /"price":([0-9.]+)/,
    /Rp[\s]?([0-9.,]+)/i,
    /class="pdp-price"[^>]*>([^<]+)/i
  ];

  const imagePatterns = [
    /<meta[^>]*property="og:image"[^>]*content="([^"]*)"/i,
    /"image":"([^"]*)"/,
    /<img[^>]*class="pdp-mod-common-image"[^>]*src="([^"]*)"/i
  ];

  let name = extractWithPatterns(html, namePatterns);
  let price = extractWithPatterns(html, pricePatterns);
  let image = extractWithPatterns(html, imagePatterns);

  if (name) {
    name = name.replace(/\\u002F/g, '/').replace(/\s+/g, ' ').trim();
    name = name.replace(/\s*[|\-–]\s*Lazada.*/i, '').replace(/Buy\s+/i, '');
  }

  if (price) {
    const num = parseFloat(price.replace(/[^0-9.]/g, ''));
    if (!isNaN(num)) {
      price = 'Rp ' + num.toLocaleString('id-ID');
    }
  }

  console.log('[lazada] Debug:', { name: name?.substring(0, 50), price, image: image?.substring(0, 50) });

  return { name: name || 'Nama Produk Tidak Ditemukan', price: price || 'Harga tidak tersedia', image };
}

/**
 * Helper: extract dengan multiple patterns
 */
function extractWithPatterns(html, patterns) {
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      let result = match[1].trim();
      // Decode HTML entities
      result = result.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
      if (result.length > 2) return result;
    }
  }
  return null;
}

/**
 * Deteksi platform
 */
function detectPlatform(url) {
  if (url.includes('tokopedia.com')) return 'tokopedia';
  if (url.includes('shopee.co.id') || url.includes('shopee.com')) return 'shopee';
  if (url.includes('lazada.co.id') || url.includes('lazada.com')) return 'lazada';
  return 'unknown';
}

/**
 * Fallback: extract dari URL
 */
function extractFromUrl(url, platform) {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    
    // Ekstrak dari path URL
    let name = path.split('/').pop()
      .replace(/-/g, ' ')
      .replace(/_/g, ' ')
      .replace(/\.html?$/i, '')
      .replace(/\b\w/g, l => l.toUpperCase());

    if (!name || name.length < 3) {
      name = `Produk ${platform.charAt(0).toUpperCase() + platform.slice(1)}`;
    }

    return {
      name,
      price: 'Harga tidak tersedia',
      image: '',
      platform: platform.toUpperCase(),
      url,
      scrapedAt: new Date().toISOString()
    };
  } catch (e) {
    return {
      name: 'Nama Produk Tidak Ditemukan',
      price: 'Harga tidak tersedia',
      image: '',
      platform: platform.toUpperCase(),
      url,
      scrapedAt: new Date().toISOString()
    };
  }
}

/**
 * Puppeteer scraping (fallback)
 */
async function scrapeWithPuppeteer(url, platform) {
  if (!puppeteer) throw new Error('Puppeteer tidak tersedia');

  const executablePath = await findChrome();
  if (!executablePath) throw new Error('Chrome tidak ditemukan');

  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(getRandomItem(USER_AGENTS));
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 3000));

    const result = await page.evaluate((platform) => {
      let name = '', price = '', image = '';

      if (platform === 'tokopedia') {
        name = document.querySelector('[data-testid="pdpProductName"]')?.textContent ||
               document.querySelector('h1')?.textContent || '';
        price = document.querySelector('[data-testid="pdpProductPrice"]')?.textContent ||
                document.querySelector('[data-testid="lblPDPDetailProductPrice"]')?.textContent || '';
        image = document.querySelector('[data-testid="PDPMainImage"] img')?.src || '';
      } else if (platform === 'shopee') {
        name = document.querySelector('._1nHzH4')?.textContent ||
               document.querySelector('[data-sqe="name"]')?.textContent ||
               document.querySelector('h1')?.textContent || '';
        price = document.querySelector('._2Shl1j')?.textContent ||
                document.querySelector('[data-sqe="price"]')?.textContent || '';
        image = document.querySelector('._3iW4K7 img')?.src ||
                document.querySelector('[data-sqe="image"] img')?.src || '';
      } else if (platform === 'lazada') {
        name = document.querySelector('[data-tracking="product-name"]')?.textContent ||
               document.querySelector('.pdp-mod-product-badge-title')?.textContent ||
               document.querySelector('h1')?.textContent || '';
        price = document.querySelector('[data-tracking="product-price"]')?.textContent ||
                document.querySelector('.pdp-price')?.textContent || '';
        image = document.querySelector('.pdp-mod-common-image img')?.src || '';
      }

      return { name: name.trim(), price: price.trim(), image };
    }, platform);

    // Bersihkan hasil
    if (result.name) {
      result.name = result.name.replace(/\s*[|\-–]\s*(Tokopedia|Shopee|Lazada).*/i, '').trim();
    }

    if (!result.price?.includes('Rp') && result.price) {
      result.price = 'Rp ' + result.price;
    }

    return {
      ...result,
      platform: platform.toUpperCase(),
      url,
      scrapedAt: new Date().toISOString()
    };

  } finally {
    await browser.close();
  }
}

/**
 * Cari Chrome
 */
async function findChrome() {
  const fs = require('fs');
  
  const paths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ];

  for (const p of paths) {
    if (fs.existsSync(p)) return p;
  }

  try {
    const { execSync } = require('child_process');
    const result = execSync('reg query "HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\App Paths\\chrome.exe" /ve', { encoding: 'utf8' });
    const match = result.match(/REG_SZ\s+(.+)$/m);
    if (match && fs.existsSync(match[1].trim())) return match[1].trim();
  } catch (e) {}

  return null;
}

module.exports = { scrapeProduct, detectPlatform };

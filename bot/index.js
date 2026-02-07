const { Telegraf, Scenes, session } = require('telegraf');
const { scrapeProduct, detectPlatform } = require('./scraper');
const { saveProduct, getAllProducts, deleteProduct, getProductById } = require('./supabase');
require('dotenv').config();

// Scene untuk manual input
const { BaseScene, Stage } = Scenes;

// Scene: Input nama produk
const manualNameScene = new BaseScene('manual_name');
manualNameScene.enter((ctx) => ctx.reply('📝 Masukkan nama produk:'));
manualNameScene.on('text', (ctx) => {
  ctx.session.manualProduct = { name: ctx.message.text };
  return ctx.scene.enter('manual_price');
});

// Scene: Input harga
const manualPriceScene = new BaseScene('manual_price');
manualPriceScene.enter((ctx) => ctx.reply('💰 Masukkan harga (contoh: Rp 150.000):'));
manualPriceScene.on('text', (ctx) => {
  ctx.session.manualProduct.price = ctx.message.text;
  return ctx.scene.enter('manual_image');
});

// Scene: Input gambar (opsional)
const manualImageScene = new BaseScene('manual_image');
manualImageScene.enter((ctx) => ctx.reply('🖼️ Kirim foto produk (atau ketik "skip"):'));
manualImageScene.on('photo', async (ctx) => {
  const photo = ctx.message.photo[ctx.message.photo.length - 1];
  ctx.session.manualProduct.image = photo.file_id;
  return ctx.scene.enter('manual_platform');
});
manualImageScene.on('text', (ctx) => {
  if (ctx.message.text.toLowerCase() === 'skip') {
    ctx.session.manualProduct.image = '';
  }
  return ctx.scene.enter('manual_platform');
});

// Scene: Input platform
const manualPlatformScene = new BaseScene('manual_platform');
manualPlatformScene.enter((ctx) => {
  return ctx.reply('🛒 Pilih platform:', {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🟢 Tokopedia', callback_data: 'TOKOPEDIA' }],
        [{ text: '🟠 Shopee', callback_data: 'SHOPEE' }],
        [{ text: '🔵 Lazada', callback_data: 'LAZADA' }]
      ]
    }
  });
});
manualPlatformScene.on('callback_query', async (ctx) => {
  ctx.session.manualProduct.platform = ctx.callbackQuery.data;
  ctx.session.manualProduct.url = ctx.session.manualProduct.url || '#';
  
  await ctx.answerCbQuery();
  
  try {
    const saved = await saveProduct(ctx.session.manualProduct);
    await ctx.reply(
      `✅ *Produk Berhasil Disimpan!*\n\n` +
      `📦 *Nama:* ${ctx.session.manualProduct.name}\n` +
      `💰 *Harga:* ${ctx.session.manualProduct.price}\n` +
      `🛒 *Platform:* ${ctx.session.manualProduct.platform}\n` +
      `🆔 *ID:* \`${saved.id}\``, 
      { parse_mode: 'Markdown' }
    );
  } catch (err) {
    await ctx.reply('❌ Gagal menyimpan: ' + err.message);
  }
  
  return ctx.scene.leave();
});

// Setup stage
const stage = new Stage([manualNameScene, manualPriceScene, manualImageScene, manualPlatformScene]);

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.use(session());
bot.use(stage.middleware());

// Commands
bot.start((ctx) => {
  ctx.reply(
    `👋 Halo ${ctx.from.first_name}!\n\n` +
    `*Affiliate Bot* 🚀\n\n` +
    `📋 *Cara pakai:*\n` +
    `1️⃣ Kirim link produk (auto scraping)\n` +
    `2️⃣ Atau /manual untuk input manual\n\n` +
    `🛒 *Platform:* Tokopedia, Shopee, Lazada\n\n` +
    `⚠️ *Note:* Scraping sering gagal karena proteksi anti-bot. Gunakan /manual saja.`,
    { parse_mode: 'Markdown' }
  );
});

bot.help((ctx) => {
  ctx.reply(
    `🆘 *Bantuan*\n\n` +
    `/start - Mulai bot\n` +
    `/help - Bantuan ini\n` +
    `/manual - Tambah produk manual\n` +
    `/list - Lihat produk\n` +
    `/hapus [id] - Hapus produk\n\n` +
    `💡 Tips: Gunakan /manual untuk hasil terbaik`,
    { parse_mode: 'Markdown' }
  );
});

bot.command('manual', (ctx) => ctx.scene.enter('manual_name'));

bot.command('list', async (ctx) => {
  try {
    ctx.reply('⏳ Mengambil data...');
    const products = await getAllProducts();
    
    if (products.length === 0) return ctx.reply('📭 Belum ada produk. Ketik /manual untuk tambah.');
    
    let msg = `📦 *${products.length} Produk*\n\n`;
    products.slice(0, 10).forEach((p, i) => {
      const name = p.name?.substring(0, 40) || 'Tanpa Nama';
      msg += `${i+1}. *${name}${p.name?.length > 40 ? '...' : ''}*\n`;
      msg += `   💰 ${p.price || '-'} | 🛒 ${p.platform}\n`;
      msg += `   🆔 \`${p.id}\`\n\n`;
    });
    
    msg += '\n🗑️ Untuk hapus: /hapus [id]';
    
    ctx.reply(msg, { parse_mode: 'Markdown' });
  } catch (err) {
    ctx.reply('❌ Error: ' + err.message);
  }
});

bot.command('hapus', async (ctx) => {
  const id = ctx.message.text.split(' ')[1];
  if (!id) return ctx.reply('⚠️ Format: /hapus [id]\n\nContoh: /hapus 123e4567-e89b-12d3...');
  
  try {
    const product = await getProductById(id);
    if (!product) return ctx.reply('❌ Produk tidak ditemukan');
    
    await deleteProduct(id);
    ctx.reply(
      `✅ *Produk Dihapus*\n\n` +
      `📦 ${product.name?.substring(0, 50)}`,
      { parse_mode: 'Markdown' }
    );
  } catch (err) {
    ctx.reply('❌ Gagal: ' + err.message);
  }
});

// Handle link produk
bot.on('text', async (ctx) => {
  const text = ctx.message.text;
  const platform = detectPlatform(text);
  
  if (platform === 'unknown') {
    return ctx.reply('⚠️ Kirim link Tokopedia/Shopee/Lazada atau ketik /manual');
  }

  const processing = await ctx.reply('⏳ Mencoba scraping...\n⚠️ Biasanya gagal karena anti-bot');
  
  try {
    const product = await scrapeProduct(text);
    
    // Cek jika scraping gagal - JANGAN SIMPAN
    if (!product.name || 
        product.name === 'Nama Produk Tidak Ditemukan' ||
        product.name.includes('shopee__') ||
        product.name.includes('lazada') && product.name.length < 10 ||
        product.name.includes('tokopedia') && product.name.length < 10 ||
        product.name.includes('Maaf!') ||
        product.name.includes('tidak tersedia')) {
      
      await ctx.deleteMessage(processing.message_id);
      
      // Simpan URL untuk manual input
      ctx.session.manualProduct = { url: text };
      
      return ctx.reply(
        `⚠️ *Scraping gagal* (website dilindungi anti-bot)\n\n` +
        `💡 *Solusi:* Gunakan /manual untuk input data sendiri\n\n` +
        `Keuntungan /manual:\n` +
        `• Nama & harga akurat\n` +
        `• Bisa pilih foto sendiri\n` +
        `• Tidak perlu tunggu scraping`,
        { parse_mode: 'Markdown' }
      );
    }
    
    // Scraping berhasil - SIMPAN
    const saved = await saveProduct(product);
    
    await ctx.deleteMessage(processing.message_id);
    
    const imageUrl = product.image?.startsWith('http') ? product.image 
      : 'https://via.placeholder.com/400x400?text=No+Image';
    
    await ctx.replyWithPhoto(imageUrl, {
      caption: 
        `✅ *Produk Tersimpan!*\n\n` +
        `📦 ${product.name?.substring(0,80)}\n` +
        `💰 ${product.price}\n` +
        `🛒 ${product.platform}\n` +
        `🆔 \`${saved.id}\`\n\n` +
        `🗑️ Hapus: /hapus ${saved.id}`,
      parse_mode: 'Markdown'
    });
    
  } catch (err) {
    await ctx.deleteMessage(processing.message_id).catch(()=>{});
    ctx.reply(
      `❌ Scraping gagal\n\n` +
      `💡 Gunakan /manual untuk tambah produk`,
      { parse_mode: 'Markdown' }
    );
  }
});

bot.catch((err, ctx) => {
  console.error('Error:', err);
  ctx.reply('❌ Terjadi kesalahan').catch(()=>{});
});

// Start
bot.launch()
  .then(() => console.log('🤖 Bot running'))
  .catch(console.error);

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

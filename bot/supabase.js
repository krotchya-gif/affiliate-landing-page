const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Simpan produk ke database
 * @param {Object} product - Data produk
 * @returns {Promise<Object>} Data produk yang tersimpan
 */
async function saveProduct(product) {
  const { data, error } = await supabase
    .from('products')
    .insert([{
      name: product.name,
      price: product.price,
      image: product.image,
      platform: product.platform,
      url: product.url,
      created_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    console.error('Error menyimpan produk:', error);
    throw error;
  }

  return data;
}

/**
 * Ambil semua produk dari database
 * @returns {Promise<Array>} Array produk
 */
async function getAllProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error mengambil produk:', error);
    throw error;
  }

  return data || [];
}

/**
 * Hapus produk dari database
 * @param {string} id - ID produk
 * @returns {Promise<boolean>}
 */
async function deleteProduct(id) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error menghapus produk:', error);
    throw error;
  }

  return true;
}

/**
 * Ambil produk berdasarkan ID
 * @param {string} id - ID produk
 * @returns {Promise<Object|null>}
 */
async function getProductById(id) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error mengambil produk:', error);
    return null;
  }

  return data;
}

module.exports = {
  saveProduct,
  getAllProducts,
  deleteProduct,
  getProductById,
  supabase
};

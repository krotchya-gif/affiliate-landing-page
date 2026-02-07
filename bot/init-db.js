const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function initDatabase() {
  console.log('🔄 Initializing database...');
  
  // Create table using raw SQL
  const { error } = await supabase.from('products').select('id').limit(1);
  
  if (error && error.code === '42P01') {
    console.log('📦 Table products not found. Please run database.sql in Supabase SQL Editor:');
    console.log('');
    console.log('1. Buka https://app.supabase.com/project/_/editor');
    console.log('2. Klik "New Query"');
    console.log('3. Copy dan paste isi file database.sql');
    console.log('4. Klik "Run"');
    console.log('');
    console.log('SQL yang perlu dijalankan:');
    console.log('---');
    console.log(`
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
    `);
  } else if (error) {
    console.log('❌ Error:', error.message);
  } else {
    console.log('✅ Database sudah terinisialisasi dengan baik!');
    
    // Check count
    const { data, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
      
    if (!countError) {
      console.log(`📊 Jumlah produk: ${data}`);
    }
  }
}

initDatabase();

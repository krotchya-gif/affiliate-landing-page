-- =====================================================
-- Database Schema untuk Affiliate Landing Page
-- Database: PostgreSQL (Supabase)
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

-- =====================================================
-- Setup Instructions:
-- =====================================================
-- 1. Buka dashboard Supabase (https://app.supabase.com)
-- 2. Buat project baru
-- 3. Buka SQL Editor
-- 4. Copy dan paste script di atas
-- 5. Run script
--
-- Setelah itu, copy URL dan API keys ke file .env:
-- - SUPABASE_URL: Project Settings > API > Project URL
-- - SUPABASE_ANON_KEY: Project Settings > API > anon/public
-- - SUPABASE_SERVICE_KEY: Project Settings > API > service_role
-- =====================================================

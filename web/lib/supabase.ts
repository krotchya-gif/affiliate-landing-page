import { createClient } from '@supabase/supabase-js'

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Validasi environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials not configured. Using mock data mode.')
}

// Client untuk browser (public)
export const supabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
)

// Client untuk server
const serviceKey = process.env.SUPABASE_SERVICE_KEY || supabaseAnonKey
export const supabaseServer = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  serviceKey || 'placeholder',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
)

// Tipe data untuk produk
export interface Product {
  id: string
  name: string
  price: string
  image: string
  platform: 'TOKOPEDIA' | 'SHOPEE' | 'LAZADA'
  url: string
  created_at: string
}

// Mock data untuk development/demo mode
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Headphone Bluetooth Premium - Suara Bass Mantap',
    price: 'Rp 299.000',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
    platform: 'TOKOPEDIA',
    url: 'https://tokopedia.com',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Smart Watch Series 5 - Monitor Kesehatan',
    price: 'Rp 599.000',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
    platform: 'SHOPEE',
    url: 'https://shopee.co.id',
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Powerbank 20000mAh Fast Charging',
    price: 'Rp 189.000',
    image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=400&fit=crop',
    platform: 'LAZADA',
    url: 'https://lazada.co.id',
    created_at: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Keyboard Mechanical RGB Gaming',
    price: 'Rp 450.000',
    image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=400&h=400&fit=crop',
    platform: 'TOKOPEDIA',
    url: 'https://tokopedia.com',
    created_at: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Mouse Wireless Logitech',
    price: 'Rp 125.000',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop',
    platform: 'SHOPEE',
    url: 'https://shopee.co.id',
    created_at: new Date().toISOString()
  }
]

// Check if credentials are valid
const isConfigured = supabaseUrl && 
                     supabaseUrl !== 'https://placeholder.supabase.co' &&
                     supabaseAnonKey && 
                     supabaseAnonKey !== 'placeholder'

// Fungsi untuk mengambil semua produk (Server-side)
export async function getAllProducts(): Promise<Product[]> {
  // Selalu return mock data untuk testing lokal tanpa database
  if (!isConfigured) {
    console.log('📦 Using mock data (Supabase not configured)')
    return mockProducts
  }

  try {
    const { data, error } = await supabaseServer
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.log('⚠️ Database error, using mock data:', error.message)
      return mockProducts
    }

    return data && data.length > 0 ? data : mockProducts
  } catch (error) {
    console.log('⚠️ Connection error, using mock data:', error)
    return mockProducts
  }
}

// Fungsi untuk mengambil produk by ID
export async function getProductById(id: string): Promise<Product | null> {
  if (!isConfigured) {
    return mockProducts.find(p => p.id === id) || null
  }

  try {
    const { data, error } = await supabaseServer
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error mengambil produk:', error)
      return mockProducts.find(p => p.id === id) || null
    }

    return data
  } catch (error) {
    console.error('Error mengambil produk:', error)
    return mockProducts.find(p => p.id === id) || null
  }
}

// Fungsi untuk menambah produk baru (API route)
export async function addProduct(product: Omit<Product, 'id' | 'created_at'>) {
  if (!isConfigured) {
    throw new Error('Supabase not configured')
  }

  const { data, error } = await supabaseServer
    .from('products')
    .insert([product])
    .select()

  if (error) {
    console.error('Error menambah produk:', error)
    throw error
  }

  return data
}

// Fungsi untuk menghapus produk (API route)
export async function deleteProduct(id: string) {
  if (!isConfigured) {
    throw new Error('Supabase not configured')
  }

  const { error } = await supabaseServer
    .from('products')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error menghapus produk:', error)
    throw error
  }

  return true
}

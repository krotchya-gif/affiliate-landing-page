import ProductCard from '@/components/ProductCard'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getAllProducts, Product } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'Affiliate Store - Rekomendasi Produk Terbaik',
  description: 'Kumpulan rekomendasi produk terbaik dari Tokopedia, Shopee, dan Lazada dengan harga terjangkau.',
}

export default async function Home() {
  let products: Product[] = []
  let error: string | null = null

  try {
    products = await getAllProducts()
  } catch (err) {
    error = err instanceof Error ? err.message : 'Unknown error'
    console.error('Error loading products:', error)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-pink-100">
      <Header />
      
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Profile Section */}
        <section className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-pink-400 via-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            AS
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Affiliate Store
          </h1>
          <p className="text-gray-600 text-sm">
            🛒 Rekomendasi produk terbaik dengan harga terjangkau
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Update setiap hari!
          </p>
        </section>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            ⚠️ Error: {error}
          </div>
        )}

        {/* Products Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span>🔥</span> Produk Terbaru
            </h2>
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {products.length} produk
            </span>
          </div>
          
          {products.length > 0 ? (
            <div className="space-y-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white/50 backdrop-blur-sm rounded-2xl border border-dashed border-gray-200">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-gray-500 font-medium">Belum ada produk tersedia.</p>
              <p className="text-gray-400 text-sm mt-2 px-4">
                Produk akan muncul setelah ditambahkan via Telegram Bot.
              </p>
            </div>
          )}
        </section>
      </div>

      <Footer />
    </main>
  )
}

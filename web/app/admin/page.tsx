'use client'

import { useState, useEffect } from 'react'
import { Product } from '@/lib/supabase'

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const ADMIN_PASSWORD = 'admin123' // Ganti dengan password kuat!

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts()
    }
  }, [isAuthenticated])

  async function fetchProducts() {
    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      setProducts(data.products || [])
    } catch (err) {
      setError('Gagal mengambil data')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Yakin hapus produk ini?')) return
    
    setDeleting(id)
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        setProducts(products.filter(p => p.id !== id))
        alert('Produk dihapus!')
      } else {
        alert('Gagal menghapus')
      }
    } catch (err) {
      alert('Error menghapus')
    } finally {
      setDeleting(null)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-sm w-full">
          <h1 className="text-2xl font-bold text-center mb-6">🔐 Admin Panel</h1>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border rounded-xl mb-4 focus:ring-2 focus:ring-pink-400 outline-none"
            onKeyPress={(e) => e.key === 'Enter' && setIsAuthenticated(password === ADMIN_PASSWORD)}
          />
          <button
            onClick={() => setIsAuthenticated(password === ADMIN_PASSWORD)}
            className="w-full bg-pink-500 text-white py-3 rounded-xl font-semibold hover:bg-pink-600 transition-colors"
          >
            Login
          </button>
          {password && password !== ADMIN_PASSWORD && (
            <p className="text-red-500 text-sm mt-2 text-center">Password salah</p>
          )}
          <a href="/" className="block text-center text-gray-500 mt-4 hover:text-pink-500">
            ← Kembali ke Website
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-800">🛠️ Admin Panel</h1>
          <div className="flex gap-2">
            <a
              href="/"
              className="px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-gray-700"
            >
              🌐 Lihat Website
            </a>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-4 bg-pink-500 text-white flex justify-between items-center">
            <span className="font-semibold">📦 {products.length} Produk</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : products.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-4xl mb-2">📭</p>
              <p>Belum ada produk</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {products.map((product) => (
                <div key={product.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 group">
                  <img
                    src={product.image || 'https://via.placeholder.com/100'}
                    alt={product.name}
                    className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full text-white ${
                        product.platform === 'TOKOPEDIA' ? 'bg-green-500' :
                        product.platform === 'SHOPEE' ? 'bg-orange-500' : 'bg-blue-500'
                      }`}>
                        {product.platform}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(product.created_at).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                    <h3 className="font-medium text-gray-800 truncate">{product.name}</h3>
                    <p className="text-pink-600 font-semibold">{product.price}</p>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Lihat Link"
                    >
                      🔗
                    </a>
                    <button
                      onClick={() => handleDelete(product.id)}
                      disabled={deleting === product.id}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Hapus"
                    >
                      {deleting === product.id ? '⏳' : '🗑️'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-gray-500 text-sm">
          <p>Gunakan Telegram Bot untuk tambah produk: /manual</p>
        </div>
      </div>
    </div>
  )
}

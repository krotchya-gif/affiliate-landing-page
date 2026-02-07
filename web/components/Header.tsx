'use client'

import { useState } from 'react'

export default function Header() {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
          Affiliate Store
        </h1>
        
        <button 
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Menu"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Menu Dropdown */}
      {showMenu && (
        <div className="absolute right-4 top-14 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-fade-in">
          <a 
            href="#" 
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            🏠 Beranda
          </a>
          <a 
            href="#" 
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            📦 Semua Produk
          </a>
          <a 
            href="#" 
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            📱 Kontak
          </a>
          <hr className="my-1 border-gray-100" />
          <a 
            href="#" 
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            ℹ️ Tentang Kami
          </a>
        </div>
      )}
    </header>
  )
}

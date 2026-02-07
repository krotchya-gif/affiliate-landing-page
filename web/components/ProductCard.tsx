'use client'

import Image from 'next/image'

interface Product {
  id: string
  name: string
  price: string
  image: string
  platform: string
  url: string
}

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const getPlatformColor = (platform: string) => {
    switch (platform.toUpperCase()) {
      case 'TOKOPEDIA':
        return 'bg-green-500 hover:bg-green-600'
      case 'SHOPEE':
        return 'bg-orange-500 hover:bg-orange-600'
      case 'LAZADA':
        return 'bg-blue-500 hover:bg-blue-600'
      default:
        return 'bg-gray-500 hover:bg-gray-600'
    }
  }

  const getPlatformLogo = (platform: string) => {
    switch (platform.toUpperCase()) {
      case 'TOKOPEDIA':
        return '🟢'
      case 'SHOPEE':
        return '🟠'
      case 'LAZADA':
        return '🔵'
      default:
        return '🛒'
    }
  }

  // Truncate name if too long
  const displayName = product.name.length > 80 
    ? product.name.substring(0, 80) + '...'
    : product.name

  return (
    <a
      href={product.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 group transform hover:-translate-y-1"
    >
      <div className="flex gap-4 p-3">
        {/* Product Image */}
        <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
          <Image
            src={product.image || 'https://via.placeholder.com/400x400?text=No+Image'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="96px"
            onError={(e) => {
              // Fallback untuk image error
              const target = e.target as HTMLImageElement
              target.src = 'https://via.placeholder.com/400x400?text=No+Image'
            }}
          />
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
          <div>
            <span className={`inline-block px-2 py-0.5 text-[10px] font-bold text-white rounded-full mb-2 transition-colors ${getPlatformColor(product.platform)}`}>
              {getPlatformLogo(product.platform)} {product.platform}
            </span>
            <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug group-hover:text-purple-600 transition-colors">
              {displayName}
            </h3>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <p className="text-base font-bold text-pink-600">
              {product.price}
            </p>
            <span className="text-xs text-gray-400 flex items-center gap-1 group-hover:text-purple-500 transition-colors">
              Lihat
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </a>
  )
}

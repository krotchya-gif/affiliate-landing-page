export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-12 py-6 border-t border-gray-200">
      <div className="max-w-md mx-auto px-4 text-center">
        <p className="text-sm text-gray-500 mb-2">
          Made with ❤️ di Indonesia
        </p>
        <p className="text-xs text-gray-400">
          © {currentYear} Affiliate Store. Semua hak dilindungi.
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Produk yang ditampilkan merupakan rekomendasi pilihan.
        </p>
      </div>
    </footer>
  )
}

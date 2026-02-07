import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

// GET /api/products - Ambil semua produk
export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('API Error:', error)
      return NextResponse.json(
        { error: 'Gagal mengambil produk' },
        { status: 500 }
      )
    }

    return NextResponse.json({ products: data })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// POST /api/products - Tambah produk baru
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { data, error } = await supabaseServer
      .from('products')
      .insert([{
        name: body.name,
        price: body.price,
        image: body.image,
        platform: body.platform,
        url: body.url,
        created_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      console.error('API Error:', error)
      return NextResponse.json(
        { error: 'Gagal menambah produk' },
        { status: 500 }
      )
    }

    return NextResponse.json({ product: data }, { status: 201 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// DELETE /api/products - Hapus produk
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID produk diperlukan' },
        { status: 400 }
      )
    }

    const { error } = await supabaseServer
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('API Error:', error)
      return NextResponse.json(
        { error: 'Gagal menghapus produk' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Produk berhasil dihapus' })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

// POST /api/revalidate - Revalidate homepage
export async function POST(request: NextRequest) {
  try {
    const secret = request.headers.get('x-revalidate-secret')
    
    // Verifikasi secret (opsional, untuk keamanan)
    if (secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json(
        { error: 'Invalid secret' },
        { status: 401 }
      )
    }

    // Revalidate homepage
    revalidatePath('/')

    return NextResponse.json({ 
      revalidated: true,
      message: 'Homepage revalidated successfully'
    })
  } catch (error) {
    console.error('Revalidate error:', error)
    return NextResponse.json(
      { error: 'Failed to revalidate' },
      { status: 500 }
    )
  }
}

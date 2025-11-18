import { NextResponse } from 'next/server'
import { getAllGalleryMetadata } from '@portfolio/lib/lib/markdown'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const locale = searchParams.get('locale') || 'en'
  const section = searchParams.get('section') || undefined
  
  try {
    const gallery = getAllGalleryMetadata(locale, section)
    return NextResponse.json(gallery)
  } catch (error) {
    console.error('Error fetching gallery:', error)
    return NextResponse.json({ error: 'Failed to fetch gallery' }, { status: 500 })
  }
}

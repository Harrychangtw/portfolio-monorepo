import { NextResponse } from 'next/server'
import { getAllPostsMetadata } from '@portfolio/lib/lib/markdown'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const locale = searchParams.get('locale') || 'en'

  const posts = getAllPostsMetadata(locale)
  return NextResponse.json(posts)
}


import { NextResponse } from 'next/server'
import { getAllSketchesMetadata } from '@portfolio/lib/lib/markdown'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const locale = searchParams.get('locale') || 'en'
  
  const sketches = getAllSketchesMetadata(locale)
  
  return NextResponse.json(sketches)
}

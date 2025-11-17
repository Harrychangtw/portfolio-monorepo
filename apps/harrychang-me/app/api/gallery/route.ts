import { NextResponse } from "next/server"
import { getAllGalleryMetadata } from "@portfolio/lib/lib/markdown"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || 'en'
    const galleryItems = getAllGalleryMetadata(locale)
    return NextResponse.json(galleryItems)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch gallery items" }, { status: 500 })
  }
}

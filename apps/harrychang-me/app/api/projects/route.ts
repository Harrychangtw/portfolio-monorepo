import { NextResponse } from "next/server"
import { getAllProjectsMetadata } from "@portfolio/lib/lib/markdown"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || 'en'
    const projects = getAllProjectsMetadata(locale)
    return NextResponse.json(projects)
  } catch (error) {
    // console.error("Error fetching projects:", error)
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 })
  }
}

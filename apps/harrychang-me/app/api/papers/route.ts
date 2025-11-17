import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { getPaperMetadata, Paper } from '@portfolio/lib/lib/markdown'

export async function GET() {
  try {
    const papersDir = path.join(process.cwd(), 'content/papers')
    const filenames = fs.readdirSync(papersDir)

    const papers = await Promise.all(
      filenames
        .filter(filename => filename.endsWith('.md'))
        .map(filename => {
          const filePath = path.join(papersDir, filename)
          const fileContents = fs.readFileSync(filePath, 'utf8')
          const { data } = matter(fileContents)
          return getPaperMetadata(data)
        })
    )

    const sortedPapers = papers
      .filter((p: Paper | null): p is Paper => p !== null)
      .sort((a: Paper, b: Paper) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return NextResponse.json(sortedPapers)
  } catch (error) {
    // console.error('Failed to fetch papers:', error)
    return NextResponse.json({ error: 'Failed to fetch papers' }, { status: 500 })
  }
}

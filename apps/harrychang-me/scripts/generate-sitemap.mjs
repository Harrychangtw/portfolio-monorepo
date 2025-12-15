#!/usr/bin/env node

/**
 * Build-time sitemap generation script
 * Generates static XML sitemaps for both main and lab domains
 * Run during build: node scripts/generate-sitemap.mjs
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration
const MAIN_DOMAIN = 'https://www.harrychang.me'
const LAB_DOMAIN = 'https://lab.harrychang.me'
const OUTPUT_DIR = path.join(__dirname, '../public')

// Utility to format date to W3C format (YYYY-MM-DD)
function formatDate(date) {
  if (!date) return new Date().toISOString().split('T')[0]
  try {
    return new Date(date).toISOString().split('T')[0]
  } catch {
    return new Date().toISOString().split('T')[0]
  }
}

// Read all markdown files from a directory
function getMarkdownFiles(dir) {
  try {
    const contentPath = path.join(__dirname, '../content', dir)
    if (!fs.existsSync(contentPath)) {
      console.warn(`⚠️  Directory not found: ${contentPath}`)
      return []
    }

    const files = fs.readdirSync(contentPath)
    return files
      .filter(file => file.endsWith('.md'))
      .map(file => {
        const slug = file.replace('.md', '')
        const filePath = path.join(contentPath, file)
        const content = fs.readFileSync(filePath, 'utf8')

        // Parse frontmatter
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)
        let date = null

        if (frontmatterMatch) {
          const dateMatch = frontmatterMatch[1].match(/date:\s*["']?([^"'\n]+)["']?/)
          if (dateMatch) {
            date = dateMatch[1]
          }
        }

        return { slug, date }
      })
  } catch (error) {
    console.error(`❌ Error reading ${dir}:`, error.message)
    return []
  }
}

// Generate XML sitemap
function generateSitemapXML(urls) {
  const urlElements = urls.map(({ loc, lastmod, changefreq, priority, alternates }) => {
    let urlXML = `  <url>\n    <loc>${loc}</loc>\n`

    if (lastmod) {
      urlXML += `    <lastmod>${lastmod}</lastmod>\n`
    }
    if (changefreq) {
      urlXML += `    <changefreq>${changefreq}</changefreq>\n`
    }
    if (priority) {
      urlXML += `    <priority>${priority}</priority>\n`
    }

    // Add alternate language links (hreflang)
    if (alternates) {
      for (const [lang, href] of Object.entries(alternates)) {
        urlXML += `    <xhtml:link rel="alternate" hreflang="${lang}" href="${href}"/>\n`
      }
    }

    urlXML += `  </url>`
    return urlXML
  }).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlElements}
</urlset>`
}

// Generate main domain sitemap
function generateMainSitemap() {
  console.log('🌐 Generating main domain sitemap...')

  const urls = []
  const today = formatDate(new Date())

  // Static pages
  const staticPages = [
    { path: '', priority: 1.0 },
    { path: '/projects', priority: 0.8 },
    { path: '/gallery', priority: 0.8 },
    { path: '/blog', priority: 0.8 },
  ]

  staticPages.forEach(({ path: pagePath, priority }) => {
    urls.push({
      loc: `${MAIN_DOMAIN}${pagePath}`,
      lastmod: today,
      changefreq: 'weekly',
      priority,
      alternates: {
        'en': `${MAIN_DOMAIN}${pagePath}`,
        'zh-TW': `${MAIN_DOMAIN}${pagePath}?lang=zh-TW`,
      }
    })
  })

  // Project pages
  const projects = getMarkdownFiles('projects')
  const projectSlugs = new Set()

  projects.forEach(({ slug, date }) => {
    // Skip language-specific files (we'll handle them via base slug)
    if (slug.includes('_zh-tw') || slug.includes('_zh-TW')) {
      return
    }

    projectSlugs.add(slug)

    // Check if Chinese version exists
    const hasChineseVersion = projects.some(
      p => p.slug === `${slug}_zh-tw` || p.slug === `${slug}_zh-TW`
    )

    const alternates = {
      'en': `${MAIN_DOMAIN}/projects/${slug}`,
    }

    if (hasChineseVersion) {
      alternates['zh-TW'] = `${MAIN_DOMAIN}/projects/${slug}?lang=zh-TW`
    }

    urls.push({
      loc: `${MAIN_DOMAIN}/projects/${slug}`,
      lastmod: formatDate(date),
      changefreq: 'monthly',
      priority: 0.7,
      alternates,
    })
  })

  console.log(`  ✓ Added ${projectSlugs.size} project pages`)

  // Gallery pages
  const gallery = getMarkdownFiles('gallery')
  const gallerySlugs = new Set()

  gallery.forEach(({ slug, date }) => {
    // Skip language-specific files
    if (slug.includes('_zh-tw') || slug.includes('_zh-TW')) {
      return
    }

    gallerySlugs.add(slug)

    // Check if Chinese version exists
    const hasChineseVersion = gallery.some(
      g => g.slug === `${slug}_zh-tw` || g.slug === `${slug}_zh-TW`
    )

    const alternates = {
      'en': `${MAIN_DOMAIN}/gallery/${slug}`,
    }

    if (hasChineseVersion) {
      alternates['zh-TW'] = `${MAIN_DOMAIN}/gallery/${slug}?lang=zh-TW`
    }

    urls.push({
      loc: `${MAIN_DOMAIN}/gallery/${slug}`,
      lastmod: formatDate(date),
      changefreq: 'monthly',
      priority: 0.6,
      alternates,
    })
  })

  console.log(`  ✓ Added ${gallerySlugs.size} gallery pages`)

  // Blog posts
  const posts = getMarkdownFiles('posts')
  const postSlugs = new Set()

  posts.forEach(({ slug, date }) => {
    // Skip language-specific files
    if (slug.includes('_zh-tw') || slug.includes('_zh-TW')) {
      return
    }

    postSlugs.add(slug)

    // Check if Chinese version exists
    const hasChineseVersion = posts.some(
      p => p.slug === `${slug}_zh-tw` || p.slug === `${slug}_zh-TW`
    )

    const alternates = {
      'en': `${MAIN_DOMAIN}/blog/${slug}`,
    }

    if (hasChineseVersion) {
      alternates['zh-TW'] = `${MAIN_DOMAIN}/blog/${slug}?lang=zh-TW`
    }

    urls.push({
      loc: `${MAIN_DOMAIN}/blog/${slug}`,
      lastmod: formatDate(date),
      changefreq: 'monthly',
      priority: 0.7,
      alternates,
    })
  })

  console.log(`  ✓ Added ${postSlugs.size} blog posts`)

  // Papers (auto-generated from arXiv)

  const xml = generateSitemapXML(urls)
  const outputPath = path.join(OUTPUT_DIR, 'sitemap.xml')
  fs.writeFileSync(outputPath, xml, 'utf8')

  console.log(`✅ Main sitemap generated: ${outputPath} (${urls.length} URLs)`)
  return urls.length
}

// Generate lab domain sitemap
function generateLabSitemap() {
  console.log('🧪 Generating lab domain sitemap...')

  const urls = []
  const today = formatDate(new Date())

  // Static lab pages
  const staticPages = [
    { path: '', priority: 1.0 },
  ]

  staticPages.forEach(({ path: pagePath, priority }) => {
    urls.push({
      loc: `${LAB_DOMAIN}${pagePath}`,
      lastmod: today,
      changefreq: 'weekly',
      priority,
    })
  })

  const xml = generateSitemapXML(urls)
  const outputPath = path.join(OUTPUT_DIR, 'sitemap-lab.xml')
  fs.writeFileSync(outputPath, xml, 'utf8')

  console.log(`✅ Lab sitemap generated: ${outputPath} (${urls.length} URLs)`)
  return urls.length
}

// Generate robots.txt
function generateRobotsTxt() {
  console.log('🤖 Generating robots.txt...')

  const robotsTxt = `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /

# Sitemaps
Sitemap: ${MAIN_DOMAIN}/sitemap.xml
Sitemap: ${LAB_DOMAIN}/sitemap-lab.xml

# Disallow admin/private routes (if any)
Disallow: /api/
`

  const outputPath = path.join(OUTPUT_DIR, 'robots.txt')
  fs.writeFileSync(outputPath, robotsTxt, 'utf8')

  console.log(`✅ robots.txt generated: ${outputPath}`)
}

// Generate sitemap index (optional, for large sites)
function generateSitemapIndex() {
  console.log('📑 Generating sitemap index...')

  const today = new Date().toISOString().split('T')[0]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${MAIN_DOMAIN}/sitemap.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${LAB_DOMAIN}/sitemap-lab.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>`

  const outputPath = path.join(OUTPUT_DIR, 'sitemap-index.xml')
  fs.writeFileSync(outputPath, xml, 'utf8')

  console.log(`✅ Sitemap index generated: ${outputPath}`)
}

// Main execution
async function main() {
  console.log('\n🚀 Starting sitemap generation...\n')

  try {
    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true })
    }

    const mainCount = generateMainSitemap()
    const labCount = generateLabSitemap()
    generateRobotsTxt()
    generateSitemapIndex()

    console.log('\n✨ Sitemap generation complete!')
    console.log(`   Total URLs: ${mainCount + labCount}`)
    console.log(`   Main domain: ${mainCount} URLs`)
    console.log(`   Lab domain: ${labCount} URLs`)
    console.log('\n📋 Next steps:')
    console.log('   1. Verify files in /public directory')
    console.log('   2. Deploy to production')
    console.log('   3. Submit sitemap.xml to Google Search Console')
    console.log('   4. Submit sitemap-lab.xml to Google Search Console (lab subdomain property)\n')
  } catch (error) {
    console.error('\n❌ Error generating sitemaps:', error)
    process.exit(1)
  }
}

main()

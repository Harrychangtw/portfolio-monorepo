import { MetadataRoute } from 'next'

const baseUrl = 'https://lab.harrychang.me'

export default function sitemap(): MetadataRoute.Sitemap {
  const sitemap: MetadataRoute.Sitemap = []

  // Add static pages for lab subdomain
  const staticPages = [
    '',
  ]

  staticPages.forEach((page) => {
    sitemap.push({
      url: `${baseUrl}${page}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: page === '' ? 1.0 : 0.8,
    })
  })

  return sitemap
}

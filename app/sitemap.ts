import { MetadataRoute } from 'next'
import { getAllProjectSlugs, getProjectData } from '@/lib/markdown'

const baseUrl = 'https://harrychang.me'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemap: MetadataRoute.Sitemap = []

  // Add static pages
  const staticPages = [
    '',
    '/projects',
    '/gallery',
    '/cv',
    '/paper-reading',
    '/manifesto',
    '/uses',
    '/cal',
  ]

  staticPages.forEach((page) => {
    sitemap.push({
      url: `${baseUrl}${page}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: page === '' ? 1.0 : 0.8,
      alternates: {
        languages: {
          en: `${baseUrl}${page}`,
          'zh-TW': `${baseUrl}${page}?lang=zh-TW`,
        },
      },
    })
  })

  // Get all project slugs
  const projectSlugs = getAllProjectSlugs()

  // Add project pages with both language versions
  for (const { params } of projectSlugs) {
    const slug = params.slug

    // Skip language-specific files (we'll handle them via the base slug)
    if (slug.includes('_zh-tw') || slug.includes('_zh-TW')) {
      continue
    }

    // Try to get the project data to get the date
    const projectData = await getProjectData(slug)
    
    // Check if there's a Chinese version
    const hasChineseVersion = projectSlugs.some(
      ({ params }) => params.slug === `${slug}_zh-tw` || params.slug === `${slug}_zh-TW`
    )

    sitemap.push({
      url: `${baseUrl}/projects/${slug}`,
      lastModified: projectData?.date ? new Date(projectData.date) : new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: {
        languages: {
          en: `${baseUrl}/projects/${slug}`,
          ...(hasChineseVersion && {
            'zh-TW': `${baseUrl}/projects/${slug}?lang=zh-TW`,
          }),
        },
      },
    })
  }

  return sitemap
}

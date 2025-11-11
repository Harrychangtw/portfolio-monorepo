import { MetadataRoute } from 'next'
import { headers } from 'next/headers'
import { getAllProjectSlugs, getProjectData, getAllGallerySlugs, getGalleryItemData } from '@/lib/markdown'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headersList = await headers()
  const host = headersList.get('host') || 'www.harrychang.me'
  
  // Determine if this is the lab subdomain
  const isLab = host.includes('lab.harrychang.me')
  const baseUrl = isLab ? 'https://lab.harrychang.me' : 'https://www.harrychang.me'
  
  // If this is the lab subdomain, return lab-specific sitemap
  if (isLab) {
    return [
      {
        url: `${baseUrl}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 1.0,
      },
      {
        url: `${baseUrl}/waitlist`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
    ]
  }
  
  // Main domain sitemap
  const sitemap: MetadataRoute.Sitemap = []

  // Add static pages
  const staticPages = [
    '',
    '/projects',
    '/gallery',
    '/paper-reading',
    '/manifesto',
    '/uses',
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

  // Get all gallery slugs
  const gallerySlugs = getAllGallerySlugs()

  // Add gallery pages with both language versions
  for (const { params } of gallerySlugs) {
    const slug = params.slug

    // Skip language-specific files (we'll handle them via the base slug)
    if (slug.includes('_zh-tw') || slug.includes('_zh-TW')) {
      continue
    }

    // Try to get the gallery item data to get the date
    const galleryData = await getGalleryItemData(slug)
    
    // Check if there's a Chinese version
    const hasChineseVersion = gallerySlugs.some(
      ({ params }) => params.slug === `${slug}_zh-tw` || params.slug === `${slug}_zh-TW`
    )

    sitemap.push({
      url: `${baseUrl}/gallery/${slug}`,
      lastModified: galleryData?.date ? new Date(galleryData.date) : new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
      alternates: {
        languages: {
          en: `${baseUrl}/gallery/${slug}`,
          ...(hasChineseVersion && {
            'zh-TW': `${baseUrl}/gallery/${slug}?lang=zh-TW`,
          }),
        },
      },
    })
  }

  return sitemap
}

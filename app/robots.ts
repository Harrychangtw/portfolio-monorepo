import { MetadataRoute } from 'next'
import { headers } from 'next/headers'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headersList = await headers()
  const host = headersList.get('host') || 'www.harrychang.me'
  
  // Determine if this is the lab subdomain
  const isLab = host.includes('lab.harrychang.me')
  
  if (isLab) {
    // Lab subdomain robots.txt
    return {
      rules: [
        {
          userAgent: '*',
          allow: '/',
          disallow: ['/api/'],
        },
      ],
      sitemap: 'https://lab.harrychang.me/sitemap.xml',
    }
  }
  
  // Main domain robots.txt
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/cal/'],
      },
    ],
    sitemap: 'https://www.harrychang.me/sitemap.xml',
  }
}

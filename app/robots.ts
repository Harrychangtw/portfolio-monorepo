import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/cal/'],
      },
    ],
    sitemap: 'https://harrychang.me/sitemap.xml',
  }
}

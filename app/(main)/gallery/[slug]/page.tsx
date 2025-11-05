import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getGalleryItemData, getAllGallerySlugs } from "@/lib/markdown"
import GalleryItemPageClient from "@/components/gallery-item-page-client"

const baseUrl = 'https://harrychang.me'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  if (!slug) return { title: "Gallery Item Not Found" }
  
  const item = await getGalleryItemData(slug)

  if (!item) {
    return {
      title: "Gallery Item Not Found",
    }
  }

  // Determine if this is a Chinese version
  const isChineseVersion = slug.includes('_zh-tw') || slug.includes('_zh-TW')
  const baseSlug = slug.replace(/_zh-tw|_zh-TW/i, '')
  const canonicalUrl = `${baseUrl}/gallery/${baseSlug}`
  
  // Get full URL for the image
  const imageUrl = item.imageUrl.startsWith('http') 
    ? item.imageUrl 
    : `${baseUrl}${item.imageUrl.startsWith('/') ? '' : '/'}${item.imageUrl}`

  return {
    title: `${item.title} | Gallery`,
    description: item.description,
    keywords: [
      item.title,
      'photography',
      'gallery',
      'Harry Chang',
      '張祺煒',
    ].filter(Boolean),
    authors: [{ name: 'Harry Chang' }],
    creator: 'Harry Chang',
    publisher: 'Harry Chang',
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en': canonicalUrl,
        'zh-TW': `${canonicalUrl}?lang=zh-TW`,
      },
    },
    openGraph: {
      title: item.title,
      description: item.description,
      url: canonicalUrl,
      siteName: 'Harry Chang Portfolio',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: item.title,
        },
      ],
      locale: isChineseVersion ? 'zh_TW' : 'en_US',
      type: 'article',
      publishedTime: item.date,
    },
    twitter: {
      card: 'summary_large_image',
      title: item.title,
      description: item.description,
      images: [imageUrl],
      creator: '@harrychangtw',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

export async function generateStaticParams() {
  const paths = getAllGallerySlugs()
  return paths
}

export default async function GalleryItemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!slug) notFound()
  
  const item = await getGalleryItemData(slug)

  if (!item) {
    notFound()
  }

  // Determine if this is a Chinese version
  const isChineseVersion = slug.includes('_zh-tw') || slug.includes('_zh-TW')
  const baseSlug = slug.replace(/_zh-tw|_zh-TW/i, '')
  const canonicalUrl = `${baseUrl}/gallery/${baseSlug}`
  
  // Get full URL for the image
  const imageUrl = item.imageUrl.startsWith('http') 
    ? item.imageUrl 
    : `${baseUrl}${item.imageUrl.startsWith('/') ? '' : '/'}${item.imageUrl}`

  // Create structured data for better SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Photograph',
    name: item.title,
    description: item.description,
    image: imageUrl,
    datePublished: item.date,
    author: {
      '@type': 'Person',
      name: 'Harry Chang',
      alternateName: '張祺煒',
      url: baseUrl,
    },
    creator: {
      '@type': 'Person',
      name: 'Harry Chang',
    },
    copyrightHolder: {
      '@type': 'Person',
      name: 'Harry Chang',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    inLanguage: isChineseVersion ? 'zh-TW' : 'en-US',
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <GalleryItemPageClient initialItem={item} />
    </>
  )
}


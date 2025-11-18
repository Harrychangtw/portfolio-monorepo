import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getGalleryItemData, getAllGallerySlugs } from "@portfolio/lib/lib/markdown"
import GalleryItemPageClient from "@portfolio/ui/gallery-item-page-client"

const baseUrl = 'https://www.emilychang.me'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  if (!slug) return { title: "Canvas Item Not Found" }
  
  const item = await getGalleryItemData(slug)

  if (!item) {
    return {
      title: "Canvas Item Not Found",
    }
  }

  const canonicalUrl = `${baseUrl}/canvas/${slug}`
  
  const imageUrl = item.imageUrl.startsWith('http') 
    ? item.imageUrl 
    : `${baseUrl}${item.imageUrl.startsWith('/') ? '' : '/'}${item.imageUrl}`

  return {
    title: `${item.title} | Canvas`,
    description: item.description,
    keywords: [
      item.title,
      'art',
      'canvas',
      'Emily Chang',
    ].filter(Boolean),
    authors: [{ name: 'Emily Chang' }],
    creator: 'Emily Chang',
    publisher: 'Emily Chang',
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: item.title,
      description: item.description,
      url: canonicalUrl,
      siteName: 'Emily Chang Portfolio',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: item.title,
        },
      ],
      locale: 'en_US',
      type: 'article',
      publishedTime: item.date,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export async function generateStaticParams() {
  const paths = getAllGallerySlugs()
  return paths
}

export default async function CanvasItemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!slug) notFound()
  
  const item = await getGalleryItemData(slug)

  if (!item) {
    notFound()
  }

  const canonicalUrl = `${baseUrl}/canvas/${slug}`
  const imageUrl = item.imageUrl.startsWith('http') 
    ? item.imageUrl 
    : `${baseUrl}${item.imageUrl.startsWith('/') ? '' : '/'}${item.imageUrl}`

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'VisualArtwork',
    name: item.title,
    description: item.description,
    image: imageUrl,
    datePublished: item.date,
    author: {
      '@type': 'Person',
      name: 'Emily Chang',
      url: baseUrl,
    },
    creator: {
      '@type': 'Person',
      name: 'Emily Chang',
    },
    copyrightHolder: {
      '@type': 'Person',
      name: 'Emily Chang',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    inLanguage: 'en-US',
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

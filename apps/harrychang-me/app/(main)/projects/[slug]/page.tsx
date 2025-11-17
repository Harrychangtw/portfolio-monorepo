import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { getProjectData, getAllProjectSlugs } from "@portfolio/lib/lib/markdown"
import ProjectPageClient from "@portfolio/ui/project-page-client"

const baseUrl = 'https://www.harrychang.me'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  if (!slug) return { title: "Project Not Found" }
  
  const project = await getProjectData(slug)

  if (!project) {
    return {
      title: "Project Not Found",
    }
  }

  // Determine if this is a Chinese version
  const isChineseVersion = slug.includes('_zh-tw') || slug.includes('_zh-TW')
  const baseSlug = slug.replace(/_zh-tw|_zh-TW/i, '')
  const canonicalUrl = `${baseUrl}/projects/${baseSlug}`
  
  // Get full URL for the image
  const imageUrl = project.imageUrl.startsWith('http') 
    ? project.imageUrl 
    : `${baseUrl}${project.imageUrl.startsWith('/') ? '' : '/'}${project.imageUrl}`

  return {
    title: `${project.title} | Projects`,
    description: project.description,
    keywords: [
      project.title,
      project.category,
      ...(project.subcategory ? [project.subcategory] : []),
      ...(project.technologies || []),
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
      title: project.title,
      description: project.description,
      url: canonicalUrl,
      siteName: 'Harry Chang Portfolio',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: project.title,
        },
      ],
      locale: isChineseVersion ? 'zh_TW' : 'en_US',
      type: 'article',
      publishedTime: project.date,
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: project.description,
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
    other: {
      // Preload the hero image for better LCP
      'preload-hero-image': project.imageUrl,
    }
  }
}

export async function generateStaticParams() {  
  const paths = getAllProjectSlugs()
  return paths
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!slug) notFound()
  
  const project = await getProjectData(slug)

  if (!project || project.locked) { // Check if project exists and is not locked
    notFound()
  }

  // Determine if this is a Chinese version
  const isChineseVersion = slug.includes('_zh-tw') || slug.includes('_zh-TW')
  const baseSlug = slug.replace(/_zh-tw|_zh-TW/i, '')
  const canonicalUrl = `${baseUrl}/projects/${baseSlug}`
  
  // Get full URL for the image
  const imageUrl = project.imageUrl.startsWith('http') 
    ? project.imageUrl 
    : `${baseUrl}${project.imageUrl.startsWith('/') ? '' : '/'}${project.imageUrl}`

  // Create structured data for better SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    headline: project.title,
    description: project.description,
    image: imageUrl,
    datePublished: project.date,
    author: {
      '@type': 'Person',
      name: 'Harry Chang',
      alternateName: '張祺煒',
      url: baseUrl,
    },
    publisher: {
      '@type': 'Person',
      name: 'Harry Chang',
      url: baseUrl,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    keywords: [
      project.category,
      ...(project.subcategory ? [project.subcategory] : []),
      ...(project.technologies || []),
    ].join(', '),
    inLanguage: isChineseVersion ? 'zh-TW' : 'en-US',
    ...(project.role && { contributor: project.role }),
    ...(project.website && { url: project.website }),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <ProjectPageClient initialProject={project} />
    </>
  )
}


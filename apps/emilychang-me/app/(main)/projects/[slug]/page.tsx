import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getProjectData, getAllProjectSlugs } from "@portfolio/lib/lib/markdown"
import ProjectPageClient from "@portfolio/ui/project-page-client"

const baseUrl = 'https://www.emilychang.me'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  if (!slug) return { title: "Project Not Found" }
  
  const project = await getProjectData(slug)

  if (!project) {
    return {
      title: "Project Not Found",
    }
  }

  const canonicalUrl = `${baseUrl}/projects/${slug}`
  
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
      'Emily Chang',
    ].filter(Boolean),
    authors: [{ name: 'Emily Chang' }],
    creator: 'Emily Chang',
    publisher: 'Emily Chang',
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: project.title,
      description: project.description,
      url: canonicalUrl,
      siteName: 'Emily Chang Portfolio',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: project.title,
        },
      ],
      locale: 'en_US',
      type: 'article',
      publishedTime: project.date,
    },
    robots: {
      index: true,
      follow: true,
    },
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

  if (!project || project.locked) {
    notFound()
  }

  const canonicalUrl = `${baseUrl}/projects/${slug}`
  const imageUrl = project.imageUrl.startsWith('http') 
    ? project.imageUrl 
    : `${baseUrl}${project.imageUrl.startsWith('/') ? '' : '/'}${project.imageUrl}`

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    headline: project.title,
    description: project.description,
    image: imageUrl,
    datePublished: project.date,
    author: {
      '@type': 'Person',
      name: 'Emily Chang',
      url: baseUrl,
    },
    publisher: {
      '@type': 'Person',
      name: 'Emily Chang',
      url: baseUrl,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    keywords: [
      project.category,
      ...(project.subcategory ? [project.subcategory] : []),
    ].join(', '),
    inLanguage: 'en-US',
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

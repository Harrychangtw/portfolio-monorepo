import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getPostData, getAllPostSlugs, getNextPost } from "@portfolio/lib/lib/markdown"
import BlogPostClient from "./blog-post-client"

const baseUrl = '<https://www.harrychang.me>'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  if (!slug) return { title: "Post Not Found" }

  const post = await getPostData(slug)

  if (!post) {
    return {
      title: "Post Not Found",
    }
  }

  const isChineseVersion = slug.includes('_zh-tw') || slug.includes('_zh-TW')
  const baseSlug = slug.replace(/_zh-tw|_zh-TW/i, '')
  const canonicalUrl = `${baseUrl}/blog/${baseSlug}`

  const imageUrl = post.imageUrl.startsWith('http')
    ? post.imageUrl
    : `${baseUrl}${post.imageUrl.startsWith('/') ? '' : '/'}${post.imageUrl}`

  return {
    title: `${post.title} | Blog`,
    description: post.description,
    keywords: [
      post.title,
      ...(post.tags || []),
      'Harry Chang',
      '張祺煒',
      'blog',
    ].filter(Boolean),
    authors: [{ name: post.author || 'Harry Chang' }],
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en': canonicalUrl,
        'zh-TW': `${canonicalUrl}?lang=zh-TW`,
      },
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: canonicalUrl,
      siteName: 'Harry Chang Portfolio',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      locale: isChineseVersion ? 'zh_TW' : 'en_US',
      type: 'article',
      publishedTime: post.date,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [imageUrl],
      creator: '@harrychangtw',
    },
  }
}

export async function generateStaticParams() {
  const paths = getAllPostSlugs()
  return paths
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!slug) notFound()

  const post = await getPostData(slug)
  const nextPost = await getNextPost(slug)

  if (!post) {
    notFound()
  }

  const isChineseVersion = slug.includes('_zh-tw') || slug.includes('_zh-TW')
  const baseSlug = slug.replace(/_zh-tw|_zh-TW/i, '')
  const canonicalUrl = `${baseUrl}/blog/${baseSlug}`

  const imageUrl = post.imageUrl.startsWith('http')
    ? post.imageUrl
    : `${baseUrl}${post.imageUrl.startsWith('/') ? '' : '/'}${post.imageUrl}`

  const structuredData = {
    '@context': '<https://schema.org>',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: imageUrl,
    datePublished: post.date,
    author: {
      '@type': 'Person',
      name: post.author || 'Harry Chang',
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
    keywords: (post.tags || []).join(', '),
    inLanguage: isChineseVersion ? 'zh-TW' : 'en-US',
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <BlogPostClient initialPost={post} nextPost={nextPost} />
    </>
  )
}


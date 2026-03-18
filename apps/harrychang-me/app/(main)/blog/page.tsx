import type { Metadata } from "next"
import BlogSection from "@portfolio/ui/blog-section"
import { getAllPostsMetadata } from "@portfolio/lib/lib/markdown"

export const metadata: Metadata = {
  title: "Blog",
  description: "Film essays, hardware reflections, and the things worth sitting with. Writing by Harry Chang on technology, creation, and curiosity.",
  keywords: ['blog', 'articles', 'writing', 'essays', 'film', 'technology', 'Harry Chang', '張祺煒'],
  alternates: {
    canonical: '/blog',
    languages: {
      'en': '/blog',
      'zh-TW': '/blog?lang=zh-TW',
    },
  },
  openGraph: {
    title: "Blog | Harry Chang 張祺煒",
    description: "Film essays, hardware reflections, and the things worth sitting with — writing by Harry Chang 張祺煒.",
    url: 'https://www.harrychang.me/blog',
    siteName: 'Harry Chang Portfolio',
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['zh_TW'],
    images: ['/images/og-image-blog.webp'],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Blog | Harry Chang 張祺煒",
    description: "Film essays, hardware reflections, and the things worth sitting with — writing by Harry Chang 張祺煒.",
  },
}

export default function BlogPage() {
  const blogPosts = getAllPostsMetadata('en')
  return <BlogSection initialItems={blogPosts} />
}


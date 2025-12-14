import type { Metadata } from "next"
import BlogPageClient from "@portfolio/ui/blog-page-client"

export const metadata: Metadata = {
  title: "Blog",
  description: "Thoughts, ideas, and writings by Harry Chang (張祺煒). Explore articles on technology, design, and creative work.",
  keywords: ['blog', 'articles', 'writing', 'thoughts', 'Harry Chang', '張祺煒'],
  alternates: {
    canonical: '/blog',
    languages: {
      'en': '/blog',
      'zh-TW': '/blog?lang=zh-TW',
    },
  },
  openGraph: {
    title: "Blog | Harry Chang 張祺煒",
    description: "Thoughts, ideas, and writings by Harry Chang (張祺煒)",
    url: '<https://www.harrychang.me/blog>',
    siteName: 'Harry Chang Portfolio',
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['zh_TW'],
    images: ['/images/og-image-blog.webp'],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Blog | Harry Chang 張祺煒",
    description: "Thoughts, ideas, and writings by Harry Chang (張祺煒)",
  },
}

export default function BlogPage() {
  return <BlogPageClient />
}


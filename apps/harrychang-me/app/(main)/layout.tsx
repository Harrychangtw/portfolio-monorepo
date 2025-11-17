import '@/styles/lcp-optimize.css'
import '@/styles/video-embed.css'
import type React from 'react'
import type { Metadata } from 'next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import ClientLayout from '@/components/main/ClientLayout'
import Footer from '@portfolio/ui/footer'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.harrychang.me'),
  title: {
    template: '%s | Harry Chang',
    default: 'Harry Chang 張祺煒 | Portfolio',
  },
  description: 'Harry Chang (張祺煒) builds new worlds at the intersection of AI, code, and visual storytelling. Explore his portfolio of software development, photography, and design.',
  keywords: ['Harry Chang', '張祺煒', 'portfolio', 'photography', 'software development', 'design', 'research', 'AI', 'machine learning'],
  authors: [{ name: 'Harry Chang', url: 'https://www.harrychang.me' }],
  creator: 'Harry Chang',
  publisher: 'Harry Chang',
  alternates: {
    canonical: 'https://www.harrychang.me/',
    languages: {
      'en': 'https://www.harrychang.me/',
      'zh-TW': 'https://www.harrychang.me/?lang=zh-TW',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['zh_TW'],
    url: 'https://www.harrychang.me',
    siteName: 'Harry Chang Portfolio',
    title: 'Harry Chang 張祺煒 | Portfolio',
    description: 'Harry Chang (張祺煒) builds new worlds at the intersection of AI, code, and visual storytelling. Explore his portfolio of software development, photography, and design.',
    images: [
      {
        url: 'https://www.harrychang.me/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Harry Chang Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Harry Chang 張祺煒 | Portfolio',
    description: 'Harry Chang (張祺煒) portfolio showcasing photography development and design work',
    creator: '@harrychangtw',
    images: ['https://www.harrychang.me/images/og-image.png'],
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
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        sizes: 'any'
      }
    ],
    apple: {
      url: '/apple-icon.png',
      type: 'image/png'
    },
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
        color: '#000000'
      }
    ]
  },
  verification: {
    google: 'googleb0d95f7ad2ffc31f'   
  },
}

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Website structured data for better SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Harry Chang',
    alternateName: '張祺煒',
    url: 'https://www.harrychang.me',
    image: 'https://www.harrychang.me/images/og-image.png',
    sameAs: [
      'https://github.com/Harrychangtw',
      // 'https://twitter.com/harrychangtw',
      // 'https://linkedin.com/in/harrychangtw',
    ],
    jobTitle: 'Developer & Researcher',
    description: 'Harry Chang (張祺煒) builds new worlds at the intersection of AI, code, and visual storytelling',
    knowsAbout: ['Software Development', 'Photography', 'Design', 'Artificial Intelligence', 'Machine Learning', 'Research'],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <ClientLayout>
        <div className="flex-1 pt-16">
          {children}
        </div>
        <Footer />
        <SpeedInsights />
      </ClientLayout>
    </>
  )
}

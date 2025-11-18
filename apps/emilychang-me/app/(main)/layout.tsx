import type React from 'react'
import type { Metadata } from 'next'
import ClientLayout from '@/components/ClientLayout'
import EmilyFooter from '@/components/EmilyFooter'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.emilychang.me'),
  title: {
    template: '%s | Emily Chang',
    default: 'Emily Chang | Portfolio',
  },
  description: 'Emily Chang explores the intersection of design, art, and creative expression. Explore her portfolio of design work, creations, and artistic endeavors.',
  keywords: ['Emily Chang', 'portfolio', 'design', 'art', 'illustration', 'creative'],
  authors: [{ name: 'Emily Chang', url: 'https://www.emilychang.me' }],
  creator: 'Emily Chang',
  publisher: 'Emily Chang',
  alternates: {
    canonical: 'https://www.emilychang.me/',
    languages: {
      'en': 'https://www.emilychang.me/',
      'zh-TW': 'https://www.emilychang.me/?lang=zh-TW',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['zh_TW'],
    url: 'https://www.emilychang.me',
    siteName: 'Emily Chang Portfolio',
    title: 'Emily Chang | Portfolio',
    description: 'Emily Chang explores the intersection of design, art, and creative expression.',
    images: [
      {
        url: 'https://www.emilychang.me/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Emily Chang Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Emily Chang | Portfolio',
    description: 'Emily Chang portfolio showcasing design and art work',
    images: ['https://www.emilychang.me/images/og-image.png'],
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
        url: '/favicon.png',
        sizes: 'any'
      }
    ],
    apple: {
      url: '/apple-icon.png',
      type: 'image/png'
    },
  },
}

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Emily Chang',
    url: 'https://www.emilychang.me',
    image: 'https://www.emilychang.me/images/og-image.png',
    jobTitle: 'Designer & Artist',
    description: 'Emily Chang explores the intersection of design, art, and creative expression',
    knowsAbout: ['Design', 'Art', 'Illustration', 'Creative Direction'],
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
        <EmilyFooter />
      </ClientLayout>
    </>
  )
}

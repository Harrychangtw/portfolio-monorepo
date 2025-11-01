import './globals.css'
import '@/styles/lcp-optimize.css'
import '@/styles/video-embed.css'
import type React from 'react'
import type { Metadata } from 'next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import ClientLayout from './ClientLayout'
import Footer from '@/components/footer'
import { Space_Grotesk, Press_Start_2P, IBM_Plex_Sans } from 'next/font/google'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700'],
  variable: '--font-ibm-plex-sans',
  display: 'swap',
})

const pressStart2P = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-press-start-2p',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://harrychang.me'),
  title: {
    template: '%s | Harry Chang',
    default: 'Harry Chang 張祺煒 | Portfolio',
  },
  description: 'Harry Chang (張祺煒) portfolio showcasing photography development and design work',
  keywords: ['Harry Chang', '張祺煒', 'portfolio', 'photography', 'development', 'design', 'research', 'AI', 'machine learning'],
  authors: [{ name: 'Harry Chang', url: 'https://harrychang.me' }],
  creator: 'Harry Chang',
  publisher: 'Harry Chang',
  alternates: {
    canonical: '/',
    languages: {
      'en': '/',
      'zh-TW': '/?lang=zh-TW',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['zh_TW'],
    url: 'https://harrychang.me',
    siteName: 'Harry Chang Portfolio',
    title: 'Harry Chang 張祺煒 | Portfolio',
    description: 'Harry Chang (張祺煒) portfolio showcasing photography development and design work',
    images: [
      {
        url: '/images/og-image.png',
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
    images: ['/images/og-image.png'],
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
    // Add your verification codes here when you get them (optional)
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
}

export default function RootLayout({
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
    url: 'https://harrychang.me',
    sameAs: [
      // Add your social media profiles here
      'https://github.com/Harrychangtw',
      // 'https://twitter.com/harrychangtw',
      // 'https://linkedin.com/in/harrychangtw',
    ],
    jobTitle: 'Developer & Researcher',
    description: 'Portfolio showcasing photography, development, and design work',
  }

  return (
    <html lang="en" className={`dark ${pressStart2P.variable} ${spaceGrotesk.variable} ${ibmPlexSans.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className={`bg-background text-primary antialiased min-h-screen flex flex-col`}>
        <ClientLayout>
          <main id="site-content" className="site-content flex-1 pt-16 relative z-[2] bg-background">
            {children}
          </main>
          <Footer />
          <SpeedInsights />
        </ClientLayout>
      </body>
    </html>
  )
}

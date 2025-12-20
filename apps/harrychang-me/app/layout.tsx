import './globals.css'
import type React from 'react'
import type { Metadata, Viewport } from 'next' // Added Viewport type
import { Space_Grotesk, IBM_Plex_Sans } from 'next/font/google'
import localFont from 'next/font/local'
import { siteConfig } from '@/config/site'

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

// Separate viewport export (Next.js 14+ best practice)
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
  width: 'device-width',
  initialScale: 1,
}
const artific = localFont({
  src: [
    { path: '../public/fonts/artific-fonts/Artific-Thin.woff2', weight: '100', style: 'normal' },
    { path: '../public/fonts/artific-fonts/Artific-SuperLight.woff2', weight: '200', style: 'normal' },
    { path: '../public/fonts/artific-fonts/Artific-Light.woff2', weight: '300', style: 'normal' },
    { path: '../public/fonts/artific-fonts/Artific-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../public/fonts/artific-fonts/Artific-Medium.woff2', weight: '500', style: 'normal' },
    { path: '../public/fonts/artific-fonts/Artific-SemiBold.woff2', weight: '600', style: 'normal' },
    { path: '../public/fonts/artific-fonts/Artific-Bold.woff2', weight: '700', style: 'normal' },
    { path: '../public/fonts/artific-fonts/Artific-SuperBold.woff2', weight: '800', style: 'normal' },
    { path: '../public/fonts/artific-fonts/Artific-Black.woff2', weight: '900', style: 'normal' },
  ],
  variable: '--font-artific', // New variable name
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.metadata.title.default,
    template: siteConfig.metadata.title.template,
  },
  description: siteConfig.metadata.description,
  keywords: siteConfig.metadata.keywords,
  authors: [{ name: siteConfig.author.name, url: siteConfig.url }],
  creator: siteConfig.author.name,
  publisher: siteConfig.author.name,
  applicationName: siteConfig.metadata.siteName, // Added: Helps with PWA/saved-to-home-screen naming
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
  verification: {
    google: siteConfig.verification.google,
  },
  alternates: {
    canonical: siteConfig.url,
    languages: {
      'en': siteConfig.url,
      'zh-TW': `${siteConfig.url}?lang=zh-TW`,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['zh_TW'],
    url: siteConfig.url,
    siteName: siteConfig.metadata.siteName,
    title: siteConfig.metadata.title.default,
    description: siteConfig.metadata.description,
    images: [
      {
        url: `${siteConfig.url}${siteConfig.media.ogImage.url}`,
        width: siteConfig.media.ogImage.width,
        height: siteConfig.media.ogImage.height,
        alt: siteConfig.media.ogImage.alt,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.metadata.title.default,
    description: siteConfig.metadata.description,
    creator: '@harrychangtw',
    site: '@harrychangtw',
    images: [`${siteConfig.url}${siteConfig.media.ogImage.url}`],
  },
  // Added: Essential for favicons and mobile icons
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
        color: '#0A0A0A',
      },
    ],
  },
  manifest: '/site.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: siteConfig.metadata.siteName,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html 
      lang="en" 
      // Added suppressHydrationWarning because you are using next-themes or dark mode class manipulation
      suppressHydrationWarning
      className={`dark ${artific.variable} ${ibmPlexSans.variable}`}
      style={{
        '--font-body': 'var(--font-ibm-plex-sans)',
        '--font-heading': 'var(--font-artific)',
      } as React.CSSProperties}
    >
      <body className={`bg-background text-primary antialiased min-h-screen flex flex-col`}>
        {children}
      </body>
    </html>
  )
}

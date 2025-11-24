import './globals.css'
import type React from 'react'
import type { Metadata } from 'next'
import { Space_Grotesk, Press_Start_2P, IBM_Plex_Sans } from 'next/font/google'
import type { PropsWithChildren } from 'react'
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

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.author.name,
    template: `%s | ${siteConfig.author.name}`,
  },
  description: `Portfolio of ${siteConfig.author.name}`,
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: siteConfig.author.name,
    description: `Portfolio of ${siteConfig.author.name}`,
    url: siteConfig.url,
    siteName: siteConfig.author.name,
    images: [
      {
        url: `${siteConfig.url}${siteConfig.media.ogImage.url}`,
        width: siteConfig.media.ogImage.width,
        height: siteConfig.media.ogImage.height,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.author.name,
    description: `Portfolio of ${siteConfig.author.name}`,
    images: [`${siteConfig.url}${siteConfig.media.ogImage.url}`],
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
      className={`dark ${spaceGrotesk.variable} ${ibmPlexSans.variable}`}
      style={{
        '--font-body': 'var(--font-ibm-plex-sans)',
        '--font-heading': 'var(--font-space-grotesk)',
      } as React.CSSProperties}
    >
      <body className={`bg-background text-primary antialiased min-h-screen flex flex-col`}>
        {children}
      </body>
    </html>
  )
}

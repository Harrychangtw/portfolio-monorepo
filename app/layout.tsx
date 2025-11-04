import './globals.css'
import type React from 'react'
import type { Metadata } from 'next'
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

export const metadata: Metadata = {
  metadataBase: new URL('https://harrychang.me'),
  title: {
    default: 'Harry Chang',
    template: '%s | Harry Chang',
  },
  description: 'Portfolio of Harry Chang',
  openGraph: {
    title: 'Harry Chang',
    description: 'Portfolio of Harry Chang',
    url: 'https://harrychang.me',
    siteName: 'Harry Chang',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Harry Chang',
    description: 'Portfolio of Harry Chang',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`dark ${spaceGrotesk.variable} ${ibmPlexSans.variable}`}>
      <body className={`bg-background text-primary antialiased min-h-screen flex flex-col`}>
        {children}
      </body>
    </html>
  )
}

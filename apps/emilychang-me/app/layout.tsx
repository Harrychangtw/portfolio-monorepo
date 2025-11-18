import './globals.css'
import type React from 'react'
import type { Metadata } from 'next'
import { IBM_Plex_Sans, Playfair_Display } from 'next/font/google'

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-plex',
  display: 'swap',
})

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  style: ['italic'],
  variable: '--font-playfair-display',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://www.emilychang.me'),
  title: {
    default: 'Emily Chang',
    template: '%s | Emily Chang',
  },
  description: 'Portfolio of Emily Chang',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Emily Chang',
    description: 'Portfolio of Emily Chang',
    url: 'https://www.emilychang.me',
    siteName: 'Emily Chang',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Emily Chang',
    description: 'Portfolio of Emily Chang',
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
      className={`${ibmPlexSans.variable} ${playfairDisplay.variable}`}
      style={{
        '--font-body': 'var(--font-ibm-plex)',
        '--font-heading': 'var(--font-playfair-display)',
      } as React.CSSProperties}
    >
      <body className="bg-background text-primary antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  )
}

import type { Metadata } from 'next'
import TypographyPageClient from '@/components/main/typography-page-client'

export const metadata: Metadata = {
  title: 'Design System',
  description: 'The design choices behind this site. Every pixel is a decision, every whitespace a breath — type, color, motion, and layout in one living reference.',
  openGraph: {
    title: 'Design System | Harry Chang 張祺煒',
    description: 'Every pixel is a decision, every whitespace a breath. The type, color, motion, and layout system behind harrychang.me.',
    images: [
      {
        url: 'https://www.harrychang.me/images/og-image-design.webp',
        width: 1200,
        height: 630,
        alt: 'Design System | Harry Chang',
      },
    ],
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
}

export default function TypographyPage() {
  return <TypographyPageClient />
}

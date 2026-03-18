import type { Metadata } from 'next'
import TypographyPageClient from '@/components/main/typography-page-client'

export const metadata: Metadata = {
  title: 'Typography',
  description: 'Live typography system guideline showcasing all font families, weights, and styles used throughout the portfolio website.',
  openGraph: {
    title: 'Typography | Harry Chang',
    description: 'Live typography system guideline showcasing all font families, weights, and styles used throughout the portfolio website.',
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

import type { Metadata } from 'next'
import TypographyPageClient from '@/components/main/typography-page-client'

export const metadata: Metadata = {
  title: 'Typography',
  description: 'Live typography system guideline showcasing all font families, weights, and styles used throughout the portfolio website.',
  openGraph: {
    title: 'Typography | Harry Chang',
    description: 'Live typography system guideline showcasing all font families, weights, and styles used throughout the portfolio website.',
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

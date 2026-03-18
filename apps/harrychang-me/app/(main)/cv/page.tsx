import { siteConfig } from '@/config/site'
import type { Metadata } from 'next'
import CvContent from '@/components/main/cv-content'

export const metadata: Metadata = {
  title: 'Résumé',
  description: "Everything organized in one place. Harry Chang's full curriculum vitae — research, experience, and the work that defines the journey so far.",
  openGraph: {
    title: 'Résumé | Harry Chang 張祺煒',
    description: "Everything organized in one place — research, experience, and the work that defines the journey so far.",
    images: [{
      url: '/images/og-image-resume.webp',
      width: 1200,
      height: 630,
      alt: 'Harry Chang Résumé',
    }],
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function ResumePage() {
  return <CvContent pdfUrl={siteConfig.external.cv} />
}

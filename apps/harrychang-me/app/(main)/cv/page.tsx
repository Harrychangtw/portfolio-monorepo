import { siteConfig } from '@/config/site'
import type { Metadata } from 'next'
import CvContent from '@/components/main/cv-content'

export const metadata: Metadata = {
  title: 'Harry Chang 張祺煒 | Curriculum Vitae',
  openGraph: {
    title: 'Harry Chang 張祺煒 | Curriculum Vitae',
    description: 'View my full resume and professional experience.',
    images: [{
      url: '/images/og-image-resume.webp',
      width: 1200,
      height: 630,
      alt: 'Harry Chang Resume',
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

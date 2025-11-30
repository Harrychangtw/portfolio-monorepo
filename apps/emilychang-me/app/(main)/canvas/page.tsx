"use client"

import GallerySection from "@portfolio/ui/gallery-section"
import { useLanguage } from '@portfolio/lib/contexts/language-context'

export default function CanvasPage() {
  const { t } = useLanguage()
  
  return (
    <div className="min-h-screen">
      <div className="container py-12 md:py-16">
        <h1 className="font-heading italic text-3xl md:text-4xl text-primary mb-4">
          {t('sections.canvas')}
        </h1>
        <p className="font-body text-secondary mb-8">
          View my artistic works and visual creations.
        </p>
      </div>
      <GallerySection source="gallery" sectionId="canvas" basePath="canvas" hoverEffect="gentle" />
    </div>
  )
}

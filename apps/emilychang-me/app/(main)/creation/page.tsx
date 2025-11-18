"use client"

import GallerySection from "@portfolio/ui/gallery-section"
import { useLanguage } from "@portfolio/lib/contexts/LanguageContext"

export default function CreationPage() {
  const { t } = useLanguage()
  
  return (
    <div className="min-h-screen">
      <div className="container py-12 md:py-16">
        <h1 className="font-heading italic text-3xl md:text-4xl text-primary mb-4">
          {t('sections.creation')}
        </h1>
        <p className="font-body text-secondary mb-8">
          Discover my creative works and artistic endeavors.
        </p>
      </div>
      <GallerySection source="projects" section="Creation" sectionId="creation" />
    </div>
  )
}

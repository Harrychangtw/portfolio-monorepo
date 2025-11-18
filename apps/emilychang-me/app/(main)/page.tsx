"use client"

import EmilyAboutSection from "@portfolio/ui/emily-about-section"
import ProjectsSection from "@portfolio/ui/projects-section"
import GallerySection from "@portfolio/ui/gallery-section"
import { useLanguage } from "@portfolio/lib/contexts/LanguageContext"

// Placeholder Sketches Section component
function SketchesSection() {
  const { t } = useLanguage()
  return (
    <section id="sketches" className="py-12 md:py-16 border-b border-border">
      <div className="container">
        <h2 className="font-heading text-lg uppercase tracking-wider text-secondary mb-4">
          {t('sections.sketches')}
        </h2>
      </div>
    </section>
  )
}

function HomeContent() {
  const { t } = useLanguage()
  
  return (
    <>
      <EmilyAboutSection />
      <ProjectsSection
        sectionId="projects" 
        section="Projects"
        title={t('sections.projects')}
      />
      <GallerySection 
        sectionId="canvas" 
        source="gallery"
        title={t('sections.canvas')}
        basePath="canvas"
      />
      <SketchesSection />
    </>
  )
}

export default function Home() {
  return <HomeContent />
}

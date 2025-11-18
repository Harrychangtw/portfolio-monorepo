"use client"

import AboutSection from "@portfolio/ui/about-section"
import ProjectsSection from "@portfolio/ui/projects-section"
import GallerySection from "@portfolio/ui/gallery-section"
import { useLanguage } from "@portfolio/lib/contexts/LanguageContext"

// Placeholder Sketches Section component
function SketchesSection() {
  const { t } = useLanguage()
  return (
    <section id="sketches" className="py-12 md:py-16 border-b border-border">
      <div className="container">
        <h2 className="font-heading italic text-2xl md:text-3xl text-primary mb-8">
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
      <AboutSection />
      <ProjectsSection 
        sectionId="projects" 
        section="Projects"
        title={t('sections.projects')}
      />
      <GallerySection 
        sectionId="canvas" 
        source="gallery"
        title={t('sections.canvas')}
      />
      <SketchesSection />
    </>
  )
}

export default function Home() {
  return <HomeContent />
}

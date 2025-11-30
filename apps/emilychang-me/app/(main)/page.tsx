"use client"

import EmilyAboutSection from "@/components/about-section"
import ProjectsSection from "@portfolio/ui/projects-section"
import GallerySection from "@portfolio/ui/gallery-section"
import SketchesSection from "@portfolio/ui/sketches-section"
import { useLanguage } from "@portfolio/lib/contexts/LanguageContext"

function HomeContent() {
  const { t } = useLanguage()
  
  return (
    <>
      <EmilyAboutSection />
      <ProjectsSection
        sectionId="projects" 
        section="Projects"
        title={t('sections.projects')}
        hoverEffect="gentle"
      />
      <GallerySection 
        sectionId="canvas" 
        source="gallery"
        title={t('sections.canvas')}
        basePath="canvas"
        hoverEffect="gentle"
      />
      <SketchesSection hoverEffect="gentle" />
    </>
  )
}

export default function Home() {
  return <HomeContent />
}

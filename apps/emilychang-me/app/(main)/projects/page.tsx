"use client"

import ProjectsSection from "@portfolio/ui/projects-section"
import { useLanguage } from '@portfolio/lib/contexts/language-context'

export default function ProjectsPage() {
  const { t } = useLanguage()
  
  return (
    <div className="min-h-screen">
      <div className="container py-12 md:py-16">
        <h1 className="font-heading italic text-3xl md:text-4xl text-primary mb-4">
          {t('sections.projects')}
        </h1>
        <p className="font-body text-secondary mb-8">
          Explore my creative projects across design and creation.
        </p>
      </div>
      <ProjectsSection section="Projects" sectionId="projects" hoverEffect="gentle" />
    </div>
  )
}

"use client"

import { useEffect, useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import ProjectCard from '@/components/project-card'
import type { ProjectMetadata } from '@/lib/markdown'

export default function ProjectsPageClient() {
  const { language, t } = useLanguage()
  const [projects, setProjects] = useState<ProjectMetadata[]>([])
  const [loading, setLoading] = useState(false)
  const [isLanguageChanging, setIsLanguageChanging] = useState(false)

  useEffect(() => {
    async function fetchProjects() {
      try {
        if (projects.length > 0) {
          setIsLanguageChanging(true)
        } else {
          setLoading(true)
        }
        const response = await fetch(`/api/projects?locale=${language}`)
        if (response.ok) {
          const projectsData = await response.json()
          setProjects(projectsData)
        }
      } catch (error) {
        console.error('Error fetching projects:', error)
      } finally {
        setLoading(false)
        setIsLanguageChanging(false)
      }
    }

    fetchProjects()
  }, [language])

  if (loading) {
    return (
      <div className="page-transition-enter">
        <div className="container py-16 md:py-24">
           <h1 className="font-space-grotesk text-lg uppercase tracking-wider text-secondary mb-4">{t('projects.title')}</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--column-spacing)]">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="group relative flex flex-col">
                <div className="relative overflow-hidden bg-muted">
                  {/* Strict 3:2 aspect ratio container - matches ProjectCard */}
                  <div className="relative w-full aspect-[3/2]" style={{ paddingBottom: "66.67%" }}>
                    <div className="absolute inset-0">
                      <div className="absolute inset-0 bg-muted animate-pulse">
                        <div className="animate-shimmer absolute inset-0 -translate-x-full bg-gradient-to-r from-muted via-muted/50 to-muted" />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Content area with padding that matches ProjectCard */}
                <div className="pt-3">
                  <div className="h-7 w-3/4 bg-muted animate-pulse rounded-md mb-2"></div>
                  <div className="h-4 w-1/2 bg-muted animate-pulse rounded-md mb-4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-transition-enter">
      <div className="container py-16 md:py-24">
        <h1 className="font-space-grotesk text-lg uppercase tracking-wider text-secondary mb-4">{t('projects.title')}</h1>
        {projects.length === 0 ? (
          <p className="font-ibm-plex text-muted-foreground">{t('projects.noProjectsFound')}</p>
        ) : (
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-[var(--column-spacing)] transition-opacity duration-300 ${isLanguageChanging ? 'opacity-70' : 'opacity-100'}`}>
            {projects.map((project, index) => (
              <ProjectCard
                key={project.slug}
                title={project.title}
                category={project.category}
                subcategory={project.subcategory || ""}
                slug={project.slug}
                imageUrl={project.imageUrl}
                pinned={project.pinned}
                locked={project.locked}
                tooltip={project.tooltip}
                priority={index < 3}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

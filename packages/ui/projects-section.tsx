"use client"

import { useEffect, useState, useRef } from "react"
import ProjectCard from "./project-card"
import { ProjectMetadata } from "@portfolio/lib/lib/markdown"
import { useIntersectionObserver } from "@portfolio/lib/hooks/use-intersection-observer"
import { useLanguage } from "@portfolio/lib/contexts/LanguageContext"

interface ProjectsSectionProps {
  section?: string
  title?: string
  sectionId?: string
}

export default function ProjectsSection({ section, title, sectionId = "projects" }: ProjectsSectionProps = {}) {
  const { language, t } = useLanguage()
  const [projects, setProjects] = useState<ProjectMetadata[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [forceLoad, setForceLoad] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  
  // Load immediately if hash points to gallery or projects
  const shouldLoadImmediately = typeof window !== 'undefined' && 
    (window.location.hash === '#projects' || window.location.hash === '#gallery')
  
  const isVisible = useIntersectionObserver({
    elementRef: sectionRef as React.RefObject<Element>,
    rootMargin: '100px'
  })

  useEffect(() => {
    const onForce = (e: Event) => {
      const ce = e as CustomEvent<string>
      if (ce.detail === "projects") setForceLoad(true)
    }
    window.addEventListener("force-load-section", onForce as EventListener)
    return () => window.removeEventListener("force-load-section", onForce as EventListener)
  }, [])

  useEffect(() => {
    async function fetchProjects() {
      try {
        const sectionParam = section ? `&section=${encodeURIComponent(section)}` : ''
        const response = await fetch(`/api/projects?locale=${language}${sectionParam}`)
        const data = await response.json()
        setProjects(data)
      } catch (error) {
        console.error('Failed to fetch projects:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (shouldLoadImmediately || isVisible || forceLoad) {
      fetchProjects()
    }
  }, [isVisible, language, shouldLoadImmediately, forceLoad, section])

  return (
    <section ref={sectionRef} id={sectionId} className="py-12 md:py-16 border-b border-border">
      <div className="container">
        <h2 className="font-heading italic text-2xl md:text-3xl text-primary mb-8">{title || t('projects.title')}</h2>
        
        {/* Reserve space to prevent layout shift with responsive min-height */}
        <div 
          className={`grid grid-cols-1 md:grid-cols-3 gap-[var(--column-spacing)] ${isLoading ? 'min-h-[2400px] md:min-h-[800px]' : ''}`}
          style={{ transition: 'min-height 0.3s ease-out' }}
        >
          {isLoading ? (
            // Placeholder cards while loading - match exact project card structure
            [...Array(6)].map((_, i) => (
              <div key={i} className="group relative flex flex-col">
                <div className="relative overflow-hidden bg-muted">
                  {/* Strict 3:2 aspect ratio container - matches ProjectCard */}
                  <div className="relative w-full aspect-[3/2]">
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
            ))
          ) : (
            projects.map((project, index) => (
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
            ))
          )}
        </div>
      </div>
    </section>
  )
}


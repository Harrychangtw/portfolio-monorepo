"use client"

import { useEffect, useState } from 'react'

import { ArrowLeft } from "lucide-react"
import { useLanguage } from '@portfolio/lib/contexts/language-context'
import { GalleryImageContainer } from "@portfolio/ui/gallery-image-container"
import type { ProjectMetadata } from '@portfolio/lib/lib/markdown'
import NextUpCard from "@portfolio/ui/next-up-card"
import NavigationLink from "@portfolio/ui/navigation-link"

interface ProjectPageClientProps {
  initialProject: ProjectMetadata & { contentHtml: string }
  nextProject?: { slug: string; title: string; category: string; imageUrl: string; aspectRatio?: number } | null
}

export default function ProjectPageClient({ initialProject, nextProject }: ProjectPageClientProps) {
  const { language, t } = useLanguage()
  const [project, setProject] = useState(initialProject)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchLocalizedProject() {
      const baseSlug = project.slug.replace('_zh-tw', '')
      let targetSlug = baseSlug

      if (language === 'zh-TW') {
        targetSlug = `${baseSlug}_zh-tw`
      }

      // Only fetch if we need a different version than what we currently have
      if (targetSlug !== project.slug) {
        try {
          setLoading(true)
          const response = await fetch(`/api/projects/${targetSlug}`)
          if (response.ok) {
            const projectData = await response.json()
            // Preserve dimension data (imageWidth, imageHeight) from initial load
            // API returns full dimension data, so this should be available
            setProject(projectData)
          } else {
            // If the target version doesn't exist, fall back to base version
            if (language === 'zh-TW' && targetSlug.includes('_zh-tw')) {
              const fallbackResponse = await fetch(`/api/projects/${baseSlug}`)
              if (fallbackResponse.ok) {
                const fallbackData = await fallbackResponse.json()
                setProject(fallbackData)
              }
            }
          }
        } catch (error) {
          console.error('Error fetching localized version:', error)
          // Keep the current project on error
        } finally {
          setLoading(false)
        }
      }
    }

    fetchLocalizedProject()
  }, [language, project.slug])

  if (loading) {
    return (
      <div className="page-transition-enter">
        <div className="pb-12">
          <div className="container">
            <div className="animate-pulse">
              <div className="bg-gray-300 aspect-[3/2] rounded mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12">
                <div className="md:col-span-4">
                  <div className="h-4 bg-gray-300 rounded mb-4"></div>
                  <div className="h-8 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
                <div className="md:col-span-8">
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-transition-enter">
      <div className="pb-12">
        <div className="container">
          {/* Hero image section - Enforcing strict 3:2 (1.5) aspect ratio */}
          <div className="relative w-full mb-8">
            <GalleryImageContainer
              src={project.imageUrl}
              alt={project.title}
              priority={true}
              quality={95}
              noInsetPadding={true}
              aspectRatio={1.5}
            />
          </div>
        </div>

        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12">
            {/* Left column */}
            <div className="md:col-span-4 mb-10 md:mb-0">
              <div className="md:sticky md:top-24">
                <div className="relative">
                  <NavigationLink
                    href="/#projects"
                    className="inline-flex items-center text-secondary hover:text-primary transition-colors"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    <span className="font-body">{t('projects.backToProjects')}</span>
                  </NavigationLink>
                  <div className="mt-8">
                    <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4 md:mb-8 text-primary">{project.title}</h1>
                    <p className="font-body text-secondary uppercase text-sm mb-6 md:mb-12">{project.category}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column - aligned with title */}
            <div className="md:col-span-8">
              <div className="md:mt-14">
                {/* Description area */}
                <div className="mb-16 md:mb-24">
                  <p className="font-body text-lg md:text-xl mb-10 md:mb-16 text-primary">{project.description}</p>

                  {/* Additional attributes in a grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-8 md:gap-x-4 mb-16 md:mb-24 text-secondary">
                    {project.year && (
                      <div>
                        <p className="font-heading uppercase text-xs mb-1 text-secondary">{t('projects.year')}</p>
                        <p className="font-body text-secondary">{project.year}</p>
                      </div>
                    )}
                    {project.role && (
                      <div>
                        <p className="font-heading uppercase text-xs mb-1 text-secondary">{t('projects.role')}</p>
                        <p className="font-body text-secondary">{project.role}</p>
                      </div>
                    )}
                    {project.technologies && project.technologies.length > 0 && (
                      <div>
                        <p className="font-heading uppercase text-xs mb-1 text-secondary">{t('projects.technologies')}</p>
                        <p className="font-body text-secondary">{project.technologies.join(", ")}</p>
                      </div>
                    )}
                    {project.client && (
                      <div>
                        <p className="font-heading uppercase text-xs mb-1 text-secondary">{t('projects.client')}</p>
                        <p className="font-body text-secondary">{project.client}</p>
                      </div>
                    )}
                    {project.website && (
                      <div>
                        <p className="font-heading uppercase text-xs mb-1 text-secondary">{t('projects.website')}</p>
                        <p className="font-body text-secondary">
                          <a
                            href={project.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline hover:text-primary transition-colors"
                          >
                            {project.website.replace(/^https?:\/\//, '')}
                          </a>
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Main content */}
                <div
                  className="prose prose-lg max-w-none dark:prose-invert mb-16 md:mb-24"
                  dangerouslySetInnerHTML={{
                    __html: project.contentHtml
                  }}
                />
                {/* Next Up Card */}
                {nextProject && (
                  <NextUpCard
                    title={nextProject.title}
                    category={nextProject.category}
                    slug={nextProject.slug}
                    imageUrl={nextProject.imageUrl}
                    basePath="projects"
                    aspectRatio={nextProject.aspectRatio}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

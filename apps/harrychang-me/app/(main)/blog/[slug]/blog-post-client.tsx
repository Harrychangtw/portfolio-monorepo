"use client"

import { useEffect, useState, useRef } from 'react'
import { ArrowLeft } from "lucide-react"
import { useLanguage } from '@portfolio/lib/contexts/language-context'
import { ImageContainer } from "@portfolio/ui/image-container"
import type { PostMetadata } from '@portfolio/lib/lib/markdown'
import NextUpCard from "@portfolio/ui/next-up-card"
import NavigationLink from "@portfolio/ui/navigation-link"
import { TableOfContents } from '@portfolio/ui/table-of-contents'

interface BlogPostClientProps {
  initialPost: PostMetadata & { contentHtml: string }
  nextPost?: { slug: string; title: string; category: string; imageUrl: string; aspectRatio?: number } | null
}

export default function BlogPostClient({ initialPost, nextPost }: BlogPostClientProps) {
  const { language, t } = useLanguage()
  const [post, setPost] = useState(initialPost)
  const [loading, setLoading] = useState(false)
  const contentRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    async function fetchLocalizedPost() {
      const baseSlug = post.slug.replace('_zh-tw', '')
      let targetSlug = baseSlug

      if (language === 'zh-TW') {
        targetSlug = `${baseSlug}_zh-tw`
      }

      if (targetSlug !== post.slug) {
        try {
          setLoading(true)
          const response = await fetch(`/api/posts/${targetSlug}`)
          if (response.ok) {
            const postData = await response.json()
            setPost(postData)
          } else {
            if (language === 'zh-TW' && targetSlug.includes('_zh-tw')) {
              const fallbackResponse = await fetch(`/api/posts/${baseSlug}`)
              if (fallbackResponse.ok) {
                const fallbackData = await fallbackResponse.json()
                setPost(fallbackData)
              }
            }
          }
        } catch (error) {
          console.error('Error fetching localized version:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchLocalizedPost()
  }, [language, post.slug])

  // Format date
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="page-transition-enter">
        <div className="pb-12 pt-24">
          <div className="container">
            <div className="animate-pulse">
              <div className="h-12 bg-gray-300 rounded w-2/3 mb-12"></div>
              <div className="bg-gray-300 aspect-[3/2] rounded mb-12"></div>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12">
                <div className="md:col-span-4">
                   <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
                   <div className="h-32 bg-gray-300 rounded"></div>
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
      <div className="pb-12 pt-24 md:pt-32">
        <div className="container">
          
          {/* Header Section: Title (Left 2 cols) & Metadata (Right 1 col) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 mb-8 md:mb-12 items-start">
            {/* Title - Spans 2 columns of visual weight (cols 1-8) */}
            <div className="md:col-span-8">
              <h1 className="font-heading text-4xl md:text-4xl lg:text-4xl font-bold text-primary leading-tight">
                {post.title}
              </h1>
            </div>

            {/* Date & Tags - Right column (cols 9-12), left aligned within that column */}
            <div className="md:col-span-4 flex flex-col justify-end space-y-6">
              <div>
                <p className="font-heading uppercase text-xs tracking-wider text-secondary mb-1">Date</p>
                <p className="font-body text-secondary">{formatDate(post.date)}</p>
              </div>
              
              {post.tags && post.tags.length > 0 && (
                <div>
                   <p className="font-heading uppercase text-xs tracking-wider text-secondary mb-2">{t('blog.tags')}</p>
                   <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span key={tag} className="font-body text-sm text-secondary bg-muted px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                   </div>
                </div>
              )}
            </div>
          </div>

          {/* Hero image section - Full width 3:2 */}
          <div className="relative w-full mb-16 md:mb-24">
            <ImageContainer
              src={post.imageUrl}
              alt={post.title}
              priority={true}
              quality={95}
              noInsetPadding={true}
              aspectRatio={1.5}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12">
            
            {/* Left Sidebar: Back Button & Table of Contents */}
            <div className="md:col-span-4">
              <div className="md:sticky md:top-24 flex flex-col gap-8">
                 <NavigationLink
                    href="/blog"
                    className="inline-flex items-center text-secondary hover:text-primary transition-colors"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    <span className="font-body">{t('blog.backToBlog')}</span>
                  </NavigationLink>

                  <div className="hidden md:block pt-8 border-t border-border">
                    <TableOfContents contentHtml={post.contentHtml} />
                  </div>
              </div>
            </div>

            {/* Right Content: Description & Prose */}
            <div className="md:col-span-8">
               {/* Description / Lead Paragraph */}
               {post.description && (
                  <p className="font-body text-lg md:text-xl leading-relaxed text-primary mb-12 font-medium">
                    {post.description}
                  </p>
               )}

              {/* Markdown Content */}
              <div
                ref={contentRef}
                className="prose prose-lg max-w-none dark:prose-invert mb-16 md:mb-24"
                dangerouslySetInnerHTML={{
                  __html: post.contentHtml
                }}
              />

              {/* Next Up Card */}
              {nextPost && (
                <NextUpCard
                  title={nextPost.title}
                  category={nextPost.category}
                  slug={nextPost.slug}
                  imageUrl={nextPost.imageUrl}
                  basePath="blog"
                  aspectRatio={nextPost.aspectRatio}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
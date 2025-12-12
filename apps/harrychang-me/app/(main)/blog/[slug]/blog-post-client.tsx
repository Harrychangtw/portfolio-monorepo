"use client"

import { useEffect, useState } from 'react'
import { ArrowLeft } from "lucide-react"
import { useLanguage } from '@portfolio/lib/contexts/language-context'
import { ImageContainer } from "@portfolio/ui/image-container"
import type { PostMetadata } from '@portfolio/lib/lib/markdown'
import NextUpCard from "@portfolio/ui/next-up-card"
import NavigationLink from "@portfolio/ui/navigation-link"

interface BlogPostClientProps {
  initialPost: PostMetadata & { contentHtml: string }
  nextPost?: { slug: string; title: string; category: string; imageUrl: string; aspectRatio?: number } | null
}

export default function BlogPostClient({ initialPost, nextPost }: BlogPostClientProps) {
  const { language, t } = useLanguage()
  const [post, setPost] = useState(initialPost)
  const [loading, setLoading] = useState(false)

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
          {/* Hero image section */}
          <div className="relative w-full mb-8">
            <ImageContainer
              src={post.imageUrl}
              alt={post.title}
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
                    href="/blog"
                    className="inline-flex items-center text-secondary hover:text-primary transition-colors"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    <span className="font-body">{t('blog.backToBlog')}</span>
                  </NavigationLink>
                  <div className="mt-8">
                    <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4 md:mb-8 text-primary">{post.title}</h1>
                    <p className="font-body text-secondary text-sm mb-2">{formatDate(post.date)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="md:col-span-8">
              <div className="md:mt-14">
                {/* Description area */}
                <div className="mb-16 md:mb-24">
                  <p className="font-body text-lg md:text-xl mb-10 md:mb-16 text-primary">{post.description}</p>

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="mb-16 md:mb-24">
                      <p className="font-heading uppercase text-xs mb-2 text-secondary">{t('blog.tags')}</p>
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

                {/* Main content */}
                <div
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
    </div>
  )
}


"use client"

import { useEffect, useState } from 'react'
import { useLanguage } from '@portfolio/lib/contexts/language-context'
import ArticleCard from '@portfolio/ui/article-card'
import type { PostMetadata } from '@portfolio/lib/lib/markdown'

export default function BlogPageClient() {
  const { language, t } = useLanguage()
  const [posts, setPosts] = useState<PostMetadata[]>([])
  const [loading, setLoading] = useState(true)
  const [isLanguageChanging, setIsLanguageChanging] = useState(false)

  useEffect(() => {
    async function fetchPosts() {
      try {
        if (posts.length > 0) {
          setIsLanguageChanging(true)
        } else {
          setLoading(true)
        }
        const response = await fetch(`/api/posts?locale=${language}`)
        if (response.ok) {
          const postsData = await response.json()
          setPosts(postsData)
        }
      } catch (error) {
        console.error('Error fetching posts:', error)
      } finally {
        setLoading(false)
        setIsLanguageChanging(false)
      }
    }

    fetchPosts()
  }, [language])

  if (loading) {
    return (
      <div className="page-transition-enter">
        <div className="container py-16 md:py-24">
          <h1 className="font-heading text-lg uppercase tracking-wider text-secondary mb-4">{t('blog.title')}</h1>
          {/* Matches ProjectsSection: Simple grid, no absolute dividers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--column-spacing)]">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="group relative flex flex-col">
                <div className="pb-3">
                  <div className="h-6 w-3/4 bg-muted animate-pulse rounded-md mb-2"></div>
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-12 bg-muted animate-pulse rounded-md"></div>
                    <div className="h-10 w-16 bg-muted animate-pulse rounded-md"></div>
                  </div>
                </div>
                <div className="relative overflow-hidden bg-muted">
                  <div className="relative w-full aspect-[3/2]">
                    <div className="absolute inset-0 bg-muted animate-pulse">
                      <div className="animate-shimmer absolute inset-0 -translate-x-full bg-gradient-to-r from-muted via-muted/50 to-muted" />
                    </div>
                  </div>
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
        <h1 className="font-heading text-lg uppercase tracking-wider text-secondary mb-4">{t('blog.title')}</h1>
        {posts.length === 0 ? (
          <p className="font-body text-secondary">{t('blog.noPostsFound')}</p>
        ) : (
          <div 
            className={`grid grid-cols-1 md:grid-cols-3 gap-[var(--column-spacing)] transition-opacity duration-300 ${isLanguageChanging ? 'opacity-70' : 'opacity-100'}`}
          >
            {/* Removed the absolute positioned vertical lines to match ProjectSection consistency */}
            {posts.map((post, index) => (
              <ArticleCard
                key={post.slug}
                title={post.title}
                date={post.date}
                slug={post.slug}
                tags={post.tags}
                imageUrl={post.imageUrl}
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

"use client"

import { useEffect, useState, useRef } from "react"
import { useLanguage } from '@portfolio/lib/contexts/language-context'
import { useIntersectionObserver } from "@portfolio/lib/hooks/use-intersection-observer"
import NavigationLink from "@portfolio/ui/navigation-link"
import type { PostMetadata } from '@portfolio/lib/lib/markdown'
import { ArrowRight } from "lucide-react"

export default function LatestWritingSection() {
  const { language, t } = useLanguage()
  const [posts, setPosts] = useState<PostMetadata[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const sectionRef = useRef<HTMLElement>(null)
  const hasFetchedRef = useRef(false)
  const lastLanguageRef = useRef(language)

  const isVisible = useIntersectionObserver({
    elementRef: sectionRef as React.RefObject<Element>,
    rootMargin: '100px'
  })

  useEffect(() => {
    if (hasFetchedRef.current && lastLanguageRef.current === language) {
      return
    }

    async function fetchPosts() {
      try {
        const response = await fetch(`/api/posts?locale=${language}`)
        const data = await response.json()
        // Get only the 3 most recent posts
        setPosts(data.slice(0, 3))
        hasFetchedRef.current = true
        lastLanguageRef.current = language
      } catch (error) {
        console.error('Failed to fetch posts:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (isVisible) {
      fetchPosts()
    }
  }, [isVisible, language])

  // Format date as DD.MM.YYYY
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    const day = d.getDate().toString().padStart(2, '0')
    const month = (d.getMonth() + 1).toString().padStart(2, '0')
    const year = d.getFullYear()
    return `${day}.${month}.${year}`
  }

  return (
    <section ref={sectionRef} id="writing" className="py-12 md:py-16 border-b border-border">
      <div className="container">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-lg uppercase tracking-wider text-secondary">{t('blog.latestWriting')}</h2>
          <NavigationLink
            href="/blog"
            className="flex items-center gap-1 text-sm text-secondary hover:text-primary transition-colors"
          >
            {t('blog.viewAll')}
            <ArrowRight className="h-4 w-4" />
          </NavigationLink>
        </div>

        <div className="space-y-0">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="py-4 border-t border-border first:border-t-0">
                <div className="flex items-center justify-between">
                  <div className="h-5 w-2/3 bg-muted animate-pulse rounded"></div>
                  <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
                </div>
              </div>
            ))
          ) : posts.length === 0 ? (
            <p className="font-body text-secondary py-4">{t('blog.noPostsFound')}</p>
          ) : (
            posts.map((post, index) => (
              <NavigationLink
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block py-4 border-t border-border first:border-t-0 group"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-body text-primary group-hover:text-[hsl(var(--accent))] transition-colors line-clamp-1 pr-4">
                    {post.title}
                  </h3>
                  <span className="font-body text-sm text-secondary whitespace-nowrap">
                    {formatDate(post.date)}
                  </span>
                </div>
              </NavigationLink>
            ))
          )}
        </div>
      </div>
    </section>
  )
}


"use client"

import { useEffect, useState } from 'react'
import { useLanguage } from '@portfolio/lib/contexts/LanguageContext'
import GalleryItemClient from './gallery-item-client'
import type { GalleryItemMetadata } from '@portfolio/lib/lib/markdown'

interface GalleryItemPageClientProps {
  initialItem: GalleryItemMetadata & { contentHtml: string }
}

export default function GalleryItemPageClient({ initialItem }: GalleryItemPageClientProps) {
  const { language } = useLanguage()
  const [item, setItem] = useState(initialItem)
  const [loading, setLoading] = useState(false) // remains false unless fetching new language

  useEffect(() => {
    async function fetchLocalizedItem() {
      const baseSlug = item.slug.replace('_zh-tw', '')
      let targetSlug = baseSlug
      
      if (language === 'zh-TW') {
        targetSlug = `${baseSlug}_zh-tw`
      }
      
      // Only fetch if we need a different version than what we currently have
      if (targetSlug !== item.slug) {
        try {
          setLoading(true)
          const response = await fetch(`/api/gallery/${targetSlug}`)
          if (response.ok) {
            const itemData = await response.json()
            setItem(itemData)
          } else {
            // If the target version doesn't exist, fall back to base version
            if (language === 'zh-TW' && targetSlug.includes('_zh-tw')) {
              const fallbackResponse = await fetch(`/api/gallery/${baseSlug}`)
              if (fallbackResponse.ok) {
                const fallbackData = await fallbackResponse.json()
                setItem(fallbackData)
              }
            }
          }
        } catch (error) {
          console.error('Error fetching localized version:', error)
          // Keep the current item on error
        } finally {
          setLoading(false)
        }
      }
    }

    fetchLocalizedItem()
  }, [language, item.slug])

  if (loading) {
    return (
      <div className="page-transition-enter">
        <div className="min-h-screen">
          <div className="container">
            <div className="animate-pulse">
              <div className="bg-gray-300 aspect-[4/5] rounded mb-8"></div>
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

  return <GalleryItemClient item={item} />
}

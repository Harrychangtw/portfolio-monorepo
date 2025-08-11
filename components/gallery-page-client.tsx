"use client"

import { useEffect, useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import GalleryCard from '@/components/gallery-card'
import { createBalancedLayout } from '@/lib/utils'
import type { GalleryItemMetadata } from '@/lib/markdown'

export default function GalleryPageClient() {
  const { language, t } = useLanguage()
  const [galleryItems, setGalleryItems] = useState<GalleryItemMetadata[]>([])
  const [loading, setLoading] = useState(false)
  const [isLanguageChanging, setIsLanguageChanging] = useState(false)

  useEffect(() => {
    async function fetchGallery() {
      try {
        if (galleryItems.length > 0) {
          setIsLanguageChanging(true)
        } else {
          setLoading(true)
        }
        const response = await fetch(`/api/gallery?locale=${language}`)
        if (response.ok) {
          const galleryData = await response.json()
          setGalleryItems(galleryData)
        }
      } catch (error) {
        console.error('Error fetching gallery:', error)
      } finally {
        setLoading(false)
        setIsLanguageChanging(false)
      }
    }

    fetchGallery()
  }, [language])

  // Handle pinned items (maintain their positions in the layout)
  const getPinnedItemsMap = (items: typeof galleryItems) => {
    const pinnedMap = new Map<number, { rowIndex: number, columnIndex: number }>()
    
    items.forEach((item, index) => {
      // Check if item is pinned (pinned value is a number >= 0)
      if (typeof item.pinned === 'number' && item.pinned >= 0) {
        // Calculate position based on pin order
        // Pin order starts at 1, rows are 0-indexed
        const pinOrder = item.pinned - 1 // Convert 1-based to 0-based
        const naturalRow = Math.floor(pinOrder / 3)
        const naturalColumn = pinOrder % 3
        
        pinnedMap.set(index, {
          rowIndex: naturalRow,
          columnIndex: naturalColumn
        })
      }
    })
    
    return pinnedMap
  }

  if (loading) {
    return (
      <div className="page-transition-enter">
        <div className="container py-16 md:py-24">
          <h1 className="font-space-grotesk text-lg uppercase tracking-wider text-secondary mb-4">{t('gallery.title')}</h1>
          <div className="flex flex-col md:flex-row w-full gap-[var(--column-spacing)]">
            {[...Array(3)].map((_, colIndex) => (
              <div key={colIndex} className="flex-1 space-y-[var(--column-spacing)]">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className={`bg-gray-300 rounded ${i % 2 === 0 ? 'aspect-[4/5]' : 'aspect-[5/4]'}`}></div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Create a balanced layout
  const layoutResult = createBalancedLayout(galleryItems, getPinnedItemsMap(galleryItems))

  return (
    <div className="page-transition-enter">
      <div className="container py-16 md:py-24">
        <h1 className="font-space-grotesk text-lg uppercase tracking-wider text-secondary mb-4">{t('gallery.title')}</h1>
        {galleryItems.length === 0 ? (
          <p className="font-ibm-plex text-muted-foreground">{t('gallery.noGalleryFound')}</p>
        ) : (
          <div className={`flex flex-col md:flex-row w-full gap-[var(--column-spacing)] transition-opacity duration-300 ${isLanguageChanging ? 'opacity-70' : 'opacity-100'}`}>
            {layoutResult.columns.map((column, colIndex) => (
              <div key={colIndex} className="flex-1 space-y-[var(--column-spacing)]">
                {column.map((layoutItem) => (
                  <GalleryCard
                    key={layoutItem.item.slug}
                    title={layoutItem.item.title}
                    quote={layoutItem.item.quote}
                    slug={layoutItem.item.slug}
                    imageUrl={layoutItem.item.imageUrl}
                    pinned={layoutItem.item.pinned}
                    locked={layoutItem.item.locked}
                    priority={layoutItem.itemIndex < 3}
                    index={layoutItem.itemIndex}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

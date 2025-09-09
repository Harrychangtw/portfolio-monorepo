"use client"

import { useEffect, useState, useRef } from "react"
import GalleryCard from "./gallery-card"
import { GalleryItemMetadata } from "@/lib/markdown"
import { createBalancedLayout } from "@/lib/utils"
import { useIntersectionObserver } from "@/hooks/use-intersection-observer"
import { useLanguage } from "@/contexts/LanguageContext"

export default function GallerySection() {
  const { language, t } = useLanguage()
  const [galleryItems, setGalleryItems] = useState<GalleryItemMetadata[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const sectionRef = useRef<HTMLElement>(null)
  
  // Check if we should load immediately (when there's a hash in URL)
  const shouldLoadImmediately = typeof window !== 'undefined' && window.location.hash === '#gallery'
  
  const isVisible = useIntersectionObserver({
    elementRef: sectionRef as React.RefObject<Element>,
    rootMargin: '100px'
  })

  useEffect(() => {
    async function fetchGalleryItems() {
      try {
        const response = await fetch(`/api/gallery?locale=${language}`)
        const data = await response.json()
        setGalleryItems(data)
      } catch (error) {
        console.error('Failed to fetch gallery items:', error)
      } finally {
        setIsLoading(false)
      }
    }

    // Load immediately if hash is #gallery, otherwise wait for visibility
    if (shouldLoadImmediately || isVisible) {
      fetchGalleryItems()
    }
  }, [isVisible, language, shouldLoadImmediately])

  // Handle pinned items (maintain their positions in the layout)
  const getPinnedItemsMap = (items: GalleryItemMetadata[]) => {
    const pinnedMap = new Map<number, { rowIndex: number, columnIndex: number }>()
    
    items.forEach((item, index) => {
      if (typeof item.pinned === 'number' && item.pinned >= 0) {
        const pinOrder = item.pinned - 1
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

  // Create a balanced layout using our algorithm
  const layoutResult = isLoading ? null : createBalancedLayout(galleryItems, getPinnedItemsMap(galleryItems))

  // Helper function to create a placeholder with a specific aspect ratio
  const renderPlaceholderCard = (aspectRatio: string, index: number) => (
    <div key={index} className="mb-2 md:mb-4">
      <div className="relative overflow-hidden bg-white">
        <div className="relative">
          <div className="absolute inset-0 z-10 pointer-events-none border-l-4 border-r-4 border-white"></div>
          
          <div 
            className="relative w-full overflow-hidden" 
            style={{ paddingBottom: aspectRatio }}
          >
            <div className="absolute inset-0 w-full h-full">
              <div className="w-full h-full bg-muted animate-pulse overflow-hidden">
                <div className="animate-shimmer absolute inset-0 -translate-x-full bg-gradient-to-r from-muted via-muted/50 to-muted" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <section ref={sectionRef} id="gallery" className="py-12 md:py-16">
      <div className="container">
        <h2 className="font-space-grotesk text-lg uppercase tracking-wider text-secondary mb-4">{t('gallery.title')}</h2>
        
        {/* Container with space reservation */}
        <div 
          className={`w-full ${isLoading ? 'min-h-[2400px] md:min-h-[900px]' : ''}`}
          style={{ transition: 'min-height 0.3s ease-out' }}
        >
          {isLoading ? (
            <div className="flex flex-col md:flex-row w-full gap-[var(--column-spacing)]" >
              <div className="flex-1 space-y-[var(--column-spacing)]">
                {renderPlaceholderCard("100%", 1)}
                {renderPlaceholderCard("100%", 2)}
              </div>
              
              <div className="flex-1 space-y-[var(--column-spacing)]">
                {renderPlaceholderCard("100%", 3)}
                {renderPlaceholderCard("100%", 4)}
              </div>
              
              <div className="flex-1 space-y-[var(--column-spacing)]">
                {renderPlaceholderCard("100%", 5)}
                {renderPlaceholderCard("100%", 6)}
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row w-full gap-[var(--column-spacing)]">
              {layoutResult && layoutResult.columns.map((column, colIndex) => (
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
    </section>
  )
}


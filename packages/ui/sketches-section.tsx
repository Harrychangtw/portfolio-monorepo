"use client"

import { useEffect, useState, useRef } from "react"
import SketchesCard from "./sketches-card"
import { useIntersectionObserver } from "@portfolio/lib/hooks/use-intersection-observer"
import { useLanguage } from "@portfolio/lib/contexts/LanguageContext"
import { motion, AnimatePresence } from "framer-motion"

interface SketchMetadata {
  slug: string
  imageUrl: string
}

interface SketchesSectionProps {
  sectionId?: string
  hoverEffect?: 'inward' | 'gentle' // Hover animation variant
}

export default function SketchesSection({ sectionId = "sketches", hoverEffect = 'inward' }: SketchesSectionProps = {}) {
  const { language, t } = useLanguage()
  const [allSketches, setAllSketches] = useState<SketchMetadata[]>([])
  const [displayedSketches, setDisplayedSketches] = useState<SketchMetadata[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  

  // Ref to track the hovered index without restarting the interval
  const hoveredIndexRef = useRef(hoveredIndex)
  hoveredIndexRef.current = hoveredIndex

  // Ref to track which language's sketches have been fetched
  const fetchedLanguageRef = useRef<string | null>(null)

  const sectionRef = useRef<HTMLElement>(null)
  
  const isVisible = useIntersectionObserver({
    elementRef: sectionRef as React.RefObject<Element>,
    rootMargin: '100px'
  })

  // Fetch all sketches
  useEffect(() => {
    async function fetchSketches() {
      try {
        const response = await fetch(`/api/sketches?locale=${language}`)
        const data = await response.json()
        setAllSketches(data)
        fetchedLanguageRef.current = language // Keep track of the fetched language
        if (data.length > 9) {
          const shuffled = [...data].sort(() => Math.random() - 0.5)
          setDisplayedSketches(shuffled.slice(0, 9))
        } else {
          setDisplayedSketches(data.slice(0, 9))
        }
      } catch (error) {
        console.error('Failed to fetch sketches:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (isVisible && fetchedLanguageRef.current !== language) {
      fetchSketches()
    }
  }, [isVisible, language])

  // Auto-rotation effect - swap one sketch at a time
  useEffect(() => {
    if (isLoading || allSketches.length <= 9) {
      return
    }

    const intervalId = setInterval(() => {
      setDisplayedSketches(prev => {
        // Access the latest hovered index via the ref
        const currentHoveredIndex = hoveredIndexRef.current
        
        // Pick a random index that is NOT hovered
        const availableIndexes = [...Array(9).keys()].filter(i => i !== currentHoveredIndex)
        if (availableIndexes.length === 0) return prev

        const notDisplayed = allSketches.filter(
          sketch => !prev.some(p => p.slug === sketch.slug)
        )
        if (notDisplayed.length === 0) return prev

        const indexToReplace = availableIndexes[Math.floor(Math.random() * availableIndexes.length)]
        const newSketch = notDisplayed[Math.floor(Math.random() * notDisplayed.length)]

        const updated = [...prev]
        updated[indexToReplace] = newSketch
        return updated
      })
    }, 3000)

    return () => clearInterval(intervalId)
  }, [allSketches, isLoading]) // Dependency on hoveredIndex is removed

  // Helper function to create a placeholder card
  const renderPlaceholderCard = (index: number) => (
    <div key={index} className="mb-2 md:mb-4">
      <div className="relative overflow-hidden bg-white">
        <div className="relative">
          <div className="absolute inset-0 z-10 pointer-events-none border-4 border-white"></div>
          
          <div 
            className="relative w-full overflow-hidden" 
            style={{ aspectRatio: '1 / 1' }}
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

  // Helper to get the sketch for a given slot (0-8)
  const getSketchForSlot = (slotIndex: number) => displayedSketches[slotIndex] || null

  return (
    <section ref={sectionRef} id={sectionId} className="py-12 md:py-16">
      <div className="container">
        <h2 className="font-heading text-lg uppercase tracking-wider text-secondary mb-4">
          {t('sections.sketches')}
        </h2>
        <div
          className={`w-full ${isLoading ? 'min-h-[1200px] md:min-h-[400px]' : ''}`}
          style={{ transition: 'min-height 0.3s ease-out' }}
        >
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--column-spacing)]">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => renderPlaceholderCard(i))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--column-spacing)]">
              {[0, 1, 2].map(columnIndex => (
                <div key={columnIndex} className="space-y-[var(--column-spacing)]">
                  {[columnIndex, columnIndex + 3, columnIndex + 6].map(slotIndex => {
                    const sketch = getSketchForSlot(slotIndex)
                    return (
                      <AnimatePresence mode="wait" key={slotIndex}>
                        {sketch && (
                          <motion.div
                            key={sketch.slug}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.01}}
                            transition={{ duration: 0.7, ease: 'easeIn' }}
                          >
                            <SketchesCard
                              imageUrl={sketch.imageUrl}
                              priority={slotIndex < 3}
                              index={slotIndex}
                              hoverEffect={hoverEffect}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

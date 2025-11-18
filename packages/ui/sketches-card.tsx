"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { useIntersectionObserver } from "@portfolio/lib/hooks/use-intersection-observer"

interface SketchesCardProps {
  imageUrl: string
  priority?: boolean
  index?: number
}

export default function SketchesCard({ 
  imageUrl, 
  priority = false,
  index = 0
}: SketchesCardProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isVisible = useIntersectionObserver({
    elementRef: containerRef as React.RefObject<Element>,
    rootMargin: '50px'
  })
  const [blurComplete, setBlurComplete] = useState(false)

  // Get the full resolution image URL and thumbnail
  const fullImageUrl = imageUrl?.replace('-thumb.webp', '.webp')
  const thumbnailSrc = imageUrl

  const shouldLoad = isVisible || priority || index < 9 // Load first 9 images immediately

  // Optimized sizes for responsive images
  // Sketches display at:
  // - Mobile: 100vw (full width single column)
  // - Tablet: 50vw (2 columns)  
  // - Desktop: 33vw (3 columns)
  const thumbnailSizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  const fullImageSizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"

  return (
    <motion.div 
      ref={containerRef}
      className="group relative"
      whileHover={{ 
        scale: 0.98,
        transition: { duration: 0.2, ease: "easeInOut" }
      }}
    >
      <div className="relative overflow-hidden bg-white">
        {/* Container for the image and border */}
        <div className="relative">
          {/* Border overlay - for square images, use uniform border */}
          <div className="absolute inset-0 z-10 pointer-events-none border-4 border-white"></div>
          
          {/* Image container - fixed square aspect ratio */}
          <div 
            className="relative w-full overflow-hidden" 
            style={{ aspectRatio: '1 / 1' }}
          >
            <div className="absolute inset-0 w-full h-full">
              {shouldLoad && (
                <>
                  {thumbnailSrc && (
                    <Image
                      src={thumbnailSrc}
                      alt="Sketch"
                      fill
                      className={`transition-all duration-700 ease-in-out group-hover:brightness-95 object-cover object-center ${blurComplete ? 'opacity-0' : 'opacity-100'}`}
                      sizes={thumbnailSizes}
                      quality={20}
                    />
                  )}
                  
                  <Image
                    src={fullImageUrl || "/placeholder.svg"}
                    alt="Sketch"
                    fill
                    className={`transition-all duration-700 ease-in-out group-hover:brightness-95 object-cover object-center ${blurComplete ? 'opacity-100' : 'opacity-0'}`}
                    sizes={fullImageSizes}
                    priority={priority || index < 3}
                    quality={70}
                    onLoad={() => setBlurComplete(true)}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

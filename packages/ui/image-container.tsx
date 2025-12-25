"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { useIsMobile } from "@portfolio/lib/hooks/use-mobile"
import { ImageLoadingSkeleton } from "./image-loading-skeleton"
import { useIntersectionObserver } from "@portfolio/lib/hooks/use-intersection-observer"

interface ImageContainerProps {
  src: string
  alt: string
  caption?: string
  priority?: boolean
  quality?: number
  aspectRatio?: number // Optional aspect ratio override (width/height)
  noInsetPadding?: boolean // Option to remove the inset padding (outline effect)
  sizes?: string // Optional sizes attribute for responsive layouts
  imgClassName?: string // Added: Pass classes to the inner Image component
  restrictPortraitWidth?: boolean // Added: Toggle desktop portrait centering (default true)
}

export function ImageContainer({
  src,
  alt,
  caption,
  priority = false,
  quality = 80,
  aspectRatio: providedAspectRatio,
  noInsetPadding = false,
  sizes = "100vw",
  imgClassName,
  restrictPortraitWidth = true,
}: ImageContainerProps) {
  const containerRef = useRef<HTMLElement>(null)
  const isVisible = useIntersectionObserver({ 
    elementRef: containerRef as React.RefObject<Element>,
    rootMargin: '50px'
  })
  
  // Use provided aspect ratio or default to 3:2 (standard photo ratio)
  // Never detect from thumbnail - trust build-time data
  const aspectRatio = providedAspectRatio ?? 1.5

  const [thumbLoaded, setThumbLoaded] = useState(false)
  const [blurComplete, setBlurComplete] = useState(false)
  const isMobile = useIsMobile()

  // Derive thumbnail and full-resolution URLs for blur-up loading.
  // Works whether `src` is a full image or already a `-thumb` URL.
  let thumbnailSrc: string | undefined
  let fullSrc = src

  if (src?.endsWith("-thumb.webp")) {
    // Card / preview URLs already point at the thumbnail
    thumbnailSrc = src
    fullSrc = src.replace("-thumb.webp", ".webp")
  } else if (src?.endsWith(".webp")) {
    thumbnailSrc = src.replace(".webp", "-thumb.webp")
    fullSrc = src
  } else if (src) {
    // Non-webp fallback – just use the same URL for both
    thumbnailSrc = src
    fullSrc = src
  }
  
  // Calculate border thickness as 0.01 (1%) of container width
  // Min 1px, max 4px on mobile and 6px on desktop
  const minThickness = isMobile ? 1 : 1
  const maxThickness = isMobile ? 4 : 6
  const borderThickness = `clamp(${minThickness}px, 0.01 * 100%, ${maxThickness}px)`

  // Responsive internal padding in pixels
  const insetPadding = noInsetPadding ? 0 : (isMobile ? 4 : 7)

  // Derive layout from aspect ratio (no dimension state needed)
  const isPortrait = aspectRatio < 1
  const isCinematic = aspectRatio >= 2.2 && aspectRatio <= 2.4
  const targetRatio = 1.5
  
  let containerPadding
  let horizontalPadding = '0px'
  let verticalPadding = '0px'
  let containerClass = ""
  
  if (isPortrait) {
    // On mobile, portrait images should always span full width
    // On desktop, maintain the target ratio with horizontal padding ONLY if restrictPortraitWidth is true
    if (isMobile || !restrictPortraitWidth) {
      // For all vertical images on mobile OR grid cards, use full width
      containerPadding = `${(1 / aspectRatio) * 100}%`
      horizontalPadding = '0px'
    } else {
      // For desktop feed views, maintain target ratio with horizontal padding
      containerPadding = `${(1 / aspectRatio) * 100}%`
      const relativeWidth = (aspectRatio / targetRatio) * 100
      horizontalPadding = `${(100 - relativeWidth) / 2}%`
    }
    containerClass = `border-t-[${borderThickness}] border-b-[${borderThickness}] border-white`
  } else if (isCinematic) {
    containerPadding = `${(1 / targetRatio) * 100}%`
    const cinematic_height_percentage = (targetRatio / aspectRatio) * 100
    verticalPadding = `${(100 - cinematic_height_percentage) / 2}%`
    containerClass = `border-l-[${borderThickness}] border-r-[${borderThickness}] border-white`
  } else {
    containerPadding = `${(1 / aspectRatio) * 100}%`
    containerClass = `border-l-[${borderThickness}] border-r-[${borderThickness}] border-white`
  }

  return (
    <figure className="w-full not-prose" ref={containerRef}>
      <div className="w-full">
        <div 
          className={`relative w-full ${noInsetPadding ? '' : 'bg-white'}`}
          style={{ 
            paddingTop: `${insetPadding}px`, 
            paddingBottom: `${insetPadding}px`,
            paddingLeft: isPortrait ? `calc(${horizontalPadding} + ${insetPadding}px)` : `${insetPadding}px`,
            paddingRight: isPortrait ? `calc(${horizontalPadding} + ${insetPadding}px)` : `${insetPadding}px`
          }}
        >
          <div 
            className="relative w-full overflow-hidden"
            style={{ 
              paddingBottom: containerPadding,
            }}
          >
            {!noInsetPadding && containerClass && (
              <div className={`absolute inset-0 z-10 pointer-events-none ${containerClass}`}></div>
            )}
            
            {/* Overlay Skeleton if loading or waiting for blur to complete */}
            {(!blurComplete) && <ImageLoadingSkeleton />}

            <div className="absolute inset-0">
              {(isVisible || priority) && (
                <>
                  {thumbnailSrc && (
                    <Image
                      src={thumbnailSrc}
                      alt={alt}
                      fill
                      className={`object-cover object-center transition-opacity duration-500 ${
                        blurComplete ? "opacity-0" : "opacity-100"
                      } ${imgClassName || ''}`}
                      sizes={sizes}
                      priority={priority}
                      quality={20}
                      onLoad={() => setThumbLoaded(true)}
                    />
                  )}
                  
                  <Image
                    src={fullSrc}
                    alt={alt}
                    fill
                    className={`object-contain object-center transition-opacity duration-500 ${
                      blurComplete ? "opacity-100" : "opacity-0"
                    } ${imgClassName || ''}`}
                    sizes={sizes}
                    priority={priority}
                    quality={quality}
                    onLoad={() => {
                      setBlurComplete(true)
                    }}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {caption && (
        <figcaption className="mt-2 text-sm text-muted-foreground text-left">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
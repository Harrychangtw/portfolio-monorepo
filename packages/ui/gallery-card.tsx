"use client"

import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { LockIcon } from "lucide-react"
import { useIntersectionObserver } from "@portfolio/lib/hooks/use-intersection-observer"
import { cva, type VariantProps } from "class-variance-authority"
import NavigationLink from "@portfolio/ui/navigation-link"

const cardVariants = cva("", {
  variants: {
    hoverEffect: {
      inward: "",
      gentle: "",
    },
  },
  defaultVariants: {
    hoverEffect: "inward",
  },
})

interface GalleryCardProps extends VariantProps<typeof cardVariants> {
  title: string
  quote: string
  slug: string
  imageUrl: string
  pinned?: number
  locked?: boolean
  priority?: boolean
  index?: number
  aspectRatio?: number
  width?: number
  height?: number
  basePath?: string
}

export default function GalleryCard({ 
  title, 
  quote, 
  slug, 
  imageUrl, 
  pinned, 
  locked,
  priority = false,
  index = 0,
  aspectRatio,
  width,
  height,
  basePath = 'gallery',
  hoverEffect = "inward"
}: GalleryCardProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isVisible = useIntersectionObserver({
    elementRef: containerRef as React.RefObject<Element>,
    rootMargin: '50px'
  })
  const [imageLoaded, setImageLoaded] = useState(false)
  const [thumbLoaded, setThumbLoaded] = useState(false)
  const [fullLoaded, setFullLoaded] = useState(false)

  // If we have width/height, calculate aspect ratio immediately to prevent CLS
  const haveDims = !!width && !!height
  const constrained = (() => {
    if (!haveDims) return { w: 1, h: 1, isPortrait: false }
    const raw = width! / height!
    const maxLandscapeRatio = 1.25 // 5:4
    const minPortraitRatio = 0.8   // 4:5
    let ratio = raw
    if (raw < minPortraitRatio) ratio = minPortraitRatio
    else if (raw > maxLandscapeRatio) ratio = maxLandscapeRatio
    return { w: ratio, h: 1, isPortrait: ratio < 1 }
  })()

  // Fallback dynamic measurement for cases without metadata dimensions
  const [originalAspect, setOriginalAspect] = useState<number>(1)
  const [isPortrait, setIsPortrait] = useState(false)
  const [aspectRatioPadding, setAspectRatioPadding] = useState<string>('100%')

  // Get the full resolution image URL and thumbnail
  const fullImageUrl = imageUrl?.replace('-thumb.webp', '.webp')
  const thumbnailSrc = imageUrl

  // Prefetch full resolution image on hover
  const prefetchFullImage = () => {
    if (typeof window !== 'undefined' && fullImageUrl) {
      const imgElement = new window.Image()
      imgElement.src = fullImageUrl
    }
  }

  // Detect original image dimensions when possible (only as fallback if no metadata)
  useEffect(() => {
    if (haveDims || (!isVisible && !priority)) return

    if (typeof window !== 'undefined') {
      const imgElement = new window.Image()
      
      imgElement.onload = () => {
        if (imgElement.height > 0) {
          const rawAspectRatio = imgElement.width / imgElement.height
          setOriginalAspect(rawAspectRatio)
          setIsPortrait(rawAspectRatio < 1)
          
          // Apply aspect ratio constraints
          const maxLandscapeRatio = 1.25 // 5:4
          const minPortraitRatio = 0.8 // 4:5
          
          let constrainedRatio = rawAspectRatio
          
          if (rawAspectRatio < minPortraitRatio) {
            constrainedRatio = minPortraitRatio
          } else if (rawAspectRatio > maxLandscapeRatio) {
            constrainedRatio = maxLandscapeRatio
          }
          
          setAspectRatioPadding(`${(1 / constrainedRatio) * 100}%`)
        }
        setImageLoaded(true)
      }
      
      imgElement.onerror = () => {
        setImageLoaded(true)
      }
      
      imgElement.src = imageUrl || "/placeholder.svg"
    }
  }, [imageUrl, isVisible, priority, haveDims])

  const shouldLoad = isVisible || priority || index < 6 // Load first 6 images immediately

  // Optimized sizes for responsive images
  // Gallery cards display at:
  // - Mobile: 100vw (full width)
  // - Tablet: 50vw (2 columns)  
  // - Desktop: ~448px (3 columns with 33vw but max 448px for 1440px screens)
  const thumbnailSizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 448px"
  const fullImageSizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 448px"

  const hoverAnimation = hoverEffect === "gentle" 
    ? { 
        scale: 1.02,
        transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as any }
      }
    : { 
        scale: 0.98,
        transition: { duration: 0.2, ease: [0.4, 0, 0.6, 1] as any }
      }

  return (
    <motion.div 
      ref={containerRef}
      className={`group relative ${!locked && hoverEffect === "gentle" ? "hover:shadow-xl" : ""}`}
      whileHover={!locked ? hoverAnimation : {}}
      onHoverStart={prefetchFullImage}
    >
      <NavigationLink href={`/${basePath}/${slug}`} className="block">
        <div className="relative overflow-hidden bg-white">
          {/* Container for the image and border */}
          <div className="relative">
            {/* Border overlay */}
            <div 
              className={`absolute inset-0 z-10 pointer-events-none ${
                (haveDims ? constrained.isPortrait : isPortrait)
                  ? "border-t-4 border-b-4 border-white" 
                  : "border-l-4 border-r-4 border-white"
              }`}
            ></div>
            
            {/* Image container */}
            <div 
              className="relative w-full overflow-hidden" 
              style={
                haveDims
                  // Use aspect-ratio to prevent CLS immediately
                  ? { aspectRatio: `${constrained.w} / ${constrained.h}` }
                  // Fallback if dims not available (rare)
                  : { paddingBottom: aspectRatioPadding }
              }
            >
              <div className="absolute inset-0 w-full h-full">
                {shouldLoad && (
                  <>
                    {/* Thumbnail: Always loads first with priority */}
                    {thumbnailSrc && (
                      <Image
                        src={thumbnailSrc}
                        alt={title}
                        fill
                        className={`transition-all duration-500 ease-out group-hover:brightness-95 ${
                          (haveDims ? constrained.isPortrait : isPortrait) &&
                          (haveDims ? (width! / height!) < 0.8 : originalAspect < 0.8) ||
                          (!haveDims ? !isPortrait : !constrained.isPortrait) &&
                          (haveDims ? (width! / height!) > 1.25 : originalAspect > 1.25)
                            ? "object-contain" : "object-cover"
                        } object-center ${fullLoaded ? 'opacity-0' : 'opacity-100'}`}
                        sizes={thumbnailSizes}
                        quality={20}
                        priority={priority || index < 6}
                        onLoad={() => setThumbLoaded(true)}
                      />
                    )}

                    {/* Full: Only start loading after thumbnail is ready */}
                    {thumbLoaded && (
                      <Image
                        src={fullImageUrl || "/placeholder.svg"}
                        alt={title}
                        fill
                        className={`transition-all duration-700 ease-in-out group-hover:brightness-95 ${
                          (haveDims ? constrained.isPortrait : isPortrait) &&
                          (haveDims ? (width! / height!) < 0.8 : originalAspect < 0.8) ||
                          (!haveDims ? !isPortrait : !constrained.isPortrait) &&
                          (haveDims ? (width! / height!) > 1.25 : originalAspect > 1.25)
                            ? "object-contain" : "object-cover"
                        } object-center ${fullLoaded ? 'opacity-100' : 'opacity-0'}`}
                        sizes={fullImageSizes}
                        quality={70}
                        onLoad={() => setFullLoaded(true)}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Status indicators */}
          {locked && (
            <div className="absolute top-3 right-3 flex gap-2 z-20">
              <div className="bg-secondary text-white p-1.5 rounded-full shadow-md">
                <LockIcon className="h-4 w-4" />
              </div>
            </div>
          )}
          
          {/* Title overlay */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10">
            <h3 className="font-heading text-lg font-medium text-white">{title}</h3>
            <p className="font-body text-sm text-white/80 mt-1">{quote}</p>
          </div>
        </div>
      </NavigationLink>
    </motion.div>
  )
}
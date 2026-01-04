"use client"

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { LockIcon } from "lucide-react"
import { useIntersectionObserver } from "@portfolio/lib/hooks/use-intersection-observer"
import { cva, type VariantProps } from "class-variance-authority"
import NavigationLink from "@portfolio/ui/navigation-link"
import { ImageContainer } from "@portfolio/ui/image-container"

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

  // 1. Aspect Ratio Logic: Force 4:5 (0.8) or 5:4 (1.25)
  // If metadata is present, we calculate immediately.
  // If not, we must load the image to determine which "bin" it falls into.
  
  const [fallbackAspectRatio, setFallbackAspectRatio] = useState<number | null>(null)
  
  const haveDims = !!width && !!height
  
  // Logic to clamp the raw ratio to our gallery standards
  const getConstrainedRatio = (w: number, h: number) => {
    const raw = w / h
    const maxLandscapeRatio = 1.25 // 5:4
    const minPortraitRatio = 0.8   // 4:5
    
    if (raw < minPortraitRatio) return minPortraitRatio
    if (raw > maxLandscapeRatio) return maxLandscapeRatio
    return raw
  }

  // Determine the target aspect ratio for the container
  let targetAspectRatio = 1 // Default to square while loading fallback
  
  if (haveDims) {
    targetAspectRatio = getConstrainedRatio(width, height)
  } else if (fallbackAspectRatio) {
    targetAspectRatio = fallbackAspectRatio
  }

  // Fallback: Detect dimensions if metadata missing
  useEffect(() => {
    if (haveDims || (!isVisible && !priority) || fallbackAspectRatio) return

    if (typeof window !== 'undefined') {
      const imgElement = new window.Image()
      imgElement.onload = () => {
        if (imgElement.height > 0) {
          setFallbackAspectRatio(getConstrainedRatio(imgElement.width, imgElement.height))
        }
      }
      // On error, default to 1 (already set implicitly by not updating state)
      imgElement.src = imageUrl || "/placeholder.svg"
    }
  }, [imageUrl, isVisible, priority, haveDims, fallbackAspectRatio])

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
    >
      <NavigationLink href={`/${basePath}/${slug}`} className="block">
        <div className="relative overflow-hidden bg-white">
          
          {/* 
             Using ImageContainer:
             1. We pass 'targetAspectRatio' to enforce the Gallery look (4:5 or 5:4).
             2. We pass 'restrictPortraitWidth={false}' to ensure the card fills the grid column on desktop.
             3. We pass 'noInsetPadding={false}' to keep the gallery white framelines/mat.
          */}
          <ImageContainer 
            src={imageUrl}
            alt={title}
            aspectRatio={targetAspectRatio}
            priority={priority || index < 6}
            quality={70}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 500px"
            noInsetPadding={false}
            restrictPortraitWidth={false}
            imgClassName="transition-all duration-500 ease-out group-hover:brightness-95"
          />
          
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

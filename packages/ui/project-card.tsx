"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { LockIcon } from "lucide-react"
import { useIsMobile } from "@portfolio/lib/hooks/use-mobile"
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

interface ProjectCardProps extends VariantProps<typeof cardVariants> {
  title: string
  category: string
  subcategory?: string
  slug: string
  imageUrl: string
  pinned?: number
  locked?: boolean
  tooltip?: string
  priority?: boolean
  index?: number
}

export default function ProjectCard({
  title,
  category,
  subcategory,
  slug,
  imageUrl,
  pinned,
  locked,
  tooltip: tooltipText,
  priority = false,
  index = 0,
  hoverEffect = "inward"
}: ProjectCardProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const isMobile = useIsMobile();
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0 });

  // Tooltip handlers for locked cards
  const handleMouseEnter = (e: React.MouseEvent) => {
    if (!isMobile && tooltipText) {
      setTooltip({ visible: true, x: e.clientX, y: e.clientY });
    }
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMobile && tooltipText && tooltip.visible) {
      setTooltip({ ...tooltip, x: e.clientX, y: e.clientY });
    }
  };
  const handleMouseLeave = () => {
    if (!isMobile && tooltipText) {
      setTooltip({ visible: false, x: 0, y: 0 });
    }
  };

  const hoverAnimation = hoverEffect === "gentle" 
    ? { 
        scale: 1.02,
        transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as any }
      }
    : { 
        scale: 0.98,
        transition: { duration: 0.2, ease: [0.4, 0, 0.6, 1] as any }
      }

  const CardContent = (
    <>
      <motion.div 
        className={`relative overflow-hidden bg-muted ${!locked && hoverEffect === "gentle" ? "hover:shadow-xl" : ""}`}
        whileHover={!locked ? hoverAnimation : {}}
      >
        <ImageContainer
          src={imageUrl}
          alt={title}
          priority={priority || (index ?? 0) < 3}
          quality={70}
          aspectRatio={1.5} // Enforce 3:2 for cards
          noInsetPadding={true} // No frameline for projects
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 448px"
        />

        {locked && (
          <div className="absolute top-3 right-3 flex gap-2 z-10">
            <div className="bg-secondary text-white p-1.5 rounded-full shadow-md">
              <LockIcon className="h-4 w-4" />
            </div>
          </div>
        )}
      </motion.div>

      {/* Content area with fixed height and padding */}
      <div className="pt-3">
        <h3 className="font-heading text-lg font-medium line-clamp-1 text-primary">{title}</h3>
          <p className="font-body text-secondary text-sm mt-0.5 mb-4">
          {category}
          {subcategory && ` • ${subcategory}`}
          </p>
      </div>
    </>
  );

  return (
    <div
      ref={containerRef}
      className="group relative flex flex-col"
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {locked ? (
        <div className="block cursor-not-allowed">{CardContent}</div>
      ) : (
        <NavigationLink href={`/projects/${slug}`} className="block">
          {CardContent}
        </NavigationLink>
      )}
      {/* Tooltip for locked projects */}
      {tooltipText && tooltip.visible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="fixed bg-[hsl(var(--accent))] text-black text-sm px-3 py-1 rounded shadow-lg font-heading z-50"
          style={{ top: tooltip.y - 40, left: tooltip.x, pointerEvents: 'none', transform: 'translateX(-50%)' }}
        >
          {tooltipText}
        </motion.div>
      )}
    </div>
  )
}
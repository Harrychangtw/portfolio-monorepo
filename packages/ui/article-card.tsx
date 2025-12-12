"use client"

import { motion } from "framer-motion"
import NavigationLink from "@portfolio/ui/navigation-link"
import { ImageContainer } from "@portfolio/ui/image-container"

interface ArticleCardProps {
  title: string
  date: string
  slug: string
  imageUrl: string
  tags?: string[]
  priority?: boolean
  index?: number
  className?: string
}

export default function ArticleCard({
  title,
  date,
  slug,
  imageUrl,
  tags = [],
  priority = false,
  index = 0,
  className,
}: ArticleCardProps) {
  // Format date as DD.MM to match the reference style
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    const day = d.getDate().toString().padStart(2, '0')
    const month = (d.getMonth() + 1).toString().padStart(2, '0')
    return `${day}.${month}`
  }

  // Use top 3 tags, fallback to "Blog" if empty
  const displayTags = tags && tags.length > 0 ? tags.slice(0, 3) : ["Blog"]

  return (
    <div className={`group relative flex flex-col h-full ${className || ""}`}>
      <NavigationLink href={`/blog/${slug}`} className="block flex flex-col h-full">
        
        {/* Text Content Section */}
        <div className="flex flex-col justify-between flex-grow">
          {/* Title - refined size, more elegant */}
          <h3 className="font-heading text-base md:text-lg font-medium uppercase leading-snug tracking-wide text-primary line-clamp-3">
            {title}
          </h3>

          {/* Spacer to push metadata to bottom */}
          <div className="flex-grow min-h-[4rem] md:min-h-[6rem]" />

          {/* Metadata Row: Tags (Left) and Date (Right) */}
          <div className="flex items-end justify-between pb-4">
            
            {/* Left: Stacked tags */}
            <div className="flex flex-col items-start">
              {displayTags.map((tag) => (
                <span 
                  key={tag} 
                  className="font-body text-[11px] font-medium uppercase tracking-wider text-secondary"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Right: Large Date (DD.MM) */}
            <span className="font-heading text-3xl md:text-5xl font-[200] leading-none text-secondary">
              {formatDate(date)}
            </span>
          </div>
        </div>

        {/* Image Section - Bottom */}
        <motion.div
          className="relative overflow-hidden bg-muted"
          whileHover={{ 
            scale: 0.98,
            transition: { duration: 0.2, ease: [0.4, 0, 0.6, 1] }
          }}
        >
          <ImageContainer
            src={imageUrl}
            alt={title}
            priority={priority || (index ?? 0) < 3}
            quality={70}
            aspectRatio={1.5}
            noInsetPadding={true}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 448px"
          />
        </motion.div>
        
      </NavigationLink>
    </div>
  )
}

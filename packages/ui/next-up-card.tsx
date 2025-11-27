"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { useLanguage } from "@portfolio/lib/contexts/LanguageContext"
import { GalleryImageContainer } from "@portfolio/ui/gallery-image-container"

interface NextUpCardProps {
  title: string
  category: string
  slug: string
  imageUrl: string
  basePath: "projects" | "gallery"
}

export default function NextUpCard({ title, category, slug, imageUrl, basePath }: NextUpCardProps) {
  const { t } = useLanguage()
  
  // Ensure we pass the full resolution URL to GalleryImageContainer
  // It expects the full path and handles creating the -thumb path internally for the blur effect
  const fullImageUrl = imageUrl?.replace('-thumb.webp', '.webp')

  return (
    <div className="w-full mt-4 md:mt-6 pt-4">
      <Link href={`/${basePath}/${slug}`} className="block group">
        <motion.div 
          className="relative overflow-hidden border border-border bg-muted/30 hover:bg-muted/60 transition-colors p-1"
          whileHover={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between p-4 md:p-6 gap-6">
            {/* Left Content */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <span className="text-xs font-heading uppercase tracking-wider">{t('common.nextUp') || "Next Up"}</span>
              </div>
              
              

<h3 className="font-heading text-lg md:text-xl font-bold text-primary truncate pr-4">
                {title}
              </h3>
              <p className="font-body text-sm text-secondary truncate mt-1">
                {category}
              </p>
            </div>

            {/* Right Image Container - Width fixed, height adapts to aspect ratio */}
            <div className="relative shrink-0 w-24 md:w-36">
              {fullImageUrl ? (
                <GalleryImageContainer
                  src={fullImageUrl}
                  alt={title}
                  quality={60}
                  priority={false}
                  noInsetPadding={true}
                  aspectRatio={basePath === "projects" ? 1.5 : undefined}
                />
              ) : (
                <div className="w-full aspect-[3/2] bg-card" />
              )}
            </div>
          </div>
        </motion.div>
      </Link>
    </div>
  )
}

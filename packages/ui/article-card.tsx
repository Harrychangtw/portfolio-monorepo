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
    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr)
        const day = d.getDate().toString().padStart(2, "0")
        const month = (d.getMonth() + 1).toString().padStart(2, "0")
        return `${month}.${day}`
    }

    const displayTags = tags && tags.length > 0 ? tags : ["Blog"]

    return (
        <div className={`group relative flex flex-col h-full pb-12 ${className || ""}`}>
            <div className="h-px bg-muted mb-2" />
            <NavigationLink href={`/blog/${slug}`} className="block flex flex-col h-full">
                {/* Accent line at top anchors the card */}
                <div className="w-full" />

                {/* Content Grid: Left (Title/Tags) vs Right (Date) */}
                <div className="flex-grow grid grid-cols-[1fr_auto] gap-6 mb-2">
                    {/* Left Column: Title & Tags */}
                    <div className="flex flex-col justify-between min-w-0">
                        {/* Title */}
                        <h3 className="font-heading text-base md:text-lg font-medium leading-snug tracking-wide text-primary line-clamp-4 mb-6">
                            {title}
                        </h3>

                        {/* Tags Container 
                            - w-full: Takes full width of the left column
                            - h-7: Fixed height for exactly one row of tags
                            - overflow-hidden: Hides wrapped tags
                            - flex-wrap: Forces overflow tags to next line (invisible)
                        */}
                        <div className="flex flex-wrap items-center gap-2 w-full h-7 overflow-hidden content-start">
                            {displayTags.map((tag) => (
                                <span
                                    key={tag}
                                    className="font-body text-sm text-secondary bg-muted px-2 py-1 rounded whitespace-nowrap flex-shrink-0"
                                    title={tag}
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Date 
                        - Aligned to bottom to sit on the same baseline as tags
                    */}
                    <div className="flex flex-col justify-end">
                        <span
                            className="font-heading text-lg md:text-3xl font-light text-secondary whitespace-nowrap leading-none"
                            aria-label={`Published ${date}`}
                        >
                            {formatDate(date)}
                        </span>
                    </div>
                </div>

                {/* Image Section - Bottom */}
                <motion.div
                    className="relative overflow-hidden bg-muted mt-auto"
                    whileHover={{
                        scale: 0.98,
                        transition: { duration: 0.2, ease: [0.4, 0, 0.6, 1] },
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

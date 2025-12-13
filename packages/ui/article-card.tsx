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
        return `${day}.${month}`
    }

    // We allow more tags in the DOM so the CSS can handle the cutoff logic dynamically
    const displayTags = tags && tags.length > 0 ? tags : ["Blog"]

    return (
        <div className={`group relative flex flex-col h-full ${className || ""}`}>
            <NavigationLink href={`/blog/${slug}`} className="block flex flex-col h-full">
                {/* Top Divider */}
                <div className="w-full border-t border-secondary/30 mb-3" />

                {/* Text Content Section */}
                <div className="flex flex-col justify-between flex-grow">
                    {/* Title */}
                    <h3 className="font-heading text-base md:text-lg font-medium leading-snug tracking-wide text-primary line-clamp-3">
                        {title}
                    </h3>

                    {/* Spacer to push metadata to bottom */}
                    <div className="flex-grow min-h-[3.5rem] md:min-h-[5rem]" />

                    {/* Metadata Row */}
                    <div className="flex items-end justify-between gap-6 pb-4">
                        {/* 
                           Left: Tag blocks 
                           - max-w-[50%]: Ensures tags never take more than half width.
                           - h-7: Fixed height matching exactly one tag row (text-sm + py-1).
                           - overflow-hidden: Hides any tags that wrap to the next line.
                           - flex-wrap: Forces tags that don't fit to drop to the next line (and disappear).
                        */}
                        <div className="flex flex-wrap items-center gap-2 max-w-[50%] h-7 overflow-hidden content-start">
                            {displayTags.map((tag) => (
                                <span
                                    key={tag}
                                    className={[
                                        "font-body text-sm text-secondary bg-muted px-2 py-1 rounded",
                                        "whitespace-nowrap flex-shrink-0" // Prevents text wrap inside tag & prevents tag compression
                                    ].join(" ")}
                                    title={tag}
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>

                        {/* Right: Minimal date */}
                        <span
                            className="font-heading text-lg md:text-3xl font-light text-secondary whitespace-nowrap"
                            aria-label={`Published ${date}`}
                        >
                            {formatDate(date)}
                        </span>
                    </div>
                </div>

                {/* Image Section - Bottom */}
                <motion.div
                    className="relative overflow-hidden bg-muted"
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
"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@portfolio/lib/contexts/language-context";
import { ImageContainer } from "@portfolio/ui/image-container";
import NavigationLink from "@portfolio/ui/navigation-link";

interface NextUpCardProps {
  title: string;
  category: string;
  slug: string;
  imageUrl: string;
  basePath: "projects" | "gallery" | "blog";
  aspectRatio?: number;
  /** Optional direct href — overrides the default /{basePath}/{slug} link. */
  href?: string;
}

export default function NextUpCard({
  title,
  category,
  slug,
  imageUrl,
  basePath,
  aspectRatio,
  href,
}: NextUpCardProps) {
  const { t } = useLanguage();

  // Ensure we pass the full resolution URL to ImageContainer
  // It expects the full path and handles creating the -thumb path internally for the blur effect
  const fullImageUrl = imageUrl?.replace("-thumb.webp", ".webp");

  return (
    <div className="w-full">
      <NavigationLink href={href ?? `/${basePath}/${slug}`} className="block group">
        <motion.div
          className="relative overflow-hidden bg-card hover:bg-muted/60 transition-colors"
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between p-4 md:p-6 gap-6">
            {/* Left Content */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <span className="text-xs font-heading uppercase tracking-wider">
                  {t("common.nextUp") || "Next Up"}
                </span>
              </div>

              <h3 className="font-heading text-lg md:text-xl font-bold text-primary truncate pr-4">
                {title}
              </h3>
              <p className="font-body text-sm text-secondary truncate mt-1 min-h-[1.25em]">
                {category || "\u00A0"}
              </p>
            </div>

            {/* Right Image Container - Width fixed, height adapts to aspect ratio */}
            <div className="relative shrink-0 w-24 md:w-36">
              {fullImageUrl ? (
                <ImageContainer
                  src={fullImageUrl}
                  alt={title}
                  quality={60}
                  priority={false}
                  noInsetPadding={true}
                  aspectRatio={aspectRatio}
                />
              ) : (
                <div className="w-full aspect-[3/2] bg-card" />
              )}
            </div>
          </div>
        </motion.div>
      </NavigationLink>
    </div>
  );
}

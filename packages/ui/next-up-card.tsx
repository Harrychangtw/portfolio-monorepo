"use client";

import { motion } from "motion/react";
import { useLanguage } from "@portfolio/lib/contexts/language-context";
import { ImageContainer } from "@portfolio/ui/image-container";
import NavigationLink from "@portfolio/ui/navigation-link";
import { track, events } from "@portfolio/lib/analytics";

interface NextUpCardProps {
  title: string;
  category: string;
  slug: string;
  imageUrl: string;
  basePath: "projects" | "gallery" | "blog";
  aspectRatio?: number;
  /** Optional direct href — overrides the default /{basePath}/{slug} link. */
  href?: string;
  /**
   * Label shown above the title.
   * - `undefined` (default): shows the translated "Next Up" string.
   * - `null`: hides the label row entirely.
   * - `string`: shows a custom literal label.
   */
  label?: string | null;
  /** Tag pills rendered below the category line. */
  tags?: string[];
  /** Render a plain div instead of NavigationLink (e.g. for non-navigable nodes). */
  disableLink?: boolean;
  /** Skip the image optimization pipeline (for OG images / non-optimized assets). */
  rawImage?: boolean;
}

export default function NextUpCard({
  title,
  category,
  slug,
  imageUrl,
  basePath,
  aspectRatio,
  href,
  label,
  tags,
  disableLink = false,
  rawImage = false,
}: NextUpCardProps) {
  const { t } = useLanguage();

  // Ensure we pass the full resolution URL to ImageContainer
  const fullImageUrl = imageUrl?.replace("-thumb.webp", ".webp");

  // undefined → translated "Next Up" | null → hidden | string → literal
  const resolvedLabel =
    label === undefined ? t("common.nextUp") || "Next Up" : label;

  const inner = (
    <motion.div
      className="relative overflow-hidden bg-card hover:bg-muted/60 transition-colors"
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between p-4 md:p-6 gap-6">
        {/* Left Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          {resolvedLabel && (
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <span className="text-xs font-heading uppercase tracking-wider">
                {resolvedLabel}
              </span>
            </div>
          )}

          <h3 className="font-heading text-lg md:text-xl font-bold text-primary truncate pr-4">
            {title}
          </h3>
        </div>

        {/* Right Image — omitted entirely when imageUrl is empty */}
        {fullImageUrl && (
          <div className="relative shrink-0 w-24 md:w-36">
            <ImageContainer
              src={fullImageUrl}
              alt={title}
              quality={50}
              noInsetPadding
              aspectRatio={1.5}
              rawImage={rawImage}
              sizes="(min-width: 768px) 144px, 96px"
            />
          </div>
        )}
      </div>
    </motion.div>
  );

  if (disableLink) {
    return <div className="w-full">{inner}</div>;
  }

  const resolvedHref = href || `/${basePath}/${slug}`;

  return (
    <div className="w-full">
      <NavigationLink
        href={resolvedHref}
        className="block group"
        onClick={() =>
          track(events.NEXT_UP_CARD_CLICKED, {
            slug,
            base_path: basePath,
            title,
            href: resolvedHref,
          })
        }
      >
        {inner}
      </NavigationLink>
    </div>
  );
}

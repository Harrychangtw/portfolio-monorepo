"use client";

import { useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ImageContainer } from "@portfolio/ui/image-container";
import NavigationLink from "@portfolio/ui/navigation-link";
import type { GraphNode, SourceType, NodeType } from "./types";

const sourceLabels: Record<SourceType, string> = {
  post: "Blog Post",
  project: "Project",
  gallery: "Gallery",
  locale: "Info",
};

const nodeTypeLabels: Record<NodeType, string> = {
  hub: "Hub",
  file: "File",
  section: "Section",
  image: "Image",
  video: "Video",
  tag: "Tag",
};

const sourceColors: Record<SourceType, string> = {
  post: "bg-[hsl(var(--graph-node-post))]",
  project: "bg-[hsl(var(--graph-node-project))]",
  gallery: "bg-[hsl(var(--graph-node-gallery))]",
  locale: "bg-[hsl(var(--graph-node-locale))]",
};

function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/,
  );
  return match ? match[1] : null;
}

/** Check if a URL is internal (same host as www.harrychang.me) */
function isInternalUrl(url: string): boolean {
  try {
    const parsed = new URL(url, "https://www.harrychang.me");
    const host = parsed.hostname.replace(/^www\./, "");
    return host === "harrychang.me";
  } catch {
    return true;
  }
}

/** Extract internal path from absolute harrychang.me URLs or relative paths */
function toInternalPath(url: string): string {
  try {
    const parsed = new URL(url, "https://www.harrychang.me");
    const host = parsed.hostname.replace(/^www\./, "");
    if (host === "harrychang.me") {
      return parsed.pathname + parsed.search + parsed.hash;
    }
  } catch {
    // fall through
  }
  return url.startsWith("/") ? url : `/${url}`;
}

interface MobileNodeCardProps {
  node: GraphNode | null;
  onSwipe: (direction: "left" | "right") => void;
}

export default function MobileNodeCard({
  node,
  onSwipe,
}: MobileNodeCardProps) {
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);
  const isSwiping = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
    isSwiping.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
    if (Math.abs(touchDeltaX.current) > 20) {
      isSwiping.current = true;
    }
  };

  const handleTouchEnd = () => {
    if (isSwiping.current && Math.abs(touchDeltaX.current) > 60) {
      onSwipe(touchDeltaX.current > 0 ? "right" : "left");
    }
    isSwiping.current = false;
  };

  const normalizePath = (p: string) =>
    p.startsWith("http") ? p : p.startsWith("/") ? p : `/${p}`;

  const isTag = node?.nodeType === "tag";
  const isHub = node?.nodeType === "hub";
  const isImage = node?.nodeType === "image";
  const isVideo = node?.nodeType === "video";
  const youtubeId =
    isVideo && node?.mediaSource ? getYouTubeId(node.mediaSource) : null;

  const imageSrc =
    isImage && node?.mediaSource
      ? normalizePath(node.mediaSource)
      : isVideo && youtubeId
        ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
        : node?.imageUrl
          ? normalizePath(node.imageUrl)
          : null;

  const hasImage = !!imageSrc && !isTag && !isHub;

  return (
    <AnimatePresence>
      {node && (
        <motion.div
          key={node.id}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)]"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="mx-3 mb-3 bg-card border border-border shadow-xl overflow-hidden rounded-lg">
            <div className="flex items-stretch">
              {/* Image thumbnail (left side) */}
              {hasImage && (
                <div className="w-24 flex-shrink-0">
                  <ImageContainer
                    src={imageSrc}
                    alt={node.title}
                    noInsetPadding={false}
                    quality={60}
                    sizes="96px"
                    imgClassName="object-cover"
                  />
                </div>
              )}

              {/* Content (right side) */}
              <div className="flex-1 p-3 min-w-0">
                {/* Badges */}
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  {!isTag && (
                    <span
                      className={`font-body text-xs px-2 py-0.5 rounded whitespace-nowrap text-background ${sourceColors[node.sourceType]}`}
                    >
                      {sourceLabels[node.sourceType]}
                    </span>
                  )}
                  <span className="font-body text-xs px-2 py-0.5 rounded whitespace-nowrap bg-muted text-secondary">
                    {nodeTypeLabels[node.nodeType]}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-heading text-sm font-semibold text-primary leading-tight line-clamp-1 mb-1">
                  {node.nodeType === "section" && node.heading
                    ? node.heading
                    : node.title}
                </h3>

                {/* Description */}
                {(node.description || node.snippet) && (
                  <p className="text-xs text-secondary leading-relaxed line-clamp-1">
                    {node.description || node.snippet}
                  </p>
                )}
              </div>

              {/* Navigate link */}
              {node.url && !isTag && (
                isInternalUrl(node.url) ? (
                  <NavigationLink
                    href={toInternalPath(node.url)}
                    className="flex-shrink-0 flex items-center justify-center w-12 border-l border-border text-secondary hover:text-primary hover:bg-muted/50 transition-colors"
                    aria-label="Open"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      className="text-current"
                    >
                      <path
                        d="M6 3L11 8L6 13"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </NavigationLink>
                ) : (
                  <a
                    href={node.url}
                    className="flex-shrink-0 flex items-center justify-center w-12 border-l border-border text-secondary hover:text-primary hover:bg-muted/50 transition-colors"
                    aria-label="Open link"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      className="text-current"
                    >
                      <path
                        d="M6 3L11 8L6 13"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </a>
                )
              )}
            </div>

            {/* Swipe indicator */}
            <div className="flex justify-center pb-2 pt-1">
              <div className="w-8 h-1 rounded-full bg-muted" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

"use client";

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
}

export default function MobileNodeCard({
  node,
}: MobileNodeCardProps) {

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

  // Only show description for project / gallery / blog post file nodes
  const isRichContent =
    node?.nodeType === "file" &&
    (node.sourceType === "project" ||
      node.sourceType === "gallery" ||
      node.sourceType === "post");

  // Wrapper component that handles navigation for the entire card
  const CardWrapper = ({ children }: { children: React.ReactNode }) => {
    if (!node?.url || isTag) {
      return <div className="mx-3 mb-3 bg-card border border-border shadow-xl overflow-hidden rounded-lg">{children}</div>;
    }
    
    if (isInternalUrl(node.url)) {
      return (
        <NavigationLink
          href={toInternalPath(node.url)}
          className="mx-3 mb-3 bg-card border border-border shadow-xl overflow-hidden rounded-lg block active:scale-[0.98] transition-transform"
        >
          {children}
        </NavigationLink>
      );
    }
    
    return (
      <a
        href={node.url}
        className="mx-3 mb-3 bg-card border border-border shadow-xl overflow-hidden rounded-lg block active:scale-[0.98] transition-transform"
      >
        {children}
      </a>
    );
  };

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
        >
          <CardWrapper>
            {/* Layout: horizontal split when image exists, vertical otherwise */}
            {hasImage ? (
              <div className="flex h-28">
                {/* Left: Image (50% width) */}
                <div className="w-1/2 flex-shrink-0">
                  <ImageContainer
                    src={imageSrc}
                    alt={node.title}
                    aspectRatio={1.5}
                    noInsetPadding
                    quality={60}
                  />
                </div>

                {/* Right: Title top, tags bottom */}
                <div className="w-1/2 flex">
                  <div className="flex-1 p-3 min-w-0 flex flex-col">
                    {/* Title — top */}
                    <h3 className="font-heading text-sm font-semibold text-primary leading-tight line-clamp-2 flex-1">
                      {node.nodeType === "section" && node.heading
                        ? node.heading
                        : node.title}
                    </h3>

                    {/* Source badge + tags — bottom */}
                    <div className="mt-auto flex items-center gap-1.5 flex-wrap">
                      {!isTag && (
                        <span
                          className={`font-body text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap text-background ${sourceColors[node.sourceType]}`}
                        >
                          {sourceLabels[node.sourceType]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* No image: compact vertical layout */
              <div className="flex items-stretch">
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
                    {!isRichContent && node.tags && node.tags.length > 0 && (
                      <span className="font-mono text-[10px] text-secondary/70 truncate">
                        {node.tags.slice(0, 3).join(" · ")}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-heading text-sm font-semibold text-primary leading-tight line-clamp-1 mb-1">
                    {node.nodeType === "section" && node.heading
                      ? node.heading
                      : node.title}
                  </h3>

                  {/* Description */}
                  {isRichContent && (node.description || node.snippet) && (
                    <p className="text-xs text-secondary leading-relaxed line-clamp-2">
                      {node.description || node.snippet}
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardWrapper>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

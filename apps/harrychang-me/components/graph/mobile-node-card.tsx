"use client";

import { motion, AnimatePresence } from "motion/react";
import { ImageContainer } from "@portfolio/ui/image-container";
import NavigationLink from "@portfolio/ui/navigation-link";
import type { GraphNode, SourceType, NodeType } from "./types";

const sourceLabels: Record<SourceType, string> = {
  post: "Blog",
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

const nodeTypeColors: Record<NodeType, string> = {
  hub: "bg-muted text-primary",
  file: "bg-muted text-secondary",
  section: "bg-muted text-secondary",
  image: "bg-muted text-secondary",
  video: "bg-muted text-secondary",
  tag: "bg-[hsl(var(--graph-node-tag))]/20 text-[hsl(var(--graph-node-tag))]",
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

  const cardContent = node ? (
    <>
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

              {/* Source badge + node type — bottom */}
              <div className="mt-auto flex items-center gap-1 flex-wrap">
                {!isTag && !isHub && (
                  <span
                    className={`font-body text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap text-background ${sourceColors[node.sourceType]}`}
                  >
                    {sourceLabels[node.sourceType]}
                  </span>
                )}
                <span
                  className={`font-body text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap ${nodeTypeColors[node.nodeType]}`}
                >
                  {nodeTypeLabels[node.nodeType]}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* No image: compact vertical layout */
        <div className="flex items-stretch">
          <div className="flex-1 p-3 min-w-0">
            {/* Badges */}
            <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
              {!isTag && !isHub && (
                <span
                  className={`font-body text-[11px] px-1.5 py-0.5 rounded whitespace-nowrap text-background ${sourceColors[node.sourceType]}`}
                >
                  {sourceLabels[node.sourceType]}
                </span>
              )}
              <span
                className={`font-body text-[11px] px-1.5 py-0.5 rounded whitespace-nowrap ${nodeTypeColors[node.nodeType]}`}
                >
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
            {isRichContent && (node.description || node.snippet) && (
              <p className="text-xs text-secondary leading-relaxed line-clamp-2">
                {node.description || node.snippet}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  ) : null;

  const wrapperClassName = "mx-3 mb-3 bg-card border border-border shadow-xl overflow-hidden rounded-lg";
  const clickableClassName = `${wrapperClassName} block active:scale-[0.98] transition-transform`;

  const wrappedContent = !node ? null : (!node.url || isTag) ? (
    <div className={wrapperClassName}>{cardContent}</div>
  ) : isInternalUrl(node.url) ? (
    <NavigationLink href={toInternalPath(node.url)} className={clickableClassName}>
      {cardContent}
    </NavigationLink>
  ) : (
    <a href={node.url} className={clickableClassName}>
      {cardContent}
    </a>
  );

  return (
    <AnimatePresence mode="wait">
      {node && (
        <motion.div
          key={node.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)]"
        >
          {wrappedContent}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

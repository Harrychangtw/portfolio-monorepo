"use client";

import { motion } from "motion/react";
import { ImageContainer } from "@portfolio/ui/image-container";
import type { GraphNode, SourceType, NodeType } from "./types";

const sourceLabels: Record<SourceType, string> = {
  post: "Blog Post",
  project: "Project",
  gallery: "Gallery",
  locale: "Info",
};

const nodeTypeLabels: Record<NodeType, string> = {
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

interface NodePreviewCardProps {
  node: GraphNode;
  cursorPosition: { x: number; y: number };
}

export default function NodePreviewCard({
  node,
  cursorPosition,
}: NodePreviewCardProps) {
  const isTag = node.nodeType === "tag";
  const isImage = node.nodeType === "image";
  const isVideo = node.nodeType === "video";
  const youtubeId =
    isVideo && node.mediaSource ? getYouTubeId(node.mediaSource) : null;

  // Determine image source for the 3:2 preview
  const imageSrc = isImage && node.mediaSource
    ? node.mediaSource.startsWith("http")
      ? node.mediaSource
      : `/${node.mediaSource}`
    : isVideo && youtubeId
      ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
      : node.imageUrl
        ? node.imageUrl.startsWith("http")
          ? node.imageUrl
          : `/${node.imageUrl}`
        : null;

  const hasImage = !!imageSrc && !isTag;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="fixed z-50 pointer-events-none"
      style={{
        top: cursorPosition.y,
        left: cursorPosition.x,
        transform: "translate(16px, calc(-100% - 12px))",
      }}
    >
      <div className="w-[280px] bg-card border border-border shadow-xl overflow-hidden">
        {/* 3:2 image using ImageContainer */}
        {hasImage && (
          <ImageContainer
            src={imageSrc}
            alt={node.title}
            aspectRatio={1.5}
            noInsetPadding
            quality={60}
            sizes="280px"
            imgClassName="object-cover"
          />
        )}

        <div className="p-3 space-y-2">
          {/* Header badges */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {!isTag && (
              <span
                className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-background ${sourceColors[node.sourceType]}`}
              >
                {sourceLabels[node.sourceType]}
              </span>
            )}
            <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-muted text-muted-foreground">
              {nodeTypeLabels[node.nodeType]}
            </span>
            {!isTag && (
              <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-muted text-muted-foreground">
                {node.locale === "zh-TW" ? "ZH" : "EN"}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-heading text-sm font-semibold text-primary leading-tight line-clamp-2">
            {node.nodeType === "section" && node.heading
              ? node.heading
              : node.title}
          </h3>

          {/* Description / Snippet */}
          {(node.description || node.snippet) && (
            <p className="text-xs text-secondary leading-relaxed line-clamp-2">
              {node.description || node.snippet}
            </p>
          )}

          {/* Tags */}
          {node.tags && node.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {node.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-[10px] px-1 py-0.5 bg-muted text-muted-foreground uppercase tracking-wider"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

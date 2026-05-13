"use client";

import { motion } from "motion/react";
import { ImageContainer } from "@portfolio/ui/image-container";
import type { GraphNode, SourceType, NodeType } from "./types";
import { resolveHubImageUrl } from "./graph-utils";

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

  // Normalize a relative path to ensure it starts with exactly one "/"
  const normalizePath = (p: string) =>
    p.startsWith("http") ? p : p.startsWith("/") ? p : `/${p}`;

  // Determine image source for the 3:2 preview
  const resolvedImageUrl = resolveHubImageUrl(node);
  const imageSrc =
    isImage && node.mediaSource
      ? normalizePath(node.mediaSource)
      : isVideo && youtubeId
        ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
        : resolvedImageUrl
          ? normalizePath(resolvedImageUrl)
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
        {/* Image-only preview for image/video nodes — no caption */}
        {(isImage || isVideo) && hasImage ? (
          <ImageContainer
            src={imageSrc}
            alt={node.title}
            aspectRatio={1.5}
            noInsetPadding={false}
            quality={60}
            sizes="280px"
          />
        ) : (
          <>
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
                rawImage={node.nodeType === "hub"}
              />
            )}

            <div className="p-3 space-y-2">
              {/* Header badges — blog-card tag capsule style */}
              <div className="flex items-center gap-2 flex-wrap">
                {!isTag && (
                  <span
                    className={`font-body text-sm px-2 py-1 rounded whitespace-nowrap text-background ${sourceColors[node.sourceType]}`}
                  >
                    {sourceLabels[node.sourceType]}
                  </span>
                )}
                <span className="font-body text-sm px-2 py-1 rounded whitespace-nowrap bg-muted text-secondary">
                  {nodeTypeLabels[node.nodeType]}
                </span>
                {!isTag && (
                  <span className="font-body text-sm px-2 py-1 rounded whitespace-nowrap bg-muted text-secondary">
                    {node.locale === "zh-TW" ? "ZH" : "EN"}
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="font-heading text-lg md:text-xl font-semibold text-primary leading-tight line-clamp-4 mb-1">
                {node.nodeType === "section" && node.heading
                  ? node.heading
                  : node.title}
              </h3>

              {/* TL;DR */}
              {node.tldr && (
                <p className="mt-auto text-sm text-secondary leading-relaxed line-clamp-2">
                  {node.tldr}
                </p>
              )}

              {/* Description / Snippet */}
              {!node.tldr && (node.description || node.snippet) && (
                <p className="text-xs text-secondary leading-relaxed line-clamp-2">
                  {node.description || node.snippet}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

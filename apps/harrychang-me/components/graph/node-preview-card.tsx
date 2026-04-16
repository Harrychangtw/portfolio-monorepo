"use client";

import { motion } from "motion/react";
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
  onClose: () => void;
}

export default function NodePreviewCard({
  node,
  onClose,
}: NodePreviewCardProps) {
  const isTag = node.nodeType === "tag";
  const isImage = node.nodeType === "image";
  const isVideo = node.nodeType === "video";
  const youtubeId = isVideo && node.mediaSource ? getYouTubeId(node.mediaSource) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20
        w-[340px] max-w-[90vw]
        bg-card border border-border shadow-xl
        overflow-hidden"
    >
      {/* Image thumbnail */}
      {isImage && node.mediaSource && (
        <div className="w-full h-32 bg-muted overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={node.mediaSource.startsWith("http") ? node.mediaSource : `/${node.mediaSource}`}
            alt={node.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* Video thumbnail */}
      {isVideo && youtubeId && (
        <div className="w-full h-32 bg-muted overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
            alt={node.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      <div className="p-4 space-y-3">
        {/* Header badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {!isTag && (
            <span
              className={`inline-flex items-center px-2 py-0.5 text-xs font-mono uppercase tracking-wider text-background ${sourceColors[node.sourceType]}`}
            >
              {sourceLabels[node.sourceType]}
            </span>
          )}
          <span className="inline-flex items-center px-2 py-0.5 text-xs font-mono uppercase tracking-wider bg-muted text-muted-foreground">
            {nodeTypeLabels[node.nodeType]}
          </span>
          {!isTag && (
            <span className="inline-flex items-center px-2 py-0.5 text-xs font-mono uppercase tracking-wider bg-muted text-muted-foreground">
              {node.locale === "zh-TW" ? "ZH" : "EN"}
            </span>
          )}
          {node.date && (
            <span className="font-mono text-xs text-secondary/50">
              {node.date}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-heading text-base font-semibold text-primary leading-tight">
          {node.title}
        </h3>

        {/* Description / Snippet */}
        {(node.description || node.snippet) && (
          <p className="text-sm text-secondary leading-relaxed line-clamp-3">
            {node.description || node.snippet}
          </p>
        )}

        {/* Tags */}
        {node.tags && node.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {node.tags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="font-mono text-xs px-1.5 py-0.5 bg-muted text-muted-foreground uppercase tracking-wider"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-1">
          {isTag ? (
            <span className="text-sm text-muted-foreground font-mono">
              {node.snippet}
            </span>
          ) : isVideo && node.mediaSource ? (
            <a
              href={node.mediaSource}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-heading text-accent hover:underline transition-colors"
            >
              Watch video &rarr;
            </a>
          ) : node.url ? (
            <a
              href={node.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-heading text-accent hover:underline transition-colors"
            >
              View source &rarr;
            </a>
          ) : (
            <span />
          )}
          <button
            onClick={onClose}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </motion.div>
  );
}

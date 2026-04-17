"use client";

import { motion, AnimatePresence } from "motion/react";
import { ImageContainer } from "@portfolio/ui/image-container";
import NavigationLink from "@portfolio/ui/navigation-link";
import NextUpCard from "@portfolio/ui/next-up-card";
import type { GraphNode, SourceType } from "./types";

// ── Helpers ──────────────────────────────────────────────────────────────────

function sourceTypeToBasePath(
  sourceType: SourceType,
): "blog" | "projects" | "gallery" {
  if (sourceType === "post") return "blog";
  if (sourceType === "project") return "projects";
  return "gallery";
}

function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/,
  );
  return match ? match[1] : null;
}

/** Derive a human-readable name from a URL (strip extension). */
function getFilenameFromUrl(url: string): string {
  return (
    url
      .split("/")
      .pop()
      ?.replace(/\.[^.]+$/, "") || url
  );
}

/** Format a hub node's URL into a readable route string. */
function formatHubRoute(node: GraphNode): string {
  // Strip protocol + www.
  let route = node.url.replace(/^https?:\/\/(?:www\.)?/, "");
  // Remove trailing slash from non-root paths
  if (route.endsWith("/") && route !== "harrychang.me/") {
    route = route.slice(0, -1);
  }
  // Locale hub slugs that live as hash anchors on the homepage
  const hashMap: Record<string, string> = {
    about: "#about",
    updates: "#updates",
  };
  if (node.sourceSlug in hashMap) {
    return `harrychang.me/${hashMap[node.sourceSlug]}`;
  }
  return route;
}

/** Ensure image paths are root-relative or absolute — never bare relative. */
function normalizeImageUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("/")) return url;
  return `/${url}`;
}

function isInternalUrl(url: string): boolean {
  try {
    const parsed = new URL(url, "https://www.harrychang.me");
    return parsed.hostname.replace(/^www\./, "") === "harrychang.me";
  } catch {
    return true;
  }
}

function toInternalPath(url: string): string {
  try {
    const parsed = new URL(url, "https://www.harrychang.me");
    if (parsed.hostname.replace(/^www\./, "") === "harrychang.me") {
      return parsed.pathname + parsed.search + parsed.hash;
    }
  } catch {
    // fall through
  }
  return url.startsWith("/") ? url : `/${url}`;
}

// ── Component ─────────────────────────────────────────────────────────────────

interface MobileNodeCardProps {
  node: GraphNode | null;
}

export default function MobileNodeCard({ node }: MobileNodeCardProps) {
  const wrapperCls =
    "mx-3 mb-3 bg-card border border-border shadow-xl overflow-hidden";

  const isImage = node?.nodeType === "image";
  const isVideo = node?.nodeType === "video";
  const isTag = node?.nodeType === "tag";
  const isHub = node?.nodeType === "hub";

  const youtubeId =
    isVideo && node?.mediaSource ? getYouTubeId(node.mediaSource) : null;

  // Resolve the displayable media source for image / video nodes
  const mediaSrc =
    isImage && node?.mediaSource
      ? node.mediaSource.startsWith("http") || node.mediaSource.startsWith("/")
        ? node.mediaSource
        : `/${node.mediaSource}`
      : isVideo && youtubeId
        ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
        : null;

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
          {isImage || isVideo ? (
            // ── Image / Video: show media only, no caption ──────────
            (() => {
              const imgTitle =
                node.title ||
                (node.mediaSource ? getFilenameFromUrl(node.mediaSource) : "");

              const mediaContent = mediaSrc ? (
                <ImageContainer
                  src={mediaSrc}
                  alt={imgTitle}
                  aspectRatio={1.5}
                  noInsetPadding={false}
                  quality={60}
                />
              ) : null;

              return node.url && isInternalUrl(node.url) ? (
                <NavigationLink
                  href={toInternalPath(node.url)}
                  className={`${wrapperCls} block active:scale-[0.98] transition-transform`}
                >
                  {mediaContent}
                </NavigationLink>
              ) : (
                <div className={wrapperCls}>{mediaContent}</div>
              );
            })()
          ) : (
            // ── file | hub | section | tag: delegate to NextUpCard ───────────
            <div className={wrapperCls}>
              <NextUpCard
                title={
                  node.nodeType === "section" && node.heading
                    ? node.heading
                    : node.title
                }
                category={
                  node.nodeType === "hub"
                    ? formatHubRoute(node)
                    : node.tldr || node.description || node.snippet
                }
                slug={node.sourceSlug}
                imageUrl={isTag ? "" : normalizeImageUrl(node.imageUrl)}
                basePath={sourceTypeToBasePath(node.sourceType as SourceType)}
                label={null}
                href={
                  !isTag && node.url
                    ? isInternalUrl(node.url)
                      ? toInternalPath(node.url)
                      : node.url
                    : undefined
                }
                disableLink={isTag || !node.url}
              />
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

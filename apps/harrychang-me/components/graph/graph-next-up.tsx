"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useLanguage } from "@portfolio/lib/contexts/language-context";
import NextUpCard from "@portfolio/ui/next-up-card";
import NavigationLink from "@portfolio/ui/navigation-link";
import LocalGraphView from "./local-graph-dynamic";
import type { SelectedNodeInfo } from "./local-graph-view";

interface NextUpItem {
  slug: string;
  title: string;
  category: string;
  imageUrl: string;
  aspectRatio?: number;
}

type BasePath = "blog" | "projects" | "gallery";

interface GraphNextUpProps {
  currentSlug: string;
  sourceType: "post" | "project" | "gallery";
  basePath: BasePath;
  nextItem?: NextUpItem | null;
}

function sourceTypeToBasePath(st: string): BasePath {
  if (st === "post") return "blog";
  if (st === "project") return "projects";
  return "gallery";
}

/** Ensure image path is absolute (starts with /) */
function normalizeImageUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("/")) return url;
  return `/${url}`;
}

/**
 * Combined graph + NextUpCard component.
 * The graph default-selects the next item's node. Hovering a file node
 * temporarily updates the NextUpCard; leaving reverts to the selected node.
 */
export default function GraphNextUp({
  currentSlug,
  sourceType,
  basePath,
  nextItem,
}: GraphNextUpProps) {
  const { language, t } = useLanguage();

  // "base" card = the default/selected node data (starts as nextItem)
  const [baseCard, setBaseCard] = useState<NextUpItem | null>(nextItem ?? null);
  const [baseCardPath, setBaseCardPath] = useState<BasePath>(basePath);

  // "hover" card = temporary override while hovering a node
  const [hoverCard, setHoverCard] = useState<{
    data: NextUpItem;
    basePath: BasePath;
  } | null>(null);

  // Track localized next item
  const [localizedNextItem, setLocalizedNextItem] = useState<NextUpItem | null>(
    nextItem ?? null,
  );
  const isDefaultRef = useRef(true);

  useEffect(() => {
    if (!nextItem) return;

    async function fetchLocalized() {
      const baseSlug = nextItem!.slug.replace("_zh-tw", "");
      let targetSlug = baseSlug;
      if (language === "zh-TW") {
        targetSlug = `${baseSlug}_zh-tw`;
      }
      if (localizedNextItem && localizedNextItem.slug === targetSlug) return;

      const apiPath =
        basePath === "blog"
          ? "posts"
          : basePath === "gallery"
            ? "gallery"
            : "projects";

      try {
        const response = await fetch(`/api/${apiPath}/${targetSlug}`);
        if (response.ok) {
          const data = await response.json();
          const item: NextUpItem = {
            slug: data.slug,
            title: data.title,
            category:
              basePath === "blog"
                ? data.description
                : basePath === "gallery"
                  ? data.quote
                  : data.category,
            imageUrl: data.imageUrl,
            aspectRatio: data.aspectRatio || nextItem!.aspectRatio,
          };
          setLocalizedNextItem(item);
          if (isDefaultRef.current) {
            setBaseCard(item);
          }
        } else if (language === "zh-TW" && targetSlug.includes("_zh-tw")) {
          const fallback = await fetch(`/api/${apiPath}/${baseSlug}`);
          if (fallback.ok) {
            const data = await fallback.json();
            const item: NextUpItem = {
              slug: data.slug,
              title: data.title,
              category:
                basePath === "blog"
                  ? data.description
                  : basePath === "gallery"
                    ? data.quote
                    : data.category,
              imageUrl: data.imageUrl,
              aspectRatio: data.aspectRatio || nextItem!.aspectRatio,
            };
            setLocalizedNextItem(item);
            if (isDefaultRef.current) {
              setBaseCard(item);
            }
          }
        }
      } catch {
        // Keep current data on error
      }
    }

    fetchLocalized();
  }, [language, nextItem, basePath]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNodeSelect = useCallback(
    (node: SelectedNodeInfo | null) => {
      if (!node) {
        // Revert to default
        setBaseCard(localizedNextItem);
        setBaseCardPath(basePath);
        isDefaultRef.current = true;
        return;
      }
      setBaseCard({
        slug: node.slug,
        title: node.title,
        category: node.description || "",
        imageUrl: normalizeImageUrl(node.imageUrl),
      });
      setBaseCardPath(sourceTypeToBasePath(node.sourceType));
      isDefaultRef.current = false;
    },
    [localizedNextItem, basePath],
  );

  const handleNodeHover = useCallback((node: SelectedNodeInfo | null) => {
    if (!node) {
      setHoverCard(null);
      return;
    }
    setHoverCard({
      data: {
        slug: node.slug,
        title: node.title,
        category: node.description || "",
        imageUrl: normalizeImageUrl(node.imageUrl),
      },
      basePath: sourceTypeToBasePath(node.sourceType),
    });
  }, []);

  // Show hover card if hovering, otherwise show base card
  const displayCard = hoverCard?.data ?? baseCard;
  const displayBasePath = hoverCard ? hoverCard.basePath : baseCardPath;

  return (
    <div>
      {/* Graph */}
      <div className="w-full mt-8 md:mt-12 mb-0">
        <p className="font-heading uppercase text-xs tracking-wider text-secondary mb-3">
          {t("common.relatedGraph") || "Knowledge Graph"}
        </p>
        <div
          className="relative border border-border overflow-hidden"
          style={{ height: "360px" }}
        >
          <NavigationLink
            href="/graph"
            className="absolute top-2 right-2 z-10 px-2 py-1 text-[10px] font-heading uppercase tracking-wider text-secondary hover:text-primary bg-card/80 backdrop-blur-sm border border-border transition-colors"
          >
            {t("common.fullGraph") || "Full Graph"} →
          </NavigationLink>
          <LocalGraphView
            currentSlug={currentSlug}
            sourceType={sourceType}
            defaultSelectedSlug={nextItem?.slug?.replace(/_zh-tw|_zh-TW/i, "")}
            onNodeSelect={handleNodeSelect}
            onNodeHover={handleNodeHover}
          />
        </div>
      </div>

      {/* NextUpCard — driven by graph hover/selection */}
      {displayCard && (
        <NextUpCard
          title={displayCard.title}
          category={displayCard.category}
          slug={displayCard.slug}
          imageUrl={displayCard.imageUrl}
          basePath={displayBasePath}
          aspectRatio={displayCard.aspectRatio}
        />
      )}
    </div>
  );
}

"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useNavigation } from "@portfolio/lib/contexts/navigation-context";
import { useLanguage } from "@portfolio/lib/contexts/language-context";
import { useIsMobile } from "@portfolio/lib/hooks/use-mobile";
import GraphCanvas from "./graph-canvas";
import type { GraphData, GraphNode } from "./types";
import { resolveHubImageUrl } from "./graph-utils";
import { track, events } from "@portfolio/lib/analytics";

export interface EmbeddedNodeInfo {
  title: string;
  slug: string;
  sourceType: string;
  url: string;
  imageUrl?: string | null;
  description?: string;
  tldr?: string;
  /** "file" | "hub" | etc. — lets consumers distinguish hubs from content nodes */
  nodeType?: string;
}

interface EmbeddedGraphProps {
  /** Slug of the focal (next-up) file node to center & select */
  focalSlug?: string;
  focalSourceType?: "post" | "project" | "gallery";
  /** Slug of a hub node to center & select (used on non-content pages like /design) */
  focalHubSlug?: string;
  onNodeHover?: (node: EmbeddedNodeInfo | null) => void;
  /** Mobile crosshair centre-node callback */
  onCenterNodeChange?: (node: EmbeddedNodeInfo | null) => void;
}

/* ── Module-level graph-data cache (shared across embeds) ─────────────── */
let cachedGraphData: GraphData | null = null;
let fetchPromise: Promise<GraphData | null> | null = null;

async function loadGraphData(): Promise<GraphData | null> {
  if (cachedGraphData) return cachedGraphData;
  if (fetchPromise) return fetchPromise;
  fetchPromise = fetch("/graph-data.json")
    .then((r) => (r.ok ? (r.json() as Promise<GraphData>) : null))
    .then((d) => {
      cachedGraphData = d;
      if (!d) fetchPromise = null; // allow retry on failure
      return d;
    })
    .catch(() => {
      fetchPromise = null; // allow retry on failure
      return null;
    });
  return fetchPromise;
}

function toInfo(node: GraphNode): EmbeddedNodeInfo {
  return {
    title: node.title,
    slug: node.sourceSlug,
    sourceType: node.sourceType,
    url: node.url,
    imageUrl: resolveHubImageUrl(node),
    description: node.description || node.snippet,
    tldr: node.tldr,
    nodeType: node.nodeType,
  };
}

/**
 * Embedded version of the full /graph physics view.
 * Keeps only file + hub + tag nodes (drops image / video / section) so the
 * picture is about actual slugs and their category hubs.
 */
export default function EmbeddedGraph({
  focalSlug,
  focalSourceType,
  focalHubSlug,
  onNodeHover,
  onCenterNodeChange,
}: EmbeddedGraphProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const locale: "en" | "zh-TW" = language === "zh-TW" ? "zh-TW" : "en";
  const isMobile = useIsMobile();
  const [graphData, setGraphData] = useState<GraphData | null>(null);

  useEffect(() => {
    loadGraphData().then((d) => {
      if (d) setGraphData(d);
    });
  }, []);

  // Filter: same locale; keep only slug-level + hub + tag nodes.
  const filteredData: GraphData | null = useMemo(() => {
    if (!graphData) return null;
    const KEEP = new Set(["file", "hub", "tag"]);
    const nodes = graphData.nodes.filter((n) => {
      if (!KEEP.has(n.nodeType)) return false;
      // Tags are locale-neutral; files/hubs must match the active locale.
      if (n.nodeType !== "tag" && n.locale !== locale) return false;
      return true;
    });
    const ids = new Set(nodes.map((n) => n.id));
    const edges = graphData.edges.filter(
      (e) => ids.has(e.source) && ids.has(e.target),
    );
    return { ...graphData, nodes, edges };
  }, [graphData, locale]);

  // Resolve focal node id in the filtered set.
  const focalNodeId = useMemo(() => {
    if (!filteredData) return undefined;
    // Hub focal takes precedence when set (used on non-content pages)
    if (focalHubSlug) {
      return filteredData.nodes.find(
        (n) =>
          n.nodeType === "hub" &&
          n.sourceSlug === focalHubSlug &&
          n.locale === locale,
      )?.id;
    }
    if (!focalSlug || !focalSourceType) return undefined;
    return filteredData.nodes.find(
      (n) =>
        n.nodeType === "file" &&
        n.sourceSlug === focalSlug &&
        n.sourceType === focalSourceType &&
        n.locale === locale,
    )?.id;
  }, [filteredData, focalSlug, focalSourceType, focalHubSlug, locale]);

  const { startNavigation } = useNavigation();

  const handleNodeClick = useCallback(
    (node: GraphNode | null) => {
      if (!node || node.nodeType === "tag" || !node.url) return;
      track(events.GRAPH_NODE_CLICKED, {
        node_id: node.id,
        node_category: node.nodeType,
        node_source_type: node.sourceType ?? null,
        surface: "next_up_subgraph",
        source_path:
          typeof window !== "undefined" ? window.location.pathname : null,
      });
      try {
        const target = new URL(node.url, window.location.origin);
        // Defensive: this embed currently filters to file/hub/tag (no
        // anchorId-bearing nodes), but stays in lockstep with the full
        // /graph handler so any future filter change still routes correctly.
        if (node.anchorId && !target.hash) {
          target.hash = node.anchorId;
        }
        const mainHost = window.location.hostname.replace(/^www\./, "");
        const targetHost = target.hostname.replace(/^www\./, "");
        const isInternal =
          target.origin === window.location.origin ||
          targetHost === mainHost ||
          targetHost === "harrychang.me";

        startNavigation();
        setTimeout(() => {
          if (isInternal) {
            router.push(target.pathname + target.search + target.hash);
          } else {
            window.location.href = node.url;
          }
        }, 250);
      } catch {
        window.location.href = node.url;
      }
    },
    [router, startNavigation],
  );

  const handleNodeHover = useCallback(
    (node: GraphNode | null) => {
      if (!onNodeHover) return;
      if (!node || (node.nodeType !== "file" && node.nodeType !== "hub")) {
        onNodeHover(null);
        return;
      }
      onNodeHover(toInfo(node));
    },
    [onNodeHover],
  );

  const handleCenterNodeChange = useCallback(
    (node: GraphNode | null) => {
      if (!onCenterNodeChange) return;
      if (!node || (node.nodeType !== "file" && node.nodeType !== "hub")) {
        onCenterNodeChange(null);
        return;
      }
      onCenterNodeChange(toInfo(node));
    },
    [onCenterNodeChange],
  );

  if (!filteredData) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <GraphCanvas
      data={filteredData}
      onNodeClick={handleNodeClick}
      onNodeHover={handleNodeHover}
      selectedNodeId={focalNodeId ?? null}
      focalNodeId={focalNodeId}
      isMobile={isMobile}
      onCenterNodeChange={isMobile ? handleCenterNodeChange : undefined}
      embeddedMode
    />
  );
}

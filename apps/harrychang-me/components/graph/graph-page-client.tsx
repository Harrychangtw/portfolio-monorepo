"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { AnimatePresence, easeOut, motion } from "motion/react";
import { useLanguage } from "@portfolio/lib/contexts/language-context";
import { useNavigation } from "@portfolio/lib/contexts/navigation-context";
import { useIsMobile } from "@portfolio/lib/hooks/use-mobile";
import GraphCanvas from "./graph-canvas";
import NodePreviewCard from "./node-preview-card";
import MobileNodeCard from "./mobile-node-card";
import type { GraphData, GraphNode, SourceType, NodeType } from "./types";

const LanguageSwitcher = dynamic(
  () => import("@portfolio/ui/language-switcher"),
  { ssr: false },
);

const ThemeSwitcher = dynamic(() => import("@portfolio/ui/theme-switcher"), {
  ssr: false,
});

const SOURCE_TYPES: SourceType[] = ["post", "project", "gallery", "locale"];
const NODE_TYPES: NodeType[] = [
  "hub",
  "file",
  "section",
  "image",
  "video",
  "tag",
];

const NODE_TYPE_LABELS: Record<NodeType, string> = {
  hub: "Hub",
  file: "File",
  section: "Section",
  image: "Image",
  video: "Video",
  tag: "Tag",
};

export default function GraphPageClient() {
  const { language } = useLanguage();
  const { startNavigation } = useNavigation();
  const router = useRouter();
  const isMobile = useIsMobile();
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [centerNode, setCenterNode] = useState<GraphNode | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const centerNodeDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const lastCenterNodeRef = useRef<GraphNode | null>(null);

  // Sync locale filter with the global language switcher
  const filterLocale: "en" | "zh-TW" = language === "zh-TW" ? "zh-TW" : "en";
  const [filterTypes, setFilterTypes] = useState<Set<SourceType>>(
    new Set(SOURCE_TYPES),
  );
  const [filterNodeTypes, setFilterNodeTypes] = useState<Set<NodeType>>(
    new Set(["hub", "file", "section", "tag", "image", "video"]),
  );

  useEffect(() => {
    fetch("/graph-data.json")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setGraphData)
      .catch((e) => setError(e.message));
  }, []);

  const navigateToNode = useCallback(
    (node: GraphNode) => {
      if (!node.url) return;
      try {
        const target = new URL(node.url, window.location.origin);
        // Treat www.harrychang.me as internal (graph-data.json has absolute URLs)
        const mainHost = window.location.hostname.replace(/^www\./, "");
        const targetHost = target.hostname.replace(/^www\./, "");
        const isMainDomain =
          target.origin === window.location.origin ||
          targetHost === mainHost ||
          targetHost === "harrychang.me";
        const isCrossSubdomain =
          target.hostname.endsWith("harrychang.me") && !isMainDomain;

        if (isMainDomain) {
          // Same domain: use router for page transition
          startNavigation();
          setTimeout(() => {
            router.push(target.pathname + target.search + target.hash);
          }, 300);
        } else if (isCrossSubdomain) {
          // Different subdomain (e.g. lab.harrychang.me): same tab, full navigation
          startNavigation();
          setTimeout(() => {
            window.location.href = node.url;
          }, 300);
        } else {
          // Truly external: same tab
          window.location.href = node.url;
        }
      } catch {
        window.location.href = node.url;
      }
    },
    [startNavigation, router],
  );

  const handleNodeClick = useCallback(
    (node: GraphNode | null) => {
      if (!node || node.nodeType === "tag") return;
      navigateToNode(node);
    },
    [navigateToNode],
  );

  const handleNodeHover = useCallback(
    (node: GraphNode | null, cursorPos?: { x: number; y: number }) => {
      // Show hover cards for all content node types
      const showCard =
        node?.nodeType === "file" ||
        node?.nodeType === "section" ||
        node?.nodeType === "image" ||
        node?.nodeType === "video" ||
        node?.nodeType === "tag";
      setHoveredNode(showCard ? node : null);
      if (cursorPos) {
        setCursorPosition(cursorPos);
      }
    },
    [],
  );

  const toggleType = useCallback((type: SourceType) => {
    setFilterTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        if (next.size > 1) next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }, []);

  const toggleNodeType = useCallback((type: NodeType) => {
    setFilterNodeTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        if (next.size > 1) next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }, []);

  // Mobile: handle center node change with debouncing to prevent rapid flashing
  const handleCenterNodeChange = useCallback((node: GraphNode | null) => {
    // Clear any pending update
    if (centerNodeDebounceRef.current) {
      clearTimeout(centerNodeDebounceRef.current);
    }

    // If node is the same, no need to update
    if (node?.id === lastCenterNodeRef.current?.id) {
      return;
    }

    // Debounce the update to prevent rapid switching during pan
    centerNodeDebounceRef.current = setTimeout(() => {
      lastCenterNodeRef.current = node;
      setCenterNode(node);
    }, 300); // 300ms debounce for smoother experience
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (centerNodeDebounceRef.current) {
        clearTimeout(centerNodeDebounceRef.current);
      }
    };
  }, []);

  // Filter graph data
  const { filteredData, filteredNodeIds } = useMemo(() => {
    if (!graphData) return { filteredData: null, filteredNodeIds: null };

    const nodes = graphData.nodes.filter((n) => {
      if (n.locale !== filterLocale) return false;
      if (
        !filterTypes.has(n.sourceType) &&
        n.nodeType !== "tag" &&
        n.nodeType !== "hub"
      )
        return false;
      if (!filterNodeTypes.has(n.nodeType)) return false;
      return true;
    });

    const nodeIds = new Set(nodes.map((n) => n.id));
    const edges = graphData.edges.filter(
      (e) => nodeIds.has(e.source) && nodeIds.has(e.target),
    );

    return {
      filteredData: { ...graphData, nodes, edges },
      filteredNodeIds: nodeIds,
    };
  }, [graphData, filterLocale, filterTypes, filterNodeTypes]);

  // Clear stale hover/center if the node was removed by filtering
  if (hoveredNode && filteredNodeIds && !filteredNodeIds.has(hoveredNode.id)) {
    setHoveredNode(null);
  }
  if (centerNode && filteredNodeIds && !filteredNodeIds.has(centerNode.id)) {
    setCenterNode(null);
  }

  if (error) {
    return (
      <div className="w-full h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="font-heading text-lg text-primary">
            Graph data not available
          </p>
          <p className="text-sm text-secondary">
            Run <code className="font-mono text-accent">pnpm build:graph</code>{" "}
            to generate the knowledge graph data.
          </p>
          <p className="font-mono text-xs text-secondary/50">{error}</p>
        </div>
      </div>
    );
  }

  if (!filteredData) {
    return (
      <div className="w-full h-[calc(100vh-4rem)] flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-secondary text-sm font-heading">
            Loading knowledge graph...
          </p>
        </div>
      </div>
    );
  }

  // The active node for mobile bottom card: tapped node or center node
  const mobileActiveNode = hoveredNode || centerNode;

  return (
    <div className="relative w-full h-[calc(100vh-4rem)]">
      <GraphCanvas
        data={filteredData}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        isMobile={isMobile}
        onCenterNodeChange={isMobile ? handleCenterNodeChange : undefined}
      />

      {/* Controls - top right */}
      {isMobile ? (
        /* Mobile: compact toggle for filters */
        <div className="absolute top-4 right-4 z-10 flex flex-col items-end">
          <button
            onClick={() => setShowMobileFilters((v) => !v)}
            className="label-mono bg-card/80 border border-border px-2 py-1"
          >
            {filteredData.nodes.length}n &middot; {filteredData.edges.length}e
          </button>
          <AnimatePresence>
            {showMobileFilters && (
              <motion.div
                initial={{ opacity: 0, y: -2, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -2, scale: 0.95 }}
                transition={{ duration: 0.1, ease: easeOut }}
                className="mt-2 bg-card border border-border p-2 flex flex-col gap-2 max-h-[60vh] overflow-y-auto origin-top-right"
              >
                <div className="flex items-center gap-6 min-h-[28px]">
                  <LanguageSwitcher />
                  <ThemeSwitcher />
                </div>
                <div className="flex flex-wrap gap-1">
                  {SOURCE_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => toggleType(type)}
                      className={`font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 border transition-colors bg-background ${
                        filterTypes.has(type)
                          ? "border-border text-primary"
                          : "border-border/30 text-secondary/50"
                      }`}
                    >
                      <span
                        className={`inline-block w-1.5 h-1.5 mr-1 ${
                          filterTypes.has(type) ? "" : "opacity-30"
                        }`}
                        style={{
                          backgroundColor: `hsl(var(--graph-node-${type}))`,
                        }}
                      />
                      {type}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1">
                  {NODE_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => toggleNodeType(type)}
                      className={`font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 border transition-colors bg-background ${
                        filterNodeTypes.has(type)
                          ? "border-border text-primary"
                          : "border-border/30 text-secondary/50"
                      }`}
                    >
                      {NODE_TYPE_LABELS[type]}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        /* Desktop: full filter panel */
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-3">
          <div className="font-mono text-xs text-secondary/50">
            {filteredData.nodes.length} nodes &middot;{" "}
            {filteredData.edges.length} edges
          </div>
          <div className="flex items-center justify-between min-h-[28px]">
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
          <div className="flex flex-col gap-1">
            {SOURCE_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className={`font-mono text-xs uppercase tracking-wider px-2 py-1 border text-left transition-colors bg-background ${
                  filterTypes.has(type)
                    ? "border-border text-primary"
                    : "border-border/30 text-secondary/50"
                }`}
              >
                <span
                  className={`inline-block w-2 h-2 mr-2 ${
                    filterTypes.has(type) ? "" : "opacity-30"
                  }`}
                  style={{
                    backgroundColor: `hsl(var(--graph-node-${type}))`,
                  }}
                />
                {type}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-1 pt-2 border-t border-border/30">
            {NODE_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => toggleNodeType(type)}
                className={`font-mono text-xs uppercase tracking-wider px-2 py-1 border text-left transition-colors bg-background ${
                  filterNodeTypes.has(type)
                    ? "border-border text-primary"
                    : "border-border/30 text-secondary/50"
                }`}
              >
                {NODE_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Desktop: cursor-following preview tooltip */}
      {!isMobile && (
        <AnimatePresence>
          {hoveredNode && (
            <NodePreviewCard
              key={hoveredNode.id}
              node={hoveredNode}
              cursorPosition={cursorPosition}
            />
          )}
        </AnimatePresence>
      )}

      {/* Mobile: sticky bottom card */}
      {isMobile && <MobileNodeCard node={mobileActiveNode} />}
    </div>
  );
}

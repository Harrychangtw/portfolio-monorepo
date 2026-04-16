"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence } from "motion/react";
import { useLanguage } from "@portfolio/lib/contexts/language-context";
import GraphCanvas from "./graph-canvas";
import NodePreviewCard from "./node-preview-card";
import type { GraphData, GraphNode, SourceType, NodeType } from "./types";

const LanguageSwitcher = dynamic(
  () => import("@portfolio/ui/language-switcher"),
  { ssr: false },
);

const SOURCE_TYPES: SourceType[] = ["post", "project", "gallery", "locale"];
const NODE_TYPES: NodeType[] = ["file", "section", "image", "video", "tag"];

const NODE_TYPE_LABELS: Record<NodeType, string> = {
  file: "File",
  section: "Section",
  image: "Image",
  video: "Video",
  tag: "Tag",
};

export default function GraphPageClient() {
  const { language } = useLanguage();
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  // Sync locale filter with the global language switcher
  const filterLocale: "en" | "zh-TW" = language === "zh-TW" ? "zh-TW" : "en";
  const [filterTypes, setFilterTypes] = useState<Set<SourceType>>(
    new Set(SOURCE_TYPES),
  );
  const [filterNodeTypes, setFilterNodeTypes] = useState<Set<NodeType>>(
    new Set(["file", "section", "tag"]),
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

  const handleNodeClick = useCallback((node: GraphNode | null) => {
    // Tag nodes are non-clickable
    if (!node || node.nodeType === "tag") return;
    // Navigate directly to the node's URL
    if (node.url) {
      window.open(node.url, "_blank", "noopener,noreferrer");
    }
  }, []);

  const handleNodeHover = useCallback(
    (node: GraphNode | null, cursorPos?: { x: number; y: number }) => {
      setHoveredNode(node);
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

  // Filter graph data
  const filteredData: GraphData | null = useMemo(() => {
    if (!graphData) return null;

    const nodes = graphData.nodes.filter((n) => {
      if (n.locale !== filterLocale) return false;
      if (!filterTypes.has(n.sourceType) && n.nodeType !== "tag") return false;
      if (!filterNodeTypes.has(n.nodeType)) return false;
      return true;
    });

    const nodeIds = new Set(nodes.map((n) => n.id));
    const edges = graphData.edges.filter(
      (e) => nodeIds.has(e.source) && nodeIds.has(e.target),
    );

    return {
      ...graphData,
      nodes,
      edges,
    };
  }, [graphData, filterLocale, filterTypes, filterNodeTypes]);

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

  return (
    <div className="relative w-full h-[calc(100vh-4rem)]">
      <GraphCanvas
        data={filteredData}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
      />

      {/* Controls - top right */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-3">
        {/* Stats */}
        <div className="font-mono text-xs text-secondary/50">
          {filteredData.nodes.length} nodes &middot; {filteredData.edges.length}{" "}
          edges
        </div>

        {/* Language switcher (syncs graph locale filter) */}
        <div className="flex items-center">
          <LanguageSwitcher />
        </div>

        {/* Source type filter */}
        <div className="flex flex-col gap-1">
          {SOURCE_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => toggleType(type)}
              className={`font-mono text-xs uppercase tracking-wider px-2 py-1 border text-left transition-colors ${
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

        {/* Node type filter */}
        <div className="flex flex-col gap-1 pt-2 border-t border-border/30">
          {NODE_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => toggleNodeType(type)}
              className={`font-mono text-xs uppercase tracking-wider px-2 py-1 border text-left transition-colors ${
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

      {/* Cursor-following preview tooltip */}
      <AnimatePresence>
        {hoveredNode && (
          <NodePreviewCard
            key={hoveredNode.id}
            node={hoveredNode}
            cursorPosition={cursorPosition}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

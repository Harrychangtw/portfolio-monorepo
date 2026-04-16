"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { AnimatePresence } from "motion/react";
import GraphCanvas from "./graph-canvas";
import NodePreviewCard from "./node-preview-card";
import type { GraphData, GraphNode, SourceType, NodeType } from "./types";

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
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [filterLocale, setFilterLocale] = useState<"all" | "en" | "zh-TW">(
    "all",
  );
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
    if (node && node.nodeType === "tag") return;
    setSelectedNode(node);
  }, []);

  const handleNodeHover = useCallback((node: GraphNode | null) => {
    setHoveredNode(node);
  }, []);

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
      if (filterLocale !== "all" && n.locale !== filterLocale) return false;
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

  // Node to show in preview (hovered takes priority, then selected)
  const previewNode = hoveredNode || selectedNode;

  return (
    <div className="relative w-full h-[calc(100vh-4rem)]">
      <GraphCanvas
        data={filteredData}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        selectedNodeId={selectedNode?.id}
      />

      {/* Controls - top right */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-3">
        {/* Stats */}
        <div className="font-mono text-xs text-secondary/50">
          {filteredData.nodes.length} nodes &middot; {filteredData.edges.length}{" "}
          edges
        </div>

        {/* Locale filter */}
        <div className="flex gap-1">
          {(["all", "en", "zh-TW"] as const).map((loc) => (
            <button
              key={loc}
              onClick={() => setFilterLocale(loc)}
              className={`font-mono text-xs uppercase tracking-wider px-2 py-1 border transition-colors ${
                filterLocale === loc
                  ? "border-accent text-accent bg-accent/10"
                  : "border-border text-secondary hover:text-primary hover:border-primary/30"
              }`}
            >
              {loc === "all" ? "All" : loc === "zh-TW" ? "ZH" : "EN"}
            </button>
          ))}
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

      {/* Preview card - bottom center (shows on hover or click) */}
      <AnimatePresence>
        {previewNode && (
          <NodePreviewCard
            key={previewNode.id}
            node={previewNode}
            onClose={() => {
              setSelectedNode(null);
              setHoveredNode(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

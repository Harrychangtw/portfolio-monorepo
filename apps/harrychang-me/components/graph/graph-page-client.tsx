"use client";

import { useEffect, useState, useCallback } from "react";
import { AnimatePresence } from "motion/react";
import GraphCanvas from "./graph-canvas";
import NodePreviewCard from "./node-preview-card";
import GraphLegend from "./graph-legend";
import type { GraphData, GraphNode, SourceType } from "./types";

const SOURCE_TYPES: SourceType[] = ["post", "project", "gallery", "locale"];

export default function GraphPageClient() {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [, setHoveredNode] = useState<GraphNode | null>(null);
  const [filterLocale, setFilterLocale] = useState<"all" | "en" | "zh-TW">(
    "all",
  );
  const [filterTypes, setFilterTypes] = useState<Set<SourceType>>(
    new Set(SOURCE_TYPES),
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

  // Filter graph data
  const filteredData: GraphData | null = graphData
    ? {
        ...graphData,
        nodes: graphData.nodes.filter((n) => {
          if (filterLocale !== "all" && n.locale !== filterLocale) return false;
          if (!filterTypes.has(n.sourceType)) return false;
          return true;
        }),
        edges: graphData.edges.filter((e) => {
          const nodeIds = new Set(
            graphData.nodes
              .filter((n) => {
                if (filterLocale !== "all" && n.locale !== filterLocale)
                  return false;
                if (!filterTypes.has(n.sourceType)) return false;
                return true;
              })
              .map((n) => n.id),
          );
          return nodeIds.has(e.source) && nodeIds.has(e.target);
        }),
      }
    : null;

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
        selectedNodeId={selectedNode?.id}
      />

      {/* Controls - top right */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-3">
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

        {/* Type filter */}
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
      </div>

      {/* Legend - bottom left */}
      <GraphLegend
        nodeCount={filteredData.nodes.length}
        edgeCount={filteredData.edges.length}
      />

      {/* Preview card - bottom center */}
      <AnimatePresence>
        {selectedNode && (
          <NodePreviewCard
            key={selectedNode.id}
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

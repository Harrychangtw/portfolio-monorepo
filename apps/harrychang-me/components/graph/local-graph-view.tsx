"use client";

import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
} from "d3-force";
import { useRouter } from "next/navigation";
import { useLanguage } from "@portfolio/lib/contexts/language-context";
import type { GraphData, GraphNode, SourceType } from "./types";
import { extractSubgraph, extractOverviewGraph } from "./extract-subgraph";
import {
  getNodeColors,
  getTagColor,
  getThemeColors,
  getGlowColor,
  computeNodeRadius,
} from "./graph-utils";

interface LocalGraphViewProps {
  currentSlug: string;
  sourceType: "post" | "project" | "gallery";
  className?: string;
}

interface SettledNode extends GraphNode {
  x: number;
  y: number;
  radius: number;
}

interface SettledEdge {
  source: SettledNode;
  target: SettledNode;
  linkType: string;
}

// Module-level cache so navigating between pages reuses the fetched data
let cachedGraphData: GraphData | null = null;
let fetchPromise: Promise<GraphData | null> | null = null;

async function loadGraphData(): Promise<GraphData | null> {
  if (cachedGraphData) return cachedGraphData;
  if (fetchPromise) return fetchPromise;
  fetchPromise = fetch("/graph-data.json")
    .then((res) => {
      if (!res.ok) return null;
      return res.json() as Promise<GraphData>;
    })
    .then((data) => {
      cachedGraphData = data;
      return data;
    })
    .catch(() => null);
  return fetchPromise;
}

export default function LocalGraphView({
  currentSlug,
  sourceType,
  className,
}: LocalGraphViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hoveredNode, setHoveredNode] = useState<{
    node: SettledNode;
    x: number;
    y: number;
  } | null>(null);
  const settledNodesRef = useRef<SettledNode[]>([]);
  const settledEdgesRef = useRef<SettledEdge[]>([]);
  const focalIdRef = useRef<string>("");
  const router = useRouter();
  const { language } = useLanguage();
  const locale = language === "zh-TW" ? "zh-TW" : "en";

  // Fetch graph data on mount
  useEffect(() => {
    loadGraphData().then((data) => {
      if (data) setGraphData(data);
    });
  }, []);

  // Overview mode when no slug provided (homepage)
  const isOverview = !currentSlug;

  // Extract subgraph and run simulation
  const subgraph = useMemo(() => {
    if (!graphData) return null;
    if (isOverview) {
      const overview = extractOverviewGraph(graphData, locale);
      if (!overview) return null;
      return { nodes: overview.nodes, edges: overview.edges, focalNodeId: "" };
    }
    return extractSubgraph(graphData, { currentSlug, sourceType, locale });
  }, [graphData, currentSlug, sourceType, locale, isOverview]);

  // Pre-settle simulation
  useEffect(() => {
    if (!subgraph) {
      settledNodesRef.current = [];
      settledEdgesRef.current = [];
      return;
    }

    const { nodes, edges, focalNodeId } = subgraph;
    focalIdRef.current = focalNodeId;

    // Compute connection counts
    const connectionCount = new Map<string, number>();
    for (const node of nodes) connectionCount.set(node.id, 0);
    for (const edge of edges) {
      connectionCount.set(edge.source, (connectionCount.get(edge.source) || 0) + 1);
      connectionCount.set(edge.target, (connectionCount.get(edge.target) || 0) + 1);
    }
    const maxConnections = Math.max(...connectionCount.values(), 1);

    // Create simulation nodes
    const simNodes: Array<GraphNode & { x: number; y: number; vx: number; vy: number; fx?: number | null; fy?: number | null }> = nodes.map((n, i) => {
      const angle = (i / nodes.length) * Math.PI * 2;
      const spread = Math.sqrt(nodes.length) * 8;
      // Place focal node at center
      const isFocal = n.id === focalNodeId;
      return {
        ...n,
        x: isFocal ? 0 : Math.cos(angle) * spread,
        y: isFocal ? 0 : Math.sin(angle) * spread,
        vx: 0,
        vy: 0,
      };
    });

    const nodeMap = new Map(simNodes.map((n) => [n.id, n]));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const simEdges: any[] = [];
    for (const e of edges) {
      const src = nodeMap.get(e.source);
      const tgt = nodeMap.get(e.target);
      if (src && tgt) {
        simEdges.push({ source: src, target: tgt, weight: e.weight, linkType: e.linkType });
      }
    }

    // Pin focal node at center (only in local mode)
    const focalSim = focalNodeId ? nodeMap.get(focalNodeId) : null;
    if (focalSim) {
      focalSim.fx = 0;
      focalSim.fy = 0;
    }

    // Adjust forces for overview (many nodes) vs local (few nodes)
    const chargeStrength = isOverview ? -30 : -80;
    const chargeMax = isOverview ? 150 : 200;
    const linkDist = isOverview ? 20 : 40;

    // Run simulation synchronously
    const sim = forceSimulation(simNodes)
      .force(
        "link",
        forceLink(simEdges)
          .id((d: any) => d.id) // eslint-disable-line @typescript-eslint/no-explicit-any
          .distance((d: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
            if (d.linkType === "structural") return isOverview ? 15 : 30;
            if (d.linkType === "tag") return isOverview ? 25 : 50;
            return linkDist + (1 - d.weight) * (isOverview ? 10 : 20);
          })
          .strength(0.8),
      )
      .force("charge", forceManyBody().strength(chargeStrength).distanceMax(chargeMax))
      .force("center", forceCenter(0, 0).strength(isOverview ? 0.5 : 0.8))
      .force(
        "collide",
        forceCollide()
          .radius((d: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
            const r = computeNodeRadius(d, connectionCount.get(d.id) || 0, maxConnections);
            return r * (isOverview ? 1.2 : 2) + (isOverview ? 1 : 3);
          })
          .strength(0.9),
      )
      .stop();

    // Tick synchronously
    const ticks = isOverview ? 200 : 150;
    for (let i = 0; i < ticks; i++) sim.tick();

    // Release focal pin
    if (focalSim) {
      focalSim.fx = null;
      focalSim.fy = null;
    }

    // Store settled positions
    settledNodesRef.current = simNodes.map((n) => ({
      ...n,
      x: n.x,
      y: n.y,
      radius: computeNodeRadius(n, connectionCount.get(n.id) || 0, maxConnections),
    }));

    const nodeRefMap = new Map(settledNodesRef.current.map((n) => [n.id, n]));
    settledEdgesRef.current = simEdges
      .map((e: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
        source: nodeRefMap.get(e.source.id)!,
        target: nodeRefMap.get(e.target.id)!,
        linkType: e.linkType,
      }))
      .filter((e: SettledEdge) => e.source && e.target);
  }, [subgraph]);

  // Handle resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // Theme color refs
  const nodeColorsRef = useRef<Record<SourceType, string>>({} as Record<SourceType, string>);
  const tagColorRef = useRef("#3d9970");
  const themeColorsRef = useRef(
    typeof window !== "undefined" ? getThemeColors() : { background: "#0a0a0a", foreground: "#ffffff", secondary: "#888", card: "#111" },
  );
  const glowColorRef = useRef("#ffffff");

  useEffect(() => {
    nodeColorsRef.current = getNodeColors();
    tagColorRef.current = getTagColor();
    themeColorsRef.current = getThemeColors();
    glowColorRef.current = getGlowColor();

    const observer = new MutationObserver(() => {
      nodeColorsRef.current = getNodeColors();
      tagColorRef.current = getTagColor();
      themeColorsRef.current = getThemeColors();
      glowColorRef.current = getGlowColor();
      renderCanvas();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Build neighbor map for highlight
  const neighborMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const edge of settledEdgesRef.current) {
      if (!map.has(edge.source.id)) map.set(edge.source.id, new Set());
      if (!map.has(edge.target.id)) map.set(edge.target.id, new Set());
      map.get(edge.source.id)!.add(edge.target.id);
      map.get(edge.target.id)!.add(edge.source.id);
    }
    return map;
  }, [subgraph]); // eslint-disable-line react-hooks/exhaustive-deps

  // Render function
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !dimensions.width || !dimensions.height) return;

    const nodes = settledNodesRef.current;
    const edges = settledEdgesRef.current;
    if (nodes.length === 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;

    const ctx = canvas.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const { width, height } = dimensions;
    const theme = themeColorsRef.current;
    const nodeColors = nodeColorsRef.current;
    const tagColor = tagColorRef.current;
    const glowColor = glowColorRef.current;
    const focalId = focalIdRef.current;
    const hovered = hoveredNode?.node ?? null;
    const hoveredNeighbors = hovered ? neighborMap.get(hovered.id) : null;

    // Compute auto-fit transform
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const n of nodes) {
      const r = n.radius * 2.5;
      if (n.x - r < minX) minX = n.x - r;
      if (n.x + r > maxX) maxX = n.x + r;
      if (n.y - r < minY) minY = n.y - r;
      if (n.y + r > maxY) maxY = n.y + r;
    }
    const graphW = maxX - minX || 1;
    const graphH = maxY - minY || 1;
    const padding = 40;
    const scale = Math.min(
      (width - padding * 2) / graphW,
      (height - padding * 2) / graphH,
      8,
    );
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const tx = width / 2;
    const ty = height / 2;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Apply transform
    ctx.save();
    ctx.translate(tx, ty);
    ctx.scale(scale, scale);
    ctx.translate(-cx, -cy);

    // Draw edges
    for (const edge of edges) {
      const isConnectedToFocal =
        edge.source.id === focalId || edge.target.id === focalId;
      const isConnectedToHover =
        hovered && (edge.source.id === hovered.id || edge.target.id === hovered.id);

      ctx.beginPath();
      ctx.moveTo(edge.source.x, edge.source.y);
      ctx.lineTo(edge.target.x, edge.target.y);

      if (isConnectedToHover) {
        ctx.strokeStyle = theme.foreground;
        ctx.globalAlpha = 0.8;
        ctx.lineWidth = 1.5 / scale;
      } else if (isConnectedToFocal) {
        ctx.strokeStyle = theme.foreground;
        ctx.globalAlpha = 0.4;
        ctx.lineWidth = 1.0 / scale;
      } else {
        ctx.strokeStyle = theme.secondary;
        ctx.globalAlpha = 0.2;
        ctx.lineWidth = 0.6 / scale;
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Draw nodes
    for (const node of nodes) {
      const isFocal = node.id === focalId;
      const isHovered = hovered?.id === node.id;
      const isNeighborOfHover = hovered && hoveredNeighbors?.has(node.id);
      const r = isFocal ? node.radius * 2.0 : node.radius * 1.5;

      const color =
        node.nodeType === "tag"
          ? tagColor
          : nodeColors[node.sourceType] || "#888";

      // Dim non-relevant nodes when hovering
      let nodeAlpha = node.nodeType === "section" ? 0.5 : 0.85;
      if (hovered) {
        if (isHovered || isNeighborOfHover) nodeAlpha = 1;
        else if (isFocal) nodeAlpha = 0.7;
        else nodeAlpha = 0.2;
      }
      if (isFocal && !hovered) nodeAlpha = 1;

      // Glow for focal node
      if (isFocal && !isHovered) {
        ctx.save();
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 8 / scale;
        ctx.beginPath();
        ctx.arc(node.x, node.y, r * 1.4, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.12;
        ctx.fill();
        ctx.restore();
      }

      // Glow for hovered
      if (isHovered) {
        ctx.save();
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 10 / scale;
        ctx.beginPath();
        ctx.arc(node.x, node.y, r * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.2;
        ctx.fill();
        ctx.restore();
      }

      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = nodeAlpha;
      ctx.fill();

      // Ring for focal node
      if (isFocal) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, r + 1.2 / scale, 0, Math.PI * 2);
        ctx.strokeStyle = glowColor;
        ctx.lineWidth = 1.0 / scale;
        ctx.globalAlpha = 0.5;
        ctx.stroke();
      }

      // Ring for hovered
      if (isHovered) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, r + 0.8 / scale, 0, Math.PI * 2);
        ctx.strokeStyle = glowColor;
        ctx.lineWidth = 1.2 / scale;
        ctx.globalAlpha = 1;
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
    }

    // Draw labels
    const screenFontSize = 10;
    const simFontSize = screenFontSize / scale;
    ctx.font = `${simFontSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";

    const labelPadH = 3 / scale;
    const labelPadV = 1.5 / scale;
    const occupiedBoxes: Array<{ x: number; y: number; w: number; h: number }> = [];

    function wouldOverlap(bx: number, by: number, bw: number, bh: number): boolean {
      for (const box of occupiedBoxes) {
        if (bx < box.x + box.w && bx + bw > box.x && by < box.y + box.h && by + bh > box.y) {
          return true;
        }
      }
      return false;
    }

    // Sort: focal first, then hovered, then neighbors, then files, then rest
    const sortedNodes = [...nodes].sort((a, b) => {
      const score = (n: SettledNode) => {
        if (n.id === focalId) return 100;
        if (hovered?.id === n.id) return 90;
        if (hovered && hoveredNeighbors?.has(n.id)) return 80;
        if (n.nodeType === "file") return 50;
        if (n.nodeType === "tag") return 40;
        return 10;
      };
      return score(b) - score(a);
    });

    for (const node of sortedNodes) {
      const isFocal = node.id === focalId;
      const isHovered = hovered?.id === node.id;
      const isNeighborOfHover = hovered && hoveredNeighbors?.has(node.id);
      const r = isFocal ? node.radius * 2.0 : node.radius * 1.5;

      let labelAlpha: number;
      if (isOverview) {
        // In overview mode, only show labels on hover interaction
        if (isHovered) labelAlpha = 1;
        else if (isNeighborOfHover) labelAlpha = 0.7;
        else labelAlpha = 0;
      } else if (isFocal || isHovered) {
        labelAlpha = 1;
      } else if (isNeighborOfHover) {
        labelAlpha = 0.8;
      } else if (hovered) {
        labelAlpha = 0;
      } else if (node.nodeType === "file") {
        labelAlpha = 0.7;
      } else if (node.nodeType === "tag") {
        labelAlpha = 0.5;
      } else {
        labelAlpha = 0;
      }

      if (labelAlpha <= 0) continue;

      const rawLabel =
        node.nodeType === "section" && node.heading
          ? node.heading
          : node.title;
      const maxChars = isFocal || isHovered ? 40 : 25;
      const label =
        rawLabel.length > maxChars
          ? rawLabel.slice(0, maxChars - 2) + "..."
          : rawLabel;

      const labelWidth = ctx.measureText(label).width;
      const labelY = node.y - r - 2 / scale;
      const bgX = node.x - labelWidth / 2 - labelPadH;
      const bgY = labelY - simFontSize - labelPadV;
      const bgW = labelWidth + labelPadH * 2;
      const bgH = simFontSize + labelPadV * 2;

      // Screen-space overlap check
      const sX = (bgX - cx) * scale + tx;
      const sY = (bgY - cy) * scale + ty;
      const sW = bgW * scale;
      const sH = bgH * scale;

      if (!isFocal && !isHovered) {
        if (wouldOverlap(sX, sY, sW, sH)) continue;
      }
      occupiedBoxes.push({ x: sX, y: sY, w: sW, h: sH });

      ctx.fillStyle = theme.card;
      ctx.globalAlpha = labelAlpha * 0.85;
      ctx.fillRect(bgX, bgY, bgW, bgH);

      ctx.fillStyle = theme.foreground;
      ctx.globalAlpha = labelAlpha;
      ctx.fillText(label, node.x, labelY);
    }

    ctx.globalAlpha = 1;
    ctx.restore();
  }, [dimensions, hoveredNode, neighborMap, subgraph, isOverview]); // eslint-disable-line react-hooks/exhaustive-deps

  // Render on state changes
  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Hit testing
  const findNodeAt = useCallback(
    (clientX: number, clientY: number): SettledNode | null => {
      const canvas = canvasRef.current;
      const nodes = settledNodesRef.current;
      if (!canvas || nodes.length === 0) return null;

      const rect = canvas.getBoundingClientRect();
      const { width, height } = dimensions;
      const focalId = focalIdRef.current;

      // Recompute transform (same as renderCanvas)
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      for (const n of nodes) {
        const r = n.radius * 2.5;
        if (n.x - r < minX) minX = n.x - r;
        if (n.x + r > maxX) maxX = n.x + r;
        if (n.y - r < minY) minY = n.y - r;
        if (n.y + r > maxY) maxY = n.y + r;
      }
      const graphW = maxX - minX || 1;
      const graphH = maxY - minY || 1;
      const padding = 40;
      const scale = Math.min(
        (width - padding * 2) / graphW,
        (height - padding * 2) / graphH,
        8,
      );
      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;
      const tx = width / 2;
      const ty = height / 2;

      // Convert screen to sim coords
      const sx = (clientX - rect.left - tx) / scale + cx;
      const sy = (clientY - rect.top - ty) / scale + cy;

      let closest: SettledNode | null = null;
      let closestDist = Infinity;

      for (const node of nodes) {
        const isFocal = node.id === focalId;
        const r = isFocal ? node.radius * 2.0 : node.radius * 1.5;
        const hitRadius = Math.max(r, 8 / scale);
        const dx = node.x - sx;
        const dy = node.y - sy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < hitRadius && dist < closestDist) {
          closest = node;
          closestDist = dist;
        }
      }
      return closest;
    },
    [dimensions],
  );

  // Pointer events
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMove = (e: PointerEvent) => {
      // Skip hover on touch devices
      if (e.pointerType === "touch") return;
      const node = findNodeAt(e.clientX, e.clientY);
      if (node) {
        setHoveredNode({ node, x: e.clientX, y: e.clientY });
        canvas.style.cursor = "pointer";
      } else {
        setHoveredNode(null);
        canvas.style.cursor = "default";
      }
    };

    const handleLeave = () => {
      setHoveredNode(null);
      canvas.style.cursor = "default";
    };

    const handleClick = (e: MouseEvent) => {
      const node = findNodeAt(e.clientX, e.clientY);
      if (!node || !node.url || node.nodeType === "tag") return;

      try {
        const url = new URL(node.url);
        const path = url.pathname;
        router.push(path);
      } catch {
        // Invalid URL — ignore
      }
    };

    canvas.addEventListener("pointermove", handleMove);
    canvas.addEventListener("pointerleave", handleLeave);
    canvas.addEventListener("click", handleClick);

    return () => {
      canvas.removeEventListener("pointermove", handleMove);
      canvas.removeEventListener("pointerleave", handleLeave);
      canvas.removeEventListener("click", handleClick);
    };
  }, [findNodeAt, router]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full ${className || ""}`}
    >
      {subgraph && (
        <>
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            style={{ touchAction: "auto" }}
          />
          {hoveredNode && (
            <div
              className="pointer-events-none fixed z-50 px-2.5 py-1.5 rounded text-xs bg-card border border-border shadow-lg max-w-[200px] truncate"
              style={{
                left: hoveredNode.x + 12,
                top: hoveredNode.y - 8,
              }}
            >
              <span className="text-foreground">{hoveredNode.node.title}</span>
              {hoveredNode.node.nodeType === "tag" && (
                <span className="ml-1.5 text-secondary text-[10px]">tag</span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

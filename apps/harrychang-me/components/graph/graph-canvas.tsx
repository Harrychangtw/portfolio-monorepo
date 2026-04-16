"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  forceRadial,
} from "d3-force";
import { zoom as d3Zoom, zoomIdentity } from "d3-zoom";
import { select } from "d3-selection";
import "d3-transition"; // side-effect: adds .transition() to d3 selections
import type {
  GraphData,
  GraphNode,
  NodeType,
  SimulationNode,
  SimulationEdge,
  SourceType,
} from "./types";

interface GraphCanvasProps {
  data: GraphData;
  onNodeClick: (node: GraphNode | null) => void;
  onNodeHover: (node: GraphNode | null, cursorPos?: { x: number; y: number }) => void;
  selectedNodeId?: string | null;
  isMobile?: boolean;
  onCenterNodeChange?: (node: GraphNode | null) => void;
  focusNodeId?: string | null;
}

/* ─── Color helpers ────────────────────────────────────────────────────────── */

const SOURCE_TYPE_CSS_VAR: Record<SourceType, string> = {
  post: "--graph-node-post",
  project: "--graph-node-project",
  gallery: "--graph-node-gallery",
  locale: "--graph-node-locale",
};

function getNodeColors(): Record<SourceType, string> {
  const style = getComputedStyle(document.documentElement);
  const colors: Partial<Record<SourceType, string>> = {};
  for (const [type, cssVar] of Object.entries(SOURCE_TYPE_CSS_VAR)) {
    const hsl = style.getPropertyValue(cssVar).trim();
    colors[type as SourceType] = hsl ? `hsl(${hsl})` : "#888";
  }
  return colors as Record<SourceType, string>;
}

function getTagColor(): string {
  const style = getComputedStyle(document.documentElement);
  const hsl = style.getPropertyValue("--graph-node-tag").trim();
  return hsl ? `hsl(${hsl})` : "#3d9970";
}

function getMediaColor(): string {
  const style = getComputedStyle(document.documentElement);
  const secondary = style.getPropertyValue("--secondary").trim();
  return secondary ? `hsl(${secondary})` : "#888";
}

function getThemeColors() {
  const style = getComputedStyle(document.documentElement);
  const bg = style.getPropertyValue("--background").trim();
  const fg = style.getPropertyValue("--foreground").trim();
  const secondary = style.getPropertyValue("--secondary").trim();
  const card = style.getPropertyValue("--card").trim();
  return {
    background: bg ? `hsl(${bg})` : "#0a0a0a",
    foreground: fg ? `hsl(${fg})` : "#ffffff",
    secondary: secondary ? `hsl(${secondary})` : "#888",
    card: card ? `hsl(${card})` : "#111",
  };
}

function getGlowColor(): string {
  const style = getComputedStyle(document.documentElement);
  const fg = style.getPropertyValue("--foreground").trim();
  return fg ? `hsl(${fg})` : "#ffffff";
}

/* ─── Node radius by type (minimal aesthetic) ──────────────────────────────── */

const NODE_TYPE_BASE_RADIUS: Record<NodeType, number> = {
  file: 3.0,
  section: 1.8,
  image: 1.0,
  video: 1.2,
  tag: 2.0,
  hub: 5.0,
};

const NODE_TYPE_MAX_BONUS: Record<NodeType, number> = {
  file: 1.0,
  section: 0.8,
  image: 0,
  video: 0,
  tag: 0.5,
  hub: 0,
};

/** Primary hub slugs get the full hub radius; secondary hubs are smaller */
const PRIMARY_HUB_SLUGS = new Set(["root", "post", "project", "gallery"]);

function computeNodeRadius(
  node: GraphNode,
  connectionCount: number,
  maxConnections: number,
): number {
  let base = NODE_TYPE_BASE_RADIUS[node.nodeType] || 1.5;
  // Secondary hubs (about, updates, uses, cv, reading, lab, linktree) are smaller
  if (node.nodeType === "hub" && !PRIMARY_HUB_SLUGS.has(node.sourceSlug)) {
    base = 3;
  }
  const maxBonus = NODE_TYPE_MAX_BONUS[node.nodeType] || 0;
  const bonus = maxConnections > 0 ? (connectionCount / maxConnections) * maxBonus : 0;
  return base + bonus;
}

/* ─── Force strengths by node type ─────────────────────────────────────────── */

const CHARGE_STRENGTH: Record<NodeType, number> = {
  file: -200,
  section: -130,
  tag: -160,
  image: -40,
  video: -50,
  hub: -400,
};

/* ─── Label priority (higher = drawn first = wins overlap) ─────────────────── */

const LABEL_PRIORITY: Record<NodeType, number> = {
  hub: 6,
  file: 5,
  tag: 4,
  section: 3,
  video: 2,
  image: 1,
};

/* ─── Label zoom thresholds (k value where labels start appearing) ─────────── */

const LABEL_ZOOM_THRESHOLD: Record<NodeType, number> = {
  hub: 0.3,
  file: 0.8,
  tag: 1.2,
  section: 2.0,
  image: 999, // only on hover
  video: 999, // only on hover
};

/* ─── Component ────────────────────────────────────────────────────────────── */

export default function GraphCanvas({
  data,
  onNodeClick,
  onNodeHover,
  selectedNodeId,
  isMobile,
  onCenterNodeChange,
  focusNodeId,
}: GraphCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const simulationRef = useRef<any>(null);
  const nodesRef = useRef<SimulationNode[]>([]);
  const edgesRef = useRef<SimulationEdge[]>([]);
  const transformRef = useRef({ x: 0, y: 0, k: 1 });
  const hoveredRef = useRef<SimulationNode | null>(null);
  const centerNodeRef = useRef<string | null>(null);
  const nodeColorsRef = useRef<Record<SourceType, string>>(
    {} as Record<SourceType, string>,
  );
  const tagColorRef = useRef("#3d9970");
  const themeColorsRef = useRef(getThemeColors());
  const mediaColorRef = useRef("#888");
  const glowColorRef = useRef("#eaff4b");
  const animFrameRef = useRef<number>(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const dragNodeRef = useRef<SimulationNode | null>(null);
  const isDraggingRef = useRef(false);
  const needsRenderRef = useRef(true);

  const nodeRadiusMap = useRef<Map<string, number>>(new Map());
  const neighborMap = useRef<Map<string, Set<string>>>(new Map());
  const parentEdgesRef = useRef<Set<string>>(new Set()); // "source|target" keys for structural parent edges to media nodes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const zoomBehaviorRef = useRef<any>(null);

  // Initialize colors
  useEffect(() => {
    nodeColorsRef.current = getNodeColors();
    tagColorRef.current = getTagColor();
    mediaColorRef.current = getMediaColor();
    themeColorsRef.current = getThemeColors();
    glowColorRef.current = getGlowColor();

    const observer = new MutationObserver(() => {
      nodeColorsRef.current = getNodeColors();
      tagColorRef.current = getTagColor();
      mediaColorRef.current = getMediaColor();
      themeColorsRef.current = getThemeColors();
      glowColorRef.current = getGlowColor();
      needsRenderRef.current = true;
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

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

  // Setup simulation
  useEffect(() => {
    if (!data.nodes.length || !dimensions.width || !dimensions.height) return;

    // Compute connection counts for radius
    const connectionCount = new Map<string, number>();
    const neighbors = new Map<string, Set<string>>();
    for (const node of data.nodes) {
      connectionCount.set(node.id, 0);
      neighbors.set(node.id, new Set());
    }
    for (const edge of data.edges) {
      connectionCount.set(
        edge.source,
        (connectionCount.get(edge.source) || 0) + 1,
      );
      connectionCount.set(
        edge.target,
        (connectionCount.get(edge.target) || 0) + 1,
      );
      neighbors.get(edge.source)?.add(edge.target);
      neighbors.get(edge.target)?.add(edge.source);
    }
    neighborMap.current = neighbors;

    // Track structural edges to image/video nodes (for dashed rendering)
    const parentEdgeKeys = new Set<string>();
    const nodeTypeMap = new Map(data.nodes.map((n) => [n.id, n.nodeType]));
    for (const edge of data.edges) {
      if (edge.linkType === "structural") {
        const targetType = nodeTypeMap.get(edge.target);
        const sourceType = nodeTypeMap.get(edge.source);
        if (targetType === "image" || targetType === "video") {
          parentEdgeKeys.add(`${edge.source}|${edge.target}`);
        }
        if (sourceType === "image" || sourceType === "video") {
          parentEdgeKeys.add(`${edge.target}|${edge.source}`);
        }
      }
    }
    parentEdgesRef.current = parentEdgeKeys;

    const maxConnections = Math.max(...connectionCount.values(), 1);
    for (const node of data.nodes) {
      const count = connectionCount.get(node.id) || 0;
      const r = computeNodeRadius(node, count, maxConnections);
      nodeRadiusMap.current.set(node.id, r);
    }

    // Create simulation nodes — spread them in a circle
    const simNodes: SimulationNode[] = data.nodes.map((n, i) => {
      const angle = (i / data.nodes.length) * Math.PI * 2;
      const spread = Math.sqrt(data.nodes.length) * 10;
      return {
        ...n,
        x: Math.cos(angle) * spread + (Math.random() - 0.5) * spread * 0.3,
        y: Math.sin(angle) * spread + (Math.random() - 0.5) * spread * 0.3,
        vx: 0,
        vy: 0,
      };
    });

    const nodeMap = new Map(simNodes.map((n) => [n.id, n]));
    const simEdges: SimulationEdge[] = [];
    for (const e of data.edges) {
      const src = nodeMap.get(e.source);
      const tgt = nodeMap.get(e.target);
      if (src && tgt) {
        simEdges.push({ source: src, target: tgt, weight: e.weight, linkType: e.linkType });
      }
    }

    nodesRef.current = simNodes;
    edgesRef.current = simEdges;

    const sim = forceSimulation(simNodes)
      .force(
        "link",
        forceLink(simEdges)
          .id((d: any) => d.id) // eslint-disable-line @typescript-eslint/no-explicit-any
          .distance((d: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
            if (d.linkType === "structural") return 10 + (1 - d.weight) * 15;
            if (d.linkType === "tag") return 30;
            return 20 + (1 - d.weight) * 45;
          })
          .strength((d: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
            if (d.linkType === "structural") return 1.0;
            if (d.linkType === "tag") return 0.5;
            return 0.3 + d.weight * 0.4;
          }),
      )
      .force(
        "charge",
        forceManyBody<SimulationNode>()
          .strength((d) => CHARGE_STRENGTH[d.nodeType] || -60)
          .distanceMax(350),
      )
      .force("center", forceCenter(0, 0).strength(0.6))
      .force(
        "radial",
        forceRadial<SimulationNode>(
          Math.sqrt(data.nodes.length) * 6,
          0,
          0,
        ).strength(0.05),
      )
      .force(
        "collide",
        forceCollide<SimulationNode>()
          .radius((d) => (nodeRadiusMap.current.get(d.id) || 1.5) + 0.5)
          .strength(0.9),
      )
      .alphaDecay(0.018)
      .alphaMin(0.001)
      .velocityDecay(0.6)
      .on("tick", () => {
        needsRenderRef.current = true;
      })
      .on("end", () => {
        needsRenderRef.current = true;
      });

    simulationRef.current = sim;

    return () => {
      sim.stop();
      simulationRef.current = null;
    };
  }, [data, dimensions.width, dimensions.height]);

  // Convert screen (client) coords to simulation coords
  const screenToSim = useCallback(
    (clientX: number, clientY: number): { sx: number; sy: number } => {
      const canvas = canvasRef.current;
      if (!canvas) return { sx: 0, sy: 0 };
      const rect = canvas.getBoundingClientRect();
      const { x: tx, y: ty, k } = transformRef.current;
      const sx = (clientX - rect.left - tx) / k;
      const sy = (clientY - rect.top - ty) / k;
      return { sx, sy };
    },
    [],
  );

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !dimensions.width || !dimensions.height) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    canvas.style.width = `${dimensions.width}px`;
    canvas.style.height = `${dimensions.height}px`;

    const ctx = canvas.getContext("2d")!;

    const render = () => {
      animFrameRef.current = requestAnimationFrame(render);

      if (!needsRenderRef.current) return;
      needsRenderRef.current = false;

      const { width, height } = dimensions;
      const { x: tx, y: ty, k } = transformRef.current;
      const nodes = nodesRef.current;
      const edges = edgesRef.current;
      const theme = themeColorsRef.current;
      const nodeColors = nodeColorsRef.current;
      const tagColor = tagColorRef.current;
      const mediaColor = mediaColorRef.current;
      const hovered = hoveredRef.current;
      const glowColor = glowColorRef.current;
      const parentEdgeKeys = parentEdgesRef.current;

      // Build set of hovered-node neighbors for spotlight effect
      const hoveredNeighbors = hovered
        ? neighborMap.current.get(hovered.id)
        : null;
      const hasHoverSpotlight = !!hovered;

      // Reset transform and clear
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // Apply zoom transform
      ctx.translate(tx, ty);
      ctx.scale(k, k);

      // ─── Draw background grid ──────────────────────────────────────────
      {
        const gridSpacing = 50;
        // Compute visible bounds in simulation coords
        const visMinX = -tx / k;
        const visMinY = -ty / k;
        const visMaxX = (width - tx) / k;
        const visMaxY = (height - ty) / k;
        // Snap to grid
        const startX = Math.floor(visMinX / gridSpacing) * gridSpacing;
        const startY = Math.floor(visMinY / gridSpacing) * gridSpacing;

        ctx.beginPath();
        ctx.strokeStyle = theme.card;
        ctx.lineWidth = 0.5 / k;
        ctx.globalAlpha = 0.8;

        for (let x = startX; x <= visMaxX; x += gridSpacing) {
          ctx.moveTo(x, visMinY);
          ctx.lineTo(x, visMaxY);
        }
        for (let y = startY; y <= visMaxY; y += gridSpacing) {
          ctx.moveTo(visMinX, y);
          ctx.lineTo(visMaxX, y);
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // ─── Draw edges ─────────────────────────────────────────────────────
      for (const edge of edges) {
        const src = edge.source;
        const tgt = edge.target;
        const isConnectedToHover =
          hovered && (src.id === hovered.id || tgt.id === hovered.id);
        const isConnectedToSelected =
          selectedNodeId &&
          (src.id === selectedNodeId || tgt.id === selectedNodeId);

        // Check if this is a parent-to-media edge (dashed)
        const isParentMediaEdge =
          parentEdgeKeys.has(`${src.id}|${tgt.id}`) ||
          parentEdgeKeys.has(`${tgt.id}|${src.id}`);

        ctx.beginPath();
        if (isParentMediaEdge && !isConnectedToHover && !isConnectedToSelected) {
          // Dashed line for parent-to-media structural edges
          const dashLen = 3 / k;
          ctx.setLineDash([dashLen, dashLen]);
        } else {
          ctx.setLineDash([]);
        }
        ctx.moveTo(src.x, src.y);
        ctx.lineTo(tgt.x, tgt.y);

        if (isConnectedToHover || isConnectedToSelected) {
          ctx.strokeStyle = theme.foreground;
          ctx.globalAlpha = 0.9;
          ctx.lineWidth = 1.5 / k;
        } else if (hasHoverSpotlight) {
          ctx.strokeStyle = theme.secondary;
          ctx.globalAlpha = 0.02;
          ctx.lineWidth = 0.3 / k;
        } else {
          if (isParentMediaEdge) {
            // Dashed grey for media parent edges — slightly more visible
            ctx.strokeStyle = mediaColor;
            ctx.globalAlpha = 0.15;
            ctx.lineWidth = 0.4 / k;
          } else if (edge.linkType === "structural") {
            const srcColor = src.nodeType === "tag" ? tagColor : (nodeColors[src.sourceType] || "#888");
            ctx.strokeStyle = srcColor;
            ctx.globalAlpha = 0.06;
          } else if (edge.linkType === "tag") {
            ctx.strokeStyle = tagColor;
            ctx.globalAlpha = 0.05;
          } else {
            ctx.strokeStyle = theme.secondary;
            ctx.globalAlpha = 0.04 + edge.weight * 0.06;
          }
          ctx.lineWidth = 0.3 / k;
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.globalAlpha = 1;

      // ─── Draw nodes ─────────────────────────────────────────────────────
      for (const node of nodes) {
        const baseR = nodeRadiusMap.current.get(node.id) || 1.5;
        // Ensure minimum screen-space radius so nodes remain visible
        const screenR = baseR * k;
        const minScreenR = 1.5;
        const r = screenR < minScreenR ? minScreenR / k : baseR;

        const isHovered = hovered?.id === node.id;
        const isSelected = selectedNodeId === node.id;
        const isNeighborOfHover =
          hovered && hoveredNeighbors?.has(node.id);
        const isMedia = node.nodeType === "image" || node.nodeType === "video";
        const isHub = node.nodeType === "hub";
        const color = isHub
          ? theme.foreground
          : isMedia
            ? mediaColor
            : node.nodeType === "tag"
              ? tagColor
              : nodeColors[node.sourceType] || "#888";

        // Determine node opacity based on hover spotlight and hierarchy
        const isSection = node.nodeType === "section";
        let nodeAlpha = isHub ? 1 : isMedia ? 0.5 : isSection ? 0.55 : 0.85;
        if (hasHoverSpotlight) {
          if (isHovered || isSelected || isNeighborOfHover) {
            nodeAlpha = 1;
          } else {
            nodeAlpha = 0.12;
          }
        }

        // Glow effect for hovered/selected
        if (isHovered || isSelected) {
          ctx.save();
          ctx.shadowColor = glowColor;
          ctx.shadowBlur = 12 / k;
          ctx.beginPath();
          ctx.arc(node.x, node.y, r * 1.6, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.globalAlpha = 0.2;
          ctx.fill();
          ctx.restore();
        } else if (isNeighborOfHover) {
          ctx.save();
          ctx.shadowColor = color;
          ctx.shadowBlur = 6 / k;
          ctx.beginPath();
          ctx.arc(node.x, node.y, r * 1.2, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.globalAlpha = 0.15;
          ctx.fill();
          ctx.restore();
        }

        // Node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = nodeAlpha;
        ctx.fill();

        // Hub nodes: subtle ring at rest
        if (isHub && !isHovered && !isSelected) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, r + 1.5 / k, 0, Math.PI * 2);
          ctx.strokeStyle = theme.foreground;
          ctx.lineWidth = 0.8 / k;
          ctx.globalAlpha = 0.3;
          ctx.stroke();
        }

        // Node border for hovered/selected
        if (isHovered || isSelected) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, r + 0.8 / k, 0, Math.PI * 2);
          ctx.strokeStyle = glowColor;
          ctx.lineWidth = 1.5 / k;
          ctx.globalAlpha = 1;
          ctx.stroke();
        }

        ctx.globalAlpha = 1;
      }

      // ─── Draw labels (anti-overlap, fixed screen size) ──────────────────
      // Sort nodes by priority so important labels render first and claim space
      const sortedNodes = [...nodes].sort((a, b) => {
        const aHovered = hovered?.id === a.id ? 100 : 0;
        const bHovered = hovered?.id === b.id ? 100 : 0;
        const aSelected = selectedNodeId === a.id ? 90 : 0;
        const bSelected = selectedNodeId === b.id ? 90 : 0;
        const aNeighbor = hovered && hoveredNeighbors?.has(a.id) ? 80 : 0;
        const bNeighbor = hovered && hoveredNeighbors?.has(b.id) ? 80 : 0;
        const aPriority = aHovered + aSelected + aNeighbor + (LABEL_PRIORITY[a.nodeType] || 0);
        const bPriority = bHovered + bSelected + bNeighbor + (LABEL_PRIORITY[b.nodeType] || 0);
        return bPriority - aPriority;
      });

      // Occupancy grid for anti-overlap (screen-space coordinates)
      const occupiedBoxes: Array<{ x: number; y: number; w: number; h: number }> = [];

      function wouldOverlap(bx: number, by: number, bw: number, bh: number): boolean {
        const pad = 2; // 2px padding between labels
        for (const box of occupiedBoxes) {
          if (
            bx - pad < box.x + box.w &&
            bx + bw + pad > box.x &&
            by - pad < box.y + box.h &&
            by + bh + pad > box.y
          ) {
            return true;
          }
        }
        return false;
      }

      // Fixed screen-space font size (10px on screen regardless of zoom)
      const screenFontSize = 10;
      const simFontSize = screenFontSize / k;
      const labelPadH = 3 / k; // horizontal padding in sim coords
      const labelPadV = 1.5 / k; // vertical padding in sim coords

      ctx.font = `${simFontSize}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";

      for (const node of sortedNodes) {
        const baseR = nodeRadiusMap.current.get(node.id) || 1.5;
        const screenR = baseR * k;
        const minScreenR = 1.5;
        const r = screenR < minScreenR ? minScreenR / k : baseR;

        const isHovered = hovered?.id === node.id;
        const isSelected = selectedNodeId === node.id;
        const isNeighborOfHover =
          hovered && hoveredNeighbors?.has(node.id);

        // Determine label alpha based on state and zoom threshold
        let labelAlpha: number;
        let maxChars: number;

        if (isHovered || isSelected) {
          labelAlpha = 1;
          maxChars = 50;
        } else if (isNeighborOfHover) {
          labelAlpha = 0.8;
          maxChars = 30;
        } else if (hasHoverSpotlight) {
          labelAlpha = 0;
          maxChars = 0;
        } else {
          const threshold = LABEL_ZOOM_THRESHOLD[node.nodeType] || 2.0;
          if (k < threshold) {
            labelAlpha = 0;
            maxChars = 0;
          } else {
            labelAlpha = Math.min(0.7, (k - threshold) / 0.3 * 0.7);
            maxChars = node.nodeType === "file" ? 30 : 20;
          }
        }

        if (labelAlpha <= 0) continue;

        // Section nodes: prefer heading over title to avoid showing post title
        const rawLabel = node.nodeType === "section" && node.heading
          ? node.heading
          : node.title;
        const label =
          rawLabel.length > maxChars
            ? rawLabel.slice(0, maxChars - 2) + "..."
            : rawLabel;

        // Label positioned ABOVE the node
        const labelWidth = ctx.measureText(label).width;
        const labelY = node.y - r - 2 / k; // above the node
        const bgX = node.x - labelWidth / 2 - labelPadH;
        const bgY = labelY - simFontSize - labelPadV;
        const bgW = labelWidth + labelPadH * 2;
        const bgH = simFontSize + labelPadV * 2;

        // Compute screen-space bounding box for overlap check
        const screenLabelX = bgX * k + tx;
        const screenLabelY = bgY * k + ty;
        const screenLabelW = bgW * k;
        const screenLabelH = bgH * k;

        // Skip if it would overlap (unless it's the hovered/selected node)
        if (!isHovered && !isSelected) {
          if (wouldOverlap(screenLabelX, screenLabelY, screenLabelW, screenLabelH)) {
            continue;
          }
        }

        occupiedBoxes.push({
          x: screenLabelX,
          y: screenLabelY,
          w: screenLabelW,
          h: screenLabelH,
        });

        // Draw background rectangle
        ctx.fillStyle = theme.card;
        ctx.globalAlpha = labelAlpha * 0.85;
        ctx.fillRect(bgX, bgY, bgW, bgH);

        // Draw label text
        ctx.fillStyle = themeColorsRef.current.foreground;
        ctx.globalAlpha = labelAlpha;
        ctx.fillText(label, node.x, labelY);
      }

      ctx.globalAlpha = 1;
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      // ─── Mobile: find closest node to screen center ───────────────────
      if (onCenterNodeChange) {
        const centerSimX = (width / 2 - tx) / k;
        const centerSimY = (height / 2 - ty) / k;
        let closest: SimulationNode | null = null;
        let closestDist = Infinity;
        for (const node of nodes) {
          const dx = node.x - centerSimX;
          const dy = node.y - centerSimY;
          const dist = dx * dx + dy * dy;
          if (dist < closestDist) {
            closest = node;
            closestDist = dist;
          }
        }
        if (closest?.id !== centerNodeRef.current) {
          centerNodeRef.current = closest?.id ?? null;
          onCenterNodeChange(closest);
        }
      }
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [dimensions, selectedNodeId, onCenterNodeChange]);

  // Hit testing
  const findNodeAtPoint = useCallback(
    (clientX: number, clientY: number): SimulationNode | null => {
      const { sx: mx, sy: my } = screenToSim(clientX, clientY);
      const k = transformRef.current.k;

      let closest: SimulationNode | null = null;
      let closestDist = Infinity;

      for (const node of nodesRef.current) {
        const baseR = nodeRadiusMap.current.get(node.id) || 1.5;
        const hitRadius = Math.max(baseR, 10 / k);
        const dx = node.x - mx;
        const dy = node.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < hitRadius && dist < closestDist) {
          closest = node;
          closestDist = dist;
        }
      }

      return closest;
    },
    [screenToSim],
  );

  // Pointer events
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMove = (e: PointerEvent) => {
      if (isDraggingRef.current && dragNodeRef.current) {
        const { sx, sy } = screenToSim(e.clientX, e.clientY);
        dragNodeRef.current.fx = sx;
        dragNodeRef.current.fy = sy;
        simulationRef.current?.alpha(0.03).restart();
        return;
      }

      // On mobile, skip hover tracking — use tap-to-select instead
      if (isMobile) return;

      const node = findNodeAtPoint(e.clientX, e.clientY);
      if (hoveredRef.current?.id !== node?.id) {
        hoveredRef.current = node;
        needsRenderRef.current = true;
        canvas.style.cursor = node ? "pointer" : "grab";
        onNodeHover(node, node ? { x: e.clientX, y: e.clientY } : undefined);
      }
    };

    const handleDown = (e: PointerEvent) => {
      // On mobile, don't start drag on node tap — reserve for pan
      if (isMobile) return;
      const node = findNodeAtPoint(e.clientX, e.clientY);
      if (node) {
        isDraggingRef.current = true;
        dragNodeRef.current = node;
        const { sx, sy } = screenToSim(e.clientX, e.clientY);
        node.fx = sx;
        node.fy = sy;
        simulationRef.current?.alphaTarget(0.03).restart();
        canvas.setPointerCapture(e.pointerId);
        e.stopPropagation();
      }
    };

    const handleUp = (e: PointerEvent) => {
      if (isDraggingRef.current && dragNodeRef.current) {
        dragNodeRef.current.fx = null;
        dragNodeRef.current.fy = null;
        simulationRef.current?.alphaTarget(0);
        isDraggingRef.current = false;
        dragNodeRef.current = null;
        canvas.releasePointerCapture(e.pointerId);
        return;
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (isDraggingRef.current) return;
      const node = findNodeAtPoint(e.clientX, e.clientY);
      if (isMobile && node) {
        // On mobile, tap selects the node (shows in bottom card) instead of navigating
        hoveredRef.current = node;
        needsRenderRef.current = true;
        onNodeHover(node, { x: e.clientX, y: e.clientY });
        return;
      }
      onNodeClick(node);
    };

    canvas.addEventListener("pointermove", handleMove);
    canvas.addEventListener("pointerdown", handleDown);
    canvas.addEventListener("pointerup", handleUp);
    canvas.addEventListener("click", handleClick);

    return () => {
      canvas.removeEventListener("pointermove", handleMove);
      canvas.removeEventListener("pointerdown", handleDown);
      canvas.removeEventListener("pointerup", handleUp);
      canvas.removeEventListener("click", handleClick);
    };
  }, [findNodeAtPoint, onNodeClick, onNodeHover, screenToSim, isMobile]);

  // Zoom — d3-zoom with center offset baked into the initial transform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !dimensions.width) return;

    const { width, height } = dimensions;

    const zoomBehavior = d3Zoom<HTMLCanvasElement, unknown>()
      .scaleExtent([0.05, 5])
      .filter((event) => {
        if (event.type === "wheel") return true;
        if (event.type === "mousedown" || event.type === "pointerdown") {
          return !isDraggingRef.current;
        }
        return true;
      })
      .on("zoom", (event) => {
        transformRef.current = {
          x: event.transform.x,
          y: event.transform.y,
          k: event.transform.k,
        };
        needsRenderRef.current = true;
      });

    zoomBehaviorRef.current = zoomBehavior;
    const selection = select(canvas);
    selection.call(zoomBehavior as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    // Compute initial zoom scale to fit all nodes
    const nodes = nodesRef.current;
    let initialK = 0.6;
    if (nodes.length > 0) {
      let minX = Infinity,
        maxX = -Infinity,
        minY = Infinity,
        maxY = -Infinity;
      for (const n of nodes) {
        if (n.x < minX) minX = n.x;
        if (n.x > maxX) maxX = n.x;
        if (n.y < minY) minY = n.y;
        if (n.y > maxY) maxY = n.y;
      }
      const graphW = maxX - minX || 1;
      const graphH = maxY - minY || 1;
      const padding = 60;
      const kx = (width - padding * 2) / graphW;
      const ky = (height - padding * 2) / graphH;
      initialK = Math.min(kx, ky, 1.5);
      initialK = Math.max(initialK, 0.1);
    }

    selection.call(
      zoomBehavior.transform as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      zoomIdentity.translate(width / 2, height / 2).scale(initialK),
    );

    return () => {
      selection.on(".zoom", null);
    };
  }, [dimensions.width, dimensions.height]);

  // Pan to focused node (mobile swipe navigation)
  useEffect(() => {
    if (!focusNodeId || !dimensions.width || !canvasRef.current) return;
    const node = nodesRef.current.find((n) => n.id === focusNodeId);
    if (!node) return;
    const { width, height } = dimensions;
    const k = transformRef.current.k;
    const targetTransform = zoomIdentity
      .translate(width / 2, height / 2)
      .scale(k)
      .translate(-node.x, -node.y);
    const sel = select(canvasRef.current);
    if (zoomBehaviorRef.current) {
      sel
        .transition()
        .duration(300)
        .call(zoomBehaviorRef.current.transform as any, targetTransform); // eslint-disable-line @typescript-eslint/no-explicit-any
    }
  }, [focusNodeId, dimensions]);

  return (
    <div ref={containerRef} className="w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ touchAction: "none" }}
      />
    </div>
  );
}

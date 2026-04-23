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
import {
  getNodeColors,
  getTagColor,
  getMediaColor,
  getThemeColors,
  getGlowColor,
  computeNodeRadius,
} from "./graph-utils";

interface GraphCanvasProps {
  data: GraphData;
  onNodeClick: (node: GraphNode | null) => void;
  onNodeHover: (
    node: GraphNode | null,
    cursorPos?: { x: number; y: number },
  ) => void;
  selectedNodeId?: string | null;
  isMobile?: boolean;
  onCenterNodeChange?: (node: GraphNode | null) => void;
  /** If set, this node is pinned at (0,0) so the viewport centers on it. */
  focalNodeId?: string;
  /**
   * When true, wheel events pass through to the page while the page is still
   * scrolling (momentum check). Zoom only activates once the page has been
   * at rest for ~250 ms. Use this for embedded/local graphs so they don't
   * hijack normal page scrolling.
   */
  embeddedMode?: boolean;
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
  focalNodeId,
  embeddedMode,
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
  const wasDraggingRef = useRef(false);
  const dragMovedRef = useRef(false);
  const dragStartClientRef = useRef({ x: 0, y: 0 });
  const needsRenderRef = useRef(true);
  const _gridCanvasRef = useRef<OffscreenCanvas | null>(null); // eslint-disable-line @typescript-eslint/no-unused-vars
  const _lastGridParamsRef = useRef({ tx: 0, ty: 0, k: 1, w: 0, h: 0 }); // eslint-disable-line @typescript-eslint/no-unused-vars

  const nodeRadiusMap = useRef<Map<string, number>>(new Map());
  const neighborMap = useRef<Map<string, Set<string>>>(new Map());
  const parentEdgesRef = useRef<Set<string>>(new Set()); // "source|target" keys for structural parent edges to media nodes
  // Progressive reveal: BFS wave index per node id, and the timestamp when reveal started
  const nodeWaveRef = useRef<Map<string, number>>(new Map());
  const maxWaveRef = useRef<number>(0);
  const revealStartRef = useRef<number>(0);
  // Off-screen context used to measure label widths once per unique label
  // at a 10px reference font. ctx.measureText() is a hot path in Firefox
  // and re-measuring every frame at simFontSize burns serious time.
  const measureCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const labelWidthCacheRef = useRef<Map<string, number>>(new Map());
  // Precomputed priority order for labels — avoids per-frame O(N log N)
  // sort + array allocation when no spotlight is active (true during the
  // entire initial reveal, which is where Firefox jitters most).
  const nodesByPriorityRef = useRef<SimulationNode[]>([]);
  // Reusable occupancy array for label anti-overlap; resetting length
  // each frame avoids a per-frame allocation and the GC pressure it
  // produces on Firefox.
  const occupiedBoxesRef = useRef<
    Array<{ x: number; y: number; w: number; h: number }>
  >([]);
  // id → SimulationNode lookup, replaces several O(N) .find() calls in
  // the render loop.
  const nodeByIdRef = useRef<Map<string, SimulationNode>>(new Map());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const zoomBehaviorRef = useRef<any>(null);
  const magnetDebounceRef = useRef<number>(0);
  const lastMagnetTimeRef = useRef<number>(0);
  const lastScrollTimeRef = useRef<number>(0);
  const dimensionsRef = useRef(dimensions);
  // Focus patch (mobile viewfinder): progress 0 = square/unlocked, 1 = circle/locked
  const focusProgressRef = useRef(0);
  const focusOffsetRef = useRef({ x: 0, y: 0 });

  // Keep dimensionsRef in sync
  useEffect(() => {
    dimensionsRef.current = dimensions;
  }, [dimensions]);

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

  // Off-screen canvas for cached text measurement (see labelWidthCacheRef).
  useEffect(() => {
    if (typeof document === "undefined") return;
    const c = document.createElement("canvas");
    const mctx = c.getContext("2d");
    if (mctx) {
      mctx.font = "10px sans-serif";
      measureCtxRef.current = mctx;
    }
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

    // BFS wave assignment from hub / focal node so nodes reveal center-out
    {
      const waveMap = new Map<string, number>();
      // Pick the starting seed: focal node, first hub, or first node
      const seed =
        focalNodeId ??
        data.nodes.find((n) => n.nodeType === "hub")?.id ??
        data.nodes[0]?.id;
      if (seed) {
        const queue: string[] = [seed];
        waveMap.set(seed, 0);
        while (queue.length) {
          const current = queue.shift()!;
          const currentWave = waveMap.get(current)!;
          for (const nbr of neighbors.get(current) ?? []) {
            if (!waveMap.has(nbr)) {
              waveMap.set(nbr, currentWave + 1);
              queue.push(nbr);
            }
          }
        }
        // Assign a high wave to any disconnected nodes
        const maxWave = Math.max(...waveMap.values(), 0);
        for (const n of data.nodes) {
          if (!waveMap.has(n.id)) waveMap.set(n.id, maxWave + 1);
        }
      }
      nodeWaveRef.current = waveMap;
      // Cache the final max wave so the render loop can skip per-node fade
      // math (and enter the batched fast path) once the reveal completes.
      maxWaveRef.current = Math.max(...waveMap.values(), 0);
      revealStartRef.current = performance.now();
      // Node set changed → dump the label width cache.
      labelWidthCacheRef.current.clear();
    }

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

    // Create simulation nodes — start clustered near origin so physics
    // expands them outward (Obsidian-style). Nodes fade in wave-by-wave
    // so the expansion feels deliberate, not chaotic.
    // If a focalNodeId is provided, pin that node at origin so the viewport
    // (and the mobile crosshair) lands on it at the initial fit-zoom.
    const simNodes: SimulationNode[] = data.nodes.map((n) => {
      const isFocal = focalNodeId && n.id === focalNodeId;
      // Small jitter around origin — physics will push them apart
      const jitter = 8;
      return {
        ...n,
        x: isFocal ? 0 : (Math.random() - 0.5) * jitter,
        y: isFocal ? 0 : (Math.random() - 0.5) * jitter,
        vx: 0,
        vy: 0,
        ...(isFocal ? { fx: 0, fy: 0 } : {}),
      };
    });

    const nodeMap = new Map(simNodes.map((n) => [n.id, n]));
    const simEdges: SimulationEdge[] = [];
    for (const e of data.edges) {
      const src = nodeMap.get(e.source);
      const tgt = nodeMap.get(e.target);
      if (src && tgt) {
        simEdges.push({
          source: src,
          target: tgt,
          weight: e.weight,
          linkType: e.linkType,
        });
      }
    }

    nodesRef.current = simNodes;
    edgesRef.current = simEdges;
    nodeByIdRef.current = nodeMap;
    // Precomputed baseline label ordering. When no hover/selection is
    // active, the render loop reuses this array directly — no allocation,
    // no sort. Spotlight frames still fall back to a full sort below.
    nodesByPriorityRef.current = simNodes
      .slice()
      .sort(
        (a, b) =>
          (LABEL_PRIORITY[b.nodeType] || 0) - (LABEL_PRIORITY[a.nodeType] || 0),
      );

    const sim = forceSimulation(simNodes)
      .force(
        "link",
        forceLink(simEdges)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- d3 generic inference loses our custom node/edge types
          .id((d: any) => d.id)
          .distance((d: SimulationEdge) => {
            if (d.linkType === "structural") return 10 + (1 - d.weight) * 15;
            if (d.linkType === "tag") return 30;
            return 20 + (1 - d.weight) * 45;
          })
          .strength((d: SimulationEdge) => {
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
      .alphaDecay(0.028)
      .alphaMin(0.001)
      .velocityDecay(0.3)
      .on("tick", () => {
        // Always request a render — nodes are fading in during early settling,
        // so we can't skip frames based on alpha alone.
        needsRenderRef.current = true;
      })
      .on("end", () => {
        needsRenderRef.current = true;
      });

    needsRenderRef.current = true;

    simulationRef.current = sim;
    return () => {
      sim.stop();
      simulationRef.current = null;
    };
  }, [data, dimensions.width, dimensions.height, focalNodeId]);

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

      // Build set of hovered-node neighbors for spotlight effect.
      // On mobile, also treat the crosshair center node as the "effective hover"
      // so its connections are highlighted even without an explicit tap.
      const mobileCenterNode =
        isMobile && centerNodeRef.current
          ? (nodeByIdRef.current.get(centerNodeRef.current) ?? null)
          : null;
      const effectiveHover = hovered ?? mobileCenterNode;
      const hoveredNeighbors = effectiveHover
        ? neighborMap.current.get(effectiveHover.id)
        : null;
      const hasHoverSpotlight = !!effectiveHover;

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

      // ─── Progressive reveal helpers ────────────────────────────────────
      const WAVE_DELAY = 300; // ms between each BFS wave
      const FADE_DURATION = 300; // ms to fade a wave from 0 → 1
      const elapsed = performance.now() - revealStartRef.current;
      // Once every wave has finished fading in, skip per-node fade math
      // entirely — this unlocks the batched edge-drawing fast path below
      // (the dominant win on Firefox).
      const revealDone =
        elapsed > maxWaveRef.current * WAVE_DELAY + FADE_DURATION;
      const getNodeFade = revealDone
        ? (_id: string) => 1
        : (id: string) => {
            const wave = nodeWaveRef.current.get(id) ?? 0;
            const revealTime = wave * WAVE_DELAY;
            return Math.min(
              1,
              Math.max(0, (elapsed - revealTime) / FADE_DURATION),
            );
          };

      // ─── Draw edges ─────────────────────────────────────────────────────
      // Batched into three passes (solid / dashed / highlighted). Firefox's
      // Canvas2D is extremely sensitive to per-edge state churn — especially
      // setLineDash() — so we collapse ~O(edges) stroke calls into at most 3
      // and issue setLineDash at most twice per frame.
      {
        const hoveredId = effectiveHover?.id;
        const selId = selectedNodeId;
        const isSpotlit = (e: SimulationEdge): boolean => {
          const sId = e.source.id;
          const tId = e.target.id;
          if (hoveredId && (sId === hoveredId || tId === hoveredId))
            return true;
          if (selId && (sId === selId || tId === selId)) return true;
          return false;
        };

        // Unified batched path — 3 strokes per frame regardless of reveal
        // state. The old `else` branch drew every visible edge as its own
        // beginPath/stroke because each edge carried a unique alpha from
        // per-node fade-in; Chrome's Skia absorbs that, Firefox/Zen can't,
        // and that was the ~3s desktop reveal jitter (mobile viewports
        // escaped simply by having ~5× fewer backing-buffer pixels). We
        // now cull edges during reveal until both endpoints are ≥50%
        // faded in — the BFS wave stagger hides the pop — and batch
        // everything else. Nodes still fade smoothly; only edges snap.
        const edgeHidden = revealDone
          ? (_e: SimulationEdge) => false
          : (e: SimulationEdge) =>
              getNodeFade(e.source.id) < 0.5 || getNodeFade(e.target.id) < 0.5;

        // Pass A: solid, non-highlighted
        ctx.beginPath();
        let hasSolid = false;
        for (let i = 0; i < edges.length; i++) {
          const e = edges[i];
          if (e.linkType === "semantic" || isSpotlit(e) || edgeHidden(e))
            continue;
          ctx.moveTo(e.source.x, e.source.y);
          ctx.lineTo(e.target.x, e.target.y);
          hasSolid = true;
        }
        if (hasSolid) {
          ctx.strokeStyle = theme.secondary;
          ctx.globalAlpha = 0.3;
          ctx.lineWidth = 0.6 / k;
          ctx.stroke();
        }

        // Pass B: dashed (semantic), non-highlighted
        ctx.beginPath();
        let hasDashed = false;
        for (let i = 0; i < edges.length; i++) {
          const e = edges[i];
          if (e.linkType !== "semantic" || isSpotlit(e) || edgeHidden(e))
            continue;
          ctx.moveTo(e.source.x, e.source.y);
          ctx.lineTo(e.target.x, e.target.y);
          hasDashed = true;
        }
        if (hasDashed) {
          const dashLen = 3 / k;
          ctx.setLineDash([dashLen, dashLen]);
          ctx.strokeStyle = theme.secondary;
          ctx.globalAlpha = 0.3;
          ctx.lineWidth = 0.6 / k;
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Pass C: spotlit (hovered or selected endpoint)
        if (hoveredId || selId) {
          ctx.beginPath();
          let hasHl = false;
          for (let i = 0; i < edges.length; i++) {
            const e = edges[i];
            if (!isSpotlit(e) || edgeHidden(e)) continue;
            ctx.moveTo(e.source.x, e.source.y);
            ctx.lineTo(e.target.x, e.target.y);
            hasHl = true;
          }
          if (hasHl) {
            ctx.strokeStyle = theme.foreground;
            ctx.globalAlpha = 0.9;
            ctx.lineWidth = 2.0 / k;
            ctx.stroke();
          }
        }
        ctx.globalAlpha = 1;
      }

      // ─── Draw nodes ─────────────────────────────────────────────────────
      for (const node of nodes) {
        const nodeFade = getNodeFade(node.id);
        if (nodeFade <= 0) continue;

        const baseR = nodeRadiusMap.current.get(node.id) || 1.5;
        // Ensure minimum screen-space radius so nodes remain visible
        const screenR = baseR * k;
        const minScreenR = 1.5;
        const r = screenR < minScreenR ? minScreenR / k : baseR;

        const isHovered = effectiveHover?.id === node.id;
        const isSelected = selectedNodeId === node.id;
        const isNeighborOfHover =
          effectiveHover && hoveredNeighbors?.has(node.id);
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
        let nodeAlpha = isHub ? 1 : isMedia ? 0.5 : isSection ? 0.28 : 0.85;
        if (hasHoverSpotlight) {
          if (isHovered || isSelected || isNeighborOfHover) {
            nodeAlpha = 1;
          } else {
            nodeAlpha = 0.5;
          }
        }
        // Apply progressive reveal fade
        nodeAlpha *= nodeFade;

        // Halo effect — concentric alpha-blended fills approximate a blur
        // at a tiny fraction of the cost of ctx.shadowBlur, which Firefox
        // implements on the CPU. With a hub node hovered, the old shadowed
        // fills scale as O(neighbors) per frame and were the primary
        // cause of Firefox/Zen stutter. We also drop ctx.save()/restore()
        // since there's no shadow state to isolate.
        if (isHovered || isSelected) {
          // Outer soft yellow halo (matches the old glowColor shadow)
          ctx.fillStyle = glowColor;
          ctx.beginPath();
          ctx.arc(node.x, node.y, r * 2.8, 0, Math.PI * 2);
          ctx.globalAlpha = 0.06 * nodeFade;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(node.x, node.y, r * 2.1, 0, Math.PI * 2);
          ctx.globalAlpha = 0.12 * nodeFade;
          ctx.fill();
          // Inner type-colored halo (matches the old shadowed circle fill)
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(node.x, node.y, r * 1.5, 0, Math.PI * 2);
          ctx.globalAlpha = 0.22 * nodeFade;
          ctx.fill();
        } else if (isNeighborOfHover) {
          // Single-step halo — neighbours can be numerous, keep it cheap.
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(node.x, node.y, r * 1.5, 0, Math.PI * 2);
          ctx.globalAlpha = 0.18 * nodeFade;
          ctx.fill();
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
      // Short-circuit: during the initial reveal the viewport sits below
      // every zoom threshold (hub=0.3 is the lowest) and there's no
      // spotlight yet, so every label would be alpha=0. Skipping here
      // avoids the per-frame sort AND the 500-node measure/overlap loop
      // below — the dominant render cost during settling on Firefox.
      const spotlightActive = !!effectiveHover || !!selectedNodeId;
      const anyLabelsCanShow = k >= 0.3 || spotlightActive;

      // Pick label ordering strategy:
      //  - nothing visible  → empty list (the per-node loop is a no-op)
      //  - spotlight active → full sort so hovered/selected/neighbors win
      //  - otherwise        → precomputed priority order (no allocation)
      let sortedNodes: SimulationNode[];
      if (!anyLabelsCanShow) {
        sortedNodes = [];
      } else if (spotlightActive) {
        sortedNodes = nodesByPriorityRef.current.slice().sort((a, b) => {
          const aHovered = effectiveHover?.id === a.id ? 100 : 0;
          const bHovered = effectiveHover?.id === b.id ? 100 : 0;
          const aSelected = selectedNodeId === a.id ? 90 : 0;
          const bSelected = selectedNodeId === b.id ? 90 : 0;
          const aNeighbor = hovered && hoveredNeighbors?.has(a.id) ? 80 : 0;
          const bNeighbor = hovered && hoveredNeighbors?.has(b.id) ? 80 : 0;
          const aPriority =
            aHovered +
            aSelected +
            aNeighbor +
            (LABEL_PRIORITY[a.nodeType] || 0);
          const bPriority =
            bHovered +
            bSelected +
            bNeighbor +
            (LABEL_PRIORITY[b.nodeType] || 0);
          return bPriority - aPriority;
        });
      } else {
        sortedNodes = nodesByPriorityRef.current;
      }

      // Reusable occupancy array — resetting length avoids the per-frame
      // allocation that was churning Firefox's GC.
      const occupiedBoxes = occupiedBoxesRef.current;
      occupiedBoxes.length = 0;

      function wouldOverlap(
        bx: number,
        by: number,
        bw: number,
        bh: number,
      ): boolean {
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

        const isHovered = effectiveHover?.id === node.id;
        const isSelected = selectedNodeId === node.id;
        const isNeighborOfHover =
          effectiveHover && hoveredNeighbors?.has(node.id);

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
            labelAlpha = Math.min(0.7, ((k - threshold) / 0.3) * 0.7);
            maxChars = node.nodeType === "file" ? 30 : 20;
          }
        }

        // Also gate labels on progressive reveal
        labelAlpha *= getNodeFade(node.id);
        if (labelAlpha <= 0) continue;

        // Section nodes: prefer heading over title to avoid showing post title
        const rawLabel =
          node.nodeType === "section" && node.heading
            ? node.heading
            : node.title;
        const label =
          rawLabel.length > maxChars
            ? rawLabel.slice(0, maxChars - 2) + "..."
            : rawLabel;

        // Label positioned ABOVE the node.
        // Cached at a fixed 10px reference size on an off-screen context so
        // we only pay measureText() once per unique label string instead of
        // every frame — measureText is a known hot path in Firefox.
        let refWidth = labelWidthCacheRef.current.get(label);
        if (refWidth === undefined) {
          const mctx = measureCtxRef.current;
          if (mctx) {
            refWidth = mctx.measureText(label).width; // font is 10px
          } else {
            // Fallback: measure with live ctx and rescale to reference.
            refWidth = ctx.measureText(label).width * (10 / simFontSize);
          }
          labelWidthCacheRef.current.set(label, refWidth);
        }
        const labelWidth = refWidth * (simFontSize / 10);
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
          if (
            wouldOverlap(screenLabelX, screenLabelY, screenLabelW, screenLabelH)
          ) {
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

      // ─── Mobile: Focus patch (viewfinder crosshair) ─────────────────────
      if (isMobile) {
        // Reset to CSS-pixel screen space (keep DPR scale)
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const cx = width / 2;
        const cy = height / 2;

        // Resolve locked node (if any)
        const lockedId = centerNodeRef.current;
        const lockedNode = lockedId
          ? (nodeByIdRef.current.get(lockedId) ?? null)
          : null;

        // Animate lock progress (0 → 1 when locked, 1 → 0 when unlocked)
        const target = lockedNode ? 1 : 0;
        const prevProgress = focusProgressRef.current;
        const nextProgress = prevProgress + (target - prevProgress) * 0.18;
        if (Math.abs(target - prevProgress) > 0.002) {
          focusProgressRef.current = nextProgress;
          needsRenderRef.current = true;
        } else {
          focusProgressRef.current = target;
        }
        const progress = focusProgressRef.current;

        // Containment box — patch can drift within ±BOX_HALF px of screen centre,
        // scaled down so it magnets toward centre rather than fully tracking the node.
        const BOX_HALF = 20;
        const DRIFT_SCALE = 0.5;
        let targetDx = 0;
        let targetDy = 0;
        if (lockedNode) {
          const nsx = lockedNode.x * k + tx;
          const nsy = lockedNode.y * k + ty;
          const rawDx = nsx - cx;
          const rawDy = nsy - cy;
          targetDx =
            Math.max(-BOX_HALF, Math.min(BOX_HALF, rawDx)) * DRIFT_SCALE;
          targetDy =
            Math.max(-BOX_HALF, Math.min(BOX_HALF, rawDy)) * DRIFT_SCALE;
        }

        // Smooth offset (also magnets back to 0,0 when unlocked)
        const off = focusOffsetRef.current;
        off.x += (targetDx - off.x) * 0.2;
        off.y += (targetDy - off.y) * 0.2;
        if (
          Math.abs(targetDx - off.x) > 0.1 ||
          Math.abs(targetDy - off.y) > 0.1
        ) {
          needsRenderRef.current = true;
        }

        const px = cx + off.x;
        const py = cy + off.y;

        // Size interpolation: square half-size → circle radius matching locked node
        const squareHalf = 9;
        const nodeScreenR = lockedNode
          ? (nodeRadiusMap.current.get(lockedNode.id) || 1.5) * k
          : 0;
        const circleR = Math.max(nodeScreenR + 8, 14);
        const size = squareHalf + (circleR - squareHalf) * progress;

        // Colour: secondary (unlocked) → foreground/primary (locked)
        const theme = themeColorsRef.current;
        const strokeColor = progress > 0.5 ? theme.foreground : theme.secondary;

        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.5;
        ctx.lineCap = "round";
        ctx.globalAlpha = 0.7 + 0.3 * progress;
        // Always dashed as per design preference
        const dashLen = 4;
        ctx.setLineDash([dashLen, dashLen]);

        // Morphing square → rounded-rect → circle
        ctx.beginPath();
        if (progress < 0.02) {
          ctx.rect(px - size, py - size, size * 2, size * 2);
        } else if (progress > 0.98) {
          ctx.arc(px, py, size, 0, Math.PI * 2);
        } else {
          const r = Math.min(size * progress, size);
          const x0 = px - size;
          const y0 = py - size;
          const s = size * 2;
          ctx.moveTo(x0 + r, y0);
          ctx.lineTo(x0 + s - r, y0);
          ctx.arcTo(x0 + s, y0, x0 + s, y0 + r, r);
          ctx.lineTo(x0 + s, y0 + s - r);
          ctx.arcTo(x0 + s, y0 + s, x0 + s - r, y0 + s, r);
          ctx.lineTo(x0 + r, y0 + s);
          ctx.arcTo(x0, y0 + s, x0, y0 + s - r, r);
          ctx.lineTo(x0, y0 + r);
          ctx.arcTo(x0, y0, x0 + r, y0, r);
          ctx.closePath();
        }
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;

        // ── Label drawn on top of the crosshair ─────────────────────────
        const labelTarget =
          lockedNode ??
          (centerNodeRef.current
            ? (nodeByIdRef.current.get(centerNodeRef.current) ?? null)
            : null);
        if (labelTarget) {
          // Re-enter simulation space so coordinates align with the node
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.translate(tx, ty);
          ctx.scale(k, k);

          const baseR2 = nodeRadiusMap.current.get(labelTarget.id) || 1.5;
          const r2 = baseR2 * k < 1.5 ? 1.5 / k : baseR2;

          const fSize = 12 / k;
          const padH = 3 / k;
          const padV = 1.5 / k;

          ctx.font = `${fSize}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "bottom";

          const raw =
            labelTarget.nodeType === "section" && labelTarget.heading
              ? labelTarget.heading
              : labelTarget.title;
          const lbl = raw.length > 30 ? raw.slice(0, 28) + "…" : raw;

          const lw = ctx.measureText(lbl).width;
          const ly = labelTarget.y - r2 - 2 / k;

          ctx.fillStyle = themeColorsRef.current.card;
          ctx.globalAlpha = 0.9;
          ctx.fillRect(
            labelTarget.x - lw / 2 - padH,
            ly - fSize - padV,
            lw + padH * 2,
            fSize + padV * 2,
          );

          ctx.fillStyle = themeColorsRef.current.foreground;
          ctx.globalAlpha = 1;
          ctx.fillText(lbl, labelTarget.x, ly);
          ctx.globalAlpha = 1;
        }
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);

      // ─── Mobile: find closest node to screen center ───────────────────
      if (isMobile && onCenterNodeChange) {
        const centerSimX = (width / 2 - tx) / k;
        const centerSimY = (height / 2 - ty) / k;
        let closest: SimulationNode | null = null;
        let closestDistSq = Infinity;
        for (const node of nodes) {
          const dx = node.x - centerSimX;
          const dy = node.y - centerSimY;
          const distSq = dx * dx + dy * dy;
          if (distSq < closestDistSq) {
            closest = node;
            closestDistSq = distSq;
          }
        }

        // Screen-space focus threshold: 30px regardless of zoom level.
        // Converting to sim-space: threshold_sim = threshold_px / k
        const FOCUS_THRESHOLD_PX = 30;
        const focusThresholdSim = FOCUS_THRESHOLD_PX / k;
        const closestDist = Math.sqrt(closestDistSq);
        const currentCenterId = centerNodeRef.current;

        if (closest && closestDist < focusThresholdSim) {
          // Focus on the nearest node if it changed
          if (closest.id !== currentCenterId) {
            centerNodeRef.current = closest.id;
            // If a node was previously tapped/focused, unfocus it when the
            // crosshair locks onto a different node.
            if (hoveredRef.current && hoveredRef.current.id !== closest.id) {
              hoveredRef.current = null;
              onNodeHover(null);
            }
            onCenterNodeChange(closest);
            needsRenderRef.current = true;
          }
        } else if (currentCenterId) {
          // No node is close enough — defocus the crosshair
          centerNodeRef.current = null;
          onCenterNodeChange(null);
          needsRenderRef.current = true;
        }
      }
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [dimensions, selectedNodeId, onCenterNodeChange, isMobile]);

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
        const dx = e.clientX - dragStartClientRef.current.x;
        const dy = e.clientY - dragStartClientRef.current.y;
        if (!dragMovedRef.current && Math.sqrt(dx * dx + dy * dy) > 4) {
          dragMovedRef.current = true;
        }
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
      wasDraggingRef.current = false;
      dragMovedRef.current = false;
      const node = findNodeAtPoint(e.clientX, e.clientY);
      if (node) {
        isDraggingRef.current = true;
        dragNodeRef.current = node;
        dragStartClientRef.current = { x: e.clientX, y: e.clientY };
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
        // Only suppress the subsequent click if the pointer genuinely moved
        wasDraggingRef.current = dragMovedRef.current;
        isDraggingRef.current = false;
        dragMovedRef.current = false;
        dragNodeRef.current = null;
        canvas.releasePointerCapture(e.pointerId);
        return;
      }
    };
    const handleClick = (e: MouseEvent) => {
      if (wasDraggingRef.current) {
        wasDraggingRef.current = false;
        return;
      }
      const node = findNodeAtPoint(e.clientX, e.clientY);
      if (isMobile) {
        if (node) {
          // On mobile, tap selects the node (shows in bottom card) instead of navigating
          hoveredRef.current = node;
          needsRenderRef.current = true;
          onNodeHover(node, { x: e.clientX, y: e.clientY });

          // Snap the tapped node to the viewport center
          if (zoomBehaviorRef.current) {
            const { k } = transformRef.current;
            const { width, height } = dimensionsRef.current;
            const targetTransform = zoomIdentity
              .translate(width / 2, height / 2)
              .scale(k)
              .translate(-node.x, -node.y);
            select(canvas)
              .transition()
              .duration(350)
              .ease((t) => t * (2 - t)) // ease-out quad
              .call(zoomBehaviorRef.current.transform as any, targetTransform); // eslint-disable-line @typescript-eslint/no-explicit-any
          }
        } else {
          // Tap on empty area defocuses
          hoveredRef.current = null;
          centerNodeRef.current = null;
          needsRenderRef.current = true;
          onNodeHover(null);
          onCenterNodeChange?.(null);
        }
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
  }, [
    findNodeAtPoint,
    onNodeClick,
    onNodeHover,
    onCenterNodeChange,
    screenToSim,
    isMobile,
  ]);

  // Zoom — d3-zoom with center offset baked into the initial transform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !dimensions.width) return;

    const { width, height } = dimensions;

    // In embedded mode, track window scroll to implement momentum passthrough
    let cleanupScrollListener: (() => void) | undefined;
    if (embeddedMode) {
      const onWindowScroll = () => {
        lastScrollTimeRef.current = Date.now();
      };
      window.addEventListener("scroll", onWindowScroll, { passive: true });
      cleanupScrollListener = () =>
        window.removeEventListener("scroll", onWindowScroll);
    }

    const zoomBehavior = d3Zoom<HTMLCanvasElement, unknown>()
      .scaleExtent([0.05, 5])
      .filter((event) => {
        if (event.type === "wheel") {
          // Embedded mode: pass wheel events through while the page is mid-scroll
          // so the canvas doesn't hijack normal page scrolling.
          if (embeddedMode && Date.now() - lastScrollTimeRef.current < 250) {
            return false;
          }
          return true;
        }
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

        // Mobile magnet effect: after user stops panning, gently pull nearest node to center
        if (isMobile && onCenterNodeChange) {
          clearTimeout(magnetDebounceRef.current);
          magnetDebounceRef.current = window.setTimeout(() => {
            const now = Date.now();
            // Throttle magnet animations to avoid jitter
            if (now - lastMagnetTimeRef.current < 300) return;
            lastMagnetTimeRef.current = now;

            const nodes = nodesRef.current;
            const { x: tx, y: ty, k } = transformRef.current;
            const centerSimX = (width / 2 - tx) / k;
            const centerSimY = (height / 2 - ty) / k;

            // Find closest node to center
            let closest: SimulationNode | null = null;
            let closestDist = Infinity;
            const magnetRadius = 80 / k; // Only magnet if within this sim-space radius

            for (const node of nodes) {
              const dx = node.x - centerSimX;
              const dy = node.y - centerSimY;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < closestDist && dist < magnetRadius) {
                closest = node;
                closestDist = dist;
              }
            }

            if (closest && closestDist > 5 / k) {
              // Animate pan to center the closest node
              const targetTransform = zoomIdentity
                .translate(width / 2, height / 2)
                .scale(k)
                .translate(-closest.x, -closest.y);

              select(canvas)
                .transition()
                .duration(200)
                .ease((t) => t * (2 - t)) // ease-out quad
                .call(zoomBehavior.transform as any, targetTransform); // eslint-disable-line @typescript-eslint/no-explicit-any
            }
          }, 250);
        }
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
      cleanupScrollListener?.();
    };
  }, [dimensions.width, dimensions.height]); // eslint-disable-line react-hooks/exhaustive-deps

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

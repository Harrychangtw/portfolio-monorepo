"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
} from "d3-force";
import { zoom as d3Zoom, zoomIdentity } from "d3-zoom";
import { select } from "d3-selection";
import type {
  GraphData,
  GraphNode,
  SimulationNode,
  SimulationEdge,
  SourceType,
} from "./types";

interface GraphCanvasProps {
  data: GraphData;
  onNodeClick: (node: GraphNode | null) => void;
  onNodeHover: (node: GraphNode | null) => void;
  selectedNodeId?: string | null;
}

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

function getThemeColors() {
  const style = getComputedStyle(document.documentElement);
  const bg = style.getPropertyValue("--background").trim();
  const fg = style.getPropertyValue("--foreground").trim();
  const edge = style.getPropertyValue("--graph-edge").trim();
  return {
    background: bg ? `hsl(${bg})` : "#0a0a0a",
    foreground: fg ? `hsl(${fg})` : "#ffffff",
    edge: edge ? `hsl(${edge})` : "#333",
  };
}

function getGlowColor(): string {
  const style = getComputedStyle(document.documentElement);
  const accent = style.getPropertyValue("--accent").trim();
  return accent ? `hsl(${accent})` : "#eaff4b";
}

export default function GraphCanvas({
  data,
  onNodeClick,
  onNodeHover,
  selectedNodeId,
}: GraphCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const simulationRef = useRef<any>(null);
  const nodesRef = useRef<SimulationNode[]>([]);
  const edgesRef = useRef<SimulationEdge[]>([]);
  // d3-zoom transform: x,y include the center offset so zoom-to-point works correctly
  const transformRef = useRef({ x: 0, y: 0, k: 1 });
  const hoveredRef = useRef<SimulationNode | null>(null);
  const nodeColorsRef = useRef<Record<SourceType, string>>(
    {} as Record<SourceType, string>,
  );
  const themeColorsRef = useRef(getThemeColors());
  const glowColorRef = useRef("#eaff4b");
  const animFrameRef = useRef<number>(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const dragNodeRef = useRef<SimulationNode | null>(null);
  const isDraggingRef = useRef(false);
  const needsRenderRef = useRef(true);

  // Connection count -> node radius
  const nodeRadiusMap = useRef<Map<string, number>>(new Map());
  // Precomputed neighbor sets for hover highlighting
  const neighborMap = useRef<Map<string, Set<string>>>(new Map());

  // Initialize colors
  useEffect(() => {
    nodeColorsRef.current = getNodeColors();
    themeColorsRef.current = getThemeColors();
    glowColorRef.current = getGlowColor();

    const observer = new MutationObserver(() => {
      nodeColorsRef.current = getNodeColors();
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

    const maxConnections = Math.max(...connectionCount.values(), 1);
    for (const [id, count] of connectionCount) {
      const r = 3 + (count / maxConnections) * 5;
      nodeRadiusMap.current.set(id, r);
    }

    // Create simulation nodes — spread them out initially
    const simNodes: SimulationNode[] = data.nodes.map((n, i) => {
      const angle = (i / data.nodes.length) * Math.PI * 2;
      const spread = Math.sqrt(data.nodes.length) * 12;
      return {
        ...n,
        x: Math.cos(angle) * spread + (Math.random() - 0.5) * spread * 0.5,
        y: Math.sin(angle) * spread + (Math.random() - 0.5) * spread * 0.5,
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
        simEdges.push({ source: src, target: tgt, weight: e.weight });
      }
    }

    nodesRef.current = simNodes;
    edgesRef.current = simEdges;

    const sim = forceSimulation(simNodes)
      .force(
        "link",
        forceLink(simEdges)
          .id((d: any) => d.id)
          .distance((d: any) => 40 + (1 - d.weight) * 80)
          .strength((d: any) => d.weight * 0.4),
      )
      .force("charge", forceManyBody().strength(-80).distanceMax(300))
      .force("center", forceCenter(0, 0).strength(0.05))
      .force(
        "collide",
        forceCollide<SimulationNode>()
          .radius((d) => (nodeRadiusMap.current.get(d.id) || 4) + 3)
          .strength(0.7),
      )
      .alphaDecay(0.028)
      .alphaMin(0.001)
      .velocityDecay(0.4)
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
      // d3-zoom transform already includes the center offset (initialized with translate(w/2,h/2))
      // so screen-to-sim is: simX = (screenX - tx) / k
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
      const hovered = hoveredRef.current;
      const glowColor = glowColorRef.current;

      // Build set of hovered-node neighbors for spotlight effect
      const hoveredNeighbors = hovered
        ? neighborMap.current.get(hovered.id)
        : null;
      const hasHoverSpotlight = !!hovered;

      // Reset transform and clear
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // Apply zoom transform — tx,ty already include center offset from d3-zoom init
      ctx.translate(tx, ty);
      ctx.scale(k, k);

      // Draw edges
      for (const edge of edges) {
        const src = edge.source;
        const tgt = edge.target;
        const isConnectedToHover =
          hovered && (src.id === hovered.id || tgt.id === hovered.id);
        const isConnectedToSelected =
          selectedNodeId &&
          (src.id === selectedNodeId || tgt.id === selectedNodeId);

        ctx.beginPath();
        ctx.moveTo(src.x, src.y);
        ctx.lineTo(tgt.x, tgt.y);

        if (isConnectedToHover || isConnectedToSelected) {
          ctx.strokeStyle = glowColor;
          ctx.globalAlpha = 0.9;
          ctx.lineWidth = 1.8 / k;
        } else if (hasHoverSpotlight) {
          // Dim non-connected edges during hover
          ctx.strokeStyle = theme.edge;
          ctx.globalAlpha = 0.03;
          ctx.lineWidth = 0.5 / k;
        } else {
          // Default edges — subtle so the graph doesn't look like a mesh
          ctx.globalAlpha = 0.12 + edge.weight * 0.2;                                                                                   
          ctx.lineWidth = (0.5 + edge.weight * 0.8) / k;  
          ctx.lineWidth = 0.5 / k;
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // Draw nodes
      for (const node of nodes) {
        const baseR = nodeRadiusMap.current.get(node.id) || 4;
        // Ensure minimum screen-space radius so nodes are always visible when zoomed out
        const screenR = baseR * k;
        const minScreenR = 2.5;
        const r = screenR < minScreenR ? minScreenR / k : baseR;

        const isHovered = hovered?.id === node.id;
        const isSelected = selectedNodeId === node.id;
        const isNeighborOfHover =
          hovered && hoveredNeighbors?.has(node.id);
        const color = nodeColors[node.sourceType] || "#888";

        // Determine node opacity based on hover spotlight
        let nodeAlpha = 0.85;
        if (hasHoverSpotlight) {
          if (isHovered || isSelected || isNeighborOfHover) {
            nodeAlpha = 1;
          } else {
            nodeAlpha = 0.15;
          }
        }

        // Glow effect for hovered/selected/neighbor
        if (isHovered || isSelected) {
          ctx.save();
          ctx.shadowColor = glowColor;
          ctx.shadowBlur = 16 / k;
          ctx.beginPath();
          ctx.arc(node.x, node.y, r * 1.8, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.globalAlpha = 0.25;
          ctx.fill();
          ctx.restore();
        } else if (isNeighborOfHover) {
          ctx.save();
          ctx.shadowColor = color;
          ctx.shadowBlur = 8 / k;
          ctx.beginPath();
          ctx.arc(node.x, node.y, r * 1.3, 0, Math.PI * 2);
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

        // Node border for hovered/selected
        if (isHovered || isSelected) {
          ctx.strokeStyle = glowColor;
          ctx.lineWidth = 1.5 / k;
          ctx.globalAlpha = 1;
          ctx.stroke();
        }

        ctx.globalAlpha = 1;
      }

      // Draw labels (separate pass so they're always on top)
      for (const node of nodes) {
        const baseR = nodeRadiusMap.current.get(node.id) || 4;
        const screenR = baseR * k;
        const minScreenR = 2.5;
        const r = screenR < minScreenR ? minScreenR / k : baseR;

        const isHovered = hovered?.id === node.id;
        const isSelected = selectedNodeId === node.id;
        const isNeighborOfHover =
          hovered && hoveredNeighbors?.has(node.id);

        // Label visibility
        let labelAlpha: number;
        let maxChars: number;

        if (isHovered || isSelected) {
          labelAlpha = 1;
          maxChars = 50;
        } else if (isNeighborOfHover) {
          labelAlpha = 0.8;
          maxChars = 30;
        } else if (hasHoverSpotlight) {
          // Dim labels during hover spotlight
          labelAlpha = 0;
          maxChars = 0;
        } else {
          // Normal state: labels hidden until zoomed in past threshold
          // Fade in between k=1.2 and k=2.0
          if (k < 1.2) {
            labelAlpha = 0;
            maxChars = 0;
          } else {
            labelAlpha = Math.min(0.7, (k - 1.2) * 0.9);
            maxChars = k > 2 ? 35 : 20;
          }
        }

        if (labelAlpha <= 0) continue;

        const fontSize = Math.max(9, Math.min(12, 10 / k));
        ctx.font = `${fontSize}px sans-serif`;
        ctx.fillStyle = themeColorsRef.current.foreground;
        ctx.globalAlpha = labelAlpha;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";

        const label =
          node.title.length > maxChars
            ? node.title.slice(0, maxChars - 2) + "..."
            : node.title;
        ctx.fillText(label, node.x, node.y + r + 2 / k);
      }

      ctx.globalAlpha = 1;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [dimensions, selectedNodeId]);

  // Hit testing
  const findNodeAtPoint = useCallback(
    (clientX: number, clientY: number): SimulationNode | null => {
      const { sx: mx, sy: my } = screenToSim(clientX, clientY);
      const k = transformRef.current.k;

      let closest: SimulationNode | null = null;
      let closestDist = Infinity;

      for (const node of nodesRef.current) {
        const baseR = nodeRadiusMap.current.get(node.id) || 4;
        const hitRadius = Math.max(baseR, 12 / k);
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
        simulationRef.current?.alpha(0.05).restart();
        return;
      }

      const node = findNodeAtPoint(e.clientX, e.clientY);
      if (hoveredRef.current?.id !== node?.id) {
        hoveredRef.current = node;
        needsRenderRef.current = true;
        canvas.style.cursor = node ? "pointer" : "grab";
        onNodeHover(node);
      }
    };

    const handleDown = (e: PointerEvent) => {
      const node = findNodeAtPoint(e.clientX, e.clientY);
      if (node) {
        isDraggingRef.current = true;
        dragNodeRef.current = node;
        const { sx, sy } = screenToSim(e.clientX, e.clientY);
        node.fx = sx;
        node.fy = sy;
        simulationRef.current?.alphaTarget(0.05).restart();
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
  }, [findNodeAtPoint, onNodeClick, onNodeHover, screenToSim]);

  // Zoom — d3-zoom with center offset baked into the initial transform
  // This ensures zoom-to-point (scroll wheel) zooms toward the cursor position
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !dimensions.width) return;

    const { width, height } = dimensions;

    const zoomBehavior = d3Zoom<HTMLCanvasElement, unknown>()
      .scaleExtent([0.05, 5])
      .filter((event) => {
        // Allow wheel zoom always; pan only when not dragging a node
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

    const selection = select(canvas);
    selection.call(zoomBehavior as any);

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
      const padding = 80;
      const kx = (width - padding * 2) / graphW;
      const ky = (height - padding * 2) / graphH;
      initialK = Math.min(kx, ky, 1.5);
      initialK = Math.max(initialK, 0.1);
    }

    // Bake width/2, height/2 into the initial translate so d3-zoom knows the true center.
    // This makes zoom-to-point (wheel) work correctly relative to cursor position.
    selection.call(
      zoomBehavior.transform as any,
      zoomIdentity.translate(width / 2, height / 2).scale(initialK),
    );

    return () => {
      selection.on(".zoom", null);
    };
  }, [dimensions.width, dimensions.height]);

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

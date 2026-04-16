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
  const border = style.getPropertyValue("--border").trim();
  return {
    background: bg ? `hsl(${bg})` : "#0a0a0a",
    foreground: fg ? `hsl(${fg})` : "#ffffff",
    edge: edge ? `hsl(${edge})` : "#333",
    border: border ? `hsl(${border})` : "#262626",
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

  // Compute node radius based on connection count
  const nodeRadiusMap = useRef<Map<string, number>>(new Map());

  // Initialize colors
  useEffect(() => {
    nodeColorsRef.current = getNodeColors();
    themeColorsRef.current = getThemeColors();
    glowColorRef.current = getGlowColor();

    // Watch for theme changes
    const observer = new MutationObserver(() => {
      nodeColorsRef.current = getNodeColors();
      themeColorsRef.current = getThemeColors();
      glowColorRef.current = getGlowColor();
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
    for (const node of data.nodes) {
      connectionCount.set(node.id, 0);
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
    }

    const maxConnections = Math.max(...connectionCount.values(), 1);
    for (const [id, count] of connectionCount) {
      const r = 4 + (count / maxConnections) * 8;
      nodeRadiusMap.current.set(id, r);
    }

    // Create simulation nodes
    const simNodes: SimulationNode[] = data.nodes.map((n) => ({
      ...n,
      x: (Math.random() - 0.5) * dimensions.width * 0.6,
      y: (Math.random() - 0.5) * dimensions.height * 0.6,
      vx: 0,
      vy: 0,
    }));

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
          .distance((d: any) => 80 + (1 - d.weight) * 120)
          .strength((d: any) => d.weight * 0.3),
      )
      .force("charge", forceManyBody().strength(-200).distanceMax(400))
      .force("center", forceCenter(0, 0))
      .force(
        "collide",
        forceCollide<SimulationNode>()
          .radius((d) => (nodeRadiusMap.current.get(d.id) || 6) + 2)
          .strength(0.7),
      )
      .alphaDecay(0.02)
      .velocityDecay(0.3);

    simulationRef.current = sim;

    return () => {
      sim.stop();
      simulationRef.current = null;
    };
  }, [data, dimensions.width, dimensions.height]);

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
    ctx.scale(dpr, dpr);

    const render = () => {
      const { width, height } = dimensions;
      const { x: tx, y: ty, k } = transformRef.current;
      const nodes = nodesRef.current;
      const edges = edgesRef.current;
      const theme = themeColorsRef.current;
      const nodeColors = nodeColorsRef.current;
      const hovered = hoveredRef.current;
      const glowColor = glowColorRef.current;

      ctx.save();
      ctx.clearRect(0, 0, width, height);

      // Apply zoom transform
      ctx.translate(tx + width / 2, ty + height / 2);
      ctx.scale(k, k);

      // Draw edges
      for (const edge of edges) {
        const src = edge.source;
        const tgt = edge.target;
        const isHighlighted =
          hovered && (src.id === hovered.id || tgt.id === hovered.id);
        const isSelected =
          selectedNodeId &&
          (src.id === selectedNodeId || tgt.id === selectedNodeId);

        ctx.beginPath();
        ctx.moveTo(src.x, src.y);
        ctx.lineTo(tgt.x, tgt.y);
        ctx.strokeStyle = isHighlighted || isSelected ? glowColor : theme.edge;
        ctx.globalAlpha =
          isHighlighted || isSelected ? 0.6 : 0.08 + edge.weight * 0.15;
        ctx.lineWidth = isHighlighted || isSelected ? 1.5 / k : 0.5 / k;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // Draw nodes
      for (const node of nodes) {
        const r = (nodeRadiusMap.current.get(node.id) || 6) / k;
        const actualR = r * k; // actual radius in screen space
        const isHovered = hovered?.id === node.id;
        const isSelected = selectedNodeId === node.id;
        const color = nodeColors[node.sourceType] || "#888";

        // Glow effect for hovered/selected
        if (isHovered || isSelected) {
          ctx.save();
          ctx.shadowColor = glowColor;
          ctx.shadowBlur = 20 / k;
          ctx.beginPath();
          ctx.arc(node.x, node.y, r * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.globalAlpha = 0.3;
          ctx.fill();
          ctx.restore();
        }

        // Node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = isHovered || isSelected ? 1 : 0.8;
        ctx.fill();
        ctx.globalAlpha = 1;

        // Node border
        if (isHovered || isSelected) {
          ctx.strokeStyle = glowColor;
          ctx.lineWidth = 1.5 / k;
          ctx.stroke();
        }

        // Label (only show when zoomed in enough or for hovered/selected)
        if (k > 0.8 || isHovered || isSelected) {
          const fontSize = Math.max(10, 11 / k);
          ctx.font = `${fontSize}px var(--font-body, sans-serif)`;
          ctx.fillStyle = theme.foreground;
          ctx.globalAlpha =
            isHovered || isSelected ? 1 : Math.min(1, (k - 0.6) * 2);
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          const label =
            node.title.length > 30
              ? node.title.slice(0, 28) + "..."
              : node.title;
          ctx.fillText(label, node.x, node.y + r + 3 / k);
          ctx.globalAlpha = 1;
        }
      }

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [dimensions, selectedNodeId]);

  // Hit testing
  const findNodeAtPoint = useCallback(
    (clientX: number, clientY: number): SimulationNode | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const rect = canvas.getBoundingClientRect();
      const { x: tx, y: ty, k } = transformRef.current;
      const { width, height } = dimensions;

      // Convert screen coords to simulation coords
      const mx = (clientX - rect.left - tx - width / 2) / k;
      const my = (clientY - rect.top - ty - height / 2) / k;

      let closest: SimulationNode | null = null;
      let closestDist = Infinity;

      for (const node of nodesRef.current) {
        const r = (nodeRadiusMap.current.get(node.id) || 6) / k;
        const hitRadius = Math.max(r, 8 / k); // minimum hit target
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
    [dimensions],
  );

  // Pointer events
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMove = (e: PointerEvent) => {
      if (isDraggingRef.current && dragNodeRef.current) {
        const { x: tx, y: ty, k } = transformRef.current;
        const rect = canvas.getBoundingClientRect();
        const { width, height } = dimensions;
        const mx = (e.clientX - rect.left - tx - width / 2) / k;
        const my = (e.clientY - rect.top - ty - height / 2) / k;
        dragNodeRef.current.fx = mx;
        dragNodeRef.current.fy = my;
        simulationRef.current?.alpha(0.3).restart();
        return;
      }

      const node = findNodeAtPoint(e.clientX, e.clientY);
      if (hoveredRef.current?.id !== node?.id) {
        hoveredRef.current = node;
        canvas.style.cursor = node ? "pointer" : "grab";
        onNodeHover(node);
      }
    };

    const handleDown = (e: PointerEvent) => {
      const node = findNodeAtPoint(e.clientX, e.clientY);
      if (node) {
        isDraggingRef.current = true;
        dragNodeRef.current = node;
        const { x: tx, y: ty, k } = transformRef.current;
        const rect = canvas.getBoundingClientRect();
        const { width, height } = dimensions;
        node.fx = (e.clientX - rect.left - tx - width / 2) / k;
        node.fy = (e.clientY - rect.top - ty - height / 2) / k;
        simulationRef.current?.alphaTarget(0.3).restart();
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
  }, [findNodeAtPoint, onNodeClick, onNodeHover, dimensions]);

  // Zoom
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !dimensions.width) return;

    const zoomBehavior = d3Zoom<HTMLCanvasElement, unknown>()
      .scaleExtent([0.1, 5])
      .on("zoom", (event) => {
        transformRef.current = {
          x: event.transform.x,
          y: event.transform.y,
          k: event.transform.k,
        };
      });

    const selection = select(canvas);
    selection.call(zoomBehavior as any);

    // Initial zoom to fit
    const initialK = 0.7;
    selection.call(
      zoomBehavior.transform as any,
      zoomIdentity.translate(0, 0).scale(initialK),
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

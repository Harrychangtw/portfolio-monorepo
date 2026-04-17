import type { GraphNode, NodeType, SourceType } from "./types";

/* ─── Color helpers ────────────────────────────────────────────────────────── */

export const SOURCE_TYPE_CSS_VAR: Record<SourceType, string> = {
  post: "--graph-node-post",
  project: "--graph-node-project",
  gallery: "--graph-node-gallery",
  locale: "--graph-node-locale",
};

export function getNodeColors(): Record<SourceType, string> {
  const style = getComputedStyle(document.documentElement);
  const colors: Partial<Record<SourceType, string>> = {};
  for (const [type, cssVar] of Object.entries(SOURCE_TYPE_CSS_VAR)) {
    const hsl = style.getPropertyValue(cssVar).trim();
    colors[type as SourceType] = hsl ? `hsl(${hsl})` : "#888";
  }
  return colors as Record<SourceType, string>;
}

export function getTagColor(): string {
  const style = getComputedStyle(document.documentElement);
  const hsl = style.getPropertyValue("--graph-node-tag").trim();
  return hsl ? `hsl(${hsl})` : "#3d9970";
}

export function getMediaColor(): string {
  const style = getComputedStyle(document.documentElement);
  const secondary = style.getPropertyValue("--secondary").trim();
  return secondary ? `hsl(${secondary})` : "#888";
}

export function getThemeColors() {
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

export function getGlowColor(): string {
  const style = getComputedStyle(document.documentElement);
  const fg = style.getPropertyValue("--foreground").trim();
  return fg ? `hsl(${fg})` : "#ffffff";
}

/* ─── Node radius by type (minimal aesthetic) ──────────────────────────────── */

export const NODE_TYPE_BASE_RADIUS: Record<NodeType, number> = {
  file: 3.0,
  section: 1.8,
  image: 1.0,
  video: 1.2,
  tag: 2.0,
  hub: 5.0,
};

export const NODE_TYPE_MAX_BONUS: Record<NodeType, number> = {
  file: 1.0,
  section: 0.8,
  image: 0,
  video: 0,
  tag: 0.5,
  hub: 0,
};

/** Primary hub slugs get the full hub radius; secondary hubs are smaller */
export const PRIMARY_HUB_SLUGS = new Set([
  "root",
  "post",
  "project",
  "gallery",
]);

export function computeNodeRadius(
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
  const bonus =
    maxConnections > 0 ? (connectionCount / maxConnections) * maxBonus : 0;
  return base + bonus;
}

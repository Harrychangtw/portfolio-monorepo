import type { GraphData, GraphNode, GraphEdge, NodeType } from "./types";

interface SubgraphOptions {
  currentSlug: string;
  sourceType: "post" | "project" | "gallery";
  locale: "en" | "zh-TW";
  maxNodes?: number;
}

const EXCLUDED_TYPES: Set<NodeType> = new Set(["image", "video", "hub"]);

/** Overview mode: returns all file + tag nodes and their edges (for homepage) */
export function extractOverviewGraph(
  data: GraphData,
  locale: "en" | "zh-TW",
): { nodes: GraphNode[]; edges: GraphEdge[] } | null {
  const nodes = data.nodes.filter(
    (n) =>
      (n.nodeType === "file" || n.nodeType === "tag") &&
      (n.nodeType === "tag" || n.locale === locale),
  );
  if (nodes.length < 2) return null;

  const nodeIds = new Set(nodes.map((n) => n.id));
  const edges = data.edges.filter(
    (e) => nodeIds.has(e.source) && nodeIds.has(e.target),
  );

  return { nodes, edges };
}

export function extractSubgraph(
  data: GraphData,
  options: SubgraphOptions,
): { nodes: GraphNode[]; edges: GraphEdge[]; focalNodeId: string } | null {
  const { currentSlug, sourceType, locale, maxNodes = 30 } = options;

  // Find the focal node
  const focalNode = data.nodes.find(
    (n) =>
      n.sourceSlug === currentSlug &&
      n.sourceType === sourceType &&
      n.nodeType === "file" &&
      n.locale === locale,
  );
  if (!focalNode) return null;

  // Build adjacency map
  const adjacency = new Map<string, Array<{ nodeId: string; edge: GraphEdge }>>();
  for (const edge of data.edges) {
    if (!adjacency.has(edge.source)) adjacency.set(edge.source, []);
    if (!adjacency.has(edge.target)) adjacency.set(edge.target, []);
    adjacency.get(edge.source)!.push({ nodeId: edge.target, edge });
    adjacency.get(edge.target)!.push({ nodeId: edge.source, edge });
  }

  const nodeMap = new Map(data.nodes.map((n) => [n.id, n]));
  const includedIds = new Set<string>([focalNode.id]);

  // 1-hop neighbors (skip excluded types)
  const hop1Tags: string[] = [];
  const hop1Files: string[] = [];
  const neighbors = adjacency.get(focalNode.id) || [];
  for (const { nodeId } of neighbors) {
    const node = nodeMap.get(nodeId);
    if (!node || EXCLUDED_TYPES.has(node.nodeType)) continue;
    // Only include same-locale nodes for file/section types
    if (
      (node.nodeType === "file" || node.nodeType === "section") &&
      node.locale !== locale
    ) continue;
    includedIds.add(nodeId);
    if (node.nodeType === "tag") hop1Tags.push(nodeId);
    else if (node.nodeType === "file") hop1Files.push(nodeId);
  }

  // 2-hop: for tag nodes, find their other file connections
  const hop2Files: string[] = [];
  for (const tagId of hop1Tags) {
    const tagNeighbors = adjacency.get(tagId) || [];
    for (const { nodeId } of tagNeighbors) {
      if (includedIds.has(nodeId)) continue;
      const node = nodeMap.get(nodeId);
      if (!node || node.nodeType !== "file" || node.locale !== locale) continue;
      hop2Files.push(nodeId);
      includedIds.add(nodeId);
    }
  }

  // Cap at maxNodes: prioritize focal → 1-hop files → tags → 2-hop files
  if (includedIds.size > maxNodes) {
    const prioritized = new Set<string>([focalNode.id]);
    const addUntilFull = (ids: string[]) => {
      for (const id of ids) {
        if (prioritized.size >= maxNodes) break;
        prioritized.add(id);
      }
    };
    addUntilFull(hop1Files);
    addUntilFull(hop1Tags);
    addUntilFull(hop2Files);

    // Remove nodes beyond the cap
    for (const id of includedIds) {
      if (!prioritized.has(id)) includedIds.delete(id);
    }
  }

  // Collect nodes and edges
  const subNodes = data.nodes.filter((n) => includedIds.has(n.id));
  const subEdges = data.edges.filter(
    (e) => includedIds.has(e.source) && includedIds.has(e.target),
  );

  if (subNodes.length < 2) return null;

  return { nodes: subNodes, edges: subEdges, focalNodeId: focalNode.id };
}

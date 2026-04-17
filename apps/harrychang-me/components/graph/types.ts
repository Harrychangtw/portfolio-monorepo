export type NodeType = "file" | "section" | "image" | "video" | "tag" | "hub";
export type SourceType = "post" | "project" | "gallery" | "locale";
export type LinkType = "semantic" | "structural" | "tag";

export interface GraphNode {
  id: string;
  title: string;
  snippet: string;
  description?: string;
  tldr?: string;
  nodeType: NodeType;
  sourceType: SourceType;
  sourceSlug: string;
  locale: "en" | "zh-TW";
  url: string;
  date?: string | null;
  tags?: string[];
  heading?: string | null;
  imageUrl?: string | null;
  parentId?: string | null;
  mediaSource?: string | null;
}

export interface GraphEdge {
  source: string;
  target: string;
  weight: number;
  linkType: LinkType;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  metadata: {
    generatedAt: string;
    nodeCount: number;
    edgeCount: number;
    threshold: number;
    maxEdgesPerNode: number;
    model: string;
    nodeTypeCounts?: Record<NodeType, number>;
  };
}

export interface SimulationNode extends GraphNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  fx?: number | null;
  fy?: number | null;
  index?: number;
}

export interface SimulationEdge {
  source: SimulationNode;
  target: SimulationNode;
  weight: number;
  linkType: LinkType;
}

export type SourceType = "post" | "project" | "gallery" | "locale";

export interface GraphNode {
  id: string;
  title: string;
  snippet: string;
  description?: string;
  sourceType: SourceType;
  sourceSlug: string;
  locale: "en" | "zh-TW";
  url: string;
  date?: string | null;
  tags?: string[];
  heading?: string | null;
  imageUrl?: string | null;
}

export interface GraphEdge {
  source: string;
  target: string;
  weight: number;
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
}

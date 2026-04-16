"use client";

import type { SourceType } from "./types";

const legendItems: { type: SourceType; label: string }[] = [
  { type: "post", label: "Blog" },
  { type: "project", label: "Project" },
  { type: "gallery", label: "Gallery" },
  { type: "locale", label: "Info" },
];

const dotColors: Record<SourceType, string> = {
  post: "bg-[hsl(var(--graph-node-post))]",
  project: "bg-[hsl(var(--graph-node-project))]",
  gallery: "bg-[hsl(var(--graph-node-gallery))]",
  locale: "bg-[hsl(var(--graph-node-locale))]",
};

interface GraphLegendProps {
  nodeCount?: number;
  edgeCount?: number;
}

export default function GraphLegend({ nodeCount, edgeCount }: GraphLegendProps) {
  return (
    <div className="absolute bottom-6 left-6 z-10 flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        {legendItems.map((item) => (
          <div key={item.type} className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 shrink-0 ${dotColors[item.type]}`}
            />
            <span className="font-mono text-xs text-secondary uppercase tracking-wider">
              {item.label}
            </span>
          </div>
        ))}
      </div>
      {nodeCount != null && edgeCount != null && (
        <div className="font-mono text-xs text-secondary/50">
          {nodeCount} nodes &middot; {edgeCount} edges
        </div>
      )}
    </div>
  );
}

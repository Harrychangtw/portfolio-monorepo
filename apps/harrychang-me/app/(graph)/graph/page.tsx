import { Suspense } from "react";
import GraphPageClient from "@/components/graph/graph-page-client";

export const metadata = {
  title: "Knowledge Graph",
};

function GraphLoadingSkeleton() {
  return (
    <div className="w-full h-[calc(100vh-4rem)] flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-secondary text-sm font-heading">
          Loading knowledge graph...
        </p>
      </div>
    </div>
  );
}

export default function GraphPage() {
  return (
    <Suspense fallback={<GraphLoadingSkeleton />}>
      <GraphPageClient />
    </Suspense>
  );
}

"use client";

import dynamic from "next/dynamic";

// Embedded version of /graph (physics), filtered to slug-level nodes only.
const EmbeddedGraph = dynamic(() => import("./embedded-graph"), {
  ssr: false,
});

export default EmbeddedGraph;

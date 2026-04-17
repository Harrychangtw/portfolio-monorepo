"use client";

import dynamic from "next/dynamic";

const LocalGraphView = dynamic(() => import("./local-graph-view"), {
  ssr: false,
});

export default LocalGraphView;

"use client";

import { useLanguage } from "@portfolio/lib/contexts/language-context";
import LocalGraphView from "@/components/graph/local-graph-dynamic";

export default function GraphSection() {
  const { t } = useLanguage();

  return (
    <section id="graph" className="py-12 md:py-16 border-b border-border">
      <div className="container">
        <h2 className="font-heading text-lg uppercase tracking-wider text-secondary mb-4">
          {t("header.graph") || "Site Graph"}
        </h2>
        <div
          className="border border-border overflow-hidden"
          style={{ height: "360px" }}
        >
          <LocalGraphView currentSlug="" sourceType="post" />
        </div>
      </div>
    </section>
  );
}

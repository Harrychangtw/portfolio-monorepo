"use client";

import { useEffect, useRef } from "react";
import { track, events } from "@portfolio/lib/analytics";

/**
 * Fires `scroll_depth_reached` once each at 25/50/75/100% of document
 * scroll progress. Mounted on long-form pages (blog post, gallery post).
 *
 * `contentType` and `slug` distinguish the surface so retention dashboards
 * can compare e.g. blog posts vs gallery items.
 */
export default function ScrollDepthTracker({
  contentType,
  slug,
}: {
  contentType: "blog" | "gallery" | "project" | "page";
  slug?: string;
}) {
  const fired = useRef<Set<number>>(new Set());

  useEffect(() => {
    fired.current = new Set();
    const milestones = [25, 50, 75, 100];

    const onScroll = () => {
      const scrollTop =
        window.scrollY || document.documentElement.scrollTop || 0;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const pct = Math.min(100, Math.round((scrollTop / docHeight) * 100));
      for (const m of milestones) {
        if (pct >= m && !fired.current.has(m)) {
          fired.current.add(m);
          track(events.SCROLL_DEPTH_REACHED, {
            depth_percent: m,
            content_type: contentType,
            slug: slug ?? null,
          });
        }
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [contentType, slug]);

  return null;
}

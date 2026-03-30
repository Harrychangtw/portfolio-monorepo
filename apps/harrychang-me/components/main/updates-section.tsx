"use client";
import { useState, useEffect, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "@portfolio/lib/contexts/language-context";

const parseHtmlToReact = (htmlString: string): React.ReactNode => {
  const linkRegex = /<a\s+href="([^"]*)"[^>]*>([^<]*)<\/a>/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = linkRegex.exec(htmlString)) !== null) {
    if (match.index > lastIndex) {
      const textBefore = htmlString.substring(lastIndex, match.index);
      if (textBefore)
        parts.push(<span key={`text-${key++}`}>{textBefore}</span>);
    }
    const href = match[1];
    const linkText = match[2];
    parts.push(
      <a
        key={`link-${key++}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="link-external"
      >
        {linkText}
      </a>,
    );
    lastIndex = linkRegex.lastIndex;
  }
  if (lastIndex < htmlString.length) {
    const remainingText = htmlString.substring(lastIndex);
    if (remainingText)
      parts.push(<span key={`text-${key++}`}>{remainingText}</span>);
  }
  return parts.length > 0 ? <>{parts}</> : htmlString;
};

export default function UpdatesSection() {
  const { t, getTranslationData } = useLanguage();
  const [currentPage, setCurrentPage] = useState(0);

  // Stable container element (never unmounts)
  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);
  const setContainerRef = (node: HTMLDivElement | null) => setContainerEl(node);

  const [height, setHeight] = useState<number>(0);
  const [ready, setReady] = useState(false);
  const [transitionsOn, setTransitionsOn] = useState(false);

  const updatesNamespaceData = getTranslationData("", "updates");
  const updates = updatesNamespaceData?.entries || [];

  const entriesPerPage = 5;
  const totalPages = Math.ceil(updates.length / entriesPerPage);
  const startIndex = currentPage * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;

  const currentEntries = updates
    .slice(startIndex, endIndex)
    .map((entry: any) => ({
      ...entry,
      text: entry.text?.replace(/^\[.*?\]\s*/, "") || "",
    }));

  // Initial measure (no transition) once content exists
  useLayoutEffect(() => {
    if (!containerEl) return;
    // If we have updates, measure synchronously
    if (updates.length > 0) {
      const next = containerEl.scrollHeight;
      setHeight(next);
      if (!ready) {
        setReady(true);
        const id = requestAnimationFrame(() => setTransitionsOn(true));
        return () => cancelAnimationFrame(id);
      }
    }
  }, [containerEl, updates.length, ready]);

  // Observe the stable container for any size changes (enter/exit/new data/fonts)
  useEffect(() => {
    if (!containerEl) return;
    const ro = new ResizeObserver(() => {
      const next = containerEl.scrollHeight;
      setHeight((prev) => (prev !== next ? next : prev));
    });
    ro.observe(containerEl);
    return () => ro.disconnect();
  }, [containerEl]);

  // Optional: prefers-reduced-motion
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(m.matches);
    const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    m.addEventListener?.("change", handler);
    return () => m.removeEventListener?.("change", handler);
  }, []);

  const handlePrevPage = () => setCurrentPage((p) => (p > 0 ? p - 1 : p));
  const handleNextPage = () =>
    setCurrentPage((p) => (p < totalPages - 1 ? p + 1 : p));

  // Helper re-measure after animation completes (extra safety)
  const handleAnimationComplete = () => {
    if (!containerEl) return;
    const next = containerEl.scrollHeight;
    setHeight((prev) => (prev !== next ? next : prev));
  };

  return (
    <section id="updates" className="py-12 md:py-16 border-b border-border">
      <div className="container">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-heading text-lg uppercase tracking-wider text-secondary">
            {t("updates.title")}
          </h2>
          <div className="flex space-x-4">
            <motion.div
              whileHover={currentPage > 0 ? { y: -2 } : {}}
              transition={{ duration: 0.2 }}
            >
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 0}
                className="font-heading text-xl text-secondary hover:text-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ←
              </button>
            </motion.div>
            <motion.div
              whileHover={currentPage < totalPages - 1 ? { y: -2 } : {}}
              transition={{ duration: 0.2 }}
            >
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages - 1}
                className="font-heading text-xl text-secondary hover:text-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                →
              </button>
            </motion.div>
          </div>
        </div>

        {/* Stable container that never unmounts */}
        <div
          ref={setContainerRef}
          style={{
            height: height,
            overflow: "hidden",
            visibility: ready ? "visible" : "hidden",
            transition:
              transitionsOn && !reduceMotion
                ? "height 0.4s ease-in-out"
                : "none",
            willChange: "height",
          }}
        >
          {/* Keyed page content lives inside, but the container remains stable */}
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={currentPage}
              className="space-y-0"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: reduceMotion ? 0 : 0.2, ease: "easeOut" }}
              onAnimationComplete={handleAnimationComplete}
            >
              {currentEntries.map((entry: any, index: number) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-4 py-3 first:pt-0 border-b border-border/30 last:border-b-0"
                >
                  <p className="font-ibm-plex text-sm text-primary leading-relaxed">
                    {parseHtmlToReact(entry.text || "")}
                  </p>
                  <span className="font-mono text-xs text-secondary/50 whitespace-nowrap shrink-0">
                    {entry.date || ""}
                  </span>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

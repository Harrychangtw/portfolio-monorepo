"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useIsMobile } from "@portfolio/lib/hooks/use-mobile";
import { useLanguage } from "@portfolio/lib/contexts/language-context";

export default function AskAi() {
  const isMobile = useIsMobile();
  const { t } = useLanguage();
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [loadedImages, setLoadedImages] = useState(0);

  const query = encodeURIComponent(
    t("askAi.query") || "Who is Harry Chang (harrychang.me)?",
  );

  const aiLinks = [
    {
      id: "ChatGPT",
      name: "ChatGPT",
      icon: "/chatgpt.svg",
      url: `https://chatgpt.com/?q=${query}`,
    },
    {
      id: "Claude",
      name: "Claude",
      icon: "/claude.svg",
      url: `https://claude.ai/new?q=${query}`,
    },
    {
      id: "Gemini",
      name: "Gemini",
      icon: "/gemini.svg",
      url: `https://www.google.com/search?udm=50&q=${query}`,
    },
    {
      id: "Perplexity",
      name: "Perplexity",
      icon: "/perplexity.svg",
      url: `https://www.perplexity.ai/search?q=${query}`,
    },
  ];

  const handleMouseEnter = (e: React.MouseEvent, id: string) => {
    if (!isMobile) {
      setTooltipPosition({ x: e.clientX, y: e.clientY });
      setActiveTooltipId(id);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMobile && activeTooltipId) {
      setTooltipPosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setActiveTooltipId(null);
    }
  };

  const isAllLoaded = loadedImages >= aiLinks.length;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={isAllLoaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center gap-2"
      >
        {aiLinks.map((ai) => (
          <motion.a
            key={ai.id}
            href={ai.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-secondary/10 transition-colors"
            onMouseEnter={(e) => handleMouseEnter(e, ai.name)}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <img
              src={ai.icon}
              alt={ai.name}
              onLoad={() => setLoadedImages((prev) => prev + 1)}
              className="w-4 h-4 opacity-50 hover:opacity-100 hover:scale-110 transition-all duration-300 ai-logo"
            />
          </motion.a>
        ))}
      </motion.div>

      <AnimatePresence>
        {activeTooltipId && !isMobile && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed z-50 pointer-events-none"
            style={{
              top: tooltipPosition.y - 40,
              left: tooltipPosition.x,
              transform: "translateX(-50%)",
            }}
          >
            <div className="bg-accent text-background text-sm px-3 py-1.5 rounded-md shadow-lg font-heading whitespace-nowrap">
              {(t("askAi.tooltip") || "Ask {{name}} who I am").replace(
                "{{name}}",
                activeTooltipId || "",
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

"use client";

import { motion } from "motion/react";
import { useLanguage } from "@portfolio/lib/contexts/language-context";
import { useState } from "react";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const isEn = language === "en";
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex"
    >
      <motion.button
        onClick={() => setLanguage(isEn ? "zh-TW" : "en")}
        className="flex items-center gap-1.5 font-heading text-sm font-medium select-none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
      >
        <span
          className={`transition-colors duration-200 ${
            !isEn
              ? "text-primary"
              : isHovered
                ? "text-accent"
                : "text-secondary"
          }`}
        >
          中
        </span>
        <motion.span
          className="text-secondary font-heading font-medium inline-block w-[2ch] text-center"
          animate={{
            opacity: isHovered ? [1, 0.6, 1] : 1,
          }}
          transition={{ duration: 0.2 }}
        >
          {isHovered ? (isEn ? "→" : "←") : "／"}
        </motion.span>
        <span
          className={`transition-colors duration-200 ${
            isEn ? "text-primary" : isHovered ? "text-accent" : "text-secondary"
          }`}
        >
          EN
        </span>
      </motion.button>
    </motion.div>
  );
}

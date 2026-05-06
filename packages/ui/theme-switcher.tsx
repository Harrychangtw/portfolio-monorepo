"use client";

import { motion } from "motion/react";
import { useTheme, useLanguage } from "@portfolio/lib";
import { Sun, Moon } from "lucide-react";
import { useState } from "react";

export default function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const isDark = theme === "dark";
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex"
    >
      <motion.button
        onClick={toggleTheme}
        className="flex items-center gap-1.5 font-heading text-sm font-medium select-none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
      >
        <Sun
          size={15}
          strokeLinecap="square"
          strokeWidth={2}
          className={`transition-colors duration-200 ${
            !isDark
              ? "text-primary"
              : isHovered
                ? "text-accent"
                : "text-secondary"
          }`}
        />
        <motion.span
          className="text-secondary font-heading font-medium inline-block w-[2ch] text-center"
          animate={{
            opacity: isHovered ? [1, 0.6, 1] : 1,
          }}
          transition={{ duration: 0.2 }}
        >
          {isHovered ? (isDark ? "←" : "→") : "／"}
        </motion.span>
        <Moon
          size={15}
          strokeLinecap="square"
          strokeLinejoin="miter"
          strokeWidth={2}
          className={`transition-colors duration-200 ${
            isDark
              ? "text-primary"
              : isHovered
                ? "text-accent"
                : "text-secondary"
          }`}
        />
      </motion.button>
    </motion.div>
  );
}

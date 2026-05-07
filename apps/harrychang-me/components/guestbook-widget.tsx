"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, ArrowUpRight, Loader2, Check } from "lucide-react";
import { useLanguage } from "@portfolio/lib/contexts/language-context";
import { track, events } from "@portfolio/lib/analytics";

export default function GuestbookWidget({
  className = "",
}: {
  className?: string;
}) {
  const { t } = useLanguage();
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Dynamic placeholders from translation files
  const placeholders = [
    t("guestbook.placeholder1"),
    t("guestbook.placeholder2"),
    t("guestbook.placeholder3"),
    t("guestbook.placeholder4"),
    t("guestbook.placeholder5"),
    t("guestbook.placeholder6"),
    t("guestbook.placeholder7"),
  ];

  // Cycle placeholders
  useEffect(() => {
    if (isFocused) return;
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [isFocused, placeholders.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setStatus("loading");
    setServerError(null);

    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setStatus("success");
      track(events.GUESTBOOK_SUBMITTED, { anonymous: true });
      setMessage("");
      setTimeout(() => {
        setStatus("idle");
        inputRef.current?.blur();
        setIsFocused(false);
      }, 2000);
    } catch (error) {
      setStatus("error");
      if (error instanceof Error) {
        setServerError(error.message);
      }
      setTimeout(() => {
        setStatus("idle");
        setServerError(null);
      }, 3000);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative group">
        <div className="relative">
          <AnimatePresence mode="wait">
            {!isFocused && !message ? (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 pointer-events-none"
              >
                <motion.span
                  key={placeholderIndex}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-primary text-base font-body block truncate w-full"
                >
                  {placeholders[placeholderIndex]}
                </motion.span>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => !message && setIsFocused(false)}
            maxLength={500}
            className="pb-3 w-full bg-transparent text-base text-secondary outline-none placeholder:text-secondary truncate"
            placeholder={isFocused ? t("guestbook.focusedPlaceholder") : ""}
          />

          {/* Underline */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-[1px] bg-border"
            initial={false}
          >
            <motion.div
              className="h-full bg-foreground origin-left"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: isFocused || message ? 1 : 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            />
          </motion.div>

          {/* Idle Arrow — mirrors other footer entries */}
          <AnimatePresence>
            {!isFocused && !message && (
              <motion.span
                key="arrow-up-right"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-0 pt-2 text-secondary pointer-events-none"
              >
                <ArrowUpRight className="w-4 h-4" />
              </motion.span>
            )}
          </AnimatePresence>

          {/* Submit Button — shown on focus/typing */}
          <AnimatePresence>
            {(isFocused || message) && (
              <motion.button
                type="submit"
                disabled={status === "loading" || !message.trim()}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-0 pt-2 text-foreground hover:text-foreground/70 disabled:opacity-30 transition-colors"
              >
                {status === "loading" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : status === "success" ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {status === "error" && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-xs text-red-400 mt-2 truncate"
            >
              {serverError || t("guestbook.error")}
            </motion.p>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}

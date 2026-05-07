"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import NavigationLink from "@portfolio/ui/navigation-link";
import { ImageContainer } from "@portfolio/ui/image-container";
import { track, events } from "@portfolio/lib/analytics";

interface BlogCardProps {
  title: string;
  date: string;
  slug: string;
  imageUrl: string;
  tags?: string[];
  priority?: boolean;
  index?: number;
  className?: string;
  locked?: boolean;
}

export default function BlogCard({
  title,
  date,
  slug,
  imageUrl,
  tags = [],
  priority = false,
  index = 0,
  className,
  locked = false,
}: BlogCardProps) {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    return `${month}.${day}`;
  };

  const displayTags = tags && tags.length > 0 ? tags : ["Blog"];

  const [isClient, setIsClient] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Manage countdown timer utilizing the standard release date
  useEffect(() => {
    if (!locked) return;

    const calculate = () => {
      const diff = new Date(date).getTime() - Date.now();
      return Math.max(0, diff);
    };

    setTimeLeft(calculate());

    const interval = setInterval(() => {
      const left = calculate();
      setTimeLeft(left);
      if (left <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [locked, date]);

  // Initial render avoids hydration mismatch by relying on the locked flag.
  // Dynamically transforms to false when time zeroes out.
  const isEffectivelyLocked = locked
    ? !isClient || timeLeft === null || timeLeft > 0
    : false;

  const formatCountdown = (ms: number) => {
    const d = Math.floor(ms / 86400000);
    const h = Math.floor((ms % 86400000) / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);

    return (
      <>
        {d > 0 && (
          <>
            {String(d).padStart(2, "0")}
            <span className="text-foreground/30 mx-[2px]">:</span>
          </>
        )}
        {String(h).padStart(2, "0")}
        <span className="text-foreground/30 mx-[2px]">:</span>
        {String(m).padStart(2, "0")}
        <span className="text-foreground/30 mx-[2px]">:</span>
        {String(s).padStart(2, "0")}
      </>
    );
  };

  // Degrade to a non-clickable block when locked to hide the route from DOM
  const Wrapper = (
    isEffectivelyLocked ? "div" : NavigationLink
  ) as React.ElementType;
  const wrapperProps = isEffectivelyLocked
    ? { className: "block flex flex-col h-full cursor-default" }
    : {
        href: `/blog/${slug}`,
        className: "block flex flex-col h-full",
        onClick: () =>
          track(events.BLOG_CARD_OPENED, {
            slug,
            title,
            locked: !!locked,
          }),
      };

  return (
    <div
      className={`group relative flex flex-col h-full pb-12 ${className || ""}`}
    >
      <div className="h-px bg-muted mb-2" />
      <Wrapper {...wrapperProps}>
        <div className="w-full" />

        <div className="flex-grow grid grid-cols-[1fr_auto] gap-6 mb-2">
          <div className="flex flex-col justify-between min-w-0">
            <h3
              className={`font-heading text-base md:text-lg font-medium leading-snug tracking-wide line-clamp-4 mb-6 transition-colors duration-700 ${isEffectivelyLocked ? "text-primary/50" : "text-primary"}`}
            >
              {title}
            </h3>

            <div className="flex flex-wrap items-center gap-2 w-full h-7 overflow-hidden content-start">
              {displayTags.map((tag) => (
                <span
                  key={tag}
                  className={`font-body text-sm px-2 py-1 rounded whitespace-nowrap flex-shrink-0 transition-colors duration-700 ${isEffectivelyLocked ? "text-secondary/50 bg-muted/50" : "text-secondary bg-muted"}`}
                  title={tag}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-end">
            <span
              className={`font-heading text-lg md:text-3xl font-light whitespace-nowrap leading-none transition-colors duration-700 ${isEffectivelyLocked ? "text-secondary/50" : "text-secondary"}`}
              aria-label={`Published ${new Date(date).toDateString()}`}
            >
              {formatDate(date)}
            </span>
          </div>
        </div>

        <motion.div
          className="relative overflow-hidden bg-muted mt-auto"
          whileHover={
            isEffectivelyLocked
              ? undefined
              : {
                  scale: 0.98,
                  transition: { duration: 0.2, ease: [0.4, 0, 0.6, 1] },
                }
          }
        >
          <ImageContainer
            src={imageUrl}
            alt={title}
            priority={priority}
            quality={70}
            aspectRatio={1.5}
            noInsetPadding={true}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 500px"
            imgClassName={
              isEffectivelyLocked
                ? "grayscale transition-all duration-700"
                : "transition-all duration-700"
            }
          />

          {/* Lock/Countdown Overlay mimicking 404 & Page Transition styles */}
          <AnimatePresence>
            {isEffectivelyLocked && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 z-30 bg-background/80 flex flex-col items-center justify-center"
              >
                <div className="relative flex flex-col items-center justify-center w-[85%] h-[80%] max-w-[260px] max-h-[160px]">
                  {/* Corner Framelines */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-foreground/40" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-foreground/40" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-foreground/40" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-foreground/40" />

                  {/* Timer Readout */}
                  <div className="font-mono text-[13px] tracking-[0.2em] text-foreground tabular-nums mt-1 flex items-center">
                    {timeLeft === null ? (
                      <span className="animate-pulse opacity-60 tracking-[0.3em]">
                        COMPUTING
                      </span>
                    ) : (
                      formatCountdown(timeLeft)
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </Wrapper>
    </div>
  );
}

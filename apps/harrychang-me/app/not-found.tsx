"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useIsMobile } from "@portfolio/lib/hooks/use-mobile";
import { useNavigation } from "@portfolio/lib/contexts/navigation-context";
import ClientLayout from "@/components/main/client-layout";
import { siteConfig } from "@/config/site";
import { track, events } from "@portfolio/lib/analytics";

function resolveDestinationUrl(path: string): string {
  if (typeof window === "undefined") return path;
  const host = window.location.hostname;
  const isLab =
    host.includes("lab.harrychang.me") || host.includes("lab.localhost");
  if (!isLab) return path;
  // Lab subdomain only serves /lab routes; send the user to the main domain.
  return `${siteConfig.url}${path}`;
}

const destinations = [
  { label: "Manifesto", path: "/manifesto" },
  { label: "Home", path: "/" },
  { label: "Setup", path: "/uses" },

  // Projects
  { label: "Projects", path: "/#projects" },
  { label: "FORTRESS", path: "/projects/2025_10_12_fortress" },
  { label: "PATCH Dataset", path: "/projects/2025_05_18_patch_dataset" },
  { label: "SITCON 2025", path: "/projects/2025_03_08_sitcon_keynote" },
  { label: "SITCON 2026", path: "/projects/sitcon-2026" },
  { label: "Portfolio", path: "/projects/2025_04_12_portfolio" },
  { label: "Chingshin RAG", path: "/projects/2024_09_23_chingshin_rag" },
  { label: "Project Zephyr", path: "/projects/2024_10_04_proj_zephyr" },
  {
    label: "Classics Reimagined",
    path: "/projects/2024_08_19_classics_reimagined",
  },
  { label: "Boundless Voices", path: "/projects/2025_03_18_boundless_voices" },
  { label: "VRC Team Nova", path: "/projects/2024_10_09_vrc_2813b_nova" },
  { label: "Powerplay Drama 2025", path: "/projects/2025_01_03_powerplay" },
  { label: "AAAI Video", path: "/projects/2025_01_05_aaai_video" },
  { label: "WSDC Journey", path: "/projects/2025_08_04_debate" },

  // Gallery
  { label: "Gallery", path: "/#gallery" },
  { label: "Intersection", path: "/gallery/2023_08_10_intersection" },
  { label: "US Trip", path: "/gallery/2026-us-trip" },
  { label: "Against Giants", path: "/gallery/2023_10_06_against_giants" },
  {
    label: "Guided by the Tides",
    path: "/gallery/2023_10_06_guided_by_the_tides",
  },
  { label: "Mortal Sparks", path: "/gallery/2024_02_09_mortal_sparks" },
  {
    label: "Lessons from Light",
    path: "/gallery/2023_10_12_lessons_from_the_light",
  },
  { label: "City of Tears", path: "/gallery/2024_04_06_city_of_tears" },
  { label: "Dusk Impressions", path: "/gallery/2023_11_18_dusk_impressions" },
  { label: "Italy Mountain", path: "/gallery/2026_02_08_italy_mountain" },
  { label: "Italy Town", path: "/gallery/2026_02_08_italy_town" },
  { label: "Italy City", path: "/gallery/2026_02_08_italy_city" },
  {
    label: "Simple in Complexity",
    path: "/gallery/2024_07_03_simple_in_a_complex_world",
  },
  { label: "Tokyo Street Fragments", path: "/gallery/2023_06_30_city_stroll" },
  { label: "Red Umbrella Pulse", path: "/gallery/2023_07_07_splash_of_red" },
  { label: "Urban Glow", path: "/gallery/2023_10_05_solitary_glow" },
  {
    label: "Solitary Sea Defiance",
    path: "/gallery/2023_12_30_against_the_unknown",
  },
  { label: "Taipei Twilight", path: "/gallery/2023_12_30_sky_above" },
  { label: "Path To Peace", path: "/gallery/2024_01_06_hehuanshan" },
  {
    label: "Tainan & Taichung",
    path: "/gallery/2024_02_14_go_where_you_feel_most_alive",
  },

  // Blog
  { label: "Blog", path: "/#blog" },
  { label: "Chingshin", path: "/blog/13-chingshin" },
  { label: "US Trip", path: "/blog/12-us-trip" },
  { label: "Site Anniversery", path: "/blog/11-portfolio" },
  { label: "Lego Fan Mount", path: "/blog/10-lego-mount" },
  { label: "Leica M11-D", path: "/blog/9_m11d" },
  { label: "The X-Pro1", path: "/blog/2025_12_19_xpro1" },
  { label: "Aftersun & Paris", path: "/blog/2025_12_22_aftersun_paris_texas" },
  {
    label: "NTU CS Admission",
    path: "/blog/2025_12_24_ntu_cs_special_admission",
  },
  { label: "Unhinged Plushies", path: "/blog/2026_01_10_plushies" },
  { label: "Synecdoche & Truman", path: "/blog/2026_02_10_synecdoche_truman" },
  { label: "Affinity V3", path: "/blog/2025_12_14_affinity" },
  { label: "Blog Launch", path: "/blog/2025_12_12_blog_launch" },
  { label: "Sisyphus & Absurdity", path: "/blog/2025_12_13_sisyphus" },
];

export function NotFoundContent() {
  const router = useRouter();
  const { startNavigation } = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [speed, setSpeed] = useState(120);
  const [isLocked, setIsLocked] = useState(false);
  const [lockedDestination, setLockedDestination] = useState<
    (typeof destinations)[0] | null
  >(null);
  const isMobile = useIsMobile();

  const lastScrollTime = useRef(0);
  const holdStartRef = useRef<number | null>(null);

  // Misalignment for split-image effect: fast = misaligned, slow = aligned
  const isAligned = speed > 420;
  const misalignment = isAligned ? 0 : Math.max(0, (420 - speed) / 6);

  // Mobile detection and redirect
  useEffect(() => {
    if (isMobile) {
      const target = resolveDestinationUrl("/?from404=true");
      if (target.startsWith("http")) {
        window.location.replace(target);
      } else {
        router.replace(target);
      }
    }
  }, [isMobile, router]);

  // Flickering animation
  useEffect(() => {
    if (isLocked || isMobile) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % destinations.length);
    }, speed);

    return () => clearInterval(interval);
  }, [speed, isLocked, isMobile]);

  // Lock detection when aligned long enough
  useEffect(() => {
    if (isLocked || !isAligned) {
      holdStartRef.current = null;
      return;
    }

    if (holdStartRef.current === null) {
      holdStartRef.current = Date.now();
    }

    const checkLock = setInterval(() => {
      if (holdStartRef.current && Date.now() - holdStartRef.current > 500) {
        const dest = destinations[currentIndex];
        const timeToLock = holdStartRef.current
          ? Date.now() - holdStartRef.current
          : null;
        track(events.RANGEFINDER_LOCKED, {
          destination: dest.label,
          path: dest.path,
          time_to_lock_ms: timeToLock,
        });
        setIsLocked(true);
        setLockedDestination(dest);

        setTimeout(() => {
          startNavigation();
          setTimeout(() => {
            const target = resolveDestinationUrl(dest.path);
            track(events.RANGEFINDER_REDIRECTED, {
              destination: dest.label,
              path: dest.path,
              target,
            });
            if (target.startsWith("http")) {
              window.location.assign(target);
            } else {
              router.push(target);
            }
          }, 250);
        }, 950);
      }
    }, 50);

    return () => clearInterval(checkLock);
  }, [isAligned, isLocked, currentIndex, router, startNavigation]);

  // Scroll handler - scroll down to slow, scroll up to speed
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (isLocked) return;
      e.preventDefault();

      lastScrollTime.current = Date.now();

      setSpeed((prev) => {
        const sensitivity = 0.6;
        const change = e.deltaY * sensitivity;
        return Math.max(40, Math.min(500, prev + change));
      });
    },
    [isLocked],
  );

  // Speed decay - gradually returns to fast if not scrolling
  useEffect(() => {
    if (isLocked) return;

    const decay = setInterval(() => {
      const timeSinceScroll = Date.now() - lastScrollTime.current;
      if (timeSinceScroll > 120) {
        setSpeed((prev) => {
          const target = 120;
          const diff = target - prev;
          if (Math.abs(diff) < 1) return target;
          return prev + diff * 0.06;
        });
      }
    }, 25);

    return () => clearInterval(decay);
  }, [isLocked]);

  // Attach wheel listener
  useEffect(() => {
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  // Don't render until mobile check completes
  if (isMobile) return null;

  const currentDestination = isLocked
    ? lockedDestination
    : destinations[currentIndex];
  const displayLabel = currentDestination?.label ?? "";

  return (
    <div
      style={{ top: "var(--header-offset, 64px)" }}
      className="fixed inset-x-0 bottom-0 z-50 bg-background flex items-center justify-center overflow-hidden select-none cursor-crosshair"
    >
      {/* Corner framelines */}
      <div className="absolute inset-10 pointer-events-none">
        {/* Top left */}
        <div className="absolute top-0 left-0 w-12 h-12 border-t border-l border-foreground/40" />
        {/* Top right */}
        <div className="absolute top-0 right-0 w-12 h-12 border-t border-r border-foreground/40" />
        {/* Bottom left */}
        <div className="absolute bottom-0 left-0 w-12 h-12 border-b border-l border-foreground/40" />
        {/* Bottom right */}
        <div className="absolute bottom-0 right-0 w-12 h-12 border-b border-r border-foreground/40" />
      </div>

      {/* Central rangefinder patch */}
      <div className="relative flex flex-col items-center">
        <motion.div
          className="relative w-80 h-24 border bg-foreground/[0.02] flex items-center justify-center overflow-hidden"
          animate={{
            borderColor: isLocked
              ? "hsl(var(--foreground) / 0.5)"
              : "hsl(var(--foreground) / 0.2)",
            backgroundColor: isLocked
              ? "hsl(var(--foreground) / 0.06)"
              : "hsl(var(--foreground) / 0.02)",
          }}
          transition={{ duration: 0.3 }}
        >
          {/* Horizontal split line */}
          <div className="absolute inset-x-6 top-1/2 h-px bg-foreground/15" />

          {/* Split-image text effect */}
          <div className="relative h-full w-full flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={isLocked ? "locked" : currentIndex}
                className="absolute inset-0 flex flex-col items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: isLocked ? 0.15 : 0.025 }}
              >
                {/* Top half of text */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ clipPath: "inset(0 0 50% 0)" }}
                >
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    animate={{
                      x: isLocked ? 0 : misalignment,
                    }}
                    transition={{
                      duration: isAligned || isLocked ? 0.12 : 0.45,
                      ease:
                        isAligned || isLocked
                          ? [0.32, 0, 0.67, 0]
                          : [0.45, 0.05, 0.55, 0.95],
                    }}
                  >
                    <span className="text-foreground font-mono text-xl tracking-[0.15em] uppercase whitespace-nowrap px-6 overflow-hidden text-ellipsis max-w-[18rem]">
                      {displayLabel}
                    </span>
                  </motion.div>
                </div>

                {/* Bottom half of text */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ clipPath: "inset(50% 0 0 0)" }}
                >
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    animate={{
                      x: isLocked ? 0 : -misalignment,
                    }}
                    transition={{
                      duration: isAligned || isLocked ? 0.12 : 0.45,
                      ease:
                        isAligned || isLocked
                          ? [0.32, 0, 0.67, 0]
                          : [0.45, 0.05, 0.55, 0.95],
                    }}
                  >
                    <span className="text-foreground font-mono text-xl tracking-[0.15em] uppercase whitespace-nowrap px-6 overflow-hidden text-ellipsis max-w-[18rem]">
                      {displayLabel}
                    </span>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Lock flash effect */}
          <AnimatePresence>
            {isLocked && (
              <motion.div
                className="absolute inset-0 bg-foreground"
                initial={{ opacity: 0.6 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* Focus indicator bars */}
        <div className="mt-8 flex items-end gap-[3px] h-4">
          {[...Array(9)].map((_, i) => {
            const threshold = 130 + i * 42;
            const isActive = speed > threshold;
            const centerIndex = 4;
            const distanceFromCenter = Math.abs(i - centerIndex);
            const height = isActive ? 6 + (4 - distanceFromCenter) * 2 : 3;

            return (
              <motion.div
                key={i}
                className="w-[2px] bg-foreground rounded-full"
                animate={{
                  height,
                  opacity: isActive ? 0.6 : 0.15,
                }}
                transition={{ duration: 0.08 }}
              />
            );
          })}
        </div>
      </div>

      {/* Status text */}
      <motion.div
        className="absolute bottom-14 font-mono text-[10px] tracking-[0.35em] uppercase"
        animate={{
          color: isLocked
            ? "hsl(var(--foreground) / 0.8)"
            : "hsl(var(--foreground) / 0.25)",
        }}
        transition={{ duration: 0.2 }}
      >
        {isLocked ? (
          <span className="flex items-center gap-2">
            <motion.span
              className="inline-block w-1.5 h-1.5 rounded-full bg-foreground"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
            Focused
          </span>
        ) : (
          "Scroll to focus"
        )}
      </motion.div>

      {/* 404 identifier */}
      <div className="absolute top-14 font-mono text-[10px] tracking-[0.5em] text-foreground/20 uppercase">
        404 · Not Found
      </div>
    </div>
  );
}

// Wrap the global 404 in the NavigationProvider to satisfy the context requirement
export default function NotFound() {
  return (
    <ClientLayout>
      <NotFoundContent />
    </ClientLayout>
  );
}

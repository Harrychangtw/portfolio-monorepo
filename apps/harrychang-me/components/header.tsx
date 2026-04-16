"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import { useIsMobile } from "@portfolio/lib/hooks/use-mobile";
import { useLanguage } from "@portfolio/lib/contexts/language-context";
import { useNavigation } from "@portfolio/lib/contexts/navigation-context";
import StaggeredMenu from "@/components/staggered-menu";
import NavigationLink from "@portfolio/ui/navigation-link";
import { useStableHashScroll } from "@portfolio/lib/hooks/use-stable-hash-scroll";
import {
  scrollToSection as utilScrollToSection,
  ensurePreciseAlign,
} from "@portfolio/lib/lib/scrolling";

// Keep duration consistent with lib/scrolling.ts
const SCROLL_ANIMATION_DURATION = 400; // ms

// Configuration for special pages to reduce repetitive boolean checks
const SPECIAL_PAGES = [
  { prefix: "/paper-reading", key: "paperReading" },
  { prefix: "/manifesto", key: "manifesto" },
  { prefix: "/uses", key: "uses" },
  { prefix: "/linktree", key: "links" },
  { prefix: "/design", key: "design" },
  { prefix: "/cv", key: "cv" },
];

const NAV_ITEMS = [
  { id: "about", path: "/" },
  { id: "updates", path: "/#updates" },
  { id: "projects", path: "/#projects" },
  { id: "gallery", path: "/#gallery" },
  { id: "blog", path: "/#blog" },
];

const LOADING_STATUSES = [
  "Spelunking",
  "Brewing ideas",
  "Computing",
  "Pondering",
  "Connecting",
  "Decoding",
  "Contemplating",
  "Wrangling",
  "Assembling",
  "Discombobulating",
  "Processing",
  "Ideating",
  "Syncing",
] as const;

// Extended wait messages (>5s)
const EXTENDED_STATUSES = [
  "Still here",
  "Almost there",
  "Bear with me",
  "Refining",
  "Polishing",
  "Persisting",
  "Percolating",
  "Crystallizing",
  "Struggling",
  "Fine-tuning",
  "Hang tight",
  "Nearly done",
  "Finalizing",
  "Worth the wait",
  "Just a sec",
] as const;

// Timing configuration
const STATUS_CYCLE_INTERVAL = 1000; // ms between status changes
const EXTENDED_WAIT_THRESHOLD = 3000; // ms before showing extended messages
const EXTENDED_CYCLE_INTERVAL = 2000; // slower cycling for extended wait

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { isNavigating } = useNavigation();
  const [activeSection, setActiveSection] = useState<string>("about");
  const [isScrolling, setIsScrolling] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLab, setIsLab] = useState(false);
  const [isGraph, setIsGraph] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const isHomePage = pathname === "/";
  const [loadingStatus, setLoadingStatus] = useState<
    (typeof LOADING_STATUSES)[number] | (typeof EXTENDED_STATUSES)[number]
  >(LOADING_STATUSES[0]);
  const [dots, setDots] = useState(".");
  const [isExtendedWait, setIsExtendedWait] = useState(false);
  const navigationStartRef = useRef<number | null>(null);

  // DRY: Identify if we are on a special page
  const currentSpecialPage = SPECIAL_PAGES.find((page) =>
    pathname?.startsWith(page.prefix),
  );
  const isSpecialPage = !!currentSpecialPage;

  const isProjectDetailPage = pathname?.match(/^\/projects\/[^/]+$/);
  const isBlogDetailPage = pathname?.match(/^\/blog\/[^/]+$/);
  const isMobile = useIsMobile();
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { t, language } = useLanguage();

  // Cycle through loading statuses
  useEffect(() => {
    if (!isNavigating) {
      // Reset state when navigation ends
      navigationStartRef.current = null;
      setIsExtendedWait(false);
      // Don't reset status string here to allow for smooth exit animation
      return;
    }

    // Track navigation start time
    if (!navigationStartRef.current) {
      navigationStartRef.current = Date.now();
    }

    const statusMap = isExtendedWait ? EXTENDED_STATUSES : LOADING_STATUSES;
    const statuses = statusMap;

    // Pick a random start index for nuance
    let statusIndex = Math.floor(Math.random() * statuses.length);
    setLoadingStatus(statuses[statusIndex]);

    const interval = isExtendedWait
      ? EXTENDED_CYCLE_INTERVAL
      : STATUS_CYCLE_INTERVAL;

    const cycleStatus = () => {
      statusIndex = (statusIndex + 1) % statuses.length;
      setLoadingStatus(statuses[statusIndex]);
    };

    const statusInterval = setInterval(cycleStatus, interval);

    // Check for extended wait
    const extendedCheckInterval = setInterval(() => {
      if (
        navigationStartRef.current &&
        Date.now() - navigationStartRef.current > EXTENDED_WAIT_THRESHOLD &&
        !isExtendedWait
      ) {
        setIsExtendedWait(true);
      }
    }, 500);

    return () => {
      clearInterval(statusInterval);
      clearInterval(extendedCheckInterval);
    };
  }, [isNavigating, isExtendedWait, language]);

  // Cycle dots while navigating
  useEffect(() => {
    if (!isNavigating) {
      setDots("");
      return;
    }
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 400);
    return () => clearInterval(interval);
  }, [isNavigating]);
  // Detect if we're on the lab subdomain
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      setIsLab(
        hostname.includes("lab.localhost") ||
          hostname.includes("lab.harrychang.me"),
      );
      setIsGraph(
        hostname.includes("graph.localhost") ||
          hostname.includes("graph.harrychang.me"),
      );
    }
  }, []);

  // Use stable hash scroll hook for perfect alignment
  useStableHashScroll("header");

  // Expose header height as CSS variable
  useEffect(() => {
    const update = () => {
      const h =
        document.querySelector("header")?.getBoundingClientRect().height || 0;
      document.documentElement.style.setProperty("--header-offset", `${h}px`);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const isActive = (sectionId: string) => activeSection === sectionId;

  const scrollToSection = (
    id: string,
    event?: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    if (isHomePage) {
      event?.preventDefault();
      const element = document.getElementById(id);
      if (element) {
        setIsScrolling(true);
        setActiveSection(id);
        utilScrollToSection(id);

        scrollTimeoutRef.current = setTimeout(() => {
          setIsScrolling(false);
          scrollTimeoutRef.current = null;
        }, SCROLL_ANIMATION_DURATION + 100);
      }
    }
  };

  // Effect for handling initial load
  useEffect(() => {
    if (isHomePage && window.location.hash) {
      const id = window.location.hash.substring(1);
      setActiveSection(id);
    } else if (isHomePage && window.scrollY < 50) {
      setActiveSection("about");
    }

    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [isHomePage]);

  // Effect for updating active section based on scroll position
  useEffect(() => {
    if (!isHomePage) return;

    const handleScroll = () => {
      if (isScrolling || isMenuOpen) return;

      const headerHeight = document.querySelector("header")?.offsetHeight || 0;
      const scrollY = window.scrollY;

      // Handle edge case where the last section is smaller than the viewport
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      if (windowHeight + scrollY >= documentHeight - 50) {
        setActiveSection(NAV_ITEMS[NAV_ITEMS.length - 1].id);
        return;
      }

      const sections = NAV_ITEMS.map((item) => ({
        id: item.id,
        element: document.getElementById(item.id),
      }));

      let currentSection = "about";

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        if (!section.element) continue;

        const sectionTop = section.element.offsetTop;
        const sectionBottom = sectionTop + section.element.offsetHeight;

        const isInSection =
          sectionTop <= scrollY + headerHeight + 50 &&
          sectionBottom > scrollY + headerHeight;

        if (isInSection) {
          currentSection = section.id;
        }
      }

      setActiveSection((prevSection) => {
        if (prevSection !== currentSection) {
          return currentSection;
        }
        return prevSection;
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage, isScrolling, isMenuOpen]);

  // Effect for updating active section based on pathname
  useEffect(() => {
    if (!isHomePage) {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
        setIsScrolling(false);
      }

      if (isSpecialPage) {
        setActiveSection(""); // On special pages, no section is active
      } else if (pathname?.startsWith("/projects")) {
        setActiveSection("projects");
      } else if (pathname?.startsWith("/gallery")) {
        setActiveSection("gallery");
      } else if (pathname?.startsWith("/blog")) {
        setActiveSection("blog");
      } else {
        setActiveSection(""); // Default to no active section for other pages
      }
    }
  }, [pathname, isHomePage, isSpecialPage]);

  // DRY: Logic for determining which title to show
  const showStandardSectionTitle =
    (isHomePage && activeSection !== "about") ||
    (!isHomePage &&
      (pathname?.startsWith("/projects") ||
        pathname?.startsWith("/gallery") ||
        pathname?.startsWith("/blog")));

  let activeTitleKey: string | null = null;

  if (isLab) {
    activeTitleKey = "lab";
  } else if (isGraph) {
    activeTitleKey = "graph";
  } else if (currentSpecialPage) {
    activeTitleKey = currentSpecialPage.key;
  } else if (showStandardSectionTitle) {
    activeTitleKey = activeSection;
  }

  // Helper logic to determine if nav should be hidden
  // UPDATED: Nav is now only hidden on mobile or on the lab subdomain
  const isNotFound =
    !isHomePage &&
    !isSpecialPage &&
    !isProjectDetailPage &&
    !isBlogDetailPage &&
    !activeTitleKey;
  const shouldHideNav = isMobile || isLab || isGraph || isNotFound;

  // Reusable Underline Component
  const Underline = () => (
    <motion.span
      layoutId="navUnderline"
      layout="position"
      className="absolute left-0 bottom-[-4px] h-[1px] w-full bg-primary"
      initial={false}
      transition={{ type: "spring", stiffness: 500, damping: 40 }}
      transformTemplate={(_, transform) =>
        transform
          // kill translateY(...)
          .replace(/translateY\([^)]*\)/g, "translateY(0px)")
          // kill translate(x, y)
          .replace(/translate\(\s*([^,]+),\s*([^)]+)\)/g, "translate($1, 0px)")
          // kill translate3d(x, y, z)
          .replace(
            /translate3d\(\s*([^,]+),\s*([^,]+),\s*([^)]+)\)/g,
            "translate3d($1, 0px, $3)",
          )
      }
    />
  );

  // Helper to generate link props
  const getLinkProps = (sectionId: string, pagePath: string) => {
    const active = isActive(sectionId);
    const baseClasses = `relative font-heading ${active ? "text-primary" : "text-secondary hover:text-accent"} transition-colors duration-200 outline-none`;
    const href = isHomePage
      ? `/#${sectionId}`
      : pagePath === "/"
        ? `/#${sectionId}`
        : pagePath;
    const onClick = isHomePage
      ? (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) =>
          scrollToSection(sectionId, e)
      : undefined;
    const scroll = !isHomePage;
    return { className: baseClasses, href, onClick, scroll };
  };

  // Determine when to show the staggered menu
  const showStaggeredMenu = isMobile && !isLab && !isGraph;

  // Menu items for the staggered menu
  const menuItems = NAV_ITEMS.map((item) => ({
    label: t(`header.${item.id}`),
    ariaLabel: t(`header.${item.id}`),
    link: `/#${item.id}`,
    sectionId: item.id,
  }));

  const [icarusUrl, setIcarusUrl] = useState("https://lab.harrychang.me");

  useEffect(() => {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const port = window.location.port ? `:${window.location.port}` : "";
    if (hostname.includes("localhost")) {
      setIcarusUrl(`${protocol}//lab.localhost${port}`);
    } else {
      setIcarusUrl(`${protocol}//lab.${hostname.replace(/^www\./, "")}`);
    }
  }, []);

  const connectItems = [
    { label: t("social.gmail"), link: "/email" },
    { label: t("social.discord"), link: "/discord" },
    { label: t("social.linkedin"), link: "/linkedin" },
    { label: t("social.github"), link: "/github" },
    { label: t("social.instagram"), link: "/instagram" },
    { label: t("social.medium"), link: "/medium" },
    { label: t("social.calendar"), link: "/cal" },
  ];

  const exploreItems = [
    { label: t("resources.icarus"), link: icarusUrl },
    { label: t("social.music"), link: "/spotify" },
    { label: t("social.letterboxd"), link: "/letterboxd" },
    { label: t("resources.resume"), link: "/cv" },
    { label: t("resources.uses"), link: "/uses" },
    { label: t("resources.reading"), link: "/paper-reading" },
    { label: t("resources.design"), link: "/design" },
  ];

  // Track reading progress
  useEffect(() => {
    if ((!isProjectDetailPage && !isBlogDetailPage) || isLab || isGraph) return;

    let animationFrameId: number;
    let targetProgress = 0;

    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const scrollableHeight = documentHeight - windowHeight;
      targetProgress =
        scrollableHeight > 0 ? (scrollTop / scrollableHeight) * 100 : 0;
    };

    const animate = () => {
      setReadingProgress((current) => {
        const diff = targetProgress - current;
        const damped = current + diff * 0.15;
        return Math.abs(diff) < 0.1 ? targetProgress : damped;
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    handleScroll();
    animationFrameId = requestAnimationFrame(animate);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isProjectDetailPage, isBlogDetailPage, isLab]);

  const getHomeUrl = () => {
    if (isLab || isGraph) {
      const protocol =
        (typeof window !== "undefined" && window.location.protocol) || "http:";
      const hostnameWithPort =
        (typeof window !== "undefined" && window.location.host) ||
        "localhost:3000";
      const mainDomain = hostnameWithPort
        .replace("lab.", "")
        .replace("graph.", "");
      return `${protocol}//${mainDomain}`;
    }
    return "/";
  };

  return (
    <motion.header
      id="main-header"
      layoutRoot
      className="fixed top-0 left-0 right-0 border-b border-border py-4 z-[60] bg-background"
    >
      {/* Navigation loading indicator */}
      {isNavigating && (
        <motion.div
          className="absolute top-0 left-0 h-[2px] loading-bar"
          initial={{ x: "-100%", width: "18%" }}
          animate={{
            x: ["-100%", "600%"],
            width: ["18%", "28%", "18%"],
          }}
          transition={{
            x: {
              duration: 0.55,
              repeat: Infinity,
              ease: "linear",
            },
            width: {
              duration: 0.55,
              repeat: Infinity,
              ease: [0.4, 0, 0.6, 1],
              times: [0, 0.5, 1],
            },
          }}
        />
      )}

      {/* Reading progress indicator */}
      {(isProjectDetailPage || isBlogDetailPage) && !isLab && !isGraph && !isNavigating && (
        <div
          className="absolute top-0 left-0 h-[2px] bg-accent"
          style={{ width: `${readingProgress}%` }}
        />
      )}

      <div className="container flex justify-between items-center">
        <div
          className={`flex items-center min-w-0 flex-1 ${showStaggeredMenu ? "mr-12" : "mr-4"}`}
        >
          <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
            {isLab || isGraph ? (
              <a
                href={getHomeUrl()}
                className="font-heading text-xl font-semibold transition-colors hover:text-accent outline-none whitespace-nowrap"
              >
                Harry Chang
              </a>
            ) : (
              <NavigationLink
                href="/"
                className="font-heading text-xl font-semibold transition-colors hover:text-accent outline-none whitespace-nowrap"
                onClick={(e) => {
                  if (isHomePage) scrollToSection("about", e);
                }}
              >
                Harry Chang
              </NavigationLink>
            )}
          </motion.div>

          {/* Loading Status or Section Title */}
          <AnimatePresence mode="wait">
            {isNavigating ? (
              <motion.div
                className="flex items-center min-w-0"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                <span className="text-secondary mx-1 text-xl">｜</span>
                <motion.span
                  className="font-heading text-xl text-secondary truncate loading-gradient"
                  key={loadingStatus}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.12, ease: "easeOut" }}
                >
                  {loadingStatus}
                  {dots}
                </motion.span>
              </motion.div>
            ) : activeTitleKey ? (
              <motion.div
                className="flex items-center min-w-0"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                <span className="text-secondary mx-1 text-xl">｜</span>
                <motion.span
                  className="font-heading text-xl text-secondary truncate"
                  key={activeTitleKey}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                >
                  {/* Handle uppercase for standard sections, translation key for others */}
                  {showStandardSectionTitle && !isSpecialPage && !isLab
                    ? t(`header.${activeTitleKey}`)
                    : t(`header.${activeTitleKey}`)}
                </motion.span>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <motion.div
          layout
          layoutRoot
          className="flex items-center space-x-4"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Navigation - Only on desktop and when not on special pages */}
          {!shouldHideNav && (
            <LayoutGroup id="header-nav">
              <nav className="flex space-x-8">
                {NAV_ITEMS.map((item) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <NavigationLink {...getLinkProps(item.id, item.path)}>
                      {isActive(item.id) && <Underline />}
                      {t(`header.${item.id}`)}
                    </NavigationLink>
                  </motion.div>
                ))}
              </nav>
            </LayoutGroup>
          )}
        </motion.div>
      </div>

      {/* Staggered Menu - Only show when original nav is hidden */}
      {showStaggeredMenu && (
        <div className="fixed top-0 left-0 right-0 z-[60] pointer-events-none">
          <div className="container relative h-[64px] pointer-events-none">
            <div className="absolute top-4 right-4 pointer-events-auto">
              <StaggeredMenu
                items={menuItems}
                connectItems={connectItems}
                exploreItems={exploreItems}
                accentColor="hsl(var(--accent))"
                menuButtonColor="hsl(var(--foreground))"
                openMenuButtonColor="hsl(var(--foreground))"
                displaySocials={true}
                displayItemNumbering={false}
                onMenuOpen={() => setIsMenuOpen(true)}
                onMenuClose={() => setIsMenuOpen(false)}
                onSectionClick={(sectionId, event) => {
                  if (isHomePage) {
                    scrollToSection(sectionId, event);
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </motion.header>
  );
}

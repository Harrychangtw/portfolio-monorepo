"use client";

import { useEffect, useState, useRef, useCallback, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import { useIsMobile } from "@portfolio/lib/hooks/use-mobile";
import { useLanguage } from "@portfolio/lib/contexts/language-context";
import { useNavigation } from "@portfolio/lib/contexts/navigation-context";
import NavigationLink from "@portfolio/ui/navigation-link";
import { useStableHashScroll } from "@portfolio/lib/hooks/use-stable-hash-scroll";
import { scrollToSection as utilScrollToSection } from "@portfolio/lib/lib/scrolling";
import StaggeredMenu, { type SocialGroup } from "@portfolio/ui/staggered-menu";

const SCROLL_ANIMATION_DURATION = 400;

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

const STATUS_CYCLE_INTERVAL = 1000;
const EXTENDED_WAIT_THRESHOLD = 3000;
const EXTENDED_CYCLE_INTERVAL = 2000;

export interface NavItem {
  id: string;
  /** Path used when not on the home page (e.g. "/" or "/#updates") */
  path: string;
}

export interface SpecialPage {
  prefix: string;
  key: string;
}

export interface StaggeredMenuConfig {
  socialGroups: SocialGroup[];
  bottomSlot?: ReactNode;
  itemVariant?: "italic" | "uppercase";
  toggleVariant?: "body" | "heading";
  menuButtonColor?: string;
  openMenuButtonColor?: string;
  changeMenuColorOnOpen?: boolean;
  accentColor?: string;
  colors?: string[];
}

export interface SiteHeaderProps {
  brandName: string;
  brandHref?: string;
  brandVariant?: "italic" | "plain";
  brandClassName?: string;
  navItems: NavItem[];
  /** Override for nav-link className. */
  navLinkClassName?: string;
  staggeredMenu: StaggeredMenuConfig;
  showLoadingStatus?: boolean;
  enableLabDomain?: boolean;
  specialPages?: SpecialPage[];
  readingProgressMatchers?: RegExp[];
  hideAtPageBottom?: boolean;
}

const Underline = () => (
  <motion.span
    layoutId="navUnderline"
    layout="position"
    className="absolute left-0 bottom-[-4px] h-[1px] w-full bg-primary"
    initial={false}
    transition={{ type: "spring", stiffness: 500, damping: 40 }}
    transformTemplate={(_, transform) =>
      transform
        .replace(/translateY\([^)]*\)/g, "translateY(0px)")
        .replace(/translate\(\s*([^,]+),\s*([^)]+)\)/g, "translate($1, 0px)")
        .replace(
          /translate3d\(\s*([^,]+),\s*([^,]+),\s*([^)]+)\)/g,
          "translate3d($1, 0px, $3)",
        )
    }
  />
);

export default function SiteHeader({
  brandName,
  brandHref = "/",
  brandVariant = "plain",
  brandClassName,
  navItems,
  navLinkClassName,
  staggeredMenu,
  showLoadingStatus = false,
  enableLabDomain = false,
  specialPages,
  readingProgressMatchers,
  hideAtPageBottom = false,
}: SiteHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const navigationCtx = useNavigation();
  const isNavigating = showLoadingStatus
    ? !!navigationCtx?.isNavigating
    : false;

  const [activeSection, setActiveSection] = useState<string>(
    navItems[0]?.id ?? "",
  );
  const [isScrolling, setIsScrolling] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLab, setIsLab] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [hideForFooter, setHideForFooter] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<
    (typeof LOADING_STATUSES)[number] | (typeof EXTENDED_STATUSES)[number]
  >(LOADING_STATUSES[0]);
  const [dots, setDots] = useState(".");
  const [isExtendedWait, setIsExtendedWait] = useState(false);
  const navigationStartRef = useRef<number | null>(null);

  const isHomePage = pathname === "/";
  const isGraph = pathname?.startsWith("/graph") ?? false;

  const currentSpecialPage = specialPages?.find((page) =>
    pathname?.startsWith(page.prefix),
  );
  const isSpecialPage = !!currentSpecialPage;

  const matchesReadingProgress = !!readingProgressMatchers?.some((re) =>
    re.test(pathname || ""),
  );

  const isMobile = useIsMobile();
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { t, language } = useLanguage();

  // Loading status cycling
  useEffect(() => {
    if (!showLoadingStatus) return;
    if (!isNavigating) {
      navigationStartRef.current = null;
      setIsExtendedWait(false);
      return;
    }
    if (!navigationStartRef.current) {
      navigationStartRef.current = Date.now();
    }
    const statuses = isExtendedWait ? EXTENDED_STATUSES : LOADING_STATUSES;
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
  }, [showLoadingStatus, isNavigating, isExtendedWait, language]);

  useEffect(() => {
    if (!showLoadingStatus) return;
    if (!isNavigating) {
      setDots("");
      return;
    }
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 400);
    return () => clearInterval(interval);
  }, [showLoadingStatus, isNavigating]);

  // Lab subdomain detection
  useEffect(() => {
    if (!enableLabDomain) return;
    if (typeof window === "undefined") return;
    const hostname = window.location.hostname;
    setIsLab(
      hostname.includes("lab.localhost") ||
        hostname.includes("lab.harrychang.me"),
    );
  }, [enableLabDomain]);

  useStableHashScroll("header");

  // Header height CSS variable
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

  const scrollToSection = useCallback(
    (id: string, event?: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
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
    },
    [isHomePage],
  );

  // Initial section from hash
  useEffect(() => {
    if (isHomePage && window.location.hash) {
      const id = window.location.hash.substring(1);
      setActiveSection(id);
    } else if (isHomePage && window.scrollY < 50) {
      setActiveSection(navItems[0]?.id ?? "");
    }
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [isHomePage, navItems]);

  // Active section based on scroll
  useEffect(() => {
    if (!isHomePage) return;

    const handleScroll = () => {
      if (isScrolling || isMenuOpen) return;

      const headerHeight = document.querySelector("header")?.offsetHeight || 0;
      const scrollY = window.scrollY;

      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      if (windowHeight + scrollY >= documentHeight - 50) {
        const last = navItems[navItems.length - 1]?.id;
        if (last) {
          setActiveSection(last);
          return;
        }
      }

      const sections = navItems.map((item) => ({
        id: item.id,
        element: document.getElementById(item.id),
      }));

      let currentSection = navItems[0]?.id ?? "";

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        if (!section.element) continue;
        const sectionTop = section.element.offsetTop;
        const sectionBottom = sectionTop + section.element.offsetHeight;
        const isInSection =
          sectionTop <= scrollY + headerHeight + 50 &&
          sectionBottom > scrollY + headerHeight;
        if (isInSection) currentSection = section.id;
      }

      setActiveSection((prev) =>
        prev !== currentSection ? currentSection : prev,
      );
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage, isScrolling, isMenuOpen, navItems]);

  // Pathname → active section for non-home pages
  useEffect(() => {
    if (isHomePage) return;
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
      setIsScrolling(false);
    }
    if (isSpecialPage) {
      setActiveSection("");
      return;
    }
    // Find the first nav item whose id matches the leading path segment.
    const matched = navItems.find((item) =>
      pathname?.startsWith(`/${item.id}`),
    );
    setActiveSection(matched?.id ?? "");
  }, [pathname, isHomePage, isSpecialPage, navItems]);

  const showStandardSectionTitle =
    (isHomePage && activeSection !== (navItems[0]?.id ?? "")) ||
    (!isHomePage &&
      navItems.some((item) => pathname?.startsWith(`/${item.id}`)));

  let activeTitleKey: string | null = null;
  if (enableLabDomain && isLab) {
    activeTitleKey = "lab";
  } else if (enableLabDomain && isGraph) {
    activeTitleKey = "graph";
  } else if (currentSpecialPage) {
    activeTitleKey = currentSpecialPage.key;
  } else if (showStandardSectionTitle) {
    activeTitleKey = activeSection;
  }

  const isProjectDetailPage = !!pathname?.match(/^\/projects\/[^/]+$/);
  const isBlogDetailPage = !!pathname?.match(/^\/blog\/[^/]+$/);
  const isNotFound =
    !isHomePage &&
    !isSpecialPage &&
    !isProjectDetailPage &&
    !isBlogDetailPage &&
    !activeTitleKey;
  const shouldHideNav = isMobile || isLab || isGraph || isNotFound;

  const getLinkProps = (sectionId: string, pagePath: string) => {
    const active = isActive(sectionId);
    const baseClasses =
      navLinkClassName ??
      `relative font-heading ${active ? "text-primary" : "text-secondary hover:text-accent"} transition-colors duration-200 outline-none`;
    const className = navLinkClassName
      ? `${navLinkClassName} ${active ? "text-primary" : "text-secondary hover:text-accent"}`
      : baseClasses;
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
    return { className, href, onClick, scroll };
  };

  const showStaggeredMenu = isMobile && !isLab;

  const menuItems = navItems.map((item) => ({
    label: t(`header.${item.id}`) || item.id,
    ariaLabel: t(`header.${item.id}`) || item.id,
    link: `/#${item.id}`,
    sectionId: item.id,
  }));

  // Reading progress
  useEffect(() => {
    if (!matchesReadingProgress || isLab || isGraph) return;
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
  }, [matchesReadingProgress, isLab, isGraph]);

  // Hide-at-page-bottom
  useEffect(() => {
    if (!hideAtPageBottom) return;
    const onScroll = () => {
      if (isMobile || isMenuOpen) {
        setHideForFooter(false);
        return;
      }
      const doc = document.documentElement;
      const atBottom =
        doc.scrollHeight - (window.scrollY + window.innerHeight) <= 1;
      setHideForFooter(atBottom);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [hideAtPageBottom, isMobile, isMenuOpen]);

  const getHomeUrl = () => {
    if (!enableLabDomain || !isLab) return brandHref;
    const protocol =
      (typeof window !== "undefined" && window.location.protocol) || "http:";
    const hostnameWithPort =
      (typeof window !== "undefined" && window.location.host) ||
      "localhost:3000";
    const mainDomain = hostnameWithPort.replace("lab.", "");
    return `${protocol}//${mainDomain}`;
  };

  const brandClass =
    brandClassName ??
    `font-heading text-xl font-semibold transition-colors hover:text-accent outline-none whitespace-nowrap${
      brandVariant === "italic" ? " italic" : ""
    }`;
  const titleClass = `font-heading text-xl text-secondary truncate${
    brandVariant === "italic" ? " italic" : ""
  }${isNavigating ? " loading-gradient" : ""}`;
  const separatorMargin = brandVariant === "italic" ? "mx-2" : "mx-1";

  return (
    <motion.header
      id="main-header"
      layoutRoot
      className={`fixed top-0 left-0 right-0 border-b border-border py-4 z-[60] bg-background${
        hideAtPageBottom
          ? ` transition-transform duration-300 ease-out will-change-transform ${hideForFooter ? "-translate-y-full" : "translate-y-0"}`
          : ""
      }`}
    >
      {showLoadingStatus && isNavigating && (
        <motion.div
          className="absolute top-0 left-0 h-[2px] loading-bar"
          initial={{ x: "-100%", width: "18%" }}
          animate={{
            x: ["-100%", "600%"],
            width: ["18%", "28%", "18%"],
          }}
          transition={{
            x: { duration: 0.55, repeat: Infinity, ease: "linear" },
            width: {
              duration: 0.55,
              repeat: Infinity,
              ease: [0.4, 0, 0.6, 1],
              times: [0, 0.5, 1],
            },
          }}
        />
      )}

      {matchesReadingProgress && !isLab && !isGraph && !isNavigating && (
        <div
          className="absolute top-0 left-0 h-[2px] bg-accent"
          style={{ width: `${readingProgress}%` }}
        />
      )}

      <div className="container flex justify-between items-center">
        <div
          className={`flex items-center min-w-0 flex-1 ${
            showStaggeredMenu ? "mr-12" : "mr-4"
          }`}
        >
          <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
            {enableLabDomain && isLab ? (
              <a href={getHomeUrl()} className={brandClass}>
                {brandName}
              </a>
            ) : (
              <NavigationLink
                href={brandHref}
                className={brandClass}
                onClick={(e) => {
                  if (isHomePage) scrollToSection(navItems[0]?.id ?? "", e);
                }}
              >
                {brandName}
              </NavigationLink>
            )}
          </motion.div>

          <AnimatePresence mode="wait">
            {showLoadingStatus && isNavigating ? (
              <motion.div
                className="flex items-center min-w-0"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                <span className={`text-secondary ${separatorMargin} text-xl`}>
                  ｜
                </span>
                <motion.span
                  className={titleClass}
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
                <span className={`text-secondary ${separatorMargin} text-xl`}>
                  ｜
                </span>
                <motion.span
                  className={titleClass}
                  key={activeTitleKey}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                >
                  {t(`header.${activeTitleKey}`) ||
                    activeTitleKey.charAt(0).toUpperCase() +
                      activeTitleKey.slice(1)}
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
          {!shouldHideNav && (
            <LayoutGroup id="header-nav">
              <nav className="flex space-x-8">
                {navItems.map((item) => (
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

      {showStaggeredMenu && (
        <div className="fixed top-0 left-0 right-0 z-[60] pointer-events-none">
          <div className="container relative h-[64px] pointer-events-none">
            <div className="absolute top-4 right-4 pointer-events-auto">
              <StaggeredMenu
                items={menuItems}
                socialGroups={staggeredMenu.socialGroups}
                bottomSlot={staggeredMenu.bottomSlot}
                itemVariant={staggeredMenu.itemVariant}
                toggleVariant={staggeredMenu.toggleVariant}
                colors={staggeredMenu.colors}
                accentColor={staggeredMenu.accentColor ?? "hsl(var(--accent))"}
                menuButtonColor={
                  staggeredMenu.menuButtonColor ?? "hsl(var(--foreground))"
                }
                openMenuButtonColor={
                  staggeredMenu.openMenuButtonColor ??
                  staggeredMenu.menuButtonColor ??
                  "hsl(var(--foreground))"
                }
                changeMenuColorOnOpen={staggeredMenu.changeMenuColorOnOpen}
                displaySocials={staggeredMenu.socialGroups.length > 0}
                displayItemNumbering={false}
                onMenuOpen={() => setIsMenuOpen(true)}
                onMenuClose={() => setIsMenuOpen(false)}
                onSectionClick={(sectionId, event) => {
                  if (isHomePage) scrollToSection(sectionId, event);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </motion.header>
  );
}

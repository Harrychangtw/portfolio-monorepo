"use client";

import { useEffect, useState, useRef, useCallback, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import { useIsMobile } from "@portfolio/lib/hooks/use-mobile";
import { useLanguage } from "@portfolio/lib/contexts/language-context";
import { useNavigation } from "@portfolio/lib/contexts/navigation-context";
import NavigationLink from "@portfolio/ui/navigation-link";
import { useStableHashScroll } from "@portfolio/lib/hooks/use-stable-hash-scroll";
import { scrollToSection as utilScrollToSection } from "@portfolio/lib/lib/scrolling";
import { track, events } from "@portfolio/lib/analytics";
import StaggeredMenu, {
  type SocialGroup,
  type SocialItem,
} from "@portfolio/ui/staggered-menu";
import { ArrowUpRight, ChevronDown } from "lucide-react";

const SCROLL_ANIMATION_DURATION = 400;

/** Id of the site footer, used as the "More" click target. */
const FOOTER_ELEMENT_ID = "site-footer";
/** Grace period so the pointer can cross the gap from trigger to panel. */
const MORE_CLOSE_DELAY = 120;

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
  labHostnames?: string[];
  specialPages?: SpecialPage[];
  readingProgressMatchers?: RegExp[];
  hideAtPageBottom?: boolean;
  /**
   * Desktop-only "More" nav item. Hover or focus opens a panel of the same
   * groups the mobile staggered menu shows; clicking scrolls to the footer.
   */
  showMoreNav?: boolean;
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

/**
 * A single link in the desktop "More" panel.
 *
 * Hover styling sits on the anchor rather than on `group-hover:` children:
 * this repo pins postcss-selector-parser to 6.1.3, which makes Tailwind drop
 * every `group-*` variant at build time, so those classes never reach the CSS.
 */
const MoreLink = ({
  item,
  onNavigate,
}: {
  item: SocialItem;
  onNavigate: () => void;
}) => {
  // External destinations must not go through NavigationLink, or a redirect
  // route like /email (→ mailto:) fires the route-loading transition.
  const isInternal = item.link.startsWith("/") && !item.external;
  const content = (
    <>
      <span className="font-ibm-plex text-[15px] truncate">{item.label}</span>
      <ArrowUpRight className="w-3.5 h-3.5 opacity-60 shrink-0 ml-2" />
    </>
  );
  const className =
    "flex items-center justify-between w-full min-w-0 text-primary hover:text-accent focus-visible:text-accent transition-colors duration-200 outline-none";

  return (
    <li className="w-full">
      <motion.div whileHover={{ x: 2 }} transition={{ duration: 0.2 }}>
        {isInternal ? (
          <NavigationLink
            href={item.link}
            className={className}
            onClick={onNavigate}
          >
            {content}
          </NavigationLink>
        ) : (
          <a
            href={item.link}
            {...(item.newTab === false
              ? {}
              : { target: "_blank", rel: "noopener noreferrer" })}
            className={className}
            onClick={onNavigate}
          >
            {content}
          </a>
        )}
      </motion.div>
    </li>
  );
};

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
  labHostnames = ["lab.localhost"],
  specialPages,
  readingProgressMatchers,
  hideAtPageBottom = false,
  showMoreNav = false,
}: SiteHeaderProps) {
  const pathname = usePathname();
  const navigationCtx = useNavigation();
  const isNavigating = showLoadingStatus
    ? !!navigationCtx?.isNavigating
    : false;

  const [activeSection, setActiveSection] = useState<string>(
    navItems[0]?.id ?? "",
  );
  const [isScrolling, setIsScrolling] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isFooterInView, setIsFooterInView] = useState(false);
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
      labHostnames.some((h) => hostname === h || hostname.endsWith(`.${h}`)),
    );
  }, [enableLabDomain, labHostnames]);

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

  const isActive = (sectionId: string) =>
    !isMoreActive && activeSection === sectionId;

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
    const activeStateClasses = active
      ? "text-primary"
      : "text-secondary hover:text-accent";
    const className = navLinkClassName
      ? `${navLinkClassName} ${activeStateClasses}`
      : `relative font-heading ${activeStateClasses} transition-colors duration-200 outline-none`;
    const href = isHomePage
      ? `/#${sectionId}`
      : pagePath === "/"
        ? `/#${sectionId}`
        : pagePath;
    const onClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      track(events.HEADER_NAV_LINK_CLICK, {
        section_id: sectionId,
        path: pagePath,
        is_home_page: isHomePage,
      });
      if (isHomePage) scrollToSection(sectionId, e);
    };
    const scroll = !isHomePage;
    return { className, href, onClick, scroll };
  };

  // ── "More" menu (desktop only) ───────────────────────────────────────
  const moreTriggerRef = useRef<HTMLButtonElement>(null);
  const morePanelRef = useRef<HTMLDivElement>(null);
  const moreCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  // Set when we deliberately return focus to the trigger (Escape), so the
  // resulting focus event doesn't immediately reopen the panel we just closed.
  const skipFocusOpenRef = useRef(false);

  const cancelMoreClose = useCallback(() => {
    if (moreCloseTimeoutRef.current) {
      clearTimeout(moreCloseTimeoutRef.current);
      moreCloseTimeoutRef.current = null;
    }
  }, []);

  const openMore = useCallback(() => {
    cancelMoreClose();
    setIsMoreOpen(true);
  }, [cancelMoreClose]);

  const closeMore = useCallback(
    (delay = 0) => {
      cancelMoreClose();
      if (delay <= 0) {
        setIsMoreOpen(false);
        return;
      }
      moreCloseTimeoutRef.current = setTimeout(() => {
        setIsMoreOpen(false);
        moreCloseTimeoutRef.current = null;
      }, delay);
    },
    [cancelMoreClose],
  );

  useEffect(() => cancelMoreClose, [cancelMoreClose]);

  // Close on route change so the panel never outlives the page it opened on.
  useEffect(() => {
    setIsMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMoreOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      cancelMoreClose();
      setIsMoreOpen(false);
      // Only arm the skip flag when focus actually moves: if the trigger
      // already holds focus, no focus event follows to consume the flag and
      // it would suppress the next genuine tab-in.
      const trigger = moreTriggerRef.current;
      if (trigger && document.activeElement !== trigger) {
        skipFocusOpenRef.current = true;
        trigger.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMoreOpen, cancelMoreClose]);

  const handleMoreFocus = useCallback(() => {
    if (skipFocusOpenRef.current) {
      skipFocusOpenRef.current = false;
      return;
    }
    openMore();
  }, [openMore]);

  const scrollToFooter = useCallback(() => {
    closeMore();
    track(events.HEADER_NAV_LINK_CLICK, {
      section_id: "more",
      path: `#${FOOTER_ELEMENT_ID}`,
      is_home_page: isHomePage,
    });
    utilScrollToSection(FOOTER_ELEMENT_ID);
  }, [closeMore, isHomePage]);

  const moreGroups = (staggeredMenu.socialGroups || []).filter(
    (group) => group.items && group.items.length > 0,
  );
  const showMore = showMoreNav && !shouldHideNav && moreGroups.length > 0;
  // Reaching the footer is what "More" points at, so it owns the underline
  // there — otherwise the last section stays marked active at the page bottom.
  const isMoreActive = showMore && isFooterInView;

  // The header title must follow the same rule as the underline: at the
  // footer it belongs to "More", not to whichever section was last scrolled
  // past. Kept separate from activeTitleKey so the not-found detection above
  // still keys off the real section.
  const displayedTitleKey = isMoreActive ? "more" : activeTitleKey;

  const moreStateClasses = isMoreActive
    ? "text-primary"
    : "text-secondary hover:text-accent focus-visible:text-accent";
  const moreTriggerClassName = navLinkClassName
    ? `${navLinkClassName} ${moreStateClasses}`
    : `relative font-heading ${moreStateClasses} transition-colors duration-200 outline-none`;

  useEffect(() => {
    if (!showMore) {
      setIsFooterInView(false);
      return;
    }
    const footer = document.getElementById(FOOTER_ELEMENT_ID);
    if (!footer) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsFooterInView(entry.isIntersecting),
      // Counts only once the footer crosses the middle of the viewport.
      { rootMargin: "-50% 0px 0px 0px" },
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, [showMore, pathname]);

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
    const mainDomain = hostnameWithPort.replace(/^lab\./, "");
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
            ) : displayedTitleKey ? (
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
                  key={displayedTitleKey}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                >
                  {t(`header.${displayedTitleKey}`) ||
                    displayedTitleKey.charAt(0).toUpperCase() +
                      displayedTitleKey.slice(1)}
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

                {showMore && (
                  <div
                    className="relative"
                    onMouseEnter={openMore}
                    onMouseLeave={() => closeMore(MORE_CLOSE_DELAY)}
                    onBlur={(e) => {
                      if (
                        !e.currentTarget.contains(
                          e.relatedTarget as Node | null,
                        )
                      ) {
                        closeMore();
                      }
                    }}
                  >
                    <motion.div
                      whileHover={{ y: -2 }}
                      transition={{ duration: 0.2 }}
                    >
                      <button
                        ref={moreTriggerRef}
                        type="button"
                        aria-haspopup="true"
                        aria-expanded={isMoreOpen}
                        aria-controls="header-more-panel"
                        className={`${moreTriggerClassName} flex items-center gap-1`}
                        onFocus={handleMoreFocus}
                        onClick={scrollToFooter}
                        onKeyDown={(e) => {
                          if (e.key !== "ArrowDown") return;
                          e.preventDefault();
                          openMore();
                          // Panel mounts on the next frame when opening.
                          requestAnimationFrame(() => {
                            morePanelRef.current
                              ?.querySelector<HTMLAnchorElement>("a[href]")
                              ?.focus();
                          });
                        }}
                      >
                        {isMoreActive && <Underline />}
                        {t("header.more") || "More"}
                        <ChevronDown
                          aria-hidden="true"
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            isMoreOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </motion.div>

                    <AnimatePresence>
                      {isMoreOpen && (
                        <motion.div
                          id="header-more-panel"
                          ref={morePanelRef}
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          /* pt-3 bridges the gap so the pointer never leaves. */
                          className="absolute right-0 top-full pt-3 z-50"
                        >
                          <div className="w-max rounded-xl border border-border bg-card p-6 shadow-lg shadow-primary/5">
                            <div className="flex gap-10">
                              {moreGroups.map((group) => (
                                <div
                                  key={group.titleKey}
                                  className="min-w-[9rem]"
                                >
                                  <h3 className="font-heading text-sm uppercase tracking-wider text-secondary mb-4">
                                    {t(group.titleKey) ||
                                      group.fallbackTitle ||
                                      group.titleKey}
                                  </h3>
                                  <ul
                                    className="list-none m-0 p-0 flex flex-col gap-3.5"
                                    role="list"
                                  >
                                    {group.items.map((item) => (
                                      <MoreLink
                                        key={item.label + item.link}
                                        item={item}
                                        onNavigate={() => closeMore()}
                                      />
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
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

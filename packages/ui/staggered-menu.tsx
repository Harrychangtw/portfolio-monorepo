"use client";

import React, {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  useEffect,
} from "react";
import { gsap } from "gsap";
import { motion, AnimatePresence } from "motion/react";
import { cva, type VariantProps } from "class-variance-authority";
import { useLanguage } from "@portfolio/lib/contexts/language-context";
import NavigationLink from "@portfolio/ui/navigation-link";
import { ArrowUpRight } from "lucide-react";

export interface StaggeredMenuItem {
  label: string;
  ariaLabel: string;
  link: string;
  sectionId: string;
}

export interface SocialItem {
  label: string;
  link: string;
}

export interface SocialGroup {
  /** i18n key for header (e.g. "footer.socialContact"); fallback used if t() returns "" */
  titleKey: string;
  fallbackTitle?: string;
  items: SocialItem[];
}

const itemLabelVariants = cva(
  "sm-panel-item relative text-foreground font-heading font-semibold text-[3rem] md:text-[4rem] cursor-pointer leading-none transition-[background,color] duration-150 ease-linear inline-block no-underline pr-[1.4em] hover:text-[var(--sm-accent)]",
  {
    variants: {
      variant: {
        italic: "italic tracking-tight",
        uppercase: "uppercase tracking-[-2px]",
      },
    },
    defaultVariants: { variant: "uppercase" },
  },
);

const toggleVariants = cva(
  "sm-toggle relative inline-flex items-center gap-[0.3rem] bg-transparent border-0 cursor-pointer text-white font-medium leading-none overflow-visible p-2 hover:scale-105 transition-transform duration-200",
  {
    variants: {
      variant: {
        body: "font-body",
        heading: "font-heading",
      },
    },
    defaultVariants: { variant: "heading" },
  },
);

export interface StaggeredMenuProps {
  position?: "left" | "right";
  colors?: string[];
  items?: StaggeredMenuItem[];
  socialGroups?: SocialGroup[];
  displaySocials?: boolean;
  displayItemNumbering?: boolean;
  className?: string;
  menuButtonColor?: string;
  openMenuButtonColor?: string;
  accentColor?: string;
  changeMenuColorOnOpen?: boolean;
  itemVariant?: VariantProps<typeof itemLabelVariants>["variant"];
  toggleVariant?: VariantProps<typeof toggleVariants>["variant"];
  /** Render slot under socials (e.g. <LanguageSwitcher/><ThemeSwitcher/>). */
  bottomSlot?: React.ReactNode;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
  onSectionClick?: (
    sectionId: string,
    event?: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) => void;
  onHeaderBackgroundToggle?: (isMenuOpen: boolean) => void;
}

// Helper: resolve `hsl(var(--x))` style strings to concrete colors for GSAP.
const resolveColor = (color: string): string => {
  if (typeof window === "undefined") return color;
  const match = color.match(/var\(([^)]+)\)/);
  if (!match) return color;
  const varName = match[1];
  const varValue = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  if (!varValue) return color;
  if (color.startsWith("hsl(")) {
    return color.replace(/var\([^)]+\)/, varValue);
  }
  return `hsl(${varValue})`;
};

export const StaggeredMenu: React.FC<StaggeredMenuProps> = ({
  position = "right",
  colors = ["hsl(var(--accent))", "hsl(var(--background))"],
  items = [],
  socialGroups = [],
  displaySocials = false,
  displayItemNumbering = false,
  className,
  menuButtonColor = "hsl(var(--foreground))",
  openMenuButtonColor = "hsl(var(--foreground))",
  changeMenuColorOnOpen = true,
  accentColor = "hsl(var(--accent))",
  itemVariant = "uppercase",
  toggleVariant = "heading",
  bottomSlot,
  onMenuOpen,
  onMenuClose,
  onSectionClick,
  onHeaderBackgroundToggle,
}: StaggeredMenuProps) => {
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);
  const { t } = useLanguage();

  const panelRef = useRef<HTMLDivElement | null>(null);
  const preLayersRef = useRef<HTMLDivElement | null>(null);
  const preLayerElsRef = useRef<HTMLElement[]>([]);

  const plusHRef = useRef<HTMLSpanElement | null>(null);
  const plusVRef = useRef<HTMLSpanElement | null>(null);
  const iconRef = useRef<HTMLSpanElement | null>(null);

  const openTlRef = useRef<gsap.core.Timeline | null>(null);
  const closeTweenRef = useRef<gsap.core.Tween | null>(null);
  const spinTweenRef = useRef<gsap.core.Timeline | null>(null);
  const colorTweenRef = useRef<gsap.core.Tween | null>(null);

  const toggleBtnRef = useRef<HTMLButtonElement | null>(null);
  const busyRef = useRef(false);

  const itemEntranceTweenRef = useRef<gsap.core.Tween | null>(null);

  // Ensure menu is closed on mount
  useEffect(() => {
    setOpen(false);
    openRef.current = false;
    if (panelRef.current) {
      const offscreen = position === "left" ? -100 : 100;
      gsap.set(panelRef.current, { xPercent: offscreen });
    }
  }, [position]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panel = panelRef.current;
      const preContainer = preLayersRef.current;

      const plusH = plusHRef.current;
      const plusV = plusVRef.current;
      const icon = iconRef.current;

      if (!panel || !plusH || !plusV || !icon) return;

      let preLayers: HTMLElement[] = [];
      if (preContainer) {
        preLayers = Array.from(
          preContainer.querySelectorAll(".sm-prelayer"),
        ) as HTMLElement[];
      }
      preLayerElsRef.current = preLayers;

      const offscreen = position === "left" ? -100 : 100;
      gsap.set(panel, { xPercent: offscreen, immediateRender: true });
      if (preLayers.length > 0) {
        gsap.set(preLayers, { xPercent: offscreen, immediateRender: true });
      }

      const itemEls = Array.from(
        panel.querySelectorAll(".sm-panel-itemLabel"),
      ) as HTMLElement[];
      if (itemEls.length) {
        gsap.set(itemEls, { yPercent: 140, rotate: 10 });
      }

      const numberEls = Array.from(
        panel.querySelectorAll(".sm-panel-list[data-numbering] .sm-panel-item"),
      ) as HTMLElement[];
      if (numberEls.length) {
        gsap.set(numberEls, { ["--sm-num-opacity" as any]: 0 });
      }

      gsap.set(plusH, { transformOrigin: "50% 50%", rotate: 0 });
      gsap.set(plusV, { transformOrigin: "50% 50%", rotate: 90 });
      gsap.set(icon, { rotate: 0, transformOrigin: "50% 50%" });

      if (toggleBtnRef.current)
        toggleBtnRef.current.style.color = resolveColor(menuButtonColor);
    });
    return () => ctx.revert();
  }, [menuButtonColor, position]);

  const buildOpenTimeline = useCallback(() => {
    const panel = panelRef.current;
    const layers = preLayerElsRef.current || [];
    if (!panel) return null;

    openTlRef.current?.kill();
    if (closeTweenRef.current) {
      closeTweenRef.current.kill();
      closeTweenRef.current = null;
    }
    itemEntranceTweenRef.current?.kill();

    const itemEls = Array.from(
      panel.querySelectorAll(".sm-panel-itemLabel"),
    ) as HTMLElement[];
    const numberEls = Array.from(
      panel.querySelectorAll(".sm-panel-list[data-numbering] .sm-panel-item"),
    ) as HTMLElement[];

    const layerStates =
      layers.length > 0
        ? layers.map((el) => ({
            el,
            start: Number(gsap.getProperty(el, "xPercent")),
          }))
        : [];
    const panelStart = Number(gsap.getProperty(panel, "xPercent"));

    if (itemEls.length) gsap.set(itemEls, { yPercent: 140, rotate: 10 });
    if (numberEls.length)
      gsap.set(numberEls, { ["--sm-num-opacity" as any]: 0 });

    const tl = gsap.timeline({ paused: true });

    if (layerStates.length > 0) {
      layerStates.forEach((ls, i) => {
        const delay = i === 0 ? 0 : i * 0.15;
        tl.fromTo(
          ls.el,
          { xPercent: ls.start },
          {
            xPercent: 0,
            duration: i === 0 ? 0.6 : 0.5,
            ease: "power4.out",
          },
          delay,
        );
      });
    }

    const lastTime =
      layerStates.length > 0 ? (layerStates.length - 1) * 0.05 : 0;
    const panelInsertTime = lastTime + 0.1;
    const panelDuration = 0.5;

    tl.fromTo(
      panel,
      { xPercent: panelStart },
      { xPercent: 0, duration: panelDuration, ease: "power4.out" },
      panelInsertTime,
    );

    if (itemEls.length) {
      const itemsStartRatio = 0.15;
      const itemsStart = panelInsertTime + panelDuration * itemsStartRatio;

      tl.to(
        itemEls,
        {
          yPercent: 0,
          rotate: 0,
          duration: 1,
          ease: "power4.out",
          stagger: { each: 0.1, from: "start" },
        },
        itemsStart,
      );

      if (numberEls.length) {
        tl.to(
          numberEls,
          {
            duration: 0.6,
            ease: "power2.out",
            ["--sm-num-opacity" as any]: 1,
            stagger: { each: 0.08, from: "start" },
          },
          itemsStart + 0.1,
        );
      }
    }

    openTlRef.current = tl;
    return tl;
  }, []);

  const playOpen = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;
    const tl = buildOpenTimeline();
    if (tl) {
      tl.eventCallback("onComplete", () => {
        busyRef.current = false;
      });
      tl.play(0);
    } else {
      busyRef.current = false;
    }
  }, [buildOpenTimeline]);

  const playClose = useCallback(() => {
    openTlRef.current?.kill();
    openTlRef.current = null;
    itemEntranceTweenRef.current?.kill();

    const panel = panelRef.current;
    const layers = preLayerElsRef.current || [];
    if (!panel) return;

    const all: HTMLElement[] = layers.length > 0 ? [...layers, panel] : [panel];
    closeTweenRef.current?.kill();

    const offscreen = position === "left" ? -100 : 100;

    closeTweenRef.current = gsap.to(all, {
      xPercent: offscreen,
      duration: 0.32,
      ease: "power3.in",
      overwrite: "auto",
      onComplete: () => {
        const itemEls = Array.from(
          panel.querySelectorAll(".sm-panel-itemLabel"),
        ) as HTMLElement[];
        if (itemEls.length) gsap.set(itemEls, { yPercent: 140, rotate: 10 });

        const numberEls = Array.from(
          panel.querySelectorAll(
            ".sm-panel-list[data-numbering] .sm-panel-item",
          ),
        ) as HTMLElement[];
        if (numberEls.length)
          gsap.set(numberEls, { ["--sm-num-opacity" as any]: 0 });

        setOpen(false);
        busyRef.current = false;
      },
    });
  }, [position]);

  const animateIcon = useCallback((opening: boolean) => {
    const icon = iconRef.current;
    const h = plusHRef.current;
    const v = plusVRef.current;
    if (!icon || !h || !v) return;

    spinTweenRef.current?.kill();

    if (opening) {
      gsap.set(icon, { rotate: 0, transformOrigin: "50% 50%" });
      spinTweenRef.current = gsap
        .timeline({ defaults: { ease: "power4.out" } })
        .to(h, { rotate: 45, duration: 0.5 }, 0)
        .to(v, { rotate: -45, duration: 0.5 }, 0);
    } else {
      spinTweenRef.current = gsap
        .timeline({ defaults: { ease: "power3.inOut" } })
        .to(h, { rotate: 0, duration: 0.35 }, 0)
        .to(v, { rotate: 90, duration: 0.35 }, 0)
        .to(icon, { rotate: 0, duration: 0.001 }, 0);
    }
  }, []);

  const animateColor = useCallback(
    (opening: boolean) => {
      const btn = toggleBtnRef.current;
      if (!btn) return;
      colorTweenRef.current?.kill();
      if (changeMenuColorOnOpen) {
        const targetColor = resolveColor(
          opening ? openMenuButtonColor : menuButtonColor,
        );
        // Use CSS transition instead of GSAP — GSAP cannot parse CSS var() syntax
        // which causes a splitColor TypeError that crashes the ticker
        btn.style.transition = "color 0.3s ease-out 0.18s";
        btn.style.color = targetColor;
      } else {
        btn.style.transition = "";
        btn.style.color = resolveColor(menuButtonColor);
      }
    },
    [openMenuButtonColor, menuButtonColor, changeMenuColorOnOpen],
  );

  useEffect(() => {
    if (toggleBtnRef.current) {
      const targetColor =
        changeMenuColorOnOpen && openRef.current
          ? openMenuButtonColor
          : menuButtonColor;
      toggleBtnRef.current.style.color = resolveColor(targetColor);
    }
  }, [changeMenuColorOnOpen, menuButtonColor, openMenuButtonColor]);

  const toggleMenu = useCallback(() => {
    const target = !openRef.current;
    openRef.current = target;

    if (target) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
      onMenuOpen?.();
      onHeaderBackgroundToggle?.(true);
      setOpen(true);
      playOpen();
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0", 10) * -1);
      }
      onMenuClose?.();
      onHeaderBackgroundToggle?.(false);
      playClose();
    }

    animateIcon(target);
    animateColor(target);
  }, [
    playOpen,
    playClose,
    animateIcon,
    animateColor,
    onMenuOpen,
    onMenuClose,
    onHeaderBackgroundToggle,
  ]);

  const handleItemClick = useCallback(
    (
      item: StaggeredMenuItem,
      event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    ) => {
      if (onSectionClick) {
        onSectionClick(item.sectionId, event);
      }
      toggleMenu();
    },
    [onSectionClick, toggleMenu],
  );

  const renderLinkItem = (item: SocialItem, onClick?: () => void) => {
    const isInternal = item.link.startsWith("/");
    const isIcarus = item.link.includes("lab.") || item.link.includes("icarus");
    const linkClassName = `group flex items-center justify-between w-full min-w-0`;
    const textClassName = `font-ibm-plex text-primary text-[14px] sm:text-[15px] truncate transition-colors duration-200 ease-linear group-hover:text-[var(--sm-accent)] ${isIcarus ? "icarus-link" : ""}`;

    const content = (
      <>
        <span className={textClassName}>{item.label}</span>
        <ArrowUpRight className="w-3.5 h-3.5 text-secondary transition-all duration-300 group-hover:text-[var(--sm-accent)] group-hover:translate-x-0.5 shrink-0 ml-2" />
      </>
    );

    return (
      <li key={item.label + item.link} className="w-full">
        <motion.div whileHover={{ x: 2 }} transition={{ duration: 0.2 }}>
          {isInternal ? (
            <NavigationLink
              href={item.link}
              className={linkClassName}
              onClick={onClick}
            >
              {content}
            </NavigationLink>
          ) : (
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClassName}
              onClick={onClick}
            >
              {content}
            </a>
          )}
        </motion.div>
      </li>
    );
  };

  const visibleSocialGroups = (socialGroups || []).filter(
    (g) => g.items && g.items.length > 0,
  );
  const showSocials = displaySocials && visibleSocialGroups.length > 0;

  return (
    <div className="sm-scope w-full h-full">
      <div
        className={
          (className ? className + " " : "") +
          "staggered-menu-wrapper relative w-full h-full z-40"
        }
        style={
          accentColor
            ? ({ ["--sm-accent" as any]: accentColor } as React.CSSProperties)
            : undefined
        }
        data-position={position}
        data-open={open || undefined}
      >
        <div className="staggered-menu-toggle-container absolute top-0 right-0 z-20 pointer-events-auto">
          <motion.button
            ref={toggleBtnRef}
            className={toggleVariants({ variant: toggleVariant })}
            aria-label={
              open
                ? t("common.closeMenu") || "Close menu"
                : t("common.openMenu") || "Open menu"
            }
            aria-expanded={open}
            aria-controls="staggered-menu-panel"
            onClick={toggleMenu}
            type="button"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <AnimatePresence mode="wait">
              {open && (
                <motion.span
                  key="close-text"
                  className="mr-2 whitespace-nowrap"
                  aria-hidden="true"
                  style={{
                    writingMode: "horizontal-tb",
                    textOrientation: "mixed",
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 0.3,
                    ease: "easeOut",
                  }}
                >
                  {t("common.close") || "Close"}
                </motion.span>
              )}
            </AnimatePresence>

            <span
              ref={iconRef}
              className="sm-icon relative w-[14px] h-[14px] shrink-0 inline-flex items-center justify-center [will-change:transform]"
              aria-hidden="true"
            >
              <span
                ref={plusHRef}
                className="sm-icon-line absolute left-1/2 top-1/2 w-full h-[2px] bg-current rounded-[2px] -translate-x-1/2 -translate-y-1/2 [will-change:transform]"
              />
              <span
                ref={plusVRef}
                className="sm-icon-line sm-icon-line-v absolute left-1/2 top-1/2 w-full h-[2px] bg-current rounded-[2px] -translate-x-1/2 -translate-y-1/2 [will-change:transform]"
              />
            </span>
          </motion.button>
        </div>

        <aside
          id="staggered-menu-panel"
          ref={panelRef}
          className="staggered-menu-panel fixed top-0 right-0 h-[100dvh] bg-background flex flex-col p-[3rem_2rem_2rem_2rem] md:p-[6em_2rem_2rem_2rem] overflow-y-auto z-10"
          style={{
            visibility: open ? "visible" : "hidden",
          }}
          aria-hidden={!open}
        >
          <div className="sm-panel-inner flex-1 flex flex-col gap-5">
            <ul
              className="sm-panel-list list-none m-0 p-0 flex flex-col gap-4"
              role="list"
              data-numbering={displayItemNumbering || undefined}
            >
              {items && items.length ? (
                items.map((it, idx) => (
                  <li
                    className="sm-panel-itemWrap relative overflow-hidden leading-none"
                    key={it.label + idx}
                  >
                    <motion.div
                      whileHover={{ y: -2 }}
                      transition={{ duration: 0.2 }}
                    >
                      <NavigationLink
                        className={itemLabelVariants({ variant: itemVariant })}
                        href={it.link}
                        aria-label={it.ariaLabel}
                        data-index={idx + 1}
                        onClick={(e) => handleItemClick(it, e)}
                      >
                        <span className="sm-panel-itemLabel inline-block [transform-origin:50%_100%] will-change-transform whitespace-nowrap">
                          {it.label}
                          <span className="sm-panel-superscript">
                            {String(idx + 1)}
                          </span>
                        </span>
                      </NavigationLink>
                    </motion.div>
                  </li>
                ))
              ) : (
                <li
                  className="sm-panel-itemWrap relative overflow-hidden leading-none"
                  aria-hidden="true"
                >
                  <span className={itemLabelVariants({ variant: itemVariant })}>
                    <span className="sm-panel-itemLabel inline-block [transform-origin:50%_100%] will-change-transform">
                      No items
                    </span>
                  </span>
                </li>
              )}
            </ul>

            {/* Bottom Section: Socials & extras */}
            <div className="mt-auto pt-8 pb-4 flex flex-col gap-8">
              {showSocials && (
                <div
                  className={`sm-panel-socials grid gap-x-6 gap-y-8 w-full ${
                    visibleSocialGroups.length > 1
                      ? "grid-cols-2"
                      : "grid-cols-1"
                  }`}
                >
                  {visibleSocialGroups.map((group) => (
                    <div className="col-span-1" key={group.titleKey}>
                      <h3 className="font-heading text-sm uppercase tracking-wider text-secondary mb-4">
                        {t(group.titleKey) ||
                          group.fallbackTitle ||
                          group.titleKey}
                      </h3>
                      <ul
                        className="list-none m-0 p-0 flex flex-col gap-3.5"
                        role="list"
                      >
                        {group.items.map((item) =>
                          renderLinkItem(item, toggleMenu),
                        )}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {bottomSlot && (
                <div className="flex items-center gap-4 mt-2">{bottomSlot}</div>
              )}
            </div>
          </div>
        </aside>
      </div>

      <style jsx>{`
        .sm-scope .staggered-menu-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
          z-index: 40;
        }
        .sm-scope .sm-toggle {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          background: transparent;
          border: none;
          cursor: pointer;
          font-weight: 500;
          line-height: 1;
          overflow: visible;
        }
        .sm-scope .sm-toggle:focus-visible {
          outline: 2px solid hsl(var(--ring));
          outline-offset: 4px;
          border-radius: 4px;
        }
        .sm-scope .sm-toggle-textWrap {
          position: relative;
          display: inline-block;
          height: 1em;
          overflow: hidden;
          white-space: nowrap;
          width: var(--sm-toggle-width, auto);
          min-width: var(--sm-toggle-width, auto);
        }
        .sm-scope .sm-toggle-textInner {
          display: flex;
          flex-direction: column;
          line-height: 1;
        }
        .sm-scope .sm-toggle-line {
          display: block;
          height: 1em;
          line-height: 1;
        }
        .sm-scope .sm-icon {
          position: relative;
          width: 14px;
          height: 14px;
          flex: 0 0 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          will-change: transform;
        }
        .sm-scope .sm-panel-itemWrap {
          position: relative;
          overflow: hidden;
          line-height: 1;
        }
        .sm-scope .sm-icon-line {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 100%;
          height: 2px;
          background: currentColor;
          border-radius: 2px;
          transform: translate(-50%, -50%);
          will-change: transform;
        }
        .sm-scope .staggered-menu-panel {
          width: clamp(280px, 40vw, 440px);
        }
        .sm-scope [data-position="left"] .staggered-menu-panel {
          right: auto;
          left: 0;
        }
        .sm-scope .sm-prelayers {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: clamp(280px, 40vw, 440px);
          pointer-events: none;
        }
        .sm-scope [data-position="left"] .sm-prelayers {
          right: auto;
          left: 0;
        }
        .sm-scope .sm-prelayer {
          position: absolute;
          top: 0;
          right: 0;
          height: 100%;
          width: 100%;
          transform: translateX(0);
        }
        .sm-scope .sm-panel-inner {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .sm-scope .sm-panel-item:hover {
          color: var(--sm-accent, hsl(var(--accent)));
        }
        .sm-scope .sm-panel-list[data-numbering] {
          counter-reset: smItem;
        }
        .sm-scope .sm-panel-list[data-numbering] .sm-panel-item::after {
          counter-increment: smItem;
          content: counter(smItem, decimal-leading-zero);
          display: inline-block;
          vertical-align: super;
          margin-left: 0.1em;
          font-size: 18px;
          font-weight: 700;
          color: var(--sm-accent, hsl(var(--accent)));
          white-space: nowrap;
          pointer-events: none;
          user-select: none;
          opacity: var(--sm-num-opacity, 0);
        }
        .sm-scope .sm-panel-superscript {
          display: inline-block;
          vertical-align: super;
          margin-left: 0.3em;
          font-size: 18px;
          font-weight: 700;
          color: var(--sm-accent, hsl(var(--accent)));
          white-space: nowrap;
          pointer-events: none;
          user-select: none;
        }
        @media (max-width: 1024px) {
          .sm-scope .staggered-menu-panel {
            width: 100%;
            left: 0;
            right: 0;
          }
          .sm-scope .sm-prelayers {
            width: 100%;
            left: 0;
            right: 0;
          }
        }
        @media (max-width: 640px) {
          .sm-scope .staggered-menu-panel {
            width: 100%;
            left: 0;
            right: 0;
          }
          .sm-scope .sm-prelayers {
            width: 100%;
            left: 0;
            right: 0;
          }
        }
        @media (max-height: 600px) {
          .sm-scope .sm-panel-socials {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default StaggeredMenu;

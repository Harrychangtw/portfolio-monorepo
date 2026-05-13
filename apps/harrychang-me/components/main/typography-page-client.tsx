"use client";

import { useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { TypographySpecimen } from "./typography-specimen";
import { getAllFontFamilies } from "@portfolio/lib/lib/typography";
import { useLanguage } from "@portfolio/lib/contexts/language-context";
import { ImageContainer } from "@portfolio/ui/image-container";
import NavigationLink from "@portfolio/ui/navigation-link";
import GraphNextUp from "@/components/graph/graph-next-up";

/* ── Helpers ──────────────────────────────────────────────── */

function rgbToHex(rgb: string) {
  const values = rgb.match(/\d+/g)?.map(Number);
  if (!values || values.length < 3) return rgb;
  return (
    "#" +
    values
      .slice(0, 3)
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
      .toUpperCase()
  );
}

/* ── Color swatch ─────────────────────────────────────────── */

function ColorCard({ name, cssValue }: { name: string; cssValue: string }) {
  const swatchRef = useRef<HTMLDivElement>(null);
  const [resolvedHex, setResolvedHex] = useState<string>("");

  useEffect(() => {
    if (swatchRef.current) {
      const computed = window.getComputedStyle(swatchRef.current);
      const hex = rgbToHex(computed.backgroundColor);
      setResolvedHex(hex.startsWith("#") ? hex : ""); // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, [cssValue]);

  return (
    <div className="space-y-2">
      <div
        ref={swatchRef}
        className="w-full aspect-square border border-border"
        style={{ background: cssValue }}
      />
      <div>
        <p className="font-heading text-xs text-primary">{name}</p>
        <p className="font-mono text-[10px] text-secondary/50 uppercase">
          {resolvedHex || "—"}
        </p>
      </div>
    </div>
  );
}

/* ── Section (standard — mirrors CV/FAQ 12-col grid) ──────── */

function Section({
  index,
  title,
  children,
}: {
  index: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6 py-8 md:py-10 border-t border-border">
      {/* Index */}
      <div className="col-span-1 hidden md:block">
        <span className="label-mono">{String(index).padStart(2, "0")}</span>
      </div>

      {/* Label */}
      <div className="col-span-12 md:col-span-4 mb-4 md:mb-0">
        <h2 className="font-heading text-lg text-foreground uppercase tracking-wider">
          {title}
        </h2>
      </div>

      {/* Content */}
      <div className="col-span-12 md:col-start-7 md:col-span-6">{children}</div>
    </div>
  );
}

/* ── Section Split (Title + Desc on left, Elements on right) ──────── */

function SectionSplit({
  index,
  title,
  description,
  children,
}: {
  index: number;
  title: string;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6 py-8 md:py-10 border-t border-border">
      {/* Index */}
      <div className="col-span-1 hidden md:block">
        <span className="label-mono">{String(index).padStart(2, "0")}</span>
      </div>

      {/* Left Col: Title & Description */}
      <div className="col-span-12 md:col-span-4 flex flex-col h-full mb-6 md:mb-0">
        <div>
          <h2 className="font-heading text-lg text-foreground uppercase tracking-wider">
            {title}
          </h2>
        </div>
        {description && (
          <div className="mt-6 md:mt-auto text-body-secondary leading-relaxed">
            {description}
          </div>
        )}
      </div>

      {/* Right Col: Elements */}
      <div className="col-span-12 md:col-start-7 md:col-span-6">{children}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════ */

export default function TypographyPageClient() {
  const { t } = useLanguage();
  const fonts = getAllFontFamilies();

  /* ── Font descriptions ──────────────────────────────────── */

  const fontDescriptions: Record<string, string | undefined> = {
    "IBM Plex Sans": t("design.fontDescIbmPlex"),
    Artific: t("design.fontDescArtific"),
  };

  /* ── Color palette data ─────────────────────────────────── */

  const colorPalette = [
    { name: "Background", value: "hsl(var(--background))" },
    { name: "Foreground", value: "hsl(var(--foreground))" },
    { name: "Primary", value: "hsl(var(--primary))" },
    { name: "Secondary", value: "hsl(var(--secondary))" },
    { name: "Muted", value: "hsl(var(--muted))" },
    { name: "Accent", value: "hsl(var(--accent))" },
    { name: "Border", value: "hsl(var(--border))" },
    { name: "Gradient", value: "var(--gradient-primary)" },
  ];

  /* ── Type scale data ────────────────────────────────────── */

  const typeScale = [
    {
      label: t("design.display"),
      className: "font-heading text-5xl md:text-6xl font-bold tracking-tight",
      specimen: t("design.specimen1"),
    },
    {
      label: t("design.heading"),
      className: "font-heading text-3xl font-semibold",
      specimen: t("design.specimen2"),
    },
    {
      label: t("design.largeBody"),
      className: "font-ibm-plex text-xl",
      specimen: t("design.specimen3"),
    },
    {
      label: t("design.body"),
      className: "font-ibm-plex text-base",
      specimen: t("design.specimen4"),
    },
    {
      label: t("design.small"),
      className: "font-body text-sm",
      specimen: t("design.specimen5"),
    },
    {
      label: t("design.caption"),
      className: "font-mono text-xs uppercase",
      specimen: t("design.specimen6"),
    },
  ];

  /* ── Dynamic section numbering ──────────────────────────── */

  const fontStartIndex = 4;
  const spacingIndex = fontStartIndex + fonts.length;
  const motionIndex = spacingIndex + 1;
  const graphIndex = motionIndex + 1;

  return (
    <article className="container mt-24 md:mt-32 mb-24 md:mb-32">
      {/* ── Name / Title ──────────────────────────────────── */}
      <div className="mb-6 md:mb-8">
        <h1 className="font-heading text-[clamp(2.25rem,5.5vw,4.5rem)] font-regular tracking-[-0.02em] text-foreground leading-[0.95]">
          Design System
        </h1>
      </div>

      {/* ════════════════════════════════════════════════════
         Sections
         ════════════════════════════════════════════════════ */}

      {/* 01 — Identity */}
      <SectionSplit
        index={1}
        title={t("design.identity")}
        description={
          <div className="space-y-4">
            <p>{t("design.identityText1")}</p>
            <p>{t("design.identityText2")}</p>
          </div>
        }
      >
        <div className="flex flex-col gap-2">
          <NavigationLink
            href="/"
            className="block hover:opacity-90 transition-opacity"
          >
            <ImageContainer
              src="/images/optimized/projects/og/titlecard.webp"
              alt="Harry Chang Portfolio Identity — The Tower of Babel"
              aspectRatio={1.5}
              noInsetPadding={true}
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </NavigationLink>
          <div className="grid grid-cols-2 gap-2">
            <NavigationLink
              href="/blog"
              className="block hover:opacity-90 transition-opacity"
            >
              <ImageContainer
                src="/images/optimized/projects/og/og-image-blog.webp"
                alt="Blog: The Astronomer"
                aspectRatio={1200 / 630}
                noInsetPadding={true}
                sizes="(min-width: 768px) 25vw, 50vw"
              />
            </NavigationLink>
            <NavigationLink
              href="/#gallery"
              className="block hover:opacity-90 transition-opacity"
            >
              <ImageContainer
                src="/images/optimized/projects/og/og-image-gallery.webp"
                alt="Gallery: The Art of Painting"
                aspectRatio={1200 / 630}
                noInsetPadding={true}
                sizes="(min-width: 768px) 25vw, 50vw"
              />
            </NavigationLink>
            <a
              href="https://lab.harrychang.me"
              target="_blank"
              rel="noopener noreferrer"
              className="block hover:opacity-90 transition-opacity"
            >
              <ImageContainer
                src="/images/optimized/projects/og/og-image-lab.webp"
                alt="Lab: The Fall of Icarus"
                aspectRatio={1200 / 630}
                noInsetPadding={true}
                sizes="(min-width: 768px) 25vw, 50vw"
              />
            </a>
            <NavigationLink
              href="/#projects"
              className="block hover:opacity-90 transition-opacity"
            >
              <ImageContainer
                src="/images/optimized/projects/og/og-image-projects.webp"
                alt="Projects: The Forge of Vulcan"
                aspectRatio={1200 / 630}
                noInsetPadding={true}
                sizes="(min-width: 768px) 25vw, 50vw"
              />
            </NavigationLink>
            <NavigationLink
              href="/design"
              className="block hover:opacity-90 transition-opacity"
            >
              <ImageContainer
                src="/images/optimized/projects/og/og-image-design.webp"
                alt="Design System"
                aspectRatio={1200 / 630}
                noInsetPadding={true}
                sizes="(min-width: 768px) 25vw, 50vw"
              />
            </NavigationLink>
            <NavigationLink
              href="/manifesto"
              className="block hover:opacity-90 transition-opacity"
            >
              <ImageContainer
                src="/images/optimized/projects/og/og-image-manifesto.webp"
                alt="Manifesto"
                aspectRatio={1200 / 630}
                noInsetPadding={true}
                sizes="(min-width: 768px) 25vw, 50vw"
              />
            </NavigationLink>
            <NavigationLink
              href="/paper-reading"
              className="block hover:opacity-90 transition-opacity"
            >
              <ImageContainer
                src="/images/optimized/projects/og/og-image-reading.webp"
                alt="Paper Reading"
                aspectRatio={1200 / 630}
                noInsetPadding={true}
                sizes="(min-width: 768px) 25vw, 50vw"
              />
            </NavigationLink>
            <NavigationLink
              href="/uses"
              className="block hover:opacity-90 transition-opacity"
            >
              <ImageContainer
                src="/images/optimized/projects/og/og-image-uses.webp"
                alt="Uses & Setup"
                aspectRatio={1200 / 630}
                noInsetPadding={true}
                sizes="(min-width: 768px) 25vw, 50vw"
              />
            </NavigationLink>
          </div>
        </div>
      </SectionSplit>

      {/* 02 — Color Palette */}
      <SectionSplit
        index={2}
        title={t("design.colorPalette")}
        description={<p>{t("design.colorPaletteDesc")}</p>}
      >
        <div className="grid grid-cols-4 gap-2">
          {colorPalette.map((color) => (
            <ColorCard
              key={color.name}
              name={color.name}
              cssValue={color.value}
            />
          ))}
        </div>
      </SectionSplit>

      {/* 03 — Type Scale */}
      <SectionSplit
        index={3}
        title={t("design.typeScale")}
        description={<p>{t("design.typeScaleDesc")}</p>}
      >
        <div className="space-y-0">
          {typeScale.map((level, i) => (
            <div
              key={i}
              className="flex flex-col md:flex-row md:items-baseline justify-between gap-2 md:gap-4 py-4 first:pt-0 divider-subtle last:border-b-0"
            >
              <div className="order-2 md:order-1 min-w-0">
                <p className={`${level.className} text-primary truncate`}>
                  {level.specimen}
                </p>
              </div>
              <div className="order-1 md:order-2 shrink-0 md:text-right">
                <span className="label-mono md:text-xs uppercase tracking-wider">
                  {level.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </SectionSplit>

      {/* 04+ — Font Specimens */}
      {fonts.map((font, i) => (
        <SectionSplit
          key={font.name}
          index={fontStartIndex + i}
          title={font.name}
          description={
            fontDescriptions[font.name] ? (
              <p>{fontDescriptions[font.name]}</p>
            ) : undefined
          }
        >
          <TypographySpecimen font={font} index={i} />
        </SectionSplit>
      ))}

      {/* N — Spacing & Layout */}
      <SectionSplit
        index={spacingIndex}
        title={t("design.spacingGrid")}
        description={<p>{t("design.spacingDesc")}</p>}
      >
        <div className="space-y-0">
          {[
            {
              label: t("design.spacing.container"),
              value: t("design.spacing.containerVal"),
            },
            {
              label: t("design.spacing.grid"),
              value: t("design.spacing.gridVal"),
            },
            {
              label: t("design.spacing.header"),
              value: t("design.spacing.headerVal"),
            },
            {
              label: t("design.spacing.section"),
              value: t("design.spacing.sectionVal"),
            },
            {
              label: t("design.spacing.gap"),
              value: t("design.spacing.gapVal"),
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex flex-col md:flex-row md:items-baseline justify-between gap-2 md:gap-4 py-4 first:pt-0 divider-subtle last:border-b-0"
            >
              <div className="order-2 md:order-1 min-w-0">
                <span className="font-body text-sm md:text-base text-primary leading-relaxed">
                  {item.value}
                </span>
              </div>
              <div className="order-1 md:order-2 shrink-0 md:text-right">
                <span className="label-mono md:text-xs uppercase tracking-wider">
                  {item.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </SectionSplit>

      {/* N+1 — Motion & Interaction */}
      <SectionSplit
        index={motionIndex}
        title={t("design.motionInteraction")}
        description={<p>{t("design.motionDesc")}</p>}
      >
        {" "}
        <div className="space-y-0">
          {[
            {
              label: t("design.motion.library"),
              value: t("design.motion.libraryVal"),
            },
            {
              label: t("design.motion.transitions"),
              value: t("design.motion.transitionsVal"),
            },
            {
              label: t("design.motion.error404"),
              value: t("design.motion.error404Val"),
            },
            {
              label: t("design.motion.images"),
              value: t("design.motion.imagesVal"),
            },
            {
              label: t("design.motion.nowPlaying"),
              value: t("design.motion.nowPlayingVal"),
            },
            {
              label: t("design.motion.scroll"),
              value: t("design.motion.scrollVal"),
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex flex-col md:flex-row md:items-baseline justify-between gap-2 md:gap-4 py-4 first:pt-0 divider-subtle last:border-b-0"
            >
              <div className="order-2 md:order-1 min-w-0">
                <span className="font-body text-sm md:text-base text-primary leading-relaxed">
                  {item.value}
                </span>
              </div>
              <div className="order-1 md:order-2 shrink-0 md:text-right">
                <span className="label-mono md:text-xs uppercase tracking-wider">
                  {item.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </SectionSplit>
      {/* N+2 — Knowledge Graph */}
      <SectionSplit
        index={graphIndex}
        title={t("design.knowledgeGraph")}
        description={
          <div className="space-y-4">
            <p>{t("design.knowledgeGraphDesc1")}</p>
            <p>{t("design.knowledgeGraphDesc2")}</p>
          </div>
        }
      >
        <GraphNextUp
          defaultHubSlug="root"
          defaultHubCard={{
            slug: "root",
            title: "Harry Chang",
            category: "harrychang.me",
            imageUrl: "/images/og-image.webp",
            href: "/",
            rawImage: true,
          }}
          className="w-full"
        />
      </SectionSplit>
    </article>
  );
}

"use client";

import type { ReactNode } from "react";
import { useLanguage } from "@portfolio/lib/contexts/language-context";
import { ImageContainer } from "@portfolio/ui/image-container";
import { useIsMobile } from "@portfolio/lib/hooks/use-mobile";

interface UsesItem {
  name: string;
  key?: string;
  value: string | string[];
  list?: string | string[];
}

/* ── Section wrapper ────────────────────────────────────── */
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
        <h2 className="section-label">{title}</h2>
      </div>

      {/* Content */}
      <div className="col-span-12 md:col-start-7 md:col-span-6">{children}</div>
    </div>
  );
}

/* ── Item row ────────────────────────────────────────────── */
function ItemRow({
  label,
  value,
}: {
  label: string;
  value: string | string[];
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2 md:gap-4 py-4 first:pt-0 divider-subtle last:border-b-0">
      {/* Actual Item (Value) - Left on desktop, Bottom on mobile */}
      <div className="order-2 md:order-1 min-w-0">
        {Array.isArray(value) ? (
          <div className="flex flex-col gap-1">
            {value.map((v, i) => (
              <span
                key={i}
                className="font-ibm-plex text-sm md:text-base text-primary leading-relaxed block"
              >
                {v}
              </span>
            ))}
          </div>
        ) : (
          <span className="font-ibm-plex text-sm md:text-base text-primary leading-relaxed block">
            {value}
          </span>
        )}
      </div>

      {/* Label (What it is) - Right on desktop, Top on mobile */}
      <div className="order-1 md:order-2 shrink-0 pt-1 md:pt-0 md:text-right">
        <span className="font-mono text-sm text-secondary uppercase tracking-wider">
          {label}
        </span>
      </div>
    </div>
  );
}

export default function UsesPage() {
  const { t, getTranslationData } = useLanguage();
  const isMobile = useIsMobile();

  const hardware = getTranslationData("hardware", "uses");
  const software = getTranslationData("software", "uses");

  // The ImageContainer adds horizontal padding to portrait images on desktop
  // to fit a 1.5 target aspect ratio. This creates unwanted space.
  // This style object calculates the necessary width and negative margin
  // to counteract the internal padding, making the image fill its column.
  const desktopImageWrapperStyle = {
    width: "187.5%",
    marginLeft: "-43.75%",
  };

  const images = [
    {
      src: "/images/optimized/projects/uses/vertical_left.webp",
      alt: "Workspace left view",
    },
    {
      src: "/images/optimized/projects/uses/vertical_center.webp",
      alt: "Workspace center view",
    },
    {
      src: "/images/optimized/projects/uses/vertical_right.webp",
      alt: "Workspace right view",
    },
  ];

  return (
    <article className="container mt-24 md:mt-32 mb-24 md:mb-32">
      {/* ── Name / Title ──────────────────────────────────── */}
      <div className="mb-6 md:mb-8">
        <h1 className="font-heading text-[clamp(2.25rem,5.5vw,4.5rem)] font-regular tracking-[-0.02em] text-foreground leading-[0.95]">
          Uses & Setup
        </h1>
      </div>

      <div className="space-y-0">
        {/* Intro Images span full width */}
        <div className="grid grid-cols-12 gap-4 md:gap-6 pb-12 md:pb-16">
          <div className="col-span-12">
            <div className="w-full">
              {isMobile ? (
                // Mobile: Show only the center image, full width
                <ImageContainer
                  src={images[1].src}
                  alt={images[1].alt}
                  aspectRatio={0.8}
                  noInsetPadding={true}
                />
              ) : (
                // Desktop: Show all three images in a grid, matching 12-col alignment
                <div className="grid grid-cols-3 gap-[var(--column-spacing)]">
                  {images.map((image) => (
                    // This outer div clips the oversized child to prevent layout disruption
                    <div key={image.src} className="overflow-hidden">
                      <div style={desktopImageWrapperStyle}>
                        <ImageContainer
                          src={image.src}
                          alt={image.alt}
                          aspectRatio={0.8}
                          noInsetPadding={true}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 01 — Core Workstation */}
        <Section index={1} title={t("hardware.coreWorkstation.title", "uses")}>
          <div className="space-y-0">
            {(hardware?.coreWorkstation?.items || []).map(
              (item: UsesItem, i: number) => (
                <ItemRow key={i} label={item.name} value={item.value} />
              ),
            )}
          </div>
        </Section>

        {/* 02 — Office & Ergonomics */}
        <Section index={2} title={t("hardware.office.title", "uses")}>
          <div className="space-y-0">
            {(hardware?.office?.items || []).map(
              (item: UsesItem, i: number) => (
                <ItemRow key={i} label={item.name} value={item.value} />
              ),
            )}
          </div>
        </Section>

        {/* 03 — Home Server */}
        <Section index={3} title={t("hardware.homeServer.title", "uses")}>
          <div className="space-y-0">
            {(hardware?.homeServer?.items || []).map(
              (item: UsesItem, i: number) => (
                <ItemRow key={i} label={item.name} value={item.value} />
              ),
            )}
          </div>
        </Section>

        {/* 04 — Photography Gear */}
        <Section index={4} title={t("hardware.photography.title", "uses")}>
          <div className="space-y-0">
            {(hardware?.photography?.items || []).map(
              (item: UsesItem, i: number) => (
                <ItemRow
                  key={i}
                  label={item.name || item.key || ""}
                  value={item.list || item.value}
                />
              ),
            )}
          </div>
        </Section>

        {/* 05 — Development & Coding */}
        <Section index={5} title={t("software.development.title", "uses")}>
          <div className="space-y-0">
            {(software?.development?.items || []).map(
              (item: UsesItem, i: number) => (
                <ItemRow key={i} label={item.name} value={item.value} />
              ),
            )}
          </div>
        </Section>

        {/* 06 — Design & Creative */}
        <Section index={6} title={t("software.design.title", "uses")}>
          <div className="space-y-0">
            {(software?.design?.items || []).map(
              (item: UsesItem, i: number) => (
                <ItemRow key={i} label={item.name} value={item.value} />
              ),
            )}
          </div>
        </Section>

        {/* 07 — Productivity & Utilities */}
        <Section index={7} title={t("software.productivity.title", "uses")}>
          <div className="space-y-0">
            {(software?.productivity?.items || []).map(
              (item: UsesItem, i: number) => (
                <ItemRow key={i} label={item.name} value={item.value} />
              ),
            )}
          </div>
        </Section>
      </div>
    </article>
  );
}

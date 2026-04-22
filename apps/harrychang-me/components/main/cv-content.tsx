"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { useLanguage } from "@portfolio/lib/contexts/language-context";

interface CvEntry {
  title: string;
  subtitle?: string;
  meta?: string;
  date: string;
  bullets?: string[];
}

interface CvPublication {
  title: string;
  date: string;
  description: string;
}

interface CvSkill {
  category: string;
  skills: string;
}

/* ================================================================
   CV Content — Swiss / Pentagram-style typographic résumé
   Grid pattern mirrors the FAQ section (12-col, numbered rows).
   ================================================================ */

interface CvContentProps {
  pdfUrl: string;
}

/* ── Section row (FAQ grid) ───────────────────────────────── */

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

/* ── Entry (experience / education) ───────────────────────── */

function Entry({
  title,
  subtitle,
  date,
  items,
}: {
  title: string;
  subtitle?: string;
  meta?: string;
  date: string;
  items?: string[];
}) {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5 sm:gap-4 mb-0.5">
        <h3 className="font-heading font-medium text-lg text-foreground leading-snug">
          {title}
        </h3>
        <span className="font-mono text-xs text-secondary/50 whitespace-nowrap shrink-0">
          {date}
        </span>
      </div>
      {subtitle && <p className="text-body-secondary">{subtitle}</p>}
      {items && items.length > 0 && (
        <ul className="mt-2.5 space-y-1">
          {items.map((item, i) => (
            <li
              key={i}
              className="text-body-secondary leading-relaxed flex items-start gap-2.5"
            >
              <span className="shrink-0 mt-[9px] w-[3px] h-[3px] rounded-full bg-secondary/50" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ── Skill row ────────────────────────────────────────────── */

function SkillRow({ category, items }: { category: string; items: string }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-6">
      <span className="font-heading font-medium text-foreground">
        {category}
      </span>
      <span className="text-body-secondary leading-relaxed">{items}</span>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════
   Main Component
   ═════════════════════════════════════════════════════════════ */

export default function CvContent({ pdfUrl }: CvContentProps) {
  const { t, getTranslationData } = useLanguage();

  // Safely fetch dynamic array content from localization JSON
  const educationItems =
    getTranslationData("sections.education.items", "cv") || [];
  const researchItems =
    getTranslationData("sections.research.items", "cv") || [];
  const leadershipItems =
    getTranslationData("sections.leadership.items", "cv") || [];
  const publicationItems =
    getTranslationData("sections.publications.items", "cv") || [];
  const projectItems =
    getTranslationData("sections.projects.items", "cv") || [];
  const skillItems = getTranslationData("sections.skills.items", "cv") || [];

  return (
    <article className="container mt-24 md:mt-32 mb-24 md:mb-32">
      {/* ── Name ──────────────────────────────────────────── */}
      <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:justify-between md:items-baseline">
        <h1 className="font-heading text-[clamp(2.25rem,5.5vw,4.5rem)] font-regular tracking-[-0.02em] text-foreground leading-[0.95]">
          {t("header.name", "cv")}
        </h1>
      </div>

      {/* ── Contact + PDF link ─────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-12 md:mb-16">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-body text text-primary">
          <span>{t("header.location", "cv")}</span>
          <span className="text-border">—</span>
          <span>harrychang.me</span>
          <span className="text-border">—</span>
          <span>chiwei@harrychang.me</span>
        </div>
        <motion.div whileHover={{ y: -2, x: 4 }} transition={{ duration: 0.2 }}>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-ibm-plex text-primary hover:text-accent transition-colors flex items-center gap-1.5 group shrink-0"
          >
            <span>{t("header.viewPdf", "cv")}</span>
            <ArrowUpRight className="w-4 h-4 text-secondary transition-all duration-300 group-hover:text-accent" />
          </a>
        </motion.div>
      </div>
      {/* ════════════════════════════════════════════════════
         Sections
         ════════════════════════════════════════════════════ */}

      {/* 01 — Summary */}
      <Section index={1} title={t("sections.summary.title", "cv")}>
        <p className="font-body text text-secondary leading-relaxed">
          {t("sections.summary.content", "cv")}
        </p>
      </Section>

      {/* 02 — Education */}
      <Section index={2} title={t("sections.education.title", "cv")}>
        <div className="space-y-8">
          {educationItems.map((item: CvEntry, i: number) => (
            <Entry
              key={i}
              title={item.title}
              subtitle={item.subtitle}
              meta={item.meta}
              date={item.date}
              items={item.bullets}
            />
          ))}
        </div>
      </Section>

      {/* 03 — Research & Development */}
      <Section index={3} title={t("sections.research.title", "cv")}>
        <div className="space-y-8">
          {researchItems.map((item: CvEntry, i: number) => (
            <Entry
              key={i}
              title={item.title}
              subtitle={item.subtitle}
              meta={item.meta}
              date={item.date}
              items={item.bullets}
            />
          ))}
        </div>
      </Section>

      {/* 04 — Leadership & Design */}
      <Section index={4} title={t("sections.leadership.title", "cv")}>
        <div className="space-y-8">
          {leadershipItems.map((item: CvEntry, i: number) => (
            <Entry
              key={i}
              title={item.title}
              subtitle={item.subtitle}
              meta={item.meta}
              date={item.date}
              items={item.bullets}
            />
          ))}
        </div>
      </Section>

      {/* 05 — Publications */}
      <Section index={5} title={t("sections.publications.title", "cv")}>
        <div className="space-y-7">
          {publicationItems.map((item: CvPublication, i: number) => (
            <div key={i}>
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5 sm:gap-4 mb-0.5">
                <h3 className="font-heading font-medium text-foreground leading-snug">
                  {item.title}
                </h3>
                <span className="font-mono text-sm text-secondary/50 whitespace-nowrap shrink-0">
                  {item.date}
                </span>
              </div>
              <p className="text-body-secondary leading-snug">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* 06 — Selected Projects */}
      <Section index={6} title={t("sections.projects.title", "cv")}>
        <div className="space-y-8">
          {projectItems.map((item: CvEntry, i: number) => (
            <Entry
              key={i}
              title={item.title}
              meta={item.meta}
              date={item.date}
              items={item.bullets}
            />
          ))}
        </div>
      </Section>

      {/* 07 — Skills */}
      <Section index={7} title={t("sections.skills.title", "cv")}>
        <div className="space-y-4">
          {skillItems.map((item: CvSkill, i: number) => (
            <SkillRow key={i} category={item.category} items={item.skills} />
          ))}
        </div>
      </Section>

      {/* ── Footer ────────────────────────────────────────── */}
      <div className="border-t border-border pt-8 md:pt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <span className="label-mono uppercase whitespace-nowrap overflow-hidden text-ellipsis">
          {t("footer.text", "cv")}
        </span>
        <motion.div whileHover={{ y: -2, x: 4 }} transition={{ duration: 0.2 }}>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-primary hover:text-accent transition-colors flex items-center gap-2 group shrink-0"
          >
            <span>{t("footer.downloadPdf", "cv")}</span>
            <ArrowUpRight className="w-4 h-4 text-secondary transition-all duration-300 group-hover:text-accent" />
          </a>
        </motion.div>
      </div>
    </article>
  );
}

"use client";

import { useLanguage } from "@portfolio/lib/contexts/language-context";
import AnimatedPaperList from "@/components/main/animated-paper-list";
import PaginationControls from "@portfolio/ui/pagination-controls";
import { Paper } from "@portfolio/lib/types/paper";
import { motion } from "motion/react";

interface PaperReadingPageClientProps {
  paginatedPapers: Paper[];
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function PaperReadingPageClient({
  paginatedPapers,
  hasNextPage,
  hasPrevPage,
}: PaperReadingPageClientProps) {
  const { t } = useLanguage();

  return (
    <article className="container mt-24 md:mt-32 mb-24 md:mb-32 page-transition-enter">
      {/* ── Title ──────────────────────────────────────────── */}
      <div className="mb-6 md:mb-8">
        <h1 className="font-heading text-[clamp(2.25rem,5.5vw,4.5rem)] font-regular tracking-[-0.02em] text-foreground leading-[0.95]">
          Paper Reading List
        </h1>
      </div>

      <div className="border-t border-border">
        <AnimatedPaperList papers={paginatedPapers} />
      </div>

      <PaginationControls hasNextPage={hasNextPage} hasPrevPage={hasPrevPage} />
    </article>
  );
}

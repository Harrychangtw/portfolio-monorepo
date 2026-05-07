"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { useLanguage } from "@portfolio/lib/contexts/language-context";
import AnimatedPaperList from "@/components/main/animated-paper-list";
import PaginationControls from "@portfolio/ui/pagination-controls";
import { Paper } from "@portfolio/lib/types/paper";

const PAPERS_PER_PAGE = 15;

interface PaperReadingPageClientProps {
  papers: Paper[];
}

export default function PaperReadingPageClient({
  papers,
}: PaperReadingPageClientProps) {
  useLanguage();

  const searchParams = useSearchParams();
  const currentPage = Math.max(1, Number(searchParams.get("page")) || 1);

  const { paginatedPapers, hasNextPage, hasPrevPage } = useMemo(() => {
    const start = (currentPage - 1) * PAPERS_PER_PAGE;
    const end = currentPage * PAPERS_PER_PAGE;
    return {
      paginatedPapers: papers.slice(start, end),
      hasPrevPage: currentPage > 1,
      hasNextPage: papers.length > end,
    };
  }, [papers, currentPage]);

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

"use client";

import { useLanguage } from '@portfolio/lib/contexts/language-context';
import AnimatedPaperList from "@/components/main/animated-paper-list";
import PaginationControls from "@portfolio/ui/pagination-controls";
import { Paper } from "@portfolio/lib/types/paper";
import { motion } from "framer-motion";

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
    <div className="page-transition-enter">
      <div className="container mx-auto px-4 py-8">
        <motion.h1 
          className="text-3xl font-bold mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
        </motion.h1>
        <AnimatedPaperList papers={paginatedPapers} />
        <PaginationControls hasNextPage={hasNextPage} hasPrevPage={hasPrevPage} />
      </div>
    </div>
  );
}

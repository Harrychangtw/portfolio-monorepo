"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useLanguage } from '@portfolio/lib/contexts/language-context';

interface PaginationControlsProps {
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function PaginationControls({
  hasNextPage,
  hasPrevPage,
}: PaginationControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;
  const { t } = useLanguage();

  const handlePrev = () => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(currentPage - 1));
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleNext = () => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(currentPage + 1));
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <motion.div 
      className="flex justify-between items-center mt-12 pt-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      {/* Previous Button */}
      <motion.div 
        whileHover={hasPrevPage ? { y: -2 } : {}} 
        transition={{ duration: 0.2 }}
      >
        <button 
          onClick={handlePrev} 
          disabled={!hasPrevPage} 
          className="group flex items-center gap-2 font-heading text-lg text-secondary hover:text-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors uppercase tracking-wide"
        >
          <span className="text-xl">←</span>
          <span className="hidden sm:inline text-base">{t('readingList.previous')}</span>
        </button>
      </motion.div>

      {/* Page Indicator */}
      <span className="font-heading text-sm text-secondary uppercase tracking-wider">
        {t('readingList.page')} {currentPage}
      </span>

      {/* Next Button */}
      <motion.div 
        whileHover={hasNextPage ? { y: -2 } : {}} 
        transition={{ duration: 0.2 }}
      >
        <button 
          onClick={handleNext} 
          disabled={!hasNextPage} 
          className="group flex items-center gap-2 font-heading text-lg text-secondary hover:text-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors uppercase tracking-wide"
        >
          <span className="hidden sm:inline text-base">{t('readingList.next')}</span>
          <span className="text-xl">→</span>
        </button>
      </motion.div>
    </motion.div>
  );
}

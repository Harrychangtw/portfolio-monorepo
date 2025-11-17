"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useSearchParams } from "next/navigation"
import { Paper } from "@portfolio/lib/types/paper"
import PaperCard from "./paper-card"

interface AnimatedPaperListProps {
  papers: Paper[]
}

export default function AnimatedPaperList({ papers }: AnimatedPaperListProps) {
  const searchParams = useSearchParams()
  const currentPage = searchParams.get("page") ?? "1"

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentPage}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ 
          duration: 0.2,
          ease: "easeInOut"
        }}
        className="space-y-4"
      >
        {papers.map((paper, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.5,
              delay: index * 0.04,
              ease: "easeOut"
            }}
          >
            <PaperCard paper={paper} />
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  )
}

"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useIsMobile } from '@portfolio/lib/hooks/use-mobile'

const aiLinks = [
  { id: 'ChatGPT', name: 'ChatGPT', icon: '/chatgpt.svg', url: 'https://chatgpt.com/?q=Who+is+Harry+Chang+(harrychang.me)%3F' },
  { id: 'Claude', name: 'Claude', icon: '/claude.svg', url: 'https://claude.ai/new?q=Who+is+Harry+Chang+(harrychang.me)%3F' },
  { id: 'Gemini', name: 'Gemini', icon: '/gemini.svg', url: 'https://gemini.google.com/app?q=Who+is+Harry+Chang+(harrychang.me)%3F' },
  { id: 'Perplexity', name: 'Perplexity', icon: '/perplexity.svg', url: 'https://www.perplexity.ai/search?q=Who+is+Harry+Chang+(harrychang.me)%3F' },
];

export default function AskAi() {
  const isMobile = useIsMobile()
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  const handleMouseEnter = (e: React.MouseEvent, id: string) => {
    if (!isMobile) {
      setTooltipPosition({ x: e.clientX, y: e.clientY });
      setActiveTooltipId(id);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMobile && activeTooltipId) {
      setTooltipPosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setActiveTooltipId(null);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center gap-2"
      >
        {aiLinks.map((ai) => (
          <motion.a
            key={ai.id}
            href={ai.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-secondary/10 transition-colors"
            onMouseEnter={(e) => handleMouseEnter(e, ai.name)}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            whileHover={{ y: -2 }} 
            transition={{ duration: 0.2 }}
          >
            <img 
              src={ai.icon} 
              alt={ai.name} 
              className="w-4 h-4 opacity-50 hover:opacity-100 hover:scale-110 transition-all duration-300 dark:invert" 
            />
          </motion.a>
        ))}
      </motion.div>

      <AnimatePresence>
        {activeTooltipId && !isMobile && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed z-50 pointer-events-none"
            style={{
              top: tooltipPosition.y - 40,
              left: tooltipPosition.x,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="bg-accent text-background text-sm px-3 py-1.5 rounded-md shadow-lg font-heading whitespace-nowrap">
              Ask {activeTooltipId} who I am
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

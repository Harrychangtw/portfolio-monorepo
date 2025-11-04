"use client";
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import WaitlistForm from '@/components/lab/waitlist-form';
import MinimalistBackground from '@/components/minimalist-background';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedIcarusIcon from '@/components/lab/animated-icon';

export default function LabPageClient() {
  const { t, language, isLoading } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null);

  // Fetch waitlist count on mount
  useEffect(() => {
    fetch('/api/lab/waitlist')
      .then(res => res.json())
      .then(data => setWaitlistCount(data.total))
      .catch(() => setWaitlistCount(null));
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white/30">Loading...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] overflow-hidden">
      <MinimalistBackground />

      <AnimatePresence>
        {showForm && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowForm(false)}
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative z-15 min-h-screen flex items-center justify-center px-4 md:px-6 py-20">
        <AnimatePresence mode="wait">
          {!showForm ? (
            <motion.div
              key="hero"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="text-center max-w-4xl mx-auto w-full"
            >
              {/* Animated Icon */}
              <div className="flex justify-center">
                <AnimatedIcarusIcon />
              </div>
              
              {/* Top Capsule */}
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0, duration: 0.5, ease: "easeOut" }}
                className="inline-block mb-12 mt-8"
              >
                <div className="px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.02] backdrop-blur-sm">
                  <span className="text-xs font-mono uppercase tracking-[0.2em] text-white/40">
                    {t('lab.capsule', 'common')}
                  </span>
                </div>
              </motion.div>

              {/* Hero Line */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.8, ease: "easeOut" }}
                className="text-5xl md:text-6xl lg:text-6xl font-space-grotesk font-bold mb-6 leading-[1.1] tracking-tighter"
                
              >
                <span className="text-white">
                  {t('lab.heroLine1', 'common')}
                </span>
                <br />
                <span className="text-white/30">
                  {t('lab.heroLine2', 'common')}
                </span>
              </motion.h1>

              {/* Single Description Line */}
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5, ease: "easeOut" }}
                className="text-base md:text-lg text-white/40 mb-12 font-ibm-plex-sans font-light tracking-wide max-w-2xl mx-auto"
              >
                {t('lab.tagline', 'common')}
              </motion.p>
              
              {/* Minimal CTA */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-md mx-auto"
              >
                {/* Desktop: Inline button */}
                <div className="hidden sm:block relative h-14 group" onClick={() => setShowForm(true)}>
                    <input
                        type="email"
                        readOnly
                        placeholder={t('lab.heroEmailPlaceholder', 'common') || "Your Email Address"}
                        className="w-full h-full bg-[#0F0F0F] border border-white/20 rounded-lg pl-6 pr-36 text-white placeholder-white/40 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                    />
                    <button
                        className="absolute right-2 top-2 bottom-2 bg-white text-black rounded-md px-6 font-medium hover:bg-gray-200 transition-colors"
                    >
                        {t('lab.applyNow', 'common')}
                    </button>
                </div>
                
                {/* Mobile: Stacked layout */}
                <div className="sm:hidden space-y-3" onClick={() => setShowForm(true)}>
                    <input
                        type="email"
                        readOnly
                        placeholder={t('lab.heroEmailPlaceholder', 'common') || "Your Email Address"}
                        className="w-full h-12 bg-[#0F0F0F] border border-white/20 rounded-lg px-4 text-white placeholder-white/40 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                    />
                    <button
                        className="w-full h-12 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                        {t('lab.applyNow', 'common')}
                    </button>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative z-50 w-full flex items-center justify-center"
            >
              <WaitlistForm 
                onClose={() => setShowForm(false)}
                initialCount={waitlistCount}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

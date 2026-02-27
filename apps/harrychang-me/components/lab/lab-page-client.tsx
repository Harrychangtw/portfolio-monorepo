"use client";
import { useState, useEffect } from 'react';
import { useLanguage } from '@portfolio/lib/contexts/language-context';
import WaitlistForm from '@/components/lab/waitlist-form';
import MinimalistBackground from '@/components/lab/minimalist-background';
import { motion, AnimatePresence } from 'motion/react';
import AnimatedIcarusIcon from '@/components/lab/animated-icon';
import FaqSection from '@/components/lab/faq-section';

export default function LabPageClient() {
  const { t, isLoading } = useLanguage();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (showForm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showForm]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="relative bg-background text-foreground transition-colors duration-500 w-full">
      
      {/* 1. Backdrop Overlay */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-background/80 z-40"
            onClick={() => setShowForm(false)}
          />
        )}
      </AnimatePresence>

      {/* 2. Main Scrollable Content */}
      <main className="w-full relative z-10">
        
        {/* --- HERO SECTION (Strictly 100svh) --- */}
        <section className="relative w-full min-h-[100svh] flex flex-col justify-center overflow-hidden">
          
          {/* Animated Background locked to this section */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <MinimalistBackground />
          </div>

          <div className="relative z-10 w-full max-w-4xl mx-auto px-4 md:px-6 text-center -translate-y-12 md:-translate-y-20">
            {/* Animated Icon */}
            <div className="flex justify-center lab-logo mb-4">
              <AnimatedIcarusIcon />
            </div>
            
            {/* Top Capsule */}
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0, duration: 0.5, ease: "easeOut" }}
              className="inline-block mb-6 md:mb-10"
            >
              <div className="px-4 py-1.5 rounded-full border border-border bg-card/50 backdrop-blur-sm">
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">
                  {t('lab.capsule', 'common')}
                </span>
              </div>
            </motion.div>

            {/* Hero Line */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.8, ease: "easeOut" }}
              className="text-5xl md:text-6xl lg:text-6xl font-heading font-bold mb-6 leading-[1.1]"
            >
              <span className="text-foreground">
                {t('lab.heroLine1', 'common')}
              </span>
              <br />
              <span className="text-muted-foreground/60">
                {t('lab.heroLine2', 'common')}
              </span>
            </motion.h1>

            {/* Single Description Line */}
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5, ease: "easeOut" }}
              className="text-base md:text-lg text-muted-foreground mb-16 font-ibm-plex-sans font-light tracking-wide max-w-2xl mx-auto"
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
                      className="w-full h-full bg-card border border-border rounded-lg pl-6 pr-36 text-foreground placeholder:text-secondary cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  />
                  <button
                      className="absolute right-2 top-2 bottom-2 bg-foreground text-background rounded-md px-6 font-medium hover:bg-foreground/90 transition-colors"
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
                      className="w-full h-12 bg-card border border-border rounded-lg px-4 text-foreground placeholder:text-muted-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  />
                  <button
                      className="w-full h-12 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 transition-colors"
                  >
                      {t('lab.applyNow', 'common')}
                  </button>
              </div>
            </motion.div>
        </div>

          {/* Scroll Indicator (Subtle hint for the FAQ) */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-40 pointer-events-none z-20"
          >
            <span className="text-[10px] font-mono uppercase tracking-widest mb-3 text-foreground">
              {t('lab.faq.title', 'common') || 'FAQ'}
            </span>
            <div className="w-[1px] h-8 bg-gradient-to-b from-foreground to-transparent"></div>
          </motion.div>

          {/* Bottom gradient replacing the hard divider line */}
          <div className="absolute bottom-0 left-0 right-0 h-32 md:h-48 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />

        </section>

        {/* --- FAQ SECTION (Scrolls up from below) --- */}
        <section className="relative z-20 w-full bg-background pb-24 md:pb-32">
          <FaqSection />
        </section>

      </main>

      {/* 3. Form Modal (Renders strictly on top) */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none"
          >
            {/* Restore pointer events only for the form itself */}
            <div className="w-full max-w-lg pointer-events-auto">
              <WaitlistForm onClose={() => setShowForm(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

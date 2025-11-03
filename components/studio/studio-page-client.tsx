"use client";
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import LetterGlitch from '@/components/letter-glitch';
import WaitlistForm from '@/components/studio/waitlist-form';
import { motion, AnimatePresence } from 'framer-motion';

export default function StudioPageClient() {
  const { t, language, isLoading } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null);

  // Fetch waitlist count on mount
  useEffect(() => {
    fetch('/api/studio/waitlist')
      .then(res => res.json())
      .then(data => setWaitlistCount(data.total))
      .catch(() => setWaitlistCount(null));
  }, []);

  const handleAnimationComplete = () => {
    setIntroComplete(true);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Letter Glitch Background with Center Vignette */}
      <div className="fixed inset-0 z-0">
        <LetterGlitch 
          onAnimationComplete={handleAnimationComplete}
          
          hasVignette={false}
          centerVignette={true}
          disableIntro={true}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-20">
        <AnimatePresence mode="wait">
          {!showForm ? (
            <motion.div
              key="hero"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-4xl mx-auto"
            >
              {/* Exclusive Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-block mb-6"
              >
                <div className="px-4 py-2 rounded-full border border-primary/20 bg-background/50 backdrop-blur-sm">
                  <span className="text-sm text-muted-foreground font-mono">
                    {language === 'zh-TW' 
                      ? '限量開放 • 申請制度' 
                      : 'Limited Availability • Application Required'}
                  </span>
                </div>
              </motion.div>

              {/* Main Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-6xl lg:text-7xl font-space-grotesk font-bold mb-6 leading-tight"
              >
                <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  {language === 'zh-TW' 
                    ? '技術精通與' 
                    : 'Where Technical Mastery'}
                </span>
                <br />
                <span className="bg-gradient-to-r from-primary/70 to-primary bg-clip-text text-transparent">
                  {language === 'zh-TW' 
                    ? '創意卓越的交匯' 
                    : 'Meets Creative Excellence'}
                </span>
              </motion.h1>

              {/* Tagline */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-lg md:text-xl text-muted-foreground mb-8 font-ibm-plex-sans"
              >
                {language === 'zh-TW'
                  ? '向真正在實踐的人學習，而非紙上談兵。'
                  : 'Learn from someone who\'s actually doing it, not just teaching it.'}
              </motion.p>

              {/* Social Proof */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap justify-center gap-4 mb-10"
              >
                <Badge text="TMLR Published" />
                <Badge text="Harvard Prize Book" />
                <Badge text="GenAI Stars Winner" />
                <Badge text="NTU CSIE 2026" />
              </motion.div>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="mb-6"
              >
                <button
                  onClick={() => setShowForm(true)}
                  className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-background bg-primary rounded-full overflow-hidden transition-all duration-300 hover:scale-105"
                >
                  <span className="relative z-10">
                    {language === 'zh-TW' 
                      ? '加入等候名單' 
                      : 'Join the Waitlist'}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </motion.div>

              {/* Waitlist Count */}
              {waitlistCount !== null && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-sm text-muted-foreground font-mono"
                >
                  {language === 'zh-TW' 
                    ? `${waitlistCount} 人已加入` 
                    : `${waitlistCount} already joined`}
                  {waitlistCount > 100 && (
                    <span className="text-primary ml-2">
                      • {language === 'zh-TW' ? '名額有限' : 'Spots filling fast'}
                    </span>
                  )}
                </motion.p>
              )}

              {/* Coming Soon Preview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto"
              >
                <PreviewCard
                  title={language === 'zh-TW' ? 'AI 安全研究' : 'AI Safety Research'}
                  description={language === 'zh-TW' 
                    ? '從TMLR發表者學習LLM安全' 
                    : 'Learn LLM safety from a TMLR author'}
                />
                <PreviewCard
                  title={language === 'zh-TW' ? '作品集開發' : 'Portfolio Development'}
                  description={language === 'zh-TW' 
                    ? '打造令人印象深刻的個人品牌' 
                    : 'Build a portfolio that gets you noticed'}
                />
                <PreviewCard
                  title={language === 'zh-TW' ? '演講與辯論' : 'Speaking & Debate'}
                  description={language === 'zh-TW' 
                    ? 'WSDC冠軍的溝通技巧' 
                    : 'Communication skills from a debate champion'}
                />
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
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

// Helper Components
function Badge({ text }: { text: string }) {
  return (
    <span className="px-3 py-1 text-xs font-mono uppercase tracking-wider border border-primary/20 rounded-full bg-background/50 backdrop-blur-sm text-muted-foreground">
      {text}
    </span>
  );
}

function PreviewCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-4 rounded-lg border border-primary/10 bg-background/30 backdrop-blur-sm">
      <h3 className="font-space-grotesk font-semibold mb-2 text-sm">{title}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

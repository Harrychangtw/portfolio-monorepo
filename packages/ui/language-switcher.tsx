"use client"

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useLanguage } from '@portfolio/lib/contexts/language-context'
import { ArrowRightLeft } from 'lucide-react'

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'zh-TW' : 'en')
  }

  return (
    <motion.button
      onClick={toggleLanguage}
      className="flex items-center space-x-2 font-heading text-secondary hover:text-[hsl(var(--accent))] transition-colors duration-200"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Image
        src="/language.svg"
        alt="Language"
        width={14}
        height={14}
        priority
        style={{ width: '14px', height: '14px' }}
      />
      <span className="tracking-wider">
        {language === 'en' ? 'English' : '繁體中文'}
      </span>
      <ArrowRightLeft className="w-3.5 h-3.5" />
    </motion.button>
  );
}

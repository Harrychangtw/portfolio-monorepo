"use client"

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useTheme, useLanguage } from '@portfolio/lib'
import { ArrowRightLeft } from 'lucide-react'

export default function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme()
  const { t } = useLanguage()

  return (
    <motion.button
      onClick={toggleTheme}
      className="flex items-center space-x-2 font-heading text-secondary hover:text-accent transition-colors duration-200"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
      aria-label={theme === 'dark' ? t('theme.switchToLight') : t('theme.switchToDark')}
    >
      {theme === 'dark' ? (
        <Image
          src="/theme_moon.svg"
          alt={t('theme.dark')}
          width={14}
          height={14}
          style={{ width: '14px', height: '14px' }}
        />
      ) : (
        <Image
          src="/theme_sun.svg"
          alt={t('theme.light')}
          width={14}
          height={14}
          style={{ width: '14px', height: '14px' }}
        />
      )}
      <span className="tracking-wider">
        {theme === 'dark' ? t('theme.light') : t('theme.dark')}
      </span>
      <ArrowRightLeft className="w-3.5 h-3.5" />
    </motion.button>
  );
}

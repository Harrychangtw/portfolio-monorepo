"use client"

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useLanguage } from '@portfolio/lib/contexts/language-context'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@portfolio/ui/ui/dropdown-menu'
import { ChevronDown } from 'lucide-react'

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  const handleSetLanguage = (lang: 'en' | 'zh-TW') => {
    setLanguage(lang);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.button
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
          <ChevronDown className="w-4 h-4" />
        </motion.button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-background">
        <DropdownMenuItem onClick={() => handleSetLanguage('en')}>
          English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSetLanguage('zh-TW')}>
          繁體中文
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"
import { useLanguage } from '@portfolio/lib/contexts/language-context'
import { motion } from "framer-motion"
import {
  Mail,
  Github,
  Linkedin,
  Instagram,
  Calendar,
  FileText,
  Music,
  BookOpen,
  MessageCircle,
  Film,
  Lightbulb,
  Wrench,
  ArrowLeft,
} from "lucide-react"

interface LinkItem {
  icon: React.ReactNode
  label: string
  href: string
  external?: boolean
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
}

export default function LinksPageClient() {
  const { t, language } = useLanguage()

  const links: LinkItem[] = [
    {
      icon: <Lightbulb className="w-5 h-5" />,
      label: t("resources.site"),
      href: "/",
      external: false,
    },
    {
      icon: <Mail className="w-5 h-5" />,
      label: t("social.gmail"),
      href: "/email",
      external: true,
    },
    
    {
      icon: <MessageCircle className="w-5 h-5" />,
      label: t("social.discord"),
      href: "/discord",
      external: true,
    },
    {
      icon: <Instagram className="w-5 h-5" />,
      label: t("social.instagram"),
      href: "/instagram",
      external: true,
    },
    {
      icon: <Linkedin className="w-5 h-5" />,
      label: t("social.linkedin"),
      href: "/linkedin",
      external: true,
    },
    {
      icon: <Github className="w-5 h-5" />,
      label: t("social.github"),
      href: "/github",
      external: true,
    },
    {
      icon: <Music className="w-5 h-5" />,
      label: t("resources.music"),
      href: "/spotify",
      external: true,
    },
    {
      icon: <Film className="w-5 h-5" />,
      label: t("social.letterboxd"),
      href: "/letterboxd",
      external: true,
    },
    {
      icon: <FileText className="w-5 h-5" />,
      label: t("resources.resume"),
      href: "/cv",
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      label: t("resources.calendar"),
      href: "/cal",
      external: true,
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      label: t("resources.reading"),
      href: "/paper-reading",
    },
    {
      icon: <Wrench className="w-5 h-5" />,
      label: t("resources.uses"),
      href: "/uses",
    },
    
  ]

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-8   px-4 sm:px-6">
      <div className="w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
    
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          {/* Profile Picture */}
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4"
          >
            <div className="absolute inset-0 to-primary rounded-full" />
            <Image
              src="/profile_pic.webp"
              alt="Harry Chang"
              width={128}
              height={128}
              className="relative rounded-full w-full h-full object-cover ring-2 ring-border"
              priority
            />
          </motion.div>

          {/* Name */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-2xl sm:text-3xl font-bold mb-2"
          >
            Harry Chang 張祺煒
          </motion.h1>

          {/* Role */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-base sm:text-lg text-muted-foreground mb-2"
          >
            {t("links.hero")}
          </motion.p>

          {/* Bio
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-sm text-muted-foreground max-w-md mx-auto"
          >
            {t("links.bio")}
          </motion.p> */}
        </motion.div>

        {/* Links Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-1.5 sm:space-y-2"
        >
          {links.map((link, index) => (
            <motion.div key={index} variants={itemVariants}>
              {link.external ? (
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block w-full"
                >
                  <LinkCard link={link} />
                </a>
              ) : (
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block w-full"
                >
                  <LinkCard link={link} />
                </a>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

function LinkCard({ link }: { link: LinkItem }) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-card border border-border p-2 sm:p-2 transition-all duration-300 hover:border-primary/50 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.98]">
      {/* Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
      
      <div className="relative flex items-center gap-2.5 sm:gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-muted/50 flex items-center justify-center text-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300">
          {link.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base font-semibold text-foreground group-hover:text-primary transition-colors">
            {link.label}
          </h3>
        </div>

        {/* Arrow */}
        <div className="flex-shrink-0 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300">
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 17L17 7M17 7H7M17 7V17"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}

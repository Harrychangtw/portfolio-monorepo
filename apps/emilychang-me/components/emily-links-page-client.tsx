"use client"

import React from "react"
import Image from "next/image"
import { motion } from "framer-motion"
// import {
//   Instagram,
//   Mail,
//   Utensils,
//   Lightbulb,
//   Music,
// } from "lucide-react"

interface LinkItem {
  icon: React.ReactNode
  label: string
  href: string
  external?: boolean
}

// ...existing code...

const links: LinkItem[] = [
  {
    // icon: <Lightbulb className="w-5 h-5" />,
    icon: <span className="w-5 h-5">💡</span>,
    label: "Portfolio",
    href: "https://www.emilychang.me",
    external: true,
  },
  {
    // icon: <Mail className="w-5 h-5" />, // Email
    icon: <span className="w-5 h-5">✉️</span>,
    label: "Email",
    href: "/email",
    external: true,
  },
  {
    // icon: <Instagram className="w-5 h-5" />, // Instagram
    icon: <span className="w-5 h-5">📸</span>,
    label: "Instagram (Main)",
    href: "/ig_main",
    external: true,
  },
  {
    // icon: <PenTool className="w-5 h-5" />, // Instagram
    icon: <span className="w-5 h-5">🖊️</span>,
    label: "Instagram (Art)",
    href: "/ig_art",
    external: true,
  },
  {
    // icon: <Utensils className="w-5 h-5" />, // Beli
    icon: <span className="w-5 h-5">🍽️</span>,
    label: "Beli",
    href: "/beli",
    external: true,
  },
  {
    // icon: <Music className="w-5 h-5" />, // LinkedIn
    icon: <span className="w-5 h-5">🎵</span>,
    label: "Spotify",
    href: "/spotify",
    external: true,
  },
]

export default function EmilyLinksPageClient() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-8 px-4 sm:px-6">
      <div className="w-full max-w-md">
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
            <Image
              src="/profile_pic.webp"
              alt="Emily Chang"
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
            className="font-heading sm:text-4xl font-bold"
          >
            Emily Chang
          </motion.h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="-mt-8 text-secondary text-muted-foreground mb-2 text-center md:mb-6"
        >
           If it makes you happy, it doesn&apos;t have to make sense to others
        </motion.p>

        {/* Links Grid */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.08,
                delayChildren: 0.2,
              },
            },
          }}
          className="space-y-2"
        >
          {links.map((link, idx) => (
            <motion.div
              key={idx}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } },
              }}
            >
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group block w-full"
              >
                <LinkCard link={link} />
              </a>
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
        {/* Icon (emoji inline) */}
        <span className="text-xl sm:text-2xl mr-1 align-middle">{link.icon}</span>
        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base font-semibold text-foreground group-hover:text-primary transition-colors inline-block align-middle">
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

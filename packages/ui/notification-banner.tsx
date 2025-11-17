"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface NotificationBannerProps {
  message: string
  isVisible: boolean
  onDismiss: () => void
}

export default function NotificationBanner({ message, isVisible, onDismiss }: NotificationBannerProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onDismiss()
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [isVisible, onDismiss])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="fixed bottom-6 left-0 right-0 z-50 flex justify-center"
        >
          <div className="bg-background border border-primary px-6 py-3 rounded-lg shadow-lg max-w-sm text-center">
            <p className="text-sm text-foreground">{message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useLanguage } from "@/contexts/LanguageContext"
import NotificationBanner from "./notification-banner"

export default function NotificationProvider() {
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useLanguage()

  useEffect(() => {
    // Check if redirected from 404
    const from404 = searchParams.get("from404")
    if (from404 === "true") {
      setNotificationMessage(t("notification.pageNotFound"))
      setShowNotification(true)
      
      // Clean up the URL parameter
      const url = new URL(window.location.href)
      url.searchParams.delete("from404")
      router.replace(url.pathname + url.search, { scroll: false })
    }
  }, [searchParams, t, router])

  const handleDismiss = () => {
    setShowNotification(false)
  }

  return (
    <NotificationBanner
      message={notificationMessage}
      isVisible={showNotification}
      onDismiss={handleDismiss}
    />
  )
}
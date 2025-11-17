"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function NotFound() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to home page with notification parameter
    router.replace("/?from404=true")
  }, [router])

  return null
}


"use client"

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react"
import { usePathname } from "next/navigation"

interface NavigationContextType {
  isNavigating: boolean
  startNavigation: () => void
  endNavigation: () => void
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [isNavigating, setIsNavigating] = useState(false)
  const pathname = usePathname()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const navigationStartedRef = useRef(false)

  const startNavigation = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    navigationStartedRef.current = true
    setIsNavigating(true)
  }, [])

  const endNavigation = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    // Keep the loading indicator visible for a minimum duration to ensure it's seen
    timeoutRef.current = setTimeout(() => {
      setIsNavigating(false)
      navigationStartedRef.current = false
    }, 300) // Minimum visible duration
  }, [])

  // Automatically end navigation when pathname changes
  useEffect(() => {
    if (navigationStartedRef.current) {
      // Pathname changed, end navigation after a short delay
      endNavigation()
    }
  }, [pathname, endNavigation])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <NavigationContext.Provider value={{ isNavigating, startNavigation, endNavigation }}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error("useNavigation must be used within NavigationProvider")
  }
  return context
}

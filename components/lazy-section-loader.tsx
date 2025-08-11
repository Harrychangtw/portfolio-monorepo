"use client"

import { createContext, useContext, useState, useCallback, useEffect } from 'react'

interface SectionLoadingState {
  about: boolean
  updates: boolean
  projects: boolean
  gallery: boolean
}

interface SectionLoadingContextType {
  loadingStates: SectionLoadingState
  setLoadingState: (section: keyof SectionLoadingState, isLoading: boolean) => void
  isAllLoaded: () => boolean
  waitForSection: (section: keyof SectionLoadingState) => Promise<void>
}

const SectionLoadingContext = createContext<SectionLoadingContextType | undefined>(undefined)

export function SectionLoadingProvider({ children }: { children: React.ReactNode }) {
  const [loadingStates, setLoadingStates] = useState<SectionLoadingState>({
    about: false,  // About section doesn't lazy load
    updates: false, // Updates section doesn't lazy load  
    projects: true,  // Projects section lazy loads
    gallery: true    // Gallery section lazy loads
  })

  const setLoadingState = useCallback((section: keyof SectionLoadingState, isLoading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [section]: isLoading
    }))
  }, [])

  const isAllLoaded = useCallback(() => {
    return !Object.values(loadingStates).some(loading => loading)
  }, [loadingStates])

  const waitForSection = useCallback((section: keyof SectionLoadingState): Promise<void> => {
    return new Promise((resolve) => {
      // Use a ref to get the current state
      const checkLoadingState = () => {
        setLoadingStates(current => {
          if (!current[section]) {
            resolve()
            return current
          }
          return current
        })
      }
      
      // Check immediately
      checkLoadingState()
      
      // If not resolved immediately, set up polling
      let resolved = false
      const checkInterval = setInterval(() => {
        setLoadingStates(current => {
          if (!current[section] && !resolved) {
            resolved = true
            clearInterval(checkInterval)
            resolve()
          }
          return current
        })
      }, 50) // Check every 50ms

      // Timeout after 5 seconds to prevent infinite waiting
      setTimeout(() => {
        if (!resolved) {
          resolved = true
          clearInterval(checkInterval)
          resolve()
        }
      }, 5000)
    })
  }, [])

  return (
    <SectionLoadingContext.Provider value={{ loadingStates, setLoadingState, isAllLoaded, waitForSection }}>
      {children}
    </SectionLoadingContext.Provider>
  )
}

export function useSectionLoading() {
  const context = useContext(SectionLoadingContext)
  if (!context) {
    throw new Error('useSectionLoading must be used within SectionLoadingProvider')
  }
  return context
}

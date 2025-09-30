"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

type Language = 'en' | 'zh-TW'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, namespace?: string) => string
  tHtml: (key: string, namespace?: string) => React.ReactNode
  getTranslationData: (key: string, namespace?: string) => any
  isLoading: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface Translations {
  [namespace: string]: {
    [key: string]: any
  }
}

// Helper function to parse HTML strings and convert to React elements
const parseHtmlToReact = (htmlString: string): React.ReactNode => {
  const linkRegex = /<a\s+href="([^"]*)"[^>]*>([^<]*)<\/a>/g
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match
  let key = 0

  while ((match = linkRegex.exec(htmlString)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      const textBefore = htmlString.substring(lastIndex, match.index)
      if (textBefore) {
        parts.push(<span key={`text-${key++}`}>{textBefore}</span>)
      }
    }

    // Add the link with proper React props
    const href = match[1]
    const linkText = match[2]
    parts.push(
      <a
        key={`link-${key++}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="link-external"
      >
        {linkText}
      </a>
    )

    lastIndex = linkRegex.lastIndex
  }

  // Add remaining text after the last link
  if (lastIndex < htmlString.length) {
    const remainingText = htmlString.substring(lastIndex)
    if (remainingText) {
      parts.push(<span key={`text-${key++}`}>{remainingText}</span>)
    }
  }

  // If no links were found, return the original string
  return parts.length > 0 ? <>{parts}</> : htmlString
}

// Determine initial language synchronously (prevents a mismatched first render)
const getInitialLang = (): Language => {
  if (typeof window === 'undefined') return 'en'
  const saved = localStorage.getItem('language') as Language | null
  if (saved === 'en' || saved === 'zh-TW') return saved
  return navigator.language?.toLowerCase().startsWith('zh') ? 'zh-TW' : 'en'
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLang)
  const [translations, setTranslations] = useState<Translations>({})
  const [isLoading, setIsLoading] = useState(true)
  // Track if we've completed the first load
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)

  // Load translations for a specific language
  const loadTranslations = async (lang: Language) => {
    setIsLoading(true)
    try {
      const namespaces = ['common', 'about', 'updates', 'uses']
      const translationPromises = namespaces.map(async (namespace) => {
        const response = await fetch(`/locales/${lang}/${namespace}.json`)
        if (response.ok) {
          const data = await response.json()
          return { namespace, data }
        }
        return { namespace, data: {} }
      })

      const results = await Promise.all(translationPromises)
      const newTranslations: Translations = {}
      
      results.forEach(({ namespace, data }) => {
        newTranslations[namespace] = data
      })

      setTranslations(newTranslations)
      setHasLoadedOnce(true) // First load finished
    } catch (error) {
      console.error('Failed to load translations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Load once on mount and whenever language changes
  useEffect(() => {
    loadTranslations(language)
  }, [language])

  // Translation function for plain text
  const t = (key: string, namespace: string = 'common'): string => {
    // Never show raw keys before first load completes
    if (!hasLoadedOnce) return ''

    const keys = key.split('.')
    let value: any = translations[namespace]

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k]
      } else {
        // Return empty string instead of key to avoid flashing keys
        return ''
      }
    }

    return typeof value === 'string' ? value : ''
  }

  // Translation function that returns React nodes for HTML content
  const tHtml = (key: string, namespace: string = 'common'): React.ReactNode => {
    const translatedText = t(key, namespace)
    return parseHtmlToReact(translatedText)
  }

  // Function to get translation data (including arrays and objects)
  const getTranslationData = (key: string, namespace: string = 'common'): any => {
    if (!hasLoadedOnce) return null

    let value: any = translations[namespace]
    
    // If key is empty, return the entire namespace
    if (!key || key === '') {
      return value
    }
    
    const keys = key.split('.')
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k]
      } else {
        return null // Return null if translation not found
      }
    }

    return value
  }

  // Set language and update localStorage; fetch happens via useEffect
  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
  }

  // Gate visibility until first load completes (prevents FOUC without layout shift)
  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        tHtml,
        getTranslationData,
        isLoading,
      }}
    >
      <div style={{ visibility: hasLoadedOnce ? 'visible' : 'hidden' }}>
        {children}
      </div>
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

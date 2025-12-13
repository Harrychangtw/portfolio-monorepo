"use client"

import { useEffect, useState, useMemo, useCallback } from 'react'
import { cn } from '@portfolio/lib/lib/utils'
import { scrollToSection } from '@portfolio/lib/lib/scrolling'

interface TocItem {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  contentHtml: string
  className?: string
}

// Utility to generate slug from text
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim()
}

export function TableOfContents({ contentHtml, className }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('')

  // Parse headings from HTML content
  const headings = useMemo(() => {
    if (typeof window === 'undefined') return []
    
    const parser = new DOMParser()
    const doc = parser.parseFromString(contentHtml, 'text/html')
    const elements = doc.querySelectorAll('h2, h3, h4')
    
    const items: TocItem[] = []
    elements.forEach((el) => {
      const text = el.textContent || ''
      const level = parseInt(el.tagName.charAt(1))
      const id = el.id || slugify(text)
      if (text.trim()) {
        items.push({ id, text, level })
      }
    })
    
    return items
  }, [contentHtml])

  // Scroll spy effect
  useEffect(() => {
    if (headings.length === 0) return

    const handleScroll = () => {
      const headingElements = headings
        .map(({ id }) => document.getElementById(id))
        .filter(Boolean) as HTMLElement[]

      if (headingElements.length === 0) return

      // Check if user has scrolled to near the bottom of the page
      const scrollPosition = window.scrollY + window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const nearBottom = scrollPosition >= documentHeight - 150

      // If near bottom, activate the last heading
      if (nearBottom && headings.length > 0) {
        setActiveId(headings[headings.length - 1].id)
        return
      }

      // Find the heading that's currently in view
      const scrollTop = window.scrollY + 100

      for (let i = headingElements.length - 1; i >= 0; i--) {
        const element = headingElements[i]
        if (element.offsetTop <= scrollTop) {
          setActiveId(headings[i].id)
          return
        }
      }

      // If no heading is in view, set first one
      if (headingElements.length > 0) {
        setActiveId(headings[0].id)
      }
    }

    // Initial check
    handleScroll()

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [headings])

  // Handle click navigation - use shared scrolling utility
  const handleClick = useCallback((id: string) => {
    scrollToSection(id)
  }, [])

  if (headings.length === 0) return null

  // Hidden on mobile, shown on desktop only
  return (
    <nav className={cn("table-of-contents hidden md:block", className)}>
      {/* ToC list - tree structure implies it's a ToC, no label needed */}
      <ul className="space-y-1">
        {headings.map(({ id, text, level }) => (
          <li
            key={id}
            className="relative"
          >
            <button
              onClick={() => handleClick(id)}
              className={cn(
                "text-left text-sm font-body transition-all duration-200 w-full py-1",
                "hover:text-primary",
                // Indent based on heading level
                level === 2 && "pl-0",
                level === 3 && "pl-3",
                level === 4 && "pl-6",
                // Active state - just color change, no dot
                activeId === id
                  ? "text-primary"
                  : "text-secondary"
              )}
            >
              {text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default TableOfContents

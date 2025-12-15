import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
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
  const activeIdRef = useRef(activeId)

  // Update ref when state changes to use inside the effect without re-binding
  useEffect(() => {
    activeIdRef.current = activeId
  }, [activeId])

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

    let requestRunning: number | null = null

    const handleScroll = () => {
      if (requestRunning !== null) return

      requestRunning = window.requestAnimationFrame(() => {
        requestRunning = null
        
        // Define trigger zone: 
        // 120px provides a buffer slightly below the sticky sidebar top (top-24 = 96px)
        // ensuring the user has actually started reading the section.
        const TRIGGER_OFFSET = 120
        
        const windowHeight = window.innerHeight
        const documentHeight = document.documentElement.scrollHeight
        const scrollPosition = window.scrollY

        // Check if user has scrolled to the bottom of the page
        if (scrollPosition + windowHeight >= documentHeight - 50) {
          const lastId = headings[headings.length - 1].id
          if (activeIdRef.current !== lastId) {
            setActiveId(lastId)
          }
          return
        }

        // Find the active heading using viewport-relative coordinates
        // Strategy: The active heading is the *last* one that is above the trigger line.
        let newActiveId = headings[0].id

        for (let i = 0; i < headings.length; i++) {
          const id = headings[i].id
          const element = document.getElementById(id)
          
          if (!element) continue

          // getBoundingClientRect is precise regardless of layout context (sticky, grid, relative)
          const rect = element.getBoundingClientRect()
          
          // If the heading top is above or at the trigger offset, it's a candidate
          if (rect.top <= TRIGGER_OFFSET) {
            newActiveId = id
          } else {
            // Once we find a heading that is below the trigger offset, we stop.
            // The previous candidate (newActiveId) is the correct active section.
            break
          }
        }

        if (newActiveId !== activeIdRef.current) {
          setActiveId(newActiveId)
        }
      })
    }

    // Initial check
    handleScroll()

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll, { passive: true }) // Handle layout shifts on resize
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
      if (requestRunning !== null) {
        window.cancelAnimationFrame(requestRunning)
      }
    }
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

import { useEffect, useState, RefObject } from 'react'

interface UseIntersectionObserverProps {
  elementRef: RefObject<Element>
  threshold?: number
  rootMargin?: string
}

export function useIntersectionObserver({
  elementRef,
  threshold = 0,
  rootMargin = '50px',
}: UseIntersectionObserverProps): boolean {
  const [isIntersecting, setIntersecting] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIntersecting(entry.isIntersecting)
      },
      { threshold, rootMargin }
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [elementRef, threshold, rootMargin])

  return isIntersecting
}
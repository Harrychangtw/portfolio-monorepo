"use client"

import { useEffect } from 'react'

interface UseImagePreloaderProps {
  src: string
  priority?: boolean
}

export function useImagePreloader({ src, priority = false }: UseImagePreloaderProps) {
  useEffect(() => {
    if (!src) return
    
    // Create a link element for preloading
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = src
    
    if (priority) {
      link.setAttribute('fetchpriority', 'high')
    }
    
    // Add to document head
    const existingLink = document.querySelector(`link[href="${src}"]`)
    if (!existingLink) {
      document.head.appendChild(link)
    }
    
    return () => {
      // Clean up on unmount
      if (document.head.contains(link)) {
        document.head.removeChild(link)
      }
    }
  }, [src, priority])
}

export function preloadImage(src: string, options?: { priority?: boolean; sizes?: string }) {
  if (typeof window === 'undefined') return
  
  // Create preload link
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'image'
  link.href = src
  
  if (options?.priority) {
    link.setAttribute('fetchpriority', 'high')
  }
  
  if (options?.sizes) {
    link.setAttribute('imagesizes', options.sizes)
  }
  
  // Add to document head if not already there
  const existingLink = document.querySelector(`link[href="${src}"]`)
  if (!existingLink) {
    document.head.appendChild(link)
  }
}

export function preloadCriticalImages(images: string[]) {
  images.forEach((src, index) => {
    preloadImage(src, { 
      priority: index === 0 // First image gets high priority
    })
  })
}

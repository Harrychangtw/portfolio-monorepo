'use client'

import React, { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import VideoEmbed from './video-embed'

export const VideoInitializer: React.FC = () => {
  useEffect(() => {
    const initializeVideos = () => {
      const videoContainers = document.querySelectorAll('.video-embed-container')
      
      videoContainers.forEach((container) => {
        if (container.hasAttribute('data-initialized')) {
          return // Already initialized
        }
        
        const type = container.getAttribute('data-type') as 'youtube' | 'googledrive'
        const src = container.getAttribute('data-src')
        const title = container.getAttribute('data-title')
        
        if (!src || !type) return
        
        // Mark as initialized to prevent re-initialization
        container.setAttribute('data-initialized', 'true')
        
        // Clear the placeholder content
        container.innerHTML = ''
        
        // Create React root and render VideoEmbed component
        const root = createRoot(container)
        root.render(
          <VideoEmbed 
            src={src} 
            title={title || undefined} 
            type={type} 
          />
        )
      })
    }
    
    // Initialize videos immediately
    initializeVideos()
    
    // Also initialize videos when new content is added (for dynamic content)
    const observer = new MutationObserver((mutations) => {
      let shouldInitialize = false
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element
            if (element.querySelector?.('.video-embed-container') || 
                element.classList?.contains('video-embed-container')) {
              shouldInitialize = true
            }
          }
        })
      })
      
      if (shouldInitialize) {
        initializeVideos()
      }
    })
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
    
    return () => {
      observer.disconnect()
    }
  }, [])
  
  return null // This component doesn't render anything itself
}

export default VideoInitializer

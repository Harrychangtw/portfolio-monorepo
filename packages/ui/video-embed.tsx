'use client'

import React, { useState, useCallback } from 'react'
import { useInView } from 'react-intersection-observer'
import { Play, AlertCircle, Loader2 } from 'lucide-react'

interface VideoEmbedProps {
  src: string
  title?: string
  type: 'youtube' | 'googledrive'
}

export const VideoEmbed: React.FC<VideoEmbedProps> = ({ src, title, type }) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [shouldLoad, setShouldLoad] = useState(type === 'youtube')
  
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  })

  const handleLoad = useCallback(() => {
    setIsLoaded(true)
  }, [])

  const handleError = useCallback(() => {
    setHasError(true)
    setIsLoaded(true)
  }, [])

  const handlePlayClick = useCallback(() => {
    setShouldLoad(true)
  }, [])

  // For YouTube, load immediately when in view (no custom thumbnail layer)
  // For Google Drive, auto-load when in view
  const shouldShowIframe = inView && (shouldLoad || type === 'googledrive')

  // No longer need to get thumbnail for YouTube videos

  return (
    <figure className="my-6">
      <div 
        ref={ref}
        className="relative w-full bg-gray-100 dark:bg-gray-800 overflow-hidden"
        style={{ paddingBottom: '56.25%' }} // 16:9 aspect ratio
      >
        {!shouldShowIframe ? (
          // Placeholder view - only shown for Google Drive videos
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="flex flex-col items-center justify-center text-muted-foreground p-8">
              <div className="w-16 h-16 bg-muted-foreground/20 rounded-lg mb-4 flex items-center justify-center">
                <Play className="w-8 h-8 text-muted-foreground/60" />
              </div>
              <p className="text-sm text-center mb-4">Google Drive Video</p>
            </div>
          </div>
        ) : (
          // iframe container with loading state
          <div className="absolute inset-0">
            {!isLoaded && !hasError && (
              <div className="absolute inset-0 bg-muted overflow-hidden z-10">
                {/* Shimmer effect */}
                <div className="animate-shimmer absolute inset-0 -translate-x-full bg-gradient-to-r from-muted via-muted/50 to-muted" />
                
                {/* Loading indicator */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="text-xs text-white">Loading video...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {hasError ? (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <div className="flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
                  <AlertCircle className="w-8 h-8 mb-2 text-red-500" />
                  <p className="text-sm mb-2">Failed to load video</p>
                  <button
                    onClick={() => {
                      setHasError(false)
                      setIsLoaded(false)
                      setShouldLoad(true)
                    }}
                    className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded transition-colors duration-200"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : (
              <iframe
                src={src}
                className={`w-full h-full border-0 transition-opacity duration-300 ${
                  isLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                allow={
                  type === 'youtube'
                    ? 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                    : 'autoplay; encrypted-media'
                }
                allowFullScreen
                title={title || 'Embedded video'}
                onLoad={handleLoad}
                onError={handleError}
              />
            )}
          </div>
        )}
      </div>
      {title && (
        <figcaption className="mt-2 text-sm text-muted-foreground text-left">
          {title}
        </figcaption>
      )}
    </figure>
  )
}

export default VideoEmbed

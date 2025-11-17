'use client'

import { useEffect } from 'react'

export default function LabError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Lab application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Lab Experiment Failed</h2>
        <p className="text-muted-foreground mb-6">
          Even Icarus had setbacks. Let's try this experiment again.
        </p>
        <button
          onClick={reset}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Restart Experiment
        </button>
      </div>
    </div>
  )
}

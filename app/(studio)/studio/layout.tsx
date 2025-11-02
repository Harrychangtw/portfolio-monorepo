import type React from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://studio.harrychang.me'),
  title: {
    template: '%s | Harry Chang Studio',
    default: 'Harry Chang Studio',
  },
  description: 'Harry Chang Studio - Coming Soon',
  robots: {
    index: false,
    follow: false,
  },
}

export default function StudioLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="studio-wrapper">
      {children}
    </div>
  )
}

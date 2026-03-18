import type { Metadata } from 'next'

export const metadata: Metadata = {
  openGraph: {
    images: [
      {
        url: 'https://www.harrychang.me/images/og-image-uses.webp',
        width: 1200,
        height: 630,
        alt: 'Uses & Setup | Harry Chang',
      },
    ],
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function UsesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

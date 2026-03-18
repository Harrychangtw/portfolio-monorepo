import type { Metadata } from 'next'

export const metadata: Metadata = {
  openGraph: {
    images: [
      {
        url: 'https://www.harrychang.me/images/og-image-manifesto.webp',
        width: 1200,
        height: 630,
        alt: 'Manifesto | Harry Chang',
      },
    ],
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function ManifestoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

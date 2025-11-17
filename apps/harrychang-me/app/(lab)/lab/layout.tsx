import '@/styles/lcp-optimize.css';
import '@/styles/video-embed.css';
import type React from 'react';
import type { Metadata } from 'next';
import LabClientLayout from '@/components/lab/ClientLayout';

export const metadata: Metadata = {
  metadataBase: new URL('https://lab.harrychang.me'),
  title: {
    template: '%s | Icuras Lab by Harry Chang',
    default: 'Icuras Lab by Harry Chang',
  },
  description: 'What if they only warned us about the sun because they were afraid to fly? Icarus Lab is for those who\'d rather fly too close to the sun than ask permission to leave the ground.',
  alternates: {
    canonical: 'https://lab.harrychang.me',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Icuras Lab by Harry Chang',
    description: 'What if they only warned us about the sun because they were afraid to fly? Icarus Lab is for those who\'d rather fly too close to the sun than ask permission to leave the ground.',
    url: 'https://lab.harrychang.me',
    siteName: 'Icuras Lab',
    images: [
      {
        url: '/images/og-image-lab.png', // 1200x630px recommended
        width: 1200,
        height: 630,
        alt: 'Icuras Lab by Harry Chang',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Icuras Lab by Harry Chang',
    description: 'What if they only warned us about the sun because they were afraid to fly?',
    images: ['/images/og-image-lab.png'],
  },
  icons: {
    icon: [
      {
        url: '/favicon-lab.ico',
        sizes: 'any'
      }
    ],
    apple: {
      url: '/apple-icon-lab.png',
      type: 'image/png'
    },
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab-lab.svg',
        color: 'hsl(var(--background))'
      }
    ]
  },
};

export default function LabLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LabClientLayout>
      {children}
    </LabClientLayout>
  );
}

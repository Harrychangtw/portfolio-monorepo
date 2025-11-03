import '@/styles/lcp-optimize.css';
import '@/styles/video-embed.css';
import type React from 'react';
import type { Metadata } from 'next';
import StudioClientLayout from '@/components/studio/ClientLayout';

export const metadata: Metadata = {
  title: {
    template: '%s | Studio Harry Chang',
    default: 'Studio — Harry Chang',
  },
  description: 'Exclusive courses and consulting on AI, development, and creative technology.',
  robots: {
    index: false, // Hide from search engines until launch
    follow: false,
  },
};

export default function StudioLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <StudioClientLayout>
      {children}
    </StudioClientLayout>
  );
}

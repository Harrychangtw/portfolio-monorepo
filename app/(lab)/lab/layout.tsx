import '@/styles/lcp-optimize.css';
import '@/styles/video-embed.css';
import type React from 'react';
import type { Metadata } from 'next';
import LabClientLayout from '@/components/lab/ClientLayout';

export const metadata: Metadata = {
  title: {
    template: '%s | Lab Harry Chang',
    default: 'Lab — Harry Chang',
  },
  description: 'Exclusive courses and consulting on AI, development, and creative technology.',
  robots: {
    index: false, // Hide from search engines until launch
    follow: false,
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

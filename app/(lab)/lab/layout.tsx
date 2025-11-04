import '@/styles/lcp-optimize.css';
import '@/styles/video-embed.css';
import type React from 'react';
import type { Metadata } from 'next';
import LabClientLayout from '@/components/lab/ClientLayout';

export const metadata: Metadata = {
  title: {
    template: '%s | Icuras Lab by Harry Chang',
    default: 'Icuras Lab by Harry Chang',
  },
  description: 'For those who’d rather fly too close to the sun than ask permission to leave the ground.',
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

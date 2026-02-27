import { Suspense } from 'react';
import LabPageClient from '@/components/lab/lab-page-client';

export const metadata = {
  title: 'Icarus Lab by Harry Chang',
  description: 'For those who’d rather fly too close to the sun than ask permission to leave the ground.',  openGraph: {
    title: 'Icarus Lab by Harry Chang',
    description: 'For those who\'d rather fly too close to the sun than ask permission to leave the ground.',
    images: ['/images/og-image-lab.webp'],
  },};

/**
 * Main server component for the Lab landing page.
 * It uses Suspense to handle the client-side nature of the page content.
 */
export default function LabPage() {
  return (
    <Suspense>
      <LabPageClient />
    </Suspense>
  );
}

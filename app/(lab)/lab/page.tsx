import { Suspense } from 'react';
import LabPageClient from '@/components/lab/lab-page-client';

export const metadata = {
  title: 'Lab — Harry Chang',
  description: 'Exclusive courses and consulting on AI, development, and creative technology. Join the waitlist.',
};

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

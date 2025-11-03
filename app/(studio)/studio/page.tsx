import { Suspense } from 'react';
import StudioPageClient from '@/components/studio/studio-page-client';

export const metadata = {
  title: 'Studio — Harry Chang',
  description: 'Exclusive courses and consulting on AI, development, and creative technology. Join the waitlist.',
};

/**
 * Main server component for the Studio landing page.
 * It uses Suspense to handle the client-side nature of the page content.
 */
export default function StudioPage() {
  return (
    <Suspense>
      <StudioPageClient />
    </Suspense>
  );
}

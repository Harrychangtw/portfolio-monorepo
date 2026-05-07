"use client";

import { Suspense, type ReactNode } from "react";
import { NavigationProvider } from "@portfolio/lib/contexts/navigation-context";
import PageTransition from "@/components/main/page-transition";
import PostHogProvider from "@/components/posthog-provider";

/**
 * Thin client shell at the root layout level.
 * Provides NavigationProvider + PageTransition that persist across
 * route groups ((main), (graph), (lab)), so page transitions work
 * when navigating between them.
 */
export default function RootClientShell({ children }: { children: ReactNode }) {
  return (
    <PostHogProvider>
      <NavigationProvider>
        <Suspense>
          <PageTransition>{children}</PageTransition>
        </Suspense>
      </NavigationProvider>
    </PostHogProvider>
  );
}

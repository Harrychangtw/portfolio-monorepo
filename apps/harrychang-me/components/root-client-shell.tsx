"use client";

import { Suspense, type ReactNode } from "react";
import { NavigationProvider } from "@portfolio/lib/contexts/navigation-context";
import PageTransition from "@/components/main/page-transition";

/**
 * Thin client shell at the root layout level.
 * Provides NavigationProvider + PageTransition that persist across
 * route groups ((main), (graph), (lab)), so page transitions work
 * when navigating between them.
 */
export default function RootClientShell({ children }: { children: ReactNode }) {
  return (
    <NavigationProvider>
      <Suspense>
        <PageTransition>{children}</PageTransition>
      </Suspense>
    </NavigationProvider>
  );
}

import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import CalendarClient from "@/components/main/calendar-client";
import type { CalendarSnapshot } from "@/components/main/calendar-logic";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: { absolute: "Schedule | Harry Chang 張祺煒" },
  description:
    "What I am up to over the next few weeks. Public events show their details; everything else appears only as busy.",
  openGraph: {
    title: "Schedule | Harry Chang 張祺煒",
    description:
      "What I am up to over the next few weeks — public events show their details; everything else appears only as busy.",
    images: [
      {
        url: `${siteConfig.url}/images/og-image-calendar.webp`,
        width: 1200,
        height: 630,
        alt: "Schedule | Harry Chang",
      },
    ],
  },
  alternates: { canonical: `${siteConfig.url}/cal` },
  // A live schedule is not useful in search results and reveals movement
  // patterns; let people reach it from the site rather than from Google.
  robots: { index: false, follow: true },
};

/**
 * The snapshot is written by scripts/build-calendar.mjs during prebuild and is
 * gitignored, so it is absent in a fresh clone until a build has run. Read it
 * rather than importing it: a static import of a missing file is a hard build
 * error, while this degrades to an unavailable state. /cal is prerendered, so
 * this read happens at build time only.
 */
function loadSnapshot(): CalendarSnapshot {
  try {
    const file = path.join(process.cwd(), "content/generated/calendar.json");
    return JSON.parse(fs.readFileSync(file, "utf8")) as CalendarSnapshot;
  } catch {
    return {
      generatedAt: new Date().toISOString(),
      timezone: "Asia/Taipei",
      windowDays: 0,
      configured: false,
      events: [],
    };
  }
}

export default function CalendarPage() {
  return (
    <article className="container mt-24 md:mt-32 mb-24 md:mb-32">
      <div className="mb-6 md:mb-8">
        <h1 className="font-heading text-[clamp(2.25rem,5.5vw,4.5rem)] font-regular tracking-[-0.02em] text-foreground leading-[0.95]">
          Schedule
        </h1>
      </div>
      <CalendarClient data={loadSnapshot()} />
    </article>
  );
}

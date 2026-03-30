import { siteConfig } from "@/config/site";
import type { Metadata } from "next";
import RedirectPage from "@/components/main/redirect-page";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function CalendarRedirect() {
  return <RedirectPage href={siteConfig.external.calendar} label="Calendar" />;
}

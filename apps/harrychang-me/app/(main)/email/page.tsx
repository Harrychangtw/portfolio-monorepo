import { siteConfig } from "@/config/site";
import type { Metadata } from "next";
import RedirectPage from "@/components/main/redirect-page";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function EmailRedirect() {
  return (
    <RedirectPage href={`mailto:${siteConfig.author.email}`} label="Email" />
  );
}

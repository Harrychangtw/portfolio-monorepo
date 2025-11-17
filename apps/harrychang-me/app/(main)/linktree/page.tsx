import type { Metadata } from "next"
import LinksPageClient from "@portfolio/ui/links-page-client"

export const metadata: Metadata = {
  title: "Links | Harry Chang 張祺煒",
  description: "Connect with Harry Chang - All my links in one place",
  keywords: ["Harry Chang", "張祺煒", "contact", "social media", "links"],
  alternates: {
    canonical: 'https://www.harrychang.me/linktree',
  },
  openGraph: {
    url: 'https://www.harrychang.me/linktree',
    title: "Links | Harry Chang 張祺煒",
    description: "Connect with Harry Chang - All my links in one place",
  },
}

export default function LinksPage() {
  return <LinksPageClient />
}

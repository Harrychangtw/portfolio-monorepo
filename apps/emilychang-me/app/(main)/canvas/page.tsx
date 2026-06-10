import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import CanvasClient from "./page-client";

export const metadata: Metadata = {
  title: "Canvas",
  description:
    "Sketches, artworks, and the stories behind them. Emily Chang's canvas of visual creations, from quick studies to finished pieces and write-ups.",
  keywords: [
    "canvas",
    "art",
    "sketches",
    "illustration",
    "visual arts",
    "Emily Chang",
  ],
  alternates: {
    canonical: "/canvas",
    languages: {
      "x-default": "/canvas",
      en: "/canvas",
    },
  },
  openGraph: {
    title: "Canvas | Emily Chang",
    description:
      "Sketches, artworks, and the stories behind them — Emily Chang's canvas of visual creations.",
    url: `${siteConfig.url}/canvas`,
    siteName: siteConfig.metadata.siteName,
    type: "website",
    locale: "en_US",
    alternateLocale: ["zh_TW"],
    images: [siteConfig.media.ogImage.url],
  },
  twitter: {
    card: "summary_large_image",
    title: "Canvas | Emily Chang",
    description:
      "Sketches, artworks, and the stories behind them — Emily Chang's canvas of visual creations.",
  },
};

export default function CanvasPage() {
  return <CanvasClient />;
}

import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import HomeClient from "./page-client";

export const metadata: Metadata = {
  title: {
    absolute: siteConfig.metadata.title.default,
  },
  description:
    "Emily Chang — designer and artist exploring the intersection of design, art, and creative expression. Projects, canvas pieces, and sketches worth lingering on.",
  keywords: [
    "Emily Chang",
    "Emily Chang Portfolio",
    "portfolio",
    "designer",
    "artist",
    "design",
    "art",
    "illustration",
    "sketches",
    "creative direction",
  ],
  authors: [{ name: siteConfig.author.name, url: siteConfig.url }],
  alternates: {
    canonical: `${siteConfig.url}/`,
    languages: {
      "x-default": `${siteConfig.url}/`,
      en: `${siteConfig.url}/`,
    },
  },
  openGraph: {
    title: siteConfig.metadata.title.default,
    description:
      "Emily Chang explores the intersection of design, art, and creative expression — projects, canvas pieces, and sketches.",
    url: `${siteConfig.url}/`,
    siteName: siteConfig.metadata.siteName,
    type: "website",
    locale: "en_US",
    alternateLocale: ["zh_TW"],
    images: [siteConfig.media.ogImage.url],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.metadata.title.default,
    description:
      "Emily Chang explores the intersection of design, art, and creative expression — projects, canvas pieces, and sketches.",
  },
};

export default function Home() {
  return <HomeClient />;
}

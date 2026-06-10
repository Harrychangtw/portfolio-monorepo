import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import ProjectsClient from "./page-client";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Design work and the ideas behind it. A collection of Emily Chang's projects across design, illustration, and creative direction.",
  keywords: [
    "projects",
    "portfolio",
    "design",
    "illustration",
    "creative direction",
    "Emily Chang",
  ],
  alternates: {
    canonical: "/projects",
    languages: {
      "x-default": "/projects",
      en: "/projects",
    },
  },
  openGraph: {
    title: "Projects | Emily Chang",
    description:
      "Design work and the ideas behind it — Emily Chang's projects across design, illustration, and creative direction.",
    url: `${siteConfig.url}/projects`,
    siteName: siteConfig.metadata.siteName,
    type: "website",
    locale: "en_US",
    alternateLocale: ["zh_TW"],
    images: [siteConfig.media.ogImage.url],
  },
  twitter: {
    card: "summary_large_image",
    title: "Projects | Emily Chang",
    description:
      "Design work and the ideas behind it — Emily Chang's projects across design, illustration, and creative direction.",
  },
};

export default function ProjectsPage() {
  return <ProjectsClient />;
}

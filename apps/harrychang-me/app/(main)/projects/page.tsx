import type { Metadata } from "next";
import ProjectsSection from "@portfolio/ui/projects-section";
import { getAllProjectsMetadata } from "@portfolio/lib/lib/markdown";
import { getServerLanguage } from "@portfolio/lib/lib/server-language";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Published research, keynotes, and the builds in between. A collection of Harry Chang's work across AI, software development, and creative technology.",
  keywords: [
    "projects",
    "portfolio",
    "development",
    "research",
    "design",
    "Harry Chang",
    "張祺煒",
  ],
  alternates: {
    canonical: "/projects",
    languages: {
      "x-default": "/projects",
      en: "/projects",
    },
  },
  openGraph: {
    title: "Projects | Harry Chang 張祺煒",
    description:
      "Published research, keynotes, and the builds in between — Harry Chang's work across AI, software, and creative technology.",
    url: "https://www.harrychang.me/projects",
    siteName: "Harry Chang Portfolio",
    type: "website",
    locale: "en_US",
    alternateLocale: ["zh_TW"],
    images: ["/images/og-image-projects.webp"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Projects | Harry Chang 張祺煒",
    description:
      "Published research, keynotes, and the builds in between — Harry Chang's work across AI, software, and creative technology.",
  },
};

export default async function ProjectsPage() {
  // Loaded in the request language so a zh-TW visitor gets Chinese cards in
  // the server HTML — no English frame, and no locale fetch after hydration.
  const language = await getServerLanguage();
  const projects = getAllProjectsMetadata(language);
  return <ProjectsSection initialItems={projects} />;
}

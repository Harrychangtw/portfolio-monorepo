import type { Metadata } from "next";
import AboutSection from "@/components/main/about-section";
import UpdatesSection from "@/components/main/updates-section";
import ProjectsSection from "@portfolio/ui/projects-section";
import GallerySection from "@portfolio/ui/gallery-section";
import BlogSection from "@portfolio/ui/blog-section";
import {
  getAllGalleryMetadata,
  getAllProjectsMetadata,
  getAllPostsMetadata,
} from "@portfolio/lib/lib/markdown";

export const metadata: Metadata = {
  title: {
    absolute: "Harry Chang 張祺煒 | Portfolio",
  },
  description:
    "Harry Chang (張祺煒) builds at the intersection of AI, code, and visual storytelling. Curiosity that refuses to apologize — code, camera, and everything in between.",
  keywords: [
    "Harry Chang",
    "張祺煒",
    "Chi-Wei Chang",
    "Harry Chang Portfolio",
    "張祺煒作品集",
    "portfolio",
    "AI researcher",
    "machine learning",
    "LLM safety",
    "software developer",
    "photographer",
    "Next.js portfolio",
    "design",
    "development",
    "photography",
    "Chingshin Academy",
    "TMLR FORTRESS",
    "Chingshin RAGi",
    "academic research",
  ],
  authors: [{ name: "Harry Chang", url: "https://www.harrychang.me" }],
  alternates: {
    canonical: "https://www.harrychang.me/",
    languages: {
      en: "https://www.harrychang.me/",
      "zh-TW": "https://www.harrychang.me/?lang=zh-TW",
    },
  },
  openGraph: {
    title: "Harry Chang 張祺煒 | Code. Camera. Curiosity.",
    description:
      "Harry Chang (張祺煒) builds at the intersection of AI, code, and visual storytelling. Developer, researcher, and photographer based in Taiwan.",
    url: "https://www.harrychang.me/",
    type: "website",
    locale: "en_US",
    alternateLocale: ["zh_TW"],
  },
};

export default function Home() {
  // Fetch gallery items at build/request time - dimensions available immediately
  const galleryItems = getAllGalleryMetadata("en");
  const projectsItems = getAllProjectsMetadata("en");
  const blogPosts = getAllPostsMetadata("en");

  return (
    <>
      <AboutSection />
      <UpdatesSection />
      <ProjectsSection initialItems={projectsItems} limit={12} showSeeAll />
      <GallerySection initialItems={galleryItems} limit={16} showSeeAll />
      <BlogSection initialItems={blogPosts} limit={6} showSeeAll />
    </>
  );
}

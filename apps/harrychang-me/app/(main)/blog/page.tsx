import type { Metadata } from "next";
import BlogSection from "@portfolio/ui/blog-section";
import { getAllPostsMetadata } from "@portfolio/lib/lib/markdown";
import { getServerLanguage } from "@portfolio/lib/lib/server-language";
import { feedAlternates } from "@/config/site";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Film essays, hardware reflections, and the things worth sitting with. Writing by Harry Chang on technology, creation, and curiosity.",
  keywords: [
    "blog",
    "articles",
    "writing",
    "essays",
    "film",
    "technology",
    "Harry Chang",
    "張祺煒",
  ],
  alternates: {
    canonical: "/blog",
    languages: {
      "x-default": "/blog",
      en: "/blog",
    },
    types: feedAlternates,
  },
  openGraph: {
    title: "Blog | Harry Chang 張祺煒",
    description:
      "Film essays, hardware reflections, and the things worth sitting with — writing by Harry Chang 張祺煒.",
    url: "https://www.harrychang.me/blog",
    siteName: "Harry Chang Portfolio",
    type: "website",
    locale: "en_US",
    alternateLocale: ["zh_TW"],
    images: ["/images/og-image-blog.webp"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Harry Chang 張祺煒",
    description:
      "Film essays, hardware reflections, and the things worth sitting with — writing by Harry Chang 張祺煒.",
  },
};

export default async function BlogPage() {
  // Loaded in the request language so a zh-TW visitor gets Chinese cards in
  // the server HTML — no English frame, and no locale fetch after hydration.
  const language = await getServerLanguage();
  const blogPosts = getAllPostsMetadata(language);
  return <BlogSection initialItems={blogPosts} />;
}

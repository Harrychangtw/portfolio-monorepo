import "@/styles/lcp-optimize.css";
import type React from "react";
import type { Metadata } from "next";
import GraphClientLayout from "@/components/graph/client-layout";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.harrychang.me"),
  title: {
    template: "%s | Knowledge Graph by Harry Chang",
    default: "Knowledge Graph | Harry Chang",
  },
  description:
    "An interactive knowledge graph mapping semantic connections across blog posts, projects, gallery items, and more.",
  alternates: {
    canonical: "https://www.harrychang.me/graph",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Knowledge Graph | Harry Chang",
    description:
      "An interactive knowledge graph mapping semantic connections across blog posts, projects, gallery items, and more.",
    url: "https://www.harrychang.me/graph",
    siteName: "Knowledge Graph",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Knowledge Graph | Harry Chang",
    description:
      "An interactive knowledge graph mapping semantic connections across all content.",
  },
};

export default function GraphLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <GraphClientLayout>{children}</GraphClientLayout>;
}

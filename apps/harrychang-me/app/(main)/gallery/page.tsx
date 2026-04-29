import type { Metadata } from "next";
import GallerySection from "@portfolio/ui/gallery-section";
import { getAllGalleryMetadata } from "@portfolio/lib/lib/markdown";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Moments captured, some planned, most stumbled upon. Photography by Harry Chang — cityscapes, landscapes, and frames worth keeping.",
  keywords: [
    "gallery",
    "photography",
    "visual arts",
    "cityscapes",
    "landscapes",
    "Harry Chang",
    "張祺煒",
  ],
  alternates: {
    canonical: "/gallery",
    languages: {
      "x-default": "/gallery",
      en: "/gallery",
    },
  },
  openGraph: {
    title: "Gallery | Harry Chang 張祺煒",
    description:
      "Moments captured, some planned, most stumbled upon — photography by Harry Chang 張祺煒.",
    url: "https://www.harrychang.me/gallery",
    siteName: "Harry Chang Portfolio",
    type: "website",
    locale: "en_US",
    alternateLocale: ["zh_TW"],
    images: ["/images/og-image-gallery.webp"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gallery | Harry Chang 張祺煒",
    description:
      "Moments captured, some planned, most stumbled upon — photography by Harry Chang 張祺煒.",
  },
};

export default function GalleryPage() {
  const galleryItems = getAllGalleryMetadata("en");
  return <GallerySection initialItems={galleryItems} />;
}

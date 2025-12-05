import type { Metadata } from "next"
import GalleryPageClient from "@portfolio/ui/gallery-page-client"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Gallery",
  description: "A visual collection of photography and artwork by Harry Chang (張祺煒). Explore cityscapes, landscapes, and creative photography.",
  keywords: ['gallery', 'photography', 'visual arts', 'cityscapes', 'landscapes', 'Harry Chang', '張祺煒'],
  alternates: {
    canonical: '/gallery',
    languages: {
      'en': '/gallery',
      'zh-TW': '/gallery?lang=zh-TW',
    },
  },
  openGraph: {
    title: "Gallery | Harry Chang 張祺煒",
    description: "A visual collection of photography and artwork by Harry Chang (張祺煒)",
    url: 'https://www.harrychang.me/gallery',
    siteName: 'Harry Chang Portfolio',
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['zh_TW'],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Gallery | Harry Chang 張祺煒",
    description: "A visual collection of photography and artwork by Harry Chang (張祺煒)",
  },
}

export default function GalleryPage() {
  redirect("/#gallery")
}


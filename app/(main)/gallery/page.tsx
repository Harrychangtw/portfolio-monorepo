import type { Metadata } from "next"
import GalleryPageClient from "@/components/gallery-page-client"

export const metadata: Metadata = {
  title: "Gallery | Harry Chang 張祺煒",
  description: "A collection of visual explorations and photography by Harry Chang (張祺煒)",
}

export default function GalleryPage() {
  return <GalleryPageClient />
}


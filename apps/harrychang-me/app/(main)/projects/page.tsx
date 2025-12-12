import type { Metadata } from "next"
import ProjectsPageClient from "@portfolio/ui/projects-page-client"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Projects",
  description: "Browse design and development projects by Harry Chang (張祺煒). Explore academic research, web development, and creative projects.",
  keywords: ['projects', 'portfolio', 'development', 'research', 'design', 'Harry Chang', '張祺煒'],
  alternates: {
    canonical: '/projects',
    languages: {
      'en': '/projects',
      'zh-TW': '/projects?lang=zh-TW',
    },
  },
  openGraph: {
    title: "Projects | Harry Chang 張祺煒",
    description: "Browse design and development projects by Harry Chang (張祺煒)",
    url: 'https://www.harrychang.me/projects',
    siteName: 'Harry Chang Portfolio',
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['zh_TW'],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Projects | Harry Chang 張祺煒",
    description: "Browse design and development projects by Harry Chang (張祺煒)",
  },
}

export default function ProjectsPage() {
  redirect("/#projects")
}


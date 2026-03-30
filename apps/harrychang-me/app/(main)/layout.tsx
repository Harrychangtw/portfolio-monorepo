import "@/styles/lcp-optimize.css";
import "@/styles/video-embed.css";
import type React from "react";
import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import ClientLayout from "@/components/main/client-layout";
import Footer from "@/components/footer";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  description: siteConfig.metadata.description,
  keywords: siteConfig.metadata.keywords,
  authors: [{ name: siteConfig.author.name, url: siteConfig.url }],
  creator: siteConfig.author.name,
  publisher: siteConfig.author.name,
  alternates: {
    canonical: `${siteConfig.url}/`,
    languages: {
      en: `${siteConfig.url}/`,
      "zh-TW": `${siteConfig.url}/?lang=zh-TW`,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["zh_TW"],
    url: siteConfig.url,
    siteName: siteConfig.metadata.siteName,
    title: siteConfig.metadata.title.default,
    description: siteConfig.metadata.description,
    images: [
      {
        url: `${siteConfig.url}${siteConfig.media.ogImage.url}`,
        width: siteConfig.media.ogImage.width,
        height: siteConfig.media.ogImage.height,
        alt: siteConfig.media.ogImage.alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.metadata.title.default,
    description: `${siteConfig.author.name} (${siteConfig.author.alternateName}) portfolio showcasing photography development and design work`,
    images: [`${siteConfig.url}${siteConfig.media.ogImage.url}`],
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
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "any",
      },
    ],
    apple: {
      url: "/apple-icon.png",
      type: "image/png",
    },
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
        color: "hsl(var(--background))",
      },
    ],
  },
  verification: {
    google: siteConfig.verification.google,
  },
};

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Enhanced structured data for better SEO with WebSite, Person, and Organization
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteConfig.url}/#website`,
        url: siteConfig.url,
        name: siteConfig.metadata.siteName,
        description: siteConfig.metadata.description,
        inLanguage: ["en-US", "zh-TW"],
        publisher: {
          "@id": `${siteConfig.url}/#person`,
        },
      },
      {
        "@type": "Person",
        "@id": `${siteConfig.url}/#person`,
        name: siteConfig.author.name,
        alternateName: siteConfig.author.alternateName,
        url: siteConfig.url,
        image: `${siteConfig.url}${siteConfig.media.ogImage.url}`,
        sameAs: [
          siteConfig.social.scholar,
          siteConfig.social.github,
          siteConfig.social.linkedin,
          siteConfig.social.instagram,
          siteConfig.social.letterboxd,
        ],
        jobTitle: siteConfig.author.jobTitle,
        description: siteConfig.author.description,
        knowsAbout: siteConfig.skills,
        knowsLanguage: [
          {
            "@type": "Language",
            name: "English",
            alternateName: "en",
          },
          {
            "@type": "Language",
            name: "Chinese (Traditional)",
            alternateName: "zh-TW",
          },
        ],
        alumniOf: {
          "@type": "EducationalOrganization",
          name: "Chingshin Academy",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <ClientLayout>
        <div className="flex-1 pt-16">{children}</div>
        <Footer />
        <SpeedInsights />
      </ClientLayout>
    </>
  );
}

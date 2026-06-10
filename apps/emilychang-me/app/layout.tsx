import "./globals.css";
import type React from "react";
import type { Metadata } from "next";
import { IBM_Plex_Sans, Playfair_Display } from "next/font/google";
import { siteConfig } from "@/config/site";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["italic"],
  variable: "--font-playfair-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.metadata.title.default,
    template: siteConfig.metadata.title.template,
  },
  description: siteConfig.metadata.description,
  keywords: siteConfig.metadata.keywords,
  authors: [{ name: siteConfig.author.name, url: siteConfig.url }],
  creator: siteConfig.author.name,
  publisher: siteConfig.author.name,
  applicationName: siteConfig.metadata.siteName,
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
  alternates: {
    canonical: siteConfig.url,
    languages: {
      "x-default": siteConfig.url,
      en: siteConfig.url,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
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
    description: siteConfig.metadata.description,
    images: [`${siteConfig.url}${siteConfig.media.ogImage.url}`],
  },
  icons: {
    icon: "/favicon.png",
    apple: "/apple-icon.png",
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
      },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: siteConfig.metadata.siteName,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteConfig.url}/#website`,
        url: siteConfig.url,
        name: siteConfig.metadata.siteName,
        description: siteConfig.metadata.description,
        inLanguage: "en-US",
        publisher: {
          "@id": `${siteConfig.url}/#person`,
        },
      },
      {
        "@type": "Person",
        "@id": `${siteConfig.url}/#person`,
        name: siteConfig.author.name,
        url: siteConfig.url,
        image: `${siteConfig.url}${siteConfig.media.ogImage.url}`,
        sameAs: [
          siteConfig.social.artInstagram.url,
          siteConfig.social.personalInstagram.url,
          siteConfig.social.spotify.url,
          siteConfig.social.beli,
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
      },
    ],
  };

  return (
    <html
      lang="en"
      className={`${ibmPlexSans.variable} ${playfairDisplay.variable}`}
      style={
        {
          "--font-body": "var(--font-ibm-plex)",
          "--font-heading": "var(--font-playfair-display)",
        } as React.CSSProperties
      }
    >
      <body className="bg-background text-primary antialiased min-h-screen flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {children}
      </body>
    </html>
  );
}

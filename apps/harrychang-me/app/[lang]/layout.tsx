import type React from "react";
import type { Metadata, Viewport } from "next"; // Added Viewport type
import { siteConfig, feedAlternates } from "@/config/site";
import DocumentShell from "@/components/document-shell";
import {
  languageFromParams,
  languageParams,
} from "@portfolio/lib/lib/server-language";

// Separate viewport export (Next.js 14+ best practice)
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  width: "device-width",
  initialScale: 1,
};

// Render pages next to the audience. Pages are prerendered, so this only
// covers whatever still renders on demand — but most traffic is from Taiwan,
// and with no region set that ran in iad1 (Washington DC). Set here rather
// than in vercel.json so the API routes stay co-located with the database.
export const preferredRegion = "hkg1";

// Every page is prerendered once per language; the middleware picks which
// copy a request gets. Any other value in this segment is a 404, and since the
// middleware prefixes every page path, a direct `/en/...` request is too.
export const dynamicParams = false;

export function generateStaticParams() {
  return languageParams();
}

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
  applicationName: siteConfig.metadata.siteName, // Added: Helps with PWA/saved-to-home-screen naming
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
  verification: {
    google: siteConfig.verification.google,
  },
  alternates: {
    canonical: siteConfig.url,
    languages: {
      "x-default": siteConfig.url,
      en: siteConfig.url,
    },
    // Feed autodiscovery: lets readers subscribe from the site URL alone.
    types: feedAlternates,
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
    description: siteConfig.metadata.description,
    creator: "@harrychangtw",
    site: "@harrychangtw",
    images: [`${siteConfig.url}${siteConfig.media.ogImage.url}`],
  },
  // Added: Essential for favicons and mobile icons
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
        color: "#0A0A0A",
      },
    ],
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: siteConfig.metadata.siteName,
  },
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  // `lang` was hardcoded to "en" even while the page displayed Chinese, which
  // mis-signals the content language to screen readers and search engines.
  const language = await languageFromParams(params);

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
          siteConfig.social.medium,
          siteConfig.social.telegram,
          siteConfig.social.discord,
          siteConfig.social.spotify,
          "https://x.com/harrychangtw",
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
    <DocumentShell language={language} structuredData={structuredData}>
      {children}
    </DocumentShell>
  );
}

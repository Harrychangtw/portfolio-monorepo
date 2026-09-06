import "./globals.css";
import type React from "react";
import type { Metadata, Viewport } from "next"; // Added Viewport type
import { IBM_Plex_Sans } from "next/font/google";
import localFont from "next/font/local";
import { siteConfig, feedAlternates } from "@/config/site";
import RootClientShell from "@/components/root-client-shell";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-sans",
  display: "swap",
});

// Separate viewport export (Next.js 14+ best practice)
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  width: "device-width",
  initialScale: 1,
};
const artific = localFont({
  src: [
    {
      path: "../public/fonts/artific-fonts/Artific-Thin.woff2",
      weight: "100",
      style: "normal",
    },
    {
      path: "../public/fonts/artific-fonts/Artific-SuperLight.woff2",
      weight: "200",
      style: "normal",
    },
    {
      path: "../public/fonts/artific-fonts/Artific-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/artific-fonts/Artific-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/artific-fonts/Artific-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/artific-fonts/Artific-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/artific-fonts/Artific-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/artific-fonts/Artific-SuperBold.woff2",
      weight: "800",
      style: "normal",
    },
    {
      path: "../public/fonts/artific-fonts/Artific-Black.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-artific", // New variable name
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
    <html
      lang="en"
      // Added suppressHydrationWarning because you are using next-themes or dark mode class manipulation
      suppressHydrationWarning
      className={`dark ${artific.variable} ${ibmPlexSans.variable}`}
      style={
        {
          "--font-body": "var(--font-ibm-plex-sans)",
          "--font-heading": "var(--font-artific)",
          fontFeatureSettings: '"ss01" 1',
        } as React.CSSProperties
      }
    >
      <body
        className={`bg-background text-primary antialiased min-h-screen flex flex-col`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <RootClientShell>{children}</RootClientShell>
      </body>
    </html>
  );
}

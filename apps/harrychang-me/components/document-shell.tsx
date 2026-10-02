import "@/app/globals.css";
import type React from "react";
import { IBM_Plex_Sans } from "next/font/google";
import localFont from "next/font/local";
import type { Language } from "@portfolio/lib/contexts/language-context";
import { htmlLang } from "@portfolio/lib/lib/server-language";
import RootClientShell from "@/components/root-client-shell";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-sans",
  display: "swap",
});

// Only the weights actually used are declared. next/font emits a <link
// rel="preload"> for every declared weight, so each unused one cost ~38 KB of
// high-priority bandwidth on the critical path. Weights 100/200/900 had no
// `font-thin`/`font-extralight`/`font-black` usage anywhere in the app or
// packages; re-add a weight here if you start using it.
const artific = localFont({
  src: [
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
  ],
  variable: "--font-artific", // New variable name
  display: "swap",
});

/**
 * The `<html>` document every page renders into: fonts, the pre-paint theme
 * script and the root client providers. Shared by the `[lang]` root layout and
 * app/global-not-found.tsx, which has to render its own document because an
 * unmatched URL never reaches a layout.
 */
export default function DocumentShell({
  language,
  structuredData,
  children,
}: {
  language: Language;
  structuredData?: object;
  children: React.ReactNode;
}) {
  return (
    <html
      lang={htmlLang(language)}
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
      {/* This is the root layout's document, just factored out of the file. */}
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        {/*
          Applies the saved theme before the first paint. ThemeProvider used to
          render nothing until it had mounted, which avoided the flash by
          withholding the entire page — and cost every route its server-rendered
          HTML. Doing it here keeps the no-flash guarantee while letting the app
          prerender. Must stay in sync with the "theme" cookie written by
          setCookie() in packages/lib/lib/cookies.ts.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var m=document.cookie.match(/(?:^|; )theme=([^;]*)/);if(m&&decodeURIComponent(m[1])==='light'){document.documentElement.classList.add('light')}}catch(e){}`,
          }}
        />
      </head>
      <body
        className={`bg-background text-primary antialiased min-h-screen flex flex-col`}
      >
        {structuredData && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          />
        )}
        <RootClientShell>{children}</RootClientShell>
      </body>
    </html>
  );
}

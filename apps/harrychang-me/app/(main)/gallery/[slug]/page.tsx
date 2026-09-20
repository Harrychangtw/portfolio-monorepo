import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getGalleryItemData,
  getAllGallerySlugs,
  getNextGalleryItem,
} from "@portfolio/lib/lib/markdown";
import GalleryPostClient from "@portfolio/ui/gallery-post-client";
import {
  getServerLanguage,
  localizedSlug,
} from "@portfolio/lib/lib/server-language";
import GraphNextUp from "@/components/graph/graph-next-up";
import HashAnchorPulse from "@/components/graph/hash-anchor-pulse";
import { siteConfig } from "@/config/site";

const baseUrl = siteConfig.url;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!slug) return { title: "Gallery Item Not Found" };

  const item = await getGalleryItemData(slug);

  if (!item) {
    return {
      title: "Gallery Item Not Found",
    };
  }

  // Determine if this is a Chinese version
  const isChineseVersion = slug.includes("_zh-tw") || slug.includes("_zh-TW");
  const baseSlug = slug.replace(/_zh-tw|_zh-TW/i, "");
  const allSlugs = new Set(
    getAllGallerySlugs().map(({ params }) => params.slug.toLowerCase()),
  );
  const hasChineseVersion = allSlugs.has(`${baseSlug}_zh-tw`.toLowerCase());
  const canonicalUrl = `${baseUrl}/gallery/${slug}`;

  // Get full URL for the image
  const imageUrl = item.imageUrl.startsWith("http")
    ? item.imageUrl
    : `${baseUrl}${item.imageUrl.startsWith("/") ? "" : "/"}${item.imageUrl}`;

  return {
    title: isChineseVersion
      ? `${item.title} | 影像`
      : `${item.title} | Gallery`,
    description: item.description || `${item.title} — by Harry Chang`,
    keywords: [
      item.title,
      "photography",
      "gallery",
      "Harry Chang",
      "張祺煒",
    ].filter(Boolean),
    authors: [{ name: "Harry Chang" }],
    creator: "Harry Chang",
    publisher: "Harry Chang",
    alternates: {
      canonical: canonicalUrl,
      languages: {
        "x-default": `${baseUrl}/gallery/${baseSlug}`,
        en: `${baseUrl}/gallery/${baseSlug}`,
        ...(hasChineseVersion
          ? { "zh-TW": `${baseUrl}/gallery/${baseSlug}_zh-tw` }
          : {}),
      },
    },
    openGraph: {
      title: item.title,
      description: item.description,
      url: canonicalUrl,
      siteName: "Harry Chang Portfolio",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: item.title,
        },
      ],
      locale: isChineseVersion ? "zh_TW" : "en_US",
      type: "article",
      publishedTime: item.date,
    },
    twitter: {
      card: "summary_large_image",
      title: item.title,
      description: item.description,
      images: [imageUrl],
      creator: "@harrychangtw",
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
  };
}

/**
 * These pages read the request cookie to serve the visitor's language, which
 * a static render cannot do — leaving generateStaticParams in place made Next
 * attempt an SSG render and fail every request with DYNAMIC_SERVER_USAGE.
 *
 * If the cookie-aware language render is ever reverted, drop this and restore
 * `export async function generateStaticParams() { return getAllGallerySlugs(); }`.
 */
export const dynamic = "force-dynamic";

export default async function GalleryItemPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!slug) notFound();

  // The URL carries one language's slug; serve the visitor's language from
  // the server so the post client has nothing left to refetch on load.
  // generateMetadata deliberately still keys off the URL slug, so canonical
  // URLs and OG tags never vary by cookie.
  const language = await getServerLanguage();
  const targetSlug = localizedSlug(slug, language);
  const item =
    (await getGalleryItemData(targetSlug)) ?? (await getGalleryItemData(slug));
  const nextItem = await getNextGalleryItem(item?.slug ?? slug);

  if (!item) {
    notFound();
  }

  // Determine if this is a Chinese version
  const isChineseVersion = slug.includes("_zh-tw") || slug.includes("_zh-TW");

  const canonicalUrl = `${baseUrl}/gallery/${slug}`;

  // Get full URL for the image
  const imageUrl = item.imageUrl.startsWith("http")
    ? item.imageUrl
    : `${baseUrl}${item.imageUrl.startsWith("/") ? "" : "/"}${item.imageUrl}`;

  // Create structured data for better SEO with Entity Graph
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      // Photograph Schema
      {
        "@type": "Photograph",
        "@id": `${canonicalUrl}/#photograph`,
        name: item.title,
        description: item.description,
        image: imageUrl,
        datePublished: item.date,
        author: {
          "@id": `${baseUrl}/#person`,
        },
        creator: {
          "@id": `${baseUrl}/#person`,
        },
        copyrightHolder: {
          "@id": `${baseUrl}/#person`,
        },
        isPartOf: {
          "@id": `${baseUrl}/#website`,
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": canonicalUrl,
        },
        inLanguage: isChineseVersion ? "zh-TW" : "en-US",
      },
      // BreadcrumbList Schema
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Harry Chang",
            item: baseUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Gallery",
            item: `${baseUrl}/gallery`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: item.title,
            item: canonicalUrl,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <HashAnchorPulse />
      <GalleryPostClient
        initialItem={item}
        nextItem={nextItem}
        localGraphSlot={
          <GraphNextUp
            sourceType="gallery"
            basePath="gallery"
            nextItem={nextItem}
          />
        }
      />
    </>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ReactDOM from "react-dom";
import {
  getPostData,
  getAllPostSlugs,
  getNextPost,
} from "@portfolio/lib/lib/markdown";
import BlogPostClient from "@portfolio/ui/blog-post-client";
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
  if (!slug) return { title: "Post Not Found" };

  const post = await getPostData(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  const isChineseVersion = slug.includes("_zh-tw") || slug.includes("_zh-TW");
  const baseSlug = slug.replace(/_zh-tw|_zh-TW/i, "");
  const allSlugs = new Set(
    getAllPostSlugs().map(({ params }) => params.slug.toLowerCase()),
  );
  const hasChineseVersion = allSlugs.has(`${baseSlug}_zh-tw`.toLowerCase());
  const canonicalUrl = `${baseUrl}/blog/${slug}`;

  const imageUrl = post.imageUrl.startsWith("http")
    ? post.imageUrl
    : `${baseUrl}${post.imageUrl.startsWith("/") ? "" : "/"}${post.imageUrl}`;

  return {
    title: isChineseVersion ? `${post.title} | 部落格` : `${post.title} | Blog`,
    description:
      post.description || `${post.title} — by ${post.author || "Harry Chang"}`,
    keywords: [
      post.title,
      ...(post.tags || []),
      "Harry Chang",
      "張祺煒",
      "blog",
    ].filter(Boolean),
    authors: [{ name: post.author || "Harry Chang" }],
    alternates: {
      canonical: canonicalUrl,
      languages: {
        "x-default": `${baseUrl}/blog/${baseSlug}`,
        en: `${baseUrl}/blog/${baseSlug}`,
        ...(hasChineseVersion
          ? { "zh-TW": `${baseUrl}/blog/${baseSlug}_zh-tw` }
          : {}),
      },
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: canonicalUrl,
      siteName: "Harry Chang Portfolio",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      locale: isChineseVersion ? "zh_TW" : "en_US",
      type: "article",
      publishedTime: post.date,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [imageUrl],
      creator: "@harrychangtw",
    },
  };
}

export async function generateStaticParams() {
  const paths = getAllPostSlugs();
  return paths;
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!slug) notFound();

  const post = await getPostData(slug);
  const nextPost = await getNextPost(slug);

  if (!post) {
    notFound();
  }

  if (post.imageUrl) {
    ReactDOM.preload(post.imageUrl, {
      as: "image",
      fetchPriority: "high",
      type: "image/webp",
    });
  }

  const isChineseVersion = slug.includes("_zh-tw") || slug.includes("_zh-TW");

  const canonicalUrl = `${baseUrl}/blog/${slug}`;

  const imageUrl = post.imageUrl.startsWith("http")
    ? post.imageUrl
    : `${baseUrl}${post.imageUrl.startsWith("/") ? "" : "/"}${post.imageUrl}`;

  // Create structured data for better SEO with Entity Graph
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      // BlogPosting Schema
      {
        "@type": "BlogPosting",
        "@id": `${canonicalUrl}/#article`,
        headline: post.title,
        description: post.description,
        image: imageUrl,
        datePublished: post.date,
        author: {
          "@id": `${baseUrl}/#person`,
        },
        publisher: {
          "@id": `${baseUrl}/#person`,
        },
        isPartOf: {
          "@id": `${baseUrl}/#website`,
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": canonicalUrl,
        },
        keywords: (post.tags || []).join(", "),
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
            name: "Blog",
            item: `${baseUrl}/blog`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: post.title,
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
      <BlogPostClient
        initialPost={post}
        nextPost={nextPost}
        localGraphSlot={
          <GraphNextUp sourceType="post" basePath="blog" nextItem={nextPost} />
        }
      />
    </>
  );
}

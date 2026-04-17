"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import parse, { Element } from "html-react-parser";
import dynamic from "next/dynamic";
import { useLanguage } from "@portfolio/lib/contexts/language-context";

const LanguageSwitcher = dynamic(
  () => import("@portfolio/ui/language-switcher"),
  { ssr: false },
);
const ThemeSwitcher = dynamic(() => import("@portfolio/ui/theme-switcher"), {
  ssr: false,
});
import { ImageContainer } from "@portfolio/ui/image-container";
import type { PostMetadata } from "@portfolio/lib/lib/markdown";
import NextUpCard from "@portfolio/ui/next-up-card";
import NavigationLink from "@portfolio/ui/navigation-link";
import { TableOfContents } from "@portfolio/ui/table-of-contents";

interface BlogPostClientProps {
  initialPost: PostMetadata & { contentHtml: string };
  nextPost?: {
    slug: string;
    title: string;
    category: string;
    imageUrl: string;
    aspectRatio?: number;
  } | null;
  localGraphSlot?: React.ReactNode;
}

export default function BlogPostClient({
  initialPost,
  nextPost,
  localGraphSlot,
}: BlogPostClientProps) {
  const { language, t } = useLanguage();
  const [post, setPost] = useState(initialPost);
  const [nextPostData, setNextPostData] = useState(nextPost);
  // Force scroll to top on navigation
  useLayoutEffect(() => {
    // Set scroll restoration to manual first
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    // Immediate scroll
    window.scrollTo(0, 0);
    // Backup scroll after any pending browser scroll restoration
    const frame = requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });
    return () => cancelAnimationFrame(frame);
  }, [initialPost.slug]);

  // Fetch localized version of the Next Up post
  useEffect(() => {
    async function fetchLocalizedNextPost() {
      if (!nextPost) return;

      const baseSlug = nextPost.slug.replace("_zh-tw", "");
      let targetSlug = baseSlug;

      if (language === "zh-TW") {
        targetSlug = `${baseSlug}_zh-tw`;
      }

      if (nextPostData && nextPostData.slug === targetSlug) return;

      try {
        const response = await fetch(`/api/posts/${targetSlug}`);
        if (response.ok) {
          const data = await response.json();
          setNextPostData({
            slug: data.slug,
            title: data.title,
            category: data.description, // Blog uses description as category in card
            imageUrl: data.imageUrl,
            aspectRatio: nextPost.aspectRatio, // Blog cards are 1.5
          });
        } else {
          if (language === "zh-TW" && targetSlug.includes("_zh-tw")) {
            const fallbackResponse = await fetch(`/api/posts/${baseSlug}`);
            if (fallbackResponse.ok) {
              const data = await fallbackResponse.json();
              setNextPostData({
                slug: data.slug,
                title: data.title,
                category: data.description,
                imageUrl: data.imageUrl,
                aspectRatio: nextPost.aspectRatio,
              });
            }
          }
        }
      } catch (error) {
        console.error("Error fetching localized next post:", error);
      }
    }

    fetchLocalizedNextPost();
  }, [language, nextPost]);

  useEffect(() => {
    async function fetchLocalizedPost() {
      const baseSlug = post.slug.replace("_zh-tw", "");
      let targetSlug = baseSlug;

      if (language === "zh-TW") {
        targetSlug = `${baseSlug}_zh-tw`;
      }

      if (targetSlug !== post.slug) {
        try {
          const response = await fetch(`/api/posts/${targetSlug}`);
          if (response.ok) {
            const postData = await response.json();
            setPost(postData);
          } else {
            if (language === "zh-TW" && targetSlug.includes("_zh-tw")) {
              const fallbackResponse = await fetch(`/api/posts/${baseSlug}`);
              if (fallbackResponse.ok) {
                const fallbackData = await fallbackResponse.json();
                setPost(fallbackData);
              }
            }
          }
        } catch (error) {
          console.error("Error fetching localized version:", error);
        }
      }
    }

    fetchLocalizedPost();
  }, [language, post.slug]);
  // Format date
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="page-transition-enter">
      <div className="pb-12 pt-24 md:pt-32">
        <div className="container">
          {/* Header Section: Title (Left 2 cols) & Metadata (Right 1 col) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 mb-8 md:mb-12 items-start">
            {/* Title - Spans 2 columns of visual weight (cols 1-8) */}
            <div className="md:col-span-8">
              <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4 md:mb-8 text-primary">
                {" "}
                {post.title}
              </h1>
            </div>

            {/* Date & Tags - Right column (cols 9-12), left aligned within that column */}
            <div className="md:col-span-4 flex flex-col justify-end space-y-6">
              <div>
                <p className="font-heading uppercase text-xs tracking-wider text-secondary mb-1">
                  Date
                </p>
                <p className="font-body text-secondary">
                  {formatDate(post.date)}
                </p>
              </div>

              {post.tags && post.tags.length > 0 && (
                <div>
                  <p className="font-heading uppercase text-xs tracking-wider text-secondary mb-2">
                    {t("blog.tags")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="font-body text-sm text-secondary bg-muted px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Hero image section - Full width 3:2 */}
          <div className="relative w-full mb-16 md:mb-24">
            <ImageContainer
              src={post.imageUrl}
              alt={post.title}
              priority={false}
              quality={95}
              noInsetPadding={true}
              aspectRatio={1.5}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12">
            {/* Left Sidebar: Back Button & Table of Contents */}
            <div className="md:col-span-4">
              <div className="md:sticky md:top-24 flex flex-col gap-8">
                {/* Mobile: Flex row for Nav + Switchers */}
                <div className="flex items-center justify-between md:block">
                  <NavigationLink
                    href="/#blog"
                    className="inline-flex items-center text-secondary hover:text-accent transition-colors"
                  >
                    <span className="mr-2 font-heading">←</span>
                    <span className="font-heading">{t("blog.backToBlog")}</span>
                  </NavigationLink>

                  {/* Mobile-only Switchers */}
                  <div className="flex md:hidden items-center gap-4">
                    <LanguageSwitcher />
                  </div>
                </div>

                <div className="hidden md:block pt-8 border-t border-border">
                  <TableOfContents contentHtml={post.contentHtml} />
                  <div className="flex items-center gap-6 mt-8">
                    <LanguageSwitcher />
                    <ThemeSwitcher />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content: Description & Prose */}
            <div className="md:col-span-8">
              {/* Description / Lead Paragraph */}
              {post.description && (
                <p className="font-body text-lg leading-relaxed text-primary mb-12 italic">
                  {post.description}
                </p>
              )}

              {/* Markdown Content */}
              <div className="prose prose-lg max-w-none dark:prose-invert mb-16 md:mb-24">
                {parse(post.contentHtml, {
                  replace: (domNode) => {
                    if (
                      domNode instanceof Element &&
                      domNode.attribs &&
                      domNode.attribs.class === "markdown-image-placeholder"
                    ) {
                      const {
                        "data-src": src,
                        "data-alt": alt,
                        "data-aspect-ratio": aspectRatio,
                        "data-framed": framed,
                      } = domNode.attribs;
                      return (
                        <ImageContainer
                          src={src}
                          alt={alt || ""}
                          aspectRatio={
                            aspectRatio ? parseFloat(aspectRatio) : undefined
                          }
                          noInsetPadding={framed !== "true"}
                          quality={95}
                        />
                      );
                    }
                  },
                })}
              </div>

              {/* Local Graph + Next Up Card (coupled) */}
              {localGraphSlot}

              {/* Standalone Next Up Card (fallback when no graph) */}
              {!localGraphSlot && nextPostData && (
                <NextUpCard
                  title={nextPostData.title}
                  category={nextPostData.category}
                  slug={nextPostData.slug}
                  imageUrl={nextPostData.imageUrl}
                  basePath="blog"
                  aspectRatio={nextPostData.aspectRatio}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

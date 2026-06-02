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
import { CompareSlider } from "@portfolio/ui/compare-slider";
import NextUpCard from "@portfolio/ui/next-up-card";
import type { GalleryItemMetadata } from "@portfolio/lib/lib/markdown";
import NavigationLink from "@portfolio/ui/navigation-link";

interface GalleryPostClientProps {
  initialItem: GalleryItemMetadata & { contentHtml: string };
  nextItem?: {
    slug: string;
    title: string;
    category: string;
    imageUrl: string;
    aspectRatio?: number;
  } | null;
  localGraphSlot?: React.ReactNode;
}

export default function GalleryPostClient({
  initialItem,
  nextItem,
  localGraphSlot,
}: GalleryPostClientProps) {
  const { language, t } = useLanguage();
  const [item, setItem] = useState(initialItem);
  const [nextItemData, setNextItemData] = useState(nextItem);

  // Force scroll to top on navigation - use useLayoutEffect for synchronous execution
  // before browser paint to prevent scroll restoration issues on mobile
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
  }, [initialItem.slug]);

  // Fetch localized version of the Next Up gallery item
  useEffect(() => {
    async function fetchLocalizedNextItem() {
      if (!nextItem) return;

      const baseSlug = nextItem.slug.replace("_zh-tw", "");
      let targetSlug = baseSlug;

      if (language === "zh-TW") {
        targetSlug = `${baseSlug}_zh-tw`;
      }

      if (nextItemData && nextItemData.slug === targetSlug) return;

      try {
        const response = await fetch(`/api/gallery/${targetSlug}`);
        if (response.ok) {
          const data = await response.json();
          setNextItemData({
            slug: data.slug,
            title: data.title,
            category: data.quote, // Gallery uses quote as category subtitle
            imageUrl: data.imageUrl,
            aspectRatio: data.aspectRatio || nextItem.aspectRatio,
          });
        } else {
          if (language === "zh-TW" && targetSlug.includes("_zh-tw")) {
            const fallbackResponse = await fetch(`/api/gallery/${baseSlug}`);
            if (fallbackResponse.ok) {
              const data = await fallbackResponse.json();
              setNextItemData({
                slug: data.slug,
                title: data.title,
                category: data.quote,
                imageUrl: data.imageUrl,
                aspectRatio: data.aspectRatio || nextItem.aspectRatio,
              });
            }
          }
        }
      } catch (error) {
        console.error("Error fetching localized next item:", error);
      }
    }

    fetchLocalizedNextItem();
  }, [language, nextItem]);

  useEffect(() => {
    async function fetchLocalizedItem() {
      const baseSlug = item.slug.replace("_zh-tw", "");
      let targetSlug = baseSlug;

      if (language === "zh-TW") {
        targetSlug = `${baseSlug}_zh-tw`;
      }

      // Only fetch if we need a different version than what we currently have
      if (targetSlug !== item.slug) {
        try {
          const response = await fetch(`/api/gallery/${targetSlug}`);
          if (response.ok) {
            const itemData = await response.json();
            // Preserve dimension data (width, height, aspectRatio) from initial load
            // API returns full dimension data via getGalleryItemData(), so this should be available
            setItem(itemData);
          } else {
            // If the target version doesn't exist, fall back to base version
            if (language === "zh-TW" && targetSlug.includes("_zh-tw")) {
              const fallbackResponse = await fetch(`/api/gallery/${baseSlug}`);
              if (fallbackResponse.ok) {
                const fallbackData = await fallbackResponse.json();
                setItem(fallbackData);
              }
            }
          }
        } catch (error) {
          console.error("Error fetching localized version:", error);
          // Keep the current item on error
        }
      }
    }

    fetchLocalizedItem();
  }, [language, item.slug]);

  // Extract the full image URL (not thumbnail) for the main hero image
  const fullImageUrl =
    item.imageUrl?.replace("-thumb.webp", ".webp") || "/placeholder.svg";

  // Check if description exists to adjust layout
  const hasDescription = item.description && item.description.trim() !== "";

  return (
    <div className="page-transition-enter">
      <div className="pb-12">
        <div className="container">
          <div className="relative w-full mb-8">
            <ImageContainer
              src={fullImageUrl}
              alt={item.title}
              priority={true}
              quality={90}
              aspectRatio={item.aspectRatio}
              noInsetPadding={true}
            />
          </div>
        </div>

        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12">
            {/* Left column */}
            <div className="md:col-span-4 mb-10 md:mb-0">
              <div className="md:sticky md:top-24">
                <div className="relative">
                  {/* Mobile: Flex row for Nav + Switchers */}
                  <div className="flex items-center justify-between md:block">
                    <NavigationLink
                      href="/#gallery"
                      className="inline-flex items-center text-secondary hover:text-accent transition-colors font-body"
                    >
                      <span className="mr-2 font-heading">←</span>
                      <span className="font-heading">
                        {t("gallery.backToGallery")}
                      </span>
                    </NavigationLink>

                    {/* Mobile-only Switchers */}
                    <div className="flex md:hidden items-center gap-4">
                      <LanguageSwitcher />
                    </div>
                  </div>
                  <div className="mt-8">
                    <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4 md:mb-8 text-primary">
                      {item.title}
                    </h1>
                    <p className="text-secondary mb-6 md:mb-12 font-body">
                      {new Date(item.date).toLocaleDateString(
                        language === "zh-TW" ? "zh-TW" : "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </p>
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-6 mt-8 pt-8 border-t border-border">
                  <LanguageSwitcher />
                  <ThemeSwitcher />
                </div>
              </div>
            </div>

            {/* Right column - aligned with title */}
            <div className="md:col-span-8">
              <div className="md:mt-14">
                {/* Description area and attributes */}
                <div className="mb-16 md:mb-24">
                  {hasDescription && (
                    <p className="text-lg md:text-xl mb-10 md:mb-16 font-body text-primary">
                      {item.description}
                    </p>
                  )}

                  {/* Additional attributes in a grid */}
                  <div
                    className={`grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8 md:gap-x-12 ${
                      hasDescription ? "mb-16 md:mb-24" : "mt-0"
                    } text-secondary`}
                  >
                    {item.camera && (
                      <div>
                        <p className="uppercase text-xs mb-1 font-heading text-secondary">
                          {t("gallery.camera")}
                        </p>
                        <p className="font-body text-secondary">
                          {item.camera}
                        </p>
                      </div>
                    )}
                    {item.lens && (
                      <div>
                        <p className="uppercase text-xs mb-1 font-heading text-secondary">
                          {t("gallery.lens")}
                        </p>
                        <p className="font-body text-secondary">{item.lens}</p>
                      </div>
                    )}
                    {item.location && (
                      <div>
                        <p className="uppercase text-xs mb-1 font-heading text-secondary">
                          {t("gallery.location")}
                        </p>
                        <p className="font-body text-secondary">
                          {item.location}
                        </p>
                      </div>
                    )}
                    {item.tags && item.tags.length > 0 && (
                      <div>
                        <p className="uppercase text-xs mb-1 font-heading text-secondary">
                          {t("gallery.tags")}
                        </p>
                        <p className="font-body text-secondary">
                          {item.tags.join(", ")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Main content */}
                <div className="prose prose-lg max-w-none dark:prose-invert mb-16 md:mb-24">
                  {parse(item.contentHtml, {
                    replace: (domNode) => {
                      if (
                        domNode instanceof Element &&
                        domNode.attribs &&
                        domNode.attribs.class === "markdown-compare-placeholder"
                      ) {
                        const {
                          "data-left-src": leftSrc,
                          "data-right-src": rightSrc,
                          "data-alt": alt,
                          "data-aspect-ratio": aspectRatio,
                          "data-framed": framed,
                        } = domNode.attribs;
                        return (
                          <CompareSlider
                            leftSrc={leftSrc}
                            rightSrc={rightSrc}
                            alt={alt || ""}
                            aspectRatio={
                              aspectRatio ? parseFloat(aspectRatio) : undefined
                            }
                            noInsetPadding={framed !== "true"}
                            quality={95}
                          />
                        );
                      }
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

                {/* Gallery grid with consistent spacing */}
                {item.gallery && item.gallery.length > 0 && (
                  <div className="flex flex-col">
                    {item.gallery.map((image, index) => {
                      const fullUrl = image.url.replace("-thumb.webp", ".webp");
                      const aspectRatio =
                        image.aspectRatio ||
                        (image.width && image.height
                          ? image.width / image.height
                          : undefined);

                      return (
                        <div
                          key={index}
                          className="w-full"
                          style={{
                            marginBottom: "clamp(1rem, 2.5vw, 2rem)",
                          }}
                        >
                          <ImageContainer
                            src={fullUrl}
                            alt={
                              image.caption ||
                              `${item.title} image ${index + 1}`
                            }
                            caption={image.caption}
                            priority={false}
                            quality={90}
                            aspectRatio={aspectRatio}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Local Graph + Next Up Card (coupled) */}
                {localGraphSlot}

                {/* Standalone Next Up Card (fallback when no graph) */}
                {!localGraphSlot && nextItemData && (
                  <NextUpCard
                    title={nextItemData.title}
                    category={nextItemData.category}
                    slug={nextItemData.slug}
                    imageUrl={nextItemData.imageUrl}
                    basePath="gallery"
                    aspectRatio={nextItemData.aspectRatio}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

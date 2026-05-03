"use client";

import { useState, useRef, useEffect } from "react";
import Image, { type ImageLoaderProps } from "next/image";

// Widths emitted by scripts/optimize-images.js as `<name>-<width>w.webp`.
// Must stay in sync with RESPONSIVE_WIDTHS in that script.
const RESPONSIVE_WIDTHS = [640, 828, 1080, 1920, 2560] as const;

// Custom loader: returns a static URL pointing at the pre-generated variant.
// Using a custom loader bypasses Next's /_next/image optimizer entirely while
// still letting <Image> emit a proper responsive srcSet.
const webpLoader = ({ src, width }: ImageLoaderProps) => {
  const target =
    RESPONSIVE_WIDTHS.find((w) => w >= width) ??
    RESPONSIVE_WIDTHS[RESPONSIVE_WIDTHS.length - 1];
  return src.replace(/\.webp$/, `-${target}w.webp`);
};
import { useIsMobile } from "@portfolio/lib/hooks/use-mobile";
import { ImageLoadingSkeleton } from "./image-loading-skeleton";
import { useIntersectionObserver } from "@portfolio/lib/hooks/use-intersection-observer";

interface ImageContainerProps {
  src: string;
  alt: string;
  caption?: string;
  priority?: boolean;
  quality?: number;
  aspectRatio?: number; // Optional aspect ratio override (width/height)
  noInsetPadding?: boolean; // Option to remove the inset padding (outline effect)
  sizes?: string; // Optional sizes attribute for responsive layouts
  imgClassName?: string; // Added: Pass classes to the inner Image component
  restrictPortraitWidth?: boolean; // Added: Toggle desktop portrait centering (default true)
}

export function ImageContainer({
  src,
  alt,
  caption,
  priority = false,
  quality = 80,
  aspectRatio: providedAspectRatio,
  noInsetPadding = false,
  sizes = "100vw",
  imgClassName,
  restrictPortraitWidth = true,
}: ImageContainerProps) {
  const containerRef = useRef<HTMLElement>(null);
  const isVisible = useIntersectionObserver({
    elementRef: containerRef as React.RefObject<Element>,
    rootMargin: "50px",
  });

  // Detect video content
  const isVideo = src?.toLowerCase().endsWith(".mp4");

  // Use provided aspect ratio or default to 3:2 (standard photo ratio)
  // For videos, markdown usually provides 1.7778 (16:9)
  const aspectRatio = providedAspectRatio ?? 1.5;

  const [blurComplete, setBlurComplete] = useState(false);
  const isMobile = useIsMobile();

  // Reset pixelate animation when element leaves the viewport so it replays on re-entry
  useEffect(() => {
    if (!isVisible) {
      setBlurComplete(false);
    }
  }, [isVisible]);

  // Derive thumbnail and full-resolution URLs for blur-up loading.
  let thumbnailSrc: string | undefined;
  let fullSrc = src;

  if (isVideo) {
    // Videos don't have generated thumbnails in this pipeline
    // We rely on the skeleton until the video data loads
    thumbnailSrc = undefined;
    fullSrc = src;
  } else if (src?.endsWith("-thumb.webp")) {
    // Card / preview URLs already point at the thumbnail
    thumbnailSrc = src;
    fullSrc = src.replace("-thumb.webp", ".webp");
  } else if (src?.endsWith(".webp")) {
    thumbnailSrc = src.replace(".webp", "-thumb.webp");
    fullSrc = src;
  } else if (src) {
    // Non-webp fallback – just use the same URL for both
    thumbnailSrc = src;
    fullSrc = src;
  }

  // Calculate border thickness as 0.01 (1%) of container width
  // Min 1px, max 4px on mobile and 6px on desktop
  const minThickness = isMobile ? 1 : 1;
  const maxThickness = isMobile ? 4 : 6;
  const borderThickness = `clamp(${minThickness}px, 0.01 * 100%, ${maxThickness}px)`;

  // Responsive internal padding in pixels
  const insetPadding = noInsetPadding ? 0 : isMobile ? 4 : 7;

  // Derive layout from aspect ratio (no dimension state needed)
  const isPortrait = aspectRatio < 1;
  const isCinematic = aspectRatio >= 2.2 && aspectRatio <= 2.4;
  const targetRatio = 1.5;

  let containerPadding;
  let horizontalPadding = "0px";
  let verticalPadding = "0px";
  let containerClass = "";

  if (isPortrait) {
    // On mobile, portrait images should always span full width
    // On desktop, maintain the target ratio with horizontal padding ONLY if restrictPortraitWidth is true
    if (isMobile || !restrictPortraitWidth) {
      // For all vertical images on mobile OR grid cards, use full width
      containerPadding = `${(1 / aspectRatio) * 100}%`;
      horizontalPadding = "0px";
    } else {
      // For desktop feed views, maintain target ratio with horizontal padding
      containerPadding = `${(1 / aspectRatio) * 100}%`;
      const relativeWidth = (aspectRatio / targetRatio) * 100;
      horizontalPadding = `${(100 - relativeWidth) / 2}%`;
    }
    containerClass = `border-t-[${borderThickness}] border-b-[${borderThickness}] border-white`;
  } else if (isCinematic) {
    containerPadding = `${(1 / targetRatio) * 100}%`;
    const cinematic_height_percentage = (targetRatio / aspectRatio) * 100;
    verticalPadding = `${(100 - cinematic_height_percentage) / 2}%`;
    containerClass = `border-l-[${borderThickness}] border-r-[${borderThickness}] border-white`;
  } else {
    containerPadding = `${(1 / aspectRatio) * 100}%`;
    containerClass = `border-l-[${borderThickness}] border-r-[${borderThickness}] border-white`;
  }

  return (
    <figure className="w-full not-prose" ref={containerRef}>
      <div className="w-full">
        <div
          className={`relative w-full ${noInsetPadding ? "" : "bg-white"}`}
          style={{
            paddingTop: `${insetPadding}px`,
            paddingBottom: `${insetPadding}px`,
            paddingLeft: isPortrait
              ? `calc(${horizontalPadding} + ${insetPadding}px)`
              : `${insetPadding}px`,
            paddingRight: isPortrait
              ? `calc(${horizontalPadding} + ${insetPadding}px)`
              : `${insetPadding}px`,
          }}
        >
          <div
            className="relative w-full overflow-hidden"
            style={{
              paddingBottom: containerPadding,
            }}
          >
            {!noInsetPadding && containerClass && (
              <div
                className={`absolute inset-0 z-20 pointer-events-none ${containerClass}`}
              ></div>
            )}

            {/* Blurred thumbnail placeholder — fades out once full image is ready */}
            {!isVideo && thumbnailSrc && (isVisible || priority) && (
              <div
                className={`absolute inset-0 z-[5] pointer-events-none transition-opacity duration-500 ${
                  blurComplete ? "opacity-0" : "opacity-100"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumbnailSrc}
                  alt=""
                  className={`w-full h-full ${
                    noInsetPadding ? "object-cover" : "object-contain"
                  } object-center`}
                  style={
                    noInsetPadding
                      ? { filter: "blur(20px)", transform: "scale(1.5)" }
                      : undefined
                  }
                />
              </div>
            )}

            {/* Loading skeleton text overlay */}
            <ImageLoadingSkeleton visible={!blurComplete} />

            <div className="absolute inset-0 z-0">
              {(isVisible || priority) && (
                <>
                  {isVideo ? (
                    <video
                      src={fullSrc}
                      className={`w-full h-full object-cover object-center transition-opacity duration-500 ${
                        blurComplete ? "opacity-100" : "opacity-0"
                      } ${imgClassName || ""}`}
                      autoPlay
                      muted
                      loop
                      playsInline
                      onLoadedData={() => {
                        setBlurComplete(true);
                      }}
                    />
                  ) : (
                    <Image
                      src={fullSrc}
                      alt={alt}
                      fill
                      priority={priority}
                      className={`${noInsetPadding ? "object-cover" : "object-contain"} object-center transition-opacity duration-500 ${
                        blurComplete ? "opacity-100" : "opacity-0"
                      } ${imgClassName || ""}`}
                      sizes={sizes}
                      quality={quality}
                      {...(fullSrc?.endsWith(".webp")
                        ? { loader: webpLoader }
                        : {})}
                      onLoad={() => {
                        setBlurComplete(true);
                      }}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {caption && (
        <figcaption className="mt-2 text-sm text-muted-foreground text-left">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

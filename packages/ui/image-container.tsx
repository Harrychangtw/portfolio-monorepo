"use client";

import { useState, useRef } from "react";
import Image from "next/image";
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
  /** Skip responsive-variant thumbnail derivation (for images not in the optimization pipeline). */
  rawImage?: boolean;
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
  rawImage = false,
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

  // Derive thumbnail and full-resolution URLs for blur-up loading.
  let thumbnailSrc: string | undefined;
  let fullSrc = src;

  if (rawImage) {
    thumbnailSrc = undefined;
    fullSrc = src;
  } else if (isVideo) {
    thumbnailSrc = undefined;
    fullSrc = src;
  } else if (src?.endsWith("-thumb.webp")) {
    thumbnailSrc = src;
    fullSrc = src.replace("-thumb.webp", ".webp");
  } else if (src?.endsWith(".webp")) {
    thumbnailSrc = src.replace(".webp", "-thumb.webp");
    fullSrc = src;
  } else if (src) {
    thumbnailSrc = src;
    fullSrc = src;
  }

  // Calculate border thickness as 0.01 (1%) of container width
  // Min 1px, max 4px on mobile and 6px on desktop
  const minThickness = isMobile ? 1 : 1;
  const maxThickness = isMobile ? 4 : 6;
  const borderThickness = `clamp(${minThickness}px, 0.01 * 100%, ${maxThickness}px)`;

  // Responsive internal padding. Expressed in CSS rather than branching on
  // isMobile(), which is false during SSR and true after mount on phones —
  // every image on the page then changed height, shifting the layout.
  // clamp() lands on ~4px at phone widths and 7px on desktop, as before.
  const insetPadding = noInsetPadding ? "0px" : "clamp(4px, 0.55vw, 7px)";

  // Derive layout from aspect ratio (no dimension state needed)
  const isPortrait = aspectRatio < 1;
  const isCinematic = aspectRatio >= 2.2 && aspectRatio <= 2.4;
  const targetRatio = 1.5;

  let containerPadding;
  let containerClass = "";

  // Desktop-only width cap for portrait images, equivalent to the horizontal
  // padding this used to apply inline. Rendered as a CSS variable consumed by
  // a `md:` max-width class, so it costs nothing below the breakpoint.
  const restrictPortrait = isPortrait && restrictPortraitWidth;
  const portraitMaxWidth = `${(aspectRatio / targetRatio) * 100}%`;

  if (isPortrait) {
    // Portrait images span the full width on mobile and are narrowed to the
    // target ratio on desktop. That used to branch on isMobile(), which is
    // false during SSR: because the height below is a percentage of the
    // element's own width, narrowing it after mount also changed its height
    // and shifted the page. The restriction is now a max-width applied by a
    // media query (see portraitMaxWidth), so the server and the client agree
    // and only CSS decides.
    containerPadding = `${(1 / aspectRatio) * 100}%`;
    containerClass = `border-t-[${borderThickness}] border-b-[${borderThickness}] border-white`;
  } else if (isCinematic) {
    containerPadding = `${(1 / targetRatio) * 100}%`;
    containerClass = `border-l-[${borderThickness}] border-r-[${borderThickness}] border-white`;
  } else {
    containerPadding = `${(1 / aspectRatio) * 100}%`;
    containerClass = `border-l-[${borderThickness}] border-r-[${borderThickness}] border-white`;
  }

  return (
    <figure className="w-full not-prose" ref={containerRef}>
      <div className="w-full">
        <div
          className={`relative w-full ${noInsetPadding ? "" : "bg-white"} ${
            restrictPortrait ? "mx-auto md:max-w-[var(--portrait-max-w)]" : ""
          }`}
          style={
            {
              paddingTop: insetPadding,
              paddingBottom: insetPadding,
              paddingLeft: insetPadding,
              paddingRight: insetPadding,
              ...(restrictPortrait
                ? { "--portrait-max-w": portraitMaxWidth }
                : {}),
            } as React.CSSProperties
          }
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
            <ImageLoadingSkeleton
              visible={!blurComplete}
              backdropSrc={isVideo ? undefined : thumbnailSrc}
            />

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
                      // Priority images skip the cross-fade. An element at
                      // opacity 0 is not an LCP candidate, so fading the hero
                      // in only after its own onLoad pushed LCP out by the
                      // full decode time — on the very image LCP measures.
                      className={`${noInsetPadding ? "object-cover" : "object-contain"} object-center ${
                        priority
                          ? "opacity-100"
                          : `transition-opacity duration-500 ${
                              blurComplete ? "opacity-100" : "opacity-0"
                            }`
                      } ${imgClassName || ""}`}
                      sizes={sizes}
                      quality={quality}
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

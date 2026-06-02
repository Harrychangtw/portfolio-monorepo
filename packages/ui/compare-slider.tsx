"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { useIsMobile } from "@portfolio/lib/hooks/use-mobile";
import { ImageLoadingSkeleton } from "./image-loading-skeleton";
import { useIntersectionObserver } from "@portfolio/lib/hooks/use-intersection-observer";

interface CompareSliderProps {
  leftSrc: string;
  rightSrc: string;
  alt: string;
  aspectRatio?: number;
  noInsetPadding?: boolean;
  quality?: number;
}

export function CompareSlider({
  leftSrc,
  rightSrc,
  alt,
  aspectRatio: providedAspectRatio,
  noInsetPadding = false,
  quality = 80,
}: CompareSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver({
    elementRef: containerRef as React.RefObject<Element>,
    rootMargin: "50px",
  });

  const aspectRatio = providedAspectRatio ?? 1.5;
  const isMobile = useIsMobile();

  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [leftLoaded, setLeftLoaded] = useState(false);
  const [rightLoaded, setRightLoaded] = useState(false);
  const bothLoaded = leftLoaded && rightLoaded;

  const leftThumb = leftSrc.endsWith(".webp")
    ? leftSrc.replace(".webp", "-thumb.webp")
    : undefined;
  const rightThumb = rightSrc.endsWith(".webp")
    ? rightSrc.replace(".webp", "-thumb.webp")
    : undefined;

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setPosition(pct);
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      setIsDragging(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      updatePosition(e.clientX);
    },
    [updatePosition],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      updatePosition(e.clientX);
    },
    [isDragging, updatePosition],
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const insetPadding = noInsetPadding ? 0 : isMobile ? 4 : 7;
  const minThickness = 1;
  const maxThickness = isMobile ? 4 : 6;
  const borderThickness = `clamp(${minThickness}px, 0.01 * 100%, ${maxThickness}px)`;

  return (
    <figure className="w-full not-prose" ref={containerRef}>
      <div className="w-full">
        <div
          className={`relative w-full ${noInsetPadding ? "" : "bg-white"}`}
          style={{
            padding: `${insetPadding}px`,
          }}
        >
          <div
            className="relative w-full overflow-hidden select-none"
            style={{ paddingBottom: `${(1 / aspectRatio) * 100}%` }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            {!noInsetPadding && (
              <div
                className={`absolute inset-0 z-20 pointer-events-none border-l-[${borderThickness}] border-r-[${borderThickness}] border-white`}
              />
            )}

            <ImageLoadingSkeleton visible={!bothLoaded} />

            {/* Blurred thumbnails */}
            {leftThumb && isVisible && (
              <div
                className={`absolute inset-0 z-[5] pointer-events-none transition-opacity duration-500 ${bothLoaded ? "opacity-0" : "opacity-100"}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={leftThumb}
                  alt=""
                  className="w-full h-full object-cover object-center"
                  style={
                    noInsetPadding
                      ? { filter: "blur(20px)", transform: "scale(1.5)" }
                      : undefined
                  }
                />
              </div>
            )}

            {/* Right image (full, behind) */}
            <div className="absolute inset-0 z-0">
              {isVisible && (
                <Image
                  src={rightSrc}
                  alt={alt ? `${alt} (right)` : ""}
                  fill
                  className={`object-cover object-center transition-opacity duration-500 ${bothLoaded ? "opacity-100" : "opacity-0"}`}
                  sizes="100vw"
                  quality={quality}
                  onLoad={() => setRightLoaded(true)}
                />
              )}
            </div>

            {/* Left image (clipped) */}
            <div
              className="absolute inset-0 z-10"
              style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
            >
              {isVisible && (
                <Image
                  src={leftSrc}
                  alt={alt ? `${alt} (left)` : ""}
                  fill
                  className={`object-cover object-center transition-opacity duration-500 ${bothLoaded ? "opacity-100" : "opacity-0"}`}
                  sizes="100vw"
                  quality={quality}
                  onLoad={() => setLeftLoaded(true)}
                />
              )}
            </div>

            {/* Slider line + handle */}
            {bothLoaded && (
              <div
                className="absolute top-0 bottom-0 z-30 pointer-events-none"
                style={{ left: `${position}%`, transform: "translateX(-50%)" }}
              >
                <div
                  className="w-px h-full bg-white/80 mx-auto"
                  style={{ boxShadow: "0 0 4px rgba(0,0,0,0.4)" }}
                />
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 border border-white/50 flex items-center justify-center pointer-events-auto cursor-ew-resize"
                  style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M4.5 3L1.5 7L4.5 11"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9.5 3L12.5 7L9.5 11"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </figure>
  );
}

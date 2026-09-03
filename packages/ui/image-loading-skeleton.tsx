"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

const LOADING_STATUSES = [
  "Loading",
  "Developing",
  "Focusing",
  "Composing",
  "Adjusting",
  "Rendering",
  "Optimizing",
  "Finalizing",
  "Coloring",
  "Sharpening",
  "Cropping",
  "Scaling",
  "Encoding",
  "Filtering",
  "Blurring",
  "Saturating",
  "Balancing",
  "Brightening",
  "Darkening",
  "Contrasting",
  "Exporting",
  "Converting",
  "Compressing",
  "Denoising",
  "Grading",
  "Masking",
  "Layering",
  "Blending",
  "Merging",
  "Stitching",
  "Warping",
  "Distorting",
  "Inverting",
  "Posterizing",
  "Vignetting",
  "Calibrating",
  "Previewing",
  "Caching",
  "Buffering",
  "Streaming",
  "Transcoding",
  "Demuxing",
  "Muxing",
  "Stabilizing",
  "Tracking",
  "Keying",
  "Matting",
  "Compositing",
  "Sequencing",
];

/**
 * Average the centre of the backdrop thumbnail (where the label sits) and
 * return its perceived luminance on a 0–1 scale. Null when it can't be read.
 */
function sampleCenterLuminance(img: HTMLImageElement): number | null {
  const SIZE = 8;
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  // Crop the middle half of the thumbnail — the label never reaches the edges.
  const sw = img.naturalWidth / 2;
  const sh = img.naturalHeight / 2;
  if (!sw || !sh) return null;
  ctx.drawImage(img, sw / 2, sh / 2, sw, sh, 0, 0, SIZE, SIZE);

  try {
    const { data } = ctx.getImageData(0, 0, SIZE, SIZE);
    let total = 0;
    for (let i = 0; i < data.length; i += 4) {
      total += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    }
    return total / (data.length / 4) / 255;
  } catch {
    // Tainted canvas (cross-origin thumbnail) — fall back to blend mode.
    return null;
  }
}

export function ImageLoadingSkeleton({
  visible = true,
  backdropSrc,
}: {
  visible?: boolean;
  /** Thumbnail rendered behind the label; used to pick a legible text colour. */
  backdropSrc?: string;
}) {
  const [index, setIndex] = useState(0);
  const [isBrightBackdrop, setIsBrightBackdrop] = useState<boolean | null>(
    null,
  );

  useEffect(() => {
    setIsBrightBackdrop(null);
    if (!backdropSrc) return;

    let cancelled = false;
    // No crossOrigin: thumbnails are same-origin, and a CORS-mode request would
    // use a separate HTTP cache entry from the <img> already rendering it.
    const img = new window.Image();
    img.onload = () => {
      if (cancelled) return;
      const luminance = sampleCenterLuminance(img);
      if (luminance !== null) setIsBrightBackdrop(luminance > 0.55);
    };
    img.src = backdropSrc;
    return () => {
      cancelled = true;
    };
  }, [backdropSrc]);

  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setIndex((prev) => {
        // 3. Cheap randomness (prevents consecutive duplicates)
        let next;
        do {
          next = Math.floor(Math.random() * LOADING_STATUSES.length);
        } while (next === prev);
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [visible]);

  return (
    <div
      // 2. Define the container type for relative sizing
      style={{ containerType: "size" }}
      className={`absolute inset-0 bg-muted/10 flex items-center justify-center z-10 pointer-events-none transition-opacity duration-500 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="h-auto overflow-hidden flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.span
            key={index}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            // 1. Colour flips with backdrop brightness; mix-blend-difference is
            //    the fallback when the backdrop can't be sampled.
            // 2. text-[...] with cqmin for relative sizing
            className={`text-[clamp(8px,5cqmin,16px)] font-heading font-medium uppercase ${
              isBrightBackdrop === null
                ? "text-muted-foreground/80 mix-blend-difference"
                : isBrightBackdrop
                  ? "text-black/70"
                  : "text-white/80"
            }`}
            style={
              isBrightBackdrop === null
                ? undefined
                : {
                    textShadow: isBrightBackdrop
                      ? "0 0 6px rgba(255,255,255,0.5)"
                      : "0 0 6px rgba(0,0,0,0.5)",
                  }
            }
          >
            {LOADING_STATUSES[index]}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}

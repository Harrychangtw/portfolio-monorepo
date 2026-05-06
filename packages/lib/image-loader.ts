import type { ImageLoaderProps } from "next/image";
import { RESPONSIVE_WIDTHS } from "./image-pipeline/constants";

/**
 * Custom Next.js loader that maps `<name>.webp` to a pre-generated responsive
 * variant `<name>-<width>w.webp`. Bypasses Next's `/_next/image` optimizer
 * while still letting <Image> emit a proper srcSet.
 *
 * Variants are produced by @portfolio/lib/image-pipeline (apps' optimize-images
 * scripts). Constants are shared so the script and loader can never drift.
 */
export const webpLoader = ({ src, width }: ImageLoaderProps): string => {
  const target =
    RESPONSIVE_WIDTHS.find((w) => w >= width) ??
    RESPONSIVE_WIDTHS[RESPONSIVE_WIDTHS.length - 1];
  return src.replace(/\.webp$/, `-${target}w.webp`);
};

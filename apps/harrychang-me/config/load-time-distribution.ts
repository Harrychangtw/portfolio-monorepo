/**
 * Empirical-ish load-time distribution used by the page-transition overlay's
 * bottom curve. Each entry is a normalized density (0..1) for a fixed-width
 * time bucket. The active bucket is highlighted at runtime against the
 * current transition timer's elapsed value.
 *
 * Regenerate by running `node scripts/audit-load-times.mjs` after a
 * production build (`pnpm --filter harry-chang-portfolio build` then
 * `pnpm --filter harry-chang-portfolio start`) and replacing
 * LOAD_TIME_HISTOGRAM with its output.
 */
export const LOAD_TIME_BUCKET_MS = 200;

// 16 buckets × 200ms = 0..3200ms range. Right-skewed, peak near 900ms.
// Last bucket absorbs anything ≥ (length − 1) × bucket width.
export const LOAD_TIME_HISTOGRAM: readonly number[] = [
  0.035, 0.187, 0.525, 0.869, 1.0, 0.929, 0.702, 0.465,
  0.303, 0.202, 0.136, 0.091, 0.066, 0.045, 0.028, 0.018,
];

export function bucketIndexFor(ms: number): number {
  const i = Math.floor(ms / LOAD_TIME_BUCKET_MS);
  if (i < 0) return 0;
  if (i >= LOAD_TIME_HISTOGRAM.length) return LOAD_TIME_HISTOGRAM.length - 1;
  return i;
}

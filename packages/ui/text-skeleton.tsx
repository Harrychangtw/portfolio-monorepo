"use client";

/**
 * Shimmer placeholder for prose that is being refetched in another language.
 *
 * The post clients swap their markdown over the network when the language
 * changes. Without this they left the previous language's text on screen for
 * the whole round trip and then hard-swapped it, which read as the page
 * hanging. Showing the same shimmer the card grids already use makes the wait
 * legible and matches the site's existing loading vocabulary.
 *
 * Built from block-display spans rather than divs so it stays valid markup
 * inside the `<h1>` and `<p>` it stands in for.
 */

/** Repeating width pattern, in percent, for the full-width lines. */
const LINE_WIDTHS = [100, 96, 99, 94, 98, 92, 97, 95];

function SkeletonLine({ width }: { width: number }) {
  return (
    <span
      className="relative block h-[0.9em] overflow-hidden rounded-[3px] bg-muted"
      style={{ width: `${width}%` }}
    >
      <span className="animate-shimmer absolute inset-0 block -translate-x-full bg-gradient-to-r from-transparent via-background/40 to-transparent" />
    </span>
  );
}

export default function TextSkeleton({
  paragraphs = 3,
  linesPerParagraph = 4,
  className = "",
}: {
  paragraphs?: number;
  linesPerParagraph?: number;
  className?: string;
}) {
  return (
    <span
      className={`block animate-fade-in ${className}`}
      // Decorative: the real text is announced when it arrives, and a screen
      // reader walking a wall of empty nodes mid-switch helps nobody.
      aria-hidden="true"
    >
      {[...Array(paragraphs)].map((_, p) => (
        <span key={p} className="block [&:not(:last-child)]:mb-[1.2em]">
          {[...Array(linesPerParagraph)].map((_, l) => {
            const isLast = l === linesPerParagraph - 1;
            return (
              <span key={l} className="block [&:not(:last-child)]:mb-[0.6em]">
                <SkeletonLine
                  // Short final line, so each block ends the way a paragraph
                  // does rather than squaring off like a bar chart.
                  width={
                    isLast
                      ? 45 + ((p * 7) % 20)
                      : LINE_WIDTHS[(p * 3 + l) % LINE_WIDTHS.length]
                  }
                />
              </span>
            );
          })}
        </span>
      ))}
    </span>
  );
}

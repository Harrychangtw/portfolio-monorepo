"use client";

import { useEffect, useState, useRef } from "react";
import BlogCard from "@portfolio/ui/blog-card";
import { PostMetadata } from "@portfolio/lib/lib/markdown";
import { useIntersectionObserver } from "@portfolio/lib/hooks/use-intersection-observer";
import {
  useLanguage,
  type Language,
} from "@portfolio/lib/contexts/language-context";
import NavigationLink from "@portfolio/ui/navigation-link";
import { track, events } from "@portfolio/lib/analytics";
import { motion } from "motion/react";

interface BlogSectionProps {
  section?: string;
  title?: string;
  sectionId?: string;
  initialItems?: PostMetadata[];
  limit?: number;
  showSeeAll?: boolean;
}

export default function BlogSection({
  section,
  title,
  sectionId = "blog",
  initialItems = [],
  limit,
  showSeeAll = false,
}: BlogSectionProps = {}) {
  const { language, initialLanguage, t } = useLanguage();
  // initialItems is markdown the server loaded in `initialLanguage` — the
  // language resolved from the request cookie, not always English. When the
  // visitor is reading that language there is nothing to fetch and nothing to
  // skeleton; the cards are already correct in the server HTML.
  const [fetchedPosts, setFetchedPosts] = useState<PostMetadata[]>([]);
  // Which language `fetchedPosts` holds, or null before any fetch lands.
  const [fetchedLanguage, setFetchedLanguage] = useState<Language | null>(null);
  const [forceLoad, setForceLoad] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const serverItemsUsable =
    language === initialLanguage && initialItems.length > 0;
  const posts = serverItemsUsable ? initialItems : fetchedPosts;
  // Derived rather than stored: the grid shows skeletons on the very render
  // the language changes, instead of leaving the previous language's cards on
  // screen until the fetch resolves. Switching back to the server's language
  // resolves to `false` immediately, so that direction never flashes at all.
  const isLoading = !serverItemsUsable && fetchedLanguage !== language;

  // Load immediately if hash points to blog
  const shouldLoadImmediately =
    typeof window !== "undefined" && window.location.hash === "#blog";

  const isVisible = useIntersectionObserver({
    elementRef: sectionRef as React.RefObject<Element>,
    rootMargin: "100px",
  });

  useEffect(() => {
    const onForce = (e: Event) => {
      const ce = e as CustomEvent<string>;
      if (ce.detail === "blog") setForceLoad(true);
    };
    window.addEventListener("force-load-section", onForce as EventListener);
    return () =>
      window.removeEventListener(
        "force-load-section",
        onForce as EventListener,
      );
  }, []);

  useEffect(() => {
    // Server data already matches, or this language is already fetched.
    if (serverItemsUsable || fetchedLanguage === language) {
      return;
    }

    // A quick en→zh→en toggle can land responses out of order; a superseded
    // one must not overwrite the language the user settled on.
    let cancelled = false;

    async function fetchPosts() {
      try {
        const response = await fetch(`/api/posts?locale=${language}`);
        const data = await response.json();
        if (cancelled) return;
        setFetchedPosts(data);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        // Marked as loaded even on failure, so a dropped locale request
        // leaves an empty grid rather than a grid shimmering forever.
        if (!cancelled) setFetchedLanguage(language);
      }
    }

    if (shouldLoadImmediately || isVisible || forceLoad) {
      fetchPosts();
    }

    return () => {
      cancelled = true;
    };
  }, [
    isVisible,
    language,
    shouldLoadImmediately,
    forceLoad,
    serverItemsUsable,
    fetchedLanguage,
  ]);

  const displayedPosts = limit ? posts.slice(0, limit) : posts;

  return (
    <section
      ref={sectionRef}
      id={sectionId}
      className="py-12 md:py-16 border-b border-border"
    >
      <div className="container">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-heading text-lg uppercase tracking-wider text-secondary">
            {title || t("blog.title")}
          </h2>
          {showSeeAll && (
            <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
              <NavigationLink
                href={`/blog`}
                className="group flex items-center gap-2"
                onClick={() =>
                  track(events.SEE_ALL_CLICKED, { section: "blog" })
                }
              >
                <span className="font-body text-sg text-secondary group-hover:text-accent transition-colors">
                  {t("blog.seeAll")}
                </span>
                <span className="font-heading text-xl text-secondary group-hover:text-accent transition-colors">
                  →
                </span>
              </NavigationLink>
            </motion.div>
          )}
        </div>

        {/* Reserve space to prevent layout shift - Matches loading state of BlogPageClient */}
        <div
          className={`grid grid-cols-1 md:grid-cols-3 gap-[var(--column-spacing)] ${isLoading ? "min-h-[2400px] md:min-h-[800px]" : ""}`}
          style={{ transition: "min-height 0.3s ease-out" }}
        >
          {isLoading
            ? // Placeholder cards matching BlogCard structure
              [...Array(limit || 6)].map((_, i) => (
                <div key={i} className="group relative flex flex-col">
                  <div className="pb-3">
                    <div className="h-6 w-3/4 bg-muted animate-pulse rounded-md mb-2"></div>
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-12 bg-muted animate-pulse rounded-md"></div>
                      <div className="h-10 w-16 bg-muted animate-pulse rounded-md"></div>
                    </div>
                  </div>
                  <div className="relative overflow-hidden bg-muted">
                    <div className="relative w-full aspect-[3/2]">
                      <div className="absolute inset-0 bg-muted animate-pulse">
                        <div className="animate-shimmer absolute inset-0 -translate-x-full bg-gradient-to-r from-muted via-muted/50 to-muted" />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            : displayedPosts.map((post, index) => (
                <BlogCard
                  key={post.slug}
                  title={post.title}
                  date={post.date}
                  slug={post.slug}
                  tags={post.tags}
                  imageUrl={post.imageUrl}
                  priority={index < 3}
                  index={index}
                  locked={post.locked}
                />
              ))}
        </div>
      </div>
    </section>
  );
}

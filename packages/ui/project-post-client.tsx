"use client";

import { useEffect, useLayoutEffect, useState } from "react";

import parse, { Element } from "html-react-parser";
import dynamic from "next/dynamic";
import {
  useLanguage,
  type Language,
} from "@portfolio/lib/contexts/language-context";
import TextSkeleton from "@portfolio/ui/text-skeleton";

const LanguageSwitcher = dynamic(
  () => import("@portfolio/ui/language-switcher"),
  { ssr: false },
);
const ThemeSwitcher = dynamic(() => import("@portfolio/ui/theme-switcher"), {
  ssr: false,
});
import { ImageContainer } from "@portfolio/ui/image-container";
import { CompareSlider } from "@portfolio/ui/compare-slider";
import type { ProjectMetadata } from "@portfolio/lib/lib/markdown";
import NextUpCard from "@portfolio/ui/next-up-card";
import NavigationLink from "@portfolio/ui/navigation-link";
import { TableOfContents } from "@portfolio/ui/table-of-contents";

interface ProjectPostClientProps {
  initialProject: ProjectMetadata & { contentHtml: string };
  nextProject?: {
    slug: string;
    title: string;
    category: string;
    imageUrl: string;
    aspectRatio?: number;
  } | null;
  localGraphSlot?: React.ReactNode;
}

export default function ProjectPostClient({
  initialProject,
  nextProject,
  localGraphSlot,
}: ProjectPostClientProps) {
  const { language, initialLanguage, t } = useLanguage();
  const [project, setProject] = useState(initialProject);
  // The language the loaded content is the right answer for. The page
  // server-renders the visitor's language, so on load this already matches
  // and nothing refetches; it only diverges when they hit the switcher.
  const [resolvedLanguage, setResolvedLanguage] =
    useState<Language>(initialLanguage);
  const baseSlug = project.slug.replace(/_zh-tw$/i, "");
  const targetSlug = language === "zh-TW" ? `${baseSlug}_zh-tw` : baseSlug;
  // Derived, so the skeleton appears on the very render the language changes
  // rather than a frame later via an effect. The slug comparison is the
  // effect's own fetch condition, so the skeleton shows exactly when there is
  // a round trip to wait for — switching back to a post that has no
  // translation, and so never left its base slug, doesn't blink.
  const isSwitchingLanguage =
    resolvedLanguage !== language && targetSlug !== project.slug;
  const [nextProjectData, setNextProjectData] = useState(nextProject);

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
  }, [initialProject.slug]);

  // Fetch localized version of the Next Up project
  useEffect(() => {
    async function fetchLocalizedNextProject() {
      if (!nextProject) return;

      const baseSlug = nextProject.slug.replace("_zh-tw", "");
      let targetSlug = baseSlug;

      if (language === "zh-TW") {
        targetSlug = `${baseSlug}_zh-tw`;
      }

      // If the current nextProjectData slug matches target, we are good (optimistic check)
      // but to be safe against switching back and forth, we check against the current state
      if (nextProjectData && nextProjectData.slug === targetSlug) return;

      try {
        const response = await fetch(`/api/projects/${targetSlug}`);
        if (response.ok) {
          const data = await response.json();
          setNextProjectData({
            slug: data.slug,
            title: data.title,
            category: data.category,
            imageUrl: data.imageUrl,
            aspectRatio: nextProject.aspectRatio, // Projects always 1.5
          });
        } else {
          // Fallback to base if localized version missing
          if (language === "zh-TW" && targetSlug.includes("_zh-tw")) {
            const fallbackResponse = await fetch(`/api/projects/${baseSlug}`);
            if (fallbackResponse.ok) {
              const data = await fallbackResponse.json();
              setNextProjectData({
                slug: data.slug,
                title: data.title,
                category: data.category,
                imageUrl: data.imageUrl,
                aspectRatio: nextProject.aspectRatio,
              });
            }
          }
        }
      } catch (error) {
        console.error("Error fetching localized next project:", error);
      }
    }

    fetchLocalizedNextProject();
  }, [language, nextProject]); // Depend on language and the initial prop

  useEffect(() => {
    // The server already rendered this language; nothing to do until the
    // visitor actually switches.
    if (resolvedLanguage === language) return;

    // A quick en→zh→en toggle can land responses out of order; a superseded
    // one must not overwrite the language the user settled on.
    let cancelled = false;

    async function fetchLocalizedProject() {
      try {
        // Only fetch if we need a different version than what we currently have
        if (targetSlug !== project.slug) {
          const response = await fetch(`/api/projects/${targetSlug}`);
          if (cancelled) return;

          if (response.ok) {
            setProject(await response.json());
          } else if (language === "zh-TW") {
            // No translation for this one — fall back to the base version.
            const fallbackResponse = await fetch(`/api/projects/${baseSlug}`);
            if (cancelled) return;
            if (fallbackResponse.ok) {
              setProject(await fallbackResponse.json());
            }
          }
        }
      } catch (error) {
        console.error("Error fetching localized version:", error);
        // Keep the current content on error
      } finally {
        // Cleared even on failure or when no translation exists, so neither
        // case leaves the article shimmering forever.
        if (!cancelled) setResolvedLanguage(language);
      }
    }

    fetchLocalizedProject();

    return () => {
      cancelled = true;
    };
  }, [language, resolvedLanguage, project.slug, baseSlug, targetSlug]);

  return (
    <div className="page-transition-enter">
      <div className="pb-12">
        <div className="container">
          {/* Hero image section - Enforcing strict 3:2 (1.5) aspect ratio */}
          <div className="relative w-full mb-8">
            <ImageContainer
              src={project.imageUrl}
              alt={project.title}
              priority={true}
              quality={95}
              noInsetPadding={true}
              aspectRatio={1.5}
            />
          </div>
        </div>

        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12">
            {/* Left column */}
            <div className="md:col-span-4 mb-10 md:mb-0">
              <div className="md:sticky md:top-24 md:h-[calc(100vh-8rem)] md:flex md:flex-col md:justify-between">
                <div>
                  {/* Mobile: Flex row for Nav + Switchers. Desktop: Block */}
                  <div className="flex items-center justify-between md:block">
                    <NavigationLink
                      href="/#projects"
                      className="inline-flex items-center text-secondary hover:text-accent transition-colors"
                    >
                      <span className="mr-2 font-heading">←</span>
                      <span className="font-heading">
                        {t("projects.backToProjects")}
                      </span>
                    </NavigationLink>

                    {/* Mobile-only Switchers in Nav Row */}
                    <div className="flex md:hidden items-center gap-4">
                      <LanguageSwitcher />
                    </div>
                  </div>
                  <div className="mt-8">
                    <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4 md:mb-8 text-primary">
                      {isSwitchingLanguage ? (
                        <TextSkeleton paragraphs={1} linesPerParagraph={1} />
                      ) : (
                        project.title
                      )}
                    </h1>
                    <p className="font-body text-secondary uppercase text-sm mb-6 md:mb-12">
                      {project.category}
                    </p>
                  </div>
                </div>

                <div className="hidden md:block pb-8 pt-8 border-t border-border">
                  <TableOfContents contentHtml={project.contentHtml} />
                  <div className="flex items-center gap-6 mt-8">
                    <LanguageSwitcher />
                    <ThemeSwitcher />
                  </div>
                </div>
              </div>
            </div>

            {/* Right column - aligned with title */}
            <div className="md:col-span-8">
              <div className="md:mt-14">
                {/* Description area */}
                <div className="mb-16 md:mb-24">
                  <p className="font-body text-lg md:text-xl mb-10 md:mb-16 text-primary">
                    {isSwitchingLanguage ? (
                      <TextSkeleton paragraphs={1} linesPerParagraph={2} />
                    ) : (
                      project.description
                    )}
                  </p>

                  {/* Additional attributes in a grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-8 md:gap-x-4 mb-16 md:mb-24 text-secondary">
                    {project.year && (
                      <div>
                        <p className="font-heading uppercase text-xs mb-1 text-secondary">
                          {t("projects.year")}
                        </p>
                        <p className="font-body text-secondary">
                          {project.year}
                        </p>
                      </div>
                    )}
                    {project.role && (
                      <div>
                        <p className="font-heading uppercase text-xs mb-1 text-secondary">
                          {t("projects.role")}
                        </p>
                        <p className="font-body text-secondary">
                          {project.role}
                        </p>
                      </div>
                    )}
                    {project.technologies &&
                      project.technologies.length > 0 && (
                        <div>
                          <p className="font-heading uppercase text-xs mb-1 text-secondary">
                            {t("projects.technologies")}
                          </p>
                          <p className="font-body text-secondary">
                            {project.technologies.join(", ")}
                          </p>
                        </div>
                      )}
                    {project.client && (
                      <div>
                        <p className="font-heading uppercase text-xs mb-1 text-secondary">
                          {t("projects.client")}
                        </p>
                        <p className="font-body text-secondary">
                          {project.client}
                        </p>
                      </div>
                    )}
                    {project.website && (
                      <div>
                        <p className="font-heading uppercase text-xs mb-1 text-secondary">
                          {t("projects.website")}
                        </p>
                        <p className="font-body text-secondary">
                          <a
                            href={project.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline hover:text-primary transition-colors"
                          >
                            {project.website.replace(/^https?:\/\//, "")}
                          </a>
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Main content */}
                <div className="prose prose-lg max-w-none dark:prose-invert mb-16 md:mb-24">
                  {isSwitchingLanguage ? (
                    <TextSkeleton paragraphs={5} />
                  ) : (
                    parse(project.contentHtml, {
                      replace: (domNode) => {
                        if (
                          domNode instanceof Element &&
                          domNode.attribs &&
                          domNode.attribs.class ===
                            "markdown-compare-placeholder"
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
                                aspectRatio
                                  ? parseFloat(aspectRatio)
                                  : undefined
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
                                aspectRatio
                                  ? parseFloat(aspectRatio)
                                  : undefined
                              }
                              noInsetPadding={framed !== "true"}
                              quality={95}
                            />
                          );
                        }
                      },
                    })
                  )}
                </div>
                {/* Local Graph + Next Up Card (coupled) */}
                {localGraphSlot}

                {/* Standalone Next Up Card (fallback when no graph) */}
                {!localGraphSlot && nextProjectData && (
                  <NextUpCard
                    title={nextProjectData.title}
                    category={nextProjectData.category}
                    slug={nextProjectData.slug}
                    imageUrl={nextProjectData.imageUrl}
                    basePath="projects"
                    aspectRatio={nextProjectData.aspectRatio}
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

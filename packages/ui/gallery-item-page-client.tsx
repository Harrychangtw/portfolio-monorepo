"use client"

import { useEffect, useState } from 'react'
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useLanguage } from '@portfolio/lib/contexts/LanguageContext'
import { GalleryImageContainer } from "@portfolio/ui/gallery-image-container"
import NextUpCard from "@portfolio/ui/next-up-card"
import type { GalleryItemMetadata } from '@portfolio/lib/lib/markdown'

interface GalleryItemPageClientProps {
  initialItem: GalleryItemMetadata & { contentHtml: string }
  nextItem?: { slug: string; title: string; category: string; imageUrl: string } | null
}

export default function GalleryItemPageClient({ initialItem, nextItem }: GalleryItemPageClientProps) {
  const { language, t } = useLanguage()
  const [item, setItem] = useState(initialItem)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchLocalizedItem() {
      const baseSlug = item.slug.replace('_zh-tw', '')
      let targetSlug = baseSlug

      if (language === 'zh-TW') {
        targetSlug = `${baseSlug}_zh-tw`
      }

      // Only fetch if we need a different version than what we currently have
      if (targetSlug !== item.slug) {
        try {
          setLoading(true)
          const response = await fetch(`/api/gallery/${targetSlug}`)
          if (response.ok) {
            const itemData = await response.json()
            setItem(itemData)
          } else {
            // If the target version doesn't exist, fall back to base version
            if (language === 'zh-TW' && targetSlug.includes('_zh-tw')) {
              const fallbackResponse = await fetch(`/api/gallery/${baseSlug}`)
              if (fallbackResponse.ok) {
                const fallbackData = await fallbackResponse.json()
                setItem(fallbackData)
              }
            }
          }
        } catch (error) {
          console.error('Error fetching localized version:', error)
          // Keep the current item on error
        } finally {
          setLoading(false)
        }
      }
    }

    fetchLocalizedItem()
  }, [language, item.slug])

  if (loading) {
    return (
      <div className="page-transition-enter">
        <div className="min-h-screen">
          <div className="container">
            <div className="animate-pulse">
              <div className="bg-gray-300 aspect-[4/5] rounded mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12">
                <div className="md:col-span-4">
                  <div className="h-4 bg-gray-300 rounded mb-4"></div>
                  <div className="h-8 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
                <div className="md:col-span-8">
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Extract the full image URL (not thumbnail) for the main hero image
  const fullImageUrl = item.imageUrl?.replace('-thumb.webp', '.webp') || '/placeholder.svg';

  // Check if description exists to adjust layout
  const hasDescription = item.description && item.description.trim() !== '';

  return (
    <div className="page-transition-enter">
      <div className="pb-12">
        <div className="container">
          <div className="relative w-full mb-8">
            <GalleryImageContainer
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
                  <Link
                    href="/#gallery"
                    className="inline-flex items-center text-secondary hover:text-primary transition-colors font-body"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t('gallery.backToGallery')}
                  </Link>
                  <div className="mt-8">
                    <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4 md:mb-8 text-primary">{item.title}</h1>
                    <p className="text-secondary mb-6 md:mb-12 font-body">
                      {new Date(item.date).toLocaleDateString(language === 'zh-TW' ? "zh-TW" : "en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column - aligned with title */}
            <div className="md:col-span-8">
              <div className="md:mt-14">
                {/* Description area and attributes */}
                <div className="mb-16 md:mb-24">
                  {hasDescription && (
                    <p className="text-lg md:text-xl mb-10 md:mb-16 font-body text-primary">{item.description}</p>
                  )}

                  {/* Additional attributes in a grid */}
                  <div className={`grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8 md:gap-x-12 ${
                    hasDescription ? 'mb-16 md:mb-24' : 'mt-0'
                  } text-secondary`}>
                    {item.camera && (
                      <div>
                        <p className="uppercase text-xs mb-1 font-heading text-secondary">{t('gallery.camera')}</p>
                        <p className="font-body text-secondary">{item.camera}</p>
                      </div>
                    )}
                    {item.lens && (
                      <div>
                        <p className="uppercase text-xs mb-1 font-heading text-secondary">{t('gallery.lens')}</p>
                        <p className="font-body text-secondary">{item.lens}</p>
                      </div>
                    )}
                    {item.location && (
                      <div>
                        <p className="uppercase text-xs mb-1 font-heading text-secondary">{t('gallery.location')}</p>
                        <p className="font-body text-secondary">{item.location}</p>
                      </div>
                    )}
                    {item.tags && item.tags.length > 0 && (
                      <div>
                        <p className="uppercase text-xs mb-1 font-heading text-secondary">{t('gallery.tags')}</p>
                        <p className="font-body text-secondary">{item.tags.join(", ")}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Main content */}
                <div
                  className="prose prose-lg max-w-none dark:prose-invert mb-16 md:mb-24"
                  dangerouslySetInnerHTML={{ __html: item.contentHtml }}
                />

                {/* Gallery grid with consistent spacing */}
                {item.gallery && item.gallery.length > 0 && (
                  <div className="flex flex-col">
                    {item.gallery.map((image, index) => {
                      const fullUrl = image.url.replace('-thumb.webp', '.webp');
                      const aspectRatio = image.aspectRatio ||
                        (image.width && image.height ? image.width / image.height : undefined);

                      return (
                        <div
                          key={index}
                          className="w-full"
                          style={{
                            marginBottom: 'clamp(1rem, 2.5vw, 2rem)'
                          }}
                        >
                          <GalleryImageContainer
                            src={fullUrl}
                            alt={image.caption || `${item.title} image ${index + 1}`}
                            caption={image.caption}
                            priority={index === 0}
                            quality={90}
                            aspectRatio={aspectRatio}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Next Up Card */}
                {nextItem && (
                  <NextUpCard
                    title={nextItem.title}
                    category={nextItem.category}
                    slug={nextItem.slug}
                    imageUrl={nextItem.imageUrl}
                    basePath="gallery"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
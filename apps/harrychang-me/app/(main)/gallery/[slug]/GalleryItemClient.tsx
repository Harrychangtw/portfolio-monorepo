"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { GalleryImageContainer } from "@portfolio/ui/gallery-image-container"
import type { GalleryItemMetadata } from "@portfolio/lib/lib/markdown"
import { useLanguage } from '@portfolio/lib/contexts//LanguageContext'

interface GalleryItemClientProps {
  item: GalleryItemMetadata & { contentHtml: string }
}

export default function GalleryItemClient({ item }: GalleryItemClientProps) {
  const { language, t } = useLanguage()
  
  // Extract the full image URL (not thumbnail) for the main hero image
  const fullImageUrl = item.imageUrl?.replace('-thumb.webp', '.webp') || '/placeholder.svg';

  // Check if description exists to adjust layout
  const hasDescription = item.description && item.description.trim() !== '';

  return (
    <div className="page-transition-enter">
      <div className="min-h-screen">
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
            {/* Left column - full width on mobile, now 4/12 (1/3) on desktop */}
            <div className="md:col-span-4 mb-10 md:mb-0">
              <div className="md:sticky md:top-24">
                <div className="relative">
                  <Link
                    href="/#gallery"
                    className="inline-flex items-center text-secondary hover:text-primary transition-colors"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t('gallery.backToGallery')}
                  </Link>
                  <div className="mt-8">
                    <h1 className="font-space-grotesk text-3xl md:text-4xl font-bold mb-4 md:mb-8">{item.title}</h1>
                    <p className="text-secondary mb-6 md:mb-12">
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
                {/* Description area and attributes - restructured to handle missing description */}
                <div className="mb-16 md:mb-24">
                  {hasDescription && (
                    <p className="text-lg md:text-xl mb-10 md:mb-16">{item.description}</p>
                  )}
                  
                  {/* Additional attributes in a grid - adjusted margins when no description */}
                  <div className={`grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8 md:gap-x-12 ${
                    hasDescription ? 'mb-16 md:mb-24' : 'mt-0'
                  } text-secondary`}>
                    {item.camera && (
                      <div>
                        <p className="uppercase text-xs mb-1">{t('gallery.camera')}</p>
                        <p>{item.camera}</p>
                      </div>
                    )}
                    {item.lens && (
                      <div>
                        <p className="uppercase text-xs mb-1">{t('gallery.lens')}</p>
                        <p>{item.lens}</p>
                      </div>
                    )}
                    {item.location && (
                      <div>
                        <p className="uppercase text-xs mb-1">{t('gallery.location')}</p>
                        <p>{item.location}</p>
                      </div>
                    )}
                    {item.tags && item.tags.length > 0 && (
                      <div>
                        <p className="uppercase text-xs mb-1">{t('gallery.tags')}</p>
                        <p>{item.tags.join(", ")}</p>
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
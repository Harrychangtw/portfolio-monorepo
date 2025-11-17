"use client"

import { useLanguage } from '@portfolio/lib/contexts//LanguageContext'
import { GalleryImageContainer } from '@portfolio/ui/gallery-image-container'
import { useIsMobile } from '@portfolio/lib/hooks//use-mobile'

export default function UsesPage() {
  const { t, getTranslationData } = useLanguage()
  const isMobile = useIsMobile()

  const hardware = getTranslationData('hardware', 'uses')
  const software = getTranslationData('software', 'uses')
  
  // The GalleryImageContainer adds horizontal padding to portrait images on desktop 
  // to fit a 1.5 target aspect ratio. This creates unwanted space.
  // This style object calculates the necessary width and negative margin 
  // to counteract the internal padding, making the image fill its column.
  const desktopImageWrapperStyle = {
    width: '187.5%',
    marginLeft: '-43.75%',
  };
  
  const images = [
    { src: "/images/optimized/projects/uses/vertical_left.webp", alt: "Workspace left view" },
    { src: "/images/optimized/projects/uses/vertical_center.webp", alt: "Workspace center view" },
    { src: "/images/optimized/projects/uses/vertical_right.webp", alt: "Workspace right view" },
  ];

  return (
    <div className="min-h-screen py-12 md:py-16">
      <div className="container">
        <div className="space-y-12">
          
          {/* Hero Images Section */}
          <div className="w-full -mt-4 mb-8">
            {isMobile ? (
              // Mobile: Show only the center image, full width
              <GalleryImageContainer
                src={images[1].src}
                alt={images[1].alt}
                aspectRatio={0.8}
                noInsetPadding={true}
                priority
              />
            ) : (
              // Desktop: Show all three images in a grid
              <div className="grid grid-cols-3 gap-[var(--column-spacing)]">
                {images.map((image) => (
                  // This outer div clips the oversized child to prevent layout disruption
                  <div key={image.src} className="overflow-hidden">
                    <div style={desktopImageWrapperStyle}>
                      <GalleryImageContainer
                        src={image.src}
                        alt={image.alt}
                        aspectRatio={0.8}
                        noInsetPadding={true}
                        priority
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Core Workstation */}
          <div>
            <h3 className="font-space-grotesk text-lg uppercase tracking-wider text-secondary mb-4">
              {t('hardware.coreWorkstation.title', 'uses')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-0 gap-y-3">
              {(hardware?.coreWorkstation?.items || []).map((item: any, index: number) => (
                <div key={index} className="flex pr-6">
                  <span className="font-ibm-plex text-secondary min-w-[160px]">
                    {item.name}:
                  </span>
                  <span className="font-ibm-plex text-primary">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Office & Ergonomics */}
          <div>
            <h3 className="font-space-grotesk text-lg uppercase tracking-wider text-secondary mb-4">
              {t('hardware.office.title', 'uses')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-0 gap-y-3">
              {(hardware?.office?.items || []).map((item: any, index: number) => (
                <div key={index} className="flex pr-6">
                  <span className="font-ibm-plex text-secondary min-w-[160px]">
                    {item.name}:
                  </span>
                  <span className="font-ibm-plex text-primary">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Home Server */}
          <div>
            <h3 className="font-space-grotesk text-lg uppercase tracking-wider text-secondary mb-4">
              {t('hardware.homeServer.title', 'uses')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-0 gap-y-3">
              {(hardware?.homeServer?.items || []).map((item: any, index: number) => (
                <div key={index} className="flex pr-6">
                  <span className="font-ibm-plex text-secondary min-w-[160px]">
                    {item.name}:
                  </span>
                  <span className="font-ibm-plex text-primary">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Photography Gear */}
          <div>
            <h3 className="font-space-grotesk text-lg uppercase tracking-wider text-secondary mb-4">
              {t('hardware.photography.title', 'uses')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-0 gap-y-3">
              {/* Left Column - Cameras and Accessories */}
              <div className="space-y-3 pr-6">
                {/* Cameras */}
                {hardware?.photography?.items?.find((item: any) => item.key === 'cameras')?.list?.map((camera: string, i: number) => (
                  <div key={`camera-${i}`} className="flex">
                    <span className="font-ibm-plex text-secondary min-w-[160px]">
                      {i === 0 ? hardware?.photography?.items?.find((item: any) => item.key === 'cameras')?.name + ':' : ''}
                    </span>
                    <span className="font-ibm-plex text-primary">
                      {camera}
                    </span>
                  </div>
                ))}
                
                {/* Accessories (Stabilizer and Tripod) */}
                {hardware?.photography?.items?.filter((item: any) => 
                  item.key === 'stabilizer' || item.key === 'tripod'
                ).map((item: any, index: number) => (
                  <div key={`acc-${index}`} className="flex">
                    <span className="font-ibm-plex text-secondary min-w-[160px]">
                      {index === 0 ? t('hardware.photography.accessories', 'uses') + ':' : ''}
                    </span>
                    <span className="font-ibm-plex text-primary">
                      {item.list?.[0]}
                    </span>
                  </div>
                ))}
              </div>
              
              {/* Right Column - Lenses */}
              <div className="space-y-3 pr-6">
                {hardware?.photography?.items?.find((item: any) => item.key === 'lenses')?.list?.map((lens: string, i: number) => (
                  <div key={`lens-${i}`} className="flex">
                    <span className="font-ibm-plex text-secondary min-w-[160px]">
                      {i === 0 ? hardware?.photography?.items?.find((item: any) => item.key === 'lenses')?.name + ':' : ''}
                    </span>
                    <span className="font-ibm-plex text-primary">
                      {lens}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Development & Coding */}
          <div>
            <h3 className="font-space-grotesk text-lg uppercase tracking-wider text-secondary mb-4">
              {t('software.development.title', 'uses')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-0 gap-y-3">
              {(software?.development?.items || []).map((item: any, index: number) => (
                <div key={index} className="flex pr-6">
                  <span className="font-ibm-plex text-secondary min-w-[160px]">
                    {item.name}:
                  </span>
                  <span className="font-ibm-plex text-primary">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Design & Creative */}
          <div>
            <h3 className="font-space-grotesk text-lg uppercase tracking-wider text-secondary mb-4">
              {t('software.design.title', 'uses')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-0 gap-y-3">
              {(software?.design?.items || []).map((item: any, index: number) => (
                <div key={index} className="flex pr-6">
                  <span className="font-ibm-plex text-secondary min-w-[160px]">
                    {item.name}:
                  </span>
                  <span className="font-ibm-plex text-primary">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Productivity & Utilities */}
          <div>
            <h3 className="font-space-grotesk text-lg uppercase tracking-wider text-secondary mb-4">
              {t('software.productivity.title', 'uses')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-0 gap-y-3">
              {(software?.productivity?.items || []).map((item: any, index: number) => (
                <div key={index} className="flex pr-6">
                  <span className="font-ibm-plex text-secondary min-w-[160px]">
                    {item.name}:
                  </span>
                  <span className="font-ibm-plex text-primary">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

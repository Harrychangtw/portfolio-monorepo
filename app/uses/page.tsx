"use client"

import { useLanguage } from '@/contexts/LanguageContext'

export default function UsesPage() {
  const { t, getTranslationData } = useLanguage()

  const hardware = getTranslationData('hardware', 'uses')
  const software = getTranslationData('software', 'uses')

  return (
    <div className="min-h-screen py-12 md:py-16">
      <div className="container">
        <div className="space-y-12">
          
          {/* Core Workstation */}
          <div>
            <h3 className="font-space-grotesk text-lg uppercase tracking-wider text-secondary mb-4">
              {t('hardware.coreWorkstation.title', 'uses')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-0 gap-y-3">
              {(hardware?.coreWorkstation?.items || []).map((item: any, index: number) => (
                <div key={index} className="flex">
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
                <div key={index} className="flex">
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
                <div key={index} className="flex">
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
              <div className="space-y-3">
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
              <div className="space-y-3">
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
                <div key={index} className="flex">
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
                <div key={index} className="flex">
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
                <div key={index} className="flex">
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

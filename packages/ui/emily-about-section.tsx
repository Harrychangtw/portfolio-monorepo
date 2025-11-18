"use client"

import Lanyard from './Lanyard'

// Reusable component for section titles
const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="font-heading italic text-base font-bold uppercase tracking-widest text-secondary mb-4">
    {children}
  </h2>
)

// Reusable component for info entries
const InfoEntry = ({ primary, secondary }: { primary: string; secondary: string }) => (
  <div>
    <p className="font-body text-secondary">{primary}</p>
    <p className="font-body text-primary">{secondary}</p>
  </div>
)

// Reusable component for simple list items
const ListItem = ({ children }: { children: React.ReactNode }) => (
  <p className="font-body text-primary">{children}</p>
)

export default function AboutSection() {
  return (
    <section id="about" className="relative border-b border-border">
      <div className="container min-h-[800px] md:min-h-[700px] py-16 md:py-24">

        {/* Layer 1 & 2: Main Content Grid (Desktop) */}
        <div className="hidden md:grid grid-cols-12 gap-x-12 absolute inset-0 z-10 container py-16 md:py-24 pointer-events-none">
          
          {/* -- Left Column -- */}
          <div className="col-span-4 flex flex-col justify-center space-y-12">
            <div>
                <SectionTitle>About</SectionTitle>
                <p className="font-body text-primary max-w-md">
                    A visual artist with a deep interest in the intersection of fashion and digital media, exploring bold color palettes and narrative-driven concepts.
                </p>
            </div>
            <div>
              <SectionTitle>Education</SectionTitle>
              <div className="space-y-6">
                <InfoEntry primary="2021.9 - 2024.6" secondary="Taipei Xue Xue Experimental Education Institute" />
                <InfoEntry primary="2020.9 - 2021.6" secondary="National Taipei University of Business" />
              </div>
            </div>
            <div>
              <SectionTitle>Awards</SectionTitle>
              <InfoEntry primary="112 Academic Year" secondary="Taipei City Student Art Competition, Merit Award" />
            </div>
          </div>

          {/* -- Center Column (Primary Bio) -- */}
          <div className="col-span-4 text-center flex flex-col justify-center items-center">
            <div className="mt-12">
              <h1 className="font-heading italic text-3xl font-medium">Emily Chang</h1>
              <p className="font-body text-secondary mt-2">Visual Artist & Graphic Designer</p>
            </div>
          </div>

          {/* -- Right Column -- */}
          <div className="col-span-4 flex flex-col justify-center space-y-12 text-right">
            <div>
              <SectionTitle>Exhibitions</SectionTitle>
              <div className="space-y-6">
                <InfoEntry primary="2023" secondary="Story Wear Joint Exhibition" />
                <InfoEntry primary="111 Term 2" secondary="Student Showcase" />
                <InfoEntry primary="111 Term 1" secondary="Student Showcase" />
              </div>
            </div>
            <div className="space-y-12">
                <div>
                    <SectionTitle>Skills & Interests</SectionTitle>
                    <div className="space-y-1">
                        <ListItem>Procreate, Photoshop, Illustrator</ListItem>
                        <ListItem>Painting, Films, Music, Oat Milk Latte</ListItem>
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* Mobile Layout Fallback */}
        <div className="md:hidden relative z-10">
          {/* Bio appears after the lanyard space on mobile */}
          <div className="text-center pt-[450px]">
            <h1 className="font-heading italic text-3xl font-medium">Emily Chang</h1>
            <p className="font-body text-secondary mt-2">Visual Artist & Graphic Designer</p>
          </div>

          <div className="mt-16">
            <SectionTitle>About</SectionTitle>
            <p className="font-body text-primary">
                A visual artist with a deep interest in the intersection of fashion and digital media, exploring bold color palettes and narrative-driven concepts.
            </p>
          </div>
          
          {/* Info grid for mobile */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-12 mt-12">
            <div className="space-y-12">
               <div>
                  <SectionTitle>Education</SectionTitle>
                  <div className="space-y-6">
                    <InfoEntry primary="2021.9 - 2024.6" secondary="Taipei Gakugaku Institute" />
                    <InfoEntry primary="2020.9 - 2021.6" secondary="National Taipei University..." />
                  </div>
                </div>
                <div>
                  <SectionTitle>Awards</SectionTitle>
                  <InfoEntry primary="112 Academic Year" secondary="Taipei City Student Art..." />
                </div>
            </div>
            <div className="space-y-12">
                <div>
                  <SectionTitle>Exhibitions</SectionTitle>
                  <div className="space-y-6">
                    <InfoEntry primary="2023" secondary="Story Wear Joint..." />
                    <InfoEntry primary="111 Term 2" secondary="Student Showcase" />
                  </div>
                </div>
                <div>
                    <SectionTitle>Skills & Interests</SectionTitle>
                     <div className="space-y-1">
                        <ListItem>Procreate, Photoshop...</ListItem>
                        <ListItem>Painting, Films, Music...</ListItem>
                    </div>
                </div>
            </div>
          </div>
        </div>

      </div>

      {/* Layer 3: Interactive Lanyard (Always on top) */}
      <div className="absolute top-0 left-0 right-0 z-20 h-[500px] md:h-full w-full pointer-events-auto">
        <Lanyard position={[0, 2, 20]} fov={24} />
      </div>
    </section>
  )
}

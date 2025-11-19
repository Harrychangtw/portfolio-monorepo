"use client"

import Lanyard from './Lanyard'

// Reusable component for section titles
const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="font-heading italic text-base font-bold uppercase tracking-widest text-secondary mb-3">
    {children}
  </h2>
)

// Reusable component for info entries
const InfoEntry = ({ primary, secondary }: { primary: string; secondary: string }) => (
  <div>
    <p className="font-body text-secondary text-sm">{primary}</p>
    <p className="font-body text-primary">{secondary}</p>
  </div>
)

// Reusable component for simple list items
const ListItem = ({ children }: { children: React.ReactNode }) => (
  <p className="font-body text-primary">{children}</p>
)

export default function AboutSection() {
  return (
    <section id="about" className="relative border-b border-border overflow-hidden">
      {/* Parent Container: Sets minimum height but allows growth via relative children */}
      <div className="container min-h-[900px] md:min-h-[800px] py-16 md:py-24 relative">

        {/* -------------------------------------------------------
            DESKTOP GRID
            Changed: 'absolute inset-0' -> 'relative' to allow height growth
           ------------------------------------------------------- */}
        <div className="hidden md:grid grid-cols-12 gap-x-12 relative z-10 pointer-events-none">
          
          {/* -- Left Column: Extended Bio -- */}
          <div className="col-span-4 flex flex-col justify-start pt-10 text-left pointer-events-auto">
            <SectionTitle>About</SectionTitle>
            <div className="font-body text-primary space-y-5 max-w-md leading-relaxed text-[15px]">
              <p>
                This website is a collection of my past works—oil paintings, graphic design pieces, sketches, and everything in between.
              </p>
              <p>
                My interest in graphic design first took shape during my years at Xue Xue Institute, where I was encouraged to explore visual communication in ways that felt playful yet intentional.
                Painting, on the other hand, has been with me for as long as I can remember; it’s the language I grew up speaking before I even knew what “art” meant.
              </p>
              <p>
                Outside of creating, I love watching films and exploring new food spots. (I’m unreasonably passionate about crudo sauces.)
              </p>
              <p>
                I am currently studying Textiles & Fashion Design at Fu Jen Catholic University, driven by my curiosity for fashion and how it intertwines material, form, and identity.
              </p>
              <p>
                This site is both an archive of where I’ve been and a glimpse into where I hope my work will go.
              </p>
            </div>
          </div>

          {/* -- Center Column: Name & Title (Background) -- */}
          {/* Using sticky/centered logic or just flex to keep it roughly in place */}
          <div className="col-span-4 text-center flex flex-col justify-start pt-32 items-center opacity-50 hover:opacity-100 transition-opacity duration-500 pointer-events-none">
            <div> 
              <h1 className="font-heading italic text-4xl lg:text-5xl font-medium">Emily Chang</h1>
              <p className="font-body text-secondary mt-3 tracking-wide">Visual Artist & Graphic Designer</p>
            </div>
          </div>

          {/* -- Right Column: The Info Lists -- */}
          <div className="col-span-4 flex flex-col justify-start pt-10 space-y-8 text-right pointer-events-auto">
            
            {/* Education */}
            <div>
              <SectionTitle>Education</SectionTitle>
              <div className="space-y-3">
                <InfoEntry primary="Current" secondary="Fu Jen Catholic University (Textiles & Fashion)" />
                <InfoEntry primary="2021 - 2024" secondary="Taipei Xue Xue Institute" />
                <InfoEntry primary="2020 - 2021" secondary="National Taipei University of Business" />
              </div>
            </div>

            {/* Exhibitions & Honors */}
            <div>
                <SectionTitle>Exhibitions & Honors</SectionTitle>
                <div className="space-y-3">
                    <InfoEntry primary="2023" secondary="Story Wear Joint Exhibition" />
                    <InfoEntry primary="112 Academic Year" secondary="Taipei City Student Art Merit Award" />
                    <InfoEntry primary="111 Term 1 & 2" secondary="Student Showcase" />
                </div>
            </div>

            {/* Skills */}
            <div>
                <SectionTitle>Skills & Interests</SectionTitle>
                <div className="space-y-1">
                    <ListItem>Procreate, Photoshop, Illustrator</ListItem>
                    <ListItem>Painting, Films, Music, Oat Milk Latte</ListItem>
                </div>
            </div>

          </div>
        </div>


        {/* -------------------------------------------------------
            MOBILE LAYOUT
           ------------------------------------------------------- */}
        <div className="md:hidden relative z-10 pb-20">
          
          {/* 1. Spacer for Lanyard + Name Block */}
          <div className="text-center pt-[420px] mb-16">
            <h1 className="font-heading italic text-3xl font-medium">Emily Chang</h1>
            <p className="font-body text-secondary mt-2">Visual Artist & Graphic Designer</p>
          </div>

          {/* 2. The Bio */}
          <div className="mb-16">
            <SectionTitle>About</SectionTitle>
            <div className="font-body text-primary space-y-4 mt-4">
                <p>
                This website is a collection of my past works—oil paintings, graphic design pieces, sketches, and everything in between.
                </p>
                <p>
                My interest in graphic design first took shape during my years at xue xue institute. Painting, on the other hand, has been with me for as long as I can remember.
                </p>
                <p>
                Outside of creating, I love watching films and exploring new food spots.
                </p>
                <p>
                I am currently studying Textiles & Fashion Design at Fu Jen Catholic University. This site is both an archive of where I’ve been and a glimpse into where I hope my work will go.
                </p>
            </div>
          </div>
          
          {/* 3. Info Lists */}
          <div className="flex flex-col space-y-12">
             <div>
                <SectionTitle>Education</SectionTitle>
                <div className="space-y-4 mt-4">
                  <InfoEntry primary="Current" secondary="Fu Jen Catholic University" />
                  <InfoEntry primary="2021 - 2024" secondary="Taipei Xue Xue Institute" />
                  <InfoEntry primary="2020 - 2021" secondary="National Taipei University..." />
                </div>
              </div>

              <div>
                <SectionTitle>Exhibitions & Honors</SectionTitle>
                <div className="space-y-4 mt-4">
                  <InfoEntry primary="2023" secondary="Story Wear Joint Exhibition" />
                  <InfoEntry primary="112 Academic Year" secondary="Taipei City Student Art Merit Award" />
                  <InfoEntry primary="111 Term 1 & 2" secondary="Student Showcase" />
                </div>
              </div>

              <div>
                  <SectionTitle>Skills & Interests</SectionTitle>
                   <div className="space-y-2 mt-4">
                      <ListItem>Procreate, Photoshop, Illustrator</ListItem>
                      <ListItem>Painting, Films, Crudo Sauces</ListItem>
                  </div>
              </div>
          </div>
        </div>

      </div>

      {/* -------------------------------------------------------
          LAYER 3: Lanyard
          Changed: Mobile height increased to 800px to cover name area
         ------------------------------------------------------- */}
      <div className="absolute top-0 left-0 right-0 z-20 h-[500px] md:h-full w-full pointer-events-auto">
        <Lanyard position={[0, 0, 25]} gravity={[0, -40, 0]} />
      </div>
    </section>
  )
}
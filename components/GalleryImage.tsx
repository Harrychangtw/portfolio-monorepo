import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

const GalleryImage = ({ src, caption, priority = false }) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [loading, setLoading] = useState(true);
  const imgRef = useRef(null);

  // White frame border thickness in pixels
  const frameBorderThickness = 3;

  useEffect(() => {
    // Only run in the browser
    if (typeof window === 'undefined') return;
    
    const img = new window.Image();
    
    img.onload = () => {
      console.log(`GalleryImage loaded: ${src} with dimensions ${img.width}x${img.height}`);
      setDimensions({ width: img.width, height: img.height });
      setLoading(false);
    };
    
    img.onerror = () => {
      console.warn(`Failed to load gallery image: ${src}, using fallback dimensions`);
      // Set fallback dimensions (3:2 aspect ratio)
      setDimensions({ width: 3, height: 2 });
      setLoading(false);
    };
    
    img.src = src;
  }, [src]);

  // Calculate aspect ratio from actual image dimensions
  // Default to 3:2 (landscape photography standard) if dimensions aren't available
  const rawAspectRatio = dimensions.width && dimensions.height 
    ? dimensions.width / dimensions.height 
    : 1.5;  // 3:2 ratio = 1.5
    
  // Determine orientation and constrain extreme aspect ratios
  const isPortrait = rawAspectRatio < 1;
  const isSquare = rawAspectRatio >= 0.9 && rawAspectRatio <= 1.1;
  const maxLandscapeRatio = 1.5; // 3:2 landscape
  const minPortraitRatio = 0.6667; // 2:3 portrait (1/1.5)

  // Apply aspect ratio constraints:
  // - Images with less extreme ratios use native aspect ratio
  // - Images with more extreme ratios are constrained to max/min
  let constrainedAspectRatio = rawAspectRatio;
  
  if (isPortrait && rawAspectRatio < minPortraitRatio) {
    // Too tall - constrain to 2:3
    constrainedAspectRatio = minPortraitRatio;
  } else if (!isPortrait && rawAspectRatio > maxLandscapeRatio) {
    // Too wide - constrain to 3:2
    constrainedAspectRatio = maxLandscapeRatio;
  }

  // Calculate appropriate container padding based on constrained aspect ratio
  const containerPadding = `${(1 / constrainedAspectRatio) * 100}%`;
  
  // Calculate padding to ensure all images have consistent width alignment
  // For portrait images, we need to adjust the horizontal padding differently
  const horizontalPadding = isPortrait ? '10%' : '0';
  
  return (
    <figure className="gallery-image-container">
      {/* White frame container with consistent border - no rounded corners */}
      <div className="bg-white overflow-hidden" style={{
        // Consistent 3px white frame around all images
        padding: `${frameBorderThickness}px`,
        // Add horizontal padding for portrait images to ensure width alignment with other images
        paddingLeft: horizontalPadding,
        paddingRight: horizontalPadding,
        // Light shadow for subtle depth
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
      }}>
        {!loading && (
          <div 
            className="relative overflow-hidden"
            style={{ 
              paddingBottom: containerPadding,
            }}
          >
            <Image
              ref={imgRef}
              src={src}
              alt={caption || "Gallery image"}
              fill
              style={{ 
                objectFit: 'contain',
                objectPosition: 'center'
              }}
              priority={priority}
              className="gallery-image"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}
      </div>
      {caption && <figcaption className="mt-2 text-sm text-muted-foreground text-left">{caption}</figcaption>}
    </figure>
  );
};

export default GalleryImage;

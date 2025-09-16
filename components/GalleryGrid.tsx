import { useState, useEffect } from 'react';
import GalleryImage from './GalleryImage';

const GalleryGrid = ({ images }) => {
  const [layout, setLayout] = useState([]);

  // Calculate optimal layout based on image dimensions and screen size
  useEffect(() => {
    // Dynamic layout calculation based on viewport and image dimensions
    // This is simplified - you would implement a more sophisticated algorithm
    const calculateLayout = () => {
      // Simple implementation: group by rows with similar aspect ratios
      const rows = [];
      let currentRow = [];
      let rowAspectRatioSum = 0;
      
      images.forEach((image, index) => {
        // For first implementation, we'll create rows of 2-3 images
        if (currentRow.length >= (index % 2 === 0 ? 2 : 3)) {
          rows.push([...currentRow]);
          currentRow = [];
          rowAspectRatioSum = 0;
        }
        
        currentRow.push(image);
      });
      
      if (currentRow.length > 0) {
        rows.push(currentRow);
      }
      
      setLayout(rows);
    };

    calculateLayout();
    window.addEventListener('resize', calculateLayout);
    
    return () => {
      window.removeEventListener('resize', calculateLayout);
    };
  }, [images]);

  return (
    <div className="gallery-grid">
      {layout.map((row, rowIndex) => (
        <div key={`row-${rowIndex}`} className="gallery-row">
          {row.map((image, imageIndex) => (
            <GalleryImage
              key={`image-${rowIndex}-${imageIndex}`}
              src={image.url}
              caption={image.caption}
              priority={rowIndex === 0 && imageIndex < 2}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default GalleryGrid;

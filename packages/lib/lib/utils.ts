import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { GalleryItemMetadata } from "./markdown"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface ImageLayout {
  itemIndex: number;
  columnIndex: number;
  item: GalleryItemMetadata;
}

export interface BalancedLayoutResult {
  columns: ImageLayout[][];
  heightPerColumn: number[];
}

const VERTICAL_ASPECT = "v"; // 4:5 aspect ratio
const HORIZONTAL_ASPECT = "h"; // 5:4 aspect ratio

// Helper to determine if an image is vertical or horizontal
const getAspectType = (item: GalleryItemMetadata): string => {
  // If the item has an explicit aspect type, use that
  if (item.aspectType) {
    return item.aspectType;
  }
  
  // Default to checking if imageUrl contains indicators like '_v' or '_h'
  const imageUrl = item.imageUrl || '';
  if (imageUrl.includes('_v') || imageUrl.includes('-v.')) {
    return VERTICAL_ASPECT;
  } else if (imageUrl.includes('_h') || imageUrl.includes('-h.')) {
    return HORIZONTAL_ASPECT;
  }
  
  // Default to horizontal if we can't determine
  return HORIZONTAL_ASPECT;
};

// Calculate relative height of an aspect ratio
const getRelativeHeight = (aspectType: string): number => {
  return aspectType === VERTICAL_ASPECT ? 1.25 : 0.8; // 5/4 for vertical, 4/5 for horizontal
};

/**
 * Creates a balanced layout for gallery items across 3 columns
 * Attempts to follow the pattern h v h, v h v, h v h where possible
 * @param items Array of gallery items to layout
 * @param pinnedItems Map of item indices that are pinned to specific positions
 * @returns Object with columns and height per column
 */
export function createBalancedLayout(
  items: GalleryItemMetadata[],
  pinnedItems: Map<number, { rowIndex: number, columnIndex: number }> = new Map()
): BalancedLayoutResult {
  // Initialize columns and heights
  const columns: ImageLayout[][] = [[], [], []];
  const columnHeights: number[] = [0, 0, 0];
  
  // Track which indices have been placed
  const placedIndices = new Set<number>();
  
  // First, place pinned items
  pinnedItems.forEach((position, itemIndex) => {
    if (itemIndex >= 0 && itemIndex < items.length) {
      const { rowIndex, columnIndex } = position;
      
      // Ensure the column has enough rows
      while (columns[columnIndex].length <= rowIndex) {
        columns[columnIndex].push({
          itemIndex: -1, // Placeholder
          columnIndex,
          item: {} as GalleryItemMetadata
        });
      }
      
      // Place the pinned item
      const item = items[itemIndex];
      const aspectType = getAspectType(item);
      const relativeHeight = getRelativeHeight(aspectType);
      
      columns[columnIndex][rowIndex] = {
        itemIndex,
        columnIndex,
        item
      };
      
      columnHeights[columnIndex] += relativeHeight;
      placedIndices.add(itemIndex);
    }
  });
  
  // Group remaining items in sets of 3 for row-by-row layout
  let currentRow = 0;
  
  while (placedIndices.size < items.length) {
    // For each row, try to follow the pattern:
    // Row 0: h v h
    // Row 1: v h v
    // Row 2: h v h, etc.
    const rowPattern = currentRow % 2 === 0 
      ? [HORIZONTAL_ASPECT, VERTICAL_ASPECT, HORIZONTAL_ASPECT]
      : [VERTICAL_ASPECT, HORIZONTAL_ASPECT, VERTICAL_ASPECT];
    
    // Find items matching the desired pattern for this row
    const rowItems: number[] = [-1, -1, -1]; // Init with -1 (unfilled)
    
    // First pass: try to find exact aspect ratio matches
    for (let i = 0; i < items.length; i++) {
      if (placedIndices.has(i)) continue;
      
      const item = items[i];
      const aspectType = getAspectType(item);
      
      // Check if this item matches any unfilled position in the pattern
      for (let j = 0; j < 3; j++) {
        if (rowItems[j] === -1 && aspectType === rowPattern[j]) {
          rowItems[j] = i;
          placedIndices.add(i);
          break;
        }
      }
      
      // If we've filled the row, break
      if (!rowItems.includes(-1)) break;
    }
    
    // Second pass: fill any remaining positions with any available items
    for (let j = 0; j < 3; j++) {
      if (rowItems[j] === -1) {
        // Find any unplaced item
        for (let i = 0; i < items.length; i++) {
          if (!placedIndices.has(i)) {
            rowItems[j] = i;
            placedIndices.add(i);
            break;
          }
        }
      }
    }
    
    // Place items in this row
    for (let j = 0; j < 3; j++) {
      const itemIndex = rowItems[j];
      if (itemIndex !== -1) {
        const item = items[itemIndex];
        const aspectType = getAspectType(item);
        const relativeHeight = getRelativeHeight(aspectType);
        
        columns[j].push({
          itemIndex,
          columnIndex: j,
          item
        });
        
        columnHeights[j] += relativeHeight;
      }
    }
    
    currentRow++;
    
    // Break if we've processed all items
    if (placedIndices.size >= items.length) break;
    
    // Optimization: After initial pattern-based placement, balance remaining items
    if (currentRow >= 2) {
      // Place remaining items one-by-one into the shortest column
      while (placedIndices.size < items.length) {
        // Find shortest column
        let shortestColumn = 0;
        for (let i = 1; i < 3; i++) {
          if (columnHeights[i] < columnHeights[shortestColumn]) {
            shortestColumn = i;
          }
        }
        
        // Find next unplaced item
        let nextItemIndex = -1;
        for (let i = 0; i < items.length; i++) {
          if (!placedIndices.has(i)) {
            nextItemIndex = i;
            break;
          }
        }
        
        if (nextItemIndex !== -1) {
          const item = items[nextItemIndex];
          const aspectType = getAspectType(item);
          const relativeHeight = getRelativeHeight(aspectType);
          
          columns[shortestColumn].push({
            itemIndex: nextItemIndex,
            columnIndex: shortestColumn,
            item
          });
          
          columnHeights[shortestColumn] += relativeHeight;
          placedIndices.add(nextItemIndex);
        } else {
          break;
        }
      }
    }
  }
  
  return {
    columns,
    heightPerColumn: columnHeights
  };
}

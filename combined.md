</Users/zhangqiwei/Documents/01_dev-project/portfolio_site/lib/markdown.ts>
import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { remark } from "remark"
import html from "remark-html"
import { visit } from "unist-util-visit"
import type { Image as MdastImage, Root, HTML } from "mdast"

// Define the directories
const projectsDirectory = path.join(process.cwd(), "content/projects")
const galleryDirectory = path.join(process.cwd(), "content/gallery")

// Helper function to process image paths
function getThumbnailPath(imagePath: string): string {
  if (!imagePath) return imagePath;
  
  // Ensure path starts with /
  if (!imagePath.startsWith('/') && !imagePath.startsWith('http')) {
    imagePath = '/' + imagePath;
  }
  
  // Handle optimization directory structure
  if (imagePath.includes('/images/') && !imagePath.includes('/optimized/')) {
    imagePath = imagePath.replace('/images/', '/images/optimized/');
  }
  
  // Add thumbnail suffix if not already present
  if (!imagePath.includes('-thumb.webp')) {
    imagePath = imagePath.replace('.webp', '-thumb.webp');
  }
  
  return imagePath;
}

// Helper function to get full resolution path
function getFullResolutionPath(imagePath: string): string {
  if (!imagePath) return imagePath;
  
  // Ensure path starts with /
  if (!imagePath.startsWith('/') && !imagePath.startsWith('http')) {
    imagePath = '/' + imagePath;
  }
  
  // Handle optimization directory structure
  if (imagePath.includes('/images/') && !imagePath.includes('/optimized/')) {
    imagePath = imagePath.replace('/images/', '/images/optimized/');
  }
  
  // Remove thumbnail suffix if present
  return imagePath.replace('-thumb.webp', '.webp');
}

export interface ProjectMetadata {
  slug: string
  title: string
  category: string
  subcategory?: string
  description: string
  imageUrl: string
  year: string
  date: string
  role?: string
  technologies?: string[]
  client?: string
  website?: string
  featured?: boolean
  pinned?: number  // Changed from boolean to number, -1 for not pinned, positive numbers for pinning order
  locked?: boolean
  tooltip?: string
}

export interface GalleryImage {
  url: string
  thumbnailUrl?: string // Added thumbnailUrl field
  caption?: string
  width?: number
  height?: number
  aspectRatio?: number
}

export interface GalleryItemMetadata {
  slug: string
  title: string
  description: string
  imageUrl: string
  quote: string
  date: string
  gallery?: GalleryImage[]
  camera?: string
  lens?: string
  location?: string
  tags?: string[]
  featured?: boolean
  pinned?: number  // Changed from boolean to number, -1 for not pinned, positive numbers for pinning order
  locked?: boolean
  aspectType?: string // 'v' for vertical (4:5) or 'h' for horizontal (5:4)
  aspectRatio?: number
}

// Ensure content directories exist
function ensureDirectoriesExist() {
  if (!fs.existsSync(projectsDirectory)) {
    fs.mkdirSync(projectsDirectory, { recursive: true })
  }
  if (!fs.existsSync(galleryDirectory)) {
    fs.mkdirSync(galleryDirectory, { recursive: true })
  }
}

// Get all project files
export function getAllProjectSlugs() {
  ensureDirectoriesExist()
  try {
    if (!fs.existsSync(projectsDirectory)) {
      return []
    }

    const fileNames = fs.readdirSync(projectsDirectory)
    return fileNames
      .filter(fileName => fileName.endsWith('.md'))
      .map((fileName) => {
        return {
          params: {
            slug: fileName.replace(/\.md$/, ""),
          },
        }
      })
  } catch (error) {
    console.error("Error reading project directory:", error)
    return []
  }
}

// Get all gallery item files
export function getAllGallerySlugs() {
  ensureDirectoriesExist()
  try {
    if (!fs.existsSync(galleryDirectory)) {
      return []
    }

    const fileNames = fs.readdirSync(galleryDirectory)
    return fileNames
      .filter(fileName => fileName.endsWith('.md'))
      .map((fileName) => {
        return {
          params: {
            slug: fileName.replace(/\.md$/, ""),
          },
        }
      })
  } catch (error) {
    console.error("Error reading gallery directory:", error)
    return []
  }
}

// Get all projects metadata
export function getAllProjectsMetadata(locale: string = 'en'): ProjectMetadata[] {
  ensureDirectoriesExist()
  try {
    if (!fs.existsSync(projectsDirectory)) {
      return []
    }

let fileNames = fs.readdirSync(projectsDirectory)

    // Filter files based on locale to show only one version
    fileNames = fileNames.filter(fileName => {
      if (locale === 'zh-TW') {
        // For Chinese, prioritize _zh-tw files, fallback to base files if no Chinese version exists
        if (fileName.includes('_zh-tw')) {
          return true
        }
        // Check if Chinese version exists for this base file
        const baseName = fileName.replace('.md', '')
        const chineseVersion = `${baseName}_zh-tw.md`
        return !fs.existsSync(path.join(projectsDirectory, chineseVersion)) && !fileName.includes('_')
      } else {
        // For English, only show files without locale suffix
        return !fileName.includes('_zh-tw') && !fileName.includes('_zh-TW')
      }
    })
    const allProjectsData = fileNames
      .filter(fileName => fileName.endsWith('.md'))
      .map((fileName) => {
        // Remove ".md" from file name to get slug
        const slug = fileName.replace(/\.md$/, "")

        // Read markdown file as string
        const fullPath = path.join(projectsDirectory, fileName)
        const fileContents = fs.readFileSync(fullPath, "utf8")

        // Use gray-matter to parse the post metadata section
        const matterResult = matter(fileContents)
        
        // Process imageUrl to add thumbnail for cards/previews
        const data = matterResult.data as Omit<ProjectMetadata, "slug">;
        if (data.imageUrl) {
          data.imageUrl = getThumbnailPath(data.imageUrl);
        }

        // Combine the data with the slug
        return {
          slug,
          ...data,
        }
      })

    // Sort projects by date
    return allProjectsData.sort((a, b) => {
      // Handle pinned items with numeric values
      // -1 means not pinned, positive numbers indicate priority (1 is highest)
      if (typeof a.pinned === 'number' && a.pinned >= 0 && (typeof b.pinned !== 'number' || b.pinned < 0)) {
        return -1; // a is pinned, b is not pinned
      }
      if ((typeof a.pinned !== 'number' || a.pinned < 0) && typeof b.pinned === 'number' && b.pinned >= 0) {
        return 1; // a is not pinned, b is pinned
      }
      if (typeof a.pinned === 'number' && typeof b.pinned === 'number' && a.pinned >= 0 && b.pinned >= 0) {
        return a.pinned - b.pinned; // Both are pinned, compare by pin number
      }
      
      // Then by date
      if (a.date < b.date) {
        return 1
      } else {
        return -1
      }
    })
  } catch (error) {
    console.error("Error getting projects metadata:", error)
    return []
  }
}

// Get all gallery items metadata
export function getAllGalleryMetadata(locale: string = 'en'): GalleryItemMetadata[] {
  ensureDirectoriesExist()
  try {
    if (!fs.existsSync(galleryDirectory)) {
      return []
    }

let fileNames = fs.readdirSync(galleryDirectory)

    // Filter files based on locale to show only one version
    fileNames = fileNames.filter(fileName => {
      if (locale === 'zh-TW') {
        // For Chinese, prioritize _zh-tw files, fallback to base files if no Chinese version exists
        if (fileName.includes('_zh-tw')) {
          return true
        }
        // Check if Chinese version exists for this base file
        const baseName = fileName.replace('.md', '')
        const chineseVersion = `${baseName}_zh-tw.md`
        return !fs.existsSync(path.join(galleryDirectory, chineseVersion)) && !fileName.includes('_')
      } else {
        // For English, only show files without locale suffix
        return !fileName.includes('_zh-tw') && !fileName.includes('_zh-TW')
      }
    })
    const allGalleryData = fileNames
      .filter(fileName => fileName.endsWith('.md'))
      .map((fileName) => {
        // Remove ".md" from file name to get slug
        const slug = fileName.replace(/\.md$/, "")

        // Read markdown file as string
        const fullPath = path.join(galleryDirectory, fileName)
        const fileContents = fs.readFileSync(fullPath, "utf8")

        // Use gray-matter to parse the post metadata section
        const matterResult = matter(fileContents)
        
        // Process imageUrl to add thumbnail for cards/previews
        const data = matterResult.data as Omit<GalleryItemMetadata, "slug">;
        if (data.imageUrl) {
          data.imageUrl = getThumbnailPath(data.imageUrl);
        }

        // Combine the data with the slug
        return {
          slug,
          ...data,
        }
      })

    // Sort gallery items by date
    return allGalleryData.sort((a, b) => {
      // Handle pinned items with numeric values
      // -1 means not pinned, positive numbers indicate priority (1 is highest)
      if (typeof a.pinned === 'number' && a.pinned >= 0 && (typeof b.pinned !== 'number' || b.pinned < 0)) {
        return -1; // a is pinned, b is not pinned
      }
      if ((typeof a.pinned !== 'number' || a.pinned < 0) && typeof b.pinned === 'number' && b.pinned >= 0) {
        return 1; // a is not pinned, b is pinned
      }
      if (typeof a.pinned === 'number' && typeof b.pinned === 'number' && a.pinned >= 0 && b.pinned >= 0) {
        return a.pinned - b.pinned; // Both are pinned, compare by pin number
      }
      
      // Then by date
      if (a.date < b.date) {
        return 1
      } else {
        return -1
      }
    })
  } catch (error) {
    console.error("Error getting gallery metadata:", error)
    return []
  }
}

// Get project data by slug
export async function getProjectData(slug: string) {
  ensureDirectoriesExist()
  try {
    const fullPath = path.join(projectsDirectory, `${slug}.md`)

    if (!fs.existsSync(fullPath)) {
      return null
    }

    const fileContents = fs.readFileSync(fullPath, "utf8")

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents)

    // Use remark to convert markdown into HTML string
    const processedContent = await remark()
      .use(transformMedia)
      .use(html, { sanitize: false })
      .process(matterResult.content);
    const contentHtml = processedContent.toString()

    // Get the full data for detail view (don't use thumbnails for hero image)
    const data = matterResult.data as Omit<ProjectMetadata, "slug">;

    // Process imageUrl to use full resolution in detail view
    if (data.imageUrl) {
      data.imageUrl = getFullResolutionPath(data.imageUrl);
    }

    // Combine the data with the slug and contentHtml
    return {
      slug,
      contentHtml,
      ...data,
    }
  } catch (error) {
    console.error(`Error getting project data for slug ${slug}:`, error)
    return null
  }
}

// Get gallery item data by slug
export async function getGalleryItemData(slug: string) {
  ensureDirectoriesExist()
  try {
    const fullPath = path.join(galleryDirectory, `${slug}.md`)

    if (!fs.existsSync(fullPath)) {
      return null
    }

    const fileContents = fs.readFileSync(fullPath, "utf8")

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents)

    // Process the gallery images to add thumbnailUrl if available
    const data = matterResult.data as Omit<GalleryItemMetadata, "slug">;
    
    // Ensure the main imageUrl has a leading slash for absolute path
    if (data.imageUrl && !data.imageUrl.startsWith('/') && !data.imageUrl.startsWith('http')) {
      data.imageUrl = '/' + data.imageUrl;
    }
    
    // Process gallery images to include thumbnailUrl and ensure consistent URL format
    if (data.gallery && Array.isArray(data.gallery)) {
      data.gallery = data.gallery.map(image => {
        // Add leading slash if it's a relative path and doesn't start with http(s)
        if (image.url && !image.url.startsWith('/') && !image.url.startsWith('http')) {
          image.url = '/' + image.url;
        }
        
        // Only return thumbnails for card views, not for individual item pages
        return { 
          ...image,
          thumbnailUrl: getThumbnailPath(image.url)
        };
      });
    }

    // Use remark to convert markdown into HTML string
    // Process image URLs in markdown content to use full resolution paths
    const processedContent = await remark()
      .use(() => (tree) => {
        // Process the tree to find image nodes and fix URLs
        visit(tree, 'image', (node: MdastImage) => {
          // Ensure image URLs use the correct path format
          if (node.url) {
            // Remove -thumb suffix if present to ensure full resolution
            node.url = node.url.replace('-thumb.webp', '.webp');
            
            // Ensure URL starts with / for absolute paths from root
            if (!node.url.startsWith('/') && !node.url.startsWith('http')) {
              node.url = '/' + node.url;
            }
            
            // If the URL points to images/gallery but not to optimized, update path
            if (node.url.includes('/images/gallery/') && !node.url.includes('/optimized/')) {
              node.url = node.url.replace('/images/gallery/', '/images/optimized/gallery/');
            }
          }
          return node;
        });
      })
      .use(html)
      .process(matterResult.content);
    
    const contentHtml = processedContent.toString();

    // Combine the data with the slug and contentHtml
    return {
      slug,
      contentHtml,
      ...data,
    }
  } catch (error) {
    console.error(`Error getting gallery item data for slug ${slug}:`, error)
    return null
  }
}

// Save a new project
export function saveProject(slug: string, data: Omit<ProjectMetadata, "slug">, content: string) {
  ensureDirectoriesExist()
  try {
    const fullPath = path.join(projectsDirectory, `${slug}.md`)
    const fileContent = matter.stringify(content, data)
    fs.writeFileSync(fullPath, fileContent)
    return true
  } catch (error) {
    console.error(`Error saving project ${slug}:`, error)
    return false
  }
}

// Save a new gallery item
export function saveGalleryItem(slug: string, data: Omit<GalleryItemMetadata, "slug">, content: string) {
  ensureDirectoriesExist()
  try {
    const fullPath = path.join(galleryDirectory, `${slug}.md`)
    const fileContent = matter.stringify(content, data)
    fs.writeFileSync(fullPath, fileContent)
    return true
  } catch (error) {
    console.error(`Error saving gallery item ${slug}:`, error)
    return false
  }
}

function transformMedia() {
  return (tree: Root) => {
    visit(tree, 'image', (node: MdastImage, index, parent) => {
      if (!parent || index === null) return

      const url = node.url
      const alt = node.alt || ''

      // Check if it's a Google Drive video link
      const driveRegex = /https?:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/
      const driveMatch = url.match(driveRegex)

      // Check if it's a YouTube video link
      const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})|(?:https?:\/\/)?(?:www\.)?youtube\.com\/.*[?&]v=([a-zA-Z0-9_-]{11})/
      const youtubeMatch = url.match(youtubeRegex)

      if (driveMatch) {
        const videoId = driveMatch[1]
        const embedUrl = `https://drive.google.com/file/d/${videoId}/preview`
        
        const videoNode: HTML = {
          type: 'html',
          value: `
            <div class="video-embed-container" data-type="googledrive" data-src="${embedUrl}" data-title="${alt}">
              <div class="video-placeholder">
                <div class="video-placeholder-content">
                  <div class="video-placeholder-icon">▶</div>
                  <p class="video-placeholder-text">Google Drive Video</p>
                  <p class="video-placeholder-subtitle" style="text-align: left;">${alt}</p>
                </div>
              </div>
            </div>
          `
        }
        parent.children.splice(index, 1, videoNode)
      } else if (youtubeMatch) {
        const videoId = youtubeMatch[1] || youtubeMatch[2] // Handle both match groups
        const embedUrl = `https://www.youtube.com/embed/${videoId}`
        
        const videoNode: HTML = {
          type: 'html',
          value: `
            <div class="video-embed-container" data-type="youtube" data-src="${embedUrl}" data-title="${alt}">
              <div class="video-placeholder">
                <div class="video-placeholder-title" style="text-align: left;">${alt}</div>
              </div>
            </div>
          `
        }
        parent.children.splice(index, 1, videoNode)
      } else {
        // It's a regular image with optimized loading and dimensions to prevent CLS
        const imageUrl = getFullResolutionPath(url)
        
        const imageNode: HTML = {
          type: 'html',
          value: `
            <figure class="my-6">
              <img 
                src="${imageUrl}" 
                alt="${alt}" 
                loading="lazy" 
                decoding="async"
                style="
                  width: 100%;
                  height: auto;
                  display: block;
                  object-fit: contain;
                " 
              />
              ${alt ? `<figcaption class="mt-2 text-sm text-muted-foreground text-left">${alt}</figcaption>` : ''}
            </figure>
          `
        }
        parent.children.splice(index, 1, imageNode)
      }
    })
  }
}


<//Users/zhangqiwei/Documents/01_dev-project/portfolio_site/lib/markdown.ts>

</Users/zhangqiwei/Documents/01_dev-project/portfolio_site/components/gallery-section.tsx>
"use client"

import { useEffect, useState, useRef } from "react"
import GalleryCard from "./gallery-card"
import { GalleryItemMetadata } from "@/lib/markdown"
import { createBalancedLayout } from "@/lib/utils"
import { useIntersectionObserver } from "@/hooks/use-intersection-observer"
import { useLanguage } from "@/contexts/LanguageContext"

export default function GallerySection() {
  const { language, t } = useLanguage()
  const [galleryItems, setGalleryItems] = useState<GalleryItemMetadata[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [forceLoad, setForceLoad] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  
  // Check if we should load immediately (when there's a hash in URL)
  const shouldLoadImmediately = typeof window !== 'undefined' && window.location.hash === '#gallery'
  
  const isVisible = useIntersectionObserver({
    elementRef: sectionRef as React.RefObject<Element>,
    rootMargin: '100px'
  })

  useEffect(() => {
    const onForce = (e: Event) => {
      const ce = e as CustomEvent<string>
      if (ce.detail === "gallery") setForceLoad(true)
    }
    window.addEventListener("force-load-section", onForce as EventListener)
    return () => window.removeEventListener("force-load-section", onForce as EventListener)
  }, [])

  useEffect(() => {
    async function fetchGalleryItems() {
      try {
        const response = await fetch(`/api/gallery?locale=${language}`)
        const data = await response.json()
        setGalleryItems(data)
      } catch (error) {
        console.error('Failed to fetch gallery items:', error)
      } finally {
        setIsLoading(false)
      }
    }

    // Load immediately if hash is #gallery, otherwise wait for visibility
    if (shouldLoadImmediately || isVisible || forceLoad) {
      fetchGalleryItems()
    }
  }, [isVisible, language, shouldLoadImmediately, forceLoad])

  // Handle pinned items (maintain their positions in the layout)
  const getPinnedItemsMap = (items: GalleryItemMetadata[]) => {
    const pinnedMap = new Map<number, { rowIndex: number, columnIndex: number }>()
    
    items.forEach((item, index) => {
      if (typeof item.pinned === 'number' && item.pinned >= 0) {
        const pinOrder = item.pinned - 1
        const naturalRow = Math.floor(pinOrder / 3)
        const naturalColumn = pinOrder % 3
        
        pinnedMap.set(index, {
          rowIndex: naturalRow,
          columnIndex: naturalColumn
        })
      }
    })
    
    return pinnedMap
  }

  // Create a balanced layout using our algorithm
  const layoutResult = isLoading ? null : createBalancedLayout(galleryItems, getPinnedItemsMap(galleryItems))

  // Helper function to create a placeholder with a specific aspect ratio
  const renderPlaceholderCard = (aspectRatio: string, index: number) => (
    <div key={index} className="mb-2 md:mb-4">
      <div className="relative overflow-hidden bg-white">
        <div className="relative">
          <div className="absolute inset-0 z-10 pointer-events-none border-l-4 border-r-4 border-white"></div>
          
          <div 
            className="relative w-full overflow-hidden" 
            style={{ paddingBottom: aspectRatio }}
          >
            <div className="absolute inset-0 w-full h-full">
              <div className="w-full h-full bg-muted animate-pulse overflow-hidden">
                <div className="animate-shimmer absolute inset-0 -translate-x-full bg-gradient-to-r from-muted via-muted/50 to-muted" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <section ref={sectionRef} id="gallery" className="py-12 md:py-16">
      <div className="container">
        <h2 className="font-space-grotesk text-lg uppercase tracking-wider text-secondary mb-4">{t('gallery.title')}</h2>
        
        {/* Container with space reservation */}
        <div 
          className={`w-full ${isLoading ? 'min-h-[2400px] md:min-h-[900px]' : ''}`}
          style={{ transition: 'min-height 0.3s ease-out' }}
        >
          {isLoading ? (
            <div className="flex flex-col md:flex-row w-full gap-[var(--column-spacing)]" >
              <div className="flex-1 space-y-[var(--column-spacing)]">
                {renderPlaceholderCard("100%", 1)}
                {renderPlaceholderCard("100%", 2)}
              </div>
              
              <div className="flex-1 space-y-[var(--column-spacing)]">
                {renderPlaceholderCard("100%", 3)}
                {renderPlaceholderCard("100%", 4)}
              </div>
              
              <div className="flex-1 space-y-[var(--column-spacing)]">
                {renderPlaceholderCard("100%", 5)}
                {renderPlaceholderCard("100%", 6)}
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row w-full gap-[var(--column-spacing)]">
              {layoutResult && layoutResult.columns.map((column, colIndex) => (
                <div key={colIndex} className="flex-1 space-y-[var(--column-spacing)]">
                  {column.map((layoutItem) => (
                    <GalleryCard
                      key={layoutItem.item.slug}
                      title={layoutItem.item.title}
                      quote={layoutItem.item.quote}
                      slug={layoutItem.item.slug}
                      imageUrl={layoutItem.item.imageUrl}
                      pinned={layoutItem.item.pinned}
                      locked={layoutItem.item.locked}
                      priority={layoutItem.itemIndex < 3}
                      index={layoutItem.itemIndex}
                    />
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

<//Users/zhangqiwei/Documents/01_dev-project/portfolio_site/components/gallery-section.tsx>

</Users/zhangqiwei/Documents/01_dev-project/portfolio_site/lib/utils.ts>
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
<//Users/zhangqiwei/Documents/01_dev-project/portfolio_site/lib/utils.ts>

</Users/zhangqiwei/Documents/01_dev-project/portfolio_site/components/gallery-card.tsx>
"use client"

import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { LockIcon } from "lucide-react"
import { useIntersectionObserver } from "../hooks/use-intersection-observer"

interface GalleryCardProps {
  title: string
  quote: string
  slug: string
  imageUrl: string
  pinned?: number
  locked?: boolean
  priority?: boolean
  index?: number
  width?: number
  height?: number
}

export default function GalleryCard({ 
  title, 
  quote, 
  slug, 
  imageUrl, 
  pinned, 
  locked,
  priority = false,
  index = 0,
  width,
  height
}: GalleryCardProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isVisible = useIntersectionObserver({
    elementRef: containerRef as React.RefObject<Element>,
    rootMargin: '50px'
  })
  const [imageLoaded, setImageLoaded] = useState(false)
  const [blurComplete, setBlurComplete] = useState(false)

  // If we have width/height, calculate aspect ratio immediately to prevent CLS
  const haveDims = !!width && !!height
  const constrained = (() => {
    if (!haveDims) return { w: 1, h: 1, isPortrait: false }
    const raw = width! / height!
    const maxLandscapeRatio = 1.25 // 5:4
    const minPortraitRatio = 0.8   // 4:5
    let ratio = raw
    if (raw < minPortraitRatio) ratio = minPortraitRatio
    else if (raw > maxLandscapeRatio) ratio = maxLandscapeRatio
    return { w: ratio, h: 1, isPortrait: ratio < 1 }
  })()

  // Fallback dynamic measurement for cases without metadata dimensions
  const [aspectRatio, setAspectRatio] = useState("100%")
  const [originalAspect, setOriginalAspect] = useState<number>(1)
  const [isPortrait, setIsPortrait] = useState(false)

  // Get the full resolution image URL and thumbnail
  const fullImageUrl = imageUrl?.replace('-thumb.webp', '.webp')
  const thumbnailSrc = imageUrl

  // Prefetch full resolution image on hover
  const prefetchFullImage = () => {
    if (typeof window !== 'undefined' && fullImageUrl) {
      const imgElement = new window.Image()
      imgElement.src = fullImageUrl
    }
  }

  // Detect original image dimensions when possible (only as fallback if no metadata)
  useEffect(() => {
    if (haveDims || (!isVisible && !priority)) return

    if (typeof window !== 'undefined') {
      const imgElement = new window.Image()
      
      imgElement.onload = () => {
        if (imgElement.height > 0) {
          const rawAspectRatio = imgElement.width / imgElement.height
          setOriginalAspect(rawAspectRatio)
          setIsPortrait(rawAspectRatio < 1)
          
          // Apply aspect ratio constraints
          const maxLandscapeRatio = 1.25 // 5:4
          const minPortraitRatio = 0.8 // 4:5
          
          let constrainedRatio = rawAspectRatio
          
          if (rawAspectRatio < minPortraitRatio) {
            constrainedRatio = minPortraitRatio
          } else if (rawAspectRatio > maxLandscapeRatio) {
            constrainedRatio = maxLandscapeRatio
          }
          
          setAspectRatio(`${(1 / constrainedRatio) * 100}%`)
        }
        setImageLoaded(true)
      }
      
      imgElement.onerror = () => {
        setImageLoaded(true)
      }
      
      imgElement.src = imageUrl || "/placeholder.svg"
    }
  }, [imageUrl, isVisible, priority, haveDims])

  const shouldLoad = isVisible || priority || index < 6 // Load first 6 images immediately

  // Optimized sizes for responsive images
  // Gallery cards display at:
  // - Mobile: 100vw (full width)
  // - Tablet: 50vw (2 columns)  
  // - Desktop: ~448px (3 columns with 33vw but max 448px for 1440px screens)
  const thumbnailSizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 448px"
  const fullImageSizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 448px"

  return (
    <motion.div 
      ref={containerRef}
      className="group relative"
      whileHover={{ 
        scale: 0.98,
        transition: { duration: 0.2, ease: "easeInOut" }
      }}
      onHoverStart={prefetchFullImage}
    >
      <Link href={`/gallery/${slug}`} className="block">
        <div className="relative overflow-hidden bg-white">
          {/* Container for the image and border */}
          <div className="relative">
            {/* Border overlay */}
            <div 
              className={`absolute inset-0 z-10 pointer-events-none ${
                (haveDims ? constrained.isPortrait : isPortrait)
                  ? "border-t-4 border-b-4 border-white" 
                  : "border-l-4 border-r-4 border-white"
              }`}
            ></div>
            
            {/* Image container */}
            <div 
              className="relative w-full overflow-hidden" 
              style={
                haveDims
                  // Use aspect-ratio to prevent CLS immediately
                  ? { aspectRatio: `${constrained.w} / ${constrained.h}` }
                  // Fallback if dims not available (rare)
                  : { paddingBottom: aspectRatio }
              }
            >
              <div className="absolute inset-0 w-full h-full">
                {shouldLoad && (
                  <>
                    {!blurComplete && thumbnailSrc && (
                      <Image
                        src={thumbnailSrc}
                        alt={title}
                        fill
                        className={`transition-all duration-700 ease-in-out group-hover:brightness-95 ${
                          (haveDims ? constrained.isPortrait : isPortrait) && 
                          (haveDims ? (width! / height!) < 0.8 : originalAspect < 0.8) ||
                          (!haveDims ? !isPortrait : !constrained.isPortrait) && 
                          (haveDims ? (width! / height!) > 1.25 : originalAspect > 1.25)
                            ? "object-contain" : "object-cover"
                        } object-center ${blurComplete ? 'opacity-0' : 'opacity-100'}`}
                        sizes={thumbnailSizes}
                        quality={20}
                      />
                    )}
                    
                    <Image
                      src={fullImageUrl || "/placeholder.svg"}
                      alt={title}
                      fill
                      className={`transition-all duration-700 ease-in-out group-hover:brightness-95 ${
                        (haveDims ? constrained.isPortrait : isPortrait) && 
                        (haveDims ? (width! / height!) < 0.8 : originalAspect < 0.8) ||
                        (!haveDims ? !isPortrait : !constrained.isPortrait) && 
                        (haveDims ? (width! / height!) > 1.25 : originalAspect > 1.25)
                          ? "object-contain" : "object-cover"
                      } object-center ${blurComplete ? 'opacity-100' : 'opacity-0'}`}
                      sizes={fullImageSizes}
                      priority={priority || index < 3}
                      quality={70}
                      onLoad={() => setBlurComplete(true)}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Status indicators */}
          {locked && (
            <div className="absolute top-3 right-3 flex gap-2 z-20">
              <div className="bg-secondary text-white p-1.5 rounded-full shadow-md">
                <LockIcon className="h-4 w-4" />
              </div>
            </div>
          )}
          
          {/* Title overlay */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10">
            <h3 className="font-space-grotesk text-lg font-medium text-white">{title}</h3>
            <p className="font-ibm-plex text-sm text-white/80 mt-1">{quote}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}<//Users/zhangqiwei/Documents/01_dev-project/portfolio_site/components/gallery-card.tsx>


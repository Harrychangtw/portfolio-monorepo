import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"
import { remark } from "remark"
import html from "remark-html"
import { visit } from "unist-util-visit"
import type { Image as MdastImage, Root, HTML } from "mdast"
import { imageSize } from "image-size"
import { Paper } from "@portfolio/lib/types/paper"

// Re-export Paper type for convenience
export type { Paper } from "@portfolio/lib/types/paper"

// Define the directories
const projectsDirectory = path.join(process.cwd(), "content/projects")
const galleryDirectory = path.join(process.cwd(), "content/gallery")

// Helper function to process image paths
function getThumbnailPath(imagePath: string): string {
  if (!imagePath) return imagePath;
  
  // Ensure leading slash for non-HTTP paths
  if (!imagePath.startsWith('/') && !imagePath.startsWith('http')) {
    imagePath = '/' + imagePath;
  }
  
  // Ensure optimized directory
  if (imagePath.includes('/images/') && !imagePath.includes('/optimized/')) {
    imagePath = imagePath.replace('/images/', '/images/optimized/');
  }
  
  // Normalize extension to .webp
  imagePath = imagePath.replace(/\.(jpe?g|png|webp)$/i, '.webp');
  
  // Ensure thumbnail suffix
  if (!/-thumb\.webp$/i.test(imagePath)) {
    imagePath = imagePath.replace(/\.webp$/i, '-thumb.webp');
  }
  
  return imagePath;
}

// Helper function to get full resolution path
function getFullResolutionPath(imagePath: string): string {
  if (!imagePath) return imagePath;
  
  // Ensure leading slash for non-HTTP paths
  if (!imagePath.startsWith('/') && !imagePath.startsWith('http')) {
    imagePath = '/' + imagePath;
  }
  
  // Ensure optimized directory
  if (imagePath.includes('/images/') && !imagePath.includes('/optimized/')) {
    imagePath = imagePath.replace('/images/', '/images/optimized/');
  }
  
  // Remove -thumb suffix if present
  imagePath = imagePath.replace(/-thumb\.webp$/i, '.webp');
  
  // Normalize extension to .webp
  imagePath = imagePath.replace(/\.(jpe?g|png|webp)$/i, '.webp');
  
  return imagePath;
}

// Helper to map web path -> file on disk, then read dimensions
function getDimsFromWebPath(webPath: string): { width: number; height: number } | null {
  try {
    if (!webPath || webPath.startsWith('http')) return null
    const fullRes = getFullResolutionPath(webPath) // ensures optimized + removes -thumb
    const absPath = path.join(process.cwd(), 'public', fullRes.replace(/^\//, ''))
    if (!fs.existsSync(absPath)) return null
    const buffer = fs.readFileSync(absPath)
    const res = imageSize(buffer)
    if (!res?.width || !res?.height) return null
    return { width: res.width, height: res.height }
  } catch {
    return null
  }
}

export interface ProjectMetadata {
  slug: string
  title: string
  category: string
  subcategory?: string
  description: string
  imageUrl: string
  imageWidth?: number  // Added for CLS prevention
  imageHeight?: number // Added for CLS prevention
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
  width?: number          // Added for build-time dimension detection
  height?: number         // Added for build-time dimension detection
}

// Helper function to parse paper metadata from frontmatter
export function getPaperMetadata(data: any): Paper | null {
  try {
    if (!data.title || !data.authors || !data.date || !data.url) {
      return null;
    }

    return {
      title: data.title,
      authors: Array.isArray(data.authors) ? data.authors : [data.authors],
      date: data.date,
      url: data.url,
      source: "manual" as const
    };
  } catch (error) {
    console.error('Error parsing paper metadata:', error);
    return null;
  }
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
          const dims = getDimsFromWebPath(data.imageUrl)  // ADD: compute once here
          if (dims) {
            data.width = dims.width
            data.height = dims.height
            const ratio = dims.width / dims.height
            data.aspectRatio = Number(ratio.toFixed(4))
            data.aspectType = ratio < 1 ? 'v' : 'h'
          }
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
      
      // Add dimensions for hero image to prevent CLS
      const dims = getDimsFromWebPath(data.imageUrl);
      if (dims) {
        (data as any).imageWidth = dims.width;
        (data as any).imageHeight = dims.height;
      }
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
    
    // Add dimension detection for main image
    if (data.imageUrl) {
      const dims = getDimsFromWebPath(data.imageUrl)
      if (dims) {
        data.width = dims.width
        data.height = dims.height
        const ratio = dims.width / dims.height
        data.aspectRatio = Number(ratio.toFixed(4))
        data.aspectType = ratio < 1 ? 'v' : 'h'
      }
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
          // Don't return anything - visit expects undefined for in-place modifications
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
      if (!parent || index === undefined || index === null) return

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
        
        // Get actual dimensions to prevent CLS
        const dims = getDimsFromWebPath(imageUrl)
        let dimensionAttrs = ''
        
        if (dims) {
          dimensionAttrs = `width="${dims.width}" height="${dims.height}"`
        }
        
        const imageNode: HTML = {
          type: 'html',
          value: `
            <figure class="my-6">
              <img 
                src="${imageUrl}" 
                alt="${alt}" 
                ${dimensionAttrs}
                loading="lazy" 
                decoding="async"
                style="
                  width: 100%;
                  height: auto;
                  display: block;
                  object-fit: contain;
                " 
              />
              ${alt ? `<figcaption class="mt-2 text-sm text-left" style="color: #4F4F4F;">${alt}</figcaption>` : ''}

            </figure>
          `
        }
        parent.children.splice(index, 1, imageNode)
      }
    })
  }
}



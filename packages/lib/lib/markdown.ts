import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"
import { remark } from "remark"
import html from "remark-html"
import { visit } from "unist-util-visit"
import type { Image as MdastImage, Root, HTML, Heading, Text} from "mdast"
import { imageSize } from "image-size"
import { Paper } from "@portfolio/lib/types/paper"

// Re-export Paper type for convenience
export type { Paper } from "@portfolio/lib/types/paper"

// Define the directories
const projectsDirectory = path.join(process.cwd(), "content/projects")
const galleryDirectory = path.join(process.cwd(), "content/gallery")
const postsDirectory = path.join(process.cwd(), "content/posts")

// Helper to generate slug from text
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim()
}

// Remark plugin to add IDs to headings for ToC navigation
function addHeadingIds() {
  return (tree: Root) => {
    const usedIds = new Set<string>()
    
    visit(tree, 'heading', (node: Heading, index, parent) => {
      if (!parent || index === undefined) return
      
      // Extract text content from heading
      let text = ''
      visit(node, 'text', (textNode: Text) => {
        text += textNode.value
      })
      
      if (!text.trim()) return
      
      // Generate unique ID
      let id = slugify(text)
      let counter = 1
      const baseId = id
      while (usedIds.has(id)) {
        id = `${baseId}-${counter}`
        counter++
      }
      usedIds.add(id)
      
      // Add data attribute for ID (will be converted to id in HTML)
      if (!node.data) {
        node.data = {}
      }
      if (!node.data.hProperties) {
        node.data.hProperties = {}
      }
      (node.data.hProperties as Record<string, string>).id = id
    })
  }
}

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

export interface PostMetadata {
  slug: string
  title: string
  description: string
  imageUrl: string
  imageWidth?: number
  imageHeight?: number
  date: string
  author?: string
  tags?: string[]
  featured?: boolean
  pinned?: number
  locked?: boolean
}

export interface SketchMetadata {
  slug: string
  imageUrl: string
  width?: number
  height?: number
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
  if (!fs.existsSync(postsDirectory)) {
    fs.mkdirSync(postsDirectory, { recursive: true })
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

// Get all post files
export function getAllPostSlugs() {
  ensureDirectoriesExist()
  try {
    if (!fs.existsSync(postsDirectory)) {
      return []
    }

    const fileNames = fs.readdirSync(postsDirectory)
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
    console.error("Error reading posts directory:", error)
    return []
  }
}

// Get all projects metadata
export function getAllProjectsMetadata(locale: string = 'en', section?: string): ProjectMetadata[] {
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
        
        const data = matterResult.data as Omit<ProjectMetadata, "slug">;
        
        // Get dimensions from FULL RESOLUTION image BEFORE converting to thumbnail
        if (data.imageUrl) {
          const fullResPath = getFullResolutionPath(data.imageUrl);
          const dims = getDimsFromWebPath(fullResPath);
          if (dims) {
            data.imageWidth = dims.width;
            data.imageHeight = dims.height;
          }
          // Now convert to thumbnail path for card display
          data.imageUrl = getThumbnailPath(data.imageUrl);
        }

        // Combine the data with the slug
        return {
          slug,
          ...data,
        }
      })

    // Filter by section if provided
    let filteredProjects = allProjectsData;
    if (section) {
      filteredProjects = allProjectsData.filter(project => 
        project.category?.toLowerCase() === section.toLowerCase()
      );
    }

    // Sort projects by date
    return filteredProjects.sort((a, b) => {
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
export function getAllGalleryMetadata(locale: string = 'en', section?: string): GalleryItemMetadata[] {
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
        
        const data = matterResult.data as Omit<GalleryItemMetadata, "slug">;
        
        // Get dimensions from FULL RESOLUTION image BEFORE converting to thumbnail
        if (data.imageUrl) {
          const fullResPath = getFullResolutionPath(data.imageUrl);
          const dims = getDimsFromWebPath(fullResPath);
          if (dims) {
            data.width = dims.width;
            data.height = dims.height;
            const ratio = dims.width / dims.height;
            data.aspectRatio = Number(ratio.toFixed(4));
            data.aspectType = ratio < 1 ? 'v' : 'h';
          }
          // Now convert to thumbnail path for card display
          data.imageUrl = getThumbnailPath(data.imageUrl);
        }

        // Combine the data with the slug
        return {
          slug,
          ...data,
        }
      })

    // Filter by section if provided
    let filteredGallery = allGalleryData;
    if (section) {
      filteredGallery = allGalleryData.filter(item => 
        item.description?.toLowerCase().includes(section.toLowerCase())
      );
    }

    // Sort gallery items by date
    return filteredGallery.sort((a, b) => {
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

// Get all sketches metadata - scans optimized images folder directly
export function getAllSketchesMetadata(locale: string = 'en'): SketchMetadata[] {
  try {
    // Look in the optimized sketches directory
    const optimizedSketchesDir = path.join(process.cwd(), 'public', 'images', 'optimized', 'sketches')
    
    if (!fs.existsSync(optimizedSketchesDir)) {
      return []
    }

    const fileNames = fs.readdirSync(optimizedSketchesDir)
    
    // Filter for full-size webp images (not thumbnails)
    const sketchFiles = fileNames.filter(fileName => 
      fileName.endsWith('.webp') && !fileName.includes('-thumb')
    )
    
    const allSketchesData = sketchFiles.map((fileName) => {
      // Remove ".webp" to get slug
      const slug = fileName.replace(/\.webp$/, "")
      
      // Build the thumbnail path
      const thumbnailUrl = `/images/optimized/sketches/${fileName.replace('.webp', '-thumb.webp')}`
      
      // Get dimensions from the thumbnail file
      const dims = getDimsFromWebPath(thumbnailUrl)
      
      return {
        slug,
        imageUrl: thumbnailUrl,
        width: dims?.width,
        height: dims?.height,
      }
    })

    // Sort sketches by filename (alphabetical)
    return allSketchesData.sort((a, b) => a.slug.localeCompare(b.slug))
  } catch (error) {
    console.error("Error getting sketches metadata:", error)
    return []
  }
}

// Get all posts metadata
export function getAllPostsMetadata(locale: string = 'en'): PostMetadata[] {
  ensureDirectoriesExist()
  try {
    if (!fs.existsSync(postsDirectory)) {
      return []
    }

    let fileNames = fs.readdirSync(postsDirectory)

    // Filter files based on locale to show only one version
    fileNames = fileNames.filter(fileName => {
      if (locale === 'zh-TW') {
        if (fileName.includes('_zh-tw')) {
          return true
        }
        const baseName = fileName.replace('.md', '')
        const chineseVersion = `${baseName}_zh-tw.md`
        return !fs.existsSync(path.join(postsDirectory, chineseVersion)) && !fileName.includes('_')
      } else {
        return !fileName.includes('_zh-tw') && !fileName.includes('_zh-TW')
      }
    })

    const allPostsData = fileNames
      .filter(fileName => fileName.endsWith('.md'))
      .map((fileName) => {
        const slug = fileName.replace(/\.md$/, "")
        const fullPath = path.join(postsDirectory, fileName)
        const fileContents = fs.readFileSync(fullPath, "utf8")
        const matterResult = matter(fileContents)

        const data = matterResult.data as Omit<PostMetadata, "slug">;
        
        // Get dimensions from FULL RESOLUTION image BEFORE converting to thumbnail
        if (data.imageUrl) {
          const fullResPath = getFullResolutionPath(data.imageUrl);
          const dims = getDimsFromWebPath(fullResPath);
          if (dims) {
            data.imageWidth = dims.width;
            data.imageHeight = dims.height;
          }
          // Now convert to thumbnail path for card display
          data.imageUrl = getThumbnailPath(data.imageUrl);
        }

        return {
          slug,
          ...data,
        }
      })

    // Sort posts: pinned first, then by date
    return allPostsData.sort((a, b) => {
      if (typeof a.pinned === 'number' && a.pinned >= 0 && (typeof b.pinned !== 'number' || b.pinned < 0)) {
        return -1;
      }
      if ((typeof a.pinned !== 'number' || a.pinned < 0) && typeof b.pinned === 'number' && b.pinned >= 0) {
        return 1;
      }
      if (typeof a.pinned === 'number' && typeof b.pinned === 'number' && a.pinned >= 0 && b.pinned >= 0) {
        return a.pinned - b.pinned;
      }

      if (a.date < b.date) {
        return 1
      } else {
        return -1
      }
    })
  } catch (error) {
    console.error("Error getting posts metadata:", error)
    return []
  }
}

// Get latest posts for homepage
export function getLatestPosts(locale: string = 'en', count: number = 3): PostMetadata[] {
  const allPosts = getAllPostsMetadata(locale)
  return allPosts.slice(0, count)
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
      .use(addHeadingIds)
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
        data.imageWidth = dims.width;
        data.imageHeight = dims.height;
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
    
    // Ensure the main imageUrl uses full resolution for individual item pages
    if (data.imageUrl) {
      data.imageUrl = getFullResolutionPath(data.imageUrl);
      
      // Add dimension detection for main image
      const dims = getDimsFromWebPath(data.imageUrl);
      if (dims) {
        data.width = dims.width;
        data.height = dims.height;
        const ratio = dims.width / dims.height;
        data.aspectRatio = Number(ratio.toFixed(4));
        data.aspectType = ratio < 1 ? 'v' : 'h';
      }
    }
    
        // Process gallery images to include thumbnailUrl, dimensions, and ensure consistent URL format
    if (data.gallery && Array.isArray(data.gallery)) {
      data.gallery = data.gallery.map(image => {
        // Add leading slash if it's a relative path and doesn't start with http(s)
        if (image.url && !image.url.startsWith('/') && !image.url.startsWith('http')) {
          image.url = '/' + image.url;
        }
        
        // Detect dimensions for gallery images (same as markdown images via transformMedia)
        const fullResUrl = getFullResolutionPath(image.url);
        const dims = getDimsFromWebPath(fullResUrl);
        if (dims) {
          image.width = dims.width;
          image.height = dims.height;
          image.aspectRatio = Number((dims.width / dims.height).toFixed(4));
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

// Get post data by slug
export async function getPostData(slug: string) {
  ensureDirectoriesExist()
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`)

    if (!fs.existsSync(fullPath)) {
      return null
    }

    const fileContents = fs.readFileSync(fullPath, "utf8")
    const matterResult = matter(fileContents)

    const processedContent = await remark()
      .use(addHeadingIds)
      .use(transformMedia)
      .use(html, { sanitize: false })
      .process(matterResult.content);
    const contentHtml = processedContent.toString()

    const data = matterResult.data as Omit<PostMetadata, "slug">;

    if (data.imageUrl) {
      data.imageUrl = getFullResolutionPath(data.imageUrl);

      const dims = getDimsFromWebPath(data.imageUrl);
      if (dims) {
        (data as any).imageWidth = dims.width;
        (data as any).imageHeight = dims.height;
      }
    }

    return {
      slug,
      contentHtml,
      ...data,
    }
  } catch (error) {
    console.error(`Error getting post data for slug ${slug}:`, error)
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

// Save a new blog post
export function savePost(slug: string, data: Omit<PostMetadata, "slug">, content: string) {
  ensureDirectoriesExist()
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`)
    const fileContent = matter.stringify(content, data)
    fs.writeFileSync(fullPath, fileContent)
    return true
  } catch (error) {
    console.error(`Error saving post ${slug}:`, error)
    return false
  }
}


// Helper to find the next unlocked project
export async function getNextProject(currentSlug: string) {
  ensureDirectoriesExist()
  
  // Determine locale from slug
  const locale = currentSlug.includes('_zh-tw') ? 'zh-TW' : 'en'
  const allProjects = getAllProjectsMetadata(locale)
  
  if (allProjects.length === 0) return null

  const currentIndex = allProjects.findIndex(p => p.slug

 === currentSlug)
  if (currentIndex === -1) return null

  // Find next unlocked project (circular navigation)
  let nextIndex = (currentIndex + 1) % allProjects.length
  let attempts = 0
  
  while (attempts < allProjects.length) {
    const candidate = allProjects[nextIndex]
    
    // Check if not locked and not the current one (in case only 1 exists)
    if (!candidate.locked && candidate.slug !== currentSlug) {
      // Get full data for the candidate (mainly to ensure we have valid paths)
      // We only need basic metadata, so existing metadata is fine, 
      // but let's ensure image is optimized thumbnail
      return {
        slug: candidate.slug,
        title: candidate.title,
        category: candidate.category,
        imageUrl: candidate.imageUrl, // Already thumbnail from getAllProjectsMetadata
        aspectRatio: 1.5 // Projects are always 3:2 by design
      }
    }
    
    nextIndex = (nextIndex + 1) % allProjects.length
    attempts++
  }

  return null
}

// Helper to find the next unlocked gallery item
export async function getNextGalleryItem(currentSlug: string) {
  ensureDirectoriesExist()
  
  const locale = currentSlug.includes('_zh-tw') ? 'zh-TW' : 'en'
  const allItems = getAllGalleryMetadata(locale)
  
  if (allItems.length === 0) return null

  const currentIndex = allItems.findIndex(p => p.slug === currentSlug)
  if (currentIndex === -1) return null

  // Find next unlocked item (circular)
  let nextIndex = (currentIndex + 1) % allItems.length
  let attempts = 0
  
  while (attempts < allItems.length) {
    const candidate = allItems[nextIndex]
    
    if (!candidate.locked && candidate.slug !== currentSlug) {
      return {
        slug: candidate.slug,
        title: candidate.title,
        category: candidate.quote, // Use quote as category subtitle for gallery
        imageUrl: candidate.imageUrl,
        aspectRatio: candidate.aspectRatio // Include aspect ratio for gallery items
      }
    }
    
    nextIndex = (nextIndex + 1) % allItems.length
    attempts++
  }

  return null
}

// Helper to find the next unlocked post
export async function getNextPost(currentSlug: string) {
  ensureDirectoriesExist()

  const locale = currentSlug.includes('_zh-tw') ? 'zh-TW' : 'en'
  const allPosts = getAllPostsMetadata(locale)

  if (allPosts.length === 0) return null

  const currentIndex = allPosts.findIndex(p => p.slug === currentSlug)
  if (currentIndex === -1) return null

  let nextIndex = (currentIndex + 1) % allPosts.length
  let attempts = 0

  while (attempts < allPosts.length) {
    const candidate = allPosts[nextIndex]

    // Evaluate against the post's standard release date
    const isUnlocked = !candidate.locked || (candidate.locked && new Date(candidate.date).getTime() <= Date.now());

    if (candidate.slug !== currentSlug && isUnlocked) {
      return {
        slug: candidate.slug,
        title: candidate.title,
        category: candidate.description,
        imageUrl: candidate.imageUrl,
        aspectRatio: 1.5
      }
    }

    nextIndex = (nextIndex + 1) % allPosts.length
    attempts++
  }

  return null
}


function transformMedia() {
  return (tree: Root) => {
    visit(tree, 'image', (node: MdastImage, index, parent) => {
      if (!parent || index === undefined || index === null) return

      const url = node.url
      let alt = node.alt || ''
      let isFramed = false

      if (alt.toLowerCase().startsWith('framed:')) {
        isFramed = true
        alt = alt.replace(/^framed:\s*/i, '')
      } else if (alt.toLowerCase().endsWith(':framed')) {
        isFramed = true
        alt = alt.replace(/\s*:framed$/i, '')
      }

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
            <figure class="my-6 w-full">
              <div class="video-embed-container" data-type="googledrive" data-src="${embedUrl}">
                <div class="video-placeholder">
                  <div class="video-placeholder-content">
                    <div class="video-placeholder-icon">▶</div>
                    <p class="video-placeholder-text">Google Drive Video</p>
                  </div>
                </div>
              </div>
              ${
                alt
                  ? `<figcaption class="-mt-4 text-sm text-left" style="color: hsl(var(--secondary)); font-family: var(--font-body);">${alt}</figcaption>`
                  : ""
              }
            </figure>
          `
        }
        parent.children.splice(index, 1, videoNode)
      } else if (youtubeMatch) {
        const videoId = youtubeMatch[1] || youtubeMatch[2] // Handle both match groups
        const embedUrl = `https://www.youtube.com/embed/${videoId}`
        
        const videoNode: HTML = {
          type: 'html',
          value: `
            <figure class="my-6 w-full">
              <div class="video-embed-container" data-type="youtube" data-src="${embedUrl}">
                <div class="video-placeholder">
                </div>
              </div>
              ${
                alt
                  ? `<figcaption class="-mt-4 text-sm text-left" style="color: hsl(var(--secondary)); font-family: var(--font-body);">${alt}</figcaption>`
                  : ""
              }
            </figure>
          `
        }
        parent.children.splice(index, 1, videoNode)
      } else if (url.toLowerCase().endsWith('.mp4')) {
        // Handle local MP4 videos - treat as looping video clips
        const videoUrl = getFullResolutionPath(url)
        
        // Default to 16:9 (1.7778) aspect ratio for videos
        const aspectRatio = "1.7778"
        
        const escapeAttr = (value: string) =>
          value
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
        
        const videoNode: HTML = {
          type: "html",
          value: `
            <figure class="my-6 w-full">
              <div
                class="markdown-image-placeholder"
                data-src="${escapeAttr(videoUrl)}"
                data-aspect-ratio="${aspectRatio}"
                data-framed="${isFramed}"
                data-alt="${escapeAttr(alt)}"
                data-video="true"
              ></div>
              ${
                alt
                  ? `<figcaption class="mt-2 text-sm text-left" style="color: hsl(var(--secondary)); font-family: var(--font-body);">${alt}</figcaption>`
                  : ""
              }
            </figure>
          `,
        }
        parent.children.splice(index, 1, videoNode)
      } else {
        // Regular image inside markdown.
        // Emit a lightweight placeholder that will be hydrated on the client
        // with the shared <ImageContainer> for progressive loading.
        const imageUrl = getFullResolutionPath(url)
        const dims = getDimsFromWebPath(imageUrl)
        const aspectRatio =
          dims && dims.width && dims.height
            ? (dims.width / dims.height).toFixed(4)
            : ""

        const escapeAttr = (value: string) =>
          value
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")

        const placeholderNode: HTML = {
          type: "html",
          value: `
            <figure class="my-6 w-full">
              <div
                class="markdown-image-placeholder"
                data-src="${escapeAttr(imageUrl)}"
                data-aspect-ratio="${aspectRatio}"
                data-framed="${isFramed}"
                data-alt="${escapeAttr(alt)}"
              ></div>
              ${
                alt
                  ? `<figcaption class="mt-2 text-sm text-left" style="color: hsl(var(--secondary)); font-family: var(--font-body);">${alt}</figcaption>`
                  : ""
              }
            </figure>
          `,
        }
        parent.children.splice(index, 1, placeholderNode)
      }
    })
  }
}



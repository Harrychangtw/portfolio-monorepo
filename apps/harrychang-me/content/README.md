pr# Markdown-Based Content Management System

This portfolio site uses a simple yet powerful markdown-based content management system. This document provides instructions for adding and editing content.

## Directory Structure

- `/content/projects/`: Contains markdown files for project entries
- `/content/gallery/`: Contains markdown files for photo gallery entries
- `/content/templates/`: Contains template files you can copy to create new entries
- `/public/images/projects/`: Directory for project images
- `/public/images/gallery/`: Directory for gallery images

## Adding New Content

### Projects

1. Create a new markdown file in `/content/projects/` with a slug-formatted filename (e.g., `my-project.md`)
2. Copy the structure from `/content/templates/project-template.md`
3. Fill in the front matter (the YAML section between the `---` markers)
4. Write your content in markdown format below the front matter
5. Store your images in `/public/images/projects/your-project-slug/`
6. Reference images using paths like `/images/projects/your-project-slug/image.jpg`

### Gallery Entries

1. Create a new markdown file in `/content/gallery/` with a slug-formatted filename (e.g., `photo-collection.md`)
2. Copy the structure from `/content/templates/gallery-template.md`
3. Fill in the front matter (the YAML section between the `---` markers)
4. Include information about each photo in the `gallery` array in the front matter
5. Write your content in markdown format below the front matter
6. Store your images in `/public/images/gallery/your-gallery-slug/`
7. Reference images using paths like `/images/gallery/your-gallery-slug/image.jpg`

## Front Matter Guidelines

### Required Project Fields

- `title`: The title of your project
- `category`: Main category for the project
- `description`: A short description (1-2 sentences)
- `imageUrl`: Path to the main/cover image
- `year`: Year the project was completed
- `date`: ISO format date (YYYY-MM-DD) for sorting purposes

### Optional Project Fields

- `subcategory`: A more specific category if needed
- `role`: Your role in the project
- `technologies`: Array of technologies used
- `client`: Client name
- `website`: Project website URL
- `featured`: Set to `true` to highlight on the home page

### Required Gallery Fields

- `title`: The title of your gallery entry
- `description`: A short description (1-2 sentences) 
- `imageUrl`: Path to the main/cover image
- `quote`: A short quote that appears on hover in the gallery grid
- `date`: ISO format date (YYYY-MM-DD) for sorting purposes

### Optional Gallery Fields

- `camera`: Camera model used
- `lens`: Lens used
- `location`: Where the photos were taken
- `tags`: Array of tags for categorization
- `featured`: Set to `true` to highlight on the home page
- `gallery`: Array of additional images with details (see template)

## Image Optimization Guidelines

### Project Images

- **Cover Images**: 1200×800px, JPG format, 75% quality
- **Content Images**: Maximum 1500px width, JPG format, 80% quality
- **File Size**: Keep under 200KB when possible

### Gallery Images

- **Cover Images**: 1200×1200px (square), JPG format, 80% quality
- **Gallery Images**: Maximum 2000px on longest side, JPG format, 85% quality
- **Portrait Photos**: 1080×1620px (2:3 ratio)
- **Landscape Photos**: 1620×1080px (3:2 ratio)
- **File Size**: Keep under 500KB for optimal performance

## Automated Image Optimization

This project includes an image optimization script that automatically processes and optimizes your images according to the guidelines above. To use it:

1. Place your original images in the appropriate folders:
   - Project images: `/public/images/projects/your-project-slug/`
   - Gallery images: `/public/images/gallery/your-gallery-slug/`

2. Run the optimization script:
   ```bash
   npm run optimize-images
   ```

3. The script will:
   - Create optimized WebP versions of your images
   - Resize them according to our guidelines
   - Place optimized versions in `/public/images/optimized/`

4. After optimization, update your markdown files to reference the optimized images:
   - For projects: `/images/optimized/projects/your-project-slug/image.webp`
   - For gallery: `/images/optimized/gallery/your-gallery-slug/image.webp`

This ensures consistent image quality and optimal performance across the site.

## Markdown Tips

- Use `##` for section headers (H2)
- Use `###` for sub-section headers (H3)
- Use `![Alt text](/path/to/image.jpg)` to embed images
- Use `[Link text](https://example.com)` for links
- Use `**bold**` for bold text
- Use `*italic*` for italic text
- Use ordered lists with `1.`, `2.`, etc.
- Use unordered lists with `-` or `*`

## Deploying Changes

After adding or editing content:

1. Optimize your images using the script: `npm run optimize-images`
2. Commit and push your changes to the repository
3. The site will automatically rebuild and deploy with your new content

## Image Handling Recommendations

1. Optimize your images before uploading using tools like [ImageOptim](https://imageoptim.com/) or [Squoosh](https://squoosh.app/)
2. Maintain consistent aspect ratios for similar types of content
3. Consider using WebP format for better compression (our optimization script handles this automatically)
4. For gallery collections, ensure a cohesive visual style among images
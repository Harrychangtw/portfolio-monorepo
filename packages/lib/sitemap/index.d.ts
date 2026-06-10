export interface ContentEntry {
  slug: string;
  date: string | null;
}

export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
  alternates?: Record<string, string>;
}

export interface BuildLocalizedContentUrlsOptions {
  domain: string;
  basePath: string;
  entries: ContentEntry[];
  priority: number;
  changefreq?: string;
}

export function formatDate(date?: string | Date | null): string;
export function getMarkdownEntries(contentPath: string): ContentEntry[];
export function buildLocalizedContentUrls(
  options: BuildLocalizedContentUrlsOptions,
): SitemapUrl[];
export function buildSitemapXML(urls: SitemapUrl[]): string;
export function writeSitemap(outputPath: string, urls: SitemapUrl[]): string;

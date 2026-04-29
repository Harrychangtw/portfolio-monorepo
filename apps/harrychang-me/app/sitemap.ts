import { MetadataRoute } from "next";
import { headers } from "next/headers";
import {
  getAllProjectSlugs,
  getProjectData,
  getAllGallerySlugs,
  getGalleryItemData,
  getAllPostSlugs,
  getPostData,
} from "@portfolio/lib/lib/markdown";

const baseUrl = "https://www.harrychang.me";

const buildAlternates = (
  enUrl: string,
  zhUrl?: string,
): MetadataRoute.Sitemap[number]["alternates"] => ({
  languages: {
    "x-default": enUrl,
    en: enUrl,
    ...(zhUrl ? { "zh-TW": zhUrl } : {}),
  },
});

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headersList = await headers();
  const host = headersList.get("host") || "www.harrychang.me";
  const isLab = host.includes("lab.harrychang.me");

  if (isLab) {
    return [
      {
        url: "https://lab.harrychang.me",
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 1.0,
      },
    ];
  }

  const sitemap: MetadataRoute.Sitemap = [];

  const staticPages = [
    "",
    "/projects",
    "/gallery",
    "/blog",
    "/paper-reading",
    "/manifesto",
    "/uses",
    "/design",
    "/linktree",
  ];

  staticPages.forEach((page) => {
    const url = `${baseUrl}${page}`;
    sitemap.push({
      url,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: page === "" ? 1.0 : 0.8,
      alternates: buildAlternates(url),
    });
  });

  const projectSlugs = getAllProjectSlugs();
  for (const { params } of projectSlugs) {
    const slug = params.slug;
    if (slug.includes("_zh-tw") || slug.includes("_zh-TW")) continue;

    const projectData = await getProjectData(slug);
    const hasChineseVersion = projectSlugs.some(
      ({ params }) =>
        params.slug === `${slug}_zh-tw` || params.slug === `${slug}_zh-TW`,
    );
    const enUrl = `${baseUrl}/projects/${slug}`;
    const zhUrl = hasChineseVersion
      ? `${baseUrl}/projects/${slug}_zh-tw`
      : undefined;
    const lastModified = projectData?.date ? new Date(projectData.date) : new Date();

    sitemap.push({
      url: enUrl,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: buildAlternates(enUrl, zhUrl),
    });

    if (zhUrl) {
      sitemap.push({
        url: zhUrl,
        lastModified,
        changeFrequency: "monthly",
        priority: 0.7,
        alternates: buildAlternates(enUrl, zhUrl),
      });
    }
  }

  const gallerySlugs = getAllGallerySlugs();
  for (const { params } of gallerySlugs) {
    const slug = params.slug;
    if (slug.includes("_zh-tw") || slug.includes("_zh-TW")) continue;

    const galleryData = await getGalleryItemData(slug);
    const hasChineseVersion = gallerySlugs.some(
      ({ params }) =>
        params.slug === `${slug}_zh-tw` || params.slug === `${slug}_zh-TW`,
    );
    const enUrl = `${baseUrl}/gallery/${slug}`;
    const zhUrl = hasChineseVersion
      ? `${baseUrl}/gallery/${slug}_zh-tw`
      : undefined;
    const lastModified = galleryData?.date ? new Date(galleryData.date) : new Date();

    sitemap.push({
      url: enUrl,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: buildAlternates(enUrl, zhUrl),
    });

    if (zhUrl) {
      sitemap.push({
        url: zhUrl,
        lastModified,
        changeFrequency: "monthly",
        priority: 0.6,
        alternates: buildAlternates(enUrl, zhUrl),
      });
    }
  }

  const postSlugs = getAllPostSlugs();
  for (const { params } of postSlugs) {
    const slug = params.slug;
    if (slug.includes("_zh-tw") || slug.includes("_zh-TW")) continue;

    const postData = await getPostData(slug);
    const hasChineseVersion = postSlugs.some(
      ({ params }) =>
        params.slug === `${slug}_zh-tw` || params.slug === `${slug}_zh-TW`,
    );
    const enUrl = `${baseUrl}/blog/${slug}`;
    const zhUrl = hasChineseVersion
      ? `${baseUrl}/blog/${slug}_zh-tw`
      : undefined;
    const lastModified = postData?.date ? new Date(postData.date) : new Date();

    sitemap.push({
      url: enUrl,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: buildAlternates(enUrl, zhUrl),
    });

    if (zhUrl) {
      sitemap.push({
        url: zhUrl,
        lastModified,
        changeFrequency: "monthly",
        priority: 0.7,
        alternates: buildAlternates(enUrl, zhUrl),
      });
    }
  }

  return sitemap;
}

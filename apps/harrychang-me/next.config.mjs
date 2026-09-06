import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Outbound social/profile redirects, kept in sync with config/site.ts.
// Defined here (not in middleware) so Vercel serves them as 308s straight
// from the CDN edge — no function invocation, no middleware traversal.
// TODO: codegen from config/site.ts to prevent drift
const SOCIAL_REDIRECTS = [
  ['/github', 'https://github.com/Harrychangtw'],
  ['/readme', 'https://github.com/Harrychangtw/portfolio-monorepo/tree/main/apps/harrychang-me'],
  ['/issues', 'https://github.com/Harrychangtw/portfolio-monorepo/issues/new/choose'],
  ['/linkedin', 'https://www.linkedin.com/in/chi-wei-chang-928408375/'],
  ['/instagram', 'https://www.instagram.com/pomelo_chang_08/'],
  ['/spotify', 'https://open.spotify.com/user/1b7kc6j0zerk49mrv80pwdd96?si=7d5a6e1a4fa34de3'],
  ['/discord', 'https://discord.com/users/836567989209661481'],
  ['/letterboxd', 'https://boxd.it/fSKuF'],
  ['/medium', 'https://medium.com/@chiwei_chang'],
  ['/telegram', 'https://t.me/harrychangtw'],
  // /meet is the booking link (Notion Calendar scheduling).
  // /cal is NOT here -- it is a real page at app/(main)/cal.
  ['/meet', 'https://calendar.notion.so/meet/harry-chang/vklb2nd7'],
  ['/email', 'mailto:chiwei@harrychang.me'],
]

// Marp decks shipped as static bundles under public/slides/<slug>/. Listed
// here so each one gets a pretty URL (with and without trailing slash) that
// resolves to its index.html. Asset refs inside a bundle are absolute
// (`/slides/<slug>/assets/...`, set by its build-web.mjs --base flag), so
// neither form breaks. Adding a deck = drop the bundle in and add its slug.
const SLIDE_DECKS = [
  'sitcon-camp-26-ml-course2',
  'xingan-26-alumni-talk',
]

// /talk — one stable URL for whatever I am speaking about right now, handed
// out on stage and in QR codes. Repoint it at the next deck's slug when the
// next talk lands; it stays a 307 rather than a 308 precisely because it
// moves, since a permanent redirect would stick in the browser cache of
// everyone who opened it during the previous talk.
const CURRENT_TALK = '/slides/xingan-26-alumni-talk'

// Conventional short paths people try by hand or paste into a reader. The
// feeds themselves are static files in public/, written by
// scripts/generate-feeds.mjs.
const FEED_REDIRECTS = [
  ['/rss', '/feed.xml'],
  ['/feed', '/feed.xml'],
  ['/rss.xml', '/feed.xml'],
  ['/feed/zh-tw', '/feed-zh-tw.xml'],
]

let userConfig = undefined


/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin file-tracing root to the monorepo so Next bundles content/** into
  // the serverless function regardless of workspace auto-detection.
  outputFileTracingRoot: path.join(__dirname, '../..'),
  outputFileTracingIncludes: {
    '/projects/**': ['./content/**/*'],
    '/gallery/**': ['./content/**/*'],
    '/blog/**': ['./content/**/*'],
    '/api/**/*': ['./content/**/*'],
  },
  images: {
    contentDispositionType: 'attachment',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.scdn.co',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        pathname: '/vi/**',   // optional but more restrictive/safer
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
          },
        ],
      },
      {
        // Ensure lab subdomain pages are properly indexed
        source: '/lab/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
          },
        ],
      },
      {
        // Ensure robots.txt and sitemap.xml are properly served
        source: '/robots.txt',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/plain',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, must-revalidate',
          },
        ],
      },
      {
        source: '/sitemap.xml',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/xml',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, must-revalidate',
          },
        ],
      },
      {
        // Static file serving would label these `application/xml`, which some
        // readers accept grudgingly; name the feed type outright. An hour of
        // caching also stops pollers from revalidating on every check.
        source: '/:feed(feed|feed-zh-tw).xml',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/rss+xml; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, must-revalidate',
          },
        ],
      },
      {
        // Pre-built optimized images at fixed paths. URL must change if
        // contents change (e.g. rename the file or add a version suffix)
        // since `immutable` tells browsers never to revalidate.
        source: '/images/optimized/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Favicon/icon/manifest assets: stable filenames, rarely change.
      // Browser-cache aggressively to keep returning-visitor traffic off
      // the Edge Request meter. Bump filenames to bust if ever swapped.
      ...[
        '/favicon.ico',
        '/apple-icon.png',
        '/chinese_name_icon.png',
        '/site.webmanifest',
      ].map((source) => ({
        source,
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      })),
    ]
  },
  async redirects() {
    return [
      ...SOCIAL_REDIRECTS.map(([source, destination]) => ({
        source,
        destination,
        permanent: true,
      })),
      ...FEED_REDIRECTS.map(([source, destination]) => ({
        source,
        destination,
        permanent: true,
      })),
      { source: '/talk', destination: CURRENT_TALK, permanent: false },
    ]
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
  // Keep public/images/** out of serverless function bundles. The CDN serves
  // these as static assets; runtime code reads dimensions from
  // content/generated/image-dims.json instead of the binaries themselves.
  outputFileTracingExcludes: {
    '*': ['public/images/**'],
  },
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      // Marp slide decks: pretty URL -> the static bundle's index.html. See
      // SLIDE_DECKS above, and slides/marp in each deck's own repo.
      ...SLIDE_DECKS.flatMap((slug) => [
        {
          source: `/slides/${slug}`,
          destination: `/slides/${slug}/index.html`,
        },
        {
          source: `/slides/${slug}/`,
          destination: `/slides/${slug}/index.html`,
        },
      ]),
      {
        source: '/ingest/static/:path*',
        destination: 'https://us-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ingest/decide',
        destination: 'https://us.i.posthog.com/decide',
      },
      {
        source: '/ingest/:path*',
        destination: 'https://us.i.posthog.com/:path*',
      },
    ]
  },
}

if (userConfig) {
  // ESM imports will have a "default" property
  const config = userConfig.default || userConfig

  for (const key in config) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...config[key],
      }
    } else {
      nextConfig[key] = config[key]
    }
  }
}

export default nextConfig

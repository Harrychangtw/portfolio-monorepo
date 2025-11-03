import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  const hostname = request.headers.get('host') || ''
  
  // Check if this is a Vercel preview deployment
  const isVercelPreview = hostname.includes('.vercel.app')
  
  // For Vercel preview deployments, allow direct access to /studio routes
  // This enables testing studio functionality on preview URLs like:
  // https://your-project-git-branch-username.vercel.app/studio
  if (isVercelPreview) {
    return NextResponse.next()
  }
  
  // Handle studio subdomain (only for production/localhost)
  const isStudio = 
    hostname.includes('studio.harrychang.me') || 
    hostname.includes('studio.localhost')
  
  // Paths that should NOT be rewritten (shared resources)
  const sharedPaths = [
    '/api/',           // API routes are shared
    '/locales/',       // Translation files are shared
    '/images/',        // Images are shared
    '/_next/',         // Next.js internals
    '/favicon.ico',
    '/googleb0d95f7ad2ffc31f.html'
  ]
  
  const isSharedPath = sharedPaths.some(path => url.pathname.startsWith(path))
  
  if (isStudio && !url.pathname.startsWith('/studio') && !isSharedPath) {
    // Rewrite to studio routes (only for page routes)
    url.pathname = `/studio${url.pathname}`
    return NextResponse.rewrite(url)
  }
  
  // Prevent accessing studio routes from main domain in production
  if (!isStudio && url.pathname.startsWith('/studio')) {
    url.pathname = '/'
    return NextResponse.redirect(url)
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|fonts).*)',
  ],
}

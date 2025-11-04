import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  const hostname = request.headers.get('host') || ''
  
  // Check if this is a Vercel preview deployment
  const isVercelPreview = hostname.includes('.vercel.app')
  
  // For Vercel preview deployments, allow direct access to /lab routes
  // This enables testing lab functionality on preview URLs like:
  // https://your-project-git-branch-username.vercel.app/lab
  if (isVercelPreview) {
    return NextResponse.next()
  }
  
  // Handle lab subdomain (only for production/localhost)
  const isLab = 
    hostname.includes('lab.harrychang.me') || 
    hostname.includes('lab.localhost')
  
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
  
  if (isLab && !url.pathname.startsWith('/lab') && !isSharedPath) {
    // Rewrite to lab routes (only for page routes)
    url.pathname = `/lab${url.pathname}`
    return NextResponse.rewrite(url)
  }
  
  // Prevent accessing lab routes from main domain in production
  if (!isLab && url.pathname.startsWith('/lab')) {
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

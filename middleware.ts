import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  const hostname = request.headers.get('host') || ''
  
  // Handle studio subdomain
  const isStudio = hostname.includes('studio.harrychang.me') || 
                   hostname.includes('studio.localhost')
  
  if (isStudio && !url.pathname.startsWith('/studio')) {
    // Rewrite to studio routes
    url.pathname = `/studio${url.pathname}`
    return NextResponse.rewrite(url)
  }
  
  // Prevent accessing studio routes from main domain
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

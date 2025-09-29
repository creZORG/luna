

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This middleware distinguishes between the main marketing site and staff portals.
// It redirects staff portal paths from the main domain to prevent access.
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host");

  if (!hostname) {
    return new Response(null, { status: 400, statusText: "No hostname found in request headers" });
  }

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'luna.co.ke';
  const isMainDomain = hostname === rootDomain || hostname === `www.${rootDomain}`;
  
  const portalPaths = [
    '/admin', '/sales', '/operations', '/finance', 
    '/manufacturing', '/digital-marketing', '/campaigns'
  ];

  // If on the main marketing domain, block access to any staff portal paths.
  if (isMainDomain) {
      const isPortalPath = portalPaths.some(p => pathname.startsWith(p));
      if (isPortalPath) {
          url.pathname = '/access-denied';
          return NextResponse.rewrite(url);
      }
  }

  // Allow all other requests to proceed. Client-side logic in AuthProvider
  // will handle routing within the staff portals.
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

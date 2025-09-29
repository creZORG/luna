
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
  const staffDomain = `staff.${rootDomain}`;
  const isMainDomain = hostname === rootDomain || hostname === `www.${rootDomain}`;
  const isStaffDomain = hostname === staffDomain;
  
  // These paths are for internal staff and should be blocked on the main domain.
  // Paths for external partners (like /campaigns, /profile) are excluded from this list.
  const internalPortalPaths = [
    '/admin', '/sales', '/operations', '/finance', 
    '/manufacturing', '/digital-marketing'
  ];

  // If on the main marketing domain, block access to any internal staff portal paths.
  if (isMainDomain) {
      const isInternalPath = internalPortalPaths.some(p => pathname.startsWith(p));
      if (isInternalPath) {
          url.pathname = '/access-denied';
          return NextResponse.rewrite(url);
      }
  }

  // If on the staff domain and at the root, redirect to a default dashboard.
  // The client-side AuthProvider will then route them to their specific portal.
  if (isStaffDomain && pathname === '/') {
      url.pathname = '/admin/dashboard';
      return NextResponse.redirect(url);
  }
  
  // If someone tries to access the old digital-marketing path, redirect them to campaigns
  if (pathname.startsWith('/digital-marketing')) {
      url.pathname = '/campaigns';
      return NextResponse.redirect(url);
  }

  // Allow all other requests to proceed. Client-side logic in AuthProvider
  // will handle routing within the staff portals or main site.
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

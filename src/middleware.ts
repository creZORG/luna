
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host");

  if (!hostname) {
    return new Response(null, { status: 400, statusText: "No hostname found in request headers" });
  }

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'luna.co.ke';
  const isMainDomain = hostname === rootDomain || hostname === `www.${rootDomain}`;

  const portalMap: { [key: string]: string } = {
    staff: '/admin',
    admin: '/admin',
    finance: '/finance',
    manufacturing: '/manufacturing',
    sales: '/sales',
    operations: '/operations',
    'digital-marketing': '/digital-marketing',
  };

  const currentHost = hostname.split('.')[0];
  const portalPath = portalMap[currentHost];

  // If on a portal subdomain
  if (portalPath) {
    // Allow auth pages and root to be accessed directly without rewrite.
    // The client-side AuthProvider will handle redirection from root.
    const isExemptedPath = pathname === '/' || pathname.startsWith('/login') || pathname.startsWith('/verify-email') || pathname.startsWith('/access-denied');
    if (isExemptedPath) {
      return NextResponse.next();
    }
    
    // If the path already starts with the correct portal path, do nothing.
    if (pathname.startsWith(portalPath)) {
      return NextResponse.next();
    }

    // Rewrite other paths to include the portal prefix.
    // e.g., on operations.luna.co.ke, `/products` becomes `/operations/products`.
    url.pathname = `${portalPath}${pathname}`;
    return NextResponse.rewrite(url);

  } 
  // If on the main domain, block access to all portal paths.
  else if (isMainDomain) {
      const isPortalPath = Object.values(portalMap).some(p => pathname.startsWith(p));
      if (isPortalPath) {
          url.pathname = '/access-denied';
          return NextResponse.rewrite(url);
      }
  }

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

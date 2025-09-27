
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

  const dashboardMap: { [key: string]: string } = {
    staff: '/admin/dashboard',
    admin: '/admin/dashboard',
    finance: '/finance',
    manufacturing: '/manufacturing',
    sales: '/sales',
    operations: '/operations',
    'digital-marketing': '/digital-marketing',
  }

  const currentHost = hostname.split('.')[0];
  const portalPath = portalMap[currentHost];
  const dashboardPath = dashboardMap[currentHost];

  // If on a portal subdomain
  if (portalPath && dashboardPath) {
    // If at the root of the subdomain, redirect to its dashboard
    if (pathname === '/') {
        url.pathname = dashboardPath;
        return NextResponse.redirect(url);
    }
    
    // For any other path on a subdomain, rewrite to the correct portal path
    // unless it's an auth page, which are shared.
    if (pathname.startsWith('/login') || pathname.startsWith('/verify-email') || pathname.startsWith('/access-denied')) {
        return NextResponse.next();
    }

    // Rewrite paths like /staff to /admin/staff for the staff subdomain
    if (pathname === '/staff') {
      url.pathname = '/admin/staff';
      return NextResponse.rewrite(url);
    }
    
    // Ensure all other requests are correctly routed within their portal context
    if (!pathname.startsWith(portalPath)) {
        url.pathname = `${portalPath}${pathname}`;
        return NextResponse.rewrite(url);
    }
  } 
  // If on the main domain, block access to portal paths
  else if (isMainDomain) {
      const isPortalPath = Object.values(portalMap).some(p => pathname.startsWith(p));
      if (isPortalPath) {
          url.pathname = '/access-denied'; // Redirect to access denied page
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

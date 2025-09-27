
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
    
    const isAuthPath = pathname.startsWith('/login') || pathname.startsWith('/verify-email') || pathname.startsWith('/access-denied');
    
    if (!isAuthPath) {
      // If the path already starts with the correct portal path, do nothing.
      // This is crucial for paths like `/admin/staff` on `staff.luna.co.ke`
      if (pathname.startsWith(portalPath)) {
        return NextResponse.next();
      }

      // Otherwise, rewrite the path to include the portal prefix.
      url.pathname = `${portalPath}${pathname}`;
      return NextResponse.rewrite(url);
    }

  } 
  // If on the main domain, block access to portal paths
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


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

    // Rewrite paths to their correct portal route, avoiding double-prefixing.
    // e.g. on staff.luna.co.ke, `/staff/users` should go to `/admin/staff/users`.
    // But `/admin/staff` should also go to `/admin/staff`.
    const isAuthPath = pathname.startsWith('/login') || pathname.startsWith('/verify-email') || pathname.startsWith('/access-denied');
    
    if (!isAuthPath) {
        // Construct the new path, ensuring we don't duplicate the portal segment.
        let newPath = pathname;

        // If currentHost matches a part of the path, replace it with the target portal path
        // e.g., on staff.luna.co.ke, /staff/management -> /admin/management
        const portalPathSegment = `/${currentHost}`;
        if(pathname.startsWith(portalPathSegment)) {
            newPath = pathname.replace(portalPathSegment, portalPath);
        } else if (!pathname.startsWith(portalPath)) {
            newPath = `${portalPath}${pathname}`;
        }
        
        if (url.pathname !== newPath) {
            url.pathname = newPath;
            return NextResponse.rewrite(url);
        }
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

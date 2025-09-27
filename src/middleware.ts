
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host");

  if (!hostname) {
    return new Response(null, { status: 400, statusText: "No hostname found in request headers" });
  }

  // Prevent rewriting for auth and public asset paths
  if (pathname.startsWith('/login') || pathname.startsWith('/access-denied') || pathname.startsWith('/verify-email')) {
    return NextResponse.next();
  }

  const currentHost = hostname.split('.')[0];

  const portalMap: { [key: string]: string } = {
    staff: '/admin',
    admin: '/admin',
    finance: '/finance',
    manufacturing: '/manufacturing',
    sales: '/sales',
    operations: '/operations',
    'digital-marketing': '/digital-marketing',
  };

  const portalPath = portalMap[currentHost];

  if (portalPath) {
    // If the user is at the root of a subdomain, redirect to the portal's main page.
    if (pathname === '/') {
      let redirectUrl = new URL(portalPath, request.url);
      // For the main admin portal, we redirect specifically to the dashboard.
      if (portalPath === '/admin') {
        redirectUrl = new URL('/admin/dashboard', request.url);
      }
      return NextResponse.redirect(redirectUrl);
    }
    
    // Check if the path already starts with the portal path to avoid duplication
    if (!pathname.startsWith(portalPath)) {
        url.pathname = `${portalPath}${pathname}`;
        return NextResponse.rewrite(url);
    }
  }

  // Allow requests for the main marketing site and handle localhost.
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:9002';
  if (hostname.includes(rootDomain) || hostname.includes('localhost')) {
     return NextResponse.next();
  }

  // Fallback for any other cases.
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

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host");

  if (!hostname) {
    return new Response(null, { status: 400, statusText: "No hostname found in request headers" });
  }

  // Use localhost for development
  const currentHost = process.env.NODE_ENV === 'production'
    ? hostname.replace(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`, '')
    // This part handles the development environment subdomains
    : hostname.replace(`.localhost:9002`, '');

  // Define which subdomain maps to which internal path
  const portalMap: { [key: string]: string } = {
    staff: '/admin',
    admin: '/admin',
    finance: '/finance',
    manufacturing: '/manufacturing',
    sales: '/sales',
    operations: '/operations',
  };

  const portalPath = portalMap[currentHost];

  if (portalPath) {
    // Rewrite the URL to the portal's path
    url.pathname = `${portalPath}${pathname}`;
    return NextResponse.rewrite(url);
  }

  // Allow requests for the main marketing site to go through
  if (hostname === process.env.NEXT_PUBLIC_ROOT_DOMAIN || hostname === 'localhost:9002') {
     return NextResponse.next();
  }

  // Fallback for any other subdomains
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

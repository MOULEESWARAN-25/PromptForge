import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Define private (protected) routes
  const privatePrefixes = ['/dashboard', '/forge', '/component-forge', '/chat', '/vocabulary'];
  const isPrivateRoute = privatePrefixes.some(prefix => pathname === prefix || pathname.startsWith(prefix + '/'));

  // Get auth cookie
  const sessionCookie = request.cookies.get('promptforge_session')?.value;

  if (isPrivateRoute) {
    if (!sessionCookie) {
      // Redirect to login page if unauthorized
      const url = request.nextUrl.clone();
      url.pathname = '/auth';
      return NextResponse.redirect(url);
    }

    // Add x-robots-tag: noindex, nofollow for private routes to prevent crawler indexing
    const response = NextResponse.next();
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return response;
  }

  // Redirect authenticated users trying to access /auth to /dashboard
  if (pathname === '/auth' && sessionCookie) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Config matcher to run middleware on exact paths and subroutes
export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/:path*',
    '/forge',
    '/forge/:path*',
    '/component-forge',
    '/component-forge/:path*',
    '/chat',
    '/chat/:path*',
    '/vocabulary',
    '/vocabulary/:path*',
    '/auth',
  ],
};

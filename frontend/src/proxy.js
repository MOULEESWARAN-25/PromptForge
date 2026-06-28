import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'promptforge_default_secure_secret_key_2026';

// Edge-safe JWT verification using standard Web Crypto API
async function verifyEdgeJwt(token, secretStr) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const encoder = new TextEncoder();
    const keyData = encoder.encode(secretStr);
    
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signatureInput = encoder.encode(`${parts[0]}.${parts[1]}`);
    
    // Base64Url decode the signature
    const base64UrlSig = parts[2].replace(/-/g, '+').replace(/_/g, '/');
    const binarySig = atob(base64UrlSig);
    const sigBuffer = new Uint8Array(binarySig.length);
    for (let i = 0; i < binarySig.length; i++) {
      sigBuffer[i] = binarySig.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBuffer,
      signatureInput
    );

    if (!isValid) return null;

    // Decode and parse payload
    const base64UrlPayload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const payloadBin = atob(base64UrlPayload);
    const payload = JSON.parse(payloadBin);
    
    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) return null;

    return payload;
  } catch (err) {
    console.error('[Middleware JWT Verification Error]:', err);
    return null;
  }
}

export default async function proxy(request) {
  const { pathname } = request.nextUrl;

  // Define private (protected) routes
  const privatePrefixes = ['/dashboard', '/forge', '/chat', '/vocabulary'];
  const isPrivateRoute = privatePrefixes.some(prefix => pathname === prefix || pathname.startsWith(prefix + '/'));

  // Get auth session cookie
  const sessionCookie = request.cookies.get('promptforge_session')?.value;

  if (isPrivateRoute) {
    if (!sessionCookie) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth';
      return NextResponse.redirect(url);
    }

    // Cryptographically verify session cookie
    const verifiedPayload = await verifyEdgeJwt(sessionCookie, JWT_SECRET);
    if (!verifiedPayload) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth';
      // Clear invalid cookie
      const response = NextResponse.redirect(url);
      response.cookies.set('promptforge_session', '', { path: '/', maxAge: 0 });
      return response;
    }

    // Add x-robots-tag: noindex, nofollow for private routes to prevent crawler indexing
    const response = NextResponse.next();
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return response;
  }

  // Redirect authenticated users trying to access /auth to /dashboard
  if (pathname === '/auth' && sessionCookie) {
    const verifiedPayload = await verifyEdgeJwt(sessionCookie, JWT_SECRET);
    if (verifiedPayload) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
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
    '/chat',
    '/chat/:path*',
    '/vocabulary',
    '/vocabulary/:path*',
    '/auth',
  ],
};


import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // This function is called if the user is authenticated.
    // We can perform additional checks or modifications to the request here.
    // For example, rewriting the URL based on user role, etc.
    // For now, if authorized, just proceed.
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname, locale: pathLocale } = req.nextUrl;
        // Use defaultLocale if pathLocale is 'default' or undefined
        const currentLocale = (pathLocale && pathLocale !== 'default') ? pathLocale : 'en'; 

        // Public routes: always allow access
        if (
          pathname.startsWith('/api/auth') || // NextAuth API routes
          pathname === '/' || // Homepage
          pathname.startsWith(`/${currentLocale}/`) && pathname.endsWith('/') || // Base locale path e.g. /en/
          pathname.startsWith(`/${currentLocale}/shop`) ||
          pathname.startsWith(`/${currentLocale}/blog`) ||
          pathname.startsWith(`/${currentLocale}/about`) ||
          pathname.startsWith(`/${currentLocale}/contact`) ||
          pathname.startsWith('/_next') || // Next.js internals
          pathname.startsWith('/images') || // Static assets
          pathname.startsWith('/css') || // Static assets
          pathname.startsWith('/fonts') || // Static assets
          pathname.includes('.') // Generally static files like favicon.ico
        ) {
          return true;
        }

        // Routes that require authentication
        const protectedPaths = [
          `/${currentLocale}/dashboard`,
          // Add other locale-prefixed protected paths here
        ];

        const isProtectedPath = protectedPaths.some(p => pathname.startsWith(p)) || 
                                pathname.startsWith('/dashboard'); // Fallback for non-prefixed dashboard if any

        if (isProtectedPath) {
          if (!token) {
            // User is not authenticated, redirect to locale-prefixed sign-in page
            const signInUrl = new URL(`/${currentLocale}/auth/signin`, req.nextUrl.origin);
            signInUrl.searchParams.set('callbackUrl', req.nextUrl.pathname + req.nextUrl.search);
            return NextResponse.redirect(signInUrl);
          }

          // Role checks for authenticated users on specific dashboard paths
          if (pathname.startsWith(`/${currentLocale}/dashboard/admin`) || pathname.startsWith('/dashboard/admin')) {
            if (!['admin', 'super_admin'].includes(token.role)) {
              // Redirect to a 'not authorized' page or the dashboard home
              const notAuthorizedUrl = new URL(`/${currentLocale}/dashboard?error=unauthorized`, req.nextUrl.origin);
              return NextResponse.redirect(notAuthorizedUrl);
            }
          }
          
          if (pathname.startsWith(`/${currentLocale}/dashboard/vendor`) || pathname.startsWith('/dashboard/vendor')) {
            if (!['admin', 'vendor', 'super_admin'].includes(token.role)) {
              // Redirect to a 'not authorized' page or the dashboard home
              const notAuthorizedUrl = new URL(`/${currentLocale}/dashboard?error=unauthorized`, req.nextUrl.origin);
              return NextResponse.redirect(notAuthorizedUrl);
            }
          }
          
          return true; // User is authenticated and has access
        }
        
        // API routes that require authentication
        if (pathname.startsWith('/api/dashboard') || 
            pathname.startsWith('/api/products') ||
            pathname.startsWith('/api/orders') ||
            pathname.startsWith('/api/stores') ||
            pathname.startsWith('/api/upload')) {
          return !!token
        }

        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/dashboard/:path*',
    '/api/products/:path*',
    '/api/orders/:path*',
    '/api/stores/:path*',
    '/api/upload/:path*'
  ]
}

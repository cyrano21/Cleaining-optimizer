/**
 * This file exports an object of route configuration 
 * that Next.js will use to determine which routes should be
 * statically generated (SSG) and which should be server-rendered (SSR).
 */

/**
 * @type {import('next').DynamicRoutes}
 */
module.exports = {
  // Routes that are SSR-only (Server Side Rendering)
  dynamicRoutes: [
    '/admin',
    '/login',
    '/dashboard',
    '/profile',
    '/portfolio',
    '/lessons/module/:moduleId/lesson/:lessonId'
  ],
  
  // Exception for not found routes
  notFoundRoutes: [
    // Redirect 404 to home page
    { source: '/:path*', destination: '/' }
  ],
  
  // Configuration pour le middleware
  middleware: {
    matcher: [
      // Routes qui nécessitent une authentification
      '/dashboard/:path*',
      '/profile/:path*',
      '/admin/:path*',
      '/portfolio/:path*',
      
      // Routes d'authentification
      '/login/:path*',
      '/register/:path*',
    ]
  }
}

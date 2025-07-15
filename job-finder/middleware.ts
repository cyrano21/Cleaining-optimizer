// middleware.ts
import { clerkMiddleware } from '@clerk/nextjs/server';

// Utiliser clerkMiddleware pour gérer l'authentification
export default clerkMiddleware();

export const config = {
  matcher: [
    // Protéger les routes spécifiques
    '/admin/:path*',
    // Temporairement désactivé pour débogage
    // '/coaching/:path*',
    // '/coaching',
    '/jobs/:path*',
    '/jobs',
    '/cv/:path*',
    '/cv',
    '/profil/:path*',
    '/profil',
    // Exclure les fichiers statiques
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
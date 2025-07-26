import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { normalizeRole, checkAdminAccess } from '@/lib/role-utils';
// import { storeResolver } from '@/middleware/storeResolver';

// Routes par défaut selon les rôles (système complet avec tous les rôles)
const DEFAULT_REDIRECTS = {
  // Ancien système (rétrocompatibilité)
  admin: '/admin',
  vendor: '/vendor-dashboard',
  user: '/dashboard',
  customer: '/customer-dashboard',

  // Nouveau système (tous les rôles)
  super_admin: '/super-admin',
  SUPER_ADMIN: '/super-admin',
  ADMIN: '/admin',
  administrator: '/admin',
  MODERATOR: '/moderator-dashboard',
  moderator: '/moderator-dashboard',
  VENDOR: '/vendor-dashboard',
  CUSTOMER: '/customer-dashboard',
};

// Middleware pour l'authentification et le filtrage multi-store + SEO
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // === GESTION CORS POUR LES API ===
  if (pathname.startsWith('/api/')) {
    // Gérer les requêtes OPTIONS (preflight)
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Pour les autres requêtes API, continuer mais ajouter headers CORS à la réponse
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return response;
  }

  // === FONCTIONNALITÉS MULTI-STORE ===

  // Gestion des routes de store dynamiques
  // Temporairement désactivé pour le debug
  // const storeResponse = await storeResolver(request);
  // if (storeResponse) {
  //   return storeResponse;
  // }

  // === FONCTIONNALITÉS SEO ===
  
  // Gestion des redirections SEO anciennes URLs vers nouvelles URLs avec slugs
  if (pathname.startsWith('/product/') && pathname.includes('?id=')) {
    // Rediriger les anciennes URLs avec ID vers les URLs avec slug
    const url = request.nextUrl.clone();
    const productId = url.searchParams.get('id');
    if (productId) {
      // En production, vous devriez faire un lookup en base pour trouver le slug
      url.pathname = `/product/${productId}`; // Temporaire
      return NextResponse.redirect(url);
    }
  }

  // Rediriger les URLs sans trailing slash vers les URLs avec trailing slash pour certaines pages
  if (pathname === '/vendors' || pathname === '/categories' || pathname === '/blog') {
    if (!pathname.endsWith('/')) {
      const url = request.nextUrl.clone();
      url.pathname = pathname + '/';
      return NextResponse.redirect(url, 301);
    }
  }

  // Forcer HTTPS en production
  if (process.env.NODE_ENV === 'production' && request.headers.get('x-forwarded-proto') !== 'https') {
    const url = request.nextUrl.clone();
    url.protocol = 'https:';
    return NextResponse.redirect(url, 301);
  }

  // Gestion des robots pour les environnements de développement et staging
  if (pathname === '/robots.txt' && process.env.NODE_ENV !== 'production') {
    return new NextResponse(
      `User-agent: *
Disallow: /

# This is a development/staging environment
# The production robots.txt is generated dynamically`,
      {
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
        },
      }
    );
  }

  // === LOGIQUE D'AUTHENTIFICATION EXISTANTE ===

  // Routes protégées nécessitant une authentification
  const protectedPaths = [
    '/dashboard',
    '/stores', 
    '/vendor-dashboard',
    '/customer-dashboard',
    '/moderator-dashboard',
    '/super-admin',
    '/e-commerce',
    '/admin',
    '/settings',
    '/users/profile', // Profil privé de l'utilisateur connecté
    '/api/stores',
    '/api/settings', 
    '/api/dashboard',
    '/api/vendor-dashboard',
    '/api/customer-dashboard',
    '/api/moderator-dashboard',
    '/api/super-admin',
    '/api/admin'
  ];

  // Routes publiques (pas besoin d'authentification)
  const publicPaths = [
    '/auth',
    '/api/auth',
    '/users/', // Profils publics des utilisateurs
    '/vendors/', // Profils publics des vendeurs
    '/api/users/[id]/public', // API profils publics utilisateurs
    '/api/vendors/[id]/public' // API profils publics vendeurs
  ];

  // Fonction pour vérifier si une route correspond à un pattern
  const matchesPattern = (path: string, patterns: string[]) => {
    return patterns.some(pattern => {
      if (pattern.includes('[id]')) {
        // Gérer les routes dynamiques comme /api/users/[id]/public
        const regex = new RegExp(pattern.replace('[id]', '[^/]+'));
        return regex.test(path);
      }
      return path.startsWith(pattern);
    });
  };

  // Vérifier si la route est protégée
  const isProtectedPath = matchesPattern(pathname, protectedPaths);
  const isPublicPath = matchesPattern(pathname, publicPaths);

  // Si c'est une page publique, laisser passer
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Pour les pages protégées, vérifier l'authentification
  if (isProtectedPath) {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    // Si pas de token, rediriger vers la page de connexion
    if (!token) {
      const url = new URL("/auth/signin", request.url);
      url.searchParams.set("callbackUrl", request.url);
      return NextResponse.redirect(url);
    }

    // Redirection intelligente selon le rôle pour la page racine
    const userRole = token.role as string;
    const normalizedRole = normalizeRole(userRole);
    
    if (pathname === '/' || pathname === '/dashboard') {
      // Chercher d'abord avec le rôle normalisé, puis avec le rôle original
      const defaultPath = DEFAULT_REDIRECTS[normalizedRole as keyof typeof DEFAULT_REDIRECTS] || 
                          DEFAULT_REDIRECTS[userRole as keyof typeof DEFAULT_REDIRECTS] || 
                          '/dashboard';
      if (pathname !== defaultPath) {
        return NextResponse.redirect(new URL(defaultPath, request.url));
      }
    }

    // Vérifications spécifiques selon le rôle
    // Routes réservées aux super admins
    const superAdminOnlyPaths = ["/super-admin"];
    const isSuperAdminOnlyPath = superAdminOnlyPaths.some(path => pathname.startsWith(path));
    
    if (isSuperAdminOnlyPath && !['super_admin', 'SUPER_ADMIN'].includes(normalizedRole)) {
      const redirectPath = DEFAULT_REDIRECTS[normalizedRole as keyof typeof DEFAULT_REDIRECTS] || 
                          DEFAULT_REDIRECTS[userRole as keyof typeof DEFAULT_REDIRECTS] || 
                          '/dashboard';
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
    
    // Routes réservées aux admins (nouveau système de permissions)
    const adminOnlyPaths = ["/admin", "/stores", "/e-commerce/admin-dashboard"];
    const isAdminOnlyPath = adminOnlyPaths.some(path => pathname.startsWith(path));
    
    if (isAdminOnlyPath && !checkAdminAccess(userRole)) {
      const redirectPath = DEFAULT_REDIRECTS[normalizedRole as keyof typeof DEFAULT_REDIRECTS] || 
                          DEFAULT_REDIRECTS[userRole as keyof typeof DEFAULT_REDIRECTS] || 
                          '/dashboard';
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    // Routes réservées aux vendors (compatible ancien système)
    const vendorOnlyPaths = ["/vendor-dashboard"];
    const isVendorOnlyPath = vendorOnlyPaths.some(path => pathname.startsWith(path));
    
    if (isVendorOnlyPath && !['vendor', 'VENDOR', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN', 'super_admin', 'admin', 'moderator'].includes(normalizedRole)) {
      const redirectPath = DEFAULT_REDIRECTS[normalizedRole as keyof typeof DEFAULT_REDIRECTS] || 
                          DEFAULT_REDIRECTS[userRole as keyof typeof DEFAULT_REDIRECTS] || 
                          '/dashboard';
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    // Routes réservées aux customers
    const customerOnlyPaths = ["/customer-dashboard"];
    const isCustomerOnlyPath = customerOnlyPaths.some(path => pathname.startsWith(path));
    
    if (isCustomerOnlyPath && !['customer', 'CUSTOMER', 'ADMIN', 'SUPER_ADMIN', 'super_admin', 'admin'].includes(normalizedRole)) {
      const redirectPath = DEFAULT_REDIRECTS[normalizedRole as keyof typeof DEFAULT_REDIRECTS] || 
                          DEFAULT_REDIRECTS[userRole as keyof typeof DEFAULT_REDIRECTS] || 
                          '/dashboard';
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    // Routes réservées aux moderators
    const moderatorOnlyPaths = ["/moderator-dashboard"];
    const isModeratorOnlyPath = moderatorOnlyPaths.some(path => pathname.startsWith(path));
    
    if (isModeratorOnlyPath && !['moderator', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN', 'super_admin', 'admin'].includes(normalizedRole)) {
      const redirectPath = DEFAULT_REDIRECTS[normalizedRole as keyof typeof DEFAULT_REDIRECTS] || 
                          DEFAULT_REDIRECTS[userRole as keyof typeof DEFAULT_REDIRECTS] || 
                          '/dashboard';
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    // Ajouter les informations utilisateur dans les headers pour les API routes
    if (pathname.startsWith("/api/")) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-user-id", token.sub || "");
      requestHeaders.set("x-user-role", userRole);
      requestHeaders.set("x-user-role-normalized", normalizedRole);
      requestHeaders.set("x-user-email", token.email || "");

      // Récupérer la boutique sélectionnée depuis les cookies ou headers
      const selectedStoreId = request.cookies.get("selectedStoreId")?.value;
      if (selectedStoreId) {
        requestHeaders.set("x-selected-store", selectedStoreId);
      }

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
  }

  return NextResponse.next();
}

// Configuration des routes où le middleware s'applique
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|.*\\.).*)",
  ],
};

import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

// Cache simple pour les stores (optimisé pour Edge Runtime)
const storeCache = new Map();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes (plus court pour le middleware)

// Fonction pour récupérer les données d'une store
async function getStoreBySlug(slug, origin) {
  const cacheKey = `store_${slug}`;
  const cached = storeCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const response = await fetch(`${origin}/api/stores/public/${slug}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Ecomus-Middleware/1.0',
      },
    });
    
    if (!response.ok) {
      return null;
    }
    
    const result = await response.json();
    if (result.success) {
      storeCache.set(cacheKey, {
        data: result.data,
        timestamp: Date.now()
      });
      return result.data;
    }
    
    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération de la store:', error);
    return null;
  }
}

// Middleware personnalisé pour les routes non-protégées
async function customMiddleware(req) {
  const { pathname, origin } = req.nextUrl;
  
  // 1. GESTION DES STORES DYNAMIQUES
  // Vérifier si c'est une route de store dynamique
    const storeMatch = pathname.match(/^\/store\/([^\/]+)(?:\/.*)?$/);
    if (storeMatch) {
      const slug = storeMatch[1];
      
      // Récupérer les données de la store
      const storeData = await getStoreBySlug(slug, origin);
      
      if (!storeData) {
        // Store non trouvée, rediriger vers une page 404 ou liste des stores
        return NextResponse.redirect(new URL('/stores?error=not-found', req.nextUrl));
      }
      
      if (!storeData.isActive) {
        // Store non active, rediriger avec message d'erreur
        return NextResponse.redirect(new URL('/stores?error=inactive', req.nextUrl));
      }
      
      // Ajouter les headers personnalisés pour la store (optionnel)
      const response = NextResponse.next();
      response.headers.set('X-Store-ID', storeData.id);
      response.headers.set('X-Store-Theme', storeData.homeTheme || 'default');
      response.headers.set('X-Store-Template', storeData.homeTemplate || 'default');
      
      return response;
    }
    
    // 2. GESTION DES ROUTES STORES (liste)
    if (pathname.startsWith('/stores')) {
      // Permettre l'accès aux pages de liste des stores
      return NextResponse.next();
    }
    
    // 3. GESTION DES AUTRES ROUTES
    // Continuer avec le middleware par défaut
    return NextResponse.next();
  }

// Middleware d'authentification pour les routes protégées
const authMiddleware = withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Routes publiques toujours autorisées
        if (pathname.startsWith('/api/stores/public')) {
          return true;
        }
        
        return !!token;
      },
    },
  }
);

// Middleware principal qui route vers le bon middleware
export default async function middleware(req) {
  const { pathname } = req.nextUrl;
  
  // Routes publiques - utiliser le middleware personnalisé
  if (pathname.startsWith('/api/stores/public') || 
      pathname.startsWith('/store/') ||
      pathname.startsWith('/stores')) {
    return customMiddleware(req);
  }
  
  // Routes protégées - utiliser withAuth
  return authMiddleware(req);
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/store/:path*',
    '/stores/:path*',
    '/api/dashboard/:path*',
    '/api/products/:path*',
    '/api/orders/:path*',
    '/api/admin/:path*',
    '/api/vendor/:path*',
    '/api/stores/admin/:path*',
    '/api/stores/vendor/:path*',
    '/api/upload/:path*'
    // Note: /api/stores/public/:path* is intentionally excluded
  ]
}

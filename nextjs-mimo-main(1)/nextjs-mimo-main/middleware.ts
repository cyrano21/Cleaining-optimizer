import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes qui nécessitent une authentification
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/portfolio',
  '/admin'
];

// Routes accessibles uniquement aux non-authentifiés
const authRoutes = [
  '/login'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('nextmimo_auth_token')?.value;
    // Cette fonction s'exécute côté serveur et ne doit pas utiliser localStorage
  // Nous utilisons plutôt les cookies pour vérifier l'authentification
  
  // Si l'utilisateur n'est pas authentifié mais tente d'accéder à une route protégée
  if (!token && protectedRoutes.some(route => pathname.startsWith(route))) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirectTo', encodeURIComponent(pathname));
    
    // Stocker également l'URL de redirection dans un cookie pour récupération côté client
    const response = NextResponse.redirect(url);
    response.cookies.set('redirectAfterLogin', pathname, { 
      path: '/',
      httpOnly: true,
      maxAge: 60 * 10 // 10 minutes
    });
    
    return response;
  }

  // Si l'utilisateur est authentifié mais tente d'accéder à une route de connexion
  if (token && authRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

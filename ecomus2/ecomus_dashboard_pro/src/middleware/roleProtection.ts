import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Configuration des routes protégées par rôle
const ROLE_PROTECTED_ROUTES = {
  '/super-admin': ['super_admin'],
  '/admin': ['admin', 'super_admin'],
  '/vendor-dashboard': ['vendor', 'admin', 'super_admin'],
  '/vendor': ['vendor', 'admin', 'super_admin'],
  '/customer-dashboard': ['customer', 'admin', 'super_admin'],
  '/moderator-dashboard': ['moderator', 'admin', 'super_admin'],
  '/e-commerce': ['admin', 'super_admin', 'vendor', 'moderator'],
} as const;

export async function roleProtectionMiddleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // Vérifier si la route nécessite une protection
  const routeKey = Object.keys(ROLE_PROTECTED_ROUTES).find(route => 
    pathname.startsWith(route)
  );

  if (!routeKey) {
    return NextResponse.next();
  }

  const allowedRoles = ROLE_PROTECTED_ROUTES[routeKey as keyof typeof ROLE_PROTECTED_ROUTES];

  // Vérifier l'authentification
  if (!token) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  // Vérifier le rôle
  const userRole = token.role as string;
  if (!allowedRoles.includes(userRole as any)) {
    return NextResponse.redirect(new URL('/auth/unauthorized', request.url));
  }

  return NextResponse.next();
}

// Fonction utilitaire pour vérifier les permissions
export function hasPermission(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole);
}

// Fonction pour obtenir le dashboard par défaut d'un rôle
export function getDefaultDashboard(role: string): string {
  const dashboards = {
    super_admin: '/super-admin',
    admin: '/admin',
    vendor: '/vendor-dashboard',
    customer: '/customer-dashboard',
    moderator: '/moderator-dashboard',
  } as const;

  return dashboards[role as keyof typeof dashboards] || '/dashboard';
}

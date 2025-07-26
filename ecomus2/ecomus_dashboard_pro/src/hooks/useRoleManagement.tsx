import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Types des roles supportes
export type UserRole = 'super_admin' | 'admin' | 'vendor' | 'customer' | 'moderator';

// Configuration des dashboards par role
export const ROLE_DASHBOARDS: Record<UserRole, string> = {
  super_admin: '/super-admin',
  admin: '/admin',
  vendor: '/vendor-dashboard',
  customer: '/customer-dashboard',
  moderator: '/moderator-dashboard',
};

// Configuration des permissions par role
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  super_admin: ['all', 'manage_users', 'manage_roles', 'manage_system', 'view_analytics'],
  admin: ['manage_users', 'manage_products', 'manage_orders', 'view_analytics', 'manage_stores'],
  vendor: ['manage_own_products', 'view_own_orders', 'manage_inventory', 'view_own_analytics'],
  customer: ['view_products', 'place_orders', 'view_own_orders', 'manage_profile'],
  moderator: ['moderate_content', 'manage_reviews', 'view_reports'],
};

/**
 * Hook pour la redirection automatique basee sur le role
 */
export function useRoleRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (session?.user?.role) {
      const userRole = session.user.role as UserRole;
      const dashboard = ROLE_DASHBOARDS[userRole];
      
      if (dashboard && window.location.pathname === '/') {
        router.push(dashboard);
      }
    }
  }, [session, status, router]);

  return { session, status };
}

/**
 * Hook pour verifier les permissions
 */
export function usePermissions() {
  const { data: session } = useSession();

  const hasPermission = (permission: string): boolean => {
    if (!session?.user?.role) return false;
    
    const userRole = session.user.role as UserRole;
    const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
    
    return rolePermissions.includes('all') || rolePermissions.includes(permission);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  const canAccessDashboard = (targetRole: UserRole): boolean => {
    if (!session?.user?.role) return false;
    
    const userRole = session.user.role as UserRole;
    
    // Super admin peut tout voir
    if (userRole === 'super_admin') return true;
    
    // Admin peut voir admin, vendor, customer, moderator
    if (userRole === 'admin') {
      return ['admin', 'vendor', 'customer', 'moderator'].includes(targetRole);
    }
    
    // Les autres peuvent seulement voir leur propre dashboard
    return userRole === targetRole;
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessDashboard,
    userRole: session?.user?.role as UserRole,
    permissions: session?.user?.role ? ROLE_PERMISSIONS[session.user.role as UserRole] : [],
  };
}

/**
 * Composant de protection des routes base sur les roles
 */
interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function RoleGuard({ 
  allowedRoles, 
  children, 
  fallback = <div className="p-4 text-center text-red-600">Accès refusé</div>,
  redirectTo 
}: RoleGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (session?.user?.role) {
      const userRole = session.user.role as UserRole;
      
      if (!allowedRoles.includes(userRole)) {
        if (redirectTo) {
          router.push(redirectTo);
        }
        return;
      }
    }
  }, [session, status, router, allowedRoles, redirectTo]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return null;
  }

  if (session?.user?.role) {
    const userRole = session.user.role as UserRole;
    
    if (!allowedRoles.includes(userRole)) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}

/**
 * Fonction utilitaire pour obtenir le dashboard approprie selon le role
 */
export function getDashboardForRole(role: string): string {
  const normalizedRole = role.toLowerCase() as UserRole;
  return ROLE_DASHBOARDS[normalizedRole] || '/dashboard';
}

/**
 * Fonction utilitaire pour obtenir toutes les routes accessibles par un role
 */
export function getAccessibleRoutes(role: UserRole): string[] {
  const routes = [ROLE_DASHBOARDS[role]];
  
  // Super admin peut acceder a tout
  if (role === 'super_admin') {
    return Object.values(ROLE_DASHBOARDS);
  }
  
  // Admin peut acceder aux dashboards subordonnes
  if (role === 'admin') {
    routes.push(
      ROLE_DASHBOARDS.vendor,
      ROLE_DASHBOARDS.customer,
      ROLE_DASHBOARDS.moderator
    );
  }
  
  return routes;
}

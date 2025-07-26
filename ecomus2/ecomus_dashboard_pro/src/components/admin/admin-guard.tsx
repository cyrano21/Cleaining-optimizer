'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Shield, Loader2 } from 'lucide-react';

interface AdminGuardProps {
  children: React.ReactNode;
  requiredRole?: 'super_admin' | 'admin' | 'moderator';
}

export function AdminGuard({ children, requiredRole = 'admin' }: AdminGuardProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (status === 'loading') return; // Attendre que le statut soit déterminé

    if (!session?.user) {
      router.push('/auth/signin');
      return;
    }

    // Vérifier si l'utilisateur a le bon rôle
    const userRole = session.user.role;
    const allowedRoles = ['admin', 'super_admin', 'moderator'];
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      router.push('/dashboard?error=access-denied');
      return;
    }

    // Si un rôle spécifique est requis, le vérifier avec hiérarchie
    const roleHierarchy = { 'super_admin': 3, 'admin': 2, 'moderator': 1 };
    const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 1;
    
    if (userLevel < requiredLevel) {
      router.push('/admin?error=insufficient-permissions');
      return;
    }

    setIsAuthorized(true);
  }, [session, status, router, requiredRole]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="text-center">
          <div className="mb-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-500" />
          </div>
          <div className="mb-2">
            <Shield className="h-8 w-8 mx-auto text-blue-400" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Vérification des accès</h2>
          <p className="text-gray-600 dark:text-gray-300">Authentification en cours...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Le router.push va rediriger
  }

  return <>{children}</>;
}

export default AdminGuard;

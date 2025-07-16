"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

// Composant de protection de route pour les pages qui nécessitent une authentification
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { currentUser, loading, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Attendre que le chargement de l'authentification soit terminé
    if (!loading) {
      // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
      if (!currentUser) {
        // Stocker la page actuelle dans un cookie pour rediriger après la connexion
        if (typeof document !== 'undefined') {
          document.cookie = `redirectAfterLogin=${pathname}; path=/; max-age=600`;
        }
        router.push(`/login?redirectTo=${encodeURIComponent(pathname)}`);
      } 
      // Si la page est réservée aux administrateurs et que l'utilisateur n'est pas admin
      else if (adminOnly && !isAdmin()) {
        router.push('/dashboard'); // Rediriger vers le tableau de bord utilisateur
      }
    }
  }, [currentUser, loading, adminOnly, router, pathname, isAdmin]);

  // Afficher un écran de chargement pendant la vérification de l'authentification
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas connecté ou n'a pas les droits nécessaires, ne pas afficher le contenu
  if (!currentUser || (adminOnly && !isAdmin())) {
    return null;
  }

  // Si l'utilisateur est connecté et a les droits nécessaires, afficher le contenu
  return children;
}

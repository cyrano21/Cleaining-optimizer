"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ModernLoader } from "@/components/ui/loader";
import { Shield, Store, User, ArrowRight, Sparkles } from "lucide-react";

/**
 * Page d'accueil - Point d'entrée intelligent de l'application
 * Redirige vers le bon dashboard selon le rôle utilisateur
 */

const ROLE_ROUTES = {
  admin: {
    path: '/admin',
    icon: Shield,
    name: 'Administration',
    description: 'Gestion globale de la plateforme'
  },
  vendor: {
    path: '/vendor-dashboard', 
    icon: Store,
    name: 'Vendeur',
    description: 'Gestion de votre boutique'
  },
  customer: {
    path: '/customers',
    icon: User, 
    name: 'Client',  
    description: 'Vos commandes et favoris'
  }
} as const;

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Attendre que la session soit chargée
    if (status === 'loading') return;

    // Rediriger vers login si non authentifié
    if (status === 'unauthenticated' || !session) {
      router.push('/auth/signin');
      return;
    }

    // Redirection intelligente selon le rôle
    const userRole = session?.user?.role as keyof typeof ROLE_ROUTES;
    const roleConfig = ROLE_ROUTES[userRole];

    if (roleConfig) {
      setIsRedirecting(true);
      
      // Redirection avec délai pour UX smooth
      setTimeout(() => {
        router.push(roleConfig.path);
      }, 1500);
    } else {
      // Rôle non reconnu -> page d'erreur
      router.push('/auth/unauthorized');
    }
  }, [session, status, router]);

  // Loading pendant l'authentification
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <ModernLoader variant="pulse" size="lg" />
      </div>
    );
  }

  // Redirection en cours
  if (isRedirecting && session?.user?.role) {
    const userRole = session.user.role as keyof typeof ROLE_ROUTES;
    const roleConfig = ROLE_ROUTES[userRole];
    const IconComponent = roleConfig?.icon || User;

    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6 p-8 bg-white rounded-2xl shadow-xl max-w-md mx-auto"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex justify-center"
          >
            <div className="p-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full">
              <IconComponent className="h-12 w-12 text-white" />
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Bienvenue, {session.user.name || 'Utilisateur'} !
            </h1>
            <p className="text-gray-600 mb-4">
              Redirection vers votre espace {roleConfig?.name.toLowerCase()}...
            </p>
            <div className="flex items-center justify-center space-x-2 text-blue-600">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">{roleConfig?.description}</span>
              <ArrowRight className="h-4 w-4 animate-pulse" />
            </div>
          </motion.div>

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ delay: 0.6, duration: 1 }}
            className="h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
          />
        </motion.div>
      </div>
    );
  }

  // Fallback - Ne devrait jamais être atteint
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <ModernLoader variant="pulse" size="lg" />
    </div>
  );
}

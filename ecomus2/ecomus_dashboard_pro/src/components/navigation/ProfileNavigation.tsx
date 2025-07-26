"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Store, 
  Settings, 
  Eye, 
  EyeOff, 
  Users, 
  ShoppingBag,
  BarChart3
} from "lucide-react";

interface ProfileNavigationProps {
  currentUserId?: string;
  userRole?: 'admin' | 'vendor' | 'customer';
  isPublicView?: boolean;
}

export default function ProfileNavigation({ 
  currentUserId, 
  userRole, 
  isPublicView = false 
}: ProfileNavigationProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  
  const isOwnProfile = session?.user?.id === currentUserId;
  const currentUserRole = session?.user?.role || 'customer';

  // Navigation items basés sur le rôle et le contexte
  const getNavigationItems = () => {
    const items = [];

    // Si c'est son propre profil
    if (isOwnProfile) {
      items.push({
        href: '/settings',
        label: 'Paramètres privés',
        icon: Settings,
        description: 'Gérer vos informations personnelles',
        variant: 'default' as const
      });

      // Lien vers la vue publique de son profil
      if (currentUserRole === 'vendor') {
        items.push({
          href: `/vendors/${session?.user?.id}`,
          label: 'Vue publique',
          icon: Eye,
          description: 'Voir votre profil comme les autres le voient',
          variant: 'outline' as const
        });
      } else {
        items.push({
          href: `/users/${session?.user?.id}`,
          label: 'Vue publique',
          icon: Eye,
          description: 'Voir votre profil comme les autres le voient',
          variant: 'outline' as const
        });
      }
    }

    // Navigation spécifique aux admins
    if (currentUserRole === 'admin') {
      items.push({
        href: '/dashboard',
        label: 'Dashboard Admin',
        icon: BarChart3,
        description: 'Tableau de bord administrateur',
        variant: 'secondary' as const
      });
      
      items.push({
        href: '/e-commerce/users',
        label: 'Gestion Utilisateurs',
        icon: Users,
        description: 'Gérer tous les utilisateurs',
        variant: 'outline' as const
      });
    }

    // Navigation spécifique aux vendeurs
    if (currentUserRole === 'vendor') {
      items.push({
        href: '/vendor-dashboard',
        label: 'Dashboard Vendeur',
        icon: Store,
        description: 'Gérer votre boutique',
        variant: 'secondary' as const
      });
      
      items.push({
        href: '/products',
        label: 'Mes Produits',
        icon: ShoppingBag,
        description: 'Gérer vos produits',
        variant: 'outline' as const
      });
    }

    return items;
  };

  const navigationItems = getNavigationItems();

  // Déterminer le contexte actuel
  const getCurrentContext = () => {
    if (pathname.startsWith('/settings')) return 'Paramètres privés';
    if (pathname.startsWith('/dashboard')) return 'Dashboard';
    if (pathname.startsWith('/vendor-dashboard')) return 'Dashboard Vendeur';
    if (pathname.startsWith('/users/') && !pathname.includes('/profile')) return 'Profil public utilisateur';
    if (pathname.startsWith('/vendors/')) return 'Profil public vendeur';
    if (pathname.startsWith('/users/profile')) return 'Mon profil privé';
    return 'Profil';
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { label: 'Administrateur', variant: 'destructive' as const },
      vendor: { label: 'Vendeur', variant: 'default' as const },
      customer: { label: 'Client', variant: 'secondary' as const }
    };
    
    return roleConfig[role as keyof typeof roleConfig] || roleConfig.customer;
  };

  if (navigationItems.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          {/* Contexte actuel */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {isPublicView ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              <span className="font-medium">{getCurrentContext()}</span>
            </div>
            
            {userRole && (
              <Badge variant={getRoleBadge(userRole).variant}>
                {getRoleBadge(userRole).label}
              </Badge>
            )}
            
            {isOwnProfile && (
              <Badge variant="outline" className="text-xs">
                Votre profil
              </Badge>
            )}
          </div>

          {/* Navigation rapide */}
          <div className="flex items-center gap-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || 
                             (item.href !== '/' && pathname.startsWith(item.href));
              
              return (
                <Link key={item.href} href={item.href}>
                  <Button 
                    variant={isActive ? 'default' : item.variant}
                    size="sm"
                    className="flex items-center gap-2"
                    title={item.description}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
        
        {/* Breadcrumb ou information contextuelle */}
        <div className="mt-2 text-sm text-gray-600">
          {isPublicView ? (
            <span>Vue publique - Les informations affichées dépendent des paramètres de confidentialité</span>
          ) : (
            <span>Vue privée - Vous pouvez modifier ces informations</span>
          )}
        </div>
      </div>
    </div>
  );
}

// Hook pour utiliser facilement la navigation de profil
export function useProfileNavigation() {
  const { data: session } = useSession();
  const pathname = usePathname();
  
  const getProfileType = () => {
    if (pathname.startsWith('/users/') && !pathname.includes('/profile')) {
      return 'public-user';
    }
    if (pathname.startsWith('/vendors/')) {
      return 'public-vendor';
    }
    if (pathname.startsWith('/settings') || pathname.startsWith('/users/profile')) {
      return 'private';
    }
    return 'unknown';
  };
  
  const isOwnProfile = (userId: string) => {
    return session?.user?.id === userId;
  };
  
  const canEdit = (userId: string) => {
    return isOwnProfile(userId) || session?.user?.role === 'admin';
  };
  
  return {
    profileType: getProfileType(),
    isOwnProfile,
    canEdit,
    currentUser: session?.user,
    isAuthenticated: !!session
  };
}
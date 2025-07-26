"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { usePermissions, type UserRole } from '@/hooks/useRoleManagement';
import {
  Shield,
  Store,
  User,
  UserCheck,
  Crown,
  Menu,
  ChevronDown,
  Home,
  Settings,
  LogOut,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  FileText,
  MessageSquare,
  Eye,
  Sparkles,
} from 'lucide-react';

// Configuration de navigation par rôle
const ROLE_NAVIGATION = {
  super_admin: {
    icon: Crown,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    name: 'Super Admin',
    dashboards: [
      { path: '/super-admin', label: 'Super Admin', icon: Crown },
      { path: '/admin', label: 'Administration', icon: Shield },
      { path: '/vendor-dashboard', label: 'Vendeurs', icon: Store },
      { path: '/customer-dashboard', label: 'Clients', icon: User },
      { path: '/moderator-dashboard', label: 'Modération', icon: UserCheck },
    ],
    quickActions: [
      { path: '/e-commerce/users', label: 'Gestion Utilisateurs', icon: Users },
      { path: '/e-commerce/roles/all-roles', label: 'Gestion Rôles', icon: Shield },
      { path: '/e-commerce/settings', label: 'Configuration Système', icon: Settings },
    ]
  },
  admin: {
    icon: Shield,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    name: 'Administrateur',
    dashboards: [
      { path: '/admin', label: 'Administration', icon: Shield },
      { path: '/vendor-dashboard', label: 'Vendeurs', icon: Store },
      { path: '/customer-dashboard', label: 'Clients', icon: User },
      { path: '/moderator-dashboard', label: 'Modération', icon: UserCheck },
    ],
    quickActions: [
      { path: '/e-commerce/products', label: 'Produits', icon: Package },
      { path: '/e-commerce/orders', label: 'Commandes', icon: ShoppingCart },
      { path: '/e-commerce/analytics', label: 'Analytics', icon: BarChart3 },
      { path: '/e-commerce/users', label: 'Utilisateurs', icon: Users },
    ]
  },
  vendor: {
    icon: Store,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    name: 'Vendeur',
    dashboards: [
      { path: '/vendor-dashboard', label: 'Mon Magasin', icon: Store },
    ],
    quickActions: [
      { path: '/e-commerce/add-product', label: 'Ajouter Produit', icon: Package },
      { path: '/e-commerce/my-products', label: 'Mes Produits', icon: Package },
      { path: '/e-commerce/my-orders', label: 'Mes Commandes', icon: ShoppingCart },
      { path: '/e-commerce/my-analytics', label: 'Mes Statistiques', icon: BarChart3 },
    ]
  },
  customer: {
    icon: User,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    name: 'Client',
    dashboards: [
      { path: '/customer-dashboard', label: 'Mon Compte', icon: User },
    ],
    quickActions: [
      { path: '/products', label: 'Catalogue', icon: Package },
      { path: '/my-orders', label: 'Mes Commandes', icon: ShoppingCart },
      { path: '/my-favorites', label: 'Favoris', icon: Sparkles },
      { path: '/my-profile', label: 'Mon Profil', icon: User },
    ]
  },
  moderator: {
    icon: UserCheck,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    name: 'Modérateur',
    dashboards: [
      { path: '/moderator-dashboard', label: 'Modération', icon: UserCheck },
    ],
    quickActions: [
      { path: '/e-commerce/content-moderation', label: 'Modérer Contenu', icon: Eye },
      { path: '/e-commerce/reviews', label: 'Avis Clients', icon: MessageSquare },
      { path: '/e-commerce/reports', label: 'Rapports', icon: FileText },
      { path: '/e-commerce/users', label: 'Utilisateurs', icon: Users },
    ]
  }
} as const;

interface RoleNavigationProps {
  variant?: 'sidebar' | 'dropdown' | 'mobile';
  className?: string;
}

export function RoleNavigation({ variant = 'dropdown', className }: RoleNavigationProps) {
  const { data: session } = useSession();
  const { userRole, canAccessDashboard } = usePermissions();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!session || !userRole) {
    return null;
  }

  const roleConfig = ROLE_NAVIGATION[userRole as UserRole];
  if (!roleConfig) {
    return null;
  }

  const RoleIcon = roleConfig.icon;

  // Filtrer les dashboards accessibles
  const accessibleDashboards = roleConfig.dashboards.filter(dashboard => {
    const role = dashboard.path.split('/')[1];
    const mappedRole = {
      'super-admin': 'super_admin',
      'admin': 'admin',
      'vendor-dashboard': 'vendor',
      'customer-dashboard': 'customer',
      'moderator-dashboard': 'moderator',
    }[role];
    return mappedRole ? canAccessDashboard(mappedRole as UserRole) : false;
  });

  // Composant de navigation pour sidebar
  if (variant === 'sidebar') {
    return (
      <nav className={cn("space-y-2", className)}>
        <div className={cn("p-3 rounded-lg", roleConfig.bgColor)}>
          <div className="flex items-center gap-2 mb-2">
            <RoleIcon className={cn("h-5 w-5", roleConfig.color)} />
            <span className="font-medium text-sm">{roleConfig.name}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {session.user?.name}
          </Badge>
        </div>

        {accessibleDashboards.length > 1 && (
          <div>
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              Dashboards
            </h4>
            <div className="space-y-1">
              {accessibleDashboards.map((dashboard) => {
                const Icon = dashboard.icon;
                const isActive = pathname.startsWith(dashboard.path);
                return (
                  <Link
                    key={dashboard.path}
                    href={dashboard.path}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                      isActive
                        ? "bg-blue-100 text-blue-700 font-medium"
                        : "text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {dashboard.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            Actions rapides
          </h4>
          <div className="space-y-1">
            {roleConfig.quickActions.map((action) => {
              const Icon = action.icon;
              const isActive = pathname === action.path;
              return (
                <Link
                  key={action.path}
                  href={action.path}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                    isActive
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {action.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    );
  }

  // Composant de navigation pour mobile
  if (variant === 'mobile') {
    return (
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <RoleIcon className={cn("h-5 w-5", roleConfig.color)} />
              Navigation {roleConfig.name}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <RoleNavigation variant="sidebar" />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Composant dropdown par défaut
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={cn("flex items-center gap-2", className)}>
          <div className={cn("p-1 rounded", roleConfig.bgColor)}>
            <RoleIcon className={cn("h-4 w-4", roleConfig.color)} />
          </div>
          <span className="hidden md:inline">{roleConfig.name}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <div className="flex items-center gap-2">
            <div className={cn("p-1 rounded", roleConfig.bgColor)}>
              <RoleIcon className={cn("h-4 w-4", roleConfig.color)} />
            </div>
            <div>
              <p className="text-sm font-medium">{session.user?.name}</p>
              <p className="text-xs text-gray-500">{roleConfig.name}</p>
            </div>
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        {accessibleDashboards.length > 1 && (
          <>
            <div className="px-2 py-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dashboards
              </p>
            </div>
            {accessibleDashboards.map((dashboard) => {
              const Icon = dashboard.icon;
              return (
                <DropdownMenuItem
                  key={dashboard.path}
                  onClick={() => router.push(dashboard.path)}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {dashboard.label}
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
          </>
        )}
        
        <div className="px-2 py-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Actions rapides
          </p>
        </div>
        {roleConfig.quickActions.slice(0, 4).map((action) => {
          const Icon = action.icon;
          return (
            <DropdownMenuItem
              key={action.path}
              onClick={() => router.push(action.path)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {action.label}
            </DropdownMenuItem>
          );
        })}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={() => router.push('/settings')}
          className="flex items-center gap-2"
        >
          <Settings className="h-4 w-4" />
          Paramètres
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => router.push('/auth/signout')}
          className="flex items-center gap-2 text-red-600"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default RoleNavigation;

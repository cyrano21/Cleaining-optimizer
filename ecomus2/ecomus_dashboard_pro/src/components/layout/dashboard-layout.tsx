/**
 * Composant DashboardLayout
 * Layout principal pour les pages du dashboard
 */

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  MenuIcon,
  SearchIcon,
  BellIcon,
  SettingsIcon,
  LogOutIcon,
  UserIcon,
  HomeIcon,
  ShoppingCartIcon,
  PackageIcon,
  UsersIcon,
  BarChart3Icon,
  CreditCardIcon,
  StoreIcon,
  HelpCircleIcon,
  ChevronDownIcon,
  SunIcon,
  MoonIcon,
} from 'lucide-react';
import { useTheme } from 'next-themes';

// Types pour la navigation
export interface NavItem {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
  children?: NavItem[];
  roles?: string[];
  permissions?: string[];
}

export interface BreadcrumbItem {
  title: string;
  href?: string;
}

export interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
  sidebar?: boolean;
  header?: boolean;
  footer?: boolean;
}

// Configuration de navigation par défaut
const defaultNavItems: NavItem[] = [
  {
    title: 'Tableau de bord',
    href: '/dashboard',
    icon: HomeIcon,
  },
  {
    title: 'Boutiques',
    href: '/dashboard/stores',
    icon: StoreIcon,
    roles: ['admin', 'vendor'],
  },
  {
    title: 'Produits',
    href: '/dashboard/products',
    icon: PackageIcon,
    roles: ['admin', 'vendor'],
  },
  {
    title: 'Commandes',
    href: '/dashboard/orders',
    icon: ShoppingCartIcon,
    badge: '12',
  },
  {
    title: 'Clients',
    href: '/dashboard/customers',
    icon: UsersIcon,
    roles: ['admin'],
  },
  {
    title: 'Analytique',
    href: '/dashboard/analytics',
    icon: BarChart3Icon,
    children: [
      {
        title: 'Ventes',
        href: '/dashboard/analytics/sales',
      },
      {
        title: 'Trafic',
        href: '/dashboard/analytics/traffic',
      },
      {
        title: 'Conversion',
        href: '/dashboard/analytics/conversion',
      },
    ],
  },
  {
    title: 'Paiements',
    href: '/dashboard/payments',
    icon: CreditCardIcon,
    roles: ['admin', 'vendor'],
  },
  {
    title: 'Paramètres',
    href: '/dashboard/settings',
    icon: SettingsIcon,
  },
];

// Composant Sidebar
function Sidebar({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, hasRole, hasPermission } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const isItemVisible = (item: NavItem) => {
    if (item.roles && !item.roles.some(role => hasRole(role))) {
      return false;
    }
    if (item.permissions && !item.permissions.some(permission => hasPermission(permission))) {
      return false;
    }
    return true;
  };

  const renderNavItem = (item: NavItem, level = 0) => {
    if (!isItemVisible(item)) return null;

    const isActive = pathname === item.href;
    const isExpanded = expandedItems.includes(item.title);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.title}>
        <div
          className={cn(
            'flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground',
            isActive && 'bg-accent text-accent-foreground',
            level > 0 && 'ml-4'
          )}
        >
          <Link
            href={item.href}
            className="flex items-center space-x-2 flex-1"
          >
            {item.icon && <item.icon className="h-4 w-4" />}
            <span>{item.title}</span>
            {item.badge && (
              <Badge variant="secondary" className="ml-auto">
                {item.badge}
              </Badge>
            )}
          </Link>
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleExpanded(item.title)}
              className="h-auto p-1"
            >
              <ChevronDownIcon
                className={cn(
                  'h-3 w-3 transition-transform',
                  isExpanded && 'rotate-180'
                )}
              />
            </Button>
          )}
        </div>
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children?.map(child => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn('pb-12', className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Dashboard
          </h2>
          <div className="space-y-1">
            {defaultNavItems.map(item => renderNavItem(item))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant Header
function Header() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications] = useState([
    { id: 1, title: 'Nouvelle commande', message: 'Commande #1234 reçue', time: '5 min' },
    { id: 2, title: 'Stock faible', message: 'Produit XYZ en rupture', time: '1h' },
  ]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Logique de recherche
    console.log('Recherche:', searchQuery);
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="flex h-16 items-center gap-4 px-4 md:px-6">
        {/* Menu mobile */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0 md:hidden">
              <MenuIcon className="h-5 w-5" />
              <span className="sr-only">Ouvrir le menu de navigation</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col">
            <Sidebar />
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <StoreIcon className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="hidden font-bold sm:inline-block">
              E-Commerce Dashboard
            </span>
          </Link>
        </div>

        {/* Barre de recherche */}
        <div className="flex-1 max-w-md">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </form>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {/* Thème */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          >
            <SunIcon className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <MoonIcon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Changer le thème</span>
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <BellIcon className="h-5 w-5" />
                {notifications.length > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
                  >
                    {notifications.length}
                  </Badge>
                )}
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <DropdownMenuItem key={notification.id} className="flex flex-col items-start space-y-1">
                    <div className="font-medium">{notification.title}</div>
                    <div className="text-sm text-muted-foreground">{notification.message}</div>
                    <div className="text-xs text-muted-foreground">{notification.time}</div>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled>
                  Aucune notification
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Menu utilisateur */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.image || undefined} alt={user?.name || ''} />
                  <AvatarFallback>
                    {user?.name?.charAt(0) || <UserIcon className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.name || 'Utilisateur'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                  {user?.role && (
                    <Badge variant="outline" className="w-fit">
                      {user.role}
                    </Badge>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile">
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Profil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  <span>Paramètres</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/help">
                  <HelpCircleIcon className="mr-2 h-4 w-4" />
                  <span>Aide</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOutIcon className="mr-2 h-4 w-4" />
                <span>Se déconnecter</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

// Composant Footer
function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="text-sm text-muted-foreground">
          © 2024 E-Commerce Dashboard. Tous droits réservés.
        </div>
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <Link href="/privacy" className="hover:text-foreground">
            Confidentialité
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            Conditions
          </Link>
          <Link href="/support" className="hover:text-foreground">
            Support
          </Link>
        </div>
      </div>
    </footer>
  );
}

// Composant principal DashboardLayout
export function DashboardLayout({
  children,
  title,
  description,
  breadcrumbs = [],
  actions,
  className,
  sidebar = true,
  header = true,
  footer = true,
}: DashboardLayoutProps) {
  const { requireAuth } = useAuth();

  useEffect(() => {
    requireAuth();
  }, [requireAuth]);

  return (
    <div className="min-h-screen bg-background">
      {header && <Header />}
      
      <div className="flex">
        {sidebar && (
          <aside className="hidden w-64 border-r bg-background md:block">
            <Sidebar className="h-full" />
          </aside>
        )}
        
        <main className={cn('flex-1', className)}>
          <div className="container mx-auto p-4 md:p-6 space-y-6">
            {/* En-tête de page */}
            {(title || description || breadcrumbs.length > 0 || actions) && (
              <div className="space-y-4">
                {/* Fil d'Ariane */}
                {breadcrumbs.length > 0 && (
                  <Breadcrumb>
                    <BreadcrumbList>
                      {breadcrumbs.map((item, index) => (
                        <React.Fragment key={index}>
                          <BreadcrumbItem>
                            {item.href ? (
                              <BreadcrumbLink href={item.href}>
                                {item.title}
                              </BreadcrumbLink>
                            ) : (
                              <BreadcrumbPage>{item.title}</BreadcrumbPage>
                            )}
                          </BreadcrumbItem>
                          {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                        </React.Fragment>
                      ))}
                    </BreadcrumbList>
                  </Breadcrumb>
                )}

                {/* Titre et actions */}
                {(title || description || actions) && (
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      {title && (
                        <h1 className="text-3xl font-bold tracking-tight">
                          {title}
                        </h1>
                      )}
                      {description && (
                        <p className="text-muted-foreground">
                          {description}
                        </p>
                      )}
                    </div>
                    {actions && (
                      <div className="flex items-center space-x-2">
                        {actions}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Contenu principal */}
            {children}
          </div>
        </main>
      </div>
      
      {footer && <Footer />}
    </div>
  );
}

export default DashboardLayout;
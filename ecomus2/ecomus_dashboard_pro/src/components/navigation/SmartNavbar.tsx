"use client";

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import RoleNavigation from './RoleNavigation';
import { Bell, Search, HelpCircle, Zap } from 'lucide-react';

interface SmartNavbarProps {
  className?: string;
}

export function SmartNavbar({ className }: SmartNavbarProps) {
  const { data: session } = useSession();

  if (!session) {
    return (
      <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-blue-600" />
              <span className="font-bold text-xl">Ecomus</span>
            </Link>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link href="/auth/signin">Connexion</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/signup">S'inscrire</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo et titre */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-blue-600" />
              <span className="font-bold text-xl">Ecomus</span>
            </Link>
            
            {/* Navigation mobile */}
            <div className="md:hidden">
              <RoleNavigation variant="mobile" />
            </div>
          </div>

          {/* Barre de recherche */}
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Actions et navigation */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                3
              </Badge>
            </Button>

            {/* Aide */}
            <Button variant="ghost" size="sm">
              <HelpCircle className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-6" />

            {/* Navigation basée sur le rôle */}
            <div className="hidden md:block">
              <RoleNavigation variant="dropdown" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default SmartNavbar;

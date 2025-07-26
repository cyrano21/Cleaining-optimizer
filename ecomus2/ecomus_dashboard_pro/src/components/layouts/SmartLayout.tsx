"use client";

import { ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import SmartNavbar from '@/components/navigation/SmartNavbar';
import RoleNavigation from '@/components/navigation/RoleNavigation';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface SmartLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
  className?: string;
}

export function SmartLayout({ 
  children, 
  showSidebar = true, 
  className 
}: SmartLayoutProps) {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Pages où on ne veut pas de sidebar
  const noSidebarPages = [
    '/auth/',
    '/test-roles',
    '/',
  ];

  const shouldShowSidebar = showSidebar && 
    session && 
    !noSidebarPages.some(page => pathname.startsWith(page));

  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* Navigation principale */}
      <SmartNavbar />

      <div className="flex">
        {/* Sidebar conditionnelle */}
        {shouldShowSidebar && (
          <>
            <aside className="hidden lg:block w-64 min-h-screen bg-white border-r">
              <div className="p-6">
                <RoleNavigation variant="sidebar" />
              </div>
            </aside>
            <Separator orientation="vertical" className="hidden lg:block" />
          </>
        )}

        {/* Contenu principal */}
        <main className={cn(
          "flex-1 min-h-screen",
          shouldShowSidebar ? "lg:pl-0" : "",
          className
        )}>
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default SmartLayout;

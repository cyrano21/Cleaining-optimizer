"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

// Interface de base pour toutes les sidebars
export interface SidebarBaseProps {
  open: boolean;
  collapsed: boolean;
  onOpenChange: (open: boolean) => void;
  onCollapsedChange: (collapsed: boolean) => void;
  children?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'admin' | 'vendor' | 'user' | 'super-admin';
  useFlexLayout?: boolean; // Nouveau prop pour le layout flex
}

export function SidebarBase({
  open,
  collapsed,
  onOpenChange,
  children,
  className,
  variant = 'default',
  useFlexLayout = false
}: SidebarBaseProps) {
  // Hook pour fermer la sidebar au clic en dehors sur mobile
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      const sidebar = document.querySelector('.sidebar');
      const target = e.target as HTMLElement;
      
      if (sidebar && !sidebar.contains(target) && !target.closest('.sidebar-trigger')) {
        onOpenChange(false);
      }
    };

    // Seulement sur mobile
    if (window.innerWidth <= 768) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [open, onOpenChange]);

  // Fermer la sidebar lors du changement de route sur mobile
  const pathname = usePathname();
  useEffect(() => {
    if (window.innerWidth <= 768) {
      onOpenChange(false);
    }
  }, [pathname, onOpenChange]);

  // Classes de base communes à toutes les sidebars
  const baseClasses = cn(
    "sidebar h-screen flex flex-col transition-all duration-300 ease-in-out custom-scrollbar",
    // Glassmorphism moderne
    "backdrop-blur-xl border-r border-white/20 dark:border-gray-800/50",
    "bg-white/80 dark:bg-gray-900/80",
    "shadow-2xl shadow-black/10 dark:shadow-black/30",
    
    // Layout flex ou fixed selon le prop
    useFlexLayout 
      ? cn(
          // Mode flex layout - pour les dashboards modernes
          "relative flex-shrink-0",
          collapsed ? "w-16" : "w-72",
          // Caché sur mobile par défaut
          "hidden lg:flex",
          // Mode mobile avec overlay si open
          open && "fixed inset-y-0 left-0 z-40 w-72 lg:relative lg:z-auto flex"
        )
      : cn(
          // Mode fixed traditionnel
          "fixed left-0 top-0 z-40",
          // Affichage mobile : cachée par défaut, visible seulement si open
          open
            ? "translate-x-0 w-full max-w-[90vw] sm:max-w-xs md:max-w-sm lg:w-72 lg:max-w-72"
            : "-translate-x-full lg:translate-x-0",
          // Largeur desktop selon l'état collapsed
          !open && collapsed && "lg:w-16",
          !open && !collapsed && "lg:w-72"
        ),
    
    // Classe open pour le CSS
    open && "open",
    // Classes variantes
    variant === 'admin' && "admin-sidebar",
    variant === 'vendor' && "vendor-sidebar",
    variant === 'user' && "user-sidebar",
    variant === 'super-admin' && "super-admin-sidebar",
    className
  );

  return (
    <>
      {/* Overlay mobile - seulement pour le mode flex layout quand ouvert */}
      {useFlexLayout && open && (
        <div 
          className="sidebar-overlay fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => onOpenChange(false)}
          aria-hidden="true"
        />
      )}
      
      {/* Overlay mobile - mode traditionnel */}
      {!useFlexLayout && open && (
        <div 
          className="sidebar-overlay fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => onOpenChange(false)}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <aside className={baseClasses}>
        {/* Gradient overlay décoratif */}
        <div className={cn(
          "absolute inset-0 pointer-events-none",
          variant === 'default' && "bg-gradient-to-b from-blue-50/50 via-transparent to-indigo-50/50 dark:from-gray-800/50 dark:via-transparent dark:to-gray-900/50",
          variant === 'admin' && "bg-gradient-to-b from-red-50/50 via-transparent to-pink-50/50 dark:from-gray-800/50 dark:via-transparent dark:to-gray-900/50",
          variant === 'vendor' && "bg-gradient-to-b from-green-50/50 via-transparent to-emerald-50/50 dark:from-gray-800/50 dark:via-transparent dark:to-gray-900/50",
          variant === 'user' && "bg-gradient-to-b from-blue-50/50 via-transparent to-indigo-50/50 dark:from-gray-800/50 dark:via-transparent dark:to-gray-900/50",
          variant === 'super-admin' && "bg-gradient-to-b from-purple-50/50 via-transparent to-violet-50/50 dark:from-gray-800/50 dark:via-transparent dark:to-gray-900/50"
        )} />

        {/* Bouton fermer mobile */}
        {((!useFlexLayout) || (useFlexLayout && open)) && (
          <button
            onClick={() => onOpenChange(false)}
            className={cn(
              "lg:hidden absolute top-4 right-4 p-2 rounded-lg",
              "bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm",
              "border border-white/20 dark:border-gray-700/50",
              "hover:bg-white/80 dark:hover:bg-gray-700/80",
              "transition-all duration-200 z-10"
            )}
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* Contenu de la sidebar */}
        <div className="relative flex-1 flex flex-col">
          {children}
        </div>
      </aside>
    </>
  );
}
"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Store,
  Users,
  Package,
  ShoppingCart,
  CreditCard,
  BarChart3,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  LogOut,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: number;
  children?: NavigationItem[];
}

interface ModernSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  currentPath: string;
  userRole: "admin" | "vendor" | "user";
  className?: string;
}

const navigationItems: Record<string, NavigationItem[]> = {
  admin: [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      href: "/admin/dashboard",
    },
    {
      id: "stores",
      label: "Magasins",
      icon: <Store className="w-5 h-5" />,
      href: "/admin/stores",
      badge: 3,
    },
    {
      id: "users",
      label: "Utilisateurs",
      icon: <Users className="w-5 h-5" />,
      href: "/admin/users",
    },
    {
      id: "products",
      label: "Produits",
      icon: <Package className="w-5 h-5" />,
      href: "/admin/products",
      children: [
        {
          id: "all-products",
          label: "Tous les produits",
          icon: <Package className="w-4 h-4" />,
          href: "/admin/products/all",
        },
        {
          id: "categories",
          label: "Catégories",
          icon: <Package className="w-4 h-4" />,
          href: "/admin/products/categories",
        },
      ],
    },
    {
      id: "orders",
      label: "Commandes",
      icon: <ShoppingCart className="w-5 h-5" />,
      href: "/admin/orders",
      badge: 12,
    },
    {
      id: "payments",
      label: "Paiements",
      icon: <CreditCard className="w-5 h-5" />,
      href: "/admin/payments",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: <BarChart3 className="w-5 h-5" />,
      href: "/admin/analytics",
    },
    {
      id: "settings",
      label: "Paramètres",
      icon: <Settings className="w-5 h-5" />,
      href: "/admin/settings",
    },
  ],
  vendor: [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      href: "/vendor/dashboard",
    },
    {
      id: "products",
      label: "Mes Produits",
      icon: <Package className="w-5 h-5" />,
      href: "/vendor/products",
    },
    {
      id: "orders",
      label: "Commandes",
      icon: <ShoppingCart className="w-5 h-5" />,
      href: "/vendor/orders",
      badge: 5,
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: <BarChart3 className="w-5 h-5" />,
      href: "/vendor/analytics",
    },
    {
      id: "settings",
      label: "Paramètres",
      icon: <Settings className="w-5 h-5" />,
      href: "/vendor/settings",
    },
  ],
  user: [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      href: "/user/dashboard",
    },
    {
      id: "orders",
      label: "Mes Commandes",
      icon: <ShoppingCart className="w-5 h-5" />,
      href: "/user/orders",
    },
    {
      id: "profile",
      label: "Profil",
      icon: <User className="w-5 h-5" />,
      href: "/user/profile",
    },
  ],
};

export function ModernSidebar({
  isOpen,
  onToggle,
  currentPath,
  userRole,
  className,
}: ModernSidebarProps) {
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);
  const items = navigationItems[userRole] || [];

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  return (
    <>
      {/* Overlay pour mobile */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onToggle}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          x: isOpen ? 0 : -280,
          transition: { duration: 0.3, ease: "easeInOut" },
        }}
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-70 bg-white border-r border-gray-200 shadow-xl lg:relative lg:translate-x-0",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">EcomusDash</h1>
              <p className="text-xs text-gray-500 capitalize">{userRole}</p>
            </div>
          </motion.div>

          <button
            onClick={onToggle}
            className="lg:hidden p-1 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Fermer le menu"
            title="Fermer le menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            {items.map((item, index) => (
              <NavItem
                key={item.id}
                item={item}
                currentPath={currentPath}
                isExpanded={expandedItems.includes(item.id)}
                onToggleExpanded={() => toggleExpanded(item.id)}
                index={index}
              />
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Déconnexion</span>
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}

interface NavItemProps {
  item: NavigationItem;
  currentPath: string;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  index: number;
}

function NavItem({
  item,
  currentPath,
  isExpanded,
  onToggleExpanded,
  index,
}: NavItemProps) {
  const isActive = currentPath === item.href;
  const hasChildren = item.children && item.children.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div
        className={cn(
          "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200",
          isActive
            ? "bg-blue-50 text-blue-600 shadow-sm"
            : "text-gray-700 hover:bg-gray-50"
        )}
        onClick={hasChildren ? onToggleExpanded : undefined}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "transition-colors",
              isActive ? "text-blue-600" : "text-gray-500"
            )}
          >
            {item.icon}
          </div>
          <span className="font-medium">{item.label}</span>
          {item.badge && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-2 py-1 bg-red-500 text-white text-xs rounded-full"
            >
              {item.badge}
            </motion.span>
          )}
        </div>

        {hasChildren && (
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        )}
      </div>

      {/* Sous-menu */}
      {hasChildren && (
        <motion.div
          initial={false}
          animate={{
            blockSize: isExpanded ? "auto" : 0,
            opacity: isExpanded ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
          className="ml-4 overflow-hidden"
        >
          <div className="py-2 space-y-1">
            {item.children?.map((child) => (
              <div
                key={child.id}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors",
                  currentPath === child.href
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                {child.icon}
                <span className="text-sm">{child.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

interface TopBarProps {
  onToggleSidebar: () => void;
  className?: string;
}

export function ModernTopBar({ onToggleSidebar, className }: TopBarProps) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={cn(
        "bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between",
        className
      )}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Ouvrir le menu"
          title="Ouvrir le menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
        </button>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900">John Doe</p>
            <p className="text-xs text-gray-500">Admin</p>
          </div>
        </div>
      </div>
    </motion.header>
  );
}

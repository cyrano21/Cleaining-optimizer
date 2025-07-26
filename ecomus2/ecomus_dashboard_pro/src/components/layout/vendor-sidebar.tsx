"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  Home,
  ShoppingBag,
  Package,
  DollarSign,
  Settings,
  ChevronRight,
  Store,
  BarChart2,
  FileText,
  Users,
  MessageSquare,
  Truck,
  Tag,
  TrendingUp,
  Calendar,
  CreditCard,
  Star,
  Bell,
  HelpCircle,
  Layers,
  Gift,
  Target,
} from "lucide-react";
import { SidebarBase } from "./sidebar-base";
import { Avatar, AvatarFallback, AvatarImage, getGravatarUrl } from '@/components/ui/avatar';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface VendorSidebarProps {
  open: boolean;
  collapsed: boolean;
  onOpenChange: (open: boolean) => void;
  onCollapsedChange: (collapsed: boolean) => void;
}

export function VendorSidebar({
  open,
  collapsed,
  onOpenChange,
  onCollapsedChange,
}: VendorSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Vendor-specific navigation items
  const navigationItems = [
    {
      name: "Dashboard",
      href: "/vendor-dashboard",
      icon: Home,
    },
    {
      name: "Store Management",
      href: "/vendor-dashboard/store-settings",
      icon: Store,
      badge: "ACTIVE",
      badgeColor: "bg-green-500",
    },
    {
      name: "Design & Templates",
      icon: Layers,
      children: [
        { name: "Design Studio", href: "/vendor-dashboard/design" },
        { name: "Templates Gallery", href: "/vendor-dashboard/templates" },
        { name: "Customize", href: "/vendor-dashboard/customize" },
      ],
    },
    {
      name: "Products",
      icon: Package,
      children: [
        { name: "All Products", href: "/vendor-dashboard/products" },
        { name: "Add Product", href: "/vendor-dashboard/products/add" },
        { name: "Categories", href: "/vendor-dashboard/products/categories" },
        { name: "Inventory", href: "/vendor-dashboard/products/inventory" },
      ],
    },
    {
      name: "Orders",
      icon: ShoppingBag,
      badge: "8",
      badgeColor: "bg-red-500",
      children: [
        { name: "All Orders", href: "/vendor-dashboard/orders" },
        { name: "Pending", href: "/vendor-dashboard/orders/pending" },
        { name: "Processing", href: "/vendor-dashboard/orders/processing" },
        { name: "Shipped", href: "/vendor-dashboard/orders/shipped" },
        { name: "Completed", href: "/vendor-dashboard/orders/completed" },
      ],
    },
    {
      name: "Analytics",
      href: "/vendor-dashboard/analytics",
      icon: BarChart2,
    },
    {
      name: "Dropshipping",
      href: "/vendor-dashboard/dropshipping",
      icon: Truck,
      badge: "NEW",
      badgeColor: "bg-purple-500",
    },
    {
      name: "Finance",
      icon: DollarSign,
      children: [
        { name: "Earnings", href: "/vendor-dashboard/earnings" },
        { name: "Withdrawals", href: "/vendor-dashboard/finance/withdrawals" },
        { name: "Invoices", href: "/vendor-dashboard/finance/invoices" },
        { name: "Tax Reports", href: "/vendor-dashboard/finance/tax" },
      ],
    },
    {
      name: "Marketing",
      icon: TrendingUp,
      children: [
        { name: "Promotions", href: "/vendor-dashboard/marketing/promotions" },
        { name: "Coupons", href: "/vendor-dashboard/marketing/coupons" },
        { name: "Campaigns", href: "/vendor-dashboard/marketing/campaigns" },
      ],
    },
    {
      name: "Gamification",
      href: "/vendor-dashboard/gamified",
      icon: Gift,
      badge: "FUN",
      badgeColor: "bg-pink-500",
    },
    {
      name: "Store Selection",
      href: "/vendor-dashboard/store-selection",
      icon: Store,
    },
    {
      name: "Customers",
      href: "/vendor-dashboard/customers",
      icon: Users,
    },
    {
      name: "Reviews",
      href: "/vendor-dashboard/reviews",
      icon: Star,
      badge: "4.8",
      badgeColor: "bg-yellow-500",
    },
    {
      name: "Messages",
      href: "/vendor-dashboard/messages",
      icon: MessageSquare,
      badge: "3",
      badgeColor: "bg-blue-500",
    },
    {
      name: "Administration",
      icon: Settings,
      adminOnly: true,
      children: [
        { name: "Gestion Templates", href: "/vendor-dashboard/admin/templates" },
        { name: "Utilisateurs", href: "/vendor-dashboard/admin/users" },
        { name: "Système", href: "/vendor-dashboard/admin/system" },
      ],
    },
    {
      name: "Settings",
      href: "/vendor-dashboard/settings",
      icon: Settings,
    },
  ];

  const toggleExpanded = (name: string) => {
    setExpandedItems((prev) =>
      prev.includes(name)
        ? prev.filter((item) => item !== name)
        : [...prev, name]
    );
  };

  const getInitials = useCallback((name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, []);

  return (
    <SidebarBase
      open={open}
      collapsed={collapsed}
      onOpenChange={onOpenChange}
      onCollapsedChange={onCollapsedChange}
      variant="vendor"
      useFlexLayout={true}
    >
      {/* Header */}
      <div className="relative flex h-20 items-center justify-between border-b border-white/30 dark:border-gray-700/50 px-6">
        <Link href="/vendor-dashboard" className="flex items-center group">
          {collapsed ? (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg">
              <Store className="h-6 w-6 text-white" />
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <Store className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <h4 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Vendor Portal
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Seller Dashboard
                </p>
              </div>
            </div>
          )}
        </Link>
      </div>

      {/* Vendor Profile */}
      <div className={cn(
        "relative border-b border-white/30 dark:border-gray-700/50 p-4",
        collapsed && "px-2"
      )}>
        <div className={cn(
          "flex items-center gap-3",
          collapsed && "justify-center"
        )}>
          <Avatar className="h-12 w-12 ring-2 ring-green-500/20">
            <AvatarImage src={session?.user?.image || (session?.user?.email ? getGravatarUrl(session.user.email, 96) : "")} />
            <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
              {getInitials(session?.user?.name || "Vendor")}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {session?.user?.name || "Vendor Name"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                Store: TechGadgets Pro
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs">
                  VERIFIED
                </Badge>
                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                <span className="text-xs text-gray-600 dark:text-gray-400">4.8</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sales Overview - Vendor specific */}
      {!collapsed && (
        <div className="border-b border-white/30 dark:border-gray-700/50 p-4 space-y-3">
          {/* Monthly Progress */}
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-600 dark:text-gray-400">Monthly Target</p>
              <Target className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">$12,456</p>
            <Progress value={68} className="mt-2" />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              68% of $18,300 goal
            </p>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 text-center">
              <p className="text-xs text-gray-600 dark:text-gray-400">Today's Sales</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">$456</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2 text-center">
              <p className="text-xs text-gray-600 dark:text-gray-400">Pending Orders</p>
              <p className="text-lg font-bold text-purple-600 dark:text-purple-400">8</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-4">
        <div className={cn("space-y-1", collapsed ? "px-2" : "px-4")}>
          {navigationItems
            .filter((item) => {
              // Filtrer les items admin selon les droits utilisateur
              if (item.adminOnly) {
                return session?.user?.role && ['admin', 'super_admin'].includes(session.user.role);
              }
              return true;
            })
            .map((item) => {
            const Icon = item.icon;
            const isActive = item.href ? pathname === item.href : false;
            const isExpanded = expandedItems.includes(item.name);
            const hasChildren = item.children && item.children.length > 0;

            return (
              <div key={item.name}>
                {/* Main navigation item */}
                {item.href && !hasChildren ? (
                  <Link
                    href={item.href}
                    onClick={() => onOpenChange(false)}
                    className={cn(
                      "relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 group cursor-pointer",
                      isActive
                        ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-700 dark:text-green-300"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50",
                      collapsed && "justify-center px-2"
                    )}
                  >
                    <Icon className={cn(
                      "h-5 w-5 transition-colors",
                      isActive && "text-green-600 dark:text-green-400"
                    )} />
                    
                    {!collapsed && (
                      <>
                        <span className="flex-1 font-medium text-sm">
                          {item.name}
                        </span>
                        
                        {item.badge && (
                          <Badge className={cn(
                            "text-xs",
                            item.badgeColor || "bg-gray-200 dark:bg-gray-700"
                          )}>
                            {item.badge}
                          </Badge>
                        )}
                      </>
                    )}
                  </Link>
                ) : (
                  <div
                    className={cn(
                      "relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 group cursor-pointer",
                      isActive
                        ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-700 dark:text-green-300"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50",
                      collapsed && "justify-center px-2"
                    )}
                    onClick={() => {
                      if (hasChildren) {
                        toggleExpanded(item.name);
                      }
                    }}
                  >
                    <Icon className={cn(
                      "h-5 w-5 transition-colors",
                      isActive && "text-green-600 dark:text-green-400"
                    )} />
                    
                    {!collapsed && (
                      <>
                        <span className="flex-1 font-medium text-sm">
                          {item.name}
                        </span>
                        
                        {item.badge && (
                          <Badge className={cn(
                            "text-xs",
                            item.badgeColor || "bg-gray-200 dark:bg-gray-700"
                          )}>
                            {item.badge}
                          </Badge>
                        )}
                        
                        {hasChildren && (
                          <ChevronRight
                            className={cn(
                              "h-4 w-4 transition-transform duration-200",
                              isExpanded && "rotate-90"
                            )}
                          />
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Children items */}
                {!collapsed && hasChildren && isExpanded && (
                  <div className="mt-1 space-y-1 pl-11">
                    {item.children?.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => onOpenChange(false)}
                        className={cn(
                          "block rounded-md px-3 py-2 text-sm transition-all duration-200",
                          pathname === child.href
                            ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        )}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Footer Actions - Vendor specific */}
      <div className={cn(
        "relative border-t border-white/30 dark:border-gray-700/50 p-4 space-y-2",
        collapsed && "px-2"
      )}>
        {/* Notification Bell */}
        <Link
          href="/vendor-dashboard/notifications"
          className={cn(
            "flex items-center gap-3 w-full rounded-lg px-3 py-2.5",
            "text-gray-700 dark:text-gray-300",
            "hover:bg-gray-100/50 dark:hover:bg-gray-800/50",
            "transition-all duration-200 relative",
            collapsed && "justify-center px-2"
          )}
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
          {!collapsed && <span className="text-sm font-medium">Notifications</span>}
        </Link>

        {/* Help */}
        <Link
          href="/vendor-dashboard/help"
          className={cn(
            "flex items-center gap-3 w-full rounded-lg px-3 py-2.5",
            "text-gray-700 dark:text-gray-300",
            "hover:bg-gray-100/50 dark:hover:bg-gray-800/50",
            "transition-all duration-200",
            collapsed && "justify-center px-2"
          )}
        >
          <HelpCircle className="h-5 w-5" />
          {!collapsed && <span className="text-sm font-medium">Help Center</span>}
        </Link>
      </div>
    </SidebarBase>
  );
}
"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  Home,
  ShoppingBag,
  Package,
  Users,
  Settings,
  Store,
  Shield,
  BarChart2,
  FileText,
  MessageSquare,
  TrendingUp,
  Zap,
} from "lucide-react";
import { SidebarBase } from "./sidebar-base";
import { Avatar, AvatarFallback, AvatarImage, getGravatarUrl } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AdminSidebarProps {
  open: boolean;
  collapsed: boolean;
  onOpenChange: (open: boolean) => void;
  onCollapsedChange: (collapsed: boolean) => void;
}

export function AdminSidebar({
  open,
  collapsed,
  onOpenChange,
  onCollapsedChange,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Admin-specific navigation items
  const navigationItems = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: Home,
      badge: null,
    },
    {
      name: "Analytics",
      href: "/admin/analytics",
      icon: BarChart2,
      badge: "PRO",
      badgeColor: "bg-gradient-to-r from-purple-500 to-pink-500",
    },
    {
      name: "Control Center",
      href: "/admin/control-center",
      icon: Shield,
    },
    {
      name: "Store Management",
      href: "/admin/stores-management",
      icon: Store,
    },
    {
      name: "Products Management",
      href: "/admin/products-management",
      icon: Package,
    },
    {
      name: "User Management",
      href: "/admin/user-management",
      icon: Users,
    },
    {
      name: "Template Management",
      href: "/admin/template-management",
      icon: FileText,
    },
    {
      name: "Vendors",
      href: "/admin/vendors",
      icon: TrendingUp,
    },
    {
      name: "System Settings",
      href: "/admin/system-settings",
      icon: Settings,
    },
    {
      name: "Security",
      href: "/admin/security",
      icon: Shield,
    },
    {
      name: "Integrations",
      href: "/admin/integrations",
      icon: Zap,
    },
    {
      name: "Dashboards",
      href: "/admin/dashboards",
      icon: BarChart2,
    },
  ];

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
      variant="admin"
    >
      {/* Header */}
      <div className="relative flex h-20 items-center justify-between border-b border-white/30 dark:border-gray-700/50 px-6">
        <Link href="/admin" className="flex items-center group">
          {collapsed ? (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-red-500 to-pink-600 shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-red-500 to-pink-600 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <h4 className="text-xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                  Admin Panel
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Management System
                </p>
              </div>
            </div>
          )}
        </Link>
      </div>

      {/* Admin Profile */}
      <div className={cn(
        "relative border-b border-white/30 dark:border-gray-700/50 p-4",
        collapsed && "px-2"
      )}>
        <div className={cn(
          "flex items-center gap-3",
          collapsed && "justify-center"
        )}>
          <Avatar className="h-10 w-10 ring-2 ring-red-500/20">
            <AvatarImage src={session?.user?.image || (session?.user?.email ? getGravatarUrl(session.user.email, 96) : "")} />
            <AvatarFallback className="bg-gradient-to-br from-red-500 to-pink-600 text-white">
              {getInitials(session?.user?.name || "Admin")}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {session?.user?.name || "Administrator"}
              </p>
              <div className="flex items-center gap-1">
                <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs">
                  ADMIN
                </Badge>
                <Zap className="h-3 w-3 text-yellow-500" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats - Admin specific */}
      {!collapsed && (
        <div className="border-b border-white/30 dark:border-gray-700/50 p-4 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400">Today&apos;s Sales</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">$2,456</p>
            </div>
            <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-lg p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400">New Orders</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">12</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        <div className={cn("space-y-1", collapsed ? "px-2" : "px-4")}>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href ? pathname === item.href : false;
            const hasChildren = false; // Simplified navigation without children

            return (
              <div key={item.name}>
                {/* Main navigation item */}
                <Link
                  href={item.href || "#"}
                  onClick={() => onOpenChange(false)}
                  className={cn(
                    "relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 group cursor-pointer",
                    isActive
                      ? "bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-700 dark:text-red-300"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50",
                    collapsed && "justify-center px-2"
                  )}
                >
                  <Icon className={cn(
                    "h-5 w-5 transition-colors",
                    isActive && "text-red-600 dark:text-red-400"
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


              </div>
            );
          })}
        </div>
      </nav>

      {/* Footer Actions */}
      <div className={cn(
        "relative border-t border-white/30 dark:border-gray-700/50 p-4",
        collapsed && "px-2"
      )}>
        {/* Support Button */}
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "w-full",
            collapsed && "px-0"
          )}
          asChild
        >
          <Link href="/admin/support">
            <MessageSquare className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Support</span>}
          </Link>
        </Button>
      </div>
    </SidebarBase>
  );
}
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  Home,
  BarChart2,
  ShoppingBag,
  Package,
  Users,
  CreditCard,
  Tag,
  Settings,
  ChevronRight,
  ChevronDown,
  Grid,
  Bell,
  List,
  Heart,
  Star,
  Store,
  Shield,
  Moon,
  Sun,
  Sparkles,
  Bug,
  Wrench,
} from "lucide-react";
import { useTheme } from "next-themes";
import { SidebarBase } from "./sidebar-base";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface SidebarProps {
  open: boolean;
  collapsed: boolean;
  onOpenChange: (open: boolean) => void;
  onCollapsedChange: (collapsed: boolean) => void;
}

export function Sidebar({
  open,
  collapsed,
  onOpenChange,
  onCollapsedChange,
}: SidebarProps) {
  const pathname = usePathname();
  const currentPath = pathname || "/";
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Navigation items configuration
  const navigationItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
      badge: null,
    },
    {
      name: "Analytics",
      href: "/analytics",
      icon: BarChart2,
      badge: "PRO",
      badgeColor: "bg-gradient-to-r from-purple-500 to-pink-500",
    },
    {
      name: "E-commerce",
      icon: ShoppingBag,
      badge: null,
      children: [
        { name: "Products", href: "/e-commerce/products" },
        { name: "Categories", href: "/e-commerce/categories" },
        { name: "Attributes", href: "/e-commerce/attributes" },
        { name: "Orders", href: "/e-commerce/orders" },
        { name: "Customers", href: "/e-commerce/customers" },
        { name: "Reviews", href: "/e-commerce/reviews" },
      ],
    },
    {
      name: "Stores",
      href: "/stores",
      icon: Store,
      badge: "NEW",
      badgeColor: "bg-gradient-to-r from-green-500 to-emerald-500",
    },
    {
      name: "Products",
      href: "/products",
      icon: Package,
      badge: null,
    },
    {
      name: "Users",
      icon: Users,
      badge: null,
      children: [
        { name: "All Users", href: "/users" },
        { name: "Roles", href: "/users/roles" },
        { name: "Permissions", href: "/users/permissions" },
      ],
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
      variant="default"
    >
      {/* Header */}
      <div className="relative flex h-20 items-center justify-between border-b border-white/30 dark:border-gray-700/50 px-6">
        <Link href="/" className="flex items-center group">
          {collapsed ? (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <h4 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Hope UI
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Pro Dashboard
                </p>
              </div>
            </div>
          )}
        </Link>
      </div>

      {/* User Profile */}
      <div className={cn(
        "relative border-b border-white/30 dark:border-gray-700/50 p-4",
        collapsed && "px-2"
      )}>
        <div className={cn(
          "flex items-center gap-3",
          collapsed && "justify-center"
        )}>
          <Avatar className="h-10 w-10 ring-2 ring-white/50">
            <AvatarImage src={session?.user?.image || ""} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
              {getInitials(session?.user?.name || "User")}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {session?.user?.name || "User"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {session?.user?.email || "user@example.com"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        <div className={cn("space-y-1", collapsed ? "px-2" : "px-4")}>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href ? currentPath === item.href : false;
            const isExpanded = expandedItems.includes(item.name);
            const hasChildren = item.children && item.children.length > 0;

            return (
              <div key={item.name}>
                {/* Main navigation item */}
                <div
                  className={cn(
                    "relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 group cursor-pointer",
                    isActive
                      ? "bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-700 dark:text-blue-300"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50",
                    collapsed && "justify-center px-2"
                  )}
                  onClick={() => {
                    if (hasChildren) {
                      toggleExpanded(item.name);
                    } else if (item.href) {
                      onOpenChange(false);
                    }
                  }}
                >
                  <Icon className={cn(
                    "h-5 w-5 transition-colors",
                    isActive && "text-blue-600 dark:text-blue-400"
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
                          currentPath === child.href
                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
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

      {/* Footer Actions */}
      <div className={cn(
        "relative border-t border-white/30 dark:border-gray-700/50 p-4 space-y-2",
        collapsed && "px-2"
      )}>
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className={cn(
            "flex items-center gap-3 w-full rounded-lg px-3 py-2.5",
            "text-gray-700 dark:text-gray-300",
            "hover:bg-gray-100/50 dark:hover:bg-gray-800/50",
            "transition-all duration-200",
            collapsed && "justify-center px-2"
          )}
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
          {!collapsed && (
            <span className="text-sm font-medium">
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </span>
          )}
        </button>

        {/* Collapse Toggle - Desktop only */}
        <button
          onClick={() => onCollapsedChange(!collapsed)}
          className={cn(
            "hidden lg:flex items-center gap-3 w-full rounded-lg px-3 py-2.5",
            "text-gray-700 dark:text-gray-300",
            "hover:bg-gray-100/50 dark:hover:bg-gray-800/50",
            "transition-all duration-200",
            collapsed && "justify-center px-2"
          )}
        >
          <ChevronRight
            className={cn(
              "h-5 w-5 transition-transform duration-200",
              !collapsed && "rotate-180"
            )}
          />
          {!collapsed && (
            <span className="text-sm font-medium">Collapse</span>
          )}
        </button>
      </div>
    </SidebarBase>
  );
}
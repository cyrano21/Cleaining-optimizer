"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  Home,
  ShoppingBag,
  Heart,
  User,
  Settings,
  CreditCard,
  MapPin,
  Bell,
  Package,
  Star,
  MessageSquare,
  HelpCircle,
  Clock,
  Gift,
  Award,
  TrendingUp,
  Bookmark,
} from "lucide-react";
import { SidebarBase } from "./sidebar-base";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface UserSidebarProps {
  open: boolean;
  collapsed: boolean;
  onOpenChange: (open: boolean) => void;
  onCollapsedChange: (collapsed: boolean) => void;
}

export function UserSidebar({
  open,
  collapsed,
  onOpenChange,
  onCollapsedChange,
}: UserSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  // User-specific navigation items
  const navigationItems = [
    {
      name: "Dashboard",
      href: "/user/dashboard",
      icon: Home,
    },
    {
      name: "My Orders",
      href: "/user/orders",
      icon: ShoppingBag,
      badge: "3",
      badgeColor: "bg-blue-500",
    },
    {
      name: "Wishlist",
      href: "/user/wishlist",
      icon: Heart,
      badge: "12",
      badgeColor: "bg-pink-500",
    },
    {
      name: "My Reviews",
      href: "/user/reviews",
      icon: Star,
    },
    {
      name: "Saved Addresses",
      href: "/user/addresses",
      icon: MapPin,
    },
    {
      name: "Payment Methods",
      href: "/user/payment-methods",
      icon: CreditCard,
    },
    {
      name: "Rewards",
      href: "/user/rewards",
      icon: Award,
      badge: "NEW",
      badgeColor: "bg-gradient-to-r from-yellow-500 to-orange-500",
    },
    {
      name: "Messages",
      href: "/user/messages",
      icon: MessageSquare,
      badge: "5",
      badgeColor: "bg-green-500",
    },
    {
      name: "Notifications",
      href: "/user/notifications",
      icon: Bell,
    },
    {
      name: "Account Settings",
      href: "/user/settings",
      icon: Settings,
    },
    {
      name: "Help & Support",
      href: "/user/support",
      icon: HelpCircle,
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
      variant="user"
    >
      {/* Header */}
      <div className="relative flex h-20 items-center justify-between border-b border-white/30 dark:border-gray-700/50 px-6">
        <Link href="/user/dashboard" className="flex items-center group">
          {collapsed ? (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 shadow-lg">
              <User className="h-6 w-6 text-white" />
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <User className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <h4 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  My Account
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Customer Portal
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
          <Avatar className="h-12 w-12 ring-2 ring-blue-500/20">
            <AvatarImage src={session?.user?.image || ""} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
              {getInitials(session?.user?.name || "User")}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {session?.user?.name || "Customer"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {session?.user?.email || "user@example.com"}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs">
                  GOLD MEMBER
                </Badge>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loyalty Program - User specific */}
      {!collapsed && (
        <div className="border-b border-white/30 dark:border-gray-700/50 p-4 space-y-3">
          <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-600 dark:text-gray-400">Loyalty Points</p>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">2,456</p>
            <Progress value={75} className="mt-2" />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              544 points to next level
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2 text-center">
              <p className="text-xs text-gray-600 dark:text-gray-400">Total Orders</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">48</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2 text-center">
              <p className="text-xs text-gray-600 dark:text-gray-400">Total Spent</p>
              <p className="text-lg font-bold text-purple-600 dark:text-purple-400">$3.2K</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        <div className={cn("space-y-1", collapsed ? "px-2" : "px-4")}>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => onOpenChange(false)}
                className={cn(
                  "relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 group",
                  isActive
                    ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-700 dark:text-blue-300"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50",
                  collapsed && "justify-center px-2"
                )}
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
                  </>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Recent Activity - User specific */}
      {!collapsed && (
        <div className="border-t border-white/30 dark:border-gray-700/50 p-4">
          <h5 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-3">
            RECENT ACTIVITY
          </h5>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <Clock className="h-3 w-3 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">Order #1234 delivered</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Gift className="h-3 w-3 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">Earned 50 reward points</span>
            </div>
          </div>
        </div>
      )}
    </SidebarBase>
  );
}
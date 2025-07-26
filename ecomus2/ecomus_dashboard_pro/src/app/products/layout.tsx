"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { VendorSidebar } from "@/components/layout/vendor-sidebar";
import { UserSidebar } from "@/components/layout/user-sidebar";
import { Header } from "@/components/layout/header";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { checkAdminAccess, hasRoleOrHigher, normalizeRole } from "@/lib/role-utils";

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Redirection si pas de session
  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    redirect("/auth/signin");
  }  // Vérifier si l'utilisateur a les droits pour gérer les produits
  const userRole = session.user?.role || '';
  const normalizedRole = normalizeRole(userRole);
  const hasProductAccess = hasRoleOrHigher(userRole, 'MODERATOR') || checkAdminAccess(userRole);

  if (!hasProductAccess) {
    redirect("/dashboard");
  }

  // Déterminer quelle sidebar utiliser selon le rôle
  const isAdmin = checkAdminAccess(userRole);
  const isVendor = hasRoleOrHigher(userRole, 'MODERATOR') && !isAdmin;

  const SidebarComponent = isAdmin ? AdminSidebar : isVendor ? VendorSidebar : UserSidebar;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar adaptée au rôle */}
      <SidebarComponent
        open={sidebarOpen}
        collapsed={sidebarCollapsed}
        onOpenChange={setSidebarOpen}
        onCollapsedChange={setSidebarCollapsed}
      />

      {/* Overlay pour mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-72"
        }`}
      >
        {/* Header avec notifications, messages et profil */}
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          sidebarCollapsed={sidebarCollapsed}
        />

        {/* Page Content */}
        <main className="p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { VendorSidebar } from "@/components/layout/vendor-sidebar";
import { Header } from "@/components/layout/header";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function VendorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Redirection si pas de session ou pas de droits vendor
  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    redirect("/auth/signin");
  }

  // Vérifier si l'utilisateur a les droits vendor/admin
  const userRole = session.user?.role;
  const hasVendorAccess =
    userRole === "vendor" ||
    userRole === "admin" ||
    userRole === "super_admin" ||
    userRole === "MODERATOR" ||
    userRole === "ADMIN" ||
    userRole === "SUPER_ADMIN";

  if (!hasVendorAccess) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Vendor Sidebar */}
      <VendorSidebar
        open={sidebarOpen}
        collapsed={sidebarOpen ? false : sidebarCollapsed}
        onOpenChange={setSidebarOpen}
        onCollapsedChange={setSidebarCollapsed}
      />
      
      {/* Overlay pour mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Main Content - Prend tout l'espace restant */}
      <div className="flex-1 flex flex-col min-h-screen pt-16">
        {/* Header avec notifications, messages et profil */}
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          sidebarCollapsed={sidebarCollapsed}
        />

        {/* Page Content - Prend tout l'espace vertical restant */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

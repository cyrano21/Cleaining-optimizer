"use client";

import { useState } from "react";
import { SuperAdminSidebar } from "@/components/layout/super-admin-sidebar";
import { Header } from "@/components/layout/header";
import { ThemeCustomizer } from "@/components/theme/ThemeCustomizer";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ThemeProvider as NextThemesProvider } from "@/components/providers/theme-provider";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function SuperAdminLayout({
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
  }

  // Vérifier si l'utilisateur est super admin
  const userRole = session.user?.role || "";
  if (userRole !== "super_admin" && userRole !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <ThemeProvider dashboardType="super_admin">
        <div className="min-h-screen bg-purple-50 dark:bg-purple-950 transition-colors duration-300">
          {/* Theme Customizer - Super Admin */}
          <ThemeCustomizer dashboardType="super-admin" />
          {/* Super Admin Sidebar */}
          <SuperAdminSidebar
            open={sidebarOpen}
            collapsed={sidebarCollapsed}
            onOpenChange={setSidebarOpen}
            onCollapsedChange={setSidebarCollapsed}
          />{" "}
          {/* Overlay pour mobile */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          {/* Main Content */}
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
            />{" "}
            {/* Page Content */}
            <main className="p-4 sm:p-6">{children}</main>
          </div>
        </div>
      </ThemeProvider>
    </NextThemesProvider>
  );
}

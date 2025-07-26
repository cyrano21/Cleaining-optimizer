"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { Header } from "@/components/layout/header";
import { ThemeCustomizer } from "@/components/theme/ThemeCustomizer";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ThemeProvider as NextThemesProvider } from "@/components/providers/theme-provider";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { checkAdminAccess } from "@/lib/role-utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Redirection si pas de session
  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    router.push("/auth/signin");
    return null;
  }

  // Vérifier si l'utilisateur a les droits admin
  const userRole = session.user?.role || "";
  if (!checkAdminAccess(userRole)) {
    router.push("/dashboard");
    return null;
  }

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <ThemeProvider
        dashboardType={
          session.user?.role === "super_admin" ? "super_admin" : "admin"
        }
      >
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 flex">
          {/* Sidebar à gauche */}
          <AdminSidebar
            open={sidebarOpen}
            collapsed={sidebarCollapsed}
            onOpenChange={setSidebarOpen}
            onCollapsedChange={setSidebarCollapsed}
          />

          {/* Overlay pour mobile */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-55 bg-black/20 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Main Content, à droite de la sidebar */}
          <div className="flex-1 flex flex-col relative">
            {/* Header */}
            <Header
              onMenuClick={() => setSidebarOpen(true)}
              onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
            {/* Correction ici : padding top forcé */}
            <main className="flex-1 !pt-[64px] p-4 sm:p-6">{children}</main>
          </div>
        </div>
      </ThemeProvider>
    </NextThemesProvider>
  );
}

"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NotificationSystem } from "@/components/ui/notification-system";
import { motion, AnimatePresence } from "framer-motion";
import { Menu } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Système de notifications global */}
      <NotificationSystem notifications={[]} />
      
      {/* Background pattern moderne */}
      <div className="fixed inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
      
      {/* Sidebar moderne */}
      <Sidebar
        open={sidebarOpen}
        collapsed={sidebarCollapsed}
        onOpenChange={setSidebarOpen}
        onCollapsedChange={setSidebarCollapsed}
      />

      {/* Main Content avec animations */}
      <motion.div
        className={cn(
          "transition-all duration-300 ease-in-out relative z-10",
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-72",
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header moderne */}
        <Header
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          sidebarCollapsed={sidebarCollapsed}
        />

        {/* Page Content avec container moderne */}
        <main className="min-h-[calc(100vh-4rem)] relative">
          {/* Conteneur avec glassmorphism subtil */}
          <div className="backdrop-blur-sm bg-white/30 dark:bg-gray-900/30 min-h-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="relative"
            >
              {children}
            </motion.div>
          </div>
        </main>

        {/* Toggle de thème flottant */}
        <motion.div
          className="fixed bottom-6 right-6 z-50"
          initial={{ scale: 0, rotate: 180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 1, type: "spring", stiffness: 200 }}
        >
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-full p-2 shadow-lg border border-white/20">
            <ThemeToggle />
          </div>
        </motion.div>

        {/* Bouton de toggle sidebar flottant (visible seulement quand collapsed) */}
        <AnimatePresence>
          {sidebarCollapsed && (
            <motion.button
              onClick={() => setSidebarCollapsed(false)}
              className="fixed top-4 left-4 z-50 lg:flex hidden p-3 rounded-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-lg border border-white/20 hover:bg-white dark:hover:bg-gray-700 transition-all duration-200"
              initial={{ scale: 0, x: -20 }}
              animate={{ scale: 1, x: 0 }}
              exit={{ scale: 0, x: -20 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              aria-label="Expand sidebar"
            >
              <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>



      <style jsx>{`
        .bg-grid-pattern {
          background-image: 
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
}

export default DashboardLayout;

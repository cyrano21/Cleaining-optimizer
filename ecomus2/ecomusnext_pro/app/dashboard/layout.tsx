'use client';

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/providers/theme-provider";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import "../../styles/css/bootstrap.min.css";
import "../../styles/css/dashboard.css";
import "../../styles/css/dashboard-bootstrap.css";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <div className="dashboard-layout">
          <DashboardSidebar />
          <div className="dashboard-main">
            <DashboardHeader />
            <main className="dashboard-content">
              {children}
            </main>
          </div>
        </div>
      </ThemeProvider>
    </SessionProvider>
  );
}
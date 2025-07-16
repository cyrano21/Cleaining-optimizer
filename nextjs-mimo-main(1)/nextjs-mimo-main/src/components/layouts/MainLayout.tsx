"use client";

import React from "react";
import Navbar from "../ui/Navbar";
import Footer from "../ui/Footer";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const { theme } = useTheme();
  
  // Pages où la navbar ne devrait pas être affichée
  const hideNavbarPages = ["/login", "/register", "/onboarding"];
  const shouldShowNavbar = !hideNavbarPages.includes(pathname || "");

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      {shouldShowNavbar && <Navbar />}
      <main className="flex-grow pt-16 md:pt-20">
        {children}
      </main>
      <Footer />
    </div>
  );
}
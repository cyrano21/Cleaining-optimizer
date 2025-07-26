"use client";

import { useDashboardTheme } from "@/hooks/useDashboardTheme";
import { ReactNode, useEffect } from "react";

interface ThemeProviderProps {
  children: ReactNode;
  dashboardType: 'super_admin' | 'admin' | 'vendor' | 'customer' | 'moderator';
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  dashboardType 
}) => {
  const { getCSSVariables, theme } = useDashboardTheme(dashboardType);

  useEffect(() => {
    // Appliquer les variables CSS au document root
    const root = document.documentElement;
    const cssVars = getCSSVariables();
    
    Object.entries(cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value as string);
    });

    // Nettoyer lors du démontage
    return () => {
      Object.keys(cssVars).forEach(key => {
        root.style.removeProperty(key);
      });
    };
  }, [getCSSVariables, theme]);

  return <>{children}</>;
};

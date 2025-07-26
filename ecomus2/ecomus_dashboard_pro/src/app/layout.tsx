import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AuthProvider from "@/components/AuthProvider";
import { StoreProvider } from "@/hooks/use-store";
import { SystemSettingsProvider } from "@/hooks/useSystemSettings";
import { ToastProvider } from "@/components/ui/toast";
import { ContextProvider } from "@/components/providers/ContextProvider";
import "../../styles/scss/main.scss";
import "photoswipe/dist/photoswipe.css";
import "rc-slider/assets/index.css";
import "../../styles/css/custom-image-fixes.css";

import BootstrapClientOnly from "@/components/BootstrapClientOnly";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  title: "Hope UI Pro E-commerce | Responsive Next.js E-commerce Application",
  description:
    "Hope UI Pro is a revolutionary Next.js E-commerce Application and UI Components Library.",
  keywords:
    "premium, admin, dashboard, template, next.js, react, clean ui, hope ui, admin dashboard, responsive dashboard, optimized dashboard, E-commerce app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <BootstrapClientOnly />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <SystemSettingsProvider>
              <StoreProvider>
                <ToastProvider>
                  <ContextProvider>{children}</ContextProvider>
                </ToastProvider>
              </StoreProvider>
            </SystemSettingsProvider>
          </AuthProvider>
        </ThemeProvider>
        <ToastContainer />
      </body>
    </html>
  );
}

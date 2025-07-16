// app/layout.tsx
'use client';

import './globals.css';
import Footer from '../components/ui/Footer'; // Path relative to app directory
import Navbar from '../components/ui/Navbar'; // Path relative to app directory
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '../contexts/AuthContext'; // Path relative to app directory
import { GamificationProvider } from '../components/gamification/GamificationContext'; // Path relative to app directory
import { setupConsoleFilters } from '../utils/consoleFilter'; // Path relative to app directory
import React, { useEffect } from 'react'; // Import useEffect

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Use standard useEffect with an empty dependency array to run once on mount
  useEffect(() => {
    const cleanupConsoleFilters = setupConsoleFilters();
    return () => {
      if (cleanupConsoleFilters) {
        cleanupConsoleFilters();
      }
    };
  }, []); // Empty dependency array means this runs once after initial render

  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <title>NextJS Academy</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Plateforme d'apprentissage Next.js" />
        <link rel="icon" href="/favicon.ico" />
        {/* Consider using next/font for Google Fonts for better performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200 antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="theme">
          <AuthProvider>
            <GamificationProvider>
              <Navbar />
              <main className="flex-grow pt-16 md:pt-20">
                {children}
              </main>
              <Footer />
            </GamificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
// src/components/ui/Navbar.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
// useTheme sera utilisé par ThemeSwitcher, ou directement ici si Navbar doit connaître le thème
// import { useTheme } from "next-themes"; 
import { ThemeSwitcher } from "./theme-switcher"; // Ce composant utilisera useTheme

interface NavbarProps {
  fallbackRoute?: string;
}

export default function Navbar({
  fallbackRoute = "/",
}: NavbarProps) {
  const pathname = usePathname();
  // const { theme, resolvedTheme } = useTheme(); // Peut être supprimé si seul ThemeSwitcher s'en occupe
  // const [mounted, setMounted] = useState(false);

  // useEffect(() => {
  //   setMounted(true);
  // }, []);

  // La classe bg-gray-900/bg-white sera gérée par Tailwind via la classe 'dark' sur <html>
  // Donc, pas besoin de conditionner explicitement la couleur de fond de la navbar ici
  // si vos styles globaux ou les classes Tailwind s'en chargent.
  // Si vous voulez un style spécifique pour la navbar en mode sombre/clair, Tailwind le fera.

  const isQuizPage =
    pathname?.includes("/quiz") || pathname?.includes("/exercises");

  return (
    <header
      // Tailwind gérera le bg basé sur la classe 'dark' sur <html>
      // Exemple: className="bg-white dark:bg-gray-900 text-gray-800 dark:text-white ..."
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 bg-white dark:bg-gray-900 text-gray-800 dark:text-white shadow-md`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link
              href={fallbackRoute}
              className="flex-shrink-0 flex items-center"
            >
              <span className="text-xl font-bold">NextJS App</span>
            </Link>
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-4 items-center">
              <Link
                href="/dashboard"
                // Les styles actifs peuvent rester conditionnels au pathname
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === "/dashboard" 
                  ? "bg-indigo-500 text-white" 
                  : "hover:bg-gray-200 dark:hover:bg-gray-700" // Styles hover pour thèmes
                }`}
              >
                Dashboard
              </Link>
              {/* ... autres liens avec des styles hover adaptés aux thèmes ... */}
              <Link
                href="/lessons"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname?.startsWith("/lessons")
                    ? "bg-indigo-500 text-white"
                    : "hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                Cours
              </Link>
              <Link
                href="/exercises"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isQuizPage ? "bg-indigo-500 text-white" : "hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                Exercices & Quiz
              </Link>
              <Link
                href="/profile"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === "/profile" ? "bg-indigo-500 text-white" : "hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                Profil
              </Link>
            </nav>
          </div>
          <div className="flex items-center">
            <ThemeSwitcher /> {/* Ce composant gère le clic pour changer de thème */}
          </div>
        </div>
      </div>
    </header>
  );
}
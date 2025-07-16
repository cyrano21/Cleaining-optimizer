"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  // État et fonction pour gérer le thème
  const [theme, setTheme] = useState("light");
  
  // Initialiser le thème au chargement
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
      setTheme(initialTheme);
      
      if (initialTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, []);
  
  // Fonction pour basculer le thème
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  // Détecte le défilement pour changer l'apparence de la barre de navigation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Détermine si un lien est actif
  const isActive = (path) => {
    return pathname?.startsWith(path);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md py-2" : "bg-white/95 py-3"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo et nom du site */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-indigo-600 font-bold text-xl">NextJS</span>
              <span className="ml-1 text-gray-700 font-bold text-xl">
                Academy
              </span>
            </Link>
          </div>

          {/* Navigation principale - Desktop */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              href="/learning-path"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive("/learning-path")
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Parcours d&apos;apprentissage
            </Link>

            <div className="relative group">
              <button
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                  isActive("/javascript") || isActive("/javascript-fundamentals")
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                JavaScript
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 ml-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <div className="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-1">
                  <Link
                    href="/javascript-fundamentals"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Fondamentaux JavaScript
                  </Link>
                  <Link
                    href="/javascript/advanced"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    JavaScript Avancé
                  </Link>
                  <Link
                    href="/javascript/exercises"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Exercices JavaScript
                  </Link>
                </div>
              </div>
            </div>

            <div className="relative group">
              <button
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                  isActive("/react") || isActive("/react-fundamentals")
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                React
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 ml-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <div className="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-1">
                  <Link
                    href="/react-fundamentals"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Fondamentaux React
                  </Link>
                  <Link
                    href="/react/hooks"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    React Hooks
                  </Link>
                  <Link
                    href="/react/exercises"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Exercices React
                  </Link>
                </div>
              </div>
            </div>

            <div className="relative group">
              <button
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                  isActive("/lessons") || isActive("/nextjs")
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Next.js
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 ml-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <div className="absolute left-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-1">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 border-b">
                    Modules d&apos;apprentissage
                  </div>
                  <Link
                    href="/lessons/module/1"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Module 1: Introduction à Next.js
                  </Link>
                  <Link
                    href="/lessons/module/2"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Module 2: Fondamentaux de Next.js
                  </Link>
                  <Link
                    href="/lessons/module/3"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Module 3: Fonctionnalités Avancées
                  </Link>
                  <Link
                    href="/lessons/module/4"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Module 4: Déploiement et Performance
                  </Link>
                  <Link
                    href="/lessons/module/5"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Module 5: Projet Blog
                  </Link>
                  <Link
                    href="/lessons/module/6"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Module 6: API et Backend
                  </Link>
                  <Link
                    href="/lessons/module/7"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Module 7: Authentification
                  </Link>
                  <Link
                    href="/lessons/module/8"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Module 8: State Management
                  </Link>
                  <div className="border-t border-gray-100"></div>
                  <Link
                    href="/lessons"
                    className="block px-4 py-2 text-sm text-indigo-600 font-medium hover:bg-gray-100"
                  >
                    Voir tous les modules
                  </Link>
                </div>
              </div>
            </div>

            <Link
              href="/exercises"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive("/exercises")
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Exercices
            </Link>
          </div>

          {/* Liens de connexion/profil - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/dashboard"
              className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Mon tableau de bord
            </Link>
            
            {/* Bouton de changement de thème */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              aria-label="Changer de thème"
            >
              {theme === "dark" ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                  Mode clair
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                  Mode sombre
                </>
              )}
            </button>
            
            <Link
              href="/profile"
              className="text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium"
            >
              Mon profil
            </Link>
          </div>

          {/* Bouton menu mobile */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-indigo-600 hover:bg-gray-100 focus:outline-none"
            >
              <svg
                className={`${isMenuOpen ? "hidden" : "block"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`${isMenuOpen ? "block" : "hidden"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      <div className={`${isMenuOpen ? "block" : "hidden"} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg">
          <Link
            href="/learning-path"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive("/learning-path")
                ? "bg-indigo-100 text-indigo-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={toggleMenu}
          >
            Parcours d&apos;apprentissage
          </Link>

          <div className="border-t border-gray-100 my-2"></div>
          <div className="px-3 py-1 text-xs font-semibold text-gray-500">
            JavaScript
          </div>

          <Link
            href="/javascript-fundamentals"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive("/javascript-fundamentals")
                ? "bg-indigo-100 text-indigo-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={toggleMenu}
          >
            Fondamentaux JavaScript
          </Link>

          <Link
            href="/javascript/advanced"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive("/javascript/advanced")
                ? "bg-indigo-100 text-indigo-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={toggleMenu}
          >
            JavaScript Avancé
          </Link>

          <div className="border-t border-gray-100 my-2"></div>
          <div className="px-3 py-1 text-xs font-semibold text-gray-500">
            React
          </div>

          <Link
            href="/react-fundamentals"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive("/react-fundamentals")
                ? "bg-indigo-100 text-indigo-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={toggleMenu}
          >
            Fondamentaux React
          </Link>

          <Link
            href="/react/hooks"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive("/react/hooks")
                ? "bg-indigo-100 text-indigo-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={toggleMenu}
          >
            React Hooks
          </Link>

          <div className="border-t border-gray-100 my-2"></div>
          <div className="px-3 py-1 text-xs font-semibold text-gray-500">
            Next.js
          </div>

          <Link
            href="/lessons/module/1"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive("/lessons/module/1")
                ? "bg-indigo-100 text-indigo-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={toggleMenu}
          >
            Module 1: Introduction
          </Link>

          <Link
            href="/lessons/module/2"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive("/lessons/module/2")
                ? "bg-indigo-100 text-indigo-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={toggleMenu}
          >
            Module 2: Fondamentaux
          </Link>

          <Link
            href="/lessons/module/3"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive("/lessons/module/3")
                ? "bg-indigo-100 text-indigo-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={toggleMenu}
          >
            Module 3: Fonctionnalités Avancées
          </Link>

          <Link
            href="/lessons/module/4"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive("/lessons/module/4")
                ? "bg-indigo-100 text-indigo-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={toggleMenu}
          >
            Module 4: Déploiement
          </Link>

          <Link
            href="/lessons"
            className={`block px-3 py-2 rounded-md text-base font-medium text-indigo-600 ${
              isActive("/lessons") && !isActive("/lessons/module/")
                ? "bg-indigo-100"
                : "hover:bg-gray-100"
            }`}
            onClick={toggleMenu}
          >
            Voir tous les modules
          </Link>

          <div className="border-t border-gray-100 my-2"></div>

          <Link
            href="/exercises"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive("/exercises")
                ? "bg-indigo-100 text-indigo-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={toggleMenu}
          >
            Exercices
          </Link>

          <div className="border-t border-gray-100 my-2"></div>

          <Link
            href="/dashboard"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive("/dashboard")
                ? "bg-indigo-100 text-indigo-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={toggleMenu}
          >
            Mon tableau de bord
          </Link>

          <Link
            href="/profile"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive("/profile")
                ? "bg-indigo-100 text-indigo-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={toggleMenu}
          >
            Mon profil
          </Link>
        </div>
      </div>
    </nav>
  );
}

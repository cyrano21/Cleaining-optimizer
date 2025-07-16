'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NextjsSidebar() {
  const pathname = usePathname();
  const [showNav, setShowNav] = useState(true);

  const isActive = (path) => {
    return pathname?.startsWith(path);
  };

  const toggleNavigation = () => {
    setShowNav(!showNav);
  };

  return (
    <div
      className="bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 h-screen fixed left-0 top-16 z-40 transition-all duration-300"
      style={{ width: showNav ? '240px' : '60px' }}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
          {showNav ? (
            <h2 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
              NextJS Academy
            </h2>
          ) : (
            <div className="w-8 h-8 bg-indigo-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
          )}
          <button
            onClick={toggleNavigation}
            className="text-gray-500 hover:text-indigo-600 focus:outline-none"
          >
            {showNav ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        </div>

        {/* User info */}
        {showNav && (
          <div className="p-4 border-b border-gray-200 flex items-center">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="ml-2 text-sm text-gray-900 dark:text-gray-100 font-medium">
              Utilisateur
            </span>
          </div>
        )}

        {/* Navigation sections */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h3
              className={`uppercase text-xs font-semibold text-gray-700 dark:text-gray-300 tracking-wider ${
                !showNav && 'sr-only'
              }`}
            >
              MODULES
            </h3>
            <div className="mt-3 space-y-1">
              <Link
                href="/lessons/module/1"
                className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive('/lessons/module/1')
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300'
                    : 'text-gray-900 hover:bg-gray-50 hover:text-indigo-600 dark:text-gray-100 dark:hover:bg-gray-800 dark:hover:text-indigo-300'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
                {showNav && 'Introduction à Next.js'}
              </Link>
              <Link
                href="/lessons/module/2"
                className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive('/lessons/module/2')
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300'
                    : 'text-gray-900 hover:bg-gray-50 hover:text-indigo-600 dark:text-gray-100 dark:hover:bg-gray-800 dark:hover:text-indigo-300'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                {showNav && 'Fondamentaux de Next.js'}
              </Link>
              <Link
                href="/lessons/module/3"
                className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive('/lessons/module/3')
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300'
                    : 'text-gray-900 hover:bg-gray-50 hover:text-indigo-600 dark:text-gray-100 dark:hover:bg-gray-800 dark:hover:text-indigo-300'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                    clipRule="evenodd"
                  />
                </svg>
                {showNav && 'Fonctionnalités Avancées'}
              </Link>
              <Link
                href="/lessons/module/4"
                className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive('/lessons/module/4')
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300'
                    : 'text-gray-900 hover:bg-gray-50 hover:text-indigo-600 dark:text-gray-100 dark:hover:bg-gray-800 dark:hover:text-indigo-300'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z"
                    clipRule="evenodd"
                  />
                </svg>
                {showNav && 'Déploiement et Performance'}
              </Link>
              <Link
                href="/lessons/module/5"
                className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive('/lessons/module/5')
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300'
                    : 'text-gray-900 hover:bg-gray-50 hover:text-indigo-600 dark:text-gray-100 dark:hover:bg-gray-800 dark:hover:text-indigo-300'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
                {showNav && 'Projet Blog'}
              </Link>
              <Link
                href="/lessons/module/6"
                className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive('/lessons/module/6')
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300'
                    : 'text-gray-900 hover:bg-gray-50 hover:text-indigo-600 dark:text-gray-100 dark:hover:bg-gray-800 dark:hover:text-indigo-300'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                  <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                </svg>
                {showNav && 'API et Backend'}
              </Link>
              <Link
                href="/lessons/module/7"
                className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive('/lessons/module/7')
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300'
                    : 'text-gray-900 hover:bg-gray-50 hover:text-indigo-600 dark:text-gray-100 dark:hover:bg-gray-800 dark:hover:text-indigo-300'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10 12a2 2 0 110-4 2 2 0 010 4z" />
                  <path d="M10 18a3 3 0 100-6 3 3 0 000 6zM10 12a1 1 0 110-2 1 1 0 010 2zM7 12a1 1 0 100-2 1 1 0 000 2zM13 12a1 1 0 100-2 1 1 0 000 2z" />
                </svg>
                {showNav && 'Authentification'}
              </Link>
              <Link
                href="/lessons/module/8"
                className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive('/lessons/module/8')
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300'
                    : 'text-gray-900 hover:bg-gray-50 hover:text-indigo-600 dark:text-gray-100 dark:hover:bg-gray-800 dark:hover:text-indigo-300'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                {showNav && 'State Management'}
              </Link>
            </div>
          </div>

          <div className="p-4 mt-4">
            <h3
              className={`uppercase text-xs font-semibold text-gray-700 dark:text-gray-300 tracking-wider ${
                !showNav && 'sr-only'
              }`}
            >
              NAVIGATION
            </h3>
            <div className="mt-3 space-y-1">
              <Link
                href="/dashboard"
                className={`flex items-center px-2 py-2 text-sm rounded-md ${
                  isActive('/dashboard')
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300'
                    : 'text-gray-900 hover:bg-gray-50 hover:text-indigo-600 dark:text-gray-100 dark:hover:bg-gray-800 dark:hover:text-indigo-300'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                  <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                </svg>
                {showNav && 'Tableau de bord'}
              </Link>
              <Link
                href="/profile"
                className={`flex items-center px-2 py-2 text-sm rounded-md ${
                  isActive('/profile')
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300'
                    : 'text-gray-900 hover:bg-gray-50 hover:text-indigo-600 dark:text-gray-100 dark:hover:bg-gray-800 dark:hover:text-indigo-300'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
                {showNav && 'Mon profil'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

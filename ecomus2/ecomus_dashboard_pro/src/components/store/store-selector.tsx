"use client";

import { useState, useEffect } from "react";
import { Store } from "@/types";
import { useStore } from "@/hooks/use-store";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

export interface StoreSelectorProps {
  onStoreChange?: (store: Store) => void;
  className?: string;
  disabled?: boolean;
  isChanging?: boolean;
}

export function StoreSelector({
  onStoreChange,
  className,
  disabled = false,
  isChanging = false,
}: StoreSelectorProps) {
  const { data: session } = useSession();
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // TOUJOURS appeler useStore (respecter les règles des hooks)
  const { currentStore, stores, setCurrentStore, isLoading } = useStore();

  // Éviter les problèmes d'hydratation
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleStoreChange = (store: Store) => {
    setCurrentStore(store);
    onStoreChange?.(store);
    setIsOpen(false);
  };

  // Ne pas rendre le composant avant l'hydratation côté client
  if (!isMounted) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
      </div>
    );
  }

  // Pour les vendors, ne pas afficher le sélecteur s'ils n'ont qu'une boutique
  if (session?.user?.role === "vendor" && stores.length <= 1) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center justify-center w-4 h-4 bg-blue-100 dark:bg-blue-900 rounded">
          <span className="text-xs text-blue-600 dark:text-blue-400">🏪</span>
        </div>
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {currentStore?.name || "Aucune boutique"}
        </span>
        {currentStore?.subscription?.plan && (
          <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded">
            {currentStore.subscription.plan}
          </span>
        )}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="h-4 w-4 animate-pulse bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-4 w-20 animate-pulse bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    );
  }

  if (!stores.length) {
    return (
      <div className={`flex items-center gap-2 text-gray-500 dark:text-gray-400 ${className}`}>
        <div className="flex items-center justify-center w-4 h-4 bg-gray-100 dark:bg-gray-700 rounded">
          <span className="text-xs">🏪</span>
        </div>
        <span className="text-sm">Aucune boutique disponible</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-2 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 ${className} ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
        disabled={disabled}
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-4 h-4 bg-blue-100 dark:bg-blue-900 rounded">
            <span className="text-xs text-blue-600 dark:text-blue-400">🏪</span>
          </div>
          <span className="text-sm font-medium truncate max-w-32 text-gray-900 dark:text-gray-100">
            {currentStore?.name || "Sélectionner une boutique"}
          </span>

          {currentStore?.subscription?.plan && (
            <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded">
              {currentStore.subscription.plan}
            </span>
          )}
          {isChanging && (
            <Loader2 className="ml-2 h-4 w-4 animate-spin text-blue-500" />
          )}
        </div>
        <span className="text-gray-400 dark:text-gray-500">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
          {stores.map((store) => (
            <button
              key={store.id}
              onClick={() => handleStoreChange(store)}
              className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0"
            >
              <div className="flex items-center gap-3">
                {currentStore?.id === store.id && (
                  <span className="text-blue-600 dark:text-blue-400">✓</span>
                )}
                <img
                  src={store.logoUrl}
                  alt={store.name}
                  className="h-8 w-8 rounded object-cover"
                />
                <div className="text-left">
                  <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                    {store.name}
                  </div>{" "}
                  <div className="text-xs text-gray-700 dark:text-gray-300 truncate max-w-32">
                    {store.description}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    store.isActive
                      ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {store.isActive ? "Actif" : "Inactif"}
                </span>
                <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded">
                  {store.subscription?.plan || "free"}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Overlay pour fermer le dropdown */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}

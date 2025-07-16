"use client";

import { createContext } from 'react';

// Contexte vide par défaut côté serveur
export const EmptyContext = createContext({});

// Wrapper pour éviter les erreurs d'hydratation avec les contextes client uniquement
export function ClientOnlyProvider({ children, context, value }) {
  return (
    <context.Provider value={value}>
      {children}
    </context.Provider>
  );
}

// src/modules/jobs/utils/jobs-context.tsx
"use client"; // Nécessaire pour useState, useContext, createContext

import React, { createContext, useState, useContext, ReactNode, useCallback, useMemo, useEffect } from 'react';

// Définition simple d'un type Job (à adapter à vos données réelles)
export interface Job {
  id: string | number;
  title: string;
  company: string;
  location: string;
  description?: string; // Optionnel
  datePosted?: string; // Optionnel
  // Ajoutez d'autres champs nécessaires
  // Index signature typé pour garder la flexibilité tout en évitant 'any'
  [key: string]: string | number | boolean | undefined | null | object | Array<unknown>;
}

// Type pour la valeur du contexte
interface JobsContextType {
  jobs: Job[];
  favorites: Job[];
  loading: boolean;
  error: string | null;
  addFavorite: (job: Job) => void;
  removeFavorite: (jobId: string | number) => void;
  isFavorite: (jobId: string | number) => boolean;
  getFavorites: () => Job[];
  // Ajoutez d'autres fonctions ou états si nécessaire (ex: pour les filtres, fetchJobs...)
  setJobs: (jobs: Job[]) => void; // Pour mettre à jour depuis JobsList par exemple
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// Création du contexte avec une valeur par défaut (ou undefined)
const JobsContext = createContext<JobsContextType | undefined>(undefined);

// Props pour le Provider
interface JobsProviderProps {
  children: ReactNode;
}

// Le composant Provider
export const JobsProvider: React.FC<JobsProviderProps> = ({ children }) => {
  const [jobs, setJobs] = useState<Job[]>([]); // Liste des jobs affichés (potentiellement filtrés)
  const [favorites, setFavorites] = useState<Job[]>(() => {
      // Charger les favoris depuis localStorage au démarrage (côté client uniquement)
      if (typeof window !== 'undefined') {
          const savedFavorites = localStorage.getItem('jobFavorites');
          return savedFavorites ? JSON.parse(savedFavorites) : [];
      }
      return [];
  });
  const [loading, setLoading] = useState<boolean>(false); // État de chargement global
  const [error, setError] = useState<string | null>(null); // Erreurs globales

  // Sauvegarder les favoris dans localStorage quand ils changent
  useEffect(() => {
      if (typeof window !== 'undefined') {
          localStorage.setItem('jobFavorites', JSON.stringify(favorites));
      }
  }, [favorites]);

  const addFavorite = useCallback((jobToAdd: Job) => {
    setFavorites((prevFavorites) => {
      // Éviter les doublons
      if (prevFavorites.some(job => job.id === jobToAdd.id)) {
        return prevFavorites;
      }
      return [...prevFavorites, jobToAdd];
    });
  }, []);

  const removeFavorite = useCallback((jobIdToRemove: string | number) => {
    setFavorites((prevFavorites) =>
      prevFavorites.filter((job) => job.id !== jobIdToRemove)
    );
  }, []);

  const isFavorite = useCallback((jobId: string | number): boolean => {
    return favorites.some((job) => job.id === jobId);
  }, [favorites]);

  const getFavorites = useCallback((): Job[] => {
      return favorites;
  }, [favorites]);

  // useMemo pour éviter de recréer la valeur du contexte à chaque rendu
  const contextValue = useMemo(() => ({
    jobs,
    favorites,
    loading,
    error,
    addFavorite,
    removeFavorite,
    isFavorite,
    getFavorites,
    setJobs, // Exposer la fonction pour mettre à jour les jobs
    setLoading,
    setError,
  }), [jobs, favorites, loading, error, addFavorite, removeFavorite, isFavorite, getFavorites]);

  return (
    <JobsContext.Provider value={contextValue}>
      {children}
    </JobsContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte
export const useJobs = (): JobsContextType => {
  const context = useContext(JobsContext);
  if (context === undefined) {
    throw new Error('useJobs must be used within a JobsProvider');
  }
  return context;
};
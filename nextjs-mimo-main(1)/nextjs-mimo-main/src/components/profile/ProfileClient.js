"use client";

import { useState, useEffect } from "react";
import { GamificationProvider } from "../../components/gamification/GamificationContext";
import ProgressTracker from "../../components/gamification/ProgressTracker";

export default function ProfileClient() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Ajouter un timeout pour éviter le chargement indéfini
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        setError(
          "Le chargement a pris trop de temps. Veuillez rafraîchir la page."
        );
      }
    }, 10000); // 10 secondes maximum de chargement

    return () => clearTimeout(timeout);
  }, [isLoading]);

  // Simuler une vérification de chargement
  useEffect(() => {
    const checkLoading = async () => {
      try {
        // Vérifier si les données de profil sont disponibles
        // Si vous avez une API pour vérifier le statut de l'utilisateur, utilisez-la ici
        setTimeout(() => {
          setIsLoading(false);
        }, 2000); // Simulation d'un chargement de 2 secondes
      } catch (err) {
        console.error("Erreur lors du chargement du profil:", err);
        setError("Impossible de charger le profil");
        setIsLoading(false);
      }
    };

    checkLoading();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="ml-4 text-gray-600">Chargement du profil...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 bg-red-100 hover:bg-red-200 text-red-700 font-medium py-1 px-3 rounded-md transition-colors text-sm"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <GamificationProvider>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold">Utilisateur</h2>
            <p className="text-gray-600 mt-1">Développeur Next.js</p>

            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Membre depuis</span>
                <span>Avril 2025</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Dernière connexion</span>
                <span>Aujourd'hui</span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <ProgressTracker />

          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-medium mb-4">Paramètres</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom d'utilisateur
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  defaultValue="utilisateur"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  defaultValue="utilisateur@exemple.com"
                />
              </div>

              <div className="flex items-center">
                <input
                  id="notifications"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  defaultChecked
                />
                <label
                  htmlFor="notifications"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Recevoir des notifications par email
                </label>
              </div>

              <button className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                Enregistrer les modifications
              </button>
            </div>
          </div>
        </div>
      </div>
    </GamificationProvider>
  );
}

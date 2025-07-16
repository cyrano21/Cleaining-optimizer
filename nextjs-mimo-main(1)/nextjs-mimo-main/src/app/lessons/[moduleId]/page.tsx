"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface Lesson {
  id: number;
  title: string;
  duration?: number;
  completed?: boolean;
}

interface Module {
  id: string;
  title: string;
  description: string;
  level: string;
  lessons: Lesson[];
  imageUrl?: string;
  totalCompletedLessons?: number;
  duration?: string;
}

interface ModulePageParams {
  moduleId: string;
}

export default function ModulePage({ params }: { params: ModulePageParams }) {
  const [module, setModule] = useState<Module | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const moduleId = params.moduleId;
    
    // Convertir moduleId en nombre
    const moduleNumber = parseInt(moduleId, 10);
    
    // Vérifier si le moduleId est valide
    if (isNaN(moduleNumber) || moduleNumber < 1 || moduleNumber > 8) {
      setFetchError(`Module non trouvé (ID invalide: ${moduleId})`);
      setIsLoading(false);
      return;
    }

    // Simuler une requête API
    const mockModule = {
      id: moduleId,
      title: `Module ${moduleNumber}: Titre du module ${moduleNumber}`,
      description: `Description du module ${moduleNumber}`,
      level: moduleNumber <= 2 ? "Débutant" : moduleNumber <= 4 ? "Intermédiaire" : "Avancé",
      lessons: Array.from({ length: 3 }, (_, i) => ({
        id: i + 1,
        title: `Leçon ${i + 1} du module ${moduleNumber}`
      }))
    };

    setModule(mockModule);
    setIsLoading(false);
  }, [params.moduleId]);

  if (isLoading) {
    return <div className="text-center p-8">Chargement du module...</div>;
  }

  if (fetchError) {
    return <div className="text-red-500 p-8">Erreur: {fetchError}</div>;
  }

  if (!module) {
    return <div className="p-8">Module non trouvé</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{module.title}</h1>
      <p className="text-gray-600 mb-8">{module.description}</p>
      
      <div className="space-y-4">
        {module.lessons.map((lesson) => (
          <div key={lesson.id} className="p-4 bg-white rounded-lg shadow">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">{lesson.title}</h3>
              <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 text-sm">
                {lesson.completed ? "Complété" : "À faire"}
              </span>
            </div>
            <Link 
              href={`/lessons/${module.id}/lesson/${lesson.id}`}
              className="mt-2 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Commencer la leçon
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

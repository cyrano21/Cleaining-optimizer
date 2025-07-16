"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface Lesson {
  id: number;
  title: string;
  duration?: number; // durée en minutes
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
}

export default function ModulePage({
  params,
}: {
  params: { moduleId: string };
}) {
  const [module, setModule] = useState<Module | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [logMessages, setLogMessages] = useState<string[]>([]);  // Journal pour le débogage

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/modules/${params.moduleId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Module non trouvé");
        }
        return res.json();
      })
      .then((data) => {
        // Log pour le débogage
        console.log(`Module chargé: ${data.title}`);
        console.log(`Nombre de leçons: ${data.lessons?.length || 0}`);
        if (data.lessons?.length > 0) {
          console.log(`IDs des leçons: ${data.lessons.map((l: any) => l.id).join(', ')}`);
        }
        
        // Calculer les statistiques
        const totalLessons = data.lessons?.length || 0;
        const completedLessons = data.lessons?.filter((l: Lesson) => l.completed)?.length || 0;

        setModule({
          ...data,
          totalCompletedLessons: completedLessons
        });
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setIsLoading(false);
      });
  }, [params.moduleId]);

  // Calcul du pourcentage de complétion
  const completionPercentage = module?.lessons?.length
    ? Math.round((module.totalCompletedLessons || 0) * 100 / module.lessons.length)
    : 0;

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Fil d'Ariane - Skeleton */}
        <div className="flex items-center mb-6">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <span className="mx-2 text-gray-300">/</span>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
        
        {/* Module Header - Skeleton */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="w-full md:w-1/3 h-48 bg-gray-200 rounded-lg animate-pulse"></div>
            
            <div className="flex-1 w-full">
              <div className="flex justify-between items-start">
                <div className="h-8 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                <div className="h-5 bg-gray-200 rounded-full w-16 animate-pulse"></div>
              </div>
              
              <div className="space-y-2 mt-4">
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse"></div>
              </div>
              
              <div className="mt-6">
                <div className="flex justify-between mb-2">
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full"></div>
                <div className="h-4 bg-gray-200 rounded w-32 mt-2 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Lessons Section - Skeleton */}
        <div className="mb-8">
          <div className="h-7 bg-gray-200 rounded w-48 mb-6 animate-pulse"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded-full mr-4 animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3 mt-2 animate-pulse"></div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <div className="h-8 bg-gray-200 rounded-lg w-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Footer Navigation - Skeleton */}
        <div className="flex justify-center mt-12">
          <div className="h-5 bg-gray-200 rounded w-40 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error || !module) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center bg-white py-12 px-6 rounded-xl shadow-md border border-gray-100"
        >
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-red-600 mb-4">
            Module non trouvé
          </h1>
          <p className="mb-8 text-gray-600 max-w-md mx-auto">
            Le module que vous recherchez n'existe pas ou n'est plus disponible. Vous pouvez revenir à la liste des modules.
          </p>
          <Link href="/lessons" className="inline-flex items-center px-5 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:from-indigo-600 hover:to-purple-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour aux modules
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Fil d'Ariane */}
      <div className="flex items-center mb-4">
        <Link
          href="/lessons"
          className="text-indigo-600 hover:text-indigo-800 mr-2 transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Modules
        </Link>
        <span className="text-gray-500">/</span>
        <span className="ml-2 text-gray-700 font-medium">{module.title}</span>
      </div>

      {/* En-tête du Module */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-10"
      >
        <div className="flex flex-col md:flex-row items-start gap-6">
          {module.imageUrl ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="w-full md:w-1/3"
            >
              <div className="relative rounded-lg overflow-hidden shadow-md group">
                <img
                  src={module.imageUrl}
                  alt={module.title}
                  className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
              </div>
            </motion.div>
          ) : (
            <div className="w-full md:w-1/3">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 h-56 rounded-lg flex items-center justify-center">
                <span className="text-white text-4xl font-bold">{module.title.charAt(0)}</span>
              </div>
            </div>
          )}

          <div className="flex-1">
            <div className="flex flex-wrap justify-between items-start gap-3">
              <motion.h1 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-3xl font-bold text-gray-800"
              >
                {module.title}
              </motion.h1>
              <span className="bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {module.level}
              </span>
            </div>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-gray-600 mt-3 text-lg leading-relaxed"
            >
              {module.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8 bg-gray-50 p-4 rounded-lg border border-gray-100"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                <span className="font-medium text-gray-700 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Progression
                </span>
                <span className="text-indigo-600 font-semibold">{completionPercentage}% complété</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: `${completionPercentage}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.6 }}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full"
                />
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-gray-500 text-sm">
                  {module.totalCompletedLessons || 0}/{module.lessons?.length || 0} leçons terminées
                </p>
                {completionPercentage === 100 && (
                  <span className="text-green-600 text-sm font-medium flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Module complété !
                  </span>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Section des Leçons */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-8">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-bold text-gray-800 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Contenu du module
          </motion.h2>
          <div className="text-sm text-gray-500">
            {module.lessons?.length} leçon{module.lessons?.length > 1 ? 's' : ''}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {module.lessons?.map((lesson, index) => (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300 hover:border-indigo-200 group"
            >
              <div className="relative">
                {/* Ruban de statut */}
                {lesson.completed ? (
                  <div className="absolute top-3 right-3 bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full flex items-center shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Complété
                  </div>
                ) : (
                  <div className="absolute top-3 right-3 bg-indigo-50 text-indigo-600 text-xs font-medium px-2.5 py-1 rounded-full flex items-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    À découvrir
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-center">
                    <div className={`w-12 h-12 ${lesson.completed ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-purple-600'} rounded-full flex items-center justify-center mr-4 shadow-md group-hover:scale-110 transition-transform`}>
                      <span className="text-sm font-bold text-white">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-800 group-hover:text-indigo-700 transition-colors">{lesson.title}</h3>
                      <div className="flex items-center mt-2 space-x-4">
                        <span className="flex items-center text-xs text-gray-500">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-gray-400 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          ~{lesson.duration || 15} min
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    {/* Ajout de l'attribut onClick pour capturer et logger l'événement de clic */}
                    <Link
                      href={`/lessons/module/${params.moduleId}/lesson/${index + 1}`}
                      className={`block w-full py-2.5 px-4 rounded-lg ${lesson.completed 
                        ? 'bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600' 
                        : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'} 
                        text-white text-center font-medium transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-sm`}
                      data-lesson-id={lesson.id}
                      onClick={() => {
                        console.log(`📌 Navigation vers leçon: moduleId=${params.moduleId}, lessonId=${index + 1}, id complet=${lesson.id}`);
                      }}
                    >
                      {lesson.completed ? (
                        <span className="flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Réviser
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Commencer
                        </span>
                      )}
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Navigation de bas de page */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex justify-center mt-12"
      >
        <Link
          href="/lessons"
          className="flex items-center bg-white px-6 py-3 rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-100 text-indigo-600 hover:text-indigo-800 group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour à la liste des modules
        </Link>
      </motion.div>
    </div>
  );
}
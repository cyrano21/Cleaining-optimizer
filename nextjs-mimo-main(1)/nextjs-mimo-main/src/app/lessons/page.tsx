"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';

// Define interfaces for the data structure
interface LessonSummary {
  id: string;
  title: string;
  description?: string;
  difficulty?: string;
  duration?: number;
  tags?: string[];
  prerequisites?: string[];
  content?: string;
  example?: {
    title?: string;
    code?: string;
    explanation?: string;
  };
  exercise?: {
    title?: string;
    description?: string;
    initialCode?: string;
    solution?: string;
    tasks?: string[];
  };
  quiz?: {
    title?: string;
    questions?: Array<{
      question: string;
      options: string[];
      correctAnswer: string;
    }>;
  };
}

interface ModuleSummary {
  id: string;
  title: string;
  description?: string;
  difficulty?: string;
  lessons: LessonSummary[];
}

export default function LessonsPage() {
  // Use the defined interface for the state
  const [modules, setModules] = useState<ModuleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // For error messages

  // Function to fetch modules data from API
  const fetchModules = async () => {
    setLoading(true);
    setError(null); // Reset error on new fetch
    try {
      const response = await fetch('/api/modules'); // This API should return an array of ModuleSummary
      if (!response.ok) {
        // Try to parse a more specific error message if the API provides one
        let errorMsg = 'Erreur lors de la récupération des modules';
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg;
        } catch (e) {
          // Ignore if parsing errorData fails, stick with the generic message
        }
        throw new Error(errorMsg);
      }
      const data: ModuleSummary[] = await response.json(); // Expect an array of ModuleSummary
      setModules(data);
    } catch (err) {
      console.error('Erreur:', err);
      setError(err instanceof Error ? err.message : 'Une erreur inconnue est survenue.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch modules data on mount
  useEffect(() => {
    fetchModules();
  }, []);

  // Loading state with skeleton cards
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-gray-800 dark:text-white">
        <h1 className="text-3xl font-bold mb-8 text-center">Modules d'apprentissage Next.js</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => ( // Create 6 skeleton cards
            <div key={i} className="border-t-4 border-indigo-500 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl animate-pulse">
              <div className="flex justify-between items-start mb-4">
                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/5"></div> {/* Title */}
                <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded-full w-20"></div> {/* Difficulty */}
              </div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full mb-1"></div> {/* Description line 1 */}
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-4/5 mb-4"></div> {/* Description line 2 */}
              <div className="space-y-2.5 mb-6">
                {[...Array(3)].map((_, j) => ( // 3 skeleton lessons
                  <div key={j} className="flex items-center">
                    <div className="w-5 h-5 bg-gray-300 dark:bg-gray-700 rounded-full mr-2.5"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
              <div className="h-10 bg-indigo-400 dark:bg-indigo-700 rounded-md w-36"></div> {/* Button */}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state with retry button
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-6 text-red-600 dark:text-red-400">Erreur</h1>
        <p className="text-gray-700 dark:text-gray-300">{error}</p>
        <button
          onClick={() => fetchModules()}
          className="mt-6 inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
        >
          Réessayer
        </button>
      </div>
    );
  }
  
  // Empty state when no modules are available
  if (modules.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-6">Modules d'apprentissage Next.js</h1>
        <p className="text-gray-600 dark:text-gray-400">Aucun module disponible pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 text-gray-800 dark:text-white">
      <h1 className="text-3xl font-bold mb-8 text-center">Modules d'apprentissage Next.js</h1>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => {
          // Ensure lesson.id is correctly split for the link
          // The lesson.id from API should be the full ID like "1-1", "1-2"
          // The link expects /module/:moduleId/lesson/:lessonNumber
          const getLessonNumber = (lessonId: string) => {
            const parts = lessonId.split('-');
            return parts.length > 1 ? parts[1] : lessonId; // Fallback if not in "X-Y" format
          };

          return (
            <div key={module.id} className="card flex flex-col border-t-4 border-indigo-600 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <div className="flex justify-between items-start mb-3">
                <h2 className="text-xl font-semibold text-indigo-700 dark:text-indigo-400">{module.title}</h2>
                {module.difficulty && (
                  <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">
                    {module.difficulty}
                  </span>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm flex-grow min-h-[60px]">
                {module.description || 'Aucune description pour ce module.'}
              </p>
              
              <div className="space-y-2 mb-5">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Leçons :</h4>
                {module.lessons && module.lessons.length > 0 ? (
                  module.lessons.slice(0, 4).map((lesson, index) => ( // Show first 4 lessons as preview
                    <div key={lesson.id} className="flex items-center text-sm">
                      <div className="w-4 h-4 bg-indigo-100 dark:bg-indigo-800 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-300">{index + 1}</span>
                      </div>
                      <Link 
                        href={`/lessons/module/${module.id}/lesson/${getLessonNumber(lesson.id)}`} 
                        className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 truncate"
                        title={lesson.title}
                      >
                        {lesson.title}
                      </Link>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400">Aucune leçon listée.</p>
                )}
                {module.lessons && module.lessons.length > 4 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">... et {module.lessons.length - 4} autres.</p>
                )}
              </div>
              
              <div className="mt-auto"> {/* Pushes button to the bottom */}
                <Link 
                  href={`/lessons/module/${module.id}`} 
                  className="w-full text-center bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-medium py-2.5 px-4 rounded-md transition-colors duration-200 inline-block"
                >
                  Voir le module
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
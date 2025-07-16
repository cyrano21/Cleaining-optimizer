"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { LessonContent, type LessonContentProps } from './LessonContent'; 
import LessonProgress from '@/components/lessons/LessonProgress';

// --- INTERFACES ---
interface Example { title: string; code: string; explanation: string; language?: string; }
interface ExerciseOption { id: number; text: string; correct: boolean; }
interface Exercise { title: string; description: string; options?: ExerciseOption[]; type?: string; }
interface QuizQuestion { question: string; options: string[]; correctAnswer: string; }
interface Quiz { title: string; questions: QuizQuestion[]; }
interface Project { title: string; description: string; initialCode: string; solution: string; language?: string; }

export interface LessonData {
  id: string; 
  title: string;
  description?: string;
  content: string;
  example?: Example;
  examples?: Example[];
  exercise?: Exercise;
  quiz?: Quiz;
  project?: Project;
  practice?: { initialCode: string; solution: string; language?: string; };
  duration?: number;
  difficulty?: 'débutant' | 'intermédiaire' | 'avancé';
  prerequisites?: string[]; 
  tags?: string[];
  // No moduleLessons here, assumed not part of single lesson API response
}

interface ModuleLessonSummary {
  id: string; // Full ID like "1-1"
  title: string;
}

interface ModuleDataForNav { // Structure for what /api/modules/:moduleId returns
    id: string;
    lessons: ModuleLessonSummary[];
    // other module fields
}


interface Params {
  moduleId: string;
  lessonId: string; 
}
// --- END INTERFACES ---

const useLessonTitles = () => {
  const [lessonTitles, setLessonTitles] = useState<{[key: string]: string}>({});
  const hasFetchedAllTitles = useRef(false);

  const fetchAllLessonTitles = useCallback(async () => {
    if (hasFetchedAllTitles.current) return;
    hasFetchedAllTitles.current = true;

    try {
      const response = await fetch('/api/modules'); 
      if (!response.ok) {
        console.warn(`[useLessonTitles] Failed: ${response.status}`);
        hasFetchedAllTitles.current = false; 
        return;
      }
      const data = await response.json();
      const modulesArray = data.modules || (Array.isArray(data) ? data : []); 
      
      if (Array.isArray(modulesArray)) {
        const titles: {[key: string]: string} = {};
        modulesArray.forEach((moduleItem: any) => {
          if (moduleItem.lessons && Array.isArray(moduleItem.lessons)) {
            moduleItem.lessons.forEach((lesson: { id: string; title: string }) => {
              if (lesson.id && lesson.title) titles[lesson.id] = lesson.title;
            });
          }
        });
        if (Object.keys(titles).length > 0) setLessonTitles(titles);
      }
    } catch (error) {
      console.error('[useLessonTitles] Error:', error);
      hasFetchedAllTitles.current = false;
    }
  }, []); 

  return { lessonTitles, fetchAllLessonTitles };
};


export default function LessonPage({ params }: { params: Params }) {
  const { moduleId, lessonId } = params; // lessonId is the number string "1", "2"
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [completionTime, setCompletionTime] = useState<number>(0);
  const { lessonTitles, fetchAllLessonTitles } = useLessonTitles();

  const [activeSection, setActiveSection] = useState<string>(''); 
  const [sectionCompleted, setSectionCompleted] = useState<{[key: string]: boolean}>({});
  const [currentProgress, setCurrentProgress] = useState<number>(0); // Overall progress for THIS lesson
  
  const [allLessonsInModule, setAllLessonsInModule] = useState<ModuleLessonSummary[]>([]);
  const [prevLesson, setPrevLesson] = useState<ModuleLessonSummary | undefined>(undefined);
  const [nextLesson, setNextLesson] = useState<ModuleLessonSummary | undefined>(undefined);
  
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => { setHasMounted(true); }, []);

  useEffect(() => {
    const timer = setInterval(() => setCompletionTime(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Effect to fetch current lesson data AND all lessons in the current module for navigation
  useEffect(() => {
    setIsLoading(true);
    setFetchError(null);
    setActiveSection(''); 
    setSectionCompleted({}); 
    setCurrentProgress(0); 
    setLesson(null); // Reset lesson on ID change
    setAllLessonsInModule([]);
    setPrevLesson(undefined);
    setNextLesson(undefined);

    const fetchData = async () => {
      try {
        // Fetch current lesson details
        const lessonResponse = await fetch(`/api/modules/${moduleId}/lessons/${lessonId}`);
        if (!lessonResponse.ok) {
          let errMsg = `Leçon non trouvée (API status ${lessonResponse.status})`;
          try { const errData = await lessonResponse.json(); errMsg = errData.error || errMsg; } catch(e){}
          throw new Error(errMsg);
        }
        const lessonData: LessonData = await lessonResponse.json();
        setLesson(lessonData);

        if (lessonData) {
            if (lessonData.content) setActiveSection('theory');
            else if (lessonData.example || (lessonData.examples && lessonData.examples.length > 0)) setActiveSection('example');
            // ... set initial active section based on data
            else setActiveSection('');
        }

        if (lessonData.prerequisites?.some((prereq: string) => /^\d+-\d+$/.test(prereq))) {
          await fetchAllLessonTitles(); 
        }

        // Fetch all lessons for the current module to determine next/prev
        const moduleLessonsResponse = await fetch(`/api/modules/${moduleId}`);
        if (moduleLessonsResponse.ok) {
          const moduleData: ModuleDataForNav = await moduleLessonsResponse.json();
          if (moduleData && moduleData.lessons) {
            setAllLessonsInModule(moduleData.lessons);
            
            // Determine prev/next based on the full lesson list for the module
            // Assuming lesson IDs are "moduleId-lessonNum" in the full list and `lesson.id` from current lesson data
            const currentFullId = lessonData.id; // This MUST be "moduleId-lessonNum"
            const currentIndex = moduleData.lessons.findIndex(l => l.id === currentFullId);

            if (currentIndex > 0) {
              setPrevLesson(moduleData.lessons[currentIndex - 1]);
            }
            if (currentIndex !== -1 && currentIndex < moduleData.lessons.length - 1) {
              setNextLesson(moduleData.lessons[currentIndex + 1]);
            }
          }
        } else {
          console.warn(`Impossible de charger les leçons du module ${moduleId} pour la navigation.`);
        }

      } catch (err) {
        console.error('[LessonPage] Erreur fetch:', err);
        setFetchError(err instanceof Error ? err.message : 'Erreur de chargement.');
      } finally {
        setIsLoading(false);
      }
    };

    if (moduleId && lessonId && hasMounted) { // Add hasMounted to ensure client-side only for fetch
      fetchData();
    } else if (!moduleId || !lessonId) {
      setFetchError("Module ID ou Lesson ID manquant.");
      setIsLoading(false);
    }
  }, [moduleId, lessonId, fetchAllLessonTitles, hasMounted]);


  const formatPrerequisite = (prereq: string): string => {
    if (/^\d+-\d+$/.test(prereq) && lessonTitles[prereq]) {
      return `${lessonTitles[prereq]} (Leçon ${prereq})`;
    }
    return prereq;
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  if (!hasMounted) return null; 

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center mb-2 text-sm">
          <Link href="/learning-path" className="text-indigo-600 hover:text-indigo-800 mr-2 transition-colors">Parcours</Link>
          <span className="text-gray-400 dark:text-gray-600">/</span>
          <Link href={`/learning-path#module-${moduleId}`} className="text-indigo-600 hover:text-indigo-800 mx-2 transition-colors">Module {moduleId}</Link>
          <span className="text-gray-400 dark:text-gray-600">/</span>
          <span className="ml-2 text-gray-700 dark:text-gray-300">Chargement Leçon {lessonId}...</span>
        </div>
        <div className="animate-pulse space-y-6 mt-4">
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6"><div className="bg-gray-300 dark:bg-gray-700 rounded-lg h-72"></div><div className="bg-gray-300 dark:bg-gray-700 rounded-lg h-48"></div></div>
            <div className="bg-gray-300 dark:bg-gray-700 rounded-lg h-64"></div>
          </div>
        </div>
      </div>
    );
  }

  if (fetchError || !lesson) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl border border-red-200 dark:border-red-700">
            <svg className="mx-auto h-12 w-12 text-red-400 dark:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <h1 className="mt-5 text-2xl font-semibold text-red-600 dark:text-red-400">Erreur de chargement</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">{fetchError || 'La leçon que vous recherchez n\'existe pas ou est inaccessible.'}</p>
            <div className="mt-6">
              <Link href={`/learning-path`} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                Retour au parcours
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6 text-sm">
        <Link href="/learning-path" className="text-indigo-600 hover:text-indigo-800 transition-colors">Parcours</Link>
        <span className="mx-2 text-gray-400 dark:text-gray-600">{'>'}</span>
        <Link href={`/learning-path#module-${moduleId}`} className="text-indigo-600 hover:text-indigo-800 transition-colors">Module {moduleId}</Link>
        <span className="mx-2 text-gray-400 dark:text-gray-600">{'>'}</span>
        <span className="text-gray-700 dark:text-gray-300 font-medium">Leçon {lessonId}: {lesson.title}</span>
      </div>
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 md:p-8 mb-8 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-4">
          <div className="flex-1 mb-4 sm:mb-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-1">{lesson.title}</h1>
            {lesson.description && (<p className="text-gray-600 dark:text-gray-400 text-md">{lesson.description}</p>)}
          </div>
          <div className="flex items-center space-x-4 text-sm flex-shrink-0">
            {lesson.difficulty && (
              <span className={`font-semibold px-3 py-1 rounded-full text-xs ${
                lesson.difficulty === 'débutant' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                lesson.difficulty === 'intermédiaire' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                lesson.difficulty === 'avancé' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}>{lesson.difficulty.charAt(0).toUpperCase() + lesson.difficulty.slice(1)}</span>
            )}
            {lesson.duration && (
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{lesson.duration} min</span>
              </div>
            )}
          </div>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex flex-col sm:flex-row justify-between sm:items-center">
          {lesson.tags && lesson.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3 sm:mb-0">
              {lesson.tags.map((tag, index) => ( <span key={index} className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full px-3 py-1 text-xs font-medium">{tag}</span> ))}
            </div>
          )}
          <div className="bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-md flex items-center text-xs font-medium self-start sm:self-auto mt-2 sm:mt-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>Temps écoulé: {formatTime(completionTime)}</span>
          </div>
        </div>
      </motion.div>
      
      {lesson && (
        <LessonContent 
          lesson={lesson} 
          moduleId={moduleId} 
          lessonId={lessonId}
          lessonTitles={lessonTitles}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          sectionCompleted={sectionCompleted}
          setSectionCompleted={setSectionCompleted}
          currentProgress={currentProgress} // Pass state from LessonPage
          setCurrentProgress={setCurrentProgress} // Pass setter from LessonPage
          availableLessons={{ next: nextLesson, prev: prevLesson }}
        />
      )}
    </div>
  );
}
"use client";

import { usePathname } from 'next/navigation';
import AIAssistant from '@/components/learning/AIAssistant';

// Ce composant permet d'intégrer l'assistant IA dans toute l'application
export default function GlobalAIAssistant() {
  const pathname = usePathname();
  
  // Déterminer si nous sommes sur une page de leçon
  const isLessonPage = pathname && pathname.includes('/lessons/module/');
  
  // Si nous ne sommes pas sur une page de leçon, afficher l'assistant
  // sans contexte spécifique de leçon
  if (!isLessonPage) {
    return <AIAssistant />;
  }
  
  // Sur les pages de leçons, nous n'ajoutons pas l'assistant ici
  // car il est déjà intégré via le composant LearningSection
  return null;
}
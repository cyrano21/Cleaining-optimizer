import { NextResponse } from 'next/server';
import { LESSONS } from '@/data/lessons';

interface LessonInCollection {
  id: string; // Full ID like "1-1"
  title: string;
  duration?: number;
  description?: string;
  difficulty?: string;
  // Add other properties you need from the LESSONS object for each lesson
}

interface ModuleOutput {
  id: string; // Module number string, e.g., "1"
  title: string;
  description: string;
  difficulty: string;
  lessons: LessonInCollection[]; // Array of lessons belonging to this module
  imageUrl?: string;
  // Add any other module-specific properties you want to return
}

interface ModulesCollection {
  [moduleId: string]: ModuleOutput;
}

export async function GET() {
  try {
    const modulesData: ModulesCollection = {};
    
    // Default metadata for modules, can be expanded
    const moduleMeta: { [key: string]: { title: string; description: string; difficulty: string, imageUrl?: string } } = {
      '1': { title: 'Introduction à Next.js', description: 'Découvrez les bases et l\'écosystème de Next.js.', difficulty: 'Débutant', imageUrl: '/images/modules/module1.webp' },
      '2': { title: 'Fondamentaux de Next.js', description: 'Pages, routage, récupération de données, et composants.', difficulty: 'Débutant', imageUrl: '/images/modules/module2.webp' },
      '3': { title: 'Fonctionnalités Intermédiaires', description: 'API Routes, génération statique et dynamique, et plus.', difficulty: 'Intermédiaire', imageUrl: '/images/modules/module3.webp' },
      '4': { title: 'React Avancé avec Next.js', description: 'Hooks avancés, gestion d\'état, et patterns.', difficulty: 'Intermédiaire', imageUrl: '/images/modules/module4.webp' },
      '5': { title: 'API et Bases de Données', description: 'Intégration de backends et gestion de données.', difficulty: 'Avancé', imageUrl: '/images/modules/module5.webp' },
      '6': { title: 'Tests et Déploiement', description: 'Assurer la qualité et mettre en production.', difficulty: 'Avancé', imageUrl: '/images/modules/module6.webp' },
      '7': { title: 'Performance et Optimisation', description: 'Optimiser le build, le rendu, et le chargement.', difficulty: 'Expert', imageUrl: '/images/modules/module7.webp' },
      '8': { title: 'Internationalisation et Avancé', description: 'i18n, thèmes, et fonctionnalités avancées de Next.js.', difficulty: 'Expert', imageUrl: '/images/modules/module8.webp' },
      '9': { title: 'Tests et Qualité', description: 'Tests unitaires, tests d\'intégration et assurance qualité avec Next.js.', difficulty: 'Intermédiaire', imageUrl: '/images/modules/module9.webp' },
      '10': { title: 'CMS Headless', description: 'Intégration avec des CMS headless et gestion de contenu.', difficulty: 'Intermédiaire', imageUrl: '/images/modules/module10.webp' },
      '11': { title: 'Architecture Avancée', description: 'Patterns d\'architecture et gestion de projets complexes.', difficulty: 'Avancé', imageUrl: '/images/modules/module11.webp' },
      '12': { title: 'DevOps et Déploiement', description: 'Pratiques DevOps, CI/CD et déploiement automatisé.', difficulty: 'Avancé', imageUrl: '/images/modules/module12.webp' },
      '13': { title: 'Micro-frontends', description: 'Architecture micro-frontends et modularité avancée.', difficulty: 'Expert', imageUrl: '/images/modules/module13.webp' },
      '14': { title: 'Sécurité Avancée', description: 'Sécurisation complète d\'applications Next.js en production.', difficulty: 'Expert', imageUrl: '/images/modules/module14.webp' },
      '15': { title: 'SEO et Performance', description: 'Optimisation SEO avancée et surveillance des performances.', difficulty: 'Expert', imageUrl: '/images/modules/module15.webp' },
      '16': { title: 'Projet Final', description: 'Mise en pratique de toutes les compétences acquises.', difficulty: 'Expert', imageUrl: '/images/modules/module16.webp' }
    };

    // Assuming LESSONS is an object where keys are full lesson IDs "moduleId-lessonNum"
    // and values are lesson objects.
    const allLessons: { [key: string]: any } = LESSONS; 

    Object.entries(allLessons).forEach(([fullLessonId, lessonData]) => {
      const parts = fullLessonId.split('-');
      if (parts.length < 2) return; // Skip malformed IDs
      const moduleId = parts[0];
      // const lessonNumStr = parts[1];

      if (!modulesData[moduleId]) {
        const meta = moduleMeta[moduleId] || { 
          title: `Module ${moduleId}`, 
          description: `Description du Module ${moduleId}`, 
          difficulty: 'Indéfini' 
        };
        modulesData[moduleId] = {
          id: moduleId,
          title: meta.title,
          description: meta.description,
          difficulty: meta.difficulty,
          imageUrl: meta.imageUrl,
          lessons: []
        };
      }
      
      // Ensure lessonData has the expected properties
      const lessonSummary: LessonInCollection = {
        id: fullLessonId, // Keep the full ID for client-side linking
        title: lessonData.title || 'Titre de leçon manquant',
        duration: lessonData.duration,
        // You might want to add other summary details here if needed on the overview page
      };
      modulesData[moduleId].lessons.push(lessonSummary);
    });

    // Sort lessons within each module by their number (extracted from full ID)
    Object.values(modulesData).forEach(module => {
      module.lessons.sort((a, b) => {
        const aNum = parseInt((a.id.split('-')[1] || '0'), 10);
        const bNum = parseInt((b.id.split('-')[1] || '0'), 10);
        return aNum - bNum;
      });
    });

    return NextResponse.json(Object.values(modulesData)); // Return array of module objects
  } catch (error) {
    console.error('Erreur API /api/modules:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur lors de la récupération des modules.' }, { status: 500 });
  }
}
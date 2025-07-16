"use client";

import { useState } from 'react';
import PortfolioBuilder from '../../components/portfolio/PortfolioBuilder';
import PortfolioPreview from '../../components/portfolio/PortfolioPreview';

// Indiquer à Next.js de ne pas prévisualiser cette page pendant le build
export const dynamic = 'force-dynamic';

export default function PortfolioPage() {
  const [view, setView] = useState('builder');
  const [portfolioData, setPortfolioData] = useState({
    name: '',
    title: 'Développeur Next.js',
    bio: '',
    email: '',
    github: '',
    linkedin: '',
    website: '',
    skills: ['Next.js', 'React', 'JavaScript', 'Tailwind CSS'],
    theme: 'modern',
    selectedProjects: []
  });
  
  // Simuler des projets pour la prévisualisation
  const [projects, setProjects] = useState([
    {
      id: 'project-1',
      title: 'Application Todo avec Next.js',
      description: 'Une application de gestion de tâches créée avec Next.js et React.',
      thumbnail: '/images/projects/todo-app.jpg',
      technologies: ['Next.js', 'React', 'Tailwind CSS'],
      demoUrl: 'https://todo-app-demo.vercel.app',
      codeUrl: 'https://github.com/username/todo-app',
      moduleId: 'components',
      lessonId: 'components-lesson-3',
      completed: true,
      featured: false
    },
    {
      id: 'project-2',
      title: 'Blog personnel',
      description: 'Un blog personnel avec fonctionnalités de commentaires et système d\'authentification.',
      thumbnail: '/images/projects/blog.jpg',
      technologies: ['Next.js', 'React', 'NextAuth', 'MongoDB'],
      demoUrl: 'https://blog-demo.vercel.app',
      codeUrl: 'https://github.com/username/blog',
      moduleId: 'data-fetching',
      lessonId: 'data-fetching-lesson-5',
      completed: true,
      featured: true
    },
    {
      id: 'project-3',
      title: 'E-commerce',
      description: 'Une boutique en ligne avec panier d\'achat et paiement intégré.',
      thumbnail: '/images/projects/ecommerce.jpg',
      technologies: ['Next.js', 'React', 'Stripe', 'Tailwind CSS'],
      demoUrl: 'https://ecommerce-demo.vercel.app',
      codeUrl: 'https://github.com/username/ecommerce',
      moduleId: 'api-routes',
      lessonId: 'api-routes-lesson-4',
      completed: true,
      featured: false
    }
  ]);
  
  // Fonction pour mettre à jour les données du portfolio
  const updatePortfolioData = (newData) => {
    setPortfolioData(newData);
  };
  
  // Fonction pour basculer entre le constructeur et la prévisualisation
  const toggleView = () => {
    setView(view === 'builder' ? 'preview' : 'builder');
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Mon Portfolio Professionnel</h1>
          <button
            onClick={toggleView}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {view === 'builder' ? 'Prévisualiser' : 'Modifier'}
          </button>
        </div>
      </header>
      
      <main className="py-8">
        {view === 'builder' ? (
          <PortfolioBuilder 
            portfolioData={portfolioData}
            updatePortfolioData={updatePortfolioData}
            projects={projects}
          />
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Prévisualisation du portfolio</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Voici à quoi ressemblera votre portfolio. Vous pouvez revenir à l'éditeur pour apporter des modifications.
                </p>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <PortfolioPreview 
                    portfolioData={portfolioData}
                    projects={projects}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

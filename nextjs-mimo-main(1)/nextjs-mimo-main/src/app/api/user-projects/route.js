
import { NextResponse } from 'next/server';

// Cette fonction simule la récupération des projets depuis une base de données
// Dans une application réelle, vous récupéreriez ces données depuis une BDD ou un CMS
async function fetchUserProjects() {
  // Simuler un délai de réseau
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return [
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
    },
    {
      id: 'project-4',
      title: 'Dashboard analytique',
      description: 'Un tableau de bord pour visualiser des données analytiques avec des graphiques interactifs.',
      thumbnail: '/images/projects/dashboard.jpg',
      technologies: ['Next.js', 'React', 'D3.js', 'Recharts'],
      demoUrl: 'https://dashboard-demo.vercel.app',
      codeUrl: 'https://github.com/username/dashboard',
      moduleId: 'optimization',
      lessonId: 'optimization-lesson-3',
      completed: false,
      featured: false
    }
  ];
}

// Gestionnaire de la route GET /api/user-projects
export async function GET() {
  try {
    const projects = await fetchUserProjects();
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Erreur lors de la récupération des projets:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des projets' },
      { status: 500 }
    );
  }
}

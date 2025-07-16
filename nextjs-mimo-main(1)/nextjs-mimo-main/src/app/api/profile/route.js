
import { NextResponse } from 'next/server';

// Cette fonction simule la récupération du profil depuis une base de données
// Dans une application réelle, vous récupéreriez ces données depuis une BDD ou un service d'auth
async function fetchUserProfile() {
  // Simuler un délai de réseau
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return {
    id: 'user-1',
    fullName: 'Jean Dupont',
    email: 'jean.dupont@example.com',
    bio: 'Développeur passionné par Next.js et les technologies web modernes.',
    github: 'https://github.com/jeandupont',
    linkedin: 'https://linkedin.com/in/jeandupont',
    website: 'https://jeandupont.dev',
    role: 'user',
    progress: {
      completedLessons: 14,
      totalLessons: 36,
      completedProjects: 2,
      xpPoints: 750
    }
  };
}

// Gestionnaire de la route GET /api/profile
export async function GET() {
  try {
    const profile = await fetchUserProfile();
    return NextResponse.json(profile);
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du profil' },
      { status: 500 }
    );
  }
}

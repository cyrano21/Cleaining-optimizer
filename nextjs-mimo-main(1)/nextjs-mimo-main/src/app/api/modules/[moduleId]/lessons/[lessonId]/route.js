import { NextResponse } from 'next/server';
import { getLesson, getAllLessons, LESSONS } from '@/data/lessons';

// Journalisation pour le débogage
console.log('[LESSONS DEBUG] LESSONS keys:', Object.keys(LESSONS || {}).join(', '));

export async function GET(request, { params }) {
  const { moduleId, lessonId } = params;
  const normalizedKey = `${moduleId}-${lessonId}`;
  
  // Journalisation améliorée
  console.log(`[API] Requête pour la leçon: module=${moduleId}, leçon=${lessonId}`);
  
  // Vérification des imports
  try {
    const lessons = await import('@/data/lessons');
    console.log('[API] Modules de leçons importés avec succès');
    console.log('[API] Méthodes disponibles:', Object.keys(lessons).join(', '));
    console.log('[API] Nombre de leçons chargées:', Object.keys(lessons.LESSONS || {}).length);
  } catch (err) {
    console.error('[ERREUR] Échec du chargement du module de leçons:', err);
  }

  // Récupération des données de la leçon
  console.log(`[LESSONS DEBUG] Récupération de la leçon ${moduleId}-${lessonId}`);
  const lessonData = getLesson(moduleId, lessonId);
  console.log('[LESSONS DEBUG] Données de la leçon:', JSON.stringify(lessonData, null, 2).substring(0, 500) + '...');
  
  if (lessonData) {
    console.log(`[SUCCÈS] Données de la leçon ${normalizedKey} récupérées`);
    console.log(`[DÉTAILS] Titre: ${lessonData.title}, Durée: ${lessonData.duration} min`);
  } else {
    console.warn(`[AVERTISSEMENT] Aucune donnée trouvée pour la leçon ${normalizedKey}`);
  }
  
  // Liste des leçons disponibles
  const allLessons = getAllLessons();
  console.log(`[INFO] ${allLessons.length} leçons disponibles dans le système`);

  if (!lessonData) {
    return new Response(
      JSON.stringify({
        error: 'Leçon non trouvée',
        requestedKey: normalizedKey,
        message: 'La leçon demandée n\'existe pas.',
        availableLessons: allLessons.map(l => l.id)
      }),
      {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  return new Response(JSON.stringify(lessonData), {
    headers: { 'Content-Type': 'application/json' },
  });
}
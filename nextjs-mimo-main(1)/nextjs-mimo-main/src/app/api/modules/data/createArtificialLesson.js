// Fonction pour créer des leçons artificielles
function createArtificialLesson(moduleId, lessonId) {
  console.log(`Creating artificial lesson for module ${moduleId}, lesson ${lessonId}`);
  
  // Logique pour créer des leçons artificielles basées sur moduleId et lessonId
  const lessonData = {
    title: `Leçon ${moduleId}-${lessonId}`,
    description: `Description de la leçon ${moduleId}-${lessonId}`,
    difficulty: 'intermédiaire',
    duration: 30,
    tags: ['Next.js', 'React'],
    prerequisites: [],
    content: `<h2>Contenu de la leçon ${moduleId}-${lessonId}</h2>`,
    hasExercise: false,
    hasQuiz: false,
    hasProject: false
  };

  return lessonData;
}

export default createArtificialLesson;

// Données des leçons
const LESSONS = {
  // Module 1: Introduction à Next.js
  '1-1': {
    title: 'Introduction à Next.js',
    description: 'Découvrez les bases de Next.js et ses avantages',
    difficulty: 'débutant',
    duration: 45,
    tags: ['Next.js', 'React', 'SSR', 'SSG'],
    prerequisites: [],
    content: `
      <h2>Qu'est-ce que Next.js?</h2>
      <p>Next.js est un framework React qui offre des fonctionnalités comme le rendu côté serveur (SSR), la génération de sites statiques (SSG), et bien plus encore.</p>

      <h3>Historique et évolution</h3>
      <p>Next.js a été créé par Vercel (anciennement ZEIT) et est maintenu par une communauté active.</p>
    `,
    hasExercise: true,
    hasQuiz: true,
    hasProject: false,
    example: {
      title: 'Exemple de code',
      code: 'console.log("Hello World");',
      explanation: 'Un exemple de code simple'
    },
    exercise: {
      title: 'Exercice',
      description: 'Un exercice simple',
      options: [
        { id: 1, text: 'Option 1', correct: true },
        { id: 2, text: 'Option 2', correct: false },
        { id: 3, text: 'Option 3', correct: false }
      ],
      type: 'multipleChoice'
    },
    quiz: {
      title: 'Quiz',
      questions: [
        {
          question: 'Quelle est la couleur du ciel?',
          options: ['rouge', 'bleu', 'vert', 'jaune'],
          correctAnswer: 'bleu'
        },
        {
          question: 'Quelle est la capitale de la France?',
          options: ['Paris', 'Londres', 'Berlin', 'Madrid'],
          correctAnswer: 'Paris'
        }
      ]
    },
    project: {
      title: 'Projet',
      description: 'Un projet simple',
      initialCode: 'console.log("Hello World");',
      solution: 'console.log("Hello World");',
      language: 'javascript'
    }
  },
  // Ajoutez d'autres leçons ici...
};

export default LESSONS;

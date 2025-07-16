// src/data/lessons/module1/lesson1.js
const lesson1 = {
  id: '1-1',
  title: "Qu'est-ce que Next.js",
  description: 'Introduction à Next.js et ses concepts fondamentaux',
  difficulty: 'débutant',
  duration: 15,
  tags: ['Next.js', 'React', 'SSR', 'Débutant'],
  prerequisites: [],
  content: `
    <h2>Introduction à Next.js</h2>
    <p>Next.js est un framework React qui permet de créer des applications web complètes avec des fonctionnalités avancées comme le rendu côté serveur (SSR), la génération de sites statiques (SSG), et bien plus encore.</p>
    <h3>Histoire de Next.js</h3>
    <p>Lancé en 2016 par Vercel, Next.js simplifie le développement d'applications React en fournissant une structure et des outils qui résolvent de nombreux problèmes courants.</p>
    <h3>Next.js dans l'écosystème React</h3>
    <p>Alors que React est une bibliothèque pour construire des interfaces utilisateur, Next.js est un framework complet qui s'appuie sur React et ajoute des fonctionnalités supplémentaires pour faciliter le développement d'applications web complètes.</p>
  `,
  example: {
    title: 'Comparaison entre React et Next.js',
    code: `// Application React basique
import React from 'react';
import ReactDOM from 'react-dom';

function App() {
  return <h1>Hello, World!</h1>;
}

ReactDOM.render(<App />, document.getElementById('root'));

// Application Next.js basique
// pages/index.js
export default function Home() {
  return <h1>Hello, World!</h1>;
}`,
    explanation:
      'Dans React, vous devez configurer manuellement le rendu dans le DOM. Next.js simplifie cela avec son système de routage basé sur les fichiers.'
  },
  exercise: {
    title: 'Identifier les avantages de Next.js',
    description:
      "Parmi les options suivantes, sélectionnez les avantages qu'offre Next.js par rapport à React seul.",
    options: [
      { id: 1, text: 'Routage basé sur le système de fichiers', correct: true },
      { id: 2, text: 'Rendu côté serveur (SSR) intégré', correct: true },
      { id: 3, text: 'Génération de sites statiques (SSG)', correct: true },
      { id: 4, text: 'Support TypeScript natif', correct: true },
      { id: 5, text: 'Optimisation automatique des images', correct: true },
      { id: 6, text: 'Next.js est plus léger que React', correct: false },
      { id: 7, text: 'Next.js remplace complètement React', correct: false },
      {
        id: 8,
        text: "Next.js inclut une gestion d'état globale intégrée",
        correct: false
      }
    ],
    type: 'multiple'
  },
  quiz: {
    title: 'Quiz sur les avantages de Next.js',
    questions: [
      {
        question:
          'Quelle est la principale différence entre React et Next.js ?',
        options: [
          'Next.js est un framework, React est une bibliothèque',
          'React est plus rapide que Next.js',
          'Next.js ne peut pas utiliser React',
          'Ils sont identiques'
        ],
        correctAnswer: 'Next.js est un framework, React est une bibliothèque'
      },
      {
        question: "Quelle fonctionnalité n'est PAS incluse dans Next.js ?",
        options: [
          'Routage',
          'Rendu côté serveur',
          "Gestion d'état globale",
          "Optimisation d'images"
        ],
        correctAnswer: "Gestion d'état globale"
      },
      {
        question: "Quel est l'avantage principal du rendu côté serveur (SSR) ?",
        options: [
          'Meilleure expérience utilisateur',
          'Meilleur référencement (SEO)',
          'Chargement plus rapide des pages',
          'Toutes ces réponses'
        ],
        correctAnswer: 'Toutes ces réponses'
      },
      {
        question:
          'Quelle commande permet de créer une nouvelle application Next.js ?',
        options: [
          'npx create-next-app',
          'npm init next-app',
          'yarn create next-app',
          'Toutes ces réponses'
        ],
        correctAnswer: 'Toutes ces réponses'
      },
      {
        question:
          'Quelle est la fonctionnalité principale que Next.js ajoute à React ?',
        options: [
          "Gestion d'état",
          'Rendu côté serveur',
          'Style en CSS',
          'Animations'
        ],
        correctAnswer: 'Rendu côté serveur'
      }
    ]
  },
  project: {
    title: 'Créer une page simple avec Next.js',
    description:
      "Dans cet exercice, vous allez créer une page d'accueil simple avec Next.js qui affiche un titre et un paragraphe.",
    initialCode:
      '// pages/index.js\nexport default function Home() {\n  // Complétez le code ici\n}',
    solution:
      '// pages/index.js\nexport default function Home() {\n  return (\n    <div>\n      <h1>Ma première page Next.js</h1>\n      <p>Bienvenue dans mon application Next.js !</p>\n    </div>\n  );\n}'
  },
  hasExercise: true,
  hasQuiz: true,
  hasProject: true
};

export default lesson1;

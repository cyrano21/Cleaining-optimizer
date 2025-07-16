// src/data/lessons/module1/lesson2.js
export default {
  id: '1-2',
  title: 'Installation et configuration',
  description: 'Mise en place d\'un projet Next.js',
  difficulty: 'débutant',
  duration: 20,
  tags: ['Next.js', 'Configuration', 'npm', 'yarn'],
  prerequisites: ['1-1'],
  content: `
    <h2>Installation de Next.js</h2>
    <p>Pour créer un nouveau projet Next.js, exécutez cette commande :</p>
    <pre><code>npx create-next-app@latest my-app</code></pre>
    <p>Cela installera un projet complet avec React, Babel, Webpack, ESLint, TypeScript optionnel, et bien plus encore.</p>
    <h3>Structure de base d’un projet Next.js</h3>
    <ul>
      <li><strong>pages/</strong> : Contient les composants de page</li>
      <li><strong>public/</strong> : Ressources statiques (images, favicon)</li>
      <li><strong>styles/</strong> : Fichiers CSS globaux ou modules</li>
      <li><strong>next.config.js</strong> : Configuration personnalisée</li>
    </ul>
  `,
  example: {
    title: 'Initialisation d\'un projet Next.js',
    code: '// next.config.js\nmodule.exports = {\n  reactStrictMode: true,\n  swcMinify: true,\n  images: {\n    domains: [\'example.com\', \'localhost\'],\n  },\n};',
    explanation:
      'Exemple de configuration personnalisée pour activer le mode strict et autoriser certains domainés d\'images.',
  },
  exercise: {
    title: 'Installer un projet Next.js',
    description: 'Installez un projet Next.js avec TypeScript activé.',
    initialCode: '// Terminal\nnpx create-next-app@latest --typescript my-app',
    solution: '// Terminal\nnpx create-next-app@latest --typescript my-app\ncd my-app\nnpm run dev',
  },
  quiz: {
    title: 'Quiz sur l\'installation',
    questions: [
      {
        question: 'Quelle commande crée un projet Next.js avec TypeScript ?',
        options: [
          'npx create-next-app my-app',
          'npx create-next-app --typescript my-app',
          'npm install next-typescript',
          'npx next setup typescript'
        ],
        correctAnswer: 'npx create-next-app --typescript my-app',
      },
      {
        question: 'Où se trouve le point d\'entrée principal d\'une application Next.js ?',
        options: [
          'index.html',
          'app/page.js',
          'pages/_app.js',
          'src/main.js'
        ],
        correctAnswer: 'pages/_app.js',
      },
      {
        question: 'Quel fichier permet de configurer les options globales de Next.js ?',
        options: [
          'package.json',
          'next.config.js',
          '.env',
          '_app.js'
        ],
        correctAnswer: 'next.config.js',
      }
    ],
  },
  hasExercise: true,
  hasQuiz: true,
  hasProject: false,
};
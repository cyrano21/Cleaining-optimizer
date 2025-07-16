const lesson3 = {
  id: '1-3',
  title: 'Structure des dossiers et routage',
  description: 'Comprendre la structure des dossiers et le système de routage dans Next.js',
  difficulty: 'débutant',
  duration: 25,
  tags: ['Next.js', 'Routage', 'Structure', 'Débutant'],
  prerequisites: ['1-1', '1-2'],
  content: `
    <h2>Structure des dossiers dans Next.js</h2>
    <p>Next.js utilise une structure de dossiers spécifique pour le routage et l'organisation du code. Voici les dossiers principaux :</p>
    <ul>
      <li><strong>pages/</strong> : Contient les composants de page (chaque fichier correspond à une route)</li>
      <li><strong>public/</strong> : Fichiers statiques accessibles publiquement</li>
      <li><strong>styles/</strong> : Fichiers CSS globaux ou modules</li>
      <li><strong>components/</strong> : Composants réutilisables (convention)</li>
      <li><strong>lib/</strong> : Code utilitaire (convention)</li>
    </ul>
    
    <h3>Système de routage</h3>
    <p>Next.js utilise un système de routage basé sur le système de fichiers :</p>
    <ul>
      <li><code>pages/index.js</code> → <code>/</code></li>
      <li><code>pages/about.js</code> → <code>/about</code></li>
      <li><code>pages/blog/first-post.js</code> → <code>/blog/first-post</code></li>
      <li><code>pages/posts/[id].js</code> → <code>/posts/1</code>, <code>/posts/abc</code>, etc.</li>
    </ul>
  `,
  example: {
    title: 'Exemple de structure de dossiers',
    code: `my-app/
  ├── pages/
  │   ├── index.js          # Route: /
  │   ├── about.js         # Route: /about
  │   ├── blog/
  │   │   ├── index.js    # Route: /blog
  │   │   └── [slug].js    # Route: /blog/quelque-chose
  │   └── api/            # API routes
  ├── public/             # Fichiers statiques
  ├── styles/             # Fichiers CSS
  ├── components/         # Composants réutilisables
  └── lib/                # Code utilitaire`,
    explanation: 'Cette structure montre comment organiser votre application Next.js. Le système de routage est basé sur la structure du dossier pages/.'
  },
  exercise: {
    title: 'Créer une structure de base',
    description: 'Créez une structure de dossiers pour une application de blog avec les pages suivantes : Accueil, À propos, Liste des articles, Détail d\'un article, et une page de contact.',
    initialCode: '// Créez la structure de dossiers appropriée',
    solution: 'my-app/\n  pages/\n    index.js          # Page d\'accueil\n    about.js         # À propos\n    blog/\n      index.js        # Liste des articles\n      [slug].js      # Détail d\'un article\n    contact.js       # Page de contact',
    tasks: [
      'Créer le dossier pages/',
      'Créer les fichiers pour chaque page',
      'Organiser les routes dynamiques pour les articles de blog'
    ]
  },
  quiz: {
    title: 'Quiz sur la structure et le routage',
    questions: [
      {
        question: 'Quel fichier correspond à la route /about dans Next.js ?',
        options: [
          'pages/about/index.js',
          'pages/about.js',
          'src/pages/about.js',
          'components/about.js'
        ],
        correctAnswer: 'pages/about.js'
      },
      {
        question: 'Comment créer une route dynamique pour afficher un article de blog ?',
        options: [
          'En créant un fichier pages/blog/[id].js',
          'En utilisant un composant avec useRouter',
          'En configurant next.config.js',
          'En important dynamiquement le composant de page'
        ],
        correctAnswer: 'En créant un fichier pages/blog/[id].js'
      },
      {
        question: 'Où placeriez-vous les images statiques dans un projet Next.js ?',
        options: [
          'Dans le dossier public/',
          'Dans le dossier assets/',
          'Dans le dossier images/',
          'Dans le dossier static/'
        ],
        correctAnswer: 'Dans le dossier public/'
      }
    ]
  },
  hasExercise: true,
  hasQuiz: true,
  hasProject: false
};

export default lesson3;

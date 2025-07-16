// src/data/lessons/module5/lesson1.js
const lesson1 = {
  id: '5-1',
  title: 'Backend du Blog : API Routes avec Next.js',
  description: 'Mettez en place la partie backend de votre application de blog en créant des API Routes pour gérer les articles.',
  difficulty: 'intermédiaire',
  duration: 75, // Durée augmentée pour couvrir le CRUD
  tags: ['Next.js', 'Projet', 'Blog', 'API Routes', 'Backend'],
  prerequisites: ['1-3', '2-3'], // Connaissance de la structure Next.js (pages/api) et manipulation de données (JS)
  content: `
    <h2>Création des API pour un blog avec Next.js</h2>
    <p>Dans cette première partie du projet blog, nous allons nous concentrer sur la création des endpoints d'API nécessaires pour gérer les articles. Next.js facilite cela avec son système d'API Routes basé sur les fichiers dans le dossier \`pages/api\`. </p>
    <p>Nous allons implémenter les fonctionnalités CRUD (Create, Read, Update, Delete) pour les articles. Pour l'instant, nous simulerons une base de données avec un simple tableau en mémoire.</p>
    
    <h3>Fonctionnalités de l'API à implémenter :</h3>
    <ul>
      <li><strong>GET /api/posts</strong>: Récupérer la liste de tous les articles.</li>
      <li><strong>POST /api/posts</strong>: Créer un nouvel article.</li>
      <li><strong>GET /api/posts/[id]</strong>: Récupérer un article spécifique par son ID.</li>
      <li><strong>PUT /api/posts/[id]</strong>: Mettre à jour un article spécifique.</li>
      <li><strong>DELETE /api/posts/[id]</strong>: Supprimer un article spécifique.</li>
    </ul>
  `,
  example: {
    title: 'API de base pour lister et ajouter des articles',
    code: `// pages/api/posts/index.js
let posts = [ // Simulation de base de données en mémoire
  { id: 1, title: "Introduction à Next.js", author: "Alice", content: "Contenu de l'article sur Next.js..." },
  { id: 2, title: "Variables en JS", author: "Bob", content: "Tout sur les variables..." }
];
let nextId = 3;

export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json(posts);
  } else if (req.method === 'POST') {
    const { title, author, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }
    const newPost = { id: nextId++, title, author: author || 'Anonyme', content };
    posts.push(newPost);
    res.status(201).json(newPost);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(\`Method \${req.method} Not Allowed\`);
  }
}`,
    explanation: 'Exemple d\'une API Route gérant les requêtes GET pour lister les articles et POST pour en ajouter un nouveau. Les données sont stockées en mémoire pour la simplicité.'
  },
  exercise: {
    title: 'Implémenter les API Routes CRUD pour les articles',
    description: 'Complétez les API Routes pour gérer la lecture (par ID), la mise à jour (PUT) et la suppression (DELETE) des articles. Utilisez un fichier `pages/api/posts/[id].js` pour les routes spécifiques à un article.',
    initialCode: `// pages/api/posts/[id].js
// Supposons que 'posts' et 'nextId' sont gérés dans un module séparé ou partagés
// Pour la simplicité de l'exercice, vous pouvez les redéclarer ici ou imaginer qu'ils sont accessibles.
// import { postsDB } from '../../db'; // Idéalement

let posts = [ 
  { id: 1, title: "Introduction à Next.js", author: "Alice", content: "Contenu de l'article sur Next.js..." },
  { id: 2, title: "Variables en JS", author: "Bob", content: "Tout sur les variables..." }
];


export default function handler(req, res) {
  const { id } = req.query;
  const postId = parseInt(id);
  const postIndex = posts.findIndex(p => p.id === postId);

  if (req.method === 'GET') {
    // TODO: Implémenter la récupération d'un article par son ID
    // Si l'article n'est pas trouvé, retourner un statut 404
    res.status(501).json({ message: 'GET by ID not implemented' });
  } else if (req.method === 'PUT') {
    // TODO: Implémenter la mise à jour d'un article par son ID
    // Récupérer title et content depuis req.body
    // Si l'article n'est pas trouvé, retourner un statut 404
    res.status(501).json({ message: 'PUT not implemented' });
  } else if (req.method === 'DELETE') {
    // TODO: Implémenter la suppression d'un article par son ID
    // Si l'article n'est pas trouvé, retourner un statut 404
    // Si la suppression réussit, retourner un statut 204 (No Content)
    res.status(501).json({ message: 'DELETE not implemented' });
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(\`Method \${req.method} Not Allowed\`);
  }
}`,
    solution: `// pages/api/posts/[id].js
// Simulation d'une "base de données" en mémoire.
// Dans une vraie application, cela viendrait d'un module db.js ou similaire.
let posts = [
  { id: 1, title: "Introduction à Next.js", author: "Alice", content: "Contenu de l'article sur Next.js..." },
  { id: 2, title: "Variables en JS", author: "Bob", content: "Tout sur les variables..." }
];
// Assurez-vous que 'posts' ici est la même instance que dans pages/api/posts/index.js
// Pour un exercice simple, on peut le redéfinir, mais ce n'est pas idéal pour une app réelle.
// L'idéal serait d'exporter 'posts' et 'nextId' d'un module db.js et de l'importer dans les deux fichiers API.

export default function handler(req, res) {
  const { id } = req.query;
  const postId = parseInt(id);

  if (isNaN(postId)) {
    return res.status(400).json({ message: 'Invalid post ID' });
  }

  const postIndex = posts.findIndex(p => p.id === postId);

  if (req.method === 'GET') {
    if (postIndex === -1) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(200).json(posts[postIndex]);
  } else if (req.method === 'PUT') {
    if (postIndex === -1) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const { title, content, author } = req.body;
    // Validation simple
    if (!title && !content && !author) {
        return res.status(400).json({ message: 'At least one field (title, content, author) must be provided for update' });
    }
    
    const updatedPost = { ...posts[postIndex] };
    if (title) updatedPost.title = title;
    if (content) updatedPost.content = content;
    if (author) updatedPost.author = author;
    
    posts[postIndex] = updatedPost;
    res.status(200).json(updatedPost);
  } else if (req.method === 'DELETE') {
    if (postIndex === -1) {
      return res.status(404).json({ message: 'Post not found' });
    }
    posts.splice(postIndex, 1); // Supprime l'élément du tableau
    res.status(204).end(); // 204 No Content
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(\`Method \${req.method} Not Allowed\`);
  }
}`
  },
  quiz: { /* ... (quiz existant est bon) ... */
    title: 'Quiz sur les API Routes pour un CRUD',
    questions: [
      {
        question: 'Quelle méthode HTTP est typiquement utilisée pour créer une nouvelle ressource via une API ?',
        options: ['GET', 'POST', 'PUT', 'PATCH'],
        correctAnswer: 'POST'
      },
      {
        question: 'Pour mettre à jour intégralement une ressource existante, quelle méthode HTTP est généralement préférée ?',
        options: ['POST', 'PUT', 'PATCH', 'UPDATE'],
        correctAnswer: 'PUT'
      },
      {
        question: 'Quel statut HTTP est approprié pour indiquer qu\'une ressource demandée via GET n\'a pas été trouvée ?',
        options: ['200 OK', '204 No Content', '400 Bad Request', '404 Not Found'],
        correctAnswer: '404 Not Found'
      },
      {
        question: 'Dans Next.js, comment accédez-vous aux paramètres de route dynamique (ex: `[id]`) dans une API Route ?',
        options: ['req.params.id', 'req.query.id', 'req.body.id', 'req.dynamic.id'],
        correctAnswer: 'req.query.id'
      }
    ]
  },
  project: { /* ... (projet existant est bon, mais dépendra des leçons suivantes du module 5) ... */
    title: 'Projet Blog Complet : Backend et Frontend',
    description: 'Créez une application de blog complète avec un backend (API Routes) et un frontend (React/Next.js) pour la création, lecture, mise à jour et suppression d\'articles. Connectez-le à une base de données persistante.',
    requirements: [
      "API Routes pour le CRUD complet des articles.",
      "Pages frontend pour lister tous les articles, afficher un article, créer un nouvel article, et modifier un article existant.",
      "Utilisation de formulaires (avec validation) pour la création/modification.",
      "Connexion à une base de données (ex: Supabase, MongoDB Atlas, PlanetScale avec Prisma).",
      "Gestion basique des erreurs et retours à l'utilisateur."
    ],
    tips: [
      "Séparez la logique de la base de données dans des fonctions utilitaires.",
      "Utilisez `fetch` ou une bibliothèque comme SWR/React Query pour le data fetching côté client.",
      "Considérez `getStaticProps` ou `getServerSideProps` pour le rendu des pages de blog.",
      "Pensez à l'expérience utilisateur (UX) pour les formulaires et la navigation."
    ],
    bonus: [
      "Ajoutez un système de commentaires.",
      "Implémentez une fonctionnalité de recherche d'articles.",
      "Ajoutez la pagination pour la liste des articles.",
      "Intégrez une authentification simple pour protéger la création/modification d'articles (voir Module 7)."
    ]
  },
  hasExercise: true,
  hasQuiz: true,
  hasProject: true
};

export default lesson1;
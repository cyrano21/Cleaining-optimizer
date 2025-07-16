// src/data/lessons/module5/lesson4.js
const lesson4 = {
  id: '5-4',
  title: 'Blog : Base de Données Persistante avec Prisma & PostgreSQL',
  description: 'Rendez votre application de blog robuste en intégrant une base de données PostgreSQL via l\'ORM Prisma, remplaçant ainsi le stockage de données en mémoire et en assurant une gestion d\'erreurs adéquate.',
  difficulty: 'avancé',
  duration: 130, 
  tags: ['Next.js', 'Projet', 'Blog', 'Base de Données', 'Prisma', 'PostgreSQL', 'ORM', 'Backend', 'Supabase', 'Error Handling'],
  prerequisites: ['5-1', '2-2'], 
  content: `
    <h2>Persistance des Données : Intégration d'une Base de Données avec Prisma</h2>
    <p>Pour transformer notre blog d'une application de démonstration à une application robuste, la persistance des données est essentielle. Nous allons abandonner le stockage en mémoire au profit d'une base de données <strong>PostgreSQL</strong>, gérée via l'ORM <strong>Prisma</strong>. Cela garantira que les articles, les modifications et les nouvelles publications sont sauvegardés de manière permanente.</p>
    {/* ... (Introduction à Prisma et PostgreSQL, Étapes 1-8 de la version précédente sont bonnes et détaillées) ... */}
    <p>Les étapes incluent : la configuration d'une base de données PostgreSQL (ex: via Supabase), l'installation de Prisma, l'initialisation de Prisma dans le projet, la configuration de l'URL de la base de données dans <code>.env</code>, la définition du modèle <code>Post</code> dans <code>schema.prisma</code>, la création et l'application des migrations, la génération du client Prisma, et la création d'une instance partagée du client Prisma (<code>lib/prisma.js</code>).</p>

    <h3>9. Mettre à Jour Vos API Routes pour Utiliser Prisma :</h3>
    <p>C'est ici que la magie opère. Nous allons modifier nos fichiers API (<code>pages/api/posts/index.js</code> et <code>pages/api/posts/[id].js</code>) pour remplacer les manipulations de tableaux en mémoire par des appels à notre instance Prisma. Cela implique d'utiliser des méthodes comme <code>prisma.post.findMany()</code>, <code>prisma.post.create()</code>, <code>prisma.post.findUnique()</code>, <code>prisma.post.update()</code>, et <code>prisma.post.delete()</code>.</p>
    <p>Une gestion d'erreur attentive est cruciale lors de l'interaction avec une base de données. Nous allons inclure des blocs <code>try...catch</code> et gérer les erreurs spécifiques de Prisma (comme <code>P2025</code> pour "Record not found").</p>

    <h4>Exemple d'API Route pour <code>GET /api/posts</code> et <code>POST /api/posts</code> :</h4>
    <pre><code class="language-javascript">// pages/api/posts/index.js
import prisma from '../../../lib/prisma'; // Assurez-vous que le chemin est correct

export default async function handleAllPosts(req, res) {
  if (req.method === 'GET') {
    try {
      const posts = await prisma.post.findMany({
        where: { published: true }, // Optionnel: filtrer par statut de publication
        orderBy: { createdAt: 'desc' },
      });
      return res.status(200).json(posts);
    } catch (error) {
      console.error("API Erreur [GET /api/posts]:", error);
      return res.status(500).json({ message: "Erreur interne du serveur lors de la récupération des articles." });
    }
  } else if (req.method === 'POST') {
    const { title, content, author, published } = req.body;

    // Validation côté serveur plus robuste
    if (!title || title.trim().length < 3) {
      return res.status(400).json({ message: "Le titre est requis et doit comporter au moins 3 caractères." });
    }
    if (!content || content.trim().length < 10) {
      return res.status(400).json({ message: "Le contenu est requis et doit comporter au moins 10 caractères." });
    }

    try {
      const newPost = await prisma.post.create({
        data: {
          title: title.trim(),
          content: content.trim(),
          author: author ? author.trim() : null,
          published: typeof published === 'boolean' ? published : false,
        },
      });
      return res.status(201).json(newPost);
    } catch (error) {
      console.error("API Erreur [POST /api/posts]:", error);
      if (error.code === 'P2002' && error.meta?.target?.includes('title')) { 
        // Exemple si vous aviez un champ 'title' @unique
        return res.status(409).json({ message: "Un article avec ce titre existe déjà." });
      }
      return res.status(500).json({ message: "Erreur serveur lors de la création de l'article." });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(\`Méthode \${req.method} non autorisée.\`);
  }
}
    </code></pre>
    <p>De même, les opérations sur un article spécifique (<code>GET [id]</code>, <code>PUT [id]</code>, <code>DELETE [id]</code>) dans <code>pages/api/posts/[id].js</code> devront être mises à jour pour utiliser Prisma, en gérant attentivement les cas où l'article cible n'est pas trouvé (ce qui lèverait une erreur Prisma spécifique comme <code>P2025</code>).</p>
  `,
  example: {
    title: 'Gestion de l\'Opération DELETE avec Prisma et Erreur P2025',
    code: `// pages/api/posts/[id].js (extrait pour la méthode DELETE)
import prisma from '../../../lib/prisma'; // Ajustez le chemin

// export default async function handleSinglePost(req, res) { ...
  // ... (Vérification de postId, autres méthodes GET, PUT) ...
  if (req.method === 'DELETE') {
    const { id: queryId } = req.query; // Assurez-vous que ceci est dans le bon scope du handler
    const postId = parseInt(queryId);

    if (isNaN(postId)) { /* ... */ }

    try {
      // Tentative de suppression de l'article
      await prisma.post.delete({
        where: { id: postId },
      });
      // Si la suppression réussit, Prisma ne retourne rien, on envoie 204
      return res.status(204).end(); 
    } catch (error) {
      if (error.code === 'P2025') { 
        // Erreur Prisma: "An operation failed because it depends on one or more records that were required but not found."
        // Cela signifie que l'enregistrement à supprimer (ou à mettre à jour/trouver) n'existe pas.
        return res.status(404).json({ message: \`L'article avec l'ID \${postId} n'a pas été trouvé pour la suppression.\` });
      }
      // Autres erreurs Prisma ou erreurs serveur génériques
      console.error(\`API Erreur [DELETE /api/posts/\${postId}]:\`, error);
      return res.status(500).json({ message: "Erreur serveur lors de la tentative de suppression de l'article." });
    }
  } 
  // ... (else pour méthode non autorisée)
// }
`,
    explanation: 'Cet extrait illustre comment gérer la suppression d\'un article avec Prisma. Il est crucial de catcher les erreurs, en particulier l\'erreur `P2025` de Prisma, qui indique que l\'enregistrement cible n\'a pas été trouvé. Dans ce cas, une réponse 404 est appropriée. Une suppression réussie retourne un statut 204 No Content.'
  },
  exercise: { // L'exercice précédent est bon et couvre déjà ces aspects.
    title: 'Adapter l\'API CRUD Complète pour Utiliser Prisma et Gérer les Erreurs',
    description: 'Après avoir suivi les étapes de configuration de Prisma et de votre base de données PostgreSQL (étapes 1 à 8 de la leçon), votre mission est de migrer **intégralement** les opérations CRUD de vos API Routes (`pages/api/posts/index.js` et `pages/api/posts/[id].js`) pour qu\'elles utilisent Prisma. Portez une attention particulière à la validation des entrées et à une gestion robuste des erreurs, y compris les erreurs spécifiques à Prisma comme `P2025` (enregistrement non trouvé) ou `P2002` (contrainte unique violée, si applicable). \nImplémentez : \n1. `GET /api/posts` \n2. `POST /api/posts` \n3. `GET /api/posts/[id]` \n4. `PUT /api/posts/[id]` \n5. `DELETE /api/posts/[id]`',
    initialCode: `// PRÉREQUIS: Configurer Prisma, .env, schema.prisma, migrations, et lib/prisma.js.

// ---- Fichier: pages/api/posts/index.js ----
// import prisma from '../../../lib/prisma'; 

export default async function handleAllPosts(req, res) {
  if (req.method === 'GET') {
    // TODO: Implémenter avec prisma.post.findMany()
    // Inclure where: { published: true } et orderBy. Gérer les erreurs.
    return res.status(501).json({ message: 'GET /api/posts - Prisma non implémenté' });
  } else if (req.method === 'POST') {
    // TODO: Implémenter avec prisma.post.create()
    // const { title, content, author, published } = req.body;
    // Valider title et content. Gérer les erreurs (dont P2002 si vous avez un champ unique).
    return res.status(501).json({ message: 'POST /api/posts - Prisma non implémenté' });
  } else { /* ... */ }
}

// ---- Fichier: pages/api/posts/[id].js ----
// import prisma from '../../../lib/prisma';

export default async function handleSinglePost(req, res) {
  // const { id } = req.query; const postId = parseInt(id);
  // if (isNaN(postId)) { /* ... */ }

  if (req.method === 'GET') {
    // TODO: Implémenter avec prisma.post.findUnique(). Gérer post non trouvé (404).
    return res.status(501).json({ message: 'GET /api/posts/[id] - Prisma non implémenté' });
  } else if (req.method === 'PUT') {
    // TODO: Implémenter avec prisma.post.update(). Gérer erreur P2025 (404).
    // Valider les données du body.
    return res.status(501).json({ message: 'PUT /api/posts/[id] - Prisma non implémenté' });
  } else if (req.method === 'DELETE') {
    // TODO: Implémenter avec prisma.post.delete(). Gérer erreur P2025 (404). Retourner 204.
    return res.status(501).json({ message: 'DELETE /api/posts/[id] - Prisma non implémenté' });
  } else { /* ... */ }
}`,
    solution: `// Assurez-vous d'avoir créé lib/prisma.js comme montré dans la leçon.

// ---- SOLUTION POUR: pages/api/posts/index.js ----
import prisma from '../../../lib/prisma'; 

export default async function handleAllPosts(req, res) {
  if (req.method === 'GET') {
    try {
      const posts = await prisma.post.findMany({
        where: { published: true },
        orderBy: { createdAt: 'desc' },
      });
      return res.status(200).json(posts);
    } catch (error) {
      console.error("API Error [GET /api/posts]:", error);
      return res.status(500).json({ message: "Erreur interne du serveur lors de la récupération des articles." });
    }
  } else if (req.method === 'POST') {
    const { title, content, author, published } = req.body;

    if (!title || title.trim().length < 3) {
      return res.status(400).json({ message: "Le titre est requis (min 3 caractères)." });
    }
    if (!content || content.trim().length < 10) {
      return res.status(400).json({ message: "Le contenu est requis (min 10 caractères)." });
    }

    try {
      const newPost = await prisma.post.create({
        data: {
          title: title.trim(),
          content: content.trim(),
          author: author ? author.trim() : null,
          published: typeof published === 'boolean' ? published : false,
        },
      });
      return res.status(201).json(newPost);
    } catch (error) {
      console.error("API Error [POST /api/posts]:", error);
      if (error.code === 'P2002' && error.meta?.target?.includes('title')) { // Si 'title' a une contrainte @unique
         return res.status(409).json({ message: "Un article avec ce titre existe déjà."});
      }
      return res.status(500).json({ message: "Erreur serveur lors de la création de l'article." });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(\`Méthode \${req.method} non autorisée pour /api/posts\`);
  }
}


// ---- SOLUTION POUR: pages/api/posts/[id].js ----
import prismaSingle from '../../../lib/prisma'; // Utiliser un alias différent si dans le même fichier pour l'exemple, sinon juste 'prisma'

export default async function handleSinglePost(req, res) { 
  const { id: queryId } = req.query;
  const postId = parseInt(queryId);

  if (isNaN(postId)) {
    return res.status(400).json({ message: 'L\'ID de l\'article doit être un nombre valide.' });
  }

  if (req.method === 'GET') {
    try {
      const post = await prismaSingle.post.findUnique({
        where: { id: postId },
      });
      if (!post) {
        return res.status(404).json({ message: \`L'article avec l'ID \${postId} n'a pas été trouvé.\` });
      }
      return res.status(200).json(post);
    } catch (error) {
      console.error(\`API Erreur [GET /api/posts/\${postId}]:\`, error);
      return res.status(500).json({ message: "Erreur serveur lors de la récupération de l'article." });
    }
  } else if (req.method === 'PUT') {
    const { title, content, author, published } = req.body;
    
    const dataToUpdate = {};
    if (title !== undefined) {
      if (title.trim().length < 3) return res.status(400).json({ message: "Titre invalide (min 3 chars)."});
      dataToUpdate.title = title.trim();
    }
    if (content !== undefined) {
      if (content.trim().length < 10) return res.status(400).json({ message: "Contenu invalide (min 10 chars)."});
      dataToUpdate.content = content.trim();
    }
    if (author !== undefined) dataToUpdate.author = author ? author.trim() : null;
    if (published !== undefined && typeof published === 'boolean') dataToUpdate.published = published;

    if (Object.keys(dataToUpdate).length === 0) {
       return res.status(400).json({ message: "Aucune donnée valide fournie pour la mise à jour." });
    }
    // Ajout de la date de mise à jour manuellement si le schéma ne le fait pas automatiquement pour chaque champ
    dataToUpdate.updatedAt = new Date();


    try {
      const updatedPost = await prismaSingle.post.update({
        where: { id: postId },
        data: dataToUpdate,
      });
      return res.status(200).json(updatedPost);
    } catch (error) {
      if (error.code === 'P2025') { 
        return res.status(404).json({ message: \`L'article avec l'ID \${postId} n'a pas été trouvé pour la mise à jour.\` });
      }
      console.error(\`API Erreur [PUT /api/posts/\${postId}]:\`, error);
      return res.status(500).json({ message: "Erreur serveur lors de la mise à jour de l'article." });
    }
  } else if (req.method === 'DELETE') {
    try {
      await prismaSingle.post.delete({
        where: { id: postId },
      });
      return res.status(204).end(); 
    } catch (error) {
      if (error.code === 'P2025') { 
        return res.status(404).json({ message: \`L'article avec l'ID \${postId} n'a pas été trouvé pour la suppression.\` });
      }
      console.error(\`API Erreur [DELETE /api/posts/\${postId}]:\`, error);
      return res.status(500).json({ message: "Erreur serveur lors de la suppression de l'article." });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).end(\`Méthode \${req.method} non autorisée pour /api/posts/[id]\`);
  }
}`,
  },
  quiz: { // Garder le quiz pertinent déjà créé
    title: 'Quiz sur Prisma et les Bases de Données dans Next.js',
    questions: [
      {
        question: 'Qu\'est-ce que Prisma dans le contexte de Next.js et des bases de données ?',
        options: ['Une base de données NoSQL.', 'Un ORM (Object-Relational Mapper) ou un Query Builder pour interagir avec des bases de données SQL et MongoDB.', 'Un service d\'hébergement de bases de données.', 'Un framework frontend pour Next.js.'],
        correctAnswer: 'Un ORM (Object-Relational Mapper) ou un Query Builder pour interagir avec des bases de données SQL et MongoDB.'
      },
      {
        question: 'Quel fichier principal est utilisé par Prisma pour définir votre schéma de base de données et la configuration du client ?',
        options: ['`database.yml`', '`prisma/schema.prisma`', '`models.js`', '`.env`'],
        correctAnswer: '`prisma/schema.prisma`'
      },
      {
        question: 'Quelle commande Prisma est utilisée pour appliquer les changements de votre schéma à la base de données et créer un fichier de migration ?',
        options: ['`npx prisma generate`', '`npx prisma db push`', '`npx prisma migrate dev`', '`npx prisma studio`'],
        correctAnswer: '`npx prisma migrate dev`',
        explanation: '`prisma migrate dev` crée une migration, l\'applique à la base de données de développement et régénère le client Prisma. `db push` synchronise le schéma sans créer de fichier de migration (utile pour le prototypage).'
      }
    ]
  },
  hasExercise: true,
  hasQuiz: true,
  hasProject: true
};

export default lesson4;
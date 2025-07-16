// src/data/lessons/module10/lesson1.js
const lesson1 = {
  id: '10-1',
  title: 'Introduction aux CMS Headless',
  description:
    "Comprendre le concept de CMS Headless et comment ils s'intègrent avec Next.js",
  difficulty: 'intermédiaire',
  duration: 45,
  tags: ['Next.js', 'CMS Headless', 'API', 'Contentful', 'Strapi'],
  prerequisites: ['2-3', '3-2'],
  content: `
    <h2>Qu'est-ce qu'un CMS Headless ?</h2>
    <p>Un CMS Headless est un système de gestion de contenu qui se concentre uniquement sur le stockage et la livraison de contenu via une API, sans se préoccuper de la façon dont ce contenu est présenté. Contrairement aux CMS traditionnels (comme WordPress), un CMS Headless sépare complètement le back-end (où le contenu est géré) du front-end (où le contenu est affiché).</p>

    <h3>Avantages des CMS Headless</h3>
    <ul>
      <li><strong>Flexibilité</strong> : Liberté totale pour concevoir l'interface utilisateur</li>
      <li><strong>Omnicanalité</strong> : Le même contenu peut être utilisé sur différentes plateformes (web, mobile, IoT)</li>
      <li><strong>Performance</strong> : Optimisation du chargement avec des sites statiques ou hybrides</li>
      <li><strong>Évolutivité</strong> : Architecture plus modulaire et adaptable</li>
      <li><strong>Sécurité</strong> : Réduction de la surface d'attaque en séparant le front-end du back-end</li>
    </ul>

    <h3>CMS Headless populaires</h3>
    <p>Plusieurs solutions sont couramment utilisées avec Next.js :</p>
    <ul>
      <li><strong>Contentful</strong> : CMS cloud robuste avec une API GraphQL et REST</li>
      <li><strong>Strapi</strong> : CMS open source auto-hébergé</li>
      <li><strong>Sanity</strong> : CMS flexible avec un éditeur de contenu personnalisable</li>
      <li><strong>Prismic</strong> : CMS orienté développeur avec un bon support pour Next.js</li>
      <li><strong>DatoCMS</strong> : CMS avec de bonnes fonctionnalités pour les équipes marketing</li>
    </ul>

    <h3>Architecture d'une application Next.js avec CMS Headless</h3>
    <p>Voici comment fonctionne généralement l'architecture :</p>
    <ol>
      <li>Les rédacteurs créent et gèrent le contenu dans l'interface du CMS Headless</li>
      <li>Le contenu est exposé via des API REST ou GraphQL</li>
      <li>Votre application Next.js récupère ce contenu lors du build (génération statique) ou à la demande (SSR)</li>
      <li>Next.js affiche le contenu selon votre design et vos besoins</li>
    </ol>
    
    <h3>Méthodes de récupération de données</h3>
    <p>Avec Next.js, vous avez plusieurs options pour récupérer les données d'un CMS Headless :</p>
    <ul>
      <li><strong>getStaticProps</strong> : Récupération au moment du build pour les pages statiques</li>
      <li><strong>getStaticPaths</strong> : Génération des chemins pour les pages dynamiques</li>
      <li><strong>getServerSideProps</strong> : Récupération à chaque requête pour un contenu toujours à jour</li>
      <li><strong>React Query / SWR</strong> : Pour une récupération côté client avec mise en cache</li>
      <li><strong>App Router</strong> (Next.js 13+) : Composants serveur avec récupération de données intégrée</li>
    </ul>
  `,
  example: {
    title: 'Intégration de Contentful avec Next.js',
    code: `// Installation des dépendances
// npm install contentful

// lib/contentful.js
import { createClient } from 'contentful';

export const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
});

export async function getEntries(type, options = {}) {
  const entries = await client.getEntries({
    content_type: type,
    ...options,
  });
  
  return entries.items;
}

// pages/blog/index.js
import { getEntries } from '../../lib/contentful';

export default function BlogPage({ posts }) {
  return (
    <div>
      <h1>Notre Blog</h1>
      <div className="post-grid">
        {posts.map((post) => (
          <div key={post.sys.id} className="post-card">
            <h2>{post.fields.title}</h2>
            <p>{post.fields.excerpt}</p>
            <a href={\`/blog/\${post.fields.slug}\`}>Lire la suite</a>
          </div>
        ))}
      </div>
    </div>
  );
}

export async function getStaticProps() {
  const posts = await getEntries('blogPost', {
    order: '-fields.publishDate', // Tri par date de publication décroissante
  });

  return {
    props: {
      posts,
    },
    // Revalidation toutes les 10 minutes
    revalidate: 600,
  };
}`,
    explanation:
      "Cet exemple montre comment intégrer Contentful avec Next.js pour afficher une liste d'articles de blog. Nous créons d'abord un client Contentful, puis utilisons la fonction getStaticProps pour récupérer les articles au moment du build. La propriété revalidate active l'Incremental Static Regeneration (ISR), qui permet de régénérer la page en arrière-plan à intervalles réguliers."
  },
  exercise: {
    title: 'Configurer un CMS Headless avec Next.js',
    description:
      'Choisissez la configuration correcte pour intégrer Strapi à votre application Next.js.',
    options: [
      {
        id: 1,
        text: 'Utiliser getServerSideProps pour toutes les pages, même celles avec un contenu rarement mis à jour',
        correct: false
      },
      {
        id: 2,
        text: 'Configurer des webhooks pour déclencher des rebuilds quand le contenu change et utiliser getStaticProps avec revalidate',
        correct: true
      },
      {
        id: 3,
        text: "Stocker les identifiants API directement dans le code sans les cacher dans des variables d'environnement",
        correct: false
      },
      {
        id: 4,
        text: 'Dupliquer les requêtes API dans chaque composant plutôt que de centraliser la logique',
        correct: false
      }
    ]
  },
  quiz: {
    questions: [
      {
        question:
          "Quel est l'avantage principal d'un CMS Headless par rapport à un CMS traditionnel ?",
        options: [
          "Il permet de gérer le contenu et l'affichage dans un seul système",
          'Il est toujours gratuit et open source',
          'Il sépare le contenu (back-end) de la présentation (front-end)',
          'Il ne nécessite pas de base de données'
        ],
        answer: 2
      },
      {
        question:
          'Quelle fonction Next.js est idéale pour récupérer du contenu rarement modifié depuis un CMS Headless ?',
        options: [
          'getServerSideProps',
          'getStaticProps avec revalidate',
          'useEffect dans les composants',
          'getInitialProps'
        ],
        answer: 1
      },
      {
        question:
          'Comment gérer le contenu qui change fréquemment avec Next.js et un CMS Headless ?',
        options: [
          'Toujours utiliser getStaticProps sans revalidate',
          'Utiliser getServerSideProps pour un contenu toujours à jour',
          'Recharger manuellement la page à chaque modification',
          'Ne jamais utiliser la mise en cache'
        ],
        answer: 1
      }
    ]
  },
  project: {
    title: 'Blog avec Contentful et Next.js',
    description:
      'Créez un blog simple en utilisant Contentful comme CMS Headless et Next.js pour le front-end.',
    tasks: [
      'Configurez un compte Contentful et créez un modèle de contenu pour les articles de blog',
      'Intégrez Contentful à votre application Next.js',
      "Créez une page d'accueil qui affiche les derniers articles",
      'Implémentez des pages dynamiques pour chaque article',
      'Ajoutez une pagination pour la liste des articles'
    ],
    starterCode: `// lib/contentful.js
import { createClient } from 'contentful';

// TODO: Créer et configurer le client Contentful

export async function getPosts() {
  // TODO: Récupérer tous les articles de blog
}

export async function getPostBySlug(slug) {
  // TODO: Récupérer un article spécifique par son slug
}

// pages/index.js
export default function Home({ posts }) {
  // TODO: Afficher la liste des articles
}

export async function getStaticProps() {
  // TODO: Implémenter getStaticProps pour récupérer les articles
}`,
    solutionCode: `// lib/contentful.js
import { createClient } from 'contentful';

export const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
});

export async function getPosts(options = {}) {
  const entries = await client.getEntries({
    content_type: 'blogPost',
    order: '-fields.publishDate',
    ...options,
  });
  
  return entries.items;
}

export async function getPostBySlug(slug) {
  const entries = await client.getEntries({
    content_type: 'blogPost',
    'fields.slug': slug,
    limit: 1,
  });
  
  return entries.items[0] || null;
}

// pages/index.js
import Link from 'next/link';
import { getPosts } from '../lib/contentful';

export default function Home({ posts }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Mon Blog</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <div key={post.sys.id} className="border rounded-lg overflow-hidden shadow-md">
            {post.fields.coverImage && (
              <img 
                src={post.fields.coverImage.fields.file.url} 
                alt={post.fields.title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{post.fields.title}</h2>
              <p className="text-gray-600 mb-4">{post.fields.excerpt}</p>
              <Link href={\`/posts/\${post.fields.slug}\`} className="text-blue-500 hover:underline">
                Lire l'article
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export async function getStaticProps() {
  const posts = await getPosts({ limit: 6 });

  return {
    props: {
      posts,
    },
    revalidate: 60 * 10, // Revalidation toutes les 10 minutes
  };
}`
  }
}

export default lesson1

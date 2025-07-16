// src/data/lessons/module10/lesson2.js
const lesson2 = {
  id: '10-2',
  title: 'Intégration avancée avec Strapi CMS',
  description:
    'Explorez les fonctionnalités avancées de Strapi et comment les utiliser efficacement avec Next.js',
  difficulty: 'avancé',
  duration: 60,
  tags: ['Next.js', 'Strapi', 'CMS Headless', 'API', 'GraphQL'],
  prerequisites: ['10-1', '3-3'],
  content: `
    <h2>Présentation de Strapi CMS</h2>
    <p>Strapi est un CMS Headless open source qui permet aux développeurs de créer, gérer et exposer du contenu structuré via une API. Il offre une grande flexibilité, une interface d'administration personnalisable et une excellente intégration avec Next.js.</p>

    <h3>Pourquoi choisir Strapi ?</h3>
    <ul>
      <li><strong>Open Source</strong> : Entièrement gratuit et auto-hébergeable</li>
      <li><strong>Personnalisable</strong> : Interface d'administration adaptable à vos besoins</li>
      <li><strong>API RESTful et GraphQL</strong> : Flexibilité dans la récupération des données</li>
      <li><strong>Système de plugins</strong> : Fonctionnalités extensibles</li>
      <li><strong>Système de rôles et permissions</strong> : Contrôle granulaire des accès</li>
    </ul>

    <h3>Installation et configuration de Strapi</h3>
    <p>Pour démarrer avec Strapi, vous pouvez utiliser la commande suivante :</p>
    <pre><code class="language-bash">npx create-strapi-app@latest my-project --quickstart</code></pre>

    <p>Cette commande crée un nouveau projet Strapi avec une base de données SQLite pour un démarrage rapide. Pour un environnement de production, vous devriez configurer une base de données comme PostgreSQL ou MySQL.</p>

    <h3>Création de types de contenu dans Strapi</h3>
    <p>Dans Strapi, vous pouvez créer deux types de contenu :</p>
    <ul>
      <li><strong>Collection Type</strong> : Pour des contenus répétés comme des articles, des produits, etc.</li>
      <li><strong>Single Type</strong> : Pour des contenus uniques comme la page d'accueil, les paramètres, etc.</li>
    </ul>
    <p>Chaque type peut avoir différents champs : texte, nombre, média, relation, etc.</p>

    <h3>API Strapi avancées</h3>
    <p>Strapi fournit plusieurs options pour interroger votre API :</p>

    <h4>API REST</h4>
    <p>L'API REST de Strapi permet d'effectuer des opérations CRUD standard, avec des fonctionnalités avancées comme le filtrage, le tri et la pagination :</p>
    <pre><code class="language-javascript">// Exemple de requête avec filtrage et pagination
// GET /api/articles?filters[category][name][$eq]=Technologie&pagination[page]=2&pagination[pageSize]=10</code></pre>

    <h4>API GraphQL</h4>
    <p>Strapi propose également une API GraphQL qui permet des requêtes plus précises :</p>
    <pre><code class="language-graphql">query {
  articles(
    filters: { category: { name: { eq: "Technologie" } } }
    pagination: { page: 2, pageSize: 10 }
    sort: ["publishedAt:desc"]
  ) {
    data {
      id
      attributes {
        title
        content
        publishedAt
      }
    }
    meta {
      pagination {
        total
        page
        pageSize
      }
    }
  }
}</code></pre>

    <h3>Internationalisation avec Strapi et Next.js</h3>
    <p>Strapi offre un système d'internationalisation intégré qui permet de gérer du contenu en plusieurs langues. Combiné avec next-i18next, vous pouvez créer des sites multilingues complets.</p>

    <h3>Webhooks et déploiement continu</h3>
    <p>Les webhooks de Strapi peuvent être configurés pour déclencher des événements lorsque le contenu change. Cela peut être utilisé pour déclencher des rebuilds de votre application Next.js sur des plateformes comme Vercel :</p>
    <ol>
      <li>Dans Strapi, configurez un webhook qui s'active lors de la création/mise à jour de contenu</li>
      <li>Pointez ce webhook vers l'URL de redéploiement de votre fournisseur (par exemple, l'URL de build hook Vercel)</li>
      <li>Votre site sera automatiquement reconstruit lorsque le contenu est modifié</li>
    </ol>
  `,
  example: {
    title: 'Intégration complète de Strapi avec Next.js',
    code: `// lib/strapi.js
export function getStrapiURL(path = '') {
  return \`\${process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'}\${path}\`;
}

export async function fetchAPI(path, options = {}) {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  const mergedOptions = {
    ...defaultOptions,
    ...options,
  };
  const requestUrl = getStrapiURL(path);
  const response = await fetch(requestUrl, mergedOptions);
  
  if (!response.ok) {
    throw new Error(\`Erreur API: \${response.status}\`);
  }
  
  const data = await response.json();
  return data;
}

// Fonction pour récupérer tous les articles avec pagination
export async function getArticles(page = 1, pageSize = 10) {
  const path = \`/api/articles?populate=*&pagination[page]=\${page}&pagination[pageSize]=\${pageSize}&sort=publishedAt:desc\`;
  const response = await fetchAPI(path);
  return response;
}

// Fonction pour récupérer un article par son slug
export async function getArticleBySlug(slug) {
  const path = \`/api/articles?filters[slug][$eq]=\${slug}&populate=*\`;
  const response = await fetchAPI(path);
  return response.data[0];
}

// pages/blog/[slug].js
import { getArticleBySlug, getArticles } from '../../lib/strapi';
import { MDXRemote } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import rehypeHighlight from 'rehype-highlight';

export default function ArticlePage({ article, content }) {
  if (!article) return <div>Chargement...</div>;
  
  return (
    <article className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">{article.attributes.title}</h1>
      <div className="prose lg:prose-xl mx-auto">
        <MDXRemote {...content} />
      </div>
    </article>
  );
}

export async function getStaticPaths() {
  // Récupérer tous les articles pour générer les chemins
  const articlesRes = await getArticles(1, 100);
  
  const paths = articlesRes.data.map((article) => ({
    params: { slug: article.attributes.slug },
  }));
  
  return {
    paths,
    fallback: 'blocking', // Permet de générer de nouvelles pages à la demande
  };
}

export async function getStaticProps({ params }) {
  const article = await getArticleBySlug(params.slug);
  
  if (!article) {
    return {
      notFound: true,
    };
  }
  
  // Conversion du contenu markdown en JSX
  const content = await serialize(article.attributes.content, {
    mdxOptions: {
      rehypePlugins: [rehypeHighlight],
    },
  });
  
  return {
    props: {
      article,
      content,
    },
    revalidate: 60, // Revalider les pages après 1 minute
  };
}`,
    explanation:
      "Cet exemple montre comment créer une intégration complète entre Strapi et Next.js, avec une gestion avancée des articles de blog. Le code inclut des fonctions pour récupérer des données depuis l'API Strapi, la génération de pages statiques avec getStaticPaths et getStaticProps, la conversion de contenu Markdown avec MDX, et la mise en place d'ISR (Incremental Static Regeneration) pour maintenir le contenu à jour."
  },
  exercise: {
    title: "Implémenter l'authentification avec Strapi et Next.js",
    description:
      "Sélectionnez la meilleure approche pour gérer l'authentification des utilisateurs avec Strapi et Next.js.",
    options: [
      {
        id: 1,
        text: 'Stocker les identifiants des utilisateurs directement dans localStorage sans chiffrement',
        correct: false
      },
      {
        id: 2,
        text: "Utiliser l'API Strapi pour l'authentification et gérer les jetons JWT avec des cookies HTTP-only et next-auth",
        correct: true
      },
      {
        id: 3,
        text: "Créer un système d'authentification personnalisé sans utiliser les fonctionnalités de sécurité de Strapi",
        correct: false
      },
      {
        id: 4,
        text: 'Envoyer les mots de passe en clair dans les requêtes API',
        correct: false
      }
    ]
  },
  quiz: {
    questions: [
      {
        question:
          'Comment peut-on déclencher automatiquement un redéploiement de Next.js lorsque le contenu est modifié dans Strapi ?',
        options: [
          'En actualisant manuellement la page après chaque modification',
          'En configurant des webhooks Strapi qui déclenchent les API de déploiement',
          'En désactivant le cache de Next.js',
          "En recompilant manuellement l'application après chaque modification"
        ],
        answer: 1
      },
      {
        question:
          'Quelle est la différence principale entre une "Collection Type" et un "Single Type" dans Strapi ?',
        options: [
          'Les Collection Types sont payants, les Single Types sont gratuits',
          'Les Collection Types permettent plusieurs entrées, les Single Types représentent une seule entrée',
          'Les Collection Types sont pour le backend, les Single Types pour le frontend',
          "Il n'y a pas de différence significative"
        ],
        answer: 1
      },
      {
        question:
          'Quelle fonctionnalité permet de gérer du contenu en plusieurs langues dans Strapi ?',
        options: [
          'La traduction automatique',
          'Le plugin SEO',
          "L'internationalisation (i18n)",
          'Le plugin multi-tenant'
        ],
        answer: 2
      }
    ]
  },
  project: {
    title: 'Site e-commerce avec Strapi et Next.js',
    description:
      'Créez un petit site e-commerce en utilisant Strapi comme backend et Next.js comme frontend.',
    tasks: [
      'Configurez Strapi avec des collection types pour les produits, catégories et commandes',
      "Implémentez l'authentification utilisateur avec next-auth et Strapi",
      "Créez une page d'accueil qui affiche les produits populaires",
      'Construisez des pages de détails de produits avec getStaticProps et getStaticPaths',
      "Ajoutez un panier d'achat fonctionnel avec gestion d'état via Context API ou Redux"
    ],
    starterCode: `// lib/strapi.js
export function getStrapiURL(path = '') {
  return \`\${process.env.NEXT_PUBLIC_STRAPI_API_URL}\${path}\`;
}

export async function fetchAPI(path) {
  // TODO: Implémentez la fonction fetchAPI
}

export async function getProducts() {
  // TODO: Récupérez les produits depuis l'API Strapi
}

// pages/index.js
import { getProducts } from '../lib/strapi';

export default function HomePage({ products }) {
  // TODO: Affichez les produits populaires
  return <div>Page d'accueil</div>;
}

export async function getStaticProps() {
  // TODO: Implémentez getStaticProps
}`,
    solutionCode: `// lib/strapi.js
export function getStrapiURL(path = '') {
  return \`\${process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'}\${path}\`;
}

export async function fetchAPI(path) {
  const requestUrl = getStrapiURL(path);
  const response = await fetch(requestUrl);
  
  if (!response.ok) {
    throw new Error(\`Erreur API: \${response.status}\`);
  }
  
  const data = await response.json();
  return data;
}

export async function getProducts(filters = {}) {
  let queryString = '/api/products?populate=*';
  
  if (filters.featured) {
    queryString += '&filters[featured][$eq]=true';
  }
  
  if (filters.category) {
    queryString += \`&filters[category][slug][$eq]=\${filters.category}\`;
  }
  
  const response = await fetchAPI(queryString);
  return response;
}

// Context pour le panier
// contexts/CartContext.js
import { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  
  // Charger le panier depuis localStorage au chargement
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Erreur lors du chargement du panier:', error);
    }
  }, []);
  
  // Sauvegarder le panier dans localStorage à chaque mise à jour
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);
  
  const addToCart = (product, quantity = 1) => {
    setCart(currentCart => {
      const existingItemIndex = currentCart.findIndex(item => item.id === product.id);
      
      if (existingItemIndex > -1) {
        return currentCart.map((item, i) => 
          i === existingItemIndex 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      }
      
      return [...currentCart, { ...product, quantity }];
    });
  };
  
  const removeFromCart = (productId) => {
    setCart(currentCart => currentCart.filter(item => item.id !== productId));
  };
  
  const updateQuantity = (productId, quantity) => {
    setCart(currentCart => 
      currentCart.map(item => 
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };
  
  const clearCart = () => {
    setCart([]);
  };
  
  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}

// pages/index.js
import { getProducts } from '../lib/strapi';
import Link from 'next/link';
import { useCart } from '../contexts/CartContext';

export default function HomePage({ products }) {
  const { addToCart } = useCart();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Produits populaires</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.data.map((product) => (
          <div key={product.id} className="border rounded-lg overflow-hidden shadow-lg">
            {product.attributes.image?.data && (
              <img 
                src={getStrapiURL(product.attributes.image.data.attributes.url)} 
                alt={product.attributes.title}
                className="w-full h-64 object-cover"
              />
            )}
            <div className="p-4">
              <h2 className="text-xl font-semibold">{product.attributes.title}</h2>
              <p className="text-gray-700">{product.attributes.price.toFixed(2)} €</p>
              <div className="flex justify-between mt-4">
                <Link 
                  href={\`/products/\${product.attributes.slug}\`}
                  className="text-blue-500 hover:underline"
                >
                  Voir détails
                </Link>
                <button 
                  onClick={() => addToCart({
                    id: product.id,
                    title: product.attributes.title,
                    price: product.attributes.price,
                    slug: product.attributes.slug,
                    image: product.attributes.image?.data?.attributes?.url
                  })}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Ajouter au panier
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export async function getStaticProps() {
  const productsRes = await getProducts({ featured: true });
  
  return {
    props: {
      products: productsRes
    },
    revalidate: 60 * 10, // Revalidation toutes les 10 minutes
  };
}`
  }
}

export default lesson2

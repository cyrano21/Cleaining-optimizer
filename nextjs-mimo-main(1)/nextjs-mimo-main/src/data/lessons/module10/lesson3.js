// src/data/lessons/module10/lesson3.js
const lesson3 = {
  id: '10-3',
  title: 'Techniques avancées avec les CMS Headless',
  description:
    'Explorez les stratégies avancées pour créer des applications performantes combinant Next.js et CMS Headless',
  difficulty: 'avancé',
  duration: 70,
  tags: ['Next.js', 'CMS Headless', 'Performance', 'SEO', 'Preview Mode'],
  prerequisites: ['10-1', '10-2', '8-2'],
  content: `
    <h2>Stratégies avancées pour Next.js et CMS Headless</h2>
    <p>Pour tirer le meilleur parti d'un CMS Headless avec Next.js, nous allons explorer des techniques avancées qui améliorent la performance, l'expérience développeur et utilisateur.</p>

    <h3>Mode Preview avec Next.js</h3>
    <p>Le mode Preview permet aux rédacteurs de contenu de prévisualiser les modifications avant publication :</p>
    <ol>
      <li><strong>Configuration du mode Preview</strong> : Next.js fournit une API dédiée pour activer le mode prévisualisation</li>
      <li><strong>Intégration avec votre CMS</strong> : Configurez votre CMS pour rediriger vers votre API Preview</li>
      <li><strong>Récupération conditionnelle</strong> : Adaptez vos requêtes pour récupérer les brouillons ou le contenu publié</li>
    </ol>

    <pre><code class="language-javascript">// pages/api/preview.js
export default async function handler(req, res) {
  const { secret, slug } = req.query;

  // Vérifier le secret pour sécuriser l'API
  if (secret !== process.env.PREVIEW_SECRET) {
    return res.status(401).json({ message: 'Secret invalide' });
  }

  if (!slug) {
    return res.status(400).json({ message: 'Slug manquant' });
  }

  // Activer le mode preview
  res.setPreviewData({});

  // Rediriger vers la page à prévisualiser
  res.redirect(\`/posts/\${slug}\`);
}</code></pre>

    <h3>Optimisation de l'ISR (Incremental Static Regeneration)</h3>
    <p>L'ISR permet de régénérer des pages statiques en arrière-plan, offrant les avantages du statique avec la fraîcheur du dynamique :</p>
    <ul>
      <li><strong>Stratégie de revalidation</strong> : Définir la durée optimale avec la propriété <code>revalidate</code></li>
      <li><strong>Revalidation à la demande</strong> : Utiliser l'API <code>res.revalidate()</code> pour rafraîchir les pages en fonction d'événements spécifiques</li>
      <li><strong>Webhooks</strong> : Configurer votre CMS pour déclencher des revalidations lors des mises à jour de contenu</li>
    </ul>

    <h3>Gestion des médias et optimisation des images</h3>
    <p>Les médias sont souvent un point critique de performance avec les CMS Headless :</p>
    <ul>
      <li><strong>Composant Next Image</strong> : Utiliser <code>next/image</code> pour l'optimisation automatique des images</li>
      <li><strong>CDN pour médias</strong> : Configurer des services comme Cloudinary ou Imgix pour le traitement d'images</li>
      <li><strong>Lazy loading</strong> : Charger les images uniquement quand elles sont visibles dans le viewport</li>
    </ul>

    <h3>Gestion des formulaires et intégration de webhooks</h3>
    <p>Pour les interactions utilisateur comme les formulaires de contact ou les commentaires :</p>
    <ol>
      <li><strong>API Routes de Next.js</strong> : Créez des endpoints sécurisés pour communiquer avec votre CMS</li>
      <li><strong>Validation côté client et serveur</strong> : Utilisez des bibliothèques comme Yup, Zod ou React Hook Form</li>
      <li><strong>Webhooks bidirectionnels</strong> : Configurez des notifications entre votre CMS et votre frontend</li>
    </ol>

    <h3>Optimisation SEO avec les CMS Headless</h3>
    <p>Les sites basés sur des CMS Headless nécessitent une attention particulière au SEO :</p>
    <ul>
      <li><strong>Métadonnées dynamiques</strong> : Générer balises meta, Open Graph et Twitter Cards depuis votre CMS</li>
      <li><strong>Plan de site XML</strong> : Créer des sitemaps dynamiques basés sur votre contenu</li>
      <li><strong>Données structurées</strong> : Implémenter JSON-LD pour améliorer la compréhension de Google</li>
    </ul>

    <h3>Architecture à micro-frontends</h3>
    <p>Pour les grands projets, vous pouvez adopter une approche de micro-frontends :</p>
    <ul>
      <li><strong>Zones Next.js</strong> : Diviser votre application en zones indépendantes</li>
      <li><strong>Multi-CMS</strong> : Utiliser différents CMS spécialisés pour différentes parties de votre site</li>
      <li><strong>Composition d'API</strong> : Agréger du contenu de plusieurs sources dans une API unifiée</li>
    </ul>

    <h3>Caching avancé</h3>
    <p>Optimisez les performances avec des stratégies de cache sophistiquées :</p>
    <ul>
      <li><strong>Cache distribué</strong> : Utiliser Redis ou Memcached pour partager le cache entre instances</li>
      <li><strong>Stale-While-Revalidate (SWR)</strong> : Servir du contenu potentiellement obsolète pendant la régénération</li>
      <li><strong>Cache HTTP</strong> : Configurer correctement les en-têtes Cache-Control</li>
    </ul>
  `,
  example: {
    title: 'Implémentation du mode Preview et revalidation à la demande',
    code: `// lib/cms.js
export async function getPage(slug, preview = false) {
  // L'API URL change selon qu'on est en mode preview ou non
  const url = preview
    ? \`\${process.env.CMS_API_URL}/pages?slug=\${slug}&status=draft\`
    : \`\${process.env.CMS_API_URL}/pages?slug=\${slug}&status=published\`;
    
  const res = await fetch(url, {
    headers: {
      Authorization: \`Bearer \${process.env.CMS_API_TOKEN}\`
    }
  });
  
  const data = await res.json();
  return data.page;
}

// pages/api/preview.js
export default async function handler(req, res) {
  const { secret, slug } = req.query;

  if (secret !== process.env.PREVIEW_SECRET) {
    return res.status(401).json({ message: 'Invalid token' });
  }
  
  // Vérifier que la page existe
  try {
    const page = await getPage(slug, true);
    
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    
    // Activer le mode preview
    res.setPreviewData({});
    
    // Rediriger vers la page
    res.redirect(\`/pages/\${slug}\`);
  } catch (error) {
    return res.status(500).json({ message: 'Error checking preview page', error: error.message });
  }
}

// pages/api/revalidate.js
export default async function handler(req, res) {
  // Vérifier le secret
  if (req.headers.authorization !== \`Bearer \${process.env.REVALIDATION_TOKEN}\`) {
    return res.status(401).json({ message: 'Invalid token' });
  }
  
  try {
    const { slug } = req.body;
    
    if (!slug) {
      return res.status(400).json({ message: 'Slug is required' });
    }
    
    // Revalider la page
    await res.revalidate(\`/pages/\${slug}\`);
    
    return res.json({ revalidated: true, message: \`Page /pages/\${slug} revalidated\` });
  } catch (error) {
    return res.status(500).json({ message: 'Error revalidating', error: error.message });
  }
}

// pages/pages/[slug].js
import { getPage } from '../../lib/cms';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Page({ page, preview }) {
  const router = useRouter();
  
  // Afficher un placeholder si la page est en cours de chargement
  if (router.isFallback) {
    return <div>Chargement...</div>;
  }
  
  return (
    <>
      <Head>
        <title>{page.title}</title>
        <meta name="description" content={page.description} />
        <meta property="og:title" content={page.title} />
        <meta property="og:description" content={page.description} />
        {page.ogImage && <meta property="og:image" content={page.ogImage.url} />}
      </Head>
      
      {/* Bannière de prévisualisation */}
      {preview && (
        <div className="bg-yellow-500 text-white p-4 text-center">
          Mode prévisualisation actif.{' '}
          <a 
            href={\`/api/exit-preview?slug=\${page.slug}\`} 
            className="underline hover:text-yellow-200"
          >
            Quitter
          </a>
        </div>
      )}
      
      <article className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-6">{page.title}</h1>
        <div className="prose lg:prose-xl mx-auto" dangerouslySetInnerHTML={{ __html: page.content }} />
      </article>
    </>
  );
}

export async function getStaticPaths() {
  // Récupérer les slugs des pages principales
  const pages = await fetch(\`\${process.env.CMS_API_URL}/pages/main\`).then(res => res.json());
  
  const paths = pages.map(page => ({
    params: { slug: page.slug }
  }));
  
  return {
    paths,
    fallback: 'blocking' // Générer de nouvelles pages à la demande
  };
}

export async function getStaticProps({ params, preview = false, previewData }) {
  const page = await getPage(params.slug, preview);
  
  if (!page) {
    return {
      notFound: true
    };
  }
  
  return {
    props: {
      page,
      preview
    },
    revalidate: 60 // Revalider après 60 secondes
  };
}`,
    explanation:
      'Cet exemple montre comment implémenter un système complet de prévisualisation et de revalidation à la demande avec Next.js et un CMS Headless. Le code configure deux API routes : une pour activer le mode de prévisualisation permettant aux rédacteurs de voir les versions brouillon du contenu, et une autre pour déclencher la revalidation des pages lorsque le contenu est mis à jour dans le CMS. La page dynamique [slug].js récupère et affiche le contenu avec des métadonnées SEO optimisées et affiche une bannière lorsque le mode prévisualisation est actif.'
  },
  exercise: {
    title: 'Optimisation des images avec Next.js et un CMS Headless',
    description:
      "Choisissez la meilleure approche pour optimiser les images provenant d'un CMS Headless dans une application Next.js.",
    options: [
      {
        id: 1,
        text: "Utiliser les URLs d'images directement du CMS sans optimisation",
        correct: false
      },
      {
        id: 2,
        text: 'Télécharger toutes les images localement et les servir depuis le dossier public',
        correct: false
      },
      {
        id: 3,
        text: 'Utiliser le composant next/image avec un loader personnalisé configuré pour votre CMS',
        correct: true
      },
      {
        id: 4,
        text: 'Convertir toutes les images en base64 et les intégrer directement dans le HTML',
        correct: false
      }
    ]
  },
  quiz: {
    questions: [
      {
        question:
          'Quelle fonctionnalité Next.js permet de régénérer des pages statiques en arrière-plan sans reconstruire tout le site ?',
        options: [
          'getServerSideProps',
          'Incremental Static Regeneration (ISR)',
          'Static Site Generation (SSG)',
          'Client Side Rendering (CSR)'
        ],
        answer: 1
      },
      {
        question:
          'Comment peut-on mettre en place un mode preview sécurisé avec Next.js ?',
        options: [
          'Désactiver complètement le cache pour toutes les pages',
          'Utiliser uniquement getServerSideProps pour toutes les pages',
          "Utiliser res.setPreviewData() avec un jeton secret pour l'authentification",
          'Créer une copie distincte du site pour la prévisualisation'
        ],
        answer: 2
      },
      {
        question:
          "Quelle technique permet de déclencher la revalidation d'une page statique lorsque le contenu change dans le CMS ?",
        options: [
          'Polling régulier du CMS depuis le frontend',
          "Configuration d'un webhook du CMS vers l'API de revalidation Next.js",
          "Redéploiement automatique de l'application entière",
          'Utiliser uniquement le rendu côté client pour le contenu dynamique'
        ],
        answer: 1
      }
    ]
  },
  project: {
    title: 'Système de blog avancé avec preview et revalidation',
    description:
      'Créez un système de blog avancé avec mode preview, revalidation à la demande et optimisation SEO.',
    tasks: [
      'Configurez un CMS Headless de votre choix avec types de contenu pour articles et catégories',
      'Implémentez le mode preview pour permettre aux rédacteurs de voir les brouillons',
      'Créez une API de revalidation déclenchée par webhooks lors des mises à jour du CMS',
      'Optimisez les images avec next/image et un loader personnalisé',
      'Implémentez des méta-données SEO dynamiques et données structurées JSON-LD'
    ],
    starterCode: `// lib/cms.js
export async function getPost(slug, preview = false) {
  // TODO: Implémenter la récupération d'articles avec gestion du mode preview
}

// pages/api/preview.js
export default async function handler(req, res) {
  // TODO: Implémenter l'API de prévisualisation
}

// pages/api/revalidate.js
export default async function handler(req, res) {
  // TODO: Implémenter l'API de revalidation
}

// components/SEO.js
export default function SEO({ title, description, image, article }) {
  // TODO: Implémenter un composant SEO réutilisable
}

// pages/blog/[slug].js
export default function BlogPost({ post, preview }) {
  // TODO: Implémenter la page d'article avec support preview
}

export async function getStaticProps({ params, preview = false }) {
  // TODO: Implémenter getStaticProps avec gestion du mode preview
}`,
    solutionCode: `// lib/cms.js
export async function getPost(slug, preview = false) {
  const url = preview
    ? \`\${process.env.CMS_API_URL}/posts?slug=\${slug}&status=draft\`
    : \`\${process.env.CMS_API_URL}/posts?slug=\${slug}&status=published\`;
    
  const res = await fetch(url, {
    headers: {
      Authorization: \`Bearer \${process.env.CMS_API_TOKEN}\`
    }
  });
  
  const data = await res.json();
  return data.post;
}

export async function getAllPostSlugs() {
  const res = await fetch(\`\${process.env.CMS_API_URL}/posts/slugs\`, {
    headers: {
      Authorization: \`Bearer \${process.env.CMS_API_TOKEN}\`
    }
  });
  
  const data = await res.json();
  return data.slugs;
}

// pages/api/preview.js
import { getPost } from '../../lib/cms';

export default async function handler(req, res) {
  const { secret, slug } = req.query;

  if (secret !== process.env.PREVIEW_SECRET) {
    return res.status(401).json({ message: 'Jeton invalide' });
  }
  
  try {
    const post = await getPost(slug, true);
    
    if (!post) {
      return res.status(404).json({ message: 'Article non trouvé' });
    }
    
    // Activer le mode preview
    res.setPreviewData({});
    
    // Rediriger vers l'article
    res.redirect(\`/blog/\${slug}\`);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur de prévisualisation', error: error.message });
  }
}

// pages/api/exit-preview.js
export default function handler(req, res) {
  // Désactiver le mode preview
  res.clearPreviewData();
  
  // Rediriger vers la page d'origine ou l'accueil
  const slug = req.query.slug || '';
  res.redirect(slug ? \`/blog/\${slug}\` : '/');
}

// pages/api/revalidate.js
export default async function handler(req, res) {
  // Vérifier l'authentification
  if (req.headers.authorization !== \`Bearer \${process.env.REVALIDATION_TOKEN}\`) {
    return res.status(401).json({ message: 'Jeton invalide' });
  }
  
  try {
    const { slug } = req.body;
    
    if (!slug) {
      return res.status(400).json({ message: 'Slug requis' });
    }
    
    // Revalider la page
    await res.revalidate(\`/blog/\${slug}\`);
    // Revalider aussi la page d'accueil qui pourrait afficher cet article
    await res.revalidate('/');
    
    return res.json({ revalidated: true, message: \`Pages revalidées\` });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur de revalidation', error: error.message });
  }
}

// components/SEO.js
import Head from 'next/head';

export default function SEO({ title, description, image, article = false }) {
  const siteTitle = 'Mon Blog Next.js';
  const fullTitle = title ? \`\${title} | \${siteTitle}\` : siteTitle;
  
  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={article ? 'article' : 'website'} />
      {image && <meta property="og:image" content={image} />}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
      
      {article && (
        <script 
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BlogPosting',
              'headline': title,
              'description': description,
              'image': image ? [image] : [],
              'datePublished': article.publishedAt,
              'dateModified': article.updatedAt,
              'author': {
                '@type': 'Person',
                'name': article.author?.name || 'Auteur'
              }
            })
          }}
        />
      )}
    </Head>
  );
}

// components/ImageLoader.js
import Image from 'next/image';

const customLoader = ({ src, width, quality }) => {
  // Si l'image vient déjà d'un CDN d'optimisation, utilisez directement l'URL
  if (src.includes('imgix.net') || src.includes('cloudinary.com')) {
    return \`\${src}?w=\${width}&q=\${quality || 75}\`;
  }
  
  // Sinon, on suppose que c'est une URL d'image du CMS
  return \`\${process.env.NEXT_PUBLIC_CMS_IMAGE_URL}/\${src}?w=\${width}&q=\${quality || 75}\`;
};

export default function OptimizedImage({ src, alt, ...props }) {
  return (
    <Image
      loader={customLoader}
      src={src}
      alt={alt || ''}
      {...props}
    />
  );
}

// pages/blog/[slug].js
import { useRouter } from 'next/router';
import { getPost, getAllPostSlugs } from '../../lib/cms';
import SEO from '../../components/SEO';
import OptimizedImage from '../../components/ImageLoader';
import { MDXRemote } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import rehypeHighlight from 'rehype-highlight';

export default function BlogPost({ post, content, preview }) {
  const router = useRouter();
  
  if (router.isFallback) {
    return <div className="container mx-auto p-4">Chargement...</div>;
  }
  
  return (
    <>
      <SEO 
        title={post.title}
        description={post.excerpt}
        image={post.featuredImage?.url}
        article={post}
      />
      
      {/* Bannière preview */}
      {preview && (
        <div className="bg-yellow-500 text-white p-4 text-center">
          Mode prévisualisation actif.{' '}
          <a 
            href={\`/api/exit-preview?slug=\${post.slug}\`} 
            className="underline hover:text-yellow-200"
          >
            Quitter
          </a>
        </div>
      )}
      
      <article className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <div className="text-gray-600 mb-6">
          Publié le {new Date(post.publishedAt).toLocaleDateString('fr-FR')}
          {post.author && <span> par {post.author.name}</span>}
        </div>
        
        {post.featuredImage && (
          <div className="mb-8">
            <OptimizedImage
              src={post.featuredImage.url}
              alt={post.title}
              width={1200}
              height={630}
              className="rounded-lg"
            />
          </div>
        )}
        
        <div className="prose lg:prose-xl mx-auto">
          <MDXRemote {...content} />
        </div>
      </article>
    </>
  );
}

export async function getStaticPaths() {
  const slugs = await getAllPostSlugs();
  
  const paths = slugs.map(slug => ({
    params: { slug }
  }));
  
  return {
    paths,
    fallback: 'blocking'
  };
}

export async function getStaticProps({ params, preview = false }) {
  const post = await getPost(params.slug, preview);
  
  if (!post) {
    return {
      notFound: true
    };
  }
  
  // Conversion du contenu markdown en JSX
  const content = await serialize(post.content, {
    mdxOptions: {
      rehypePlugins: [rehypeHighlight]
    }
  });
  
  return {
    props: {
      post,
      content,
      preview: preview || false
    },
    revalidate: 60 // Revalidation après 1 minute
  };
}`
  }
}

export default lesson3

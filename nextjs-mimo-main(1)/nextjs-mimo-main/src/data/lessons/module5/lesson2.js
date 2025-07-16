// src/data/lessons/module5/lesson2.js
const lesson2 = {
  id: '5-2',
  title: 'Frontend du Blog : Affichage des Articles (SSG)',
  description: 'Construisez les pages frontend pour afficher la liste des articles de blog et le détail de chaque article en utilisant les API créées précédemment et la génération de site statique (SSG) avec Next.js.',
  difficulty: 'intermédiaire',
  duration: 110, // Augmenté pour les ajouts
  tags: ['Next.js', 'Projet', 'Blog', 'Frontend', 'React', 'SSG', 'getStaticProps', 'getStaticPaths', 'Security', 'Error Handling'],
  prerequisites: ['5-1', '3-1', '3-2'],
  content: `
    <h2>Affichage des Articles du Blog : Génération Statique (SSG)</h2>
    <p>Après avoir configuré notre backend avec les API Routes (Leçon 5-1), nous allons maintenant construire l'interface utilisateur (frontend) pour que les visiteurs puissent lire les articles de blog. Nous opterons pour la <strong>Génération de Site Statique (SSG)</strong> avec Next.js, car elle offre d'excellentes performances et est idéale pour le contenu qui ne change pas à chaque requête, comme les articles de blog.</p>
    {/* ... (Introduction existante) ... */}

    <h3>1. Page d'Index des Articles (<code>pages/blog/index.js</code>)</h3>
    {/* ... (Explication existante) ... */}
    
    <h4>Structure et Data Fetching :</h4>
    <pre><code class="language-javascript">// pages/blog/index.js
import Link from 'next/link';
import Head from 'next/head';
import { useState, useEffect } from 'react'; // Pour un état de chargement client si nécessaire

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function getStaticProps() {
  console.log('[Blog Index] Fetching posts for static generation...');
  try {
    const res = await fetch(\`\${API_BASE_URL}/api/posts\`);
    if (!res.ok) {
      console.error(\`API error in getStaticProps (blog index): \${res.status}\`);
      // Il est préférable de lever une erreur ici pour que le build échoue si les données critiques manquent
      // ou retourner une prop d'erreur spécifique.
      // throw new Error(\`Failed to fetch posts, status: \${res.status}\`);
      return { props: { posts: [], error: "Impossible de charger les articles depuis le serveur." } };
    }
    const posts = await res.json();
    return {
      props: {
        posts,
      },
      revalidate: 60, 
    };
  } catch (error) {
    console.error("Fetch error in getStaticProps (blog index):", error);
    return { props: { posts: [], error: "Erreur de connexion à l'API pour charger les articles." } };
  }
}

export default function BlogIndexPage({ posts, error }) {
  // Optionnel: un état de chargement client si la page est complexe et fait d'autres fetches
  // const [isLoading, setIsLoading] = useState(false); 

  if (error) {
    return (
      <div style={pageContainerStyle}>
        <Head>
          <title>Erreur de chargement - Mon Blog</title>
        </Head>
        <h1 style={headingStyle}>Erreur de Chargement</h1>
        <p style={{color: 'red', backgroundColor: '#ffebee', padding: '1rem', border: '1px solid red', borderRadius: '4px'}}>
          {error}
        </p>
        <p>Veuillez réessayer plus tard ou contacter le support si le problème persiste.</p>
        <Link href="/" style={linkStyle}>Retour à l'accueil</Link>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
       <div style={pageContainerStyle}>
        <Head>
          <title>Notre Blog - Mon Blog</title>
        </Head>
        <h1 style={headingStyle}>Notre Super Blog</h1>
        <p>Aucun article à afficher pour le moment. Revenez bientôt !</p>
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <Link href="/blog/new" style={newPostButtonStyle}>
            Écrire un nouvel article
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={pageContainerStyle}>
      <Head>
        <title>Tous les Articles - Mon Blog</title>
        <meta name="description" content="Parcourez tous les articles de notre blog." />
      </Head>
      <h1 style={headingStyle}>Notre Super Blog</h1>
      <p style={subheadingStyle}>Découvrez nos derniers articles et réflexions.</p>
      
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {posts.map((post) => (
          <li key={post.id} style={postItemStyle}>
            <Link href={\`/blog/\${post.id}\`} style={postTitleLinkStyle}>
              <h2 style={postTitleStyle}>{post.title}</h2>
            </Link>
            <p style={postMetaStyle}>
              Par : {post.author || 'Anonyme'} 
              {post.createdAt && \` | Publié le: \${new Date(post.createdAt).toLocaleDateString('fr-FR')}\`}
            </p>
            {post.content && <p style={postExcerptStyle}>{\`\${post.content.replace(/<[^>]*>?/gm, '').substring(0, 120)}...\`}</p>} {/* Nettoyage simple pour extrait */}
            <Link href={\`/blog/\${post.id}\`} style={readMoreLinkStyle}>
              Lire la suite →
            </Link>
          </li>
        ))}
      </ul>
      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <Link href="/blog/new" style={newPostButtonStyle}>
          Écrire un nouvel article
        </Link>
      </div>
    </div>
  );
}

// Styles
const pageContainerStyle = { maxWidth: '800px', margin: '0 auto', padding: '2rem', fontFamily: 'Arial, sans-serif' };
const headingStyle = { fontSize: '2.5rem', color: '#2c3e50', borderBottom: '3px solid #3498db', paddingBottom: '0.5rem', marginBottom: '1rem' };
const subheadingStyle = { fontSize: '1.2rem', color: '#7f8c8d', marginBottom: '2rem' };
const postItemStyle = { marginBottom: '2.5rem', paddingBottom: '1.5rem', borderBottom: '1px dashed #bdc3c7' };
const postTitleLinkStyle = { textDecoration: 'none' };
const postTitleStyle = { margin: '0 0 0.5rem 0', fontSize: '1.8rem', color: '#3498db' };
const postMetaStyle = { margin: '0 0 0.75rem 0', color: '#95a5a6', fontSize: '0.9rem' };
const postExcerptStyle = { margin: '0 0 1rem 0', color: '#34495e', lineHeight: 1.6 };
const readMoreLinkStyle = { color: '#3498db', fontWeight: 'bold', textDecoration: 'none' };
const newPostButtonStyle = { display: 'inline-block', padding: '0.8rem 1.5rem', backgroundColor: '#2ecc71', color: 'white', textDecoration: 'none', borderRadius: '5px', fontWeight: 'bold' };
const linkStyle = { color: '#3498db', textDecoration: 'none' };
    </code></pre>

    <h3>2. Page de Détail d'un Article (<code>pages/blog/[id].js</code>)</h3>
    {/* ... (Explication existante) ... */}

    <h4>Comprendre <code>dangerouslySetInnerHTML</code> et la Sécurité (XSS)</h4>
    <p>Lorsque vous affichez du contenu HTML provenant d'une source externe (comme le corps d'un article de blog potentiellement saisi par un utilisateur via un éditeur WYSIWYG), utiliser <code>dangerouslySetInnerHTML</code> est une pratique courante. Cependant, le mot "dangerously" est là pour une raison : si le HTML contient des scripts malveillants (<code><script>...</script></code>) ou des attributs d'événements (<code>onerror</code>, <code>onload</code>), cela peut mener à des attaques de type <strong>Cross-Site Scripting (XSS)</strong>.</p>
    <p><strong>Recommandations :</strong></p>
    <ul>
      <li><strong>Sanitize (Nettoyer) le HTML :</strong> Avant de l'injecter avec <code>dangerouslySetInnerHTML</code>, nettoyez toujours le HTML côté serveur ou au moment de l'enregistrement en base de données. Des bibliothèques comme <code>DOMPurify</code> (côté client ou serveur avec JSDOM) ou <code>sanitize-html</code> (côté serveur) sont excellentes pour cela. Elles suppriment les balises et attributs dangereux tout en conservant le formatage sûr.</li>
      <li><strong>Source de Confiance :</strong> Si le HTML provient d'une source interne totalement maîtrisée (par exemple, converti depuis Markdown par vos propres soins avec une bibliothèque sûre), le risque est moindre, mais la prudence reste de mise.</li>
      <li><strong>Alternative : Composants React pour Markdown :</strong> Si votre contenu est en Markdown, préférez utiliser des bibliothèques comme <code>react-markdown</code> ou <code>next-mdx-remote</code> qui convertissent le Markdown en composants React sûrs, évitant ainsi <code>dangerouslySetInnerHTML</code>.</li>
    </ul>
    <pre><code class="language-javascript">// Exemple de sanitization avec DOMPurify (conceptuel, à faire côté serveur ou au moment de l'enregistrement)
// import DOMPurify from 'dompurify'; // (ou la version serveur)
// const cleanHTML = DOMPurify.sanitize(dirtyHTML);
// <div dangerouslySetInnerHTML={{ __html: cleanHTML }} />
    </code></pre>

    <h4>Structure et Data Fetching :</h4>
    <pre><code class="language-javascript">// pages/blog/[id].js
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router'; // Pour fallback: true (même si on utilise blocking)
// import DOMPurify from 'isomorphic-dompurify'; // Pour la sanitization si nécessaire

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function getStaticPaths() {
  // ... (Code existant pour getStaticPaths, avec gestion d'erreur)
  console.log('[Blog Post] Fetching all post IDs for static paths...');
  try {
    const res = await fetch(\`\${API_BASE_URL}/api/posts\`);
    if (!res.ok) {
      throw new Error(\`API error in getStaticPaths: \${res.status}\`);
    }
    const posts = await res.json();

    const paths = posts.map((post) => ({
      params: { id: post.id.toString() }, 
    }));
    return { paths, fallback: 'blocking' };
  } catch (error) {
    console.error("Fetch error in getStaticPaths:", error);
    return { paths: [], fallback: 'blocking' }; 
  }
}

export async function getStaticProps({ params }) {
  const { id } = params;
  console.log(\`[Blog Post] Fetching post with ID: \${id} for static generation...\`);
  try {
    const res = await fetch(\`\${API_BASE_URL}/api/posts/\${id}\`);
    if (!res.ok) {
      console.warn(\`Post with id \${id} not found in getStaticProps (status: \${res.status})\`);
      return { notFound: true };
    }
    let post = await res.json();

    // **Exemple de Sanitization si post.content est du HTML non fiable**
    // if (post.content) {
    //   post.content = DOMPurify.sanitize(post.content);
    // }

    return {
      props: {
        post,
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error(\`Fetch error for post \${id} in getStaticProps:\`, error);
    return { notFound: true };
  }
}

export default function BlogPostPage({ post }) {
  const router = useRouter();

  // Gérer l'état de chargement si fallback: true était utilisé.
  // Avec fallback: 'blocking', cette vérification n'est pas strictement nécessaire
  // car la page est rendue côté serveur avant d'être envoyée.
  if (router.isFallback) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', fontFamily: 'Arial, sans-serif' }}>
        <p style={{ fontSize: '1.5rem', color: '#555' }}>Chargement de l'article...</p>
        {/* Vous pouvez ajouter un spinner ici */}
      </div>
    );
  }

  if (!post) {
    return (
      <div style={pageContainerStyle}>
        <Head><title>Article Non Trouvé</title></Head>
        <h1 style={articleTitleStyle}>Oops! Article Introuvable</h1>
        <p>L'article que vous cherchez n'existe pas ou a été déplacé.</p>
        <Link href="/blog" style={backLinkStyle}>← Retour à la liste des articles</Link>
      </div>
    );
  }

  const excerpt = post.content 
    ? (post.content.replace(/<[^>]*>?/gm, '').substring(0, 160) + '...')
    : \`Lisez l'article '\${post.title}' sur notre blog.\`;

  return (
    <div style={pageContainerStyle}>
      <Head>
        <title>{post.title} - Mon Blog</title>
        <meta name="description" content={excerpt} />
      </Head>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/blog" style={backLinkStyle}>
          ← Retour à la liste des articles
        </Link>
      </div>
      <article>
        <h1 style={articleTitleStyle}>
          {post.title}
        </h1>
        <p style={articleMetaStyle}>
          Par {post.author || 'Anonyme'}
          {post.createdAt && \` • Publié le \${new Date(post.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}\`}
        </p>
        {post.content ? (
           <div 
             style={articleContentStyle} 
             dangerouslySetInnerHTML={{ __html: post.content }} // Supposant que le contenu est déjà sanitisé ou sûr
           />
        ) : (
          <p>Contenu non disponible.</p>
        )}
      </article>
      <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #ecf0f1' }}>
        <Link href={\`/blog/\${post.id}/edit\`} style={editPostButtonStyle}>
          Modifier cet article
        </Link>
      </div>
    </div>
  );
}

// Styles
const pageContainerStyle = { maxWidth: '800px', margin: '0 auto', padding: '2rem', fontFamily: 'Georgia, serif', color: '#333' };
const articleTitleStyle = { fontSize: '2.8rem', color: '#2c3e50', marginBottom: '0.5rem', lineHeight: 1.2 };
const articleMetaStyle = { fontSize: '1rem', color: '#7f8c8d', marginBottom: '2rem', fontStyle: 'italic' };
const articleContentStyle = { fontSize: '1.1rem', lineHeight: 1.8, color: '#34495e' };
const backLinkStyle = { color: '#3498db', textDecoration: 'none', fontWeight: 'bold', display: 'inline-block' };
const editPostButtonStyle = { display: 'inline-block', padding: '0.7rem 1.2rem', backgroundColor: '#f39c12', color: 'white', textDecoration: 'none', borderRadius: '5px', fontWeight: 'bold' };
// Réutiliser les styles de BlogIndexPage si nécessaire
    </code></pre>
  `,
  example: { // L'exemple précédent sur ArticleCard est toujours pertinent.
    title: 'Composant `ArticleCard` réutilisable',
    code: `// components/ArticleCard.jsx 
// (Code inchangé par rapport à la version précédente, il est bon)
import Link from 'next/link';

export default function ArticleCard({ post }) {
  // Simple nettoyage pour l'extrait (retire les balises HTML)
  const excerpt = post.content 
    ? \`\${post.content.replace(/<[^>]*>?/gm, '').substring(0, 100)}...\`
    : '';

  return (
    <div style={{ 
      border: '1px solid #ddd', 
      borderRadius: '8px', 
      padding: '15px', 
      marginBottom: '15px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
    }}>
      <Link href={\`/blog/\${post.id}\`} style={{ textDecoration: 'none' }}>
        <h3 style={{ marginTop: 0, color: '#333', fontSize: '1.4rem' }}>{post.title}</h3>
      </Link>
      <p style={{ fontSize: '0.9em', color: '#666', margin: '0.3rem 0' }}>Par: {post.author || 'Anonyme'}</p>
      {post.createdAt && <p style={{ fontSize: '0.8em', color: '#888', margin: '0.3rem 0' }}>Publié le: {new Date(post.createdAt).toLocaleDateString('fr-FR')}</p>}
      {excerpt && <p style={{ fontSize: '1em', color: '#444', maxHeight: '60px', overflow: 'hidden', lineHeight: 1.5, margin: '0.5rem 0' }}>{excerpt}</p>}
      <Link href={\`/blog/\${post.id}\`} style={{ color: '#007bff', fontWeight: 'bold', fontSize: '0.95rem' }}>
        Lire la suite
      </Link>
    </div>
  );
}
`,
    explanation: 'Ce composant `ArticleCard` peut être utilisé dans la page d\'index du blog pour afficher un aperçu de chaque article. Il inclut un nettoyage simple des balises HTML pour l\'extrait.'
  },
  exercise: { // L'exercice précédent est bon et couvre déjà ces aspects.
    title: 'Compléter et Améliorer la Page de Détail d\'un Article (pages/blog/[id].js)',
    description: 'En vous basant sur les explications fournies, finalisez le fichier `pages/blog/[id].js`. Assurez-vous que : \n1. `getStaticPaths` récupère correctement les IDs depuis votre API. \n2. `getStaticProps` récupère les données complètes pour un article donné, gère la sanitization du contenu HTML si nécessaire (conceptuellement, ou si vous ajoutez `isomorphic-dompurify`), et retourne `notFound: true` si l\'article n\'existe pas. \n3. La page affiche le titre, l\'auteur, la date de création formatée, et le contenu. \n4. La page gère correctement le cas `!post`. \n5. Ajoutez des balises `<Head>` pour un SEO de base (titre et description).',
    initialCode: `// pages/blog/[id].js
import Link from 'next/link';
import Head from 'next/head';
// import { useRouter } from 'next/router'; // Pour fallback: true
// import DOMPurify from 'isomorphic-dompurify'; // Si vous implémentez la sanitization

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// TODO 1: Implémenter getStaticPaths
// export async function getStaticPaths() { ... }

// TODO 2: Implémenter getStaticProps
// - Fetcher /api/posts/[id]
// - (Optionnel mais recommandé) Sanitize post.content si c'est du HTML d'utilisateur
// - Gérer le cas !res.ok en retournant { notFound: true }
// - Retourner { props: { post }, revalidate: 60 }
// export async function getStaticProps({ params }) { ... }

export default function BlogPostPage({ post }) {
  // const router = useRouter();
  // if (router.isFallback) { return <div>Chargement...</div>; }
  
  if (!post) { /* ... gestion du post non trouvé ... */ }

  // const cleanContent = post.content ? DOMPurify.sanitize(post.content) : ''; // Si vous sanitizez ici

  return (
    <div>
      {/* TODO 3: Ajouter les balises Head */}
      <Head>
        <title>Titre de l'article - Mon Blog</title>
      </Head>
      {/* ... reste de la structure ... */}
      {/* TODO 4: Afficher post.title, post.author, post.createdAt (formaté), post.content (sanitisé) */}
      {/* <div dangerouslySetInnerHTML={{ __html: cleanContent }} /> */}
    </div>
  );
}`,
    solution: `// pages/blog/[id].js
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router'; // Utile pour router.isFallback si fallback: true
// Pour la sanitization, vous installeriez 'isomorphic-dompurify'
// import DOMPurify from 'isomorphic-dompurify'; 

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function getStaticPaths() {
  try {
    const res = await fetch(\`\${API_BASE_URL}/api/posts\`);
    if (!res.ok) {
      console.error("getStaticPaths: Failed to fetch posts list for path generation.");
      return { paths: [], fallback: 'blocking' };
    }
    const posts = await res.json();
    const paths = posts.map((post) => ({
      params: { id: post.id.toString() },
    }));
    return { paths, fallback: 'blocking' };
  } catch (error) {
    console.error("Error in getStaticPaths:", error);
    return { paths: [], fallback: 'blocking' };
  }
}

export async function getStaticProps({ params }) {
  const { id } = params;
  try {
    const res = await fetch(\`\${API_BASE_URL}/api/posts/\${id}\`);
    if (!res.ok) {
      return { notFound: true };
    }
    let post = await res.json();

    // **Sanitization du contenu HTML si nécessaire (ici ou à la source)**
    // if (post.content && typeof post.content === 'string') {
    //   // Note: DOMPurify est lourd côté serveur sans un environnement DOM comme JSDOM.
    //   // Il est souvent préférable de sanitiser au moment de la sauvegarde en BDD,
    //   // ou d'utiliser une lib Markdown vers HTML sûre.
    //   // Pour l'exercice, on suppose que le contenu de l'API est déjà sûr ou qu'on le traite.
    //   // post.content = DOMPurify.sanitize(post.content, { USE_PROFILES: { html: true } });
    // }

    return {
      props: { post },
      revalidate: 60,
    };
  } catch (error) {
    console.error(\`Error fetching post \${id} in getStaticProps:\`, error);
    return { notFound: true };
  }
}

export default function BlogPostPage({ post }) {
  const router = useRouter();

  if (router.isFallback) { // Même avec 'blocking', router.isFallback peut être vrai brièvement.
    return <div style={loadingStyle}>Chargement de l'article...</div>;
  }

  if (!post) {
    return (
      <div style={pageStyle}>
        <Head>
          <title>Article Non Trouvé - Mon Blog</title>
        </Head>
        <h1 style={titleStyle}>Article Non Trouvé</h1>
        <p>Désolé, l'article que vous recherchez n'a pas pu être localisé.</p>
        <Link href="/blog" style={linkStyle}>← Retour à la liste des articles</Link>
      </div>
    );
  }

  const excerpt = post.content 
    ? (post.content.replace(/<[^>]*>?/gm, '').substring(0, 160) + '...')
    : \`Lisez l'article '\${post.title}' sur notre blog.\`;

  return (
    <div style={pageStyle}>
      <Head>
        <title>{post.title} - Mon Blog</title>
        <meta name="description" content={excerpt} />
        {/* Autres balises meta utiles: canonical, open graph, etc. */}
      </Head>
      
      <div style={{ marginBottom: '20px' }}>
        <Link href="/blog" style={linkStyle}>
          ← Retour au blog
        </Link>
      </div>
      
      <article>
        <h1 style={titleStyle}>{post.title}</h1>
        <p style={metaStyle}>
          Par : <strong style={{color: '#333'}}>{post.author || 'Anonyme'}</strong>
          {post.createdAt && (
            <>
              <span style={{ margin: '0 8px' }}>•</span>
              Publié le : {new Date(post.createdAt).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit', // Optionnel: ajouter l'heure
                minute: '2-digit'// Optionnel: ajouter les minutes
              })}
            </>
          )}
        </p>
        {post.content ? (
          <div 
            style={contentStyle} 
            dangerouslySetInnerHTML={{ __html: post.content /* Assurez-vous que c'est SÛR */ }} 
          />
        ) : (
          <p style={{fontStyle: 'italic'}}>Le contenu de cet article n'est pas disponible.</p>
        )}
      </article>

      <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #eee', textAlign: 'right' }}>
        <Link href={\`/blog/\${post.id}/edit\`} style={buttonStyle}>
          Modifier cet article
        </Link>
      </div>
    </div>
  );
}

// Styles
const pageStyle = { maxWidth: '800px', margin: '2rem auto', padding: '2rem', fontFamily: 'Georgia, serif', color: '#444', backgroundColor: '#fff', boxShadow: '0 3px 15px rgba(0,0,0,0.05)', borderRadius: '5px' };
const titleStyle = { fontSize: '2.6rem', marginBottom: '0.75rem', color: '#222', lineHeight: 1.25 };
const metaStyle = { fontSize: '0.95rem', color: '#555', marginBottom: '2rem' };
const contentStyle = { fontSize: '1.15rem', lineHeight: 1.85, color: '#333' };
const linkStyle = { color: '#007bff', textDecoration: 'none', fontWeight: '600' };
const buttonStyle = { display: 'inline-block', padding: '10px 18px', backgroundColor: '#ffae42', color: '#fff', textDecoration: 'none', borderRadius: '5px', fontWeight: 'bold', border: 'none', cursor: 'pointer', transition: 'background-color 0.2s ease' };
// buttonStyle[':hover'] = { backgroundColor: '#e69500' }; // Pour un vrai CSS
const loadingStyle = { textAlign: 'center', padding: '3rem', fontSize: '1.5rem', color: '#555', fontFamily: 'Arial, sans-serif' };
`,
  },
  quiz: { // Garder le quiz pertinent déjà créé
    title: 'Quiz sur le Data Fetching Frontend pour un Blog',
    questions: [
      {
        question: 'Dans Next.js (Pages Router), quelle fonction est utilisée pour récupérer des données au moment du build pour une page statique ?',
        options: ['getServerSideProps', 'useEffect', 'getStaticProps', 'fetchData'],
        correctAnswer: 'getStaticProps'
      },
      {
        question: 'Pour une route dynamique comme `pages/blog/[id].js`, quelle fonction supplémentaire doit être utilisée avec `getStaticProps` pour informer Next.js des chemins à pré-générer ?',
        options: ['getDynamicPaths', 'getStaticRoutes', 'getAllPossiblePaths', 'getStaticPaths'],
        correctAnswer: 'getStaticPaths'
      },
      {
        question: 'Que signifie `fallback: \'blocking\'` dans le retour de `getStaticPaths` ?',
        options: ['Les chemins non retournés par getStaticPaths afficheront immédiatement une page 404.', 'Le navigateur attendra que la page soit générée côté serveur (SSR-like) pour les nouveaux chemins, puis la mettra en cache pour les requêtes futures.', 'Le client affichera une version de fallback de la page (via `router.isFallback`) pendant que Next.js génère la page en arrière-plan.', 'Cela désactive la génération statique pour cette route.'],
        correctAnswer: 'Le navigateur attendra que la page soit générée côté serveur (SSR-like) pour les nouveaux chemins, puis la mettra en cache pour les requêtes futures.'
      }
    ]
  },
  hasExercise: true,
  hasQuiz: true,
  hasProject: false 
};

export default lesson2;
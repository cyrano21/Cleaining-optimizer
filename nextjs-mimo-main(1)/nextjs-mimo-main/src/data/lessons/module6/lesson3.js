// src/data/lessons/module6/lesson3.js
const lesson3 = {
  id: '6-3',
  title: 'Techniques de Routage Avancées et Optimisation',
  description:
    'Maîtrisez les techniques avancées de routage Next.js : parallel routes, intercepting routes, et optimisations pour des applications performantes.',
  difficulty: 'avancé',
  duration: 75,
  tags: [
    'Next.js',
    'App Router',
    'Parallel Routes',
    'Intercepting Routes',
    'Optimisation',
    'Performance'
  ],
  prerequisites: ['6-1', '6-2'], // Comprendre les bases et migration avant les techniques avancées
  content: `
    <h2>Techniques de Routage Avancées avec l'App Router</h2>
    <p>L'App Router de Next.js offre des fonctionnalités avancées qui permettent de créer des expériences utilisateur sophistiquées. Dans cette leçon, nous explorerons les <strong>Parallel Routes</strong>, les <strong>Intercepting Routes</strong>, et diverses techniques d'optimisation.</p>

    <h3>Parallel Routes (Routes Parallèles)</h3>
    <p>Les Parallel Routes permettent de rendre simultanément plusieurs pages dans la même interface utilisateur. Cela est particulièrement utile pour créer des dashboards complexes, des modales conditionnelles, ou des vues en parallèle.</p>

    <h4>Structure des Parallel Routes</h4>
    <p>Les Parallel Routes utilisent la convention <code>@folder</code> pour définir des "slots" nommés :</p>
    <pre><code class="language-text">app/
├── layout.js
├── page.js
├── @dashboard/
│   ├── page.js
│   └── analytics/
│       └── page.js
├── @sidebar/
│   ├── page.js
│   └── settings/
│       └── page.js
└── @modal/
    ├── default.js
    └── login/
        └── page.js</code></pre>

    <h4>Implémentation du Layout Principal</h4>
    <pre><code class="language-javascript">// app/layout.js
export default function RootLayout({
  children,
  dashboard,
  sidebar,
  modal
}) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen">
          {/* Sidebar toujours visible */}
          <aside className="w-64 bg-gray-100">
            {sidebar}
          </aside>
          
          <main className="flex-1">
            {/* Contenu principal */}
            {children}
            
            {/* Dashboard conditionnel */}
            <div className="mt-8">
              {dashboard}
            </div>
          </main>
        </div>
        
        {/* Modal overlay */}
        {modal}
      </body>
    </html>
  );
}</code></pre>

    <h4>Gestion des États avec default.js</h4>
    <p>Le fichier <code>default.js</code> définit ce qui est rendu quand aucune route spécifique ne correspond au slot :</p>
    <pre><code class="language-javascript">// app/@modal/default.js
export default function Default() {
  return null; // Aucune modal par défaut
}

// app/@dashboard/default.js
export default function DefaultDashboard() {
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <h2>Tableau de bord par défaut</h2>
      <p>Sélectionnez une section pour voir les détails.</p>
    </div>
  );
}</code></pre>

    <h3>Intercepting Routes (Routes d'Interception)</h3>
    <p>Les Intercepting Routes permettent de "capturer" une route et d'afficher un contenu différent selon le contexte de navigation (par exemple, ouvrir une image en modal lors de la navigation client, mais en page complète lors d'un accès direct).</p>

    <h4>Conventions d'Interception</h4>
    <ul>
      <li><code>(.)</code> - Intercepte les routes du même niveau</li>
      <li><code>(..)</code> - Intercepte les routes d'un niveau supérieur</li>
      <li><code>(..)(..)</code> - Intercepte les routes de deux niveaux supérieurs</li>
      <li><code>(...)</code> - Intercepte depuis la racine de l'app</li>
    </ul>

    <h4>Exemple : Modal de Photo</h4>
    <pre><code class="language-text">app/
├── layout.js
├── page.js
├── photos/
│   ├── page.js
│   └── [id]/
│       └── page.js
├── @modal/
│   ├── default.js
│   └── (.)photos/
│       └── [id]/
│           └── page.js
└── components/
    └── PhotoModal.js</code></pre>

    <pre><code class="language-javascript">// app/photos/[id]/page.js - Page complète de la photo
import Image from 'next/image';

export default function PhotoPage({ params }) {
  return (
    <div className="container mx-auto py-8">
      <h1>Photo {params.id}</h1>
      <Image
        src={\`/images/photo-\${params.id}.jpg\`}
        alt={\`Photo \${params.id}\`}
        width={800}
        height={600}
        className="rounded-lg"
      />
      <div className="mt-4">
        <h2>Détails de la photo</h2>
        <p>Description détaillée de la photo...</p>
      </div>
    </div>
  );
}

// app/@modal/(.)photos/[id]/page.js - Version modale
import PhotoModal from '@/components/PhotoModal';

export default function InterceptedPhotoPage({ params }) {
  return (
    <PhotoModal>
      <Image
        src={\`/images/photo-\${params.id}.jpg\`}
        alt={\`Photo \${params.id}\`}
        width={600}
        height={400}
        className="rounded-lg"
      />
    </PhotoModal>
  );
}</code></pre>

    <h4>Composant Modal Réutilisable</h4>
    <pre><code class="language-javascript">// components/PhotoModal.js
'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PhotoModal({ children }) {
  const router = useRouter();

  useEffect(() => {
    // Fermer avec Escape
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        router.back();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [router]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-75"
        onClick={() => router.back()}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-lg p-4 max-w-4xl max-h-[90vh] overflow-auto">
        <button
          onClick={() => router.back()}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}</code></pre>

    <h3>Route Groups et Organisation</h3>
    <p>Les Route Groups permettent d'organiser votre code sans affecter la structure des URLs en utilisant des parenthèses <code>(group)</code> :</p>

    <pre><code class="language-text">app/
├── (marketing)/
│   ├── layout.js          # Layout spécifique au marketing
│   ├── page.js           # / (homepage marketing)
│   ├── about/
│   │   └── page.js       # /about
│   └── contact/
│       └── page.js       # /contact
├── (dashboard)/
│   ├── layout.js          # Layout pour le dashboard
│   ├── dashboard/
│   │   └── page.js       # /dashboard
│   ├── analytics/
│   │   └── page.js       # /analytics
│   └── settings/
│       └── page.js       # /settings
└── (auth)/
    ├── login/
    │   └── page.js        # /login
    └── register/
        └── page.js        # /register</code></pre>

    <h3>Optimisations de Performance</h3>
    
    <h4>1. Route-Level Code Splitting</h4>
    <p>Next.js divise automatiquement le code au niveau des routes, mais vous pouvez optimiser davantage :</p>
    <pre><code class="language-javascript">// app/heavy-component/page.js
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('@/components/HeavyComponent'));

export default function HeavyPage() {
  return (
    <div>
      <h1>Page avec composant lourd</h1>
      <Suspense fallback={<div>Chargement du composant...</div>}>
        <HeavyComponent />
      </Suspense>
    </div>
  );
}</code></pre>

    <h4>2. Preloading et Prefetching</h4>
    <pre><code class="language-javascript">// components/NavigationMenu.js
'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NavigationMenu() {
  const router = useRouter();

  // Précharger une route au survol
  const handleMouseEnter = () => {
    router.prefetch('/dashboard');
  };

  return (
    <nav>
      <Link 
        href="/dashboard"
        onMouseEnter={handleMouseEnter}
        className="hover:text-blue-600"
      >
        Dashboard
      </Link>
    </nav>
  );
}</code></pre>

    <h4>3. Optimisation des Layouts Imbriqués</h4>
    <pre><code class="language-javascript">// app/dashboard/layout.js
import { Suspense } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <div className="flex">
        <Suspense fallback={<div>Chargement sidebar...</div>}>
          <DashboardSidebar />
        </Suspense>
        <main className="flex-1 p-6">
          <Suspense fallback={<div>Chargement contenu...</div>}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}</code></pre>

    <h3>Gestion d'État Global avec le Routage</h3>
    <p>Combiner le routage avec une gestion d'état pour des expériences utilisateur fluides :</p>
    <pre><code class="language-javascript">// hooks/useRouteState.js
'use client';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';

export function useRouteState(key, defaultValue = '') {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const value = searchParams.get(key) || defaultValue;

  const setValue = useCallback((newValue) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newValue) {
      params.set(key, newValue);
    } else {
      params.delete(key);
    }

    const search = params.toString();
    const query = search ? \`?\${search}\` : '';
    
    router.push(\`\${pathname}\${query}\`);
  }, [key, pathname, router, searchParams]);

  return [value, setValue];
}

// Utilisation dans un composant
function FilterComponent() {
  const [filter, setFilter] = useRouteState('filter', 'all');
  const [sort, setSort] = useRouteState('sort', 'date');

  return (
    <div>
      <select 
        value={filter} 
        onChange={(e) => setFilter(e.target.value)}
      >
        <option value="all">Tous</option>
        <option value="active">Actifs</option>
        <option value="completed">Terminés</option>
      </select>
      
      <select 
        value={sort} 
        onChange={(e) => setSort(e.target.value)}
      >
        <option value="date">Date</option>
        <option value="name">Nom</option>
        <option value="priority">Priorité</option>
      </select>
    </div>
  );
}</code></pre>

    <h3>Patterns Avancés de Navigation</h3>
    
    <h4>Navigation Programmatique Conditionnelle</h4>
    <pre><code class="language-javascript">// hooks/useNavigationGuard.js
'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useNavigationGuard(condition, message) {
  const router = useRouter();

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (condition()) {
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [condition, message]);

  const navigate = (path) => {
    if (condition()) {
      const confirmed = window.confirm(message);
      if (confirmed) {
        router.push(path);
      }
    } else {
      router.push(path);
    }
  };

  return { navigate };
}

// Utilisation
function EditForm() {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { navigate } = useNavigationGuard(
    () => hasUnsavedChanges,
    'Vous avez des modifications non sauvegardées. Voulez-vous vraiment quitter ?'
  );

  return (
    <form>
      {/* Formulaire */}
      <button type="button" onClick={() => navigate('/dashboard')}>
        Retour au dashboard
      </button>
    </form>
  );
}</code></pre>

    <h3>Optimisation SEO avec le Routage Dynamique</h3>
    <pre><code class="language-javascript">// app/blog/[slug]/page.js
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
  const post = await getPost(params.slug);
  
  if (!post) {
    return {
      title: 'Article non trouvé',
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.featuredImage],
    },
  };
}

export async function generateStaticParams() {
  const posts = await getPosts();
  
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPost({ params }) {
  const post = await getPost(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}</code></pre>
  `,
  example: {
    title: 'Application E-commerce avec Routes Avancées',
    description:
      "Implémentation d'une application e-commerce utilisant les techniques de routage avancées.",
    code: `
// Structure de l'application
app/
├── layout.js
├── page.js                    # Homepage
├── (shop)/
│   ├── layout.js             # Layout e-commerce
│   ├── products/
│   │   ├── page.js           # Liste des produits
│   │   └── [id]/
│   │       └── page.js       # Détail produit
│   ├── cart/
│   │   └── page.js           # Panier
│   └── checkout/
│       └── page.js           # Commande
├── @modal/
│   ├── default.js
│   └── (.)products/
│       └── [id]/
│           └── page.js       # Modal produit
└── @cart/
    ├── default.js
    └── page.js               # Mini panier

// app/(shop)/layout.js - Layout e-commerce avec parallel routes
export default function ShopLayout({ children, modal, cart }) {
  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-sm">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            E-Shop
          </Link>
          
          {/* Navigation */}
          <div className="flex space-x-6">
            <Link href="/products">Produits</Link>
            <Link href="/cart">Panier</Link>
          </div>
        </nav>
      </header>

      <div className="flex">
        {/* Contenu principal */}
        <main className="flex-1">
          {children}
        </main>
        
        {/* Mini panier sidebar */}
        <aside className="w-80 bg-gray-50 p-4">
          {cart}
        </aside>
      </div>

      {/* Modal overlay */}
      {modal}
    </div>
  );
}

// app/products/page.js - Liste des produits
export default async function ProductsPage({ searchParams }) {
  const { category, sort, page = 1 } = searchParams;
  const products = await getProducts({ category, sort, page });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Nos Produits</h1>
      
      {/* Filtres */}
      <ProductFilters />
      
      {/* Grille de produits */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      {/* Pagination */}
      <Pagination currentPage={page} totalPages={products.totalPages} />
    </div>
  );
}

// components/ProductCard.js
'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function ProductCard({ product }) {
  const router = useRouter();

  const handleQuickView = (e) => {
    e.preventDefault();
    router.push(\`/products/\${product.id}\`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <Link href={\`/products/\${product.id}\`}>
        <Image
          src={product.image}
          alt={product.name}
          width={300}
          height={300}
          className="w-full h-48 object-cover"
        />
      </Link>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
        <p className="text-gray-600 mb-2">{product.price}€</p>
        
        <div className="flex space-x-2">
          <button
            onClick={handleQuickView}
            className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Aperçu rapide
          </button>
          <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Ajouter au panier
          </button>
        </div>
      </div>
    </div>
  );
}

// app/@modal/(.)products/[id]/page.js - Modal produit
import ProductModal from '@/components/ProductModal';

export default async function InterceptedProductPage({ params }) {
  const product = await getProduct(params.id);

  return (
    <ProductModal>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Image
          src={product.image}
          alt={product.name}
          width={500}
          height={500}
          className="rounded-lg"
        />
        
        <div>
          <h2 className="text-2xl font-bold mb-4">{product.name}</h2>
          <p className="text-3xl font-bold text-green-600 mb-4">{product.price}€</p>
          <p className="text-gray-600 mb-6">{product.description}</p>
          
          <button className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600">
            Ajouter au panier
          </button>
        </div>
      </div>
    </ProductModal>
  );
}

// components/ProductFilters.js
'use client';
import { useRouteState } from '@/hooks/useRouteState';

export default function ProductFilters() {
  const [category, setCategory] = useRouteState('category');
  const [sort, setSort] = useRouteState('sort', 'name');

  return (
    <div className="flex space-x-4 mb-8">
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="border rounded-md px-3 py-2"
      >
        <option value="">Toutes les catégories</option>
        <option value="electronics">Électronique</option>
        <option value="clothing">Vêtements</option>
        <option value="books">Livres</option>
      </select>

      <select
        value={sort}
        onChange={(e) => setSort(e.target.value)}
        className="border rounded-md px-3 py-2"
      >
        <option value="name">Nom</option>
        <option value="price">Prix</option>
        <option value="rating">Note</option>
      </select>
    </div>
  );
}
    `,
    explanation:
      "Cet exemple montre une application e-commerce complète utilisant les Parallel Routes pour le mini-panier, les Intercepting Routes pour les aperçus produits en modal, et la gestion d'état via URL pour les filtres."
  },
  exercise: {
    title: 'Créer un Système de Dashboard Avancé',
    description:
      "Implémentez un dashboard d'administration utilisant toutes les techniques de routage avancées apprises.",
    initialCode: `
// TODO: Créer la structure suivante avec l'App Router

app/
├── dashboard/
│   ├── layout.js             # Layout principal du dashboard
│   ├── page.js              # Vue d'ensemble
│   ├── @sidebar/           # Parallel route pour la sidebar
│   ├── @modal/             # Parallel route pour les modales
│   ├── users/
│   │   ├── page.js         # Liste des utilisateurs
│   │   └── [id]/
│   │       └── page.js     # Détail utilisateur
│   └── analytics/
│       └── page.js         # Page analytics

// Votre tâche :
// 1. Implémenter les Parallel Routes pour sidebar et modal
// 2. Créer des Intercepting Routes pour les détails utilisateur
// 3. Ajouter la navigation programmatique
// 4. Implémenter les filtres avec gestion d'état URL
`,
    solution: `
// app/dashboard/layout.js
export default function DashboardLayout({ 
  children, 
  sidebar, 
  modal 
}) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar parallèle */}
      <aside className="w-64 bg-white shadow-sm">
        {sidebar}
      </aside>
      
      {/* Contenu principal */}
      <main className="flex-1 p-6">
        {children}
      </main>
      
      {/* Modal overlay */}
      {modal}
    </div>
  );
}

// app/dashboard/@sidebar/page.js
import Link from 'next/link';

export default function DashboardSidebar() {
  return (
    <nav className="p-4">
      <h2 className="text-lg font-semibold mb-4">Dashboard</h2>
      <ul className="space-y-2">
        <li>
          <Link 
            href="/dashboard" 
            className="block p-2 rounded hover:bg-gray-100"
          >
            Vue d'ensemble
          </Link>
        </li>
        <li>
          <Link 
            href="/dashboard/users" 
            className="block p-2 rounded hover:bg-gray-100"
          >
            Utilisateurs
          </Link>
        </li>
        <li>
          <Link 
            href="/dashboard/analytics" 
            className="block p-2 rounded hover:bg-gray-100"
          >
            Analytics
          </Link>
        </li>
      </ul>
    </nav>
  );
}

// app/dashboard/users/page.js
import UserCard from '@/components/UserCard';
import UserFilters from '@/components/UserFilters';

export default async function UsersPage({ searchParams }) {
  const { role, status, search } = searchParams;
  const users = await getUsers({ role, status, search });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Gestion des Utilisateurs</h1>
      
      <UserFilters />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map(user => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
}

// app/dashboard/@modal/(.)users/[id]/page.js
import UserModal from '@/components/UserModal';

export default async function InterceptedUserPage({ params }) {
  const user = await getUser(params.id);

  return (
    <UserModal>
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">{user.name}</h2>
        <div className="space-y-2">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Rôle:</strong> {user.role}</p>
          <p><strong>Statut:</strong> {user.status}</p>
          <p><strong>Créé le:</strong> {user.createdAt}</p>
        </div>
        
        <div className="mt-6 flex space-x-2">
          <button className="px-4 py-2 bg-blue-500 text-white rounded">
            Modifier
          </button>
          <button className="px-4 py-2 bg-red-500 text-white rounded">
            Supprimer
          </button>
        </div>
      </div>
    </UserModal>
  );
}

// components/UserFilters.js
'use client';
import { useRouteState } from '@/hooks/useRouteState';

export default function UserFilters() {
  const [role, setRole] = useRouteState('role');
  const [status, setStatus] = useRouteState('status');
  const [search, setSearch] = useRouteState('search');

  return (
    <div className="flex space-x-4 mb-6">
      <input
        type="text"
        placeholder="Rechercher..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border rounded-md px-3 py-2"
      />
      
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="border rounded-md px-3 py-2"
      >
        <option value="">Tous les rôles</option>
        <option value="admin">Admin</option>
        <option value="user">Utilisateur</option>
        <option value="moderator">Modérateur</option>
      </select>

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="border rounded-md px-3 py-2"
      >
        <option value="">Tous les statuts</option>
        <option value="active">Actif</option>
        <option value="inactive">Inactif</option>
        <option value="pending">En attente</option>
      </select>
    </div>
  );
}
    `,
    tasks: [
      'Créer la structure de dossiers avec Parallel Routes (@sidebar, @modal)',
      'Implémenter les Intercepting Routes pour les détails utilisateur',
      "Créer les composants UserFilters avec gestion d'état URL",
      'Ajouter la navigation programmatique avec useRouter',
      'Implémenter les modales avec gestion du clavier et overlay'
    ]
  },
  quiz: {
    title: 'Quiz sur les Techniques de Routage Avancées',
    questions: [
      {
        question:
          'Quelle convention utilisez-vous pour créer des Parallel Routes dans Next.js App Router ?',
        options: [
          'Utiliser des crochets [slot]',
          'Utiliser le préfixe @slot',
          'Utiliser des parenthèses (slot)',
          'Utiliser un underscore _slot'
        ],
        correctAnswer: 1,
        explanation:
          'Les Parallel Routes utilisent la convention @slot pour créer des slots nommés qui peuvent être rendus en parallèle.'
      },
      {
        question: 'Que fait la convention (.) dans les Intercepting Routes ?',
        options: [
          'Intercepte toutes les routes',
          'Intercepte les routes du niveau racine',
          'Intercepte les routes du même niveau',
          'Intercepte les routes du niveau parent'
        ],
        correctAnswer: 2,
        explanation:
          "La convention (.) intercepte les routes du même niveau dans la hiérarchie de l'App Router."
      },
      {
        question:
          'À quoi sert le fichier default.js dans les Parallel Routes ?',
        options: [
          'À définir le layout par défaut',
          'À définir ce qui est rendu quand aucune route spécifique ne correspond',
          'À gérer les erreurs de routage',
          'À optimiser les performances'
        ],
        correctAnswer: 1,
        explanation:
          'Le fichier default.js définit ce qui doit être rendu dans un slot quand aucune route spécifique ne correspond au slot.'
      }
    ]
  },
  project: {
    title: 'Plateforme de Gestion de Contenu Avancée',
    description:
      'Créez une plateforme CMS complète utilisant toutes les techniques de routage avancées de Next.js.',
    requirements: [
      'Dashboard principal avec Parallel Routes pour sidebar, contenu principal et notifications',
      "Système de modal pour l'édition rapide utilisant Intercepting Routes",
      'Navigation avec Route Groups pour séparer admin, public et API',
      "Filtres et recherche avec gestion d'état URL persistante",
      'Navigation programmatique avec guards et confirmations',
      'Optimisations de performance avec lazy loading et prefetching',
      'Système de notifications en temps réel intégré au routage'
    ],
    hints: [
      'Utilisez les Route Groups pour organiser admin/(dashboard), public/(marketing), api/',
      "Implémentez des hooks personnalisés pour la gestion d'état URL",
      'Créez des composants modaux réutilisables avec Context',
      'Ajoutez des animations de transition entre les routes',
      'Utilisez Suspense pour le streaming et le loading progressif'
    ],
    bonus: [
      'Intégration avec un système de permissions basé sur les routes',
      'Mode prévisualisation avec Intercepting Routes',
      'Navigation par raccourcis clavier',
      "Système d'onglets dynamiques",
      'Breadcrumb automatique basé sur la structure de routes'
    ]
  }
}

export default lesson3

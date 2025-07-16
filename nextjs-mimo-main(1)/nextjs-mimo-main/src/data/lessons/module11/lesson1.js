// src/data/lessons/module11/lesson1.js
const lesson1 = {
  id: '11-1',
  title: 'Architecture de projets à grande échelle',
  description:
    'Apprenez à structurer des applications Next.js complexes pour une maintenabilité et une évolutivité optimales',
  difficulty: 'avancé',
  duration: 75,
  tags: [
    'Next.js',
    'Architecture',
    'Design Patterns',
    'Structure de projet',
    'Bonnes pratiques'
  ],
  prerequisites: ['3-1', '6-1', '8-1'],
  content: `
    <h2>Architecture de projets Next.js à grande échelle</h2>
    <p>Lorsqu'une application Next.js grandit, une architecture bien pensée devient cruciale pour maintenir la qualité du code, faciliter la collaboration entre développeurs et assurer l'évolutivité du projet.</p>

    <h3>Principes d'architecture pour grandes applications</h3>
    <ul>
      <li><strong>Séparation des préoccupations</strong> : Isoler les différentes responsabilités du code</li>
      <li><strong>Modularité</strong> : Concevoir des composants et des modules réutilisables</li>
      <li><strong>Maintenabilité</strong> : Faciliter la compréhension et l'évolution du code</li>
      <li><strong>Scalabilité</strong> : Permettre à l'application de croître sans refonte majeure</li>
      <li><strong>Cohérence</strong> : Maintenir des patterns et conventions uniformes</li>
    </ul>

    <h3>Structure de dossiers pour projets complexes</h3>
    <p>Voici une structure recommandée pour les grandes applications Next.js :</p>

    <pre><code>
/src
  /app (ou /pages pour Pages Router)
  /components
    /common          # Composants réutilisables dans toute l'app
    /layouts         # Mise en page et structures
    /features        # Organisés par fonctionnalité métier
      /auth
      /dashboard
      /products
  /hooks             # Custom hooks
  /lib               # Utilitaires et services
  /api               # Logique d'API et clients
    /services        # Services métier
    /clients         # Clients d'API externes
  /contexts          # Contextes React
  /store             # État global (Redux, Zustand, etc.)
  /types             # Types TypeScript
  /utils             # Fonctions utilitaires
  /styles            # Styles globaux et thèmes
  /constants         # Constantes et configuration
  /public            # Actifs statiques
    </code></pre>

    <h3>Architecture orientée domaine (DDD)</h3>
    <p>Pour les applications très complexes, envisagez une architecture orientée domaine qui regroupe le code par domaine métier plutôt que par type technique :</p>

    <pre><code>
/src
  /domains
    /user
      /components
      /hooks
      /services
      /types
      /utils
    /product
      /components
      /hooks
      /services
      /types
      /utils
    /checkout
      /components
      /hooks
      /services
      /types
      /utils
  /shared            # Code partagé entre domaines
    /components
    /hooks
    /utils
    </code></pre>

    <h3>Patterns architecturaux courants</h3>

    <h4>1. Clean Architecture</h4>
    <p>La Clean Architecture sépare le code en couches concentriques :</p>
    <ul>
      <li><strong>Entités</strong> : Objets métier avec la logique associée</li>
      <li><strong>Cas d'utilisation</strong> : Logique d'application spécifique</li>
      <li><strong>Adaptateurs</strong> : Conversion de données entre couches</li>
      <li><strong>Frameworks & Drivers</strong> : Couche externe (Next.js, bases de données, etc.)</li>
    </ul>

    <h4>2. Feature-First Architecture</h4>
    <p>Organisation par fonctionnalité métier plutôt que par type technique, facilitant la compréhension du code par sa fonction :</p>
    <pre><code>
/src
  /features
    /authentication
    /product-catalog
    /shopping-cart
    /checkout
    /user-profile
    </code></pre>

    <h4>3. Atomic Design</h4>
    <p>Un système de conception qui organise les composants d'interface par niveau de complexité :</p>
    <ul>
      <li><strong>Atoms</strong> : Composants de base (boutons, inputs, etc.)</li>
      <li><strong>Molecules</strong> : Groupes d'atomes (formulaire de recherche, etc.)</li>
      <li><strong>Organisms</strong> : Groupes de molécules (en-tête, pied de page, etc.)</li>
      <li><strong>Templates</strong> : Mise en page avec des espaces pour les organismes</li>
      <li><strong>Pages</strong> : Instances spécifiques de templates avec des données réelles</li>
    </ul>

    <h3>Gestion d'état à grande échelle</h3>
    <p>Dans les applications complexes, la gestion d'état devient un défi majeur :</p>
    <ul>
      <li><strong>État local</strong> : useState, useReducer pour l'état de composant</li>
      <li><strong>État partagé</strong> : Context API pour le partage limité</li>
      <li><strong>État global</strong> : Redux, Zustand, Jotai, Recoil pour l'état à l'échelle de l'application</li>
      <li><strong>État serveur</strong> : React Query, SWR pour la gestion des données distantes</li>
    </ul>

    <h3>Stratégies de découpage de code</h3>
    <p>Next.js offre un découpage de code automatique par page, mais pour les grandes applications :</p>
    <ul>
      <li><strong>dynamic imports</strong> : Chargement à la demande des composants lourds</li>
      <li><strong>next/dynamic</strong> : Composants chargés dynamiquement avec support SSR</li>
      <li><strong>Micro-frontends</strong> : Division de l'application en sous-applications autonomes</li>
    </ul>
  `,
  example: {
    title:
      "Structure d'une application e-commerce avec architecture orientée domaine",
    code: `// Structure de l'application
/*
/src
  /app
    layout.tsx
    page.tsx
    /products
      /[id]
        page.tsx
      page.tsx
    /cart
      page.tsx
    /checkout
      page.tsx
    /account
      page.tsx
  /domains
    /product
      /components
        ProductCard.tsx
        ProductDetails.tsx
        ProductList.tsx
      /hooks
        useProducts.ts
      /services
        productService.ts
      /types
        product.types.ts
    /cart
      /components
        CartItem.tsx
        CartSummary.tsx
      /hooks
        useCart.ts
      /services
        cartService.ts
      /types
        cart.types.ts
    /checkout
      /components
        CheckoutForm.tsx
        PaymentMethods.tsx
      /services
        checkoutService.ts
  /shared
    /components
      Button.tsx
      Input.tsx
      Modal.tsx
    /hooks
      useLocalStorage.ts
      useMediaQuery.ts
    /services
      apiClient.ts
    /utils
      formatters.ts
      validators.ts
*/

// domains/product/types/product.types.ts
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
  rating?: {
    value: number;
    count: number;
  };
}

export interface ProductsFilter {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  query?: string;
  sort?: 'price_asc' | 'price_desc' | 'rating' | 'newest';
}

// domains/product/services/productService.ts
import { Product, ProductsFilter } from '../types/product.types';
import { apiClient } from '@/shared/services/apiClient';

export const productService = {
  async getProducts(filter?: ProductsFilter): Promise<Product[]> {
    const params = new URLSearchParams();
    
    if (filter?.category) params.append('category', filter.category);
    if (filter?.minPrice) params.append('minPrice', filter.minPrice.toString());
    if (filter?.maxPrice) params.append('maxPrice', filter.maxPrice.toString());
    if (filter?.query) params.append('query', filter.query);
    if (filter?.sort) params.append('sort', filter.sort);
    
    const url = \`/products?\${params.toString()}\`;
    return apiClient.get<Product[]>(url);
  },
  
  async getProductById(id: string): Promise<Product> {
    return apiClient.get<Product>(\`/products/\${id}\`);
  }
};

// domains/product/hooks/useProducts.ts
import { useQuery } from 'react-query';
import { productService } from '../services/productService';
import { ProductsFilter } from '../types/product.types';

export const useProducts = (filter?: ProductsFilter) => {
  return useQuery(
    ['products', filter],
    () => productService.getProducts(filter),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false
    }
  );
};

export const useProduct = (id: string) => {
  return useQuery(
    ['product', id],
    () => productService.getProductById(id),
    {
      enabled: !!id,
      staleTime: 10 * 60 * 1000 // 10 minutes
    }
  );
};

// domains/product/components/ProductCard.tsx
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '../types/product.types';
import { formatCurrency } from '@/shared/utils/formatters';
import Button from '@/shared/components/Button';
import { useCart } from '@/domains/cart/hooks/useCart';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <Link href={\`/products/\${product.id}\`}>
        <div className="relative h-48">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            style={{ objectFit: 'cover' }}
          />
        </div>
      </Link>
      <div className="p-4">
        <Link href={\`/products/\${product.id}\`} className="block">
          <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
        </Link>
        <p className="mt-1 text-gray-600 line-clamp-2">{product.description}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-bold">{formatCurrency(product.price)}</span>
          <Button onClick={() => addToCart(product)} disabled={product.stock === 0}>
            {product.stock > 0 ? 'Ajouter au panier' : 'Rupture de stock'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// app/products/page.tsx
import { Suspense } from 'react';
import { ProductList } from '@/domains/product/components/ProductList';
import { FilterSidebar } from '@/domains/product/components/FilterSidebar';

export default function ProductsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Nos produits</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-1/4">
          <FilterSidebar />
        </aside>
        
        <main className="w-full md:w-3/4">
          <Suspense fallback={<div>Chargement des produits...</div>}>
            <ProductList />
          </Suspense>
        </main>
      </div>
    </div>
  );
}`,
    explanation:
      "Cet exemple illustre une implémentation d'architecture orientée domaine pour une application e-commerce Next.js. Le code est organisé par domaines métier (produits, panier, paiement), avec une séparation claire des préoccupations à l'intérieur de chaque domaine (types, services, hooks, composants). Cette structure facilite la compréhension du code par sa fonction métier plutôt que par son rôle technique. Des hooks personnalisés comme useProducts encapsulent la logique de récupération et de gestion des données, utilisant React Query pour une gestion efficace du cache."
  },
  exercise: {
    title: "Organisation d'une application Next.js complexe",
    description:
      'Choisissez la meilleure structure de dossiers pour une application Next.js complexe avec plusieurs fonctionnalités.',
    options: [
      {
        id: 1,
        text: 'Organiser tous les fichiers par type (components, hooks, utils) sans séparation par fonctionnalité',
        correct: false
      },
      {
        id: 2,
        text: 'Organiser principalement par fonctionnalité métier avec une séparation claire entre les domaines et des dossiers partagés pour le code commun',
        correct: true
      },
      {
        id: 3,
        text: 'Mettre tous les fichiers dans un seul dossier pour faciliter la recherche',
        correct: false
      },
      {
        id: 4,
        text: 'Dupliquer le code partagé dans chaque fonctionnalité pour éviter les dépendances',
        correct: false
      }
    ]
  },
  quiz: {
    questions: [
      {
        question:
          'Quel pattern architectural regroupe les composants par niveau de complexité, des éléments de base aux pages complètes ?',
        options: [
          'Clean Architecture',
          'Feature-First Architecture',
          'Atomic Design',
          'Model-View-Controller (MVC)'
        ],
        answer: 2
      },
      {
        question:
          "Quelle approche est recommandée pour la gestion d'état dans les grandes applications Next.js ?",
        options: [
          "Utiliser uniquement useState pour tout l'état de l'application",
          "Combiner différentes solutions : useState/useReducer pour l'état local, Context pour l'état partagé, et des bibliothèques comme Redux ou React Query pour l'état global/distant",
          "Stocker tout l'état dans localStorage pour la persistance",
          "Éviter la gestion d'état côté client et tout gérer côté serveur"
        ],
        answer: 1
      },
      {
        question:
          "Qu'est-ce que l'architecture orientée domaine (DDD) dans le contexte d'une application Next.js ?",
        options: [
          'Une organisation du code par type technique (composants, hooks, services)',
          'Une séparation du code en couches horizontales (UI, logique métier, accès aux données)',
          "Une organisation du code par domaine métier avec séparation des préoccupations à l'intérieur de chaque domaine",
          'Une approche qui élimine le besoin de structurer les dossiers'
        ],
        answer: 2
      }
    ]
  },
  project: {
    title: "Refactorisation d'une application monolithique",
    description:
      'Refactorisez une application Next.js monolithique en utilisant une architecture orientée domaine.',
    tasks: [
      "Analysez la structure actuelle de l'application et identifiez les domaines métier principaux",
      'Créez une nouvelle structure de dossiers basée sur les domaines identifiés',
      'Réorganisez les composants, hooks et services existants selon cette nouvelle structure',
      'Implémentez des frontières claires entre les domaines avec des interfaces bien définies',
      "Ajoutez des tests pour valider que la refactorisation n'a pas introduit de régressions"
    ],
    starterCode: `// Structure actuelle (monolithique)
/*
/src
  /pages
    index.js
    products.js
    product/[id].js
    cart.js
    checkout.js
    account.js
  /components
    Header.js
    Footer.js
    ProductCard.js
    ProductList.js
    CartItem.js
    CheckoutForm.js
    AccountDetails.js
  /hooks
    useProducts.js
    useCart.js
    useCheckout.js
    useAuth.js
  /api
    products.js
    cart.js
    checkout.js
    auth.js
  /utils
    formatters.js
    validators.js
*/

// components/ProductCard.js
import { useCart } from '../hooks/useCart';
import { formatCurrency } from '../utils/formatters';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  
  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <div className="product-card-footer">
        <span>{formatCurrency(product.price)}</span>
        <button onClick={() => addToCart(product)}>Ajouter au panier</button>
      </div>
    </div>
  );
}

// hooks/useProducts.js
import { useState, useEffect } from 'react';

export function useProducts(filters) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    setLoading(true);
    fetch('/api/products?' + new URLSearchParams(filters))
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [filters]);
  
  return { products, loading, error };
}`,
    solutionCode: `// Nouvelle structure (architecture orientée domaine)
/*
/src
  /app (ou /pages pour Pages Router)
    layout.js
    page.js
    /products
      /[id]
        page.js
      page.js
    /cart
      page.js
    /checkout
      page.js
    /account
      page.js
  /domains
    /product
      /components
        ProductCard.js
        ProductDetails.js
        ProductList.js
      /hooks
        useProducts.js
      /services
        productService.js
      /types
        product.types.js
    /cart
      /components
        CartItem.js
        CartSummary.js
      /hooks
        useCart.js
      /services
        cartService.js
    /checkout
      /components
        CheckoutForm.js
        PaymentMethods.js
      /services
        checkoutService.js
    /account
      /components
        AccountDetails.js
        OrderHistory.js
      /hooks
        useAccount.js
  /shared
    /components
      Header.js
      Footer.js
      Button.js
      Input.js
    /hooks
      useLocalStorage.js
    /services
      apiClient.js
    /utils
      formatters.js
      validators.js
*/

// domains/product/types/product.types.js
export const ProductTypes = {
  // Types relatifs aux produits
};

// domains/product/services/productService.js
import { apiClient } from '@/shared/services/apiClient';

export const productService = {
  async getProducts(filters = {}) {
    const params = new URLSearchParams();
    
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined) {
        params.append(key, value);
      }
    }
    
    return apiClient.get(\`/products?\${params.toString()}\`);
  },
  
  async getProductById(id) {
    return apiClient.get(\`/products/\${id}\`);
  }
};

// shared/services/apiClient.js
export const apiClient = {
  async get(url) {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error('Erreur réseau');
    }
    return res.json();
  },
  
  async post(url, data) {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
      throw new Error('Erreur réseau');
    }
    
    return res.json();
  }
  // autres méthodes HTTP...
};

// domains/product/hooks/useProducts.js
import { useState, useEffect } from 'react';
import { productService } from '../services/productService';

export function useProducts(filters = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    
    productService.getProducts(filters)
      .then(data => {
        if (isMounted) {
          setProducts(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err);
          setLoading(false);
        }
      });
    
    return () => {
      isMounted = false;
    };
  }, [filters]);
  
  return { products, loading, error };
}

// domains/product/components/ProductCard.js
import { useCart } from '@/domains/cart/hooks/useCart';
import { formatCurrency } from '@/shared/utils/formatters';
import Button from '@/shared/components/Button';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="relative h-48">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
        <p className="mt-1 text-gray-600 line-clamp-2">{product.description}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-bold">{formatCurrency(product.price)}</span>
          <Button onClick={() => addToCart(product)}>Ajouter au panier</Button>
        </div>
      </div>
    </div>
  );
}

// domains/cart/hooks/useCart.js
import { useState, useEffect } from 'react';
import { useLocalStorage } from '@/shared/hooks/useLocalStorage';

export function useCart() {
  const [cart, setCart] = useLocalStorage('cart', []);
  
  const addToCart = (product, quantity = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      return [...prevCart, { ...product, quantity }];
    });
  };
  
  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };
  
  const updateQuantity = (productId, quantity) => {
    setCart(prevCart => 
      prevCart.map(item => 
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };
  
  const clearCart = () => {
    setCart([]);
  };
  
  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    itemCount: cart.reduce((total, item) => total + item.quantity, 0),
    totalPrice: cart.reduce((total, item) => total + item.price * item.quantity, 0),
  };
}

// app/products/page.js (ou pages/products.js pour Pages Router)
import { ProductList } from '@/domains/product/components/ProductList';
import { FilterSidebar } from '@/domains/product/components/FilterSidebar';

export default function ProductsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Nos produits</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-1/4">
          <FilterSidebar />
        </aside>
        
        <main className="w-full md:w-3/4">
          <ProductList />
        </main>
      </div>
    </div>
  );
}`
  }
}

export default lesson1

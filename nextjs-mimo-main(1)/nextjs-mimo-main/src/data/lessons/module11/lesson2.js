// src/data/lessons/module11/lesson2.js
const lesson2 = {
  id: '11-2',
  title: 'Design Patterns pour Next.js',
  description:
    'Maîtrisez les modèles de conception avancés pour développer des applications Next.js robustes et maintenables',
  difficulty: 'avancé',
  duration: 65,
  tags: [
    'Next.js',
    'Design Patterns',
    'Architecture',
    'React Patterns',
    'Bonnes pratiques'
  ],
  prerequisites: ['11-1', '6-1'],
  content: `
    <h2>Design Patterns pour Next.js</h2>
    <p>Les design patterns (modèles de conception) sont des solutions éprouvées à des problèmes récurrents en développement logiciel. Dans le contexte de Next.js, ces patterns aident à créer des applications plus robustes, maintenables et évolutives.</p>

    <h3>Patterns de composants React</h3>
    
    <h4>1. Component Composition</h4>
    <p>Privilégiez la composition de composants plutôt que l'héritage pour favoriser la réutilisation et la flexibilité.</p>
    <pre><code class="language-jsx">// Au lieu de créer des composants spécifiques pour chaque cas
// Créez des composants génériques composables
const Card = ({ header, content, footer, className }) => (
  <div className={\`card \${className}\`}>
    {header && <div className="card-header">{header}</div>}
    <div className="card-content">{content}</div>
    {footer && <div className="card-footer">{footer}</div>}
  </div>
);

// Utilisation
<Card 
  header={<h2>Titre</h2>}
  content={<p>Contenu</p>}
  footer={<button>Action</button>}
/>
    </code></pre>

    <h4>2. Render Props</h4>
    <p>Technique qui consiste à passer une fonction de rendu à un composant pour plus de flexibilité.</p>
    <pre><code class="language-jsx">const DataFetcher = ({ url, render }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url);
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [url]);
  
  return render({ data, loading, error });
};

// Utilisation
<DataFetcher 
  url="/api/products" 
  render={({ data, loading, error }) => (
    loading ? <Spinner /> : error ? <ErrorMessage error={error} /> : <ProductList products={data} />
  )} 
/>
    </code></pre>

    <h4>3. Compound Components</h4>
    <p>Créer un groupe de composants qui fonctionnent ensemble avec un état partagé.</p>
    <pre><code class="language-jsx">const Tabs = ({ children, defaultActiveTab }) => {
  const [activeTab, setActiveTab] = useState(defaultActiveTab);
  
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabsContext.Provider>
  );
};

Tabs.List = ({ children }) => <div className="tabs-list">{children}</div>;

Tabs.Tab = ({ id, children }) => {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  return (
    <button
      className={\`tab \${activeTab === id ? 'active' : ''}\`}
      onClick={() => setActiveTab(id)}
    >
      {children}
    </button>
  );
};

Tabs.Panel = ({ id, children }) => {
  const { activeTab } = useContext(TabsContext);
  if (activeTab !== id) return null;
  return <div className="tab-panel">{children}</div>;
};

// Utilisation
<Tabs defaultActiveTab="tab1">
  <Tabs.List>
    <Tabs.Tab id="tab1">Onglet 1</Tabs.Tab>
    <Tabs.Tab id="tab2">Onglet 2</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel id="tab1">Contenu de l'onglet 1</Tabs.Panel>
  <Tabs.Panel id="tab2">Contenu de l'onglet 2</Tabs.Panel>
</Tabs>
    </code></pre>

    <h4>4. Higher-Order Components (HOC)</h4>
    <p>Fonction qui prend un composant et retourne un nouveau composant avec des fonctionnalités supplémentaires.</p>
    <pre><code class="language-jsx">// HOC pour ajouter l'authentification
const withAuth = (Component) => {
  return function AuthenticatedComponent(props) {
    const router = useRouter();
    const { isAuthenticated, loading } = useAuth();
    
    useEffect(() => {
      if (!loading && !isAuthenticated) {
        router.push('/login');
      }
    }, [isAuthenticated, loading, router]);
    
    if (loading) return <LoadingSpinner />;
    if (!isAuthenticated) return null;
    
    return <Component {...props} />;
  };
};

// Utilisation
const UserProfile = ({ user }) => <div>Profile de {user.name}</div>;
const AuthenticatedUserProfile = withAuth(UserProfile);
    </code></pre>

    <h3>Patterns pour la gestion d'état</h3>
    
    <h4>1. Container/Presentational Pattern</h4>
    <p>Séparation des préoccupations entre les composants qui gèrent l'état/logique (containers) et ceux qui gèrent l'affichage (presentational).</p>
    <pre><code class="language-jsx">// Container component
const ProductListContainer = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const data = await productService.getProducts();
      setProducts(data);
      setLoading(false);
    };
    
    fetchProducts();
  }, []);
  
  return <ProductList products={products} loading={loading} />;
};

// Presentational component
const ProductList = ({ products, loading }) => {
  if (loading) return <div>Chargement...</div>;
  
  return (
    <div className="product-grid">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
    </code></pre>

    <h4>2. Custom Hooks</h4>
    <p>Extraire la logique d'état et d'effets dans des hooks réutilisables.</p>
    <pre><code class="language-jsx">// Custom hook pour la pagination
function usePagination(items, itemsPerPage = 10) {
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = Math.ceil(items.length / itemsPerPage);
  
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  }, [items, currentPage, itemsPerPage]);
  
  const goToPage = (page) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };
  
  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);
  
  return {
    currentPage,
    totalPages,
    currentItems,
    goToPage,
    nextPage,
    prevPage,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1
  };
}

// Utilisation
function ProductsPage() {
  const { data: products = [] } = useQuery('products', fetchProducts);
  const pagination = usePagination(products, 12);
  
  return (
    <div>
      <ProductGrid products={pagination.currentItems} />
      <Pagination 
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={pagination.goToPage}
      />
    </div>
  );
}
    </code></pre>

    <h4>3. Context + Reducer Pattern</h4>
    <p>Combinaison de Context API et useReducer pour une gestion d'état globale plus prévisible.</p>
    <pre><code class="language-jsx">// cartReducer.js
export const initialState = {
  items: [],
  totalItems: 0,
  totalPrice: 0
};

export function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(
        item => item.id === action.payload.id
      );
      
      let newItems;
      if (existingItemIndex > -1) {
        newItems = state.items.map((item, i) =>
          i === existingItemIndex
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      } else {
        newItems = [...state.items, { ...action.payload, quantity: 1 }];
      }
      
      return {
        ...state,
        items: newItems,
        totalItems: newItems.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: newItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      };
    }
    // Autres cas...
    default:
      return state;
  }
}

// CartContext.js
const CartContext = createContext();

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  
  const addItem = (product, quantity = 1) => {
    dispatch({ 
      type: 'ADD_ITEM', 
      payload: { ...product, quantity } 
    });
  };
  
  const removeItem = (productId) => {
    dispatch({ 
      type: 'REMOVE_ITEM', 
      payload: { id: productId } 
    });
  };
  
  return (
    <CartContext.Provider value={{ state, addItem, removeItem }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
    </code></pre>

    <h3>Patterns pour les données et la performance</h3>
    
    <h4>1. Server-Side Rendering (SSR) / Static Site Generation (SSG) Pattern</h4>
    <p>Utiliser les capacités de Next.js pour le rendu côté serveur et la génération statique de manière optimale.</p>
    <pre><code class="language-jsx">// SSG avec données dynamiques et ISR
export async function getStaticProps() {
  const products = await fetchFeaturedProducts();
  
  return {
    props: {
      products,
      timestamp: new Date().toISOString()
    },
    // Régénération toutes les 10 minutes
    revalidate: 600
  };
}

// SSG pour pages dynamiques
export async function getStaticPaths() {
  const products = await fetchPopularProducts();
  
  const paths = products.map(product => ({
    params: { slug: product.slug }
  }));
  
  return {
    paths,
    // Génération à la demande pour les autres pages
    fallback: 'blocking'
  };
}

// SSR pour contenu personnalisé
export async function getServerSideProps({ req, query }) {
  const userPreferences = extractUserPreferences(req);
  const products = await fetchRecommendedProducts(userPreferences, query);
  
  return {
    props: {
      products,
      userPreferences
    }
  };
}
    </code></pre>

    <h4>2. Data Fetching Pattern avec React Query / SWR</h4>
    <p>Utiliser des bibliothèques spécialisées pour une gestion efficace du cache et des requêtes.</p>
    <pre><code class="language-jsx">// services/api.js
export const fetchProducts = async (category) => {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  
  const res = await fetch(\`/api/products?\${params.toString()}\`);
  if (!res.ok) throw new Error('Erreur lors de la récupération des produits');
  
  return res.json();
};

// hooks/useProducts.js
import { useQuery, useMutation, useQueryClient } from 'react-query';
import * as api from '../services/api';

export function useProducts(category) {
  return useQuery(
    ['products', { category }],
    () => api.fetchProducts(category),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false
    }
  );
}

export function useAddProduct() {
  const queryClient = useQueryClient();
  
  return useMutation(api.addProduct, {
    // Optimistic update
    onMutate: async (newProduct) => {
      await queryClient.cancelQueries('products');
      
      const previousProducts = queryClient.getQueryData('products');
      
      queryClient.setQueryData('products', old => [
        ...old,
        { ...newProduct, id: 'temp-id' }
      ]);
      
      return { previousProducts };
    },
    
    onError: (err, newProduct, context) => {
      queryClient.setQueryData('products', context.previousProducts);
    },
    
    onSettled: () => {
      queryClient.invalidateQueries('products');
    }
  });
}
    </code></pre>

    <h4>3. Memoization Pattern</h4>
    <p>Utiliser React.memo, useMemo et useCallback pour éviter les rendus inutiles et optimiser les performances.</p>
    <pre><code class="language-jsx">// useMemo pour des calculs coûteux
const ProductList = ({ products, filters }) => {
  const filteredProducts = useMemo(() => {
    console.log('Filtering products');
    return products.filter(product => {
      if (filters.minPrice && product.price < filters.minPrice) return false;
      if (filters.maxPrice && product.price > filters.maxPrice) return false;
      if (filters.category && product.category !== filters.category) return false;
      return true;
    });
  }, [products, filters.minPrice, filters.maxPrice, filters.category]);
  
  return (
    <div className="product-grid">
      {filteredProducts.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

// useCallback pour les fonctions passées aux composants enfants
const ProductPage = () => {
  const [favorites, setFavorites] = useState([]);
  
  const addToFavorites = useCallback((product) => {
    setFavorites(prev => [...prev, product]);
  }, []);
  
  const removeFromFavorites = useCallback((productId) => {
    setFavorites(prev => prev.filter(p => p.id !== productId));
  }, []);
  
  return (
    <div>
      <ProductList 
        products={products}
        onAddToFavorites={addToFavorites}
        onRemoveFromFavorites={removeFromFavorites}
      />
    </div>
  );
};

// React.memo pour éviter les rendus inutiles de composants
const ProductCard = React.memo(({ product, onAddToFavorites }) => {
  console.log(\`Rendering product: \${product.name}\`);
  
  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <button onClick={() => onAddToFavorites(product)}>Ajouter aux favoris</button>
    </div>
  );
});
    </code></pre>
  `,
  example: {
    title:
      "Implementation d'un système de panier avec le Container/Presentational et Context+Reducer Pattern",
    code: `// contexts/cartContext.js
import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

// Actions
const ADD_ITEM = 'ADD_ITEM';
const REMOVE_ITEM = 'REMOVE_ITEM';
const UPDATE_QUANTITY = 'UPDATE_QUANTITY';
const CLEAR_CART = 'CLEAR_CART';

// État initial
const initialState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
};

// Reducer
function cartReducer(state, action) {
  switch (action.type) {
    case ADD_ITEM: {
      const existingItemIndex = state.items.findIndex(
        item => item.id === action.payload.id
      );
      
      let newItems;
      if (existingItemIndex > -1) {
        // L'item existe déjà, mettre à jour la quantité
        newItems = state.items.map((item, i) =>
          i === existingItemIndex
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      } else {
        // Nouvel item
        newItems = [...state.items, action.payload];
      }
      
      // Recalculer les totaux
      return {
        ...state,
        items: newItems,
        totalItems: newItems.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: newItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      };
    }
    
    case REMOVE_ITEM: {
      const newItems = state.items.filter(item => item.id !== action.payload.id);
      
      return {
        ...state,
        items: newItems,
        totalItems: newItems.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: newItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      };
    }
    
    case UPDATE_QUANTITY: {
      const { id, quantity } = action.payload;
      
      const newItems = state.items.map(item =>
        item.id === id ? { ...item, quantity } : item
      );
      
      return {
        ...state,
        items: newItems,
        totalItems: newItems.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: newItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      };
    }
    
    case CLEAR_CART:
      return initialState;
      
    default:
      return state;
  }
}

// Provider
export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  
  // Charger le panier depuis localStorage au montage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        
        // Charger chaque item individuellement pour s'assurer que le reducer recalcule correctement les totaux
        parsedCart.items.forEach(item => {
          dispatch({
            type: ADD_ITEM,
            payload: item
          });
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement du panier:', error);
    }
  }, []);
  
  // Sauvegarder le panier dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state));
  }, [state]);
  
  // Actions
  const addItem = (product, quantity = 1) => {
    dispatch({
      type: ADD_ITEM,
      payload: { ...product, quantity }
    });
  };
  
  const removeItem = (productId) => {
    dispatch({
      type: REMOVE_ITEM,
      payload: { id: productId }
    });
  };
  
  const updateQuantity = (productId, quantity) => {
    dispatch({
      type: UPDATE_QUANTITY,
      payload: { id: productId, quantity }
    });
  };
  
  const clearCart = () => {
    dispatch({ type: CLEAR_CART });
  };
  
  return (
    <CartContext.Provider
      value={{
        ...state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Hook personnalisé
export const useCart = () => useContext(CartContext);

// components/cart/CartContainer.js
import { useCart } from '../../contexts/cartContext';
import CartList from './CartList';
import CartSummary from './CartSummary';

// Container Component
export default function CartContainer() {
  const { items, totalItems, totalPrice, removeItem, updateQuantity, clearCart } = useCart();
  
  if (items.length === 0) {
    return <EmptyCart />;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Votre Panier ({totalItems})</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3">
          <CartList 
            items={items} 
            onUpdateQuantity={updateQuantity} 
            onRemoveItem={removeItem} 
          />
          <div className="mt-4">
            <button 
              onClick={clearCart}
              className="text-red-500 hover:text-red-700"
            >
              Vider le panier
            </button>
          </div>
        </div>
        <div className="lg:w-1/3">
          <CartSummary totalPrice={totalPrice} />
        </div>
      </div>
    </div>
  );
}

// components/cart/CartList.js (Presentational Component)
export default function CartList({ items, onUpdateQuantity, onRemoveItem }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">Produit</th>
            <th className="text-center py-2">Quantité</th>
            <th className="text-right py-2">Prix</th>
            <th className="text-right py-2">Total</th>
            <th className="w-8"></th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <CartItem
              key={item.id}
              item={item}
              onUpdateQuantity={onUpdateQuantity}
              onRemove={onRemoveItem}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// components/cart/CartItem.js (Presentational Component)
export default function CartItem({ item, onUpdateQuantity, onRemove }) {
  const handleQuantityChange = (e) => {
    const quantity = parseInt(e.target.value);
    if (quantity > 0) {
      onUpdateQuantity(item.id, quantity);
    }
  };
  
  return (
    <tr className="border-b">
      <td className="py-4">
        <div className="flex items-center">
          <img 
            src={item.image} 
            alt={item.name} 
            className="w-16 h-16 object-cover rounded mr-4" 
          />
          <span className="font-medium">{item.name}</span>
        </div>
      </td>
      <td className="py-4 text-center">
        <input
          type="number"
          min="1"
          value={item.quantity}
          onChange={handleQuantityChange}
          className="w-16 text-center border rounded p-1"
        />
      </td>
      <td className="py-4 text-right">{formatCurrency(item.price)}</td>
      <td className="py-4 text-right">{formatCurrency(item.price * item.quantity)}</td>
      <td className="py-4 text-right">
        <button 
          onClick={() => onRemove(item.id)}
          className="text-red-500 hover:text-red-700"
        >
          &times;
        </button>
      </td>
    </tr>
  );
}

// components/cart/CartSummary.js (Presentational Component)
export default function CartSummary({ totalPrice }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold mb-4">Résumé de la commande</h2>
      
      <div className="flex justify-between py-2 border-b">
        <span>Sous-total</span>
        <span>{formatCurrency(totalPrice)}</span>
      </div>
      
      <div className="flex justify-between py-2 border-b">
        <span>Frais de livraison</span>
        <span>{totalPrice > 50 ? 'Gratuit' : formatCurrency(5.99)}</span>
      </div>
      
      <div className="flex justify-between py-4 font-bold">
        <span>Total</span>
        <span>{formatCurrency(totalPrice > 50 ? totalPrice : totalPrice + 5.99)}</span>
      </div>
      
      <button 
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 mt-4"
      >
        Procéder au paiement
      </button>
    </div>
  );
}

// pages/_app.js
import { CartProvider } from '../contexts/cartContext';

function MyApp({ Component, pageProps }) {
  return (
    <CartProvider>
      <Component {...pageProps} />
    </CartProvider>
  );
}

// utils/format.js
export function formatCurrency(amount) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}`,
    explanation:
      "Cet exemple implémente un système de panier d'achat complet en utilisant plusieurs patterns de conception. Le Context+Reducer Pattern est utilisé pour gérer l'état global du panier avec des actions bien définies (ajouter, supprimer, mettre à jour, vider). Le système persiste le panier dans localStorage pour le conserver entre les visites. Le Container/Presentational Pattern est appliqué pour séparer la logique (CartContainer) de l'interface utilisateur (CartList, CartItem, CartSummary). Cette séparation rend les composants plus testables et réutilisables. Le hook personnalisé useCart permet d'accéder facilement au contexte du panier depuis n'importe quel composant."
  },
  exercise: {
    title: 'Choix du pattern approprié',
    description:
      'Pour chaque scénario, choisissez le design pattern le plus approprié.',
    options: [
      {
        id: 1,
        text: 'Pour créer un système où plusieurs composants partagent un état et des fonctionnalités communes (comme un menu déroulant avec des options), utilisez des Higher-Order Components',
        correct: false
      },
      {
        id: 2,
        text: "Pour séparer la logique de récupération des données de l'interface utilisateur dans une application de tableau de bord, utilisez le Container/Presentational Pattern",
        correct: true
      },
      {
        id: 3,
        text: "Pour une application avec de multiples sources de données et des mises à jour fréquentes, gérez tout l'état avec useState dans le composant racine",
        correct: false
      },
      {
        id: 4,
        text: "Pour optimiser les performances d'une liste avec des milliers d'éléments, évitez d'utiliser useMemo, React.memo et useCallback car ils ajoutent de la complexité",
        correct: false
      }
    ]
  },
  quiz: {
    questions: [
      {
        question:
          'Quel pattern est le plus approprié pour encapsuler la logique de récupération et de gestion de données dans des composants réutilisables ?',
        options: [
          'Render Props',
          'Custom Hooks',
          'Higher-Order Components',
          'Compound Components'
        ],
        answer: 1
      },
      {
        question:
          "Quelle est la principale différence entre le Context API et Redux pour la gestion d'état global ?",
        options: [
          'Redux ne fonctionne pas avec Next.js',
          'Context API est uniquement pour les petites applications',
          'Redux offre un middleware, des outils de débogage et un flux de données plus prévisible avec un store centralisé',
          'Context API nécessite des bibliothèques externes pour fonctionner'
        ],
        answer: 2
      },
      {
        question:
          'Pourquoi devrait-on utiliser useCallback pour les fonctions passées aux composants enfants ?',
        options: [
          'Pour éviter des rendus inutiles lorsque les composants enfants utilisent React.memo',
          "Pour accélérer l'exécution des fonctions",
          'Pour contourner les limitations de la Context API',
          "Pour permettre aux fonctions d'accéder à l'état global"
        ],
        answer: 0
      }
    ]
  },
  project: {
    title: 'Mini application de blog avec patterns avancés',
    description:
      "Créez une mini application de blog en utilisant différents design patterns pour gérer les articles, les commentaires et l'authentification.",
    tasks: [
      "Implémentez un système d'authentification avec le HOC withAuth et React Context",
      'Créez des composants de blog en utilisant le Container/Presentational Pattern',
      'Utilisez des custom hooks pour encapsuler la logique de récupération et de gestion des articles',
      'Implémentez un système de commentaires avec le Context+Reducer Pattern',
      'Optimisez les performances avec React.memo, useMemo et useCallback'
    ],
    starterCode: `// HOC withAuth.js
export function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    // TODO: Implémenter la logique d'authentification
    
    return <Component {...props} />;
  };
}

// contexts/AuthContext.js
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // TODO: Implémenter le contexte d'authentification
  
  return (
    <AuthContext.Provider value={{}}>
      {children}
    </AuthContext.Provider>
  );
}

// hooks/useBlogPosts.js
export function useBlogPosts() {
  // TODO: Implémenter un hook pour gérer les articles de blog
}

// components/blog/PostList.js
export default function PostList() {
  // TODO: Implémenter un composant presentational pour afficher les articles
}`,
    solutionCode: `// HOC withAuth.js
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const router = useRouter();
    const { user, loading } = useAuth();
    
    // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié
    React.useEffect(() => {
      if (!loading && !user) {
        router.replace('/login?redirect=' + router.asPath);
      }
    }, [user, loading, router]);
    
    // Afficher un spinner pendant la vérification de l'authentification
    if (loading) {
      return <LoadingSpinner />;
    }
    
    // Ne pas rendre le composant si l'utilisateur n'est pas authentifié
    if (!user) {
      return null;
    }
    
    // L'utilisateur est authentifié, rendre le composant
    return <Component {...props} />;
  };
}

// contexts/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Vérifie si l'utilisateur est déjà connecté au chargement
    async function loadUserFromLocalStorage() {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'utilisateur:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadUserFromLocalStorage();
  }, []);
  
  const login = async (email, password) => {
    setLoading(true);
    try {
      // Simulation d'un appel API
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) throw new Error('Échec de connexion');
      
      const userData = await response.json();
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };
  
  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

// contexts/BlogContext.js
import { createContext, useContext, useReducer } from 'react';

const BlogContext = createContext();

// Actions
const SET_POSTS = 'SET_POSTS';
const ADD_POST = 'ADD_POST';
const UPDATE_POST = 'UPDATE_POST';
const DELETE_POST = 'DELETE_POST';
const ADD_COMMENT = 'ADD_COMMENT';

// État initial
const initialState = {
  posts: [],
  loading: false,
  error: null
};

// Reducer
function blogReducer(state, action) {
  switch (action.type) {
    case SET_POSTS:
      return { ...state, posts: action.payload, loading: false, error: null };
    
    case ADD_POST:
      return { ...state, posts: [action.payload, ...state.posts] };
    
    case UPDATE_POST:
      return {
        ...state,
        posts: state.posts.map(post =>
          post.id === action.payload.id ? action.payload : post
        )
      };
    
    case DELETE_POST:
      return {
        ...state,
        posts: state.posts.filter(post => post.id !== action.payload.id)
      };
    
    case ADD_COMMENT:
      return {
        ...state,
        posts: state.posts.map(post =>
          post.id === action.payload.postId
            ? {
                ...post,
                comments: [...(post.comments || []), action.payload.comment]
              }
            : post
        )
      };
    
    default:
      return state;
  }
}

export function BlogProvider({ children }) {
  const [state, dispatch] = useReducer(blogReducer, initialState);
  
  // Actions
  const setPosts = (posts) => {
    dispatch({ type: SET_POSTS, payload: posts });
  };
  
  const addPost = (post) => {
    dispatch({ type: ADD_POST, payload: post });
  };
  
  const updatePost = (post) => {
    dispatch({ type: UPDATE_POST, payload: post });
  };
  
  const deletePost = (id) => {
    dispatch({ type: DELETE_POST, payload: { id } });
  };
  
  const addComment = (postId, comment) => {
    dispatch({
      type: ADD_COMMENT,
      payload: { postId, comment }
    });
  };
  
  return (
    <BlogContext.Provider
      value={{
        ...state,
        setPosts,
        addPost,
        updatePost,
        deletePost,
        addComment
      }}
    >
      {children}
    </BlogContext.Provider>
  );
}

export const useBlog = () => useContext(BlogContext);

// hooks/useBlogPosts.js
import { useState, useEffect } from 'react';
import { useBlog } from '../contexts/BlogContext';

export function useBlogPosts() {
  const { posts, setPosts } = useBlog();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);
        // Simulation d'un appel API
        const response = await fetch('/api/posts');
        
        if (!response.ok) throw new Error('Erreur lors de la récupération des articles');
        
        const data = await response.json();
        setPosts(data);
      } catch (err) {
        console.error('Erreur de chargement des posts:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchPosts();
  }, [setPosts]);
  
  return { posts, loading, error };
}

export function usePost(postId) {
  const { posts } = useBlog();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function fetchPost() {
      try {
        setLoading(true);
        
        // Vérifier si le post est déjà dans le contexte
        const existingPost = posts.find(p => p.id === postId);
        if (existingPost) {
          setPost(existingPost);
          setLoading(false);
          return;
        }
        
        // Sinon, récupérer depuis l'API
        const response = await fetch(\`/api/posts/\${postId}\`);
        
        if (!response.ok) throw new Error(\`Erreur lors de la récupération de l'article \${postId}\`);
        
        const data = await response.json();
        setPost(data);
      } catch (err) {
        console.error(\`Erreur de chargement du post \${postId}:\`, err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    if (postId) {
      fetchPost();
    }
  }, [postId, posts]);
  
  return { post, loading, error };
}

// components/blog/PostListContainer.js (Container Component)
import { useBlogPosts } from '../../hooks/useBlogPosts';
import PostList from './PostList';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorMessage from '../ui/ErrorMessage';

export default function PostListContainer() {
  const { posts, loading, error } = useBlogPosts();
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  
  return <PostList posts={posts} />;
}

// components/blog/PostList.js (Presentational Component)
import React from 'react';
import Link from 'next/link';

const PostList = React.memo(({ posts }) => {
  return (
    <div className="space-y-6">
      {posts.length === 0 ? (
        <p>Aucun article disponible.</p>
      ) : (
        posts.map(post => (
          <article key={post.id} className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-2xl font-bold mb-2">
              <Link href={\`/blog/\${post.id}\`} className="hover:text-blue-600">
                {post.title}
              </Link>
            </h2>
            <p className="text-gray-600 mb-4">
              Par {post.author.name} • {new Date(post.date).toLocaleDateString()}
            </p>
            <p className="mb-4">{post.excerpt}</p>
            <Link 
              href={\`/blog/\${post.id}\`}
              className="text-blue-600 hover:underline"
            >
              Lire la suite →
            </Link>
          </article>
        ))
      )}
    </div>
  );
});

PostList.displayName = 'PostList';

export default PostList;

// components/blog/Comments.js
import { useState, useMemo } from 'react';
import { useBlog } from '../../contexts/BlogContext';
import { useAuth } from '../../contexts/AuthContext';

export default function Comments({ postId, comments = [] }) {
  const { user } = useAuth();
  const { addComment } = useBlog();
  const [content, setContent] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim() || !user) return;
    
    const newComment = {
      id: Date.now().toString(),
      content,
      date: new Date().toISOString(),
      author: {
        id: user.id,
        name: user.name,
        avatar: user.avatar
      }
    };
    
    addComment(postId, newComment);
    setContent('');
  };
  
  // Utiliser useMemo pour éviter des calculs inutiles lors des re-rendus
  const sortedComments = useMemo(() => {
    return [...comments].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
  }, [comments]);
  
  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-4">Commentaires ({comments.length})</h3>
      
      {user ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Ajouter un commentaire..."
            className="w-full p-3 border rounded-lg resize-none focus:ring focus:ring-blue-200 focus:border-blue-500"
            rows={3}
            required
          />
          <button 
            type="submit" 
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            disabled={!content.trim()}
          >
            Publier
          </button>
        </form>
      ) : (
        <p className="mb-6 p-3 bg-gray-100 rounded-lg">
          <Link href="/login" className="text-blue-600 hover:underline">Connectez-vous</Link> pour ajouter un commentaire.
        </p>
      )}
      
      <div className="space-y-4">
        {sortedComments.map(comment => (
          <div key={comment.id} className="border-b pb-4">
            <div className="flex items-center mb-2">
              {comment.author.avatar && (
                <img 
                  src={comment.author.avatar} 
                  alt={comment.author.name} 
                  className="w-8 h-8 rounded-full mr-2"
                />
              )}
              <span className="font-medium">{comment.author.name}</span>
              <span className="text-gray-500 text-sm ml-2">
                {new Date(comment.date).toLocaleDateString()}
              </span>
            </div>
            <p>{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// pages/_app.js
import { AuthProvider } from '../contexts/AuthContext';
import { BlogProvider } from '../contexts/BlogContext';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <BlogProvider>
        <Component {...pageProps} />
      </BlogProvider>
    </AuthProvider>
  );
}

export default MyApp;

// pages/blog/index.js
import Layout from '../../components/layout/Layout';
import PostListContainer from '../../components/blog/PostListContainer';

export default function BlogPage() {
  return (
    <Layout title="Blog">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Notre Blog</h1>
        <PostListContainer />
      </div>
    </Layout>
  );
}`
  }
};

export default lesson2;

// src/data/lessons/module9/lesson2.js
const lesson2 = {
  id: '9-2',
  title: 'Tests unitaires avancés pour Next.js',
  description:
    'Maîtrisez les techniques de tests unitaires avancés pour les composants et les fonctions dans Next.js',
  difficulty: 'avancé',
  duration: 75,
  tags: [
    'Next.js',
    'Tests unitaires',
    'Jest',
    'React Testing Library',
    'Mocks'
  ],
  prerequisites: ['9-1'],
  content: `
    <h2>Tests unitaires avancés pour les applications Next.js</h2>
    <p>Les tests unitaires sont la fondation d'une stratégie de test efficace. Cette leçon couvre des techniques avancées pour tester tous les aspects de vos composants et fonctions Next.js.</p>

    <h3>Tests des composants avec état et effets</h3>
    <p>Les composants qui utilisent useState et useEffect peuvent être plus complexes à tester. Voici comment procéder :</p>
    <pre><code class="language-javascript">// Tests d'un composant avec état et effets
test('counter increments when button is clicked', async () => {
  render(<Counter initialCount={0} />);
  
  // Vérifier l'état initial
  expect(screen.getByText('Count: 0')).toBeInTheDocument();
  
  // Interagir avec le composant
  fireEvent.click(screen.getByRole('button', { name: /increment/i }));
  
  // Vérifier le nouvel état
  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});</code></pre>

    <h3>Mocking des hooks Next.js</h3>
    <p>Les hooks Next.js comme useRouter ou useSession doivent être mockés pour les tests unitaires :</p>
    <pre><code class="language-javascript">// Mocker useRouter
jest.mock('next/router', () => ({
  useRouter: () => ({
    route: '/example',
    pathname: '/example',
    query: { id: '123' },
    asPath: '/example?id=123',
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
}));

// Mocker useSession (de next-auth)
jest.mock('next-auth/react', () => ({
  useSession: () => ({ 
    data: { user: { name: 'Test User', email: 'user@test.com' } }, 
    status: 'authenticated' 
  }),
}));</code></pre>

    <h3>Tests des contextes React</h3>
    <p>Pour tester des composants qui utilisent des contextes, créez un wrapper personnalisé :</p>
    <pre><code class="language-javascript">// Test avec un fournisseur de contexte
function renderWithThemeContext(ui, { theme = 'light', ...options } = {}) {
  const Wrapper = ({ children }) => (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
  
  return render(ui, { wrapper: Wrapper, ...options });
}

test('component renders with theme context', () => {
  renderWithThemeContext(<ThemedButton />, { theme: 'dark' });
  // ... assertions
});</code></pre>

    <h3>Tests des composants avec des formulaires</h3>
    <p>Les formulaires nécessitent une attention particulière pour simuler la saisie et la soumission :</p>
    <pre><code class="language-javascript">test('form submission works correctly', async () => {
  const handleSubmit = jest.fn();
  render(<LoginForm onSubmit={handleSubmit} />);
  
  // Remplir les champs
  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: 'user@example.com' },
  });
  
  fireEvent.change(screen.getByLabelText(/password/i), {
    target: { value: 'password123' },
  });
  
  // Soumettre le formulaire
  fireEvent.click(screen.getByRole('button', { name: /login/i }));
  
  // Vérifier que la fonction onSubmit a été appelée avec les bonnes valeurs
  expect(handleSubmit).toHaveBeenCalledWith({
    email: 'user@example.com',
    password: 'password123',
  });
});</code></pre>

    <h3>Tests des composants asynchrones</h3>
    <p>Pour les composants qui chargent des données de manière asynchrone, utilisez waitFor et findBy :</p>
    <pre><code class="language-javascript">test('async component loads data correctly', async () => {
  // Mocker la fonction fetch
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({ data: 'test data' }),
    })
  );
  
  render(<AsyncComponent />);
  
  // Vérifier l'état de chargement
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
  
  // Attendre que les données soient chargées
  const dataElement = await screen.findByText(/test data/i);
  expect(dataElement).toBeInTheDocument();
});</code></pre>
  `,
  example: {
    title: "Test d'un composant avec useRouter et useSession",
    code: `// components/Profile.js
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

export default function Profile() {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/login');
    },
  });

  if (status === 'loading') {
    return <div>Chargement...</div>;
  }

  return (
    <div>
      <h1>Profil de {session.user.name}</h1>
      <p>Email: {session.user.email}</p>
      <button onClick={() => router.push('/dashboard')}>
        Retour au tableau de bord
      </button>
    </div>
  );
}

// __tests__/Profile.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import Profile from '../components/Profile';

// Mocker next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mocker next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: {
        name: 'John Doe',
        email: 'john@example.com',
      },
    },
    status: 'authenticated',
  }),
}));

describe('Profile Component', () => {
  it('renders user profile correctly', () => {
    render(<Profile />);
    
    // Vérifier que le nom est affiché
    expect(screen.getByText(/profil de john doe/i)).toBeInTheDocument();
    
    // Vérifier que l'email est affiché
    expect(screen.getByText(/email: john@example.com/i)).toBeInTheDocument();
  });

  it('navigates to dashboard when button is clicked', () => {
    const mockPush = jest.fn();
    
    // Override la fonction push mockée pour ce test
    require('next/router').useRouter.mockImplementation(() => ({
      push: mockPush,
    }));
    
    render(<Profile />);
    
    // Cliquer sur le bouton
    fireEvent.click(screen.getByText(/retour au tableau de bord/i));
    
    // Vérifier que la navigation a eu lieu
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });
});`,
    explanation:
      "Cet exemple montre comment tester un composant qui utilise à la fois useRouter et useSession. Nous utilisons jest.mock pour simuler le comportement de ces hooks, ce qui nous permet de tester notre composant sans dépendances externes. Notez comment nous avons également remplacé l'implémentation de useRouter.push pour vérifier qu'elle est appelée avec les bons arguments."
  },
  exercise: {
    title: 'Tester un composant avec état et contexte',
    description:
      "Écrivez des tests unitaires pour un composant ThemeSwitcher qui utilise le contexte ThemeContext et change le thème lorsqu'on clique sur un bouton.",
    options: [
      {
        id: 1,
        text: 'Créer un wrapper personnalisé avec ThemeContext.Provider',
        correct: true
      },
      {
        id: 2,
        text: "Utiliser act() pour les modifications d'état",
        correct: true
      },
      {
        id: 3,
        text: 'Vérifier que la valeur du contexte est mise à jour après le clic',
        correct: true
      },
      {
        id: 4,
        text: 'Utiliser fireEvent.click pour simuler le clic sur le bouton',
        correct: true
      },
      {
        id: 5,
        text: 'Importer directement le contexte pour le modifier dans le test',
        correct: false
      },
      {
        id: 6,
        text: "Attendre le prochain tick d'animation avec setTimeout",
        correct: false
      },
      {
        id: 7,
        text: 'Utiliser getAllByRole pour trouver tous les boutons',
        correct: false
      },
      {
        id: 8,
        text: 'Utiliser un mock pour la fonction toggleTheme du contexte',
        correct: true
      }
    ],
    type: 'multiple'
  },
  quiz: {
    title: 'Quiz sur les tests unitaires avancés',
    questions: [
      {
        question:
          'Quelle méthode devriez-vous utiliser pour des assertions asynchrones dans React Testing Library ?',
        options: ['expect.async', 'waitFor', 'setTimeout', 'await.assertion'],
        correctAnswer: 'waitFor'
      },
      {
        question:
          "Comment devriez-vous tester un composant qui effectue un appel d'API ?",
        options: [
          'Utiliser un vrai serveur API',
          'Mocker la fonction fetch ou axios',
          'Désactiver les appels API dans les tests',
          'Ignorer le test des composants avec des appels API'
        ],
        correctAnswer: 'Mocker la fonction fetch ou axios'
      },
      {
        question:
          'Quelle est la meilleure pratique pour tester un composant qui utilise un contexte React ?',
        options: [
          "Mocker directement l'objet React.createContext",
          'Créer un wrapper personnalisé avec le Provider',
          'Modifier les valeurs du contexte global',
          'Éviter de tester les composants qui utilisent des contextes'
        ],
        correctAnswer: 'Créer un wrapper personnalisé avec le Provider'
      },
      {
        question:
          'Comment tester un composant qui utilise window.localStorage ?',
        options: [
          'Créer un vrai localStorage dans le test',
          'Utiliser uniquement des tests E2E pour les composants avec localStorage',
          "Mocker l'API localStorage dans l'environnement de test",
          'Désactiver le stockage local dans les tests'
        ],
        correctAnswer: "Mocker l'API localStorage dans l'environnement de test"
      },
      {
        question:
          "Quelle méthode de RTL est préférable pour rechercher un élément qui n'existe pas initialement mais apparaît après une action asynchrone ?",
        options: ['getByText', 'queryByText', 'findByText', 'getAllByText'],
        correctAnswer: 'findByText'
      }
    ]
  },
  project: {
    title: "Test unitaire d'un système de panier d'achat",
    description:
      "Développez et testez un système de panier d'achat avec React et Next.js, en utilisant Context API pour la gestion de l'état et les tests unitaires avancés pour valider le fonctionnement.",
    initialCode: `// CartContext.js
import { createContext, useReducer, useContext } from 'react';

// Créez le contexte et les fonctions pour gérer le panier

// CartItem.js
// Créez un composant pour afficher un élément du panier

// __tests__/CartContext.test.js
// Écrivez des tests pour le contexte et les fonctions du panier`,
    solution: `// CartContext.js
import { createContext, useReducer, useContext } from 'react';

// Action types
const ADD_TO_CART = 'ADD_TO_CART';
const REMOVE_FROM_CART = 'REMOVE_FROM_CART';
const UPDATE_QUANTITY = 'UPDATE_QUANTITY';
const CLEAR_CART = 'CLEAR_CART';

// Reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case ADD_TO_CART:
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }],
      };
    case REMOVE_FROM_CART:
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
      };
    case UPDATE_QUANTITY:
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    case CLEAR_CART:
      return {
        ...state,
        items: [],
      };
    default:
      return state;
  }
};

// Context
const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  const addToCart = (product) => {
    dispatch({ type: ADD_TO_CART, payload: product });
  };

  const removeFromCart = (productId) => {
    dispatch({ type: REMOVE_FROM_CART, payload: productId });
  };

  const updateQuantity = (productId, quantity) => {
    dispatch({
      type: UPDATE_QUANTITY,
      payload: { id: productId, quantity },
    });
  };

  const clearCart = () => {
    dispatch({ type: CLEAR_CART });
  };

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

// CartItem.js
import { useCart } from './CartContext';

export default function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCart();

  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value, 10);
    if (newQuantity > 0) {
      updateQuantity(item.id, newQuantity);
    }
  };

  return (
    <div className="flex justify-between items-center p-4 border-b">
      <div className="flex-1">
        <h3 className="font-medium">{item.name}</h3>
        <p className="text-gray-600">{item.price.toFixed(2)} €</p>
      </div>
      <div className="flex items-center">
        <input
          type="number"
          min="1"
          value={item.quantity}
          onChange={handleQuantityChange}
          className="w-16 p-1 border rounded"
        />
        <button
          onClick={() => removeFromCart(item.id)}
          className="ml-2 p-1 text-red-500"
          aria-label="Supprimer du panier"
        >
          &times;
        </button>
      </div>
    </div>
  );
}

// __tests__/CartContext.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import { CartProvider, useCart } from '../CartContext';
import CartItem from '../CartItem';

// Composant de test pour accéder au contexte
function TestComponent() {
  const { items, addToCart, clearCart } = useCart();
  
  return (
    <div>
      <div data-testid="item-count">{items.length}</div>
      <button 
        onClick={() => addToCart({ id: 1, name: 'Test Product', price: 19.99 })}
      >
        Add Product
      </button>
      <button onClick={clearCart}>Clear Cart</button>
      <div>
        {items.map(item => (
          <CartItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

describe('Cart Context', () => {
  it('starts with an empty cart', () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );
    
    expect(screen.getByTestId('item-count').textContent).toBe('0');
  });

  it('adds products to cart', () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );
    
    fireEvent.click(screen.getByText('Add Product'));
    expect(screen.getByTestId('item-count').textContent).toBe('1');
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    
    // Add the same product again (should update quantity)
    fireEvent.click(screen.getByText('Add Product'));
    expect(screen.getByTestId('item-count').textContent).toBe('1');
  });

  it('updates quantity', () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );
    
    // Add product to cart
    fireEvent.click(screen.getByText('Add Product'));
    
    // Find the quantity input and update it
    const quantityInput = screen.getByRole('spinbutton');
    fireEvent.change(quantityInput, { target: { value: '3' } });
    
    expect(quantityInput.value).toBe('3');
  });

  it('removes products from cart', () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );
    
    // Add product to cart
    fireEvent.click(screen.getByText('Add Product'));
    
    // Find the remove button and click it
    const removeButton = screen.getByLabelText('Supprimer du panier');
    fireEvent.click(removeButton);
    
    expect(screen.getByTestId('item-count').textContent).toBe('0');
  });

  it('clears the cart', () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );
    
    // Add product to cart
    fireEvent.click(screen.getByText('Add Product'));
    
    // Clear the cart
    fireEvent.click(screen.getByText('Clear Cart'));
    
    expect(screen.getByTestId('item-count').textContent).toBe('0');
  });
});`
  },
  hasExercise: true,
  hasQuiz: true,
  hasProject: true
}

export default lesson2

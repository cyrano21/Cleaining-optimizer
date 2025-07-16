// src/data/lessons/module4/lesson3.js
const lesson3 = {
  id: '4-3',
  title: 'Patterns React Avancés : Custom Hooks et Compound Components',
  description:
    'Maîtrisez les patterns React avancés pour créer des composants réutilisables et maintenables.',
  difficulty: 'avancé',
  duration: 60,
  tags: [
    'React',
    'Custom Hooks',
    'Compound Components',
    'Patterns',
    'Architecture'
  ],
  prerequisites: ['4-1', '4-2'], // Dépend des hooks avancés et des formulaires
  content: [
    {
      type: 'text',
      content: `## Patterns React Avancés

Dans cette leçon, nous allons explorer deux patterns React puissants qui vous aideront à créer des composants plus flexibles et réutilisables : les **Custom Hooks** et les **Compound Components**.

Ces patterns sont essentiels pour construire des applications Next.js maintenables et scalables.`
    },
    {
      type: 'text',
      content: `## Custom Hooks

Les Custom Hooks permettent d'extraire la logique des composants dans des fonctions réutilisables. Ils suivent les mêmes règles que les hooks React natifs et permettent de partager de la logique entre plusieurs composants.

### Pourquoi utiliser les Custom Hooks ?

- **Réutilisabilité** : Partager la logique entre plusieurs composants
- **Séparation des préoccupations** : Séparer la logique métier de l'affichage
- **Testabilité** : Tester la logique indépendamment des composants
- **Lisibilité** : Simplifier les composants en extrayant la logique complexe`
    },
    {
      type: 'code',
      language: 'javascript',
      content: `// hooks/useApi.js
import { useState, useEffect } from 'react';

export function useApi(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(\`Erreur HTTP: \${response.status}\`);
        }
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (url) {
      fetchData();
    }
  }, [url]);

  const refetch = () => {
    if (url) {
      setLoading(true);
      setError(null);
      fetchData();
    }
  };

  return { data, loading, error, refetch };
}`
    },
    {
      type: 'code',
      language: 'javascript',
      content: `// hooks/useLocalStorage.js
import { useState, useEffect } from 'react';

export function useLocalStorage(key, initialValue) {
  // Fonction pour récupérer la valeur depuis le localStorage
  const getStoredValue = () => {
    try {
      if (typeof window !== 'undefined') {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : initialValue;
      }
      return initialValue;
    } catch (error) {
      console.warn(\`Erreur lors de la lecture du localStorage pour la clé "\${key}":\`, error);
      return initialValue;
    }
  };

  const [storedValue, setStoredValue] = useState(getStoredValue);

  // Fonction pour sauvegarder dans le localStorage
  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(\`Erreur lors de l'écriture dans le localStorage pour la clé "\${key}":\`, error);
    }
  };

  // Synchroniser avec les changements du localStorage dans d'autres onglets
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        setStoredValue(JSON.parse(e.newValue));
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, [key]);

  return [storedValue, setValue];
}`
    },
    {
      type: 'text',
      content: `## Utilisation des Custom Hooks

Voici comment utiliser les custom hooks que nous avons créés dans des composants Next.js :`
    },
    {
      type: 'code',
      language: 'javascript',
      content: `// components/UsersList.jsx
'use client';
import { useApi } from '../hooks/useApi';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function UsersList() {
  const { data: users, loading, error, refetch } = useApi('/api/users');
  const [favorites, setFavorites] = useLocalStorage('favorite-users', []);

  const toggleFavorite = (userId) => {
    setFavorites(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  if (loading) return <div className="p-4">Chargement des utilisateurs...</div>;
  if (error) return (
    <div className="p-4 text-red-600">
      <p>Erreur: {error}</p>
      <button 
        onClick={refetch}
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Réessayer
      </button>
    </div>
  );

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Liste des Utilisateurs</h2>
      <div className="grid gap-4">
        {users?.map(user => (
          <div 
            key={user.id} 
            className="border rounded-lg p-4 flex justify-between items-center"
          >
            <div>
              <h3 className="font-semibold">{user.name}</h3>
              <p className="text-gray-600">{user.email}</p>
            </div>
            <button
              onClick={() => toggleFavorite(user.id)}
              className={\`px-3 py-1 rounded \${
                favorites.includes(user.id)
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }\`}
            >
              {favorites.includes(user.id) ? '★' : '☆'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}`
    },
    {
      type: 'text',
      content: `## Compound Components

Le pattern Compound Components permet de créer des composants qui travaillent ensemble pour former une interface cohérente. Ce pattern est particulièrement utile pour créer des composants d'interface flexibles et composables.

### Avantages des Compound Components

- **Flexibilité** : L'utilisateur peut composer l'interface selon ses besoins
- **Encapsulation** : La logique partagée est gérée par le composant parent
- **API claire** : Interface intuitive et déclarative
- **Réutilisabilité** : Composants modulaires et réutilisables`
    },
    {
      type: 'code',
      language: 'javascript',
      content: `// components/Modal.jsx
'use client';
import { createContext, useContext, useState } from 'react';
import { createPortal } from 'react-dom';

// Contexte pour partager l'état entre les composants
const ModalContext = createContext();

const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('Les composants Modal doivent être utilisés dans un Modal.Root');
  }
  return context;
};

// Composant racine qui gère l'état global
const Modal = ({ children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(!isOpen);

  return (
    <ModalContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
    </ModalContext.Provider>
  );
};

// Composant Trigger qui ouvre/ferme la modal
const ModalTrigger = ({ children, className = '' }) => {
  const { toggle } = useModal();
  
  return (
    <button onClick={toggle} className={className}>
      {children}
    </button>
  );
};

// Composant Content qui affiche le contenu de la modal
const ModalContent = ({ children, className = '' }) => {
  const { isOpen, close } = useModal();

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50" 
        onClick={close}
      />
      
      {/* Modal Content */}
      <div className={\`relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4 \${className}\`}>
        {children}
      </div>
    </div>,
    document.body
  );
};

// Composant Header pour l'en-tête de la modal
const ModalHeader = ({ children, className = '' }) => (
  <div className={\`px-6 py-4 border-b border-gray-200 \${className}\`}>
    {children}
  </div>
);

// Composant Body pour le contenu principal
const ModalBody = ({ children, className = '' }) => (
  <div className={\`px-6 py-4 \${className}\`}>
    {children}
  </div>
);

// Composant Footer pour les actions
const ModalFooter = ({ children, className = '' }) => (
  <div className={\`px-6 py-4 border-t border-gray-200 flex justify-end space-x-2 \${className}\`}>
    {children}
  </div>
);

// Composant Close pour fermer la modal
const ModalClose = ({ children, className = '' }) => {
  const { close } = useModal();
  
  return (
    <button onClick={close} className={className}>
      {children}
    </button>
  );
};

// Export des composants avec une API claire
Modal.Trigger = ModalTrigger;
Modal.Content = ModalContent;
Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;
Modal.Close = ModalClose;

export default Modal;`
    },
    {
      type: 'text',
      content: `## Utilisation des Compound Components

Voici comment utiliser notre composant Modal avec l'API Compound Components :`
    },
    {
      type: 'code',
      language: 'javascript',
      content: `// components/UserProfile.jsx
'use client';
import Modal from './Modal';

export default function UserProfile({ user }) {
  const handleDeleteUser = () => {
    // Logique de suppression
    console.log('Suppression de l\\'utilisateur', user.id);
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-semibold">{user.name}</h3>
      <p className="text-gray-600">{user.email}</p>
      
      <div className="mt-4 space-x-2">
        {/* Modal de confirmation simple */}
        <Modal>
          <Modal.Trigger className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
            Supprimer
          </Modal.Trigger>
          
          <Modal.Content>
            <Modal.Header>
              <h2 className="text-xl font-semibold">Confirmer la suppression</h2>
            </Modal.Header>
            
            <Modal.Body>
              <p>Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{user.name}</strong> ?</p>
              <p className="text-sm text-gray-500 mt-2">Cette action est irréversible.</p>
            </Modal.Body>
            
            <Modal.Footer>
              <Modal.Close className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
                Annuler
              </Modal.Close>
              <button 
                onClick={handleDeleteUser}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Supprimer
              </button>
            </Modal.Footer>
          </Modal.Content>
        </Modal>

        {/* Modal d'édition plus complexe */}
        <Modal>
          <Modal.Trigger className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Modifier
          </Modal.Trigger>
          
          <Modal.Content className="max-w-lg">
            <Modal.Header>
              <h2 className="text-xl font-semibold">Modifier l'utilisateur</h2>
            </Modal.Header>
            
            <Modal.Body>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom</label>
                  <input 
                    type="text" 
                    defaultValue={user.name}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input 
                    type="email" 
                    defaultValue={user.email}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </form>
            </Modal.Body>
            
            <Modal.Footer>
              <Modal.Close className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
                Annuler
              </Modal.Close>
              <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Sauvegarder
              </button>
            </Modal.Footer>
          </Modal.Content>
        </Modal>
      </div>
    </div>
  );
}`
    },
    {
      type: 'text',
      content: `## Autres Patterns React Avancés

### Render Props Pattern

Le pattern Render Props consiste à passer une fonction comme prop qui retourne un élément React :

\`\`\`javascript
// Hook avec render prop
function DataFetcher({ url, render }) {
  const { data, loading, error } = useApi(url);
  return render({ data, loading, error });
}

// Utilisation
<DataFetcher 
  url="/api/users" 
  render={({ data, loading, error }) => (
    loading ? <Spinner /> : <UsersList users={data} />
  )}
/>
\`\`\`

### Higher-Order Components (HOC)

Les HOC sont des fonctions qui prennent un composant et retournent un nouveau composant avec des fonctionnalités ajoutées :

\`\`\`javascript
function withAuth(WrappedComponent) {
  return function AuthenticatedComponent(props) {
    const { data: session, status } = useSession();
    
    if (status === 'loading') return <div>Chargement...</div>;
    if (!session) return <div>Accès refusé</div>;
    
    return <WrappedComponent {...props} session={session} />;
  };
}

// Utilisation
const ProtectedDashboard = withAuth(Dashboard);
\`\`\`
`
    },
    {
      type: 'text',
      content: `## Exercice Pratique

Créez un composant \`Accordion\` en utilisant le pattern Compound Components avec les fonctionnalités suivantes :

1. **Accordion.Root** : Composant racine qui gère l'état
2. **Accordion.Item** : Un élément d'accordéon
3. **Accordion.Trigger** : Bouton pour ouvrir/fermer un élément
4. **Accordion.Content** : Contenu qui s'affiche/se cache

Le composant doit permettre :
- D'avoir plusieurs éléments ouverts simultanément ou un seul à la fois
- Des animations de transition fluides
- Une API flexible et intuitive

### Bonus

Créez également un custom hook \`useAccordion\` qui peut être utilisé indépendamment du composant pour gérer la logique d'accordéon dans d'autres contextes.`
    }
  ],
  quiz: {
    questions: [
      {
        id: 'q1',
        question:
          'Quelle est la principale différence entre un Custom Hook et un composant React ?',
        options: [
          "Un Custom Hook peut utiliser d'autres hooks, pas un composant",
          'Un Custom Hook retourne de la logique/des valeurs, un composant retourne du JSX',
          "Un Custom Hook est plus performant qu'un composant",
          "Il n'y a pas de différence significative"
        ],
        correctAnswer: 1,
        explanation:
          "Un Custom Hook retourne des valeurs et de la logique réutilisables, tandis qu'un composant retourne du JSX pour l'affichage."
      },
      {
        id: 'q2',
        question:
          "Dans le pattern Compound Components, comment les composants enfants accèdent-ils à l'état partagé ?",
        options: [
          'Par des props passées directement',
          'Par un Context React',
          'Par des variables globales',
          'Par le localStorage'
        ],
        correctAnswer: 1,
        explanation:
          "Le pattern Compound Components utilise généralement React Context pour partager l'état entre les composants enfants."
      },
      {
        id: 'q3',
        question:
          "Quel est l'avantage principal du pattern Compound Components ?",
        options: [
          'Améliore les performances',
          'Réduit la taille du bundle',
          'Offre une API flexible et composable',
          'Simplifie le code'
        ],
        correctAnswer: 2,
        explanation:
          "Le principal avantage est de fournir une API flexible qui permet aux développeurs de composer l'interface selon leurs besoins spécifiques."
      }
    ]
  },
  project: {
    title: 'Système de Notifications avec Patterns Avancés',
    description:
      'Créez un système de notifications complet en utilisant les patterns Custom Hooks et Compound Components.',
    requirements: [
      "Créer un custom hook `useNotifications` pour gérer l'état des notifications",
      'Implémenter un composant `NotificationProvider` avec Context',
      'Créer des Compound Components pour différents types de notifications',
      'Ajouter des fonctionnalités : auto-dismiss, positions, animations',
      'Persister les notifications avec useLocalStorage',
      'Tester le système avec différents scénarios'
    ],
    hints: [
      'Utilisez useReducer pour gérer les actions complexes (ajouter, supprimer, marquer comme lu)',
      'Implémentez des animations CSS ou avec Framer Motion',
      'Créez des types de notifications : success, error, warning, info',
      "Permettez la personnalisation des durées d'affichage",
      'Ajoutez des actions personnalisées dans les notifications'
    ]
  }
}

export default lesson3

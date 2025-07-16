// src/data/lessons/module4/lesson1.js
const lesson1 = {
  id: '4-1',
  title: 'React Hooks Avancés',
  description: 'Maîtrisez useReducer, useCallback, useMemo pour optimiser vos composants React.',
  difficulty: 'avancé',
  duration: 40,
  tags: ['React', 'Hooks', 'Performance', 'useReducer', 'useCallback', 'useMemo'],
  prerequisites: ['3-2'], // Dépend des hooks de base
  content: [
    {
      type: 'text',
      content: `## Introduction aux Hooks Avancés
Dans cette leçon, nous allons explorer trois hooks React puissants qui vous aideront à gérer des états complexes et à optimiser les performances de vos applications : \`useReducer\`, \`useCallback\`, et \`useMemo\`.`
    },
    {
      type: 'text',
      content: '## useReducer\n\n`useReducer` est une alternative à `useState` pour gérer des logiques d\'état plus complexes. Il est particulièrement utile lorsque l\'état a plusieurs sous-valeurs ou lorsque le prochain état dépend du précédent de manière complexe. Il suit un modèle similaire à Redux avec un *reducer* et des *actions*.'
    },
    {
      type: 'code',
      language: 'javascript',
      content: `// Signature de useReducer
const [state, dispatch] = useReducer(reducer, initialState, initFunction?);

// reducer: (state, action) => newState
// initialState: la valeur initiale de l'état
// initFunction (optionnel): une fonction pour calculer l'état initial de manière paresseuse`
    },
    {
      type: 'text',
      content: '## useCallback\n\n`useCallback` est un hook qui mémorise une fonction. Cela signifie qu\'il retourne une version mémorisée de la fonction callback qui ne change que si l\'une de ses dépendances a changé. C\'est particulièrement utile pour optimiser les composants enfants qui reçoivent des callbacks en props, car cela évite des re-renderings inutiles si la fonction n\'a pas réellement changé (prévention des problèmes de référentielle égalité).'
    },
    {
      type: 'code',
      language: 'javascript',
      content: `// Signature de useCallback
const memoizedCallback = useCallback(
  () => {
    // logique de la fonction utilisant a et b
    doSomething(a, b);
  },
  [a, b], // Tableau de dépendances
);`
    },
    {
      type: 'text',
      content: '## useMemo\n\n`useMemo` est similaire à `useCallback`, mais au lieu de mémoriser une fonction, il mémorise une *valeur calculée*. Il exécute une fonction et mémorise son résultat. Le recalcul n\'est effectué que si l\'une des dépendances a changé. C\'est utile pour les calculs coûteux en ressources afin d\'éviter de les refaire à chaque rendu.'
    },
    {
      type: 'code',
      language: 'javascript',
      content: `// Signature de useMemo
const memoizedValue = useMemo(
  () => computeExpensiveValue(a, b),
  [a, b] // Tableau de dépendances
);`
    }
  ],
  example: {
    title: 'useReducer en action : Un compteur amélioré',
    code: `import React, { useReducer } from 'react';

const initialState = { count: 0, step: 1 };

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + state.step };
    case 'decrement':
      return { ...state, count: state.count - state.step };
    case 'reset':
      return { ...initialState, step: state.step }; // Conserve le step actuel au reset
    case 'setStep':
      return { ...state, step: action.payload };
    default:
      throw new Error('Action non supportée: ' + action.type);
  }
}

export default function AdvancedCounter() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', textAlign: 'center', marginTop: '20px' }}>
      <p style={{ fontSize: '24px', fontWeight: 'bold' }}>Compteur: {state.count}</p>
      <div style={{ margin: '10px 0' }}>
        <label htmlFor="step">Pas : </label>
        <input
          id="step"
          type="number"
          value={state.step}
          onChange={(e) => dispatch({ type: 'setStep', payload: Number(e.target.value) })}
          style={{ padding: '5px', marginRight: '10px' }}
        />
      </div>
      <button style={buttonStyle} onClick={() => dispatch({ type: 'increment' })}>Incrémenter</button>
      <button style={buttonStyle} onClick={() => dispatch({ type: 'decrement' })}>Décrémenter</button>
      <button style={buttonStyle} onClick={() => dispatch({ type: 'reset' })}>Réinitialiser</button>
    </div>
  );
}

const buttonStyle = {
  padding: '10px 15px',
  margin: '0 5px',
  fontSize: '16px',
  cursor: 'pointer',
  border: '1px solid #ccc',
  borderRadius: '4px',
  backgroundColor: '#f0f0f0'
};

// Pour l'utiliser: <AdvancedCounter />`,
    explanation: 'Ce composant utilise useReducer pour gérer un compteur avec des actions pour incrémenter, décrémenter, réinitialiser, et changer le pas de comptage.'
  },
  exercise: { /* ... (l'exercice existant est bon) ... */
    title: 'Implémenter un gestionnaire de tâches avec useReducer',
    description: 'Créez un gestionnaire de tâches simple en utilisant useReducer pour gérer les opérations d\'ajout, de suppression et de basculement d\'état des tâches.',
    initialCode: `// components/TodoList.js
import React, { useReducer } from 'react';

const initialState = {
  todos: [],
  input: ''
};

// TODO: Définir le reducer
function reducer(state, action) {
  switch (action.type) {
    case 'SET_INPUT':
      // TODO: Mettre à jour la valeur de l'input
      return state;
    case 'ADD_TODO':
      // TODO: Ajouter une nouvelle tâche si l'input n'est pas vide
      // N'oubliez pas de générer un id unique et de réinitialiser l'input
      return state;
    case 'TOGGLE_TODO':
      // TODO: Basculer l'état 'completed' d'une tâche par son id (action.payload)
      return state;
    case 'DELETE_TODO':
      // TODO: Supprimer une tâche par son id (action.payload)
      return state;
    default:
      return state;
  }
}

export default function TodoList() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const handleAddTodo = () => {
    if (state.input.trim()) {
      dispatch({ type: 'ADD_TODO' });
    }
  };

  return (
    <div>
      <h2>Liste des tâches (avec useReducer)</h2>
      <input
        type="text"
        value={state.input}
        onChange={(e) => dispatch({ type: 'SET_INPUT', payload: e.target.value })}
        onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
        placeholder="Nouvelle tâche"
      />
      <button onClick={handleAddTodo}>Ajouter</button>
      <ul>
        {state.todos.map(todo => (
          <li key={todo.id} style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
            <span onClick={() => dispatch({ type: 'TOGGLE_TODO', payload: todo.id })} style={{ cursor: 'pointer' }}>
              {todo.text}
            </span>
            <button onClick={() => dispatch({ type: 'DELETE_TODO', payload: todo.id })} style={{ marginLeft: '10px' }}>
              Supprimer
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}`,
    solution: `// components/TodoList.js
import React, { useReducer } from 'react';

const initialState = {
  todos: [],
  input: ''
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_INPUT':
      return { ...state, input: action.payload };
    case 'ADD_TODO':
      if (!state.input.trim()) return state; // Ne pas ajouter si l'input est vide
      return {
        ...state,
        todos: [
          ...state.todos,
          {
            id: Date.now(), // ID simple basé sur le timestamp
            text: state.input,
            completed: false
          }
        ],
        input: '' // Réinitialiser l'input après ajout
      };
    case 'TOGGLE_TODO':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload
            ? { ...todo, completed: !todo.completed }
            : todo
        )
      };
    case 'DELETE_TODO':
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== action.payload)
      };
    default:
      throw new Error("Action non supportée: " + action.type);
  }
}

export default function TodoList() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const handleAddTodo = () => {
    // La validation est maintenant dans le reducer, mais on peut aussi la garder ici
    // if (state.input.trim()) { 
      dispatch({ type: 'ADD_TODO' });
    // }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '20px auto', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ textAlign: 'center', color: '#333' }}>Liste des tâches (useReducer)</h2>
      <div style={{ display: 'flex', marginBottom: '15px' }}>
        <input
          type="text"
          value={state.input}
          onChange={(e) => dispatch({ type: 'SET_INPUT', payload: e.target.value })}
          onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
          placeholder="Nouvelle tâche"
          style={{ flexGrow: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
        />
        <button 
          onClick={handleAddTodo}
          style={{ marginLeft: '10px', padding: '10px 15px', backgroundColor: '#5cb85c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Ajouter
        </button>
      </div>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {state.todos.map(todo => (
          <li 
            key={todo.id} 
            style={{ 
              padding: '10px', 
              borderBottom: '1px solid #eee', 
              display: 'flex', 
              alignItems: 'center',
              backgroundColor: todo.completed ? '#f0f0f0' : 'transparent'
            }}
          >
            <input 
              type="checkbox" 
              checked={todo.completed}
              onChange={() => dispatch({ type: 'TOGGLE_TODO', payload: todo.id })}
              style={{ marginRight: '10px', cursor: 'pointer', transform: 'scale(1.2)' }}
            />
            <span 
              style={{ 
                textDecoration: todo.completed ? 'line-through' : 'none',
                color: todo.completed ? '#888' : '#333',
                flexGrow: 1,
                cursor: 'pointer'
              }}
              onClick={() => dispatch({ type: 'TOGGLE_TODO', payload: todo.id })}
            >
              {todo.text}
            </span>
            <button 
              onClick={() => dispatch({ type: 'DELETE_TODO', payload: todo.id })}
              style={{ padding: '5px 10px', backgroundColor: '#d9534f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Supprimer
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}`,
    tasks: [
      'Implémenter le reducer pour gérer les actions (ADD_TODO, TOGGLE_TODO, DELETE_TODO, SET_INPUT)',
      'Gérer l\'ajout d\'une nouvelle tâche avec un ID unique et réinitialisation de l\'input',
      'Permettre de marquer une tâche comme complétée/non complétée',
      'Permettre la suppression d\'une tâche',
      'Optionnel: Ajouter des styles pour améliorer l\'interface utilisateur',
      'Optionnel: Empêcher l\'ajout de tâches vides'
    ]
  },
  quiz: { /* ... (quiz existant est bon) ... */
    title: 'Quiz sur les Hooks avancés',
    questions: [
      {
        question: 'Quand devriez-vous préférer `useReducer` à `useState` ?',
        options: [
          'Pour tous les états simples',
          'Lorsque la logique d\'état est complexe ou que le nouvel état dépend du précédent de manière élaborée',
          'Uniquement pour les requêtes API',
          '`useReducer` est obsolète et `useState` doit toujours être utilisé'
        ],
        correctAnswer: 'Lorsque la logique d\'état est complexe ou que le nouvel état dépend du précédent de manière élaborée',
        explanation: '`useReducer` est particulièrement utile pour gérer des états avec des transitions complexes, plusieurs sous-valeurs, ou lorsque la logique d\'état peut être mieux organisée avec des actions et un reducer.'
      },
      {
        question: 'Quel est le principal avantage de `useCallback` ?',
        options: [
          'Mémoriser des valeurs coûteuses à calculer',
          'Empêcher des rendus inutiles de composants enfants en mémorisant les fonctions callback passées en props',
          'Exécuter des effets de bord après le rendu',
          'Remplacer `useState` pour tous les types de fonctions'
        ],
        correctAnswer: 'Empêcher des rendus inutiles de composants enfants en mémorisant les fonctions callback passées en props',
        explanation: '`useCallback` mémorise une fonction. Si cette fonction est passée à un composant enfant optimisé (par exemple avec `React.memo`), cela peut empêcher le re-rendering de l\'enfant si la fonction n\'a pas changé.'
      },
      {
        question: 'Dans quel scénario `useMemo` est-il le plus bénéfique ?',
        options: [
          'Pour mémoriser une fonction callback',
          'Pour mémoriser le résultat d\'un calcul coûteux afin d\'éviter de le refaire à chaque rendu',
          'Pour gérer l\'état global de l\'application',
          'Pour créer des contextes React'
        ],
        correctAnswer: 'Pour mémoriser le résultat d\'un calcul coûteux afin d\'éviter de le refaire à chaque rendu',
        explanation: '`useMemo` est conçu pour mémoriser des valeurs. Si un calcul est lourd et que ses dépendances ne changent pas souvent, `useMemo` peut améliorer les performances en évitant ce calcul à chaque rendu.'
      }
    ]
  },
  project: { /* ... (projet existant est bon) ... */
    title: 'Gestionnaire de tâches avancé avec optimisations',
    description: 'Créez une application de gestion de tâches complète en utilisant `useReducer`, et optimisez-la avec `useCallback` et `useMemo` où c\'est pertinent.',
    requirements: [
      'CRUD complet pour les tâches (Ajout, lecture, mise à jour du statut, suppression)',
      'Filtrage des tâches (toutes, actives, terminées)',
      'Barre de recherche pour filtrer les tâches par texte',
      'Possibilité d\'éditer le texte d\'une tâche existante',
      'Utilisation de `useReducer` pour la gestion de l\'état centralisé des tâches',
      'Sauvegarde locale des tâches dans le `localStorage` pour la persistance',
      'Identification et application de `useCallback` et `useMemo` pour optimiser les performances (par exemple, pour les fonctions de filtrage ou les callbacks passés aux items de la liste).'
    ],
    tips: [
      'Structurez votre état `useReducer` pour inclure les tâches, le filtre actuel, et le terme de recherche.',
      'Créez des composants réutilisables pour un item de tâche, la barre de filtre, etc.',
      'Pour la recherche et le filtrage, utilisez `useMemo` pour ne recalculer la liste filtrée que lorsque c\'est nécessaire.',
      'Si vous passez des fonctions aux items de la liste (par exemple, pour marquer comme complet ou supprimer), utilisez `useCallback`.'
    ],
    bonus: [
      'Ajoutez la possibilité de catégoriser les tâches (avec des couleurs ou des étiquettes).',
      'Implémentez le glisser-déposer (drag and drop) pour réorganiser les tâches.',
      'Ajoutez des dates d\'échéance et des rappels (peut nécessiter des bibliothèques de date).',
      'Créez un thème clair/sombre pour l\'application.',
      'Ajoutez des animations de transition (par exemple avec Framer Motion ou React Spring).'
    ]
  }
};

export default lesson1;
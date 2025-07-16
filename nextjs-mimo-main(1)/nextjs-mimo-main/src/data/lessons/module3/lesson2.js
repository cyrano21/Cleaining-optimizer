const lesson2 = {
  id: '3-2',
  title: 'Les Hooks React',
  description: 'Découvrez comment utiliser les hooks pour gérer l\'état et les effets dans vos composants',
  difficulty: 'intermédiaire',
  duration: 45,
  tags: ['React', 'Hooks', 'useState', 'useEffect', 'useContext'],
  prerequisites: ['3-1'],
  content: `
    <h2>Introduction aux Hooks</h2>
    <p>Les Hooks sont des fonctions qui permettent d'utiliser l'état et d'autres fonctionnalités de React dans des composants fonctionnels. Ils ont été introduits dans React 16.8.</p>
    
    <h3>useState</h3>
    <p>Le hook <code>useState</code> permet d'ajouter un état local à un composant fonctionnel :</p>
    <pre><code>const [state, setState] = useState(initialValue);</code></pre>

    <h3>useEffect</h3>
    <p>Le hook <code>useEffect</code> permet d'effectuer des effets de bord dans les composants fonctionnels :</p>
    <pre><code>useEffect(() => {
  // Code à exécuter après chaque rendu
  return () => {
    // Nettoyage (optionnel)
  };
}, [dependencies]); // Tableau de dépendances</code></pre>

    <h3>useContext</h3>
    <p>Le hook <code>useContext</code> permet d'accéder à une valeur de contexte :</p>
    <pre><code>const value = useContext(MonContexte);</code></pre>

    <h3>Règles des Hooks</h3>
    <ul>
      <li>N'appelez les hooks qu'au niveau supérieur des composants</li>
      <li>N'appelez pas les hooks dans des boucles, conditions ou fonctions imbriquées</li>
      <li>Appelez les hooks uniquement depuis des composants React ou des hooks personnalisés</li>
    </ul>
  `,
  example: {
    title: 'Exemple complet avec plusieurs hooks',
    code: `import { useState, useEffect, useContext } from 'react';
import { ThemeContext } from './ThemeContext';

function Compteur() {
  // État local avec useState
  const [count, setCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  
  // Accès au contexte
  const theme = useContext(ThemeContext);
  
  // Effet pour le compteur automatique
  useEffect(() => {
    let intervalId;
    
    if (isRunning) {
      intervalId = setInterval(() => {
        setCount(prevCount => prevCount + 1);
      }, 1000);
    }
    
    // Fonction de nettoyage
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRunning]); // Ne s'exécute que si isRunning change
  
  // Effet pour le titre du document
  useEffect(() => {
    document.title = 'Compteur: ' + count;
    
    // Nettoyage du titre
    return () => {
      document.title = 'Application React';
    };
  }, [count]); // S'exécute à chaque changement de count
  
  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };
  
  const reset = () => {
    setCount(0);
    setIsRunning(false);
  };
  
  return (
    <div style={{
      padding: '20px',
      backgroundColor: theme.background,
      color: theme.foreground,
      borderRadius: '8px',
      maxWidth: '300px',
      margin: '0 auto',
      textAlign: 'center'
    }}>
      <h2>Compteur: {count}</h2>
      <div style={{ margin: '20px 0' }}>
        <button 
          onClick={toggleTimer}
          style={{
            backgroundColor: isRunning ? '#dc3545' : '#28a745',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            margin: '0 5px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {isRunning ? 'Arrêter' : 'Démarrer'}
        </button>
        <button 
          onClick={reset}
          style={{
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            margin: '0 5px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Réinitialiser
        </button>
      </div>
      <p>Thème: {theme.name}</p>
    </div>
  );
}`,
    explanation: 'Cet exemple montre comment utiliser plusieurs hooks dans un même composant pour gérer un état local, des effets de bord et le contexte.'
  },
  exercise: {
    title: 'Créer un hook personnalisé useFetch',
    description: 'Créez un hook personnalisé useFetch qui gère les appels API avec chargement et gestion des erreurs.',
    initialCode: `import { useState, useEffect } from 'react';

// Créez un hook personnalisé useFetch
function useFetch(url) {
  // À implémenter :
  // - Gérer l'état des données, du chargement et des erreurs
  // - Effectuer la requête fetch dans un useEffect
  // - Retourner les données, l'état de chargement et les erreurs
  
  return { data: null, loading: false, error: null };
}

// Exemple d'utilisation :
/*
function App() {
  const { data, loading, error } = useFetch('https://api.example.com/data');
  
  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error.message}</div>;
  
  return (
    <div>
      <h1>Données de l'API</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
*/`,
    solution: `import { useState, useEffect } from 'react';

function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Fonction pour effectuer la requête
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(url, options);
        
        if (!response.ok) {
          throw new Error('Erreur HTTP: ' + response.status);
        }
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Annulation de la requête si le composant est démonté
    return () => {
      // Ici, vous pourriez annuler une requête en cours avec AbortController
      // si nécessaire
    };
  }, [url, JSON.stringify(options)]); // Se réexécute si l'URL ou les options changent
  
  return { data, loading, error };
}`,
    tasks: [
      'Créer un hook personnalisé useFetch',
      'Gérer les états de chargement et d\'erreur',
      'Implémenter la logique de fetch avec async/await',
      'Nettoyer les effets avec une fonction de nettoyage',
      'Afficher les données avec un style attrayant'
    ]
  },
  quiz: {
    title: 'Quiz sur les Hooks',
    questions: [
      {
        question: 'Quelle est la différence entre useEffect et useLayoutEffect ?',
        options: [
          'useEffect est asynchrone, useLayoutEffect est synchrone',
          'useLayoutEffect est plus rapide',
          'useEffect ne fonctionne pas avec le rendu côté serveur',
          'Il n\'y a pas de différence'
        ],
        correctAnswer: 'useEffect est asynchrone, useLayoutEffect est synchrone',
        explanation: 'useLayoutEffect se déclenche de manière synchrone après toutes les mutations du DOM, avant que le navigateur n\'ait eu une chance de peindre, tandis que useEffect est asynchrone.'
      },
      {
        question: 'Quand faut-il ajouter des dépendances au tableau de dépendances de useEffect ?',
        options: [
          'Toujours laisser le tableau vide',
          'Uniquement pour les variables d\'état',
          'Pour toutes les valeurs utilisées dans l\'effet qui viennent du scope extérieur',
          'Ce n\'est pas nécessaire avec les fonctions asynchrones'
        ],
        correctAnswer: 'Pour toutes les valeurs utilisées dans l\'effet qui viennent du scope extérieur',
        explanation: 'Toute valeur du composant (comme les props et l\'état) qui est utilisée à l\'intérieur de useEffect doit être déclarée dans son tableau de dépendances.'
      },
      {
        question: 'Quelle est la bonne façon de mettre à jour l\'état basé sur l\'état précédent ?',
        options: [
          'setCount(count + 1)',
          'setCount(prevCount => prevCount + 1)',
          'setCount(count++)',
          'setCount(++count)'
        ],
        correctAnswer: 'setCount(prevCount => prevCount + 1)',
        explanation: 'Lorsque la nouvelle valeur de l\'état dépend de l\'ancienne, il faut utiliser la forme fonctionnelle de setState qui reçoit la valeur précédente en argument.'
      }
    ]
  },
  hasExercise: true,
  hasQuiz: true,
  hasProject: false
};

export default lesson2;

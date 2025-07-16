// src/data/lessons/module9/lesson1.js
const lesson1 = {
  id: '9-1',
  title: 'Introduction aux tests dans Next.js',
  description:
    'Apprendre à mettre en place un environnement de test complet pour vos applications Next.js',
  difficulty: 'intermédiaire',
  duration: 60,
  tags: [
    'Next.js',
    'Tests',
    'Jest',
    'React Testing Library',
    'Qualité du code'
  ],
  prerequisites: ['1-3', '2-3'],
  content: `
    <h2>Importance des tests dans les applications Next.js</h2>
    <p>Les tests sont une partie essentielle du développement d'applications robustes et maintenables. Pour les applications Next.js, les tests permettent de s'assurer que les fonctionnalités importantes continuent de fonctionner correctement au fil des mises à jour et des changements.</p>

    <h3>Types de tests pour Next.js</h3>
    <ul>
      <li><strong>Tests unitaires</strong> : Testent des fonctions et des composants isolés</li>
      <li><strong>Tests d'intégration</strong> : Testent les interactions entre plusieurs composants</li>
      <li><strong>Tests end-to-end (E2E)</strong> : Testent le flux complet d'une application</li>
    </ul>

    <h3>Outils de test pour Next.js</h3>
    <p>Next.js est compatible avec de nombreux outils de test, les plus populaires étant :</p>
    <ul>
      <li><strong>Jest</strong> : Framework de test par défaut</li>
      <li><strong>React Testing Library</strong> : Pour tester les composants React</li>
      <li><strong>Cypress</strong> : Pour les tests end-to-end</li>
      <li><strong>Playwright</strong> : Une alternative moderne pour les tests E2E</li>
    </ul>

    <h3>Configuration de Jest avec Next.js</h3>
    <p>Jest est généralement préconfiguré dans les projets Next.js créés avec <code>create-next-app</code>, mais il peut nécessiter quelques ajustements :</p>

    <pre><code class="language-javascript">// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Chemin vers l'application Next.js
  dir: './',
});

// Configuration personnalisée de Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/pages/(.*)$': '<rootDir>/pages/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
};

// createJestConfig est exporté pour permettre à Next.js de l'utiliser
module.exports = createJestConfig(customJestConfig);</code></pre>

    <h3>Mise en place de React Testing Library</h3>
    <p>React Testing Library fournit des utilitaires permettant de tester les composants React d'une manière qui simule l'interaction des utilisateurs :</p>

    <pre><code class="language-javascript">// jest.setup.js
import '@testing-library/jest-dom';</code></pre>
  `,
  example: {
    title: "Test d'un composant simple avec React Testing Library",
    code: `// components/Button.js
export default function Button({ onClick, children }) {
  return (
    <button 
      onClick={onClick}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      {children}
    </button>
  );
}

// __tests__/Button.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../components/Button';

describe('Button Component', () => {
  test('renders button with correct text', () => {
    render(<Button>Click me</Button>);
    const buttonElement = screen.getByText(/click me/i);
    expect(buttonElement).toBeInTheDocument();
  });

  test('calls onClick handler when clicked', () => {
    const mockOnClick = jest.fn();
    render(<Button onClick={mockOnClick}>Click me</Button>);
    const buttonElement = screen.getByText(/click me/i);
    
    fireEvent.click(buttonElement);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
});`,
    explanation:
      'Cet exemple montre comment tester un composant Button simple avec React Testing Library. Le premier test vérifie que le bouton affiche correctement son texte, tandis que le deuxième test vérifie que la fonction onClick est appelée lorsque le bouton est cliqué.'
  },
  exercise: {
    title: 'Écrire un test unitaire pour un composant Header',
    description:
      'Écrivez un test unitaire pour un composant Header qui vérifie la présence du logo et des liens de navigation.',
    options: [
      {
        id: 1,
        text: 'Utiliser screen.getByRole pour trouver les éléments de navigation',
        correct: true
      },
      {
        id: 2,
        text: 'Utiliser document.getElementById pour trouver les éléments',
        correct: false
      },
      {
        id: 3,
        text: 'Tester que les liens ont les bons attributs href',
        correct: true
      },
      {
        id: 4,
        text: 'Utiliser waitFor pour attendre le chargement du composant',
        correct: false
      },
      {
        id: 5,
        text: 'Vérifier que le logo est rendu correctement',
        correct: true
      },
      {
        id: 6,
        text: 'Utiliser les sélecteurs CSS pour trouver les éléments',
        correct: false
      },
      {
        id: 7,
        text: "Vérifier l'accessibilité des éléments de navigation",
        correct: true
      },
      {
        id: 8,
        text: 'Simuler une interaction utilisateur avec fireEvent',
        correct: true
      }
    ],
    type: 'multiple'
  },
  quiz: {
    title: 'Quiz sur les tests dans Next.js',
    questions: [
      {
        question:
          "Quel est l'avantage principal de React Testing Library par rapport à Enzyme ?",
        options: [
          'Elle est plus rapide à exécuter',
          "Elle teste le comportement plutôt que l'implémentation",
          'Elle est plus facile à configurer',
          'Elle permet de tester les hooks directement'
        ],
        correctAnswer: "Elle teste le comportement plutôt que l'implémentation"
      },
      {
        question:
          'Comment tester un composant qui utilise le hook useRouter de Next.js ?',
        options: [
          'En utilisant jest.mock() pour mocker next/router',
          'En créant un vrai routeur Next.js pour les tests',
          'En ignorant simplement les tests pour les composants avec routeur',
          'En important directement le useRouter'
        ],
        correctAnswer: 'En utilisant jest.mock() pour mocker next/router'
      },
      {
        question:
          'Quelles assertions sont couramment utilisées avec React Testing Library ?',
        options: [
          'toBeInTheDocument, toHaveTextContent, toBeVisible',
          'hasClass, contains, find',
          'assertVisible, assertText, assertPresent',
          'checkElement, checkVisible, checkText'
        ],
        correctAnswer: 'toBeInTheDocument, toHaveTextContent, toBeVisible'
      },
      {
        question: 'Comment tester un composant qui effectue des requêtes API ?',
        options: [
          'Utiliser uniquement des tests E2E pour les composants avec API',
          'Mocker le service fetch ou axios avec jest.mock',
          'Exécuter un serveur API réel pendant les tests',
          'Les composants avec API ne peuvent pas être testés unitairement'
        ],
        correctAnswer: 'Mocker le service fetch ou axios avec jest.mock'
      },
      {
        question:
          'Quel est le rôle de setupFilesAfterEnv dans la configuration de Jest ?',
        options: [
          "Définir des variables d'environnement",
          'Configurer les transformateurs de fichiers',
          'Exécuter du code avant chaque test',
          "Importer des fichiers avant l'exécution des tests"
        ],
        correctAnswer: "Importer des fichiers avant l'exécution des tests"
      }
    ]
  },
  project: {
    title: "Mise en place d'un environnement de test complet",
    description:
      'Dans ce projet, vous allez configurer un environnement de test complet pour une application Next.js, incluant Jest, React Testing Library, et des tests de composants basiques.',
    initialCode: `// jest.config.js
// Configurez Jest pour votre application Next.js

// jest.setup.js
// Importez les extensions nécessaires

// __tests__/Home.test.js
// Écrivez un test pour votre page d'accueil`,
    solution: `// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/pages/(.*)$': '<rootDir>/pages/$1',
  },
};

module.exports = createJestConfig(customJestConfig);

// jest.setup.js
import '@testing-library/jest-dom';

// __tests__/Home.test.js
import { render, screen } from '@testing-library/react';
import Home from '../pages/index';

describe('Home page', () => {
  it('renders the heading', () => {
    render(<Home />);
    const heading = screen.getByRole('heading', { 
      name: /bienvenue/i 
    });
    expect(heading).toBeInTheDocument();
  });

  it('renders the main navigation', () => {
    render(<Home />);
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
  });
});`
  },
  hasExercise: true,
  hasQuiz: true,
  hasProject: true
}

export default lesson1

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CodeEditor from '../../components/editor/CodeEditor'
import CodePlayground from '../../components/editor/CodePlayground'
import ExerciseWithPreview from '../../components/editor/ExerciseWithPreview'
import Link from 'next/link'

export default function ReactFundamentalsPage () {
  const [activeSection, setActiveSection] = useState('introduction')
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [progress, setProgress] = useState(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('reactCourseProgress') || '{}')
    }
    return {}
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('reactCourseProgress', JSON.stringify(progress))
    }
  }, [progress])

  const markAsCompleted = sectionKey => {
    setProgress(prev => ({
      ...prev,
      [sectionKey]: true
    }))
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: 'beforeChildren',
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.3 }
    }
  }

  // Contenu des sections
  const sections = {
    introduction: {
      title: 'Introduction à React',
      icon: '📚',
      color: 'bg-blue-500',
      content: `
        React est une bibliothèque JavaScript pour construire des interfaces utilisateur. 
        Développée par Facebook (maintenant Meta), elle est devenue l'une des bibliothèques 
        les plus populaires pour le développement front-end.
        
        React utilise une approche déclarative et basée sur les composants, ce qui rend le code 
        plus prévisible et plus facile à déboguer. Il utilise également un DOM virtuel pour 
        optimiser les performances en minimisant les manipulations directes du DOM.
        
        Next.js est un framework construit sur React qui ajoute des fonctionnalités comme 
        le rendu côté serveur, la génération de sites statiques, et bien plus encore.
        Comprendre React est donc essentiel pour maîtriser Next.js.
      `,
      code: `// Un composant React simple
import React from 'react';

function Salutation({ nom }) {
  return (
    <div>
      <h1>Bonjour, {nom}!</h1>
      <p>Bienvenue dans le monde de React.</p>
    </div>
  );
}

// Utilisation du composant
function App() {
  return (
    <div>
      <Salutation nom="Marie" />
      <Salutation nom="Jean" />
    </div>
  );
}

export default App;`,
      language: 'jsx'
    },
    components: {
      title: 'Composants et Props',
      icon: '🧩',
      color: 'bg-green-500',
      content: `
        Les composants sont les blocs de construction de toute application React.
        Un composant est une fonction ou une classe qui accepte des entrées (appelées "props") 
        et retourne des éléments React décrivant ce qui doit apparaître à l'écran.
        
        Il existe deux types de composants en React :
        - Composants fonctionnels : des fonctions JavaScript qui acceptent des props et retournent du JSX
        - Composants de classe : des classes ES6 qui étendent React.Component
        
        Les props (propriétés) sont des données passées d'un composant parent à un composant enfant.
        Elles sont en lecture seule et ne doivent pas être modifiées par le composant qui les reçoit.
      `,
      code: `// Composant fonctionnel avec props
function Bouton({ texte, couleur, onClick }) {
  return (
    <button 
      onClick={onClick}
      style={{ backgroundColor: couleur, color: 'white', padding: '10px 15px' }}
    >
      {texte}
    </button>
  );
}

// Utilisation du composant avec différentes props
function App() {
  const handleClick = (message) => {
    alert(message);
  };
  
  return (
    <div>
      <Bouton 
        texte="Cliquez-moi" 
        couleur="blue" 
        onClick={() => handleClick("Bouton bleu cliqué!")} 
      />
      
      <Bouton 
        texte="Envoyer" 
        couleur="green" 
        onClick={() => handleClick("Formulaire envoyé!")} 
      />
      
      <Bouton 
        texte="Supprimer" 
        couleur="red" 
        onClick={() => handleClick("Élément supprimé!")} 
      />
    </div>
  );
}`,
      language: 'jsx'
    },
    state: {
      title: 'État (State) et Cycle de vie',
      icon: '⏳',
      color: 'bg-red-500',
      content: `
        L'état (state) est un objet qui contient des données spécifiques à un composant 
        et qui peuvent changer au fil du temps. Contrairement aux props, l'état est géré 
        entièrement par le composant lui-même.
        
        Dans les composants fonctionnels, l'état est géré avec le hook useState.
        Dans les composants de classe, l'état est initialisé dans le constructeur et 
        mis à jour avec la méthode setState.
        
        Le cycle de vie d'un composant comprend plusieurs phases :
        - Montage : le composant est créé et inséré dans le DOM
        - Mise à jour : le composant est re-rendu suite à des changements de props ou d'état
        - Démontage : le composant est retiré du DOM
        
        Dans les composants fonctionnels, le hook useEffect permet de gérer ces phases.
      `,
      code: `// Gestion de l'état avec useState
import React, { useState } from 'react';

function Compteur() {
  // Déclarer une variable d'état "compteur" initialisée à 0
  const [compteur, setCompteur] = useState(0);
  
  return (
    <div>
      <p>Vous avez cliqué {compteur} fois</p>
      <button onClick={() => setCompteur(compteur + 1)}>
        Cliquez-moi
      </button>
    </div>
  );
}

// Gestion du cycle de vie avec useEffect
import React, { useState, useEffect } from 'react';

function Horloge() {
  const [date, setDate] = useState(new Date());
  
  useEffect(() => {
    // Code exécuté après le rendu (équivalent à componentDidMount et componentDidUpdate)
    const timerID = setInterval(() => {
      setDate(new Date());
    }, 1000);
    
    // Fonction de nettoyage (équivalent à componentWillUnmount)
    return () => {
      clearInterval(timerID);
    };
  }, []); // Le tableau vide signifie que cet effet s'exécute une seule fois après le montage
  
  return (
    <div>
      <h2>Il est {date.toLocaleTimeString()}.</h2>
    </div>
  );
}`,
      language: 'jsx'
    },
    hooks: {
      title: 'Hooks React',
      icon: '🔧',
      color: 'bg-purple-500',
      content: `
        Les Hooks sont une addition à React 16.8 qui permettent d'utiliser l'état et d'autres 
        fonctionnalités de React sans écrire de classe. Ils permettent de réutiliser la logique 
        d'état entre les composants.
        
        Les Hooks les plus couramment utilisés sont :
        
        - useState : pour ajouter un état local à un composant fonctionnel
        - useEffect : pour exécuter du code après le rendu (effets secondaires)
        - useContext : pour accéder à un contexte React
        - useReducer : pour gérer un état plus complexe avec un pattern Redux-like
        - useCallback : pour mémoriser une fonction entre les rendus
        - useMemo : pour mémoriser une valeur calculée entre les rendus
        - useRef : pour créer une référence mutable qui persiste entre les rendus
        
        Les Hooks personnalisés permettent d'extraire la logique des composants dans des fonctions 
        réutilisables.
      `,
      code: `// Exemple de plusieurs hooks
import React, { useState, useEffect, useRef } from 'react';

function FormulaireProfil() {
  // useState pour gérer les données du formulaire
  const [profil, setProfil] = useState({
    nom: '',
    email: '',
    bio: ''
  });
  
  // useRef pour accéder à un élément DOM
  const inputNomRef = useRef(null);
  
  // useEffect pour focus sur l'input au chargement
  useEffect(() => {
    inputNomRef.current.focus();
  }, []);
  
  // useEffect pour sauvegarder dans localStorage
  useEffect(() => {
    localStorage.setItem('profil', JSON.stringify(profil));
  }, [profil]); // Se déclenche uniquement quand profil change
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfil(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    alert(\`Profil sauvegardé: \${profil.nom} (\${profil.email})\`);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="nom">Nom:</label>
        <input
          id="nom"
          name="nom"
          ref={inputNomRef}
          value={profil.nom}
          onChange={handleChange}
        />
      </div>
      
      <div>
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          name="email"
          type="email"
          value={profil.email}
          onChange={handleChange}
        />
      </div>
      
      <div>
        <label htmlFor="bio">Bio:</label>
        <textarea
          id="bio"
          name="bio"
          value={profil.bio}
          onChange={handleChange}
        />
      </div>
      
      <button type="submit">Sauvegarder</button>
    </form>
  );
}

// Hook personnalisé
function useLocalStorage(key, initialValue) {
  // État pour stocker notre valeur
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });
  
  // Fonction pour mettre à jour l'état et localStorage
  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };
  
  return [storedValue, setValue];
}`,
      language: 'jsx'
    },
    lists: {
      title: 'Listes et Clés',
      icon: '📋',
      color: 'bg-yellow-500',
      content: `
        En React, vous transformerez souvent des tableaux en listes d'éléments.
        
        Pour créer une liste d'éléments, vous pouvez utiliser la méthode map() pour 
        transformer chaque élément du tableau en un élément React.
        
        Lorsque vous créez une liste d'éléments, vous devez inclure une "clé" (key) spéciale.
        Les clés aident React à identifier quels éléments ont changé, ont été ajoutés ou supprimés.
        Les clés doivent être uniques parmi les frères (mais peuvent être réutilisées globalement).
        
        Idéalement, les clés devraient être des identifiants stables (comme des IDs de base de données),
        mais vous pouvez utiliser l'index du tableau comme clé en dernier recours.
      `,
      code: `// Rendu d'une liste avec des clés
function ListeUtilisateurs({ utilisateurs }) {
  return (
    <ul>
      {utilisateurs.map((utilisateur) => (
        <li key={utilisateur.id}>
          {utilisateur.nom} ({utilisateur.email})
        </li>
      ))}
    </ul>
  );
}

// Exemple d'utilisation
function App() {
  const utilisateurs = [
    { id: 1, nom: 'Alice Dupont', email: 'alice@example.com' },
    { id: 2, nom: 'Bob Martin', email: 'bob@example.com' },
    { id: 3, nom: 'Charlie Durand', email: 'charlie@example.com' }
  ];
  
  return (
    <div>
      <h1>Liste des utilisateurs</h1>
      <ListeUtilisateurs utilisateurs={utilisateurs} />
    </div>
  );
}

// Liste avec filtrage et tri
function ListeFiltrable({ items }) {
  const [recherche, setRecherche] = useState('');
  const [tri, setTri] = useState('nom'); // 'nom' ou 'date'
  
  // Filtrer les items en fonction de la recherche
  const itemsFiltres = items.filter(item =>
    item.nom.toLowerCase().includes(recherche.toLowerCase())
  );
  
  // Trier les items
  const itemsTries = [...itemsFiltres].sort((a, b) => {
    if (tri === 'date') {
      return new Date(b.date) - new Date(a.date);
    }
    const nomA = a?.nom || '';
    const nomB = b?.nom || '';
    return nomA.localeCompare(nomB);
  });
  
  return (
    <div>
      <div>
        <input
          type="text"
          placeholder="Rechercher..."
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
        />
        
        <select value={tri} onChange={(e) => setTri(e.target.value)}>
          <option value="nom">Trier par nom</option>
          <option value="date">Trier par date</option>
        </select>
      </div>
      
      <ul>
        {itemsTries.map(item => (
          <li key={item.id}>
            {item.nom} - {new Date(item.date).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
}`,
      language: 'jsx'
    },
    forms: {
      title: 'Formulaires et Événements',
      icon: '📅',
      color: 'bg-pink-500',
      content: `
        En React, les formulaires fonctionnent un peu différemment du HTML standard.
        
        Dans un formulaire React, vous pouvez :
        - Utiliser des "composants contrôlés" où l'état React est la "source unique de vérité"
        - Gérer la soumission du formulaire avec onSubmit
        - Gérer les changements d'entrée avec onChange
        
        Les événements en React sont similaires aux événements du DOM, mais avec quelques différences :
        - Les événements React sont nommés en camelCase (onClick au lieu de onclick)
        - Avec JSX, vous passez une fonction comme gestionnaire d'événements, pas une chaîne de caractères
        - Vous devez appeler preventDefault() explicitement pour empêcher le comportement par défaut
        
        La gestion des formulaires est une compétence essentielle pour créer des applications interactives.
      `,
      code: `// Formulaire contrôlé simple
import React, { useState } from 'react';

function FormulaireContact() {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    message: ''
  });
  const [soumis, setSoumis] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault(); // Empêche le rechargement de la page
    
    // Validation simple
    if (!formData.nom || !formData.email || !formData.message) {
      alert('Veuillez remplir tous les champs');
      return;
    }
    
    // Simuler l'envoi à un serveur
    console.log('Données du formulaire:', formData);
    setSoumis(true);
  };
  
  if (soumis) {
    return (
      <div>
        <h2>Merci pour votre message!</h2>
        <p>Nous vous répondrons bientôt à {formData.email}.</p>
        <button onClick={() => {
          setFormData({ nom: '', email: '', message: '' });
          setSoumis(false);
        }}>
          Envoyer un autre message
        </button>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="nom">Nom:</label>
        <input
          id="nom"
          name="nom"
          value={formData.nom}
          onChange={handleChange}
          required
        />
      </div>
      
      <div>
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      
      <div>
        <label htmlFor="message">Message:</label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows="5"
        />
      </div>
      
      <button type="submit">Envoyer</button>
    </form>
  );
}`,
      language: 'jsx'
    },
    context: {
      title: 'Context API',
      icon: '🌐',
      color: 'bg-teal-500',
      content: `
        Le Context API de React permet de partager des données entre des composants sans avoir 
        à passer explicitement les props à chaque niveau.
        
        Il est particulièrement utile pour des données qui peuvent être considérées comme "globales" 
        pour un arbre de composants React, comme le thème actuel, l'utilisateur authentifié, 
        ou les préférences de langue.
        
        Le Context API se compose de trois parties principales :
        - React.createContext : crée un objet Context
        - Context.Provider : fournit la valeur du contexte aux composants enfants
        - Context.Consumer ou useContext : consomme la valeur du contexte
        
        Dans Next.js, le Context API est souvent utilisé pour gérer l'état global de l'application.
      `,
      code: `// Création et utilisation d'un contexte
import React, { createContext, useContext, useState } from 'react';

// Créer un contexte avec une valeur par défaut
const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {}
});

// Hook personnalisé pour utiliser le contexte de thème
function useTheme() {
  return useContext(ThemeContext);
}

// Composant Provider qui fournit le contexte
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };
  
  const value = {
    theme,
    toggleTheme
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Composant qui utilise le contexte
function ThemedButton() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      style={{
        backgroundColor: theme === 'light' ? '#ffffff' : '#333333',
        color: theme === 'light' ? '#333333' : '#ffffff',
        padding: '10px 15px',
        border: '1px solid #cccccc',
        borderRadius: '4px'
      }}
    >
      Changer le thème ({theme})
    </button>
  );
}

// Composant qui utilise le composant avec contexte
function Toolbar() {
  return (
    <div>
      <ThemedButton />
    </div>
  );
}

// Application complète avec le Provider
function App() {
  return (
    <ThemeProvider>
      <div style={{ padding: '20px' }}>
        <h1>Exemple de Context API</h1>
        <Toolbar />
      </div>
    </ThemeProvider>
  );
}`,
      language: 'jsx'
    },
    exercise: {
      title: 'Exercice Pratique',
      icon: '🛠️',
      color: 'bg-orange-500',
      content: `
        Maintenant que vous avez appris les bases de React, essayez de résoudre cet exercice pratique.
        
        L'objectif est de créer un composant de compteur qui :
        1. Affiche un nombre
        2. A un bouton pour incrémenter le nombre
        3. A un bouton pour décrémenter le nombre
        4. Ne permet pas au nombre de devenir négatif
        
        Utilisez useState pour gérer l'état du compteur et créez des gestionnaires d'événements 
        pour les boutons d'incrémentation et de décrémentation.
        
        Cet exercice vous aidera à consolider votre compréhension des composants, des props, 
        de l'état et des événements en React.
      `,
      exercise: true,
      initialCode: `function Compteur() {
  // Utilisez useState pour créer une variable d'état "count" initialisée à 0
  
  // Créez une fonction pour incrémenter le compteur
  
  // Créez une fonction pour décrémenter le compteur
  // (assurez-vous que le compteur ne devient pas négatif)
  
  return (
    <div>
      {/* Affichez le compteur ici */}
      
      {/* Ajoutez un bouton pour incrémenter */}
      
      {/* Ajoutez un bouton pour décrémenter */}
    </div>
  );
}

// Exemple d'utilisation du composant
function App() {
  return (
    <div>
      <h1>Mon Compteur</h1>
      <Compteur />
    </div>
  );
}`,
      solutionCode: `function Compteur() {
  // Utilisez useState pour créer une variable d'état "count" initialisée à 0
  const [count, setCount] = useState(0);
  
  // Créez une fonction pour incrémenter le compteur
  const increment = () => {
    setCount(count + 1);
  };
  
  // Créez une fonction pour décrémenter le compteur
  // (assurez-vous que le compteur ne devient pas négatif)
  const decrement = () => {
    if (count > 0) {
      setCount(count - 1);
    }
  };
  
  return (
    <div>
      {/* Affichez le compteur ici */}
      <p>Compteur: {count}</p>
      
      {/* Ajoutez un bouton pour incrémenter */}
      <button onClick={increment}>Incrémenter</button>
      
      {/* Ajoutez un bouton pour décrémenter */}
      <button onClick={decrement}>Décrémenter</button>
    </div>
  );
}

// Exemple d'utilisation du composant
function App() {
  return (
    <div>
      <h1>Mon Compteur</h1>
      <Compteur />
    </div>
  );
}`,
      language: 'jsx'
    },
    playground: {
      title: 'Playground React',
      icon: '⚙️',
      color: 'bg-gray-500',
      content: `
        Utilisez ce playground pour expérimenter avec React. 
        Écrivez votre code JSX dans l'éditeur et voyez le résultat en temps réel.
        
        Vous pouvez créer des composants, utiliser des hooks, et tester différentes fonctionnalités de React.
        
        N'hésitez pas à essayer les exemples des sections précédentes ou à créer vos propres exemples.
        
        C'est un excellent moyen de vous familiariser avec React avant de passer à Next.js.
      `,
      playground: true,
      initialCode: `// Écrivez votre code React ici
function Salutation({ nom }) {
  return <h1>Bonjour, {nom}!</h1>;
}

function ListeElements({ items }) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

function MonApp() {
  const [nom, setNom] = React.useState("Visiteur");
  const [items, setItems] = React.useState([
    "Apprendre React", 
    "Créer des composants", 
    "Utiliser des hooks"
  ]);
  
  const ajouterItem = () => {
    setItems([...items, "Nouvel élément " + (items.length + 1)]);
  };
  
  return (
    <div>
      <Salutation nom={nom} />
      
      <div>
        <label>
          Votre nom: 
          <input 
            value={nom} 
            onChange={(e) => setNom(e.target.value)} 
          />
        </label>
      </div>
      
      <h2>Ma liste de tâches:</h2>
      <ListeElements items={items} />
      
      <button onClick={ajouterItem}>
        Ajouter un élément
      </button>
    </div>
  );
}

// Rendu de l'application
ReactDOM.render(
  <MonApp />,
  document.getElementById('root')
);`,
      language: 'jsx'
    }
  }

  const totalSections = Object.keys(sections).length
  const completedSections = Object.values(progress).filter(Boolean).length
  const progressPercentage = Math.round(
    (completedSections / totalSections) * 100
  )

  const handleSectionChange = section => {
    setActiveSection(section)
    setShowMobileMenu(false)
    // Auto-scroll to top when changing sections
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const renderSectionContent = () => {
    const section = sections[activeSection]

    return (
      <motion.div
        key={activeSection}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className='mt-6'
      >
        <div className='flex items-center space-x-3 mb-4'>
          <div
            className={`w-10 h-10 ${section.color} rounded-lg flex items-center justify-center text-white shadow-lg`}
          >
            <span className='text-xl'>{section.icon}</span>
          </div>
          <h2 className='text-2xl font-bold text-gray-900'>{section.title}</h2>
        </div>

        <div className='prose max-w-none mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200'>
          {section.content.split('\n').map((paragraph, index) => (
            <p key={index} className='mb-4 text-gray-700'>
              {paragraph}
            </p>
          ))}
        </div>

        <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8'>
          {section.playground ? (
            <CodePlayground
              initialCode={section.initialCode}
              language={section.language}
              title='Playground React'
              description='Expérimentez avec React et voyez le résultat en temps réel.'
              height='500px'
            />
          ) : section.exercise ? (
            <ExerciseWithPreview
              exercise={{
                id: 1,
                title: 'Créer un composant de compteur',
                description:
                  "Créez un composant de compteur React qui permet d'incrémenter et de décrémenter un nombre.",
                instructions: [
                  "Utilisez useState pour créer une variable d'état 'count' initialisée à 0",
                  'Créez une fonction pour incrémenter le compteur',
                  'Créez une fonction pour décrémenter le compteur (sans aller en dessous de 0)',
                  'Affichez le compteur et ajoutez des boutons pour incrémenter et décrémenter'
                ],
                initialCode: section.initialCode,
                solutionCode: section.solutionCode,
                language: section.language,
                difficulty: 'débutant',
                xpReward: 30
              }}
            />
          ) : (
            <CodeEditor
              initialCode={section.code}
              language={section.language}
              height='350px'
              showPreview={true}
              autoPreview={true}
            />
          )}
        </div>

        <div className='flex justify-between items-center mt-8 mb-12'>
          <button
            onClick={() => {
              const sectionKeys = Object.keys(sections)
              const currentIndex = sectionKeys.indexOf(activeSection)
              if (currentIndex > 0) {
                handleSectionChange(sectionKeys[currentIndex - 1])
              }
            }}
            disabled={activeSection === Object.keys(sections)[0]}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
              activeSection === Object.keys(sections)[0]
                ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                : 'text-indigo-600 border-indigo-200 hover:bg-indigo-50'
            } transition-colors`}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                d='M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z'
                clipRule='evenodd'
              />
            </svg>
            <span>Section précédente</span>
          </button>

          <button
            onClick={() => markAsCompleted(activeSection)}
            className={`px-4 py-2 rounded-lg ${
              progress[activeSection]
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            } transition-colors flex items-center space-x-2`}
          >
            {progress[activeSection] ? (
              <>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                    clipRule='evenodd'
                  />
                </svg>
                <span>Section complétée</span>
              </>
            ) : (
              <>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                    clipRule='evenodd'
                  />
                </svg>
                <span>Marquer comme complété</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              const sectionKeys = Object.keys(sections)
              const currentIndex = sectionKeys.indexOf(activeSection)
              if (currentIndex < sectionKeys.length - 1) {
                handleSectionChange(sectionKeys[currentIndex + 1])
              }
            }}
            disabled={
              activeSection ===
              Object.keys(sections)[Object.keys(sections).length - 1]
            }
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
              activeSection ===
              Object.keys(sections)[Object.keys(sections).length - 1]
                ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                : 'text-indigo-600 border-indigo-200 hover:bg-indigo-50'
            } transition-colors`}
          >
            <span>Section suivante</span>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
                clipRule='evenodd'
              />
            </svg>
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Barre de navigation supérieure */}
      <header className='bg-white shadow-sm border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
          <div className='flex justify-between items-center'>
            <div className='flex items-center space-x-3'>
              <Link
                href='/lessons'
                className='text-indigo-600 hover:text-indigo-800'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-6 w-6'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M10 19l-7-7m0 0l7-7m-7 7h18'
                  />
                </svg>
              </Link>
              <h1 className='text-xl font-bold text-gray-900'>
                Fondamentaux React
              </h1>
            </div>

            <div className='hidden md:flex items-center space-x-4'>
              <div className='w-48 bg-gray-200 rounded-full h-2.5 overflow-hidden'>
                <div
                  className='bg-gradient-to-r from-indigo-500 to-purple-600 h-2.5 rounded-full'
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <span className='text-sm font-medium text-gray-700'>
                {progressPercentage}% Complété
              </span>
            </div>

            <button
              className='md:hidden'
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-6 w-6 text-gray-500'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4 6h16M4 12h16m-7 6h7'
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Contenu principal avec sidebar */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='lg:grid lg:grid-cols-12 lg:gap-8'>
          {/* Sidebar pour desktop */}
          <aside className='hidden lg:block lg:col-span-3'>
            <div className='sticky top-6'>
              <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
                <h2 className='font-semibold text-gray-900 mb-4'>
                  Modules du cours
                </h2>
                <nav className='space-y-1'>
                  {Object.entries(sections).map(([key, section], index) => (
                    <button
                      key={key}
                      onClick={() => handleSectionChange(key)}
                      className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        activeSection === key
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className='flex items-center justify-center w-6 h-6 mr-3'>
                        {progress[key] ? (
                          <div className='w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center'>
                            <svg
                              xmlns='http://www.w3.org/2000/svg'
                              className='h-4 w-4'
                              viewBox='0 0 20 20'
                              fill='currentColor'
                            >
                              <path
                                fillRule='evenodd'
                                d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                                clipRule='evenodd'
                              />
                            </svg>
                          </div>
                        ) : (
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              activeSection === key
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {index + 1}
                          </div>
                        )}
                      </div>
                      <span className='truncate'>{section.title}</span>
                    </button>
                  ))}
                </nav>
              </div>

              <div className='mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
                <h2 className='font-semibold text-gray-900 mb-3'>
                  Votre progression
                </h2>
                <div className='mb-3'>
                  <div className='flex justify-between text-sm text-gray-600 mb-1'>
                    <span>Complété</span>
                    <span>
                      {completedSections}/{totalSections} sections
                    </span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-2.5 overflow-hidden'>
                    <div
                      className='bg-gradient-to-r from-indigo-500 to-purple-600 h-2.5 rounded-full'
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
                {completedSections === totalSections ? (
                  <div className='text-center py-3 bg-green-50 text-green-700 rounded-lg'>
                    <span className='font-medium'>Cours terminé! 🎉</span>
                  </div>
                ) : (
                  <p className='text-sm text-gray-600'>
                    Continuez à apprendre pour compléter ce cours sur React.
                  </p>
                )}
              </div>

              <div className='mt-6 bg-indigo-50 rounded-xl shadow-sm border border-indigo-100 p-6'>
                <h3 className='font-medium text-indigo-800 mb-2'>
                  Besoin d'aide?
                </h3>
                <p className='text-sm text-indigo-700 mb-4'>
                  Si vous avez des questions sur React, n'hésitez pas à
                  consulter la documentation officielle ou à demander de l'aide.
                </p>
                <a
                  href='https://fr.reactjs.org/docs/getting-started.html'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-xs bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-3 rounded-lg inline-block transition-colors'
                >
                  Documentation React
                </a>
              </div>
            </div>
          </aside>

          {/* Menu mobile */}
          <AnimatePresence>
            {showMobileMenu && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className='lg:hidden fixed inset-0 z-50 bg-gray-900 bg-opacity-50'
              >
                <div className='bg-white p-6 h-auto max-h-[90vh] overflow-y-auto rounded-b-xl'>
                  <div className='flex justify-between items-center mb-4'>
                    <h2 className='font-semibold text-gray-900'>
                      Modules du cours
                    </h2>
                    <button onClick={() => setShowMobileMenu(false)}>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-6 w-6 text-gray-500'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M6 18L18 6M6 6l12 12'
                        />
                      </svg>
                    </button>
                  </div>

                  <div className='mb-4'>
                    <div className='flex justify-between text-sm text-gray-600 mb-1'>
                      <span>Progression</span>
                      <span>{progressPercentage}%</span>
                    </div>
                    <div className='w-full bg-gray-200 rounded-full h-2.5 overflow-hidden'>
                      <div
                        className='bg-gradient-to-r from-indigo-500 to-purple-600 h-2.5 rounded-full'
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  <nav className='space-y-1'>
                    {Object.entries(sections).map(([key, section], index) => (
                      <button
                        key={key}
                        onClick={() => handleSectionChange(key)}
                        className={`flex items-center w-full px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                          activeSection === key
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <div className='flex items-center justify-center w-6 h-6 mr-3'>
                          {progress[key] ? (
                            <div className='w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center'>
                              <svg
                                xmlns='http://www.w3.org/2000/svg'
                                className='h-4 w-4'
                                viewBox='0 0 20 20'
                                fill='currentColor'
                              >
                                <path
                                  fillRule='evenodd'
                                  d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                                  clipRule='evenodd'
                                />
                              </svg>
                            </div>
                          ) : (
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                activeSection === key
                                  ? 'bg-indigo-100 text-indigo-700'
                                  : 'bg-gray-100 text-gray-500'
                              }`}
                            >
                              {index + 1}
                            </div>
                          )}
                        </div>
                        <span className='truncate'>{section.title}</span>
                      </button>
                    ))}
                  </nav>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Contenu principal */}
          <main className='lg:col-span-9'>
            <motion.div
              variants={containerVariants}
              initial='hidden'
              animate='visible'
              className='space-y-8'
            >
              <AnimatePresence mode='wait'>
                {renderSectionContent()}
              </AnimatePresence>
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  )
}

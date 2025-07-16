import { NextResponse } from 'next/server';

export async function GET(request) {
  // Récupérer le paramètre de leçon s'il existe
  const { searchParams } = new URL(request.url);
  const lessonParam = searchParams.get('lesson');
  
  let lesson;
  
  // Sélectionner la leçon en fonction du paramètre
  if (lessonParam === '3') {
    // Données de la leçon 1-3 (Assistant IA dans l'apprentissage)
    lesson = {
      title: "Assistant IA pour l'apprentissage",
      description: "Intégration d'un assistant IA pour aider les étudiants pendant leur parcours d'apprentissage",
      content: `
        <h2>Pourquoi intégrer un assistant IA ?</h2>
        <p>Un assistant IA peut considérablement améliorer l'expérience d'apprentissage de vos étudiants :</p>
        
        <h3>1. Aide contextuelle</h3>
        <p>L'assistant peut fournir une aide adaptée au contexte actuel de la leçon, répondant aux questions spécifiques que l'étudiant pourrait avoir.</p>
        
        <h3>2. Disponibilité constante</h3>
        <p>Contrairement à un enseignant humain, l'assistant IA est disponible 24/7, offrant une aide immédiate quand l'étudiant en a besoin.</p>
        
        <h3>3. Personnalisation</h3>
        <p>L'assistant peut adapter ses réponses au niveau de difficulté approprié, offrant des explications plus détaillées pour les débutants et des réponses plus techniques pour les utilisateurs avancés.</p>
        
        <h3>4. Réduction de la frustration</h3>
        <p>En aidant les étudiants à surmonter rapidement les obstacles, l'assistant réduit la frustration et améliore la rétention.</p>
      `,
      example: {
        title: "Implémentation d'un assistant IA dans React/Next.js",
        code: `// Composant d'assistant IA simple
import { useState } from 'react';

export default function AIAssistant({ lessonContext }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Comment puis-je vous aider aujourd'hui ?" }
  ]);

  const handleSubmit = async () => {
    if (!query.trim()) return;
    
    // Ajouter la question à la conversation
    setMessages(prev => [...prev, { role: 'user', content: query }]);
    
    try {
      // Appeler une API d'IA (comme OpenAI ou Hugging Face)
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          lessonContext,
          history: messages
        })
      });
      
      const data = await response.json();
      
      // Ajouter la réponse à la conversation
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response 
      }]);
    } catch (error) {
      console.error('Erreur:', error);
    }
    
    setQuery('');
  };

  return (
    <>
      {/* Bouton pour ouvrir l'assistant */}
      <button 
        className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4"
        onClick={() => setIsOpen(!isOpen)}
      >
        Assistant
      </button>
      
      {/* Fenêtre de chat */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 w-80 bg-white rounded-lg shadow-lg">
          {/* Interface de chat... */}
        </div>
      )}
    </>
  );
}`,
        explanation: "Ce composant crée un assistant IA flottant qui peut être intégré dans n'importe quelle page. Il gère un état de conversation et communique avec une API backend pour obtenir les réponses de l'IA."
      },
      exercise: {
        title: "Comprendre l'intégration d'un assistant IA",
        description: "Identifiez les affirmations correctes concernant l'intégration d'un assistant IA dans une application d'apprentissage.",
        type: "multiple",
        options: [
          { id: 1, text: "Un assistant IA ne peut répondre qu'à des questions prédéfinies", correct: false },
          { id: 2, text: "Le contexte de la leçon permet des réponses plus pertinentes", correct: true },
          { id: 3, text: "L'historique de conversation n'est pas important pour un assistant IA", correct: false },
          { id: 4, text: "Un assistant IA peut aider à réduire le taux d'abandon des étudiants", correct: true },
          { id: 5, text: "Intégrer un assistant IA nécessite toujours une API externe", correct: true }
        ]
      },
      quiz: {
        title: "Quiz sur les assistants IA pédagogiques",
        questions: [
          {
            question: "Quel est l'avantage principal d'un assistant IA dans l'apprentissage ?",
            options: ["Il remplace complètement les enseignants", "Il fournit une aide contextuelle immédiate", "Il corrige automatiquement tous les exercices", "Il est moins coûteux qu'un site web standard"],
            correctAnswer: "Il fournit une aide contextuelle immédiate"
          },
          {
            question: "Comment un assistant IA peut-il améliorer l'expérience d'apprentissage ?",
            options: ["En remplaçant tout le contenu écrit", "En offrant uniquement des réponses génériques", "En répondant aux questions spécifiques des étudiants", "En empêchant les étudiants de faire des erreurs"],
            correctAnswer: "En répondant aux questions spécifiques des étudiants"
          },
          {
            question: "Quelle information est utile à transmettre à un assistant IA pédagogique ?",
            options: ["Uniquement la question de l'utilisateur", "Le contexte de la leçon actuelle", "Les données personnelles de l'étudiant", "Le code source complet de l'application"],
            correctAnswer: "Le contexte de la leçon actuelle"
          }
        ]
      },
      project: {
        title: "Créer un assistant IA simple",
        description: "Complétez le code ci-dessous pour créer un assistant IA basique qui répond à des questions prédéfinies.",
        initialCode: `import { useState } from 'react';

export default function SimpleAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  
  // Complétez cette fonction pour qu'elle réponde à au moins 3 questions prédéfinies
  // et renvoie une réponse par défaut pour les autres questions
  const getResponse = (question) => {
    // Votre code ici
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    const aiResponse = getResponse(query);
    setResponse(aiResponse);
    setQuery('');
  };
  
  return (
    <div className="max-w-md mx-auto p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">Assistant IA</h2>
      
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full p-2 border rounded-md"
          placeholder="Posez votre question..."
        />
        <button
          type="submit"
          className="mt-2 w-full bg-blue-500 text-white p-2 rounded-md"
        >
          Envoyer
        </button>
      </form>
      
      {response && (
        <div className="bg-gray-100 p-3 rounded-md">
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}`,
        solution: `import { useState } from 'react';

export default function SimpleAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  
  // Fonction pour générer une réponse basée sur la question
  const getResponse = (question) => {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('hello') || lowerQuestion.includes('bonjour')) {
      return "Bonjour ! Comment puis-je vous aider aujourd'hui ?";
    }
    
    if (lowerQuestion.includes('next.js') || lowerQuestion.includes('nextjs')) {
      return "Next.js est un framework React qui offre des fonctionnalités comme le rendu côté serveur, la génération de sites statiques, et bien plus encore.";
    }
    
    if (lowerQuestion.includes('react') || lowerQuestion.includes('component')) {
      return "React est une bibliothèque JavaScript pour créer des interfaces utilisateur. Elle est basée sur des composants réutilisables.";
    }
    
    if (lowerQuestion.includes('api') || lowerQuestion.includes('données')) {
      return "Pour accéder à des données externes dans Next.js, vous pouvez utiliser getServerSideProps, getStaticProps, ou simplement faire des requêtes fetch côté client.";
    }
    
    // Réponse par défaut si aucune correspondance n'est trouvée
    return "Je ne suis pas sûr de comprendre votre question. Pourriez-vous la reformuler ou demander quelque chose sur Next.js ou React ?";
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    const aiResponse = getResponse(query);
    setResponse(aiResponse);
    setQuery('');
  };
  
  return (
    <div className="max-w-md mx-auto p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">Assistant IA</h2>
      
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full p-2 border rounded-md"
          placeholder="Posez votre question..."
        />
        <button
          type="submit"
          className="mt-2 w-full bg-blue-500 text-white p-2 rounded-md"
        >
          Envoyer
        </button>
      </form>
      
      {response && (
        <div className="bg-gray-100 p-3 rounded-md">
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}`
      },
      duration: 30,
      difficulty: 'intermédiaire',
      prerequisites: [
        "Connaissances de base en React et Next.js",
        "Comprendre les appels API"
      ],
      tags: ["IA", "UX", "React", "Next.js", "Pédagogie"]
    };
  } else {
    // Données de la leçon 1-2 (comportement par défaut)
    lesson = {
      title: "Avantages de Next.js",
      content: `
        <h2>Pourquoi choisir Next.js ?</h2>
        <p>Next.js offre de nombreux avantages par rapport à une application React standard. Voici les principaux :</p>
        
        <h3>1. Rendu hybride</h3>
        <p>Next.js permet de choisir entre le rendu côté serveur (SSR), la génération de sites statiques (SSG), ou le rendu côté client selon les besoins de chaque page.</p>
        
        <h3>2. Optimisation des performances</h3>
        <p>Next.js intègre automatiquement des optimisations de performance comme le code splitting, le prefetching, et l'optimisation des images.</p>
        
        <h3>3. Excellent Developer Experience</h3>
        <p>Le rechargement à chaud (Hot Module Replacement), la compilation rapide et les messages d'erreur clairs améliorent considérablement l'expérience du développeur.</p>
        
        <h3>4. SEO amélioré</h3>
        <p>Grâce au rendu côté serveur, les moteurs de recherche peuvent facilement indexer votre contenu, ce qui améliore le référencement.</p>
      `,
      example: {
        title: "Exemple de code Next.js vs React standard",
        code: `// Avec React standard (client-side)
import { useEffect, useState } from 'react';

function HomePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      });
  }, []);
  
  if (loading) return <p>Chargement...</p>;
  return <div>{data.title}</div>;
}

// Avec Next.js (getServerSideProps)
export async function getServerSideProps() {
  const res = await fetch('https://api.example.com/data');
  const data = await res.json();
  return { props: { data } };
}

function HomePage({ data }) {
  return <div>{data.title}</div>;
}`,
        explanation: "Dans l'exemple ci-dessus, la version Next.js charge les données côté serveur avant que la page ne soit envoyée au client, ce qui élimine l'état de chargement et améliore le SEO."
      },
      exercise: {
        title: "Identifier les avantages de Next.js",
        description: "Parmi les affirmations suivantes, identifiez celles qui sont correctes concernant Next.js.",
        type: "multiple",
        options: [
          { id: 1, text: "Next.js ne permet que le rendu côté serveur", correct: false },
          { id: 2, text: "Next.js est plus difficile à configurer que React", correct: false },
          { id: 3, text: "Le routage basé sur les fichiers simplifie la structure du projet", correct: true },
          { id: 4, text: "L'optimisation des images est intégrée à Next.js", correct: true },
          { id: 5, text: "Next.js n'est pas compatible avec les API RESTful", correct: false }
        ]
      },
      quiz: {
        title: "Quiz sur les avantages de Next.js",
        questions: [
          {
            question: "Quel type de rendu Next.js permet-il ?",
            options: ["Uniquement SSR", "Uniquement CSR", "Uniquement SSG", "SSR, SSG et CSR"],
            correctAnswer: "SSR, SSG et CSR"
          },
          {
            question: "Quelle fonctionnalité Next.js facilite le routage ?",
            options: ["Routes manuelles", "Système de fichiers", "Configuration externe", "Middleware uniquement"],
            correctAnswer: "Système de fichiers"
          },
          {
            question: "Comment Next.js améliore-t-il les performances ?",
            options: ["En ignorant le SEO", "En limitant les fonctionnalités React", "Par le code splitting automatique", "En désactivant JavaScript"],
            correctAnswer: "Par le code splitting automatique"
          }
        ]
      },
      project: {
        title: "Comparer React et Next.js",
        description: "Complétez le code pour afficher un tableau comparatif entre React standard et Next.js.",
        initialCode: `export default function Comparison() {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Comparaison React vs Next.js</h2>
      
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-left">Fonctionnalité</th>
            <th className="border p-2 text-left">React</th>
            <th className="border p-2 text-left">Next.js</th>
          </tr>
        </thead>
        <tbody>
          {/* Ajoutez au moins 5 lignes de comparaison */}
        </tbody>
      </table>
    </div>
  );
}`,
        solution: `export default function Comparison() {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Comparaison React vs Next.js</h2>
      
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-left">Fonctionnalité</th>
            <th className="border p-2 text-left">React</th>
            <th className="border p-2 text-left">Next.js</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border p-2">Rendu</td>
            <td className="border p-2">Client-side par défaut</td>
            <td className="border p-2">SSR, SSG et CSR</td>
          </tr>
          <tr>
            <td className="border p-2">Routage</td>
            <td className="border p-2">Nécessite React Router</td>
            <td className="border p-2">Basé sur le système de fichiers</td>
          </tr>
          <tr>
            <td className="border p-2">Configuration</td>
            <td className="border p-2">Nécessite Webpack, Babel, etc.</td>
            <td className="border p-2">Configuration zéro pour démarrer</td>
          </tr>
          <tr>
            <td className="border p-2">Optimisation d'images</td>
            <td className="border p-2">Manuelle</td>
            <td className="border p-2">Intégrée avec le composant Image</td>
          </tr>
          <tr>
            <td className="border p-2">SEO</td>
            <td className="border p-2">Difficile sans bibliothèques tierces</td>
            <td className="border p-2">Amélioré grâce au SSR</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}`
      }
    };
  }

  // Ajouter un message de diagnostic pour tracer l'accès à ce point API
  console.log(`API Route directe pour la leçon 1-${lessonParam || '2'} accédée avec succès`);

  return NextResponse.json(lesson);
}
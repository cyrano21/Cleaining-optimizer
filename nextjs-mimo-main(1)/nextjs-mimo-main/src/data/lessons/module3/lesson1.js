const lesson1 = {
  id: '3-1',
  title: 'Introduction aux composants React',
  description: 'Apprendre les bases des composants React et leur utilisation',
  difficulty: 'débutant',
  duration: 35,
  tags: ['React', 'Composants', 'JSX', 'Props'],
  prerequisites: ['2-1', '2-2', '2-3'],
  content: `
    <h2>Qu'est-ce qu'un composant React ?</h2>
    <p>Un composant React est une brique réutilisable qui retourne des éléments React (généralement du JSX) à afficher à l'écran. Les composants permettent de diviser l'interface utilisateur en parties indépendantes et réutilisables.</p>
    
    <h3>Types de composants</h3>
    
    <h4>1. Composants fonctionnels</h4>
    <p>Les composants fonctionnels sont des fonctions JavaScript qui retournent du JSX :</p>
    <pre><code>function Bienvenue(props) {
  return <h1>Bonjour, {props.nom}</h1>;
}</code></pre>

    <h4>2. Composants de classe</h4>
    <p>Les composants de classe sont des classes ES6 qui étendent <code>React.Component</code> :</p>
    <pre><code>class Bienvenue extends React.Component {
  render() {
    return <h1>Bonjour, {this.props.nom}</h1>;
  }
}</code></pre>

    <h3>JSX</h3>
    <p>Le JSX est une extension de syntaxe pour JavaScript qui ressemble à du HTML. Il permet d'écrire du balisage à l'intérieur de votre code JavaScript.</p>
    
    <h3>Les props</h3>
    <p>Les props (propriétés) sont des données passées d'un composant parent à un composant enfant. Elles sont en lecture seule et ne doivent pas être modifiées par le composant enfant.</p>
    
    <h3>Rendu conditionnel</h3>
    <p>Vous pouvez utiliser des opérateurs JavaScript comme <code>&&</code> ou l'opérateur ternaire pour effectuer du rendu conditionnel :</p>
    <pre><code>{isLoggedIn ? <DeconnexionBouton /> : <ConnexionBouton />}</code></pre>
    
    <h3>Listes et clés</h3>
    <p>Pour afficher des listes d'éléments, utilisez <code>map()</code> et n'oubliez pas d'ajouter une prop <code>key</code> unique à chaque élément :</p>
    <pre><code>{nombres.map((nombre) => 
  <li key={nombre.id}>{nombre.valeur}</li>
)}</code></pre>
  `,
  example: {
    title: 'Exemple de composant utilisateur',
    code: `// Composant fonctionnel avec props
export default function Utilisateur({ nom, age, estConnecte, competences }) {
  return (
    <div className="utilisateur">
      <h2>Profil de {nom}</h2>
      <p>Âge : {age} ans</p>
      
      {/* Rendu conditionnel */}
      <p>Statut : {estConnecte ? 'En ligne' : 'Hors ligne'}</p>
      
      {/* Liste avec clé */}
      <h3>Compétences :</h3>
      <ul>
        {competences.map((competence, index) => (
          <li key={index}>{competence}</li>
        ))}
      </ul>
      
      {/* Composant enfant */}
      <Statistiques utilisateur={{ nom, age }} />
    </div>
  );
}

// Composant enfant pour les statistiques
function Statistiques({ utilisateur }) {
  return (
    <div className="statistiques">
      <h4>Statistiques de {utilisateur.nom}</h4>
      <p>Âge dans 5 ans : {utilisateur.age + 5}</p>
    </div>
  );
}

// Utilisation du composant
// <Utilisateur 
//   nom="Alice" 
//   age={28} 
//   estConnecte={true} 
//   competences={['React', 'JavaScript', 'CSS']} 
// />`,
    explanation: 'Cet exemple montre un composant fonctionnel React qui utilise des props, du rendu conditionnel, des listes et des composants enfants.'
  },
  exercise: {
    title: 'Créer un composant Article',
    description: 'Créez un composant Article qui affiche un titre, un auteur, une date de publication et le contenu de l\'article. Ajoutez également la possibilité d\'afficher ou masquer le contenu avec un bouton.',
    initialCode: `function Article({ titre, auteur, date, contenu }) {
  // À implémenter
  // - Afficher le titre, l'auteur et la date
  // - Ajouter un bouton pour afficher/masquer le contenu
  // - Afficher le contenu seulement si l'utilisateur clique sur le bouton
  return (
    <div className="article">
      {/* Votre code ici */}
    </div>
  );
}

// Exemple d'utilisation :
// <Article 
//   titre="Introduction à React"
//   auteur="Jean Dupont"
//   date="2023-05-15"
//   contenu="React est une bibliothèque JavaScript pour construire des interfaces utilisateur..."
// />`,
    solution: `import { useState } from 'react';

function Article({ titre, auteur, date, contenu }) {
  const [afficherContenu, setAfficherContenu] = useState(false);
  
  const toggleContenu = () => {
    setAfficherContenu(!afficherContenu);
  };
  
  return (
    <div className="article" style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '16px',
      maxWidth: '600px'
    }}>
      <h2 style={{ marginTop: 0 }}>{titre}</h2>
      <p style={{ color: '#666', fontStyle: 'italic' }}>
        Par {auteur} • {new Date(date).toLocaleDateString('fr-FR')}
      </p>
      
      <button 
        onClick={toggleContenu}
        style={{
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '12px'
        }}
      >
        {afficherContenu ? 'Masquer le contenu' : 'Afficher le contenu'}
      </button>
      
      {afficherContenu && (
        <div className="contenu" style={{
          borderTop: '1px solid #eee',
          paddingTop: '12px'
        }}>
          {contenu}
        </div>
      )}
    </div>
  );
}

// Exemple d'utilisation :
// <Article 
//   titre="Introduction à React"
//   auteur="Jean Dupont"
//   date="2023-05-15"
//   contenu="React est une bibliothèque JavaScript pour construire des interfaces utilisateur. Elle est maintenue par Facebook et une communauté de développeurs individuels et d'entreprises."
// />`,
    tasks: [
      'Créer un composant fonctionnel Article',
      'Afficher les props (titre, auteur, date)',
      'Implémenter un état pour afficher/masquer le contenu',
      'Ajouter un bouton pour basculer l\'affichage',
      'Mettre en forme le composant avec du style en ligne'
    ]
  },
  quiz: {
    title: 'Quiz sur les composants React',
    questions: [
      {
        question: 'Quelle est la différence principale entre un composant fonctionnel et un composant de classe ?',
        options: [
          'Les composants fonctionnels ne peuvent pas avoir d\'état',
          'Les composants de classe ne peuvent pas utiliser les hooks',
          'Les composants fonctionnels sont plus rapides',
          'Il n\'y a plus de différence depuis l\'introduction des hooks'
        ],
        correctAnswer: 'Il n\'y a plus de différence depuis l\'introduction des hooks',
        explanation: 'Avant les hooks, les composants de classe étaient nécessaires pour utiliser l\'état et les méthodes de cycle de vie. Maintenant, les composants fonctionnels peuvent faire la même chose avec les hooks.'
      },
      {
        question: 'Quelle est la bonne façon de passer une prop à un composant ?',
        options: [
          '<Composant props={nom: "Alice"} />',
          '<Composant {nom: "Alice"} />',
          '<Composant nom="Alice" />',
          '<Composant>nom="Alice"</Composant>'
        ],
        correctAnswer: '<Composant nom="Alice" />'
      },
      {
        question: 'Pourquoi est-il important d\'utiliser une clé unique lors du rendu de listes ?',
        options: [
          'Pour améliorer les performances de rendu',
          'Pour éviter les erreurs dans la console',
          'Pour permettre à React d\'identifier les éléments de manière unique',
          'Toutes ces réponses'
        ],
        correctAnswer: 'Toutes ces réponses',
        explanation: 'Les clés aident React à identifier quels éléments ont changé, sont ajoutés ou sont supprimés. Cela améliore les performances et évite les erreurs.'
      }
    ]
  },
  hasExercise: true,
  hasQuiz: true,
  hasProject: false
};

export default lesson1;

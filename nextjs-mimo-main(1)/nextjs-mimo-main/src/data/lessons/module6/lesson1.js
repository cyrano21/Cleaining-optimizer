const lesson1 = {
  id: '6-1',
  title: 'App Router vs Pages Router dans Next.js',
  description: 'Comprendre les différences fondamentales, les avantages et les cas d\'usage des deux systèmes de routage de Next.js.',
  difficulty: 'intermédiaire',
  duration: 30,
  tags: ['Next.js', 'Routing', 'App Router', 'Pages Router', 'Architecture'],
  prerequisites: ['1-3'], // Compréhension de base du routage Next.js (Pages Router)
  content: `
    <h2>Les Deux Systèmes de Routage de Next.js</h2>
    <p>Next.js a évolué et propose désormais deux approches pour structurer le routage de votre application : le traditionnel <strong>Pages Router</strong> et le plus récent et puissant <strong>App Router</strong>.</p>
    <p>Il est crucial de comprendre leurs différences pour choisir la bonne approche pour vos projets ou pour migrer des projets existants.</p>

    <h3>Caractéristiques du Pages Router (<code>pages/</code>)</h3>
    <ul>
      <li>Système de routage basé sur les fichiers et dossiers dans le répertoire <code>pages/</code>.</li>
      <li>Chaque fichier JS/TSX exportant un composant React devient une route.</li>
      <li>Gestion des layouts globaux via <code>pages/_app.js</code>.</li>
      <li>Configuration HTML globale via <code>pages/_document.js</code>.</li>
      <li>API Routes gérées dans <code>pages/api/</code>.</li>
      <li>Méthodes de data fetching spécifiques aux pages : <code>getServerSideProps</code>, <code>getStaticProps</code>, <code>getStaticPaths</code>.</li>
    </ul>

    <h3>Caractéristiques de l'App Router (<code>app/</code>)</h3>
    <p>Introduit dans Next.js 13, l'App Router est construit sur les <a href="https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components" target="_blank" rel="noopener noreferrer">React Server Components</a> et offre de nouvelles fonctionnalités :</p>
    <ul>
      <li>Structure de routage également basée sur les dossiers dans le répertoire <code>app/</code>.</li>
      <li>Fichiers spéciaux pour définir l'UI d'une route : <code>page.js</code> (UI unique à une route), <code>layout.js</code> (UI partagée), <code>template.js</code>, <code>loading.js</code> (UI de chargement), <code>error.js</code> (UI d'erreur).</li>
      <li>Utilise les Server Components par défaut, permettant de réduire le JavaScript envoyé au client.</li>
      <li>Layouts imbriqués et hiérarchiques de manière native.</li>
      <li>Streaming UI avec Suspense pour des chargements progressifs.</li>
      <li>Data fetching simplifié et intégré aux Server Components (souvent avec async/await directement dans le composant).</li>
      <li>Route Handlers (équivalents des API Routes) peuvent coexister avec les pages.</li>
    </ul>
    
    <h3>Quand utiliser lequel ?</h3>
    <ul>
      <li><strong>App Router :</strong> Recommandé pour les nouveaux projets Next.js en raison de ses fonctionnalités modernes et de ses optimisations de performance.</li>
      <li><strong>Pages Router :</strong> Toujours supporté et stable. Peut être maintenu pour les projets existants, ou utilisé si certaines bibliothèques tierces n'ont pas encore une compatibilité parfaite avec l'App Router (de plus en plus rare). Une migration progressive est possible.</li>
    </ul>
  `,
  example: {
    title: 'Structure d\'une page simple avec l\'App Router',
    code: `// app/about/page.jsx
// Ce fichier définit l'interface utilisateur pour la route '/about'

export default function AboutPage() {
  return (
    <div>
      <h1>À Propos de Nous</h1>
      <p>Ceci est la page "À Propos" construite avec l'App Router.</p>
    </div>
  );
}

// Pour accéder à cette page, naviguez vers /about dans votre application.
// Un layout.jsx peut exister dans app/ ou app/about/ pour envelopper cette page.
`,
    explanation: 'Dans l\'App Router, un fichier `page.jsx` (ou `.js`, `.tsx`, `.ts`) dans un dossier définit l\'UI principale pour cette route. Par exemple, `app/dashboard/settings/page.js` correspondrait à la route `/dashboard/settings`.'
  },
  exercise: {
    title: 'Migrer une page simple du Pages Router vers l\'App Router',
    description: 'Prenez une page simple existante définie dans le `pages/` directory et migrez-la vers la nouvelle structure de l\'`app/` directory.',
    initialCode: `// Ancien fichier: pages/contact.js
import React, { useState } from 'react';

export default function ContactPageOld() {
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logique de soumission (simulation)
    console.log('Message envoyé:', message);
    setSubmitted(true);
    setMessage('');
  };

  return (
    <div>
      <h1>Contactez-nous (Pages Router)</h1>
      {!submitted ? (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="message">Votre message:</label>
            <textarea 
              id="message" 
              value={message} 
              onChange={(e) => setMessage(e.target.value)} 
              rows="4" 
              required 
            />
          </div>
          <button type="submit">Envoyer</button>
        </form>
      ) : (
        <p>Merci pour votre message ! Nous vous répondrons bientôt.</p>
      )}
    </div>
  );
}`,
    solution: `// Nouveau fichier: app/contact/page.jsx
// 'use client' // Nécessaire si vous utilisez des hooks comme useState, useEffect

import React, { useState } from 'react'; // useState rend ce composant un Client Component

export default function ContactPageNew() {
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Message envoyé:', message);
    setSubmitted(true);
    setMessage('');
  };

  return (
    <div>
      <h1>Contactez-nous (App Router)</h1>
      {!submitted ? (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="message">Votre message:</label>
            <textarea 
              id="message" 
              value={message} 
              onChange={(e) => setMessage(e.target.value)} 
              rows="4" 
              required 
              style={{ width: '100%', padding: '8px', marginTop: '4px' }}
            />
          </div>
          <button 
            type="submit" 
            style={{ marginTop: '10px', padding: '10px 15px', cursor: 'pointer' }}
          >
            Envoyer
          </button>
        </form>
      ) : (
        <p>Merci pour votre message ! Nous vous répondrons bientôt.</p>
      )}
    </div>
  );
}

// Note: Si cette page n'utilisait pas d'interactivité client (hooks, event handlers),
// elle serait un Server Component par défaut et n'aurait pas besoin de 'use client'.
// La directive 'use client' doit être en haut du fichier.
// Pour cet exercice, comme on utilise useState, il faut la directive 'use client'.
// Assurez-vous d'ajouter 'use client'; au début du fichier si vous copiez-collez.
`,
  },
  quiz: {
    title: 'Quiz sur les fondamentaux du routage Next.js',
    questions: [
      {
        question: 'Quel est le nom du répertoire principal utilisé par le nouveau système de routage App Router ?',
        options: ['pages/', 'src/routes/', 'app/', 'components/routes/'],
        correctAnswer: 'app/',
      },
      {
        question: 'Dans l\'App Router, quel nom de fichier est conventionnellement utilisé pour définir l\'UI principale d\'une route ?',
        options: ['index.js', 'route.js', 'page.js', 'main.js'],
        correctAnswer: 'page.js',
      },
      {
        question: 'Quel avantage majeur les Server Components (par défaut dans l\'App Router) offrent-ils ?',
        options: ['Ils s\'exécutent uniquement dans le navigateur du client.', 'Ils permettent de réduire la quantité de JavaScript envoyée au client et d\'accéder directement aux ressources backend.', 'Ils sont plus faciles à styliser avec CSS.', 'Ils remplacent complètement le besoin de JavaScript.'],
        correctAnswer: 'Ils permettent de réduire la quantité de JavaScript envoyée au client et d\'accéder directement aux ressources backend.',
      },
    ],
  },
  hasExercise: true,
  hasQuiz: true,
  hasProject: false // Pas de projet spécifique pour cette leçon introductive
};

export default lesson1;
// src/data/lessons/module6/lesson2.js
const lesson2 = {
  id: '6-2',
  title: 'Migration du Pages Router vers l\'App Router',
  description: 'Un guide pratique pour migrer une application Next.js existante du Pages Router vers le nouveau App Router, étape par étape.',
  difficulty: 'intermédiaire',
  duration: 45,
  tags: ['Next.js', 'Migration', 'App Router', 'Pages Router', 'Refactoring'],
  prerequisites: ['6-1'], // Doit comprendre les différences avant de migrer
  content: `
    <h2>Pourquoi et Comment Migrer vers l'App Router ?</h2>
    <p>Migrer vers l'App Router peut sembler intimidant, mais cela apporte des avantages significatifs en termes de performance, d'expérience développeur et de fonctionnalités (layouts imbriqués, streaming, Server Components).</p>

    <h3>Avantages de la Migration :</h3>
    <ul>
      <li><strong>Server Components par défaut :</strong> Réduit le JavaScript côté client.</li>
      <li><strong>Layouts Imbriqués :</strong> Gestion simplifiée des mises en page partagées et hiérarchiques.</li>
      <li><strong>Streaming UI & Suspense :</strong> Améliore la performance perçue en affichant l'UI progressivement.</li>
      <li><strong>Data Fetching Amélioré :</strong> Intégration plus directe avec async/await dans les Server Components.</li>
      <li><strong>Gestion des Erreurs et Chargements :</strong> Fichiers dédiés (<code>error.js</code>, <code>loading.js</code>) pour une meilleure UX.</li>
    </ul>

    <h3>Étapes Clés de la Migration (Progressive) :</h3>
    <ol>
      <li><strong>Préparation :</strong> Mettez à jour Next.js vers la dernière version compatible avec l'App Router. Assurez-vous que votre projet est stable.</li>
      <li><strong>Créer le dossier <code>app/</code> :</strong> Ajoutez un dossier <code>app</code> à la racine de votre projet. L'App Router et le Pages Router peuvent coexister pendant la migration.</li>
      <li><strong>Créer un Layout Racine (<code>app/layout.js</code>) :</strong> Ce fichier est obligatoire et remplace la fonctionnalité de <code>pages/_app.js</code> et <code>pages/_document.js</code> pour la structure HTML de base (<code><html></code>, <code><body></code>) et les providers globaux.</li>
      <li><strong>Migrer les Pages une par une :</strong>
        <ul>
          <li>Choisissez une page simple du dossier <code>pages/</code>.</li>
          <li>Créez la structure de dossier correspondante dans <code>app/</code>. Par exemple, <code>pages/about.js</code> devient <code>app/about/page.js</code>.</li>
          <li>Adaptez le contenu du composant. Si la page utilise des hooks React (<code>useState</code>, <code>useEffect</code>) ou des gestionnaires d'événements, ajoutez la directive <code>'use client';</code> en haut du fichier.</li>
          <li>Migrez le data fetching : <code>getServerSideProps</code> et <code>getStaticProps</code> sont remplacés par le data fetching direct dans les Server Components (ou des approches alternatives pour les Client Components).</li>
        </ul>
      </li>
      <li><strong>Migrer les API Routes :</strong> Les API Routes de <code>pages/api/</code> peuvent généralement rester telles quelles ou être migrées vers des Route Handlers dans <code>app/api/</code> (ou des dossiers similaires dans <code>app/</code>).</li>
      <li><strong>Tester Rigoureusement :</strong> Après chaque migration de page ou de fonctionnalité, testez attentivement.</li>
      <li><strong>Supprimer l'Ancien Code :</strong> Une fois toutes les pages migrées et testées, vous pouvez supprimer le dossier <code>pages/</code> (sauf pour <code>pages/api/</code> si vous ne les avez pas migrés).</li>
    </ol>
  `,
  example: {
    title: 'Exemple de Layout Racine pour l\'App Router',
    code: `// app/layout.jsx
// Ce fichier est obligatoire dans l'App Router.

// Optionnel: Importer des styles globaux
// import '../styles/globals.css'; 

// Optionnel: Importer des polices avec next/font
// import { Inter } from 'next/font/google';
// const inter = Inter({ subsets: ['latin'] });

export const metadata = { // Nouvelle façon de gérer les métadonnées
  title: 'Mon Application Next.js',
  description: 'Une super application construite avec Next.js App Router',
};

export default function RootLayout({ children }) {
  // children représente le contenu de la page.js ou d'un layout imbriqué
  return (
    <html lang="fr">
      {/* <body className={inter.className}> // Exemple avec next/font */}
      <body>
        <header style={{ padding: '1rem', backgroundColor: '#f0f0f0', borderBottom: '1px solid #ccc' }}>
          <nav>
            {/* Utilisez <Link> de next/link pour la navigation */}
            <a href="/" style={{ marginRight: '1rem' }}>Accueil</a>
            <a href="/about" style={{ marginRight: '1rem' }}>À Propos</a>
            {/* ... autres liens ... */}
          </nav>
        </header>
        
        <main style={{ padding: '1rem' }}>
          {children} 
        </main>
        
        <footer style={{ padding: '1rem', backgroundColor: '#333', color: 'white', textAlign: 'center', marginTop: '2rem' }}>
          <p>&copy; ${new Date().getFullYear()} Mon Application</p>
        </footer>
      </body>
    </html>
  );
}`,
    explanation: 'Le fichier `layout.jsx` (ou `.tsx`) dans le dossier `app/` définit la structure HTML globale (<html>, <body>) et peut inclure des UI partagées comme un header et un footer. Il reçoit les `children` qui seront le contenu de la page actuelle ou d\'un layout imbriqué.'
  },
  exercise: {
    title: 'Créer un Layout Global avec Navigation',
    description: 'Implémentez un `RootLayout` pour votre application dans l\'App Router. Ce layout doit inclure une balise `<html>` avec un attribut `lang`, une balise `<body>`, un simple header avec des liens de navigation (Accueil, À Propos, Contact) et un footer.',
    initialCode: `// app/layout.jsx
// TODO: Importer les métadonnées si nécessaire
// export const metadata = { ... };

export default function RootLayout({ children }) {
  return (
    // TODO: Définir la structure <html> et <body>
    // TODO: Ajouter un <header> avec des liens de navigation (simples <a> pour l'exercice)
    // TODO: Rendre les {children} dans un <main>
    // TODO: Ajouter un <footer>
    <html lang="en">
      <body>
        <p>Contenu du Layout à implémenter</p>
        {children}
      </body>
    </html>
  );
}`,
    solution: `// app/layout.jsx
import Link from 'next/link'; // Importez Link pour la navigation optimisée

export const metadata = {
  title: 'Mon Application Migrée',
  description: 'Apprendre la migration vers l\'App Router',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        {/* Next.js gère la balise <title> via metadata, 
            mais vous pouvez ajouter d'autres éléments <head> ici si besoin */}
      </head>
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', lineHeight: 1.6 }}>
        <header 
          style={{ 
            backgroundColor: '#2c3e50', 
            color: 'white', 
            padding: '1em',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ fontSize: '1.5em', fontWeight: 'bold' }}>
            <Link href="/" style={{ color: 'white', textDecoration: 'none' }}>
              Mon App
            </Link>
          </div>
          <nav>
            <Link href="/" style={navLinkStyle}>Accueil</Link>
            <Link href="/about" style={navLinkStyle}>À Propos</Link>
            <Link href="/contact" style={navLinkStyle}>Contact</Link>
          </nav>
        </header>

        <main style={{ padding: '1.5em', minHeight: '70vh' }}>
          {children}
        </main>

        <footer 
          style={{ 
            backgroundColor: '#34495e', 
            color: 'white', 
            textAlign: 'center', 
            padding: '1em', 
            marginTop: 'auto' 
          }}
        >
          <p>&copy; ${new Date().getFullYear()} Mon Application. Tous droits réservés.</p>
        </footer>
      </body>
    </html>
  );
}

const navLinkStyle = {
  color: 'white',
  textDecoration: 'none',
  marginLeft: '1em',
  padding: '0.5em 0',
  borderBottom: '2px solid transparent',
  transition: 'border-color 0.3s ease'
};

// Pour un effet hover simple (CSS serait mieux pour ça)
// Vous pouvez ajouter des gestionnaires d'événements ou utiliser des bibliothèques CSS-in-JS
// navLinkStyle[':hover'] = { borderBottomColor: '#3498db' };
`,
  },
  quiz: {
    title: 'Quiz sur la migration vers l\'App Router',
    questions: [
      {
        question: 'Quel fichier est obligatoire à la racine du dossier `app/` dans l\'App Router ?',
        options: ['page.js', 'layout.js', 'template.js', 'route.js'],
        correctAnswer: 'layout.js',
        explanation: 'Un `layout.js` (ou `.tsx`) à la racine de `app/` est requis car il définit les balises `<html>` et `<body>`.'
      },
      {
        question: 'Comment Next.js différencie-t-il un Server Component d\'un Client Component dans l\'App Router ?',
        options: ['Par l\'extension de fichier (.server.js vs .client.js).', 'Tous les composants sont des Server Components par défaut; un Client Component doit avoir la directive "use client" en haut du fichier.', 'Tous les composants sont des Client Components par défaut; un Server Component doit avoir la directive "use server".', 'En utilisant le hook `useServerComponent()`.'],
        correctAnswer: 'Tous les composants sont des Server Components par défaut; un Client Component doit avoir la directive "use client" en haut du fichier.',
      },
      {
        question: 'Laquelle de ces affirmations est VRAIE concernant la coexistence du Pages Router et de l\'App Router pendant la migration ?',
        options: ['Il est impossible de les faire coexister; la migration doit être faite en une seule fois.', 'Ils peuvent coexister, et Next.js donnera la priorité aux routes définies dans l\'App Router en cas de conflit.', 'Ils peuvent coexister, mais le Pages Router prendra toujours la priorité.', 'Seules les API Routes peuvent coexister.'],
        correctAnswer: 'Ils peuvent coexister, et Next.js donnera la priorité aux routes définies dans l\'App Router en cas de conflit.',
        explanation: 'Next.js permet une migration progressive. En cas de routes conflictuelles, l\'App Router a la priorité sur le Pages Router.'
      },
    ],
  },
  hasExercise: true,
  hasQuiz: true,
  hasProject: true // Un projet de migration d'une petite application serait pertinent
};

export default lesson2;
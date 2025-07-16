// src/data/lessons/module7/lesson2.js
const lesson2 = {
  id: '7-2',
  title: 'Gestion des Sessions Utilisateur avec NextAuth.js',
  description: 'Apprenez à gérer, maintenir et utiliser les sessions utilisateur dans une application Next.js après l\'authentification avec NextAuth.js.',
  difficulty: 'avancé',
  duration: 60,
  tags: ['Next.js', 'Sessions', 'Authentification', 'NextAuth.js', 'Sécurité', 'Client Components'],
  prerequisites: ['7-1'], // Nécessite la compréhension de la mise en place de l'authentification
  content: `
    <h2>Gestion des Sessions avec NextAuth.js</h2>
    <p>Une fois qu'un utilisateur est authentifié, sa session doit être gérée pour maintenir son état de connexion à travers les différentes requêtes et visites. NextAuth.js simplifie grandement cette gestion, que ce soit avec des JSON Web Tokens (JWT) ou des sessions stockées en base de données.</p>

    <h3>Accéder à la Session Côté Client</h3>
    <p>Dans les composants React côté client (Client Components), le hook <code>useSession</code> de <code>next-auth/react</code> est le moyen le plus simple d'accéder aux données de la session.</p>
    <p>N'oubliez pas d'envelopper votre application (ou une partie) avec le <code>&lt;SessionProvider&gt;</code> dans votre layout racine ou un layout parent.</p>
    <pre><code class="language-javascript">// Exemple: components/UserProfile.jsx
'use client'; // Ce composant utilise des hooks client

import { useSession, signIn, signOut } from 'next-auth/react';

export default function UserProfile() {
  const { data: session, status } = useSession(); // status peut être 'loading', 'authenticated', 'unauthenticated'

  if (status === 'loading') {
    return <p>Chargement des informations utilisateur...</p>;
  }

  if (session) { // L'utilisateur est connecté
    return (
      <div>
        {session.user.image && (
          <img 
            src={session.user.image} 
            alt={\`Profil de \${session.user.name || session.user.email}\`} 
            style={{ width: '50px', height: '50px', borderRadius: '50%' }} 
          />
        )}
        <p>Bienvenue, <strong>{session.user.name || session.user.email}</strong> !</p>
        <p>Vous êtes connecté avec : {session.user.email}</p>
        <button 
          onClick={() => signOut()} 
          style={{ backgroundColor: 'red', color: 'white', padding: '8px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Se déconnecter
        </button>
      </div>
    );
  }

  // L'utilisateur n'est pas connecté
  return (
    <div>
      <p>Vous n'êtes pas connecté.</p>
      <button 
        onClick={() => signIn()} // Redirige vers la page de connexion NextAuth.js ou une page custom
        style={{ backgroundColor: 'green', color: 'white', padding: '8px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        Se connecter
      </button>
    </div>
  );
}
</code></pre>

    <h3>Accéder à la Session Côté Serveur (App Router)</h3>
    <p>Dans les Server Components, les Route Handlers, ou les Server Actions, vous pouvez utiliser <code>getServerSession</code> de <code>next-auth/next</code>.</p>
    <pre><code class="language-javascript">// Exemple: app/admin/page.jsx (Server Component)
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]/route'; // Ajustez le chemin
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/api/auth/signin?callbackUrl=/admin');
  }

  // Si l'utilisateur n'a pas le rôle admin (supposant que vous ajoutiez un rôle à la session)
  // if (session.user.role !== 'admin') {
  //   redirect('/unauthorized'); 
  // }

  return (
    <div>
      <h1>Page d'Administration</h1>
      <p>Bienvenue, Admin {session.user.name || session.user.email} !</p>
      {/* Contenu spécifique à l'admin */}
    </div>
  );
}
</code></pre>

    <h3>Stratégies de Session : JWT vs Database</h3>
    <p>NextAuth.js supporte deux stratégies principales pour les sessions :</p>
    <ul>
      <li><strong>JWT (par défaut) :</strong> La session est stockée dans un JWT signé et encodé, généralement dans un cookie HttpOnly. C'est sans état (stateless) côté serveur après la connexion initiale.</li>
      <li><strong>Database :</strong> Les informations de session sont stockées dans une base de données. Un identifiant de session est stocké dans un cookie. Nécessite un adaptateur de base de données (ex: Prisma Adapter, TypeORM Adapter). Utile si vous avez besoin de révoquer des sessions ou de stocker plus de données de session.</li>
    </ul>
    <p>Le choix dépend des besoins de votre application. Vous pouvez configurer cela dans <code>authOptions</code>.</p>
  `,
  example: {
    title: 'Middleware de Protection de Route basé sur la Session',
    code: `// Fichier: middleware.js (à la racine de votre projet)
// Cette version utilise l'export par défaut de next-auth/middleware pour une protection simple.
// Pour une logique plus complexe, vous pouvez écrire une fonction middleware personnalisée.

export { default } from "next-auth/middleware";

// Applique le middleware aux routes spécifiées.
// Les utilisateurs non authentifiés seront redirigés vers la page de connexion
// configurée dans NextAuth.js (par défaut /api/auth/signin).
export const config = {
  matcher: [
    '/dashboard/:path*', // Protège toutes les sous-routes de /dashboard
    '/profile',          // Protège la page /profile
    // '/api/secure-data' // Exemple de protection d'une API Route
  ],
};

/*
// Si vous avez besoin d'une logique plus personnalisée dans le middleware :
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = request.nextUrl;

  // Si l'utilisateur n'est pas authentifié ET essaie d'accéder à une route protégée
  if (!token && (pathname.startsWith('/dashboard') || pathname === '/profile')) {
    const loginUrl = new URL('/api/auth/signin', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname); // Pour rediriger l'utilisateur après la connexion
    return NextResponse.redirect(loginUrl);
  }

  // Si l'utilisateur est authentifié ET essaie d'accéder à la page de connexion (optionnel)
  // if (token && (pathname === '/login' || pathname === '/api/auth/signin')) {
  //   return NextResponse.redirect(new URL('/dashboard', request.url));
  // }

  return NextResponse.next();
}

// Le matcher reste le même
// export const config = { matcher: [...] };
*/`,
    explanation: 'Ce middleware Next.js utilise la fonctionnalité intégrée de `next-auth/middleware` pour protéger les routes commençant par `/dashboard/` et la route `/profile`. Les utilisateurs non authentifiés qui tentent d\'accéder à ces routes seront automatiquement redirigés vers la page de connexion configurée dans NextAuth.js. Une version alternative plus manuelle avec `getToken` est aussi commentée.'
  },
  exercise: {
    title: 'Créer un Composant Affichant l\'État de Connexion et un Bouton de Déconnexion',
    description: 'Implémentez un composant React qui affiche si l\'utilisateur est connecté, son nom/email si c\'est le cas, et un bouton pour se déconnecter. S\'il n\'est pas connecté, il affiche un bouton pour se connecter.',
    initialCode: `// components/AuthStatus.jsx
'use client'; // Ce composant sera interactif

import { useSession, signIn, signOut } from 'next-auth/react';

export default function AuthStatus() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <p>Vérification du statut...</p>;
  }

  // TODO:
  // 1. Si 'session' existe (utilisateur connecté) :
  //    - Afficher "Connecté en tant que {session.user.name || session.user.email}"
  //    - Afficher un bouton "Se déconnecter" qui appelle signOut()
  // 2. Sinon (utilisateur non connecté) :
  //    - Afficher "Vous n'êtes pas connecté."
  //    - Afficher un bouton "Se connecter" qui appelle signIn()

  return (
    <div style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px', textAlign: 'center' }}>
      {/* Votre logique d'affichage ici */}
      <p>Implémentez l'affichage ici.</p>
    </div>
  );
}`,
    solution: `// components/AuthStatus.jsx
'use client';

import { useSession, signIn, signOut } from 'next-auth/react';

export default function AuthStatus() {
  const { data: session, status } = useSession();

  const buttonStyle = {
    padding: '8px 15px',
    margin: '5px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
  };

  const loginButtonStyle = { ...buttonStyle, backgroundColor: '#28a745', color: 'white' };
  const logoutButtonStyle = { ...buttonStyle, backgroundColor: '#dc3545', color: 'white' };

  if (status === 'loading') {
    return <p style={{ fontStyle: 'italic' }}>Vérification du statut d'authentification...</p>;
  }

  if (session) {
    return (
      <div style={{ padding: '15px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
        <p style={{ margin: '0 0 10px 0' }}>
          Connecté en tant que : <strong>{session.user?.name || session.user?.email}</strong>
        </p>
        {session.user?.image && 
          <img 
            src={session.user.image} 
            alt="Avatar" 
            style={{ width: '40px', height: '40px', borderRadius: '50%', marginBottom: '10px' }} 
          />
        }
        <button onClick={() => signOut({ callbackUrl: '/' })} style={logoutButtonStyle}>
          Se déconnecter
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '15px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
      <p style={{ margin: '0 0 10px 0' }}>Vous n'êtes pas connecté.</p>
      <button onClick={() => signIn()} style={loginButtonStyle}>
        Se connecter
      </button>
    </div>
  );
}

// Pour l'utiliser, assurez-vous que votre layout racine a <SessionProvider>
// exemple:
// import AuthStatus from './AuthStatus';
// <AuthStatus />
`,
  },
  quiz: {
    title: 'Quiz sur la Gestion des Sessions avec NextAuth.js',
    questions: [
      {
        question: 'Quel hook de `next-auth/react` est utilisé pour accéder aux informations de la session utilisateur dans un Client Component ?',
        options: ['getSession', 'useAuth', 'useSession', 'withAuth'],
        correctAnswer: 'useSession'
      },
      {
        question: 'Pour que `useSession` fonctionne correctement, quel Provider doit envelopper votre application ou une partie de celle-ci ?',
        options: ['<AuthProvider>', '<NextAuthProvider>', '<UserProvider>', '<SessionProvider>'],
        correctAnswer: '<SessionProvider>',
        explanation: 'Le `<SessionProvider>` de `next-auth/react` fournit le contexte de session aux composants enfants.'
      },
      {
        question: 'Comment peut-on accéder aux données de session dans un Server Component de l\'App Router ?',
        options: ['En utilisant `useSession()` directement.', 'En important `getSessionFromServer()` de `next-auth/server`.', 'En utilisant `getServerSession(authOptions)` de `next-auth/next`.', 'Ce n\'est pas possible dans les Server Components.'],
        correctAnswer: 'En utilisant `getServerSession(authOptions)` de `next-auth/next`.',
        explanation: '`getServerSession` est la méthode recommandée pour récupérer les données de session côté serveur dans l\'App Router (Server Components, Route Handlers).'
      },
    ],
  },
  hasExercise: true,
  hasQuiz: true,
  hasProject: true // Le projet du module 7-1 sert aussi de projet pour la gestion de session.
};

export default lesson2;
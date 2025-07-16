// src/data/lessons/module7/lesson1.js
const lesson1 = {
  id: '7-1',
  title: 'Introduction à l\'Authentification dans Next.js avec NextAuth.js',
  description: 'Apprenez à sécuriser vos applications Next.js en implémentant l\'authentification utilisateur avec la bibliothèque NextAuth.js.',
  difficulty: 'avancé',
  duration: 90,
  tags: ['Next.js', 'Authentification', 'Sécurité', 'NextAuth.js', 'OAuth'],
  prerequisites: ['6-1', '6-2'], // Compréhension de l'App Router est utile
  content: `
    <h2>Authentification dans les Applications Next.js</h2>
    <p>L'authentification est un aspect crucial de la plupart des applications web, permettant de vérifier l'identité des utilisateurs et de contrôler l'accès aux ressources. Next.js, combiné avec des bibliothèques comme <strong>NextAuth.js</strong>, offre des solutions robustes pour implémenter divers flux d'authentification.</p>

    <h3>Pourquoi NextAuth.js ?</h3>
    <p>NextAuth.js est une solution d'authentification complète et flexible pour Next.js. Elle simplifie l'intégration de :</p>
    <ul>
      <li><strong>Fournisseurs OAuth :</strong> Connexion facile avec Google, GitHub, Facebook, etc.</li>
      <li><strong>Authentification par identifiants (Credentials) :</strong> Email/mot de passe.</li>
      <li><strong>Authentification sans mot de passe :</strong> Liens magiques par email.</li>
      <li><strong>Gestion des sessions :</strong> JWT ou sessions en base de données.</li>
      <li><strong>Sécurité :</strong> Protection CSRF, cookies sécurisés (HttpOnly, SameSite).</li>
    </ul>

    <h3>Configuration de Base de NextAuth.js</h3>
    <p>La configuration principale se fait généralement dans un fichier <code>pages/api/auth/[...nextauth].js</code> (pour Pages Router) ou un Route Handler équivalent dans <code>app/api/auth/[...nextauth]/route.js</code> (pour App Router).</p>
    
    <h4>Exemple avec un fournisseur OAuth (Google) :</h4>
    <pre><code class="language-javascript">// Fichier: app/api/auth/[...nextauth]/route.js (pour App Router)
// Ou: pages/api/auth/[...nextauth].js (pour Pages Router)

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    // Ajoutez d'autres fournisseurs ici (GitHub, Credentials, etc.)
  ],
  // Optionnel: callbacks pour personnaliser le comportement (ex: jwt, session)
  // callbacks: {
  //   async jwt({ token, account }) {
  //     // Persist the OAuth access_token to the token right after signin
  //     if (account) {
  //       token.accessToken = account.access_token;
  //     }
  //     return token;
  //   },
  //   async session({ session, token, user }) {
  //     // Send properties to the client, like an access_token from a provider.
  //     session.accessToken = token.accessToken;
  //     return session;
  //   }
  // },
  secret: process.env.NEXTAUTH_SECRET, // Une chaîne secrète pour signer les JWTs
  // pages: { // Optionnel: pages personnalisées pour la connexion, etc.
  //   signIn: '/auth/signin',
  // }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; // Pour App Router
// export default NextAuth(authOptions); // Pour Pages Router
</code></pre>
    <p>N'oubliez pas de définir <code>GOOGLE_CLIENT_ID</code>, <code>GOOGLE_CLIENT_SECRET</code>, et <code>NEXTAUTH_SECRET</code> dans votre fichier <code>.env.local</code>.</p>
    
    <h3>Protection des Routes avec Middleware</h3>
    <p>Les Middlewares Next.js peuvent être utilisés pour protéger des routes en vérifiant la session de l'utilisateur avant d'autoriser l'accès.</p>
    <pre><code class="language-javascript">// Fichier: middleware.js (à la racine ou dans src/)
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt'; // Ou utilisez la session via l'objet request de NextAuth

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Pour les routes API ou les pages nécessitant une authentification
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/protected')) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié
      const loginUrl = new URL('/api/auth/signin', request.url); // Ou votre page de connexion custom
      loginUrl.searchParams.set('callbackUrl', pathname); // Pour rediriger après connexion
      return NextResponse.redirect(loginUrl);
    }
  }
  return NextResponse.next();
}

export const config = {
  // Spécifiez les chemins que ce middleware doit intercepter
  matcher: ['/admin/:path*', '/api/protected/:path*'],
};
</code></pre>
  `,
  example: {
    title: 'Mise en place de NextAuth.js avec Google Provider',
    code: `// Fichier: app/api/auth/[...nextauth]/route.js (pour App Router)
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Assurez-vous que vos variables d'environnement sont définies :
// GOOGLE_CLIENT_ID=your_google_client_id
// GOOGLE_CLIENT_SECRET=your_google_client_secret
// NEXTAUTH_SECRET=a_very_strong_random_secret_string
// NEXTAUTH_URL=http://localhost:3000 (en développement) ou votre URL de production

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  // Vous pouvez ajouter d'autres configurations ici (callbacks, pages, etc.)
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

/*
Pour utiliser cela côté client (par exemple dans un composant Header):

1. Enveloppez votre application avec <SessionProvider> dans votre layout racine:
   // app/layout.jsx
   'use client'; // SessionProvider est un Client Component
   import { SessionProvider } from "next-auth/react";
   export default function RootLayout({ children }) {
     return (
       <html lang="fr">
         <body>
           <SessionProvider> {/* Enveloppez ici */}
             {/* ...votre header, main, footer... */}
             {children}
           {/*</SessionProvider>
         </body>
       </html>
     );
   }

2. Utilisez useSession, signIn, signOut dans vos composants:
   // components/LoginButton.jsx
   'use client';
   import { useSession, signIn, signOut } from "next-auth/react";
   export default function LoginButton() {
     const { data: session, status } = useSession();
     if (status === "loading") return <p>Chargement...</p>;
     if (session) {
       return (
         <>
           Connecté en tant que {session.user.email} <br />
           <button onClick={() => signOut()}>Se déconnecter</button>
         </>
       );
     }
     return (
       <>
         Non connecté <br />
         <button onClick={() => signIn('google')}>Se connecter avec Google</button>
       </>
     );
   }
*/`,
    explanation: 'Ce code configure NextAuth.js pour permettre l\'authentification via un compte Google. Il nécessite la configuration des variables d\'environnement pour l\'ID client et le secret client de Google, ainsi qu\'un secret pour NextAuth.js. Des commentaires montrent comment l\'intégrer côté client.'
  },
  exercise: {
    title: 'Protéger une page /dashboard avec un Middleware',
    description: 'Créez une page `/dashboard` et un middleware qui la protège. Seuls les utilisateurs connectés (simulés pour cet exercice ou via NextAuth.js si configuré) devraient pouvoir y accéder. Les autres sont redirigés vers une page de connexion (ou `/api/auth/signin`).',
    initialCode: `// Créez ces fichiers :
// 1. app/dashboard/page.jsx
// export default function DashboardPage() {
//   return <h1>Bienvenue sur votre Tableau de Bord ! (Protégé)</h1>;
// }

// 2. middleware.js (à la racine du projet)
// import { NextResponse } from 'next/server';
// // Si vous utilisez NextAuth.js, vous importeriez getToken ou withAuth
// // Pour cet exercice, nous allons simuler la vérification d'un token

// export async function middleware(request) {
//   const isAuthenticated = false; // TODO: Simuler ou vérifier une vraie session/token
//   const { pathname } = request.nextUrl;

//   if (pathname.startsWith('/dashboard') && !isAuthenticated) {
//     // TODO: Rediriger vers '/login' ou '/api/auth/signin'
//     console.log('Accès non autorisé à /dashboard, redirection...');
//     // return NextResponse.redirect(new URL('/login', request.url));
//   }
//   return NextResponse.next();
// }

// export const config = {
//   matcher: ['/dashboard/:path*'],
// };

// 3. (Optionnel) app/login/page.jsx pour la redirection
// export default function LoginPage() {
//   return <h1>Page de Connexion</h1>;
// }
`,
    solution: `// 1. app/dashboard/page.jsx
import { authOptions } from "../api/auth/[...nextauth]/route"; // Ajustez le chemin si nécessaire
import { getServerSession } from "next-auth/next";
import { redirect } from 'next/navigation'; // Pour App Router
// import LoginButton from '@/components/LoginButton'; // Supposez un composant de connexion/déconnexion

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    // Si vous n'êtes pas dans un Server Component qui peut utiliser redirect(),
    // le middleware devrait gérer la redirection.
    // Pour une page Server Component, on peut faire ça :
    redirect('/api/auth/signin?callbackUrl=/dashboard'); 
    // Ou afficher un message et un bouton de connexion si la redirection est gérée par le middleware
    // return (
    //   <div>
    //     <h1>Accès Réservé</h1>
    //     <p>Vous devez être connecté pour voir cette page.</p>
    //     {/* <LoginButton /> */}
    //   </div>
    // );
  }

  return (
    <div>
      <h1>Tableau de Bord (Protégé)</h1>
      <p>Bienvenue, {session.user?.name || session.user?.email}!</p>
      <p>Ceci est votre espace personnel.</p>
      {/* Plus de contenu pour le dashboard ici */}
      {/* <LoginButton /> */}
    </div>
  );
}

// 2. middleware.js (à la racine du projet)
// Pour une protection robuste avec NextAuth.js, on utilise souvent 'withAuth'
// Ou une vérification de token/session plus élaborée.

// Solution utilisant la redirection via NextAuth.js helper (plus simple)
export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/dashboard/:path*"], // Protège toutes les routes sous /dashboard
};

// Solution alternative (plus manuelle, comme dans le contenu de la leçon):
/*
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Vérifier si l'utilisateur est authentifié pour accéder au dashboard
  if (pathname.startsWith('/dashboard')) {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token) {
      // Rediriger vers la page de connexion par défaut de NextAuth.js,
      // en conservant l'URL de retour.
      const signInUrl = new URL('/api/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', request.url);
      return NextResponse.redirect(signInUrl);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
*/

// 3. (Optionnel) app/login/page.jsx - Pas nécessaire si NextAuth.js gère la page de connexion.
// Si vous avez une page de connexion personnalisée définie dans authOptions.pages.signIn
// export default function CustomLoginPage() {
//   // Votre formulaire de connexion ici
//   return <h1>Page de Connexion Personnalisée</h1>;
// }
`,
  },
  quiz: { /* ... (quiz existant est bon) ... */
    title: 'Quiz sur l\'Authentification avec Next.js',
    questions: [
      {
        question: 'Quelle bibliothèque est couramment utilisée pour gérer l\'authentification OAuth (Google, GitHub, etc.) et par identifiants dans Next.js ?',
        options: ['Passport.js', 'Auth0 SDK', 'NextAuth.js', 'Firebase Auth'],
        correctAnswer: 'NextAuth.js'
      },
      {
        question: 'Dans Next.js, où la configuration principale de NextAuth.js (fournisseurs, callbacks, secret) est-elle typiquement placée pour l\'App Router ?',
        options: ['next.config.js', 'app/auth.config.js', 'app/api/auth/[...nextauth]/route.js', 'middleware.js'],
        correctAnswer: 'app/api/auth/[...nextauth]/route.js'
      },
      {
        question: 'Quel est le rôle d\'un Middleware Next.js dans le contexte de l\'authentification ?',
        options: ['Uniquement pour styliser les pages de connexion.', 'Pour intercepter les requêtes avant qu\'elles n\'atteignent une page ou une API Route et potentiellement rediriger les utilisateurs non authentifiés.', 'Pour gérer le stockage des mots de passe en base de données.', 'Pour envoyer des emails de confirmation.'],
        correctAnswer: 'Pour intercepter les requêtes avant qu\'elles n\'atteignent une page ou une API Route et potentiellement rediriger les utilisateurs non authentifiés.'
      }
    ]
  },
  project: { /* ... (projet existant est bon) ... */
    title: 'Système d\'Authentification Complet pour une Application Next.js',
    description: 'Implémentez un système d\'authentification robuste pour une application Next.js en utilisant NextAuth.js. Incluez l\'inscription (si pertinent pour le fournisseur), la connexion, la déconnexion, et la protection des routes.',
    requirements: [
      'Configurer NextAuth.js avec au moins un fournisseur OAuth (ex: Google ou GitHub) et/ou un fournisseur Credentials (email/mot de passe).',
      'Si Credentials provider : créer les formulaires d\'inscription et de connexion (avec validation).',
      'Si Credentials provider : hasher les mots de passe avant de les stocker et les comparer lors de la connexion.',
      'Protéger certaines routes (ex: `/profil`, `/parametres`) à l\'aide d\'un Middleware Next.js ou d\'une vérification de session côté serveur/client.',
      'Afficher des informations utilisateur (nom, email, image de profil) pour les utilisateurs connectés.',
      'Permettre aux utilisateurs de se déconnecter.',
      'Gérer les erreurs d\'authentification et fournir des retours clairs à l\'utilisateur.'
    ],
    tips: [
      'Utilisez des variables d\'environnement pour stocker les clés secrètes et les identifiants client.',
      'Pour le fournisseur Credentials, intégrez une base de données (ex: MongoDB, PostgreSQL avec Prisma) pour stocker les informations des utilisateurs.',
      'Utilisez le hook `useSession` de `next-auth/react` pour accéder à l\'état de la session côté client.',
      'Utilisez `getServerSession` pour accéder à la session dans les Server Components ou les Route Handlers (App Router) ou `getSession` dans `getServerSideProps` (Pages Router).',
      'Considérez l\'expérience utilisateur pour les flux d\'authentification (redirections, messages, états de chargement).'
    ],
    bonus: [
      "Implémentez la réinitialisation de mot de passe par email.",
      "Ajoutez l'authentification à deux facteurs (2FA).",
      "Permettez aux utilisateurs de lier plusieurs comptes OAuth.",
      "Personnalisez les pages d'authentification fournies par NextAuth.js."
    ]
  },
  hasExercise: true,
  hasQuiz: true,
  hasProject: true
};

export default lesson1;
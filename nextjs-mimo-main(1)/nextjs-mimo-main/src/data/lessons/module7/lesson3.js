// src/data/lessons/module7/lesson3.js
const lesson3 = {
  id: '7-3',
  title: 'Autorisation et Sécurisation Avancée avec NextAuth.js',
  description:
    "Maîtrisez les techniques d'autorisation avancées, la protection des routes et la sécurisation complète de votre application Next.js.",
  difficulty: 'avancé',
  duration: 75,
  tags: [
    'Next.js',
    'Autorisation',
    'Sécurité',
    'NextAuth.js',
    'Middleware',
    'RBAC',
    'Permissions'
  ],
  prerequisites: ['7-1', '7-2'], // Authentification et gestion des sessions
  content: [
    {
      type: 'text',
      content: `## Autorisation et Sécurité Avancée dans Next.js

L'authentification vérifie **qui** est l'utilisateur, tandis que l'autorisation détermine **ce qu'il peut faire**. Cette leçon explore les techniques avancées pour sécuriser votre application Next.js avec des systèmes d'autorisation robustes.

### Concepts Clés

- **Rôles et Permissions** : Système RBAC (Role-Based Access Control)
- **Protection des Routes** : Middleware et composants de protection
- **Autorisation Granulaire** : Contrôle d'accès au niveau des fonctionnalités
- **Sécurité des API** : Protection des endpoints et validation des tokens`
    },
    {
      type: 'text',
      content: `## Système de Rôles et Permissions

Commençons par définir un système de rôles flexible pour notre application :`
    },
    {
      type: 'code',
      language: 'javascript',
      content: `// lib/auth/roles.js
export const ROLES = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  USER: 'user',
  GUEST: 'guest'
};

export const PERMISSIONS = {
  // Gestion des utilisateurs
  USER_READ: 'user:read',
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  
  // Gestion du contenu
  CONTENT_READ: 'content:read',
  CONTENT_CREATE: 'content:create',
  CONTENT_UPDATE: 'content:update',
  CONTENT_DELETE: 'content:delete',
  CONTENT_PUBLISH: 'content:publish',
  
  // Administration
  ADMIN_PANEL: 'admin:panel',
  SYSTEM_CONFIG: 'system:config',
  ANALYTICS_VIEW: 'analytics:view'
};

// Définition des permissions par rôle
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.CONTENT_READ,
    PERMISSIONS.CONTENT_CREATE,
    PERMISSIONS.CONTENT_UPDATE,
    PERMISSIONS.CONTENT_DELETE,
    PERMISSIONS.CONTENT_PUBLISH,
    PERMISSIONS.ADMIN_PANEL,
    PERMISSIONS.SYSTEM_CONFIG,
    PERMISSIONS.ANALYTICS_VIEW
  ],
  [ROLES.MODERATOR]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.CONTENT_READ,
    PERMISSIONS.CONTENT_CREATE,
    PERMISSIONS.CONTENT_UPDATE,
    PERMISSIONS.CONTENT_DELETE,
    PERMISSIONS.CONTENT_PUBLISH,
    PERMISSIONS.ANALYTICS_VIEW
  ],
  [ROLES.USER]: [
    PERMISSIONS.CONTENT_READ,
    PERMISSIONS.CONTENT_CREATE,
    PERMISSIONS.CONTENT_UPDATE // Seulement son propre contenu
  ],
  [ROLES.GUEST]: [
    PERMISSIONS.CONTENT_READ
  ]
};

// Fonction utilitaire pour vérifier les permissions
export function hasPermission(userRole, permission) {
  if (!userRole || !ROLE_PERMISSIONS[userRole]) {
    return false;
  }
  return ROLE_PERMISSIONS[userRole].includes(permission);
}

// Fonction pour vérifier si l'utilisateur a au moins une permission
export function hasAnyPermission(userRole, permissions) {
  return permissions.some(permission => hasPermission(userRole, permission));
}

// Fonction pour vérifier si l'utilisateur a toutes les permissions
export function hasAllPermissions(userRole, permissions) {
  return permissions.every(permission => hasPermission(userRole, permission));
}`
    },
    {
      type: 'text',
      content: `## Configuration NextAuth.js avec Rôles

Modifions notre configuration NextAuth.js pour intégrer le système de rôles :`
    },
    {
      type: 'code',
      language: 'javascript',
      content: `// app/api/auth/[...nextauth]/route.js
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { ROLES } from '@/lib/auth/roles';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // Logique d'authentification personnalisée
        const user = await authenticateUser(credentials.email, credentials.password);
        
        if (user) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role || ROLES.USER,
            permissions: user.permissions || []
          };
        }
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Ajouter les informations de rôle au token JWT
      if (user) {
        token.role = user.role;
        token.permissions = user.permissions;
        token.userId = user.id;
      }
      
      // Rafraîchir les permissions si nécessaire
      if (token.role && !token.permissions) {
        token.permissions = await getUserPermissions(token.userId);
      }
      
      return token;
    },
    async session({ session, token }) {
      // Ajouter les informations de rôle à la session
      if (token) {
        session.user.id = token.userId;
        session.user.role = token.role;
        session.user.permissions = token.permissions;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // Logique personnalisée lors de la connexion
      
      // Pour OAuth, assigner un rôle par défaut ou basé sur l'email
      if (account.provider === 'google') {
        const isAdmin = user.email === 'admin@yourcompany.com';
        user.role = isAdmin ? ROLES.ADMIN : ROLES.USER;
      }
      
      // Vous pouvez aussi bloquer certains utilisateurs
      const isAllowed = await checkUserAccess(user.email);
      return isAllowed;
    }
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

// Fonctions utilitaires (à implémenter selon votre base de données)
async function authenticateUser(email, password) {
  // Logique d'authentification avec votre base de données
  // Retourner l'utilisateur avec son rôle et ses permissions
}

async function getUserPermissions(userId) {
  // Récupérer les permissions de l'utilisateur depuis la base de données
}

async function checkUserAccess(email) {
  // Vérifier si l'utilisateur a accès à l'application
  return true; // ou false pour bloquer
}`
    },
    {
      type: 'text',
      content: `## Middleware de Protection des Routes

Créons un middleware pour protéger les routes automatiquement :`
    },
    {
      type: 'code',
      language: 'javascript',
      content: `// middleware.js (à la racine du projet)
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { ROLES, PERMISSIONS, hasPermission } from './src/lib/auth/roles';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Définir les règles d'accès par route
    const routeProtections = {
      '/admin': {
        requiredRole: ROLES.ADMIN,
        requiredPermissions: [PERMISSIONS.ADMIN_PANEL]
      },
      '/dashboard/users': {
        requiredPermissions: [PERMISSIONS.USER_READ]
      },
      '/dashboard/content/create': {
        requiredPermissions: [PERMISSIONS.CONTENT_CREATE]
      },
      '/dashboard/analytics': {
        requiredPermissions: [PERMISSIONS.ANALYTICS_VIEW]
      }
    };

    // Vérifier les protections pour la route actuelle
    for (const [route, protection] of Object.entries(routeProtections)) {
      if (pathname.startsWith(route)) {
        // Vérifier le rôle requis
        if (protection.requiredRole && token?.role !== protection.requiredRole) {
          return NextResponse.redirect(new URL('/unauthorized', req.url));
        }

        // Vérifier les permissions requises
        if (protection.requiredPermissions) {
          const hasRequiredPermissions = protection.requiredPermissions.every(
            permission => hasPermission(token?.role, permission)
          );
          
          if (!hasRequiredPermissions) {
            return NextResponse.redirect(new URL('/unauthorized', req.url));
          }
        }
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Routes publiques
        const publicRoutes = ['/', '/about', '/contact', '/auth'];
        if (publicRoutes.some(route => pathname.startsWith(route))) {
          return true;
        }

        // Toutes les autres routes nécessitent une authentification
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    // Protéger toutes les routes sauf les publiques et les API d'auth
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
};`
    },
    {
      type: 'text',
      content: `## Composants de Protection et d'Autorisation

Créons des composants réutilisables pour gérer l'autorisation :`
    },
    {
      type: 'code',
      language: 'javascript',
      content: `// components/auth/ProtectedRoute.jsx
'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { hasPermission, hasAnyPermission } from '@/lib/auth/roles';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function ProtectedRoute({ 
  children, 
  requiredRole = null,
  requiredPermissions = [],
  requireAll = true, // true = toutes les permissions, false = au moins une
  fallback = null,
  redirectTo = '/unauthorized'
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Attendre le chargement

    if (!session) {
      router.push('/auth/signin');
      return;
    }

    // Vérifier le rôle requis
    if (requiredRole && session.user.role !== requiredRole) {
      router.push(redirectTo);
      return;
    }

    // Vérifier les permissions
    if (requiredPermissions.length > 0) {
      const userRole = session.user.role;
      const hasAccess = requireAll
        ? requiredPermissions.every(permission => hasPermission(userRole, permission))
        : hasAnyPermission(userRole, requiredPermissions);

      if (!hasAccess) {
        router.push(redirectTo);
        return;
      }
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  if (!session) {
    return fallback || <div>Redirection vers la connexion...</div>;
  }

  // Vérifications côté client pour l'affichage
  if (requiredRole && session.user.role !== requiredRole) {
    return fallback || <div>Accès refusé</div>;
  }

  if (requiredPermissions.length > 0) {
    const userRole = session.user.role;
    const hasAccess = requireAll
      ? requiredPermissions.every(permission => hasPermission(userRole, permission))
      : hasAnyPermission(userRole, requiredPermissions);

    if (!hasAccess) {
      return fallback || <div>Permissions insuffisantes</div>;
    }
  }

  return children;
}

// Composant pour afficher conditionnellement du contenu basé sur les permissions
export function ConditionalRender({ 
  children, 
  requiredRole = null,
  requiredPermissions = [],
  requireAll = true,
  fallback = null 
}) {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return null; // Ou un skeleton loader
  }

  if (!session) {
    return fallback;
  }

  // Vérifier le rôle
  if (requiredRole && session.user.role !== requiredRole) {
    return fallback;
  }

  // Vérifier les permissions
  if (requiredPermissions.length > 0) {
    const userRole = session.user.role;
    const hasAccess = requireAll
      ? requiredPermissions.every(permission => hasPermission(userRole, permission))
      : hasAnyPermission(userRole, requiredPermissions);

    if (!hasAccess) {
      return fallback;
    }
  }

  return children;
}

// Hook personnalisé pour les permissions
export function usePermissions() {
  const { data: session } = useSession();

  const checkPermission = (permission) => {
    if (!session?.user?.role) return false;
    return hasPermission(session.user.role, permission);
  };

  const checkRole = (role) => {
    return session?.user?.role === role;
  };

  const checkAnyPermission = (permissions) => {
    if (!session?.user?.role) return false;
    return hasAnyPermission(session.user.role, permissions);
  };

  const checkAllPermissions = (permissions) => {
    if (!session?.user?.role) return false;
    return permissions.every(permission => hasPermission(session.user.role, permission));
  };

  return {
    userRole: session?.user?.role,
    isAuthenticated: !!session,
    checkPermission,
    checkRole,
    checkAnyPermission,
    checkAllPermissions,
  };
}`
    },
    {
      type: 'text',
      content: `## Protection des API Routes

Sécurisons nos API routes avec des utilitaires d'autorisation :`
    },
    {
      type: 'code',
      language: 'javascript',
      content: `// lib/auth/api-protection.js
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { hasPermission } from './roles';
import { NextResponse } from 'next/server';

// Middleware d'authentification pour les API routes
export async function requireAuth(request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json(
      { error: 'Non autorisé - Authentification requise' },
      { status: 401 }
    );
  }

  return session;
}

// Middleware d'autorisation pour les API routes
export async function requirePermissions(request, requiredPermissions = [], requireAll = true) {
  const session = await requireAuth(request);
  
  if (session instanceof NextResponse) {
    return session; // Erreur d'authentification
  }

  const userRole = session.user.role;
  
  if (requiredPermissions.length > 0) {
    const hasAccess = requireAll
      ? requiredPermissions.every(permission => hasPermission(userRole, permission))
      : requiredPermissions.some(permission => hasPermission(userRole, permission));

    if (!hasAccess) {
      return NextResponse.json(
        { 
          error: 'Accès refusé - Permissions insuffisantes',
          required: requiredPermissions,
          userRole 
        },
        { status: 403 }
      );
    }
  }

  return session;
}

// Wrapper HOC pour les API routes
export function withAuth(handler, options = {}) {
  return async function(request, context) {
    const { requiredPermissions = [], requireAll = true } = options;
    
    let session;
    
    if (requiredPermissions.length > 0) {
      session = await requirePermissions(request, requiredPermissions, requireAll);
    } else {
      session = await requireAuth(request);
    }

    if (session instanceof NextResponse) {
      return session; // Erreur d'auth ou d'autorisation
    }

    // Ajouter la session au contexte
    request.session = session;
    
    return handler(request, context);
  };
}

// Exemple d'utilisation dans une API route
// app/api/users/route.js
import { PERMISSIONS } from '@/lib/auth/roles';
import { withAuth } from '@/lib/auth/api-protection';

async function GET(request) {
  // L'utilisateur est authentifié et a les permissions requises
  const users = await getUsersList();
  return NextResponse.json(users);
}

async function POST(request) {
  const userData = await request.json();
  const newUser = await createUser(userData);
  return NextResponse.json(newUser, { status: 201 });
}

// Exporter les handlers avec protection
export const GET_PROTECTED = withAuth(GET, {
  requiredPermissions: [PERMISSIONS.USER_READ]
});

export const POST_PROTECTED = withAuth(POST, {
  requiredPermissions: [PERMISSIONS.USER_CREATE]
});

export { GET_PROTECTED as GET, POST_PROTECTED as POST };`
    },
    {
      type: 'text',
      content: `## Exemple d'Application Complète

Voyons comment utiliser tous ces éléments ensemble dans une application :`
    },
    {
      type: 'code',
      language: 'javascript',
      content: `// app/dashboard/users/page.jsx
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PERMISSIONS, hasPermission } from '@/lib/auth/roles';
import { redirect } from 'next/navigation';
import UsersManagement from '@/components/dashboard/UsersManagement';

export default async function UsersPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  // Vérification côté serveur
  if (!hasPermission(session.user.role, PERMISSIONS.USER_READ)) {
    redirect('/unauthorized');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Gestion des Utilisateurs</h1>
      <UsersManagement />
    </div>
  );
}

// components/dashboard/UsersManagement.jsx
'use client';
import { useState, useEffect } from 'react';
import { usePermissions } from '@/components/auth/ProtectedRoute';
import { ConditionalRender } from '@/components/auth/ProtectedRoute';
import { PERMISSIONS } from '@/lib/auth/roles';

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { checkPermission } = usePermissions();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!checkPermission(PERMISSIONS.USER_DELETE)) {
      alert('Vous n\\'avez pas la permission de supprimer des utilisateurs');
      return;
    }

    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        const response = await fetch(\`/api/users/\${userId}\`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setUsers(users.filter(user => user.id !== userId));
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  if (loading) {
    return <div className="text-center">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Bouton de création conditionnel */}
      <ConditionalRender requiredPermissions={[PERMISSIONS.USER_CREATE]}>
        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={() => {/* Logique de création */}}
        >
          Ajouter un utilisateur
        </button>
      </ConditionalRender>

      {/* Liste des utilisateurs */}
      <div className="grid gap-4">
        {users.map(user => (
          <div key={user.id} className="border rounded-lg p-4 flex justify-between items-center">
            <div>
              <h3 className="font-semibold">{user.name}</h3>
              <p className="text-gray-600">{user.email}</p>
              <span className="text-sm bg-gray-200 px-2 py-1 rounded">{user.role}</span>
            </div>
            
            <div className="space-x-2">
              {/* Bouton de modification conditionnel */}
              <ConditionalRender requiredPermissions={[PERMISSIONS.USER_UPDATE]}>
                <button className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">
                  Modifier
                </button>
              </ConditionalRender>
              
              {/* Bouton de suppression conditionnel */}
              <ConditionalRender requiredPermissions={[PERMISSIONS.USER_DELETE]}>
                <button 
                  onClick={() => handleDeleteUser(user.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Supprimer
                </button>
              </ConditionalRender>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}`
    },
    {
      type: 'text',
      content: `## Bonnes Pratiques de Sécurité

### 1. Validation Multiple
- **Côté client** : Pour l'UX (cacher/afficher des éléments)
- **Côté serveur** : Pour la sécurité réelle (pages et API)
- **Base de données** : Contraintes et validations au niveau DB

### 2. Principe du Moindre Privilège
- Accordez uniquement les permissions nécessaires
- Utilisez des rôles granulaires
- Révisez régulièrement les permissions

### 3. Audit et Logging
\`\`\`javascript
// lib/auth/audit.js
export function logSecurityEvent(event, user, details = {}) {
  console.log({
    timestamp: new Date().toISOString(),
    event,
    userId: user?.id,
    userRole: user?.role,
    userEmail: user?.email,
    ...details
  });
  
  // Envoyer vers un service de logging en production
}

// Utilisation
logSecurityEvent('UNAUTHORIZED_ACCESS_ATTEMPT', session?.user, {
  route: request.url,
  permissions: requiredPermissions
});
\`\`\`

### 4. Gestion des Erreurs
- Ne pas révéler d'informations sensibles dans les messages d'erreur
- Logger les tentatives d'accès non autorisées
- Implémenter des rate limits

### 5. Tests de Sécurité
\`\`\`javascript
// tests/auth.test.js
import { hasPermission, ROLES, PERMISSIONS } from '@/lib/auth/roles';

describe('Authorization System', () => {
  test('Admin should have all permissions', () => {
    expect(hasPermission(ROLES.ADMIN, PERMISSIONS.USER_DELETE)).toBe(true);
    expect(hasPermission(ROLES.ADMIN, PERMISSIONS.ADMIN_PANEL)).toBe(true);
  });

  test('User should not have admin permissions', () => {
    expect(hasPermission(ROLES.USER, PERMISSIONS.USER_DELETE)).toBe(false);
    expect(hasPermission(ROLES.USER, PERMISSIONS.ADMIN_PANEL)).toBe(false);
  });

  test('Moderator should have content permissions', () => {
    expect(hasPermission(ROLES.MODERATOR, PERMISSIONS.CONTENT_CREATE)).toBe(true);
    expect(hasPermission(ROLES.MODERATOR, PERMISSIONS.CONTENT_DELETE)).toBe(true);
  });
});
\`\`\``
    }
  ],
  example: {
    title: 'Système de Blog avec Autorisation Complète',
    code: `// app/blog/admin/page.jsx - Page d'administration du blog
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PERMISSIONS, hasPermission } from '@/lib/auth/roles';
import { redirect } from 'next/navigation';
import BlogAdminDashboard from '@/components/blog/BlogAdminDashboard';

export default async function BlogAdminPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  // Vérifier les permissions d'administration
  if (!hasPermission(session.user.role, PERMISSIONS.CONTENT_DELETE) ||
      !hasPermission(session.user.role, PERMISSIONS.CONTENT_PUBLISH)) {
    redirect('/unauthorized');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Administration du Blog</h1>
        <BlogAdminDashboard />
      </div>
    </div>
  );
}

// components/blog/BlogAdminDashboard.jsx
'use client';
import { useState, useEffect } from 'react';
import { usePermissions } from '@/components/auth/ProtectedRoute';
import { ConditionalRender } from '@/components/auth/ProtectedRoute';
import { PERMISSIONS } from '@/lib/auth/roles';

export default function BlogAdminDashboard() {
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const { checkPermission, userRole } = usePermissions();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [postsRes, statsRes] = await Promise.all([
        fetch('/api/blog/posts?status=all'),
        fetch('/api/blog/stats')
      ]);

      if (postsRes.ok) {
        setPosts(await postsRes.json());
      }
      
      if (statsRes.ok) {
        setStats(await statsRes.json());
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishPost = async (postId) => {
    if (!checkPermission(PERMISSIONS.CONTENT_PUBLISH)) {
      alert('Vous n\\'avez pas la permission de publier des articles');
      return;
    }

    try {
      const response = await fetch(\`/api/blog/posts/\${postId}/publish\`, {
        method: 'PATCH'
      });

      if (response.ok) {
        loadDashboardData(); // Recharger les données
      }
    } catch (error) {
      console.error('Erreur lors de la publication:', error);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!checkPermission(PERMISSIONS.CONTENT_DELETE)) {
      alert('Vous n\\'avez pas la permission de supprimer des articles');
      return;
    }

    if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      try {
        const response = await fetch(\`/api/blog/posts/\${postId}\`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setPosts(posts.filter(post => post.id !== postId));
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Chargement du tableau de bord...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Statistiques */}
      <ConditionalRender requiredPermissions={[PERMISSIONS.ANALYTICS_VIEW]}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Total Articles</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalPosts || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Publiés</h3>
            <p className="text-3xl font-bold text-green-600">{stats.publishedPosts || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Brouillons</h3>
            <p className="text-3xl font-bold text-yellow-600">{stats.draftPosts || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Vues Totales</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.totalViews || 0}</p>
          </div>
        </div>
      </ConditionalRender>

      {/* Actions rapides */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Actions Rapides</h2>
        <div className="flex flex-wrap gap-4">
          <ConditionalRender requiredPermissions={[PERMISSIONS.CONTENT_CREATE]}>
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Nouvel Article
            </button>
          </ConditionalRender>
          
          <ConditionalRender requiredPermissions={[PERMISSIONS.USER_READ]}>
            <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
              Gérer les Auteurs
            </button>
          </ConditionalRender>
          
          <ConditionalRender requiredPermissions={[PERMISSIONS.SYSTEM_CONFIG]}>
            <button className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
              Configuration
            </button>
          </ConditionalRender>
        </div>
      </div>

      {/* Liste des articles */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Gestion des Articles</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">
                  Titre
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">
                  Auteur
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {posts.map(post => (
                <tr key={post.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{post.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{post.author.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={\`inline-flex px-2 py-1 text-xs font-semibold rounded-full \${
                      post.status === 'published' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }\`}>
                      {post.status === 'published' ? 'Publié' : 'Brouillon'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <ConditionalRender requiredPermissions={[PERMISSIONS.CONTENT_UPDATE]}>
                      <button className="text-blue-600 hover:text-blue-900">
                        Modifier
                      </button>
                    </ConditionalRender>
                    
                    {post.status === 'draft' && (
                      <ConditionalRender requiredPermissions={[PERMISSIONS.CONTENT_PUBLISH]}>
                        <button 
                          onClick={() => handlePublishPost(post.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Publier
                        </button>
                      </ConditionalRender>
                    )}
                    
                    <ConditionalRender requiredPermissions={[PERMISSIONS.CONTENT_DELETE]}>
                      <button 
                        onClick={() => handleDeletePost(post.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Supprimer
                      </button>
                    </ConditionalRender>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}`,
    explanation:
      "Cet exemple montre un système complet d'administration de blog avec des contrôles d'autorisation granulaires. Les utilisateurs ne voient que les fonctionnalités auxquelles ils ont accès selon leur rôle et leurs permissions."
  },
  exercise: {
    title: 'Système de Gestion de Projet avec Autorisation Avancée',
    description:
      "Créez un système de gestion de projet avec différents niveaux d'accès et de permissions pour les membres de l'équipe.",
    initialCode: `// lib/auth/project-roles.js
export const PROJECT_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin', 
  MEMBER: 'member',
  VIEWER: 'viewer'
};

export const PROJECT_PERMISSIONS = {
  // TODO: Définir les permissions pour les projets
  // Exemples: PROJECT_READ, PROJECT_UPDATE, PROJECT_DELETE,
  // TASK_CREATE, TASK_ASSIGN, TEAM_MANAGE, etc.
};

export const PROJECT_ROLE_PERMISSIONS = {
  // TODO: Définir les permissions par rôle de projet
};

// components/projects/ProjectDashboard.jsx
'use client';
import { useState, useEffect } from 'react';

export default function ProjectDashboard() {
  const [projects, setProjects] = useState([]);
  
  // TODO: Implémenter la logique de gestion des projets
  // avec autorisation basée sur les rôles
  
  return (
    <div>
      <h1>Tableau de Bord des Projets</h1>
      {/* TODO: Interface avec contrôles d'autorisation */}
    </div>
  );
}`,
    solution: `// lib/auth/project-roles.js
export const PROJECT_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
  VIEWER: 'viewer'
};

export const PROJECT_PERMISSIONS = {
  PROJECT_READ: 'project:read',
  PROJECT_UPDATE: 'project:update',
  PROJECT_DELETE: 'project:delete',
  PROJECT_SETTINGS: 'project:settings',
  
  TASK_CREATE: 'task:create',
  TASK_UPDATE: 'task:update',
  TASK_DELETE: 'task:delete',
  TASK_ASSIGN: 'task:assign',
  
  TEAM_INVITE: 'team:invite',
  TEAM_REMOVE: 'team:remove',
  TEAM_MANAGE_ROLES: 'team:manage_roles',
  
  COMMENT_CREATE: 'comment:create',
  COMMENT_DELETE: 'comment:delete',
  
  FILE_UPLOAD: 'file:upload',
  FILE_DELETE: 'file:delete'
};

export const PROJECT_ROLE_PERMISSIONS = {
  [PROJECT_ROLES.OWNER]: [
    PROJECT_PERMISSIONS.PROJECT_READ,
    PROJECT_PERMISSIONS.PROJECT_UPDATE,
    PROJECT_PERMISSIONS.PROJECT_DELETE,
    PROJECT_PERMISSIONS.PROJECT_SETTINGS,
    PROJECT_PERMISSIONS.TASK_CREATE,
    PROJECT_PERMISSIONS.TASK_UPDATE,
    PROJECT_PERMISSIONS.TASK_DELETE,
    PROJECT_PERMISSIONS.TASK_ASSIGN,
    PROJECT_PERMISSIONS.TEAM_INVITE,
    PROJECT_PERMISSIONS.TEAM_REMOVE,
    PROJECT_PERMISSIONS.TEAM_MANAGE_ROLES,
    PROJECT_PERMISSIONS.COMMENT_CREATE,
    PROJECT_PERMISSIONS.COMMENT_DELETE,
    PROJECT_PERMISSIONS.FILE_UPLOAD,
    PROJECT_PERMISSIONS.FILE_DELETE
  ],
  [PROJECT_ROLES.ADMIN]: [
    PROJECT_PERMISSIONS.PROJECT_READ,
    PROJECT_PERMISSIONS.PROJECT_UPDATE,
    PROJECT_PERMISSIONS.TASK_CREATE,
    PROJECT_PERMISSIONS.TASK_UPDATE,
    PROJECT_PERMISSIONS.TASK_DELETE,
    PROJECT_PERMISSIONS.TASK_ASSIGN,
    PROJECT_PERMISSIONS.TEAM_INVITE,
    PROJECT_PERMISSIONS.COMMENT_CREATE,
    PROJECT_PERMISSIONS.COMMENT_DELETE,
    PROJECT_PERMISSIONS.FILE_UPLOAD,
    PROJECT_PERMISSIONS.FILE_DELETE
  ],
  [PROJECT_ROLES.MEMBER]: [
    PROJECT_PERMISSIONS.PROJECT_READ,
    PROJECT_PERMISSIONS.TASK_CREATE,
    PROJECT_PERMISSIONS.TASK_UPDATE,
    PROJECT_PERMISSIONS.COMMENT_CREATE,
    PROJECT_PERMISSIONS.FILE_UPLOAD
  ],
  [PROJECT_ROLES.VIEWER]: [
    PROJECT_PERMISSIONS.PROJECT_READ,
    PROJECT_PERMISSIONS.COMMENT_CREATE
  ]
};

export function hasProjectPermission(userProjectRole, permission) {
  if (!userProjectRole || !PROJECT_ROLE_PERMISSIONS[userProjectRole]) {
    return false;
  }
  return PROJECT_ROLE_PERMISSIONS[userProjectRole].includes(permission);
}

// components/projects/ProjectDashboard.jsx
'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { PROJECT_PERMISSIONS, hasProjectPermission } from '@/lib/auth/project-roles';

export default function ProjectDashboard() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des projets:', error);
    } finally {
      setLoading(false);
    }
  };

  const canCreateProject = () => {
    // Vérification des permissions globales ou premium
    return session?.user?.role === 'admin' || session?.user?.isPremium;
  };

  const canDeleteProject = (project) => {
    return hasProjectPermission(project.userRole, PROJECT_PERMISSIONS.PROJECT_DELETE);
  };

  const canManageTeam = (project) => {
    return hasProjectPermission(project.userRole, PROJECT_PERMISSIONS.TEAM_INVITE);
  };

  if (loading) {
    return <div className="text-center p-8">Chargement des projets...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Mes Projets</h1>
        {canCreateProject() && (
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Nouveau Projet
          </button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map(project => (
          <div key={project.id} className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold">{project.name}</h3>
              <span className={\`px-2 py-1 text-xs rounded \${
                project.userRole === 'owner' ? 'bg-purple-100 text-purple-800' :
                project.userRole === 'admin' ? 'bg-blue-100 text-blue-800' :
                project.userRole === 'member' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }\`}>
                {project.userRole}
              </span>
            </div>
            
            <p className="text-gray-600 mb-4">{project.description}</p>
            
            <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
              <span>{project.taskCount} tâches</span>
              <span>{project.memberCount} membres</span>
            </div>
            
            <div className="flex space-x-2">
              <button className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded hover:bg-gray-200">
                Voir
              </button>
              
              {hasProjectPermission(project.userRole, PROJECT_PERMISSIONS.PROJECT_UPDATE) && (
                <button className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600">
                  Modifier
                </button>
              )}
              
              {canManageTeam(project) && (
                <button className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600">
                  Équipe
                </button>
              )}
              
              {canDeleteProject(project) && (
                <button 
                  onClick={() => handleDeleteProject(project.id)}
                  className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
                >
                  Supprimer
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}`,
    tasks: [
      'Définir les rôles et permissions pour un système de gestion de projet',
      'Créer des composants de protection basés sur les rôles de projet',
      "Implémenter l'interface de gestion avec contrôles conditionnels",
      'Ajouter la gestion des équipes et des invitations',
      'Créer des API routes protégées pour les actions sur les projets',
      "Tester les différents niveaux d'autorisation"
    ]
  },
  quiz: {
    title: "Quiz sur l'Autorisation Avancée",
    questions: [
      {
        question:
          'Quelle est la différence principale entre authentification et autorisation ?',
        options: [
          "Il n'y a pas de différence",
          "L'authentification vérifie qui est l'utilisateur, l'autorisation détermine ce qu'il peut faire",
          "L'autorisation est plus sécurisée que l'authentification",
          "L'authentification est côté client, l'autorisation côté serveur"
        ],
        correctAnswer:
          "L'authentification vérifie qui est l'utilisateur, l'autorisation détermine ce qu'il peut faire",
        explanation:
          "L'authentification (qui êtes-vous ?) et l'autorisation (que pouvez-vous faire ?) sont deux concepts distincts mais complémentaires en sécurité."
      },
      {
        question:
          'Pourquoi faut-il vérifier les permissions à la fois côté client et côté serveur ?',
        options: [
          'Pour améliorer les performances',
          'La vérification côté client suffit',
          "Côté client pour l'UX, côté serveur pour la sécurité réelle",
          'Pour réduire la charge serveur'
        ],
        correctAnswer:
          "Côté client pour l'UX, côté serveur pour la sécurité réelle",
        explanation:
          "Les vérifications côté client améliorent l'expérience utilisateur mais ne sont pas sécurisées. La vraie sécurité doit toujours être côté serveur."
      },
      {
        question:
          "Quel est l'avantage du système RBAC (Role-Based Access Control) ?",
        options: [
          'Il est plus rapide',
          'Il permet une gestion granulaire et scalable des permissions',
          'Il ne nécessite pas de base de données',
          'Il est plus simple à implémenter'
        ],
        correctAnswer:
          'Il permet une gestion granulaire et scalable des permissions',
        explanation:
          'RBAC permet de gérer facilement les permissions en assignant des rôles aux utilisateurs et des permissions aux rôles, rendant le système scalable et maintenable.'
      }
    ]
  },
  project: {
    title: "Plateforme E-learning avec Système d'Autorisation Complet",
    description:
      "Créez une plateforme d'apprentissage en ligne avec un système d'autorisation sophistiqué pour gérer instructeurs, étudiants et administrateurs.",
    requirements: [
      'Système de rôles : Admin, Instructeur, Étudiant, Invité',
      'Permissions granulaires pour la gestion des cours, leçons et évaluations',
      'Protection des routes avec middleware Next.js',
      'API sécurisées avec validation des permissions',
      'Interface conditionnelle basée sur les rôles',
      "Système d'audit des actions sensibles",
      'Gestion des inscriptions et des accès aux cours',
      "Dashboard personnalisé selon le rôle de l'utilisateur"
    ],
    hints: [
      'Utilisez un système de permissions par ressource (cours, leçon, évaluation)',
      'Implémentez des middlewares spécifiques pour chaque type de route',
      'Créez des hooks personnalisés pour la gestion des permissions complexes',
      'Ajoutez un système de logging pour tracer les actions importantes',
      'Pensez aux permissions temporaires (accès limité dans le temps)'
    ],
    bonus: [
      "Système de permissions temporaires et d'accès programmé",
      "Interface d'administration pour gérer les rôles et permissions",
      'Intégration avec un système de paiement pour les cours premium',
      'Système de notifications basé sur les rôles',
      "Rapports et analytics selon les permissions de l'utilisateur"
    ]
  }
}

export default lesson3

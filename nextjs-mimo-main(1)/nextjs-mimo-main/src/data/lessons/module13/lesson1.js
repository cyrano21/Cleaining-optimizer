// src/data/lessons/module13/lesson1.js
const lesson1 = {
  id: '13-1',
  title: 'Sécurité des API et authentification avancée',
  description:
    'Sécurisation des API Next.js avec authentification JWT, OAuth et bonnes pratiques',
  difficulty: 'avancé',
  duration: 55,
  tags: ['Next.js', 'Sécurité', 'API', 'JWT', 'OAuth', 'Authentification'],
  prerequisites: ['12-3'],
  content: `
    <h2>Sécurité des API dans Next.js</h2>
    <p>La sécurisation des API est cruciale pour protéger les données sensibles et maintenir la confiance des utilisateurs. Next.js offre plusieurs mécanismes pour implémenter une authentification robuste et sécuriser les routes API.</p>

    <h3>Authentification JWT (JSON Web Tokens)</h3>
    <p>Les JWT sont un standard ouvert (RFC 7519) qui permet de transmettre de manière sécurisée des informations entre les parties sous forme d'un objet JSON compact et auto-contenu.</p>

    <h4>Structure d'un JWT</h4>
    <ul>
      <li><strong>Header</strong> : Contient le type de token et l'algorithme de signature</li>
      <li><strong>Payload</strong> : Contient les claims (revendications) sur l'utilisateur</li>
      <li><strong>Signature</strong> : Utilisée pour vérifier l'intégrité du token</li>
    </ul>

    <pre><code class="language-javascript">// Exemple de structure JWT
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "1234567890",
    "name": "John Doe",
    "iat": 1516239022,
    "exp": 1516242622
  },
  "signature": "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
}</code></pre>

    <h3>Implémentation de l'authentification JWT dans Next.js</h3>
    <p>Voici comment implémenter un système d'authentification complet avec JWT :</p>

    <pre><code class="language-javascript">// lib/auth.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

export function generateTokens(userId, email) {
  const accessToken = jwt.sign(
    { userId, email },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { userId },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Token invalide');
  }
}

export async function hashPassword(password) {
  return await bcrypt.hash(password, 12);
}

export async function comparePassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}</code></pre>

    <h3>Middleware d'authentification</h3>
    <p>Un middleware permet de protéger automatiquement les routes qui nécessitent une authentification :</p>

    <pre><code class="language-javascript">// middleware/auth.js
import { verifyToken } from '../lib/auth';

export function withAuth(handler) {
  return async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ error: 'Token manquant' });
      }
      
      const decoded = verifyToken(token);
      req.user = decoded;
      
      return handler(req, res);
    } catch (error) {
      return res.status(401).json({ error: 'Token invalide' });
    }
  };
}</code></pre>

    <h3>OAuth 2.0 avec Next.js</h3>
    <p>OAuth 2.0 permet aux utilisateurs de s'authentifier via des services tiers comme Google, GitHub, ou Facebook sans partager leurs mots de passe.</p>

    <h4>Intégration avec NextAuth.js</h4>
    <p>NextAuth.js simplifie l'implémentation d'OAuth dans Next.js :</p>

    <pre><code class="language-javascript">// pages/api/auth/[...nextauth].js
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
});</code></pre>

    <h3>Protection CSRF (Cross-Site Request Forgery)</h3>
    <p>Les attaques CSRF exploitent la confiance d'un site web envers un utilisateur authentifié. Next.js inclut une protection CSRF intégrée :</p>

    <pre><code class="language-javascript">// next.config.js
module.exports = {
  experimental: {
    serverComponentsExternalPackages: ['csrf'],
  },
  async headers() {
    return [
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};</code></pre>

    <h3>Validation et sanitisation des données</h3>
    <p>Il est essentiel de valider et nettoyer toutes les données entrantes pour prévenir les injections et autres attaques :</p>

    <pre><code class="language-javascript">// lib/validation.js
import joi from 'joi';
import DOMPurify from 'isomorphic-dompurify';

export const userSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).required(),
  name: joi.string().min(2).max(50).required(),
});

export function sanitizeHtml(input) {
  return DOMPurify.sanitize(input);
}

export function validateInput(data, schema) {
  const { error, value } = schema.validate(data);
  if (error) {
    throw new Error(error.details[0].message);
  }
  return value;
}</code></pre>

    <h3>Rate Limiting</h3>
    <p>La limitation du taux de requêtes aide à prévenir les attaques par déni de service et les tentatives de force brute :</p>

    <pre><code class="language-javascript">// lib/rateLimiter.js
import { LRUCache } from 'lru-cache';

const rateLimit = (options) => {
  const tokenCache = new LRUCache({
    max: options.uniqueTokenPerInterval || 500,
    ttl: options.interval || 60000,
  });

  return {
    check: (limit, token) =>
      new Promise((resolve, reject) => {
        const tokenCount = tokenCache.get(token) || [0];
        if (tokenCount[0] === 0) {
          tokenCache.set(token, tokenCount);
        }
        tokenCount[0] += 1;

        const currentUsage = tokenCount[0];
        const isRateLimited = currentUsage >= limit;
        
        if (isRateLimited) {
          reject(new Error('Rate limit exceeded'));
        } else {
          resolve({ count: currentUsage, limit, remaining: limit - currentUsage });
        }
      }),
  };
};

export default rateLimit;</code></pre>
  `,
  example: {
    title: 'API sécurisée avec authentification JWT complète',
    code: `// pages/api/auth/login.js
import { hashPassword, comparePassword, generateTokens } from '../../../lib/auth';
import { validateInput, userSchema } from '../../../lib/validation';
import rateLimit from '../../../lib/rateLimiter';

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    // Rate limiting
    await limiter.check(5, req.ip); // 5 tentatives par minute

    // Validation des données
    const { email, password } = validateInput(req.body, userSchema.pick(['email', 'password']));

    // Simulation de recherche utilisateur en base
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    // Vérification du mot de passe
    const isValidPassword = await comparePassword(password, user.hashedPassword);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    // Génération des tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.email);

    // Configuration du cookie sécurisé pour le refresh token
    res.setHeader('Set-Cookie', [
      \`refreshToken=\${refreshToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=604800; Path=/\`,
    ]);

    res.status(200).json({
      success: true,
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    if (error.message === 'Rate limit exceeded') {
      return res.status(429).json({ error: 'Trop de tentatives, réessayez plus tard' });
    }
    
    console.error('Erreur de connexion:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}

// pages/api/auth/refresh.js
import jwt from 'jsonwebtoken';
import { generateTokens } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { refreshToken } = req.cookies;
    
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token manquant' });
    }

    // Vérification du refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Récupération des informations utilisateur
    const user = await findUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Utilisateur non trouvé' });
    }

    // Génération de nouveaux tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id, user.email);

    // Mise à jour du cookie
    res.setHeader('Set-Cookie', [
      \`refreshToken=\${newRefreshToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=604800; Path=/\`,
    ]);

    res.status(200).json({ accessToken });
  } catch (error) {
    res.status(401).json({ error: 'Refresh token invalide' });
  }
}

// pages/api/protected/profile.js
import { withAuth } from '../../../middleware/auth';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    // req.user est disponible grâce au middleware withAuth
    const user = await findUserById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}

export default withAuth(handler);`,
    explanation:
      "Cet exemple montre l'implémentation complète d'un système d'authentification sécurisé avec JWT dans Next.js. Il inclut la connexion avec rate limiting, la gestion des refresh tokens via des cookies sécurisés, et la protection des routes avec un middleware d'authentification."
  },
  exercise: {
    title: "Sécurisation d'une API de gestion d'articles",
    description:
      "Vous devez sécuriser une API permettant de créer, lire, modifier et supprimer des articles. Implémentez l'authentification JWT et les autorisations appropriées.",
    options: [
      {
        id: 1,
        text: "Utiliser uniquement des tokens d'accès sans expiration",
        correct: false
      },
      {
        id: 2,
        text: "Implémenter des tokens d'accès courts avec des refresh tokens",
        correct: true
      },
      {
        id: 3,
        text: 'Stocker les tokens JWT dans le localStorage',
        correct: false
      },
      {
        id: 4,
        text: 'Permettre à tous les utilisateurs authentifiés de supprimer tous les articles',
        correct: false
      }
    ],
    solution: `// middleware/authMiddleware.js
import { verifyToken } from '../lib/auth';

export function withAuth(handler) {
  return async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ error: 'Token d\\'authentification requis' });
      }
      
      const decoded = verifyToken(token);
      req.user = decoded;
      
      return handler(req, res);
    } catch (error) {
      return res.status(401).json({ error: 'Token invalide ou expiré' });
    }
  };
}

export function withRole(allowedRoles) {
  return (handler) => {
    return async (req, res) => {
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Permissions insuffisantes' });
      }
      return handler(req, res);
    };
  };
}

// pages/api/articles/[id].js
import { withAuth, withRole } from '../../../middleware/authMiddleware';
import { validateInput } from '../../../lib/validation';
import joi from 'joi';

const articleSchema = joi.object({
  title: joi.string().min(1).max(200).required(),
  content: joi.string().min(1).required(),
  tags: joi.array().items(joi.string()).max(10),
});

async function handler(req, res) {
  const { id } = req.query;
  const { method } = req;

  switch (method) {
    case 'GET':
      return getArticle(req, res, id);
    case 'PUT':
      return updateArticle(req, res, id);
    case 'DELETE':
      return deleteArticle(req, res, id);
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({ error: \`Méthode \${method} non autorisée\` });
  }
}

async function getArticle(req, res, id) {
  try {
    const article = await findArticleById(id);
    
    if (!article) {
      return res.status(404).json({ error: 'Article non trouvé' });
    }

    // Vérifier si l'article est privé et si l'utilisateur a les droits
    if (article.isPrivate && article.authorId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    res.status(200).json({ article });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération de l\\'article' });
  }
}

async function updateArticle(req, res, id) {
  try {
    const article = await findArticleById(id);
    
    if (!article) {
      return res.status(404).json({ error: 'Article non trouvé' });
    }

    // Vérifier que l'utilisateur est l'auteur ou admin
    if (article.authorId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Permission de modification refusée' });
    }

    // Validation des données
    const validatedData = validateInput(req.body, articleSchema);
    
    const updatedArticle = await updateArticleById(id, {
      ...validatedData,
      updatedAt: new Date(),
      updatedBy: req.user.userId,
    });

    res.status(200).json({ article: updatedArticle });
  } catch (error) {
    if (error.message.includes('validation')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
}

async function deleteArticle(req, res, id) {
  try {
    const article = await findArticleById(id);
    
    if (!article) {
      return res.status(404).json({ error: 'Article non trouvé' });
    }

    // Seul l'auteur ou un admin peut supprimer
    if (article.authorId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Permission de suppression refusée' });
    }

    await deleteArticleById(id);
    res.status(200).json({ message: 'Article supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
}

// Application du middleware d'authentification
export default withAuth(handler);

// pages/api/articles/index.js - Route pour créer un article
import { withAuth } from '../../../middleware/authMiddleware';

async function handler(req, res) {
  if (req.method === 'POST') {
    return createArticle(req, res);
  } else if (req.method === 'GET') {
    return getArticles(req, res);
  }
  
  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: \`Méthode \${req.method} non autorisée\` });
}

async function createArticle(req, res) {
  try {
    // Validation des données
    const validatedData = validateInput(req.body, articleSchema);
    
    const article = await createNewArticle({
      ...validatedData,
      authorId: req.user.userId,
      createdAt: new Date(),
    });

    res.status(201).json({ article });
  } catch (error) {
    if (error.message.includes('validation')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Erreur lors de la création' });
  }
}

export default withAuth(handler);`
  },
  quiz: {
    title: 'Quiz sur la sécurité des API Next.js',
    questions: [
      {
        question: "Quelle est la durée recommandée pour un token d'accès JWT ?",
        options: ['24 heures', '15-30 minutes', '7 jours', "Pas d'expiration"],
        correctAnswer: '15-30 minutes'
      },
      {
        question:
          'Où devrait-on stocker le refresh token côté client pour une sécurité optimale ?',
        options: [
          'localStorage',
          'sessionStorage',
          'Cookie HttpOnly sécurisé',
          'Variable JavaScript globale'
        ],
        correctAnswer: 'Cookie HttpOnly sécurisé'
      },
      {
        question:
          "Que signifie CSRF et comment Next.js aide-t-il à s'en protéger ?",
        options: [
          'Cross-Site Request Forgery - Next.js inclut une protection CSRF automatique',
          'Client-Side Request Filter - Next.js filtre automatiquement les requêtes',
          'Cross-Server Response Framework - Next.js standardise les réponses',
          'Concurrent Session Request Format - Next.js gère les sessions concurrentes'
        ],
        correctAnswer:
          'Cross-Site Request Forgery - Next.js inclut une protection CSRF automatique'
      },
      {
        question:
          'Quelle est la meilleure pratique pour gérer les mots de passe ?',
        options: [
          'Les stocker en base64',
          'Les hacher avec bcrypt et un salt élevé',
          'Les chiffrer avec AES',
          'Les stocker en plain text sécurisé'
        ],
        correctAnswer: 'Les hacher avec bcrypt et un salt élevé'
      }
    ]
  },
  project: {
    title: "Système d'authentification sécurisé complet",
    description: `Créez un système d\'authentification complet pour une application Next.js incluant :

1. Inscription/connexion avec validation robuste
2. Authentification JWT avec refresh tokens
3. Protection CSRF et rate limiting
4. Système de rôles et permissions
5. Récupération de mot de passe sécurisée
6. Logging des tentatives de connexion

L\'objectif est de construire un système de sécurité de niveau production.`,
    initialCode: `// Code initial basique à améliorer
export default function handler(req, res) {
  if (req.method === 'POST') {
    const { email, password } = req.body;
    
    // Authentification basique non sécurisée
    if (email === 'admin@test.com' && password === 'password') {
      res.status(200).json({ success: true });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  }
}`,
    solution: `// Solution complète du système d'authentification sécurisé

// lib/auth.js - Utilitaires d'authentification
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

export async function hashPassword(password) {
  return await bcrypt.hash(password, 12);
}

export async function comparePassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

export function generateTokens(userId, email, role = 'user') {
  const accessToken = jwt.sign(
    { userId, email, role },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { userId, tokenVersion: Date.now() },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
}

export function verifyToken(token, secret = JWT_SECRET) {
  return jwt.verify(token, secret);
}

export function generatePasswordResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

// lib/validation.js - Schémas de validation
import joi from 'joi';

export const registerSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.pattern.base': 'Le mot de passe doit contenir au moins 8 caractères avec une majuscule, une minuscule, un chiffre et un caractère spécial'
    }),
  name: joi.string().min(2).max(50).required(),
  confirmPassword: joi.string().valid(joi.ref('password')).required()
    .messages({ 'any.only': 'Les mots de passe ne correspondent pas' })
});

export const loginSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().required()
});

// lib/rateLimiter.js - Rate limiting avancé
import { LRUCache } from 'lru-cache';

class RateLimiter {
  constructor(options = {}) {
    this.cache = new LRUCache({
      max: options.uniqueTokenPerInterval || 500,
      ttl: options.interval || 60000,
    });
  }

  async check(limit, token) {
    const tokenCount = this.cache.get(token) || [0];
    if (tokenCount[0] === 0) {
      this.cache.set(token, tokenCount);
    }
    tokenCount[0] += 1;

    if (tokenCount[0] > limit) {
      throw new Error('Rate limit exceeded');
    }

    return {
      count: tokenCount[0],
      limit,
      remaining: limit - tokenCount[0]
    };
  }
}

export default RateLimiter;

// middleware/auth.js - Middleware d'authentification
import { verifyToken } from '../lib/auth';

export function withAuth(handler) {
  return async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ error: 'Token d\\'authentification requis' });
      }
      
      const decoded = verifyToken(token);
      req.user = decoded;
      
      return handler(req, res);
    } catch (error) {
      return res.status(401).json({ error: 'Token invalide ou expiré' });
    }
  };
}

export function withRole(allowedRoles) {
  return (handler) => {
    return async (req, res) => {
      if (!Array.isArray(allowedRoles)) {
        allowedRoles = [allowedRoles];
      }
      
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Permissions insuffisantes' });
      }
      
      return handler(req, res);
    };
  };
}

// pages/api/auth/register.js - Inscription sécurisée
import { hashPassword } from '../../../lib/auth';
import { registerSchema } from '../../../lib/validation';
import RateLimiter from '../../../lib/rateLimiter';
import DOMPurify from 'isomorphic-dompurify';

const limiter = new RateLimiter({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    // Rate limiting
    await limiter.check(3, req.ip); // 3 tentatives par minute

    // Validation et sanitisation
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password, name } = value;
    const sanitizedName = DOMPurify.sanitize(name);

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Un compte avec cet email existe déjà' });
    }

    // Créer l'utilisateur
    const hashedPassword = await hashPassword(password);
    const user = await createUser({
      email,
      hashedPassword,
      name: sanitizedName,
      role: 'user',
      isVerified: false,
      createdAt: new Date()
    });

    // Log de l'inscription
    await logSecurityEvent({
      type: 'USER_REGISTRATION',
      userId: user.id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      timestamp: new Date()
    });

    // Envoyer email de vérification (simulation)
    // await sendVerificationEmail(user.email, user.verificationToken);

    res.status(201).json({
      message: 'Compte créé avec succès. Vérifiez votre email pour activer votre compte.',
      userId: user.id
    });

  } catch (error) {
    if (error.message === 'Rate limit exceeded') {
      return res.status(429).json({ error: 'Trop de tentatives d\\'inscription' });
    }
    
    console.error('Erreur d\\'inscription:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}

// pages/api/auth/login.js - Connexion sécurisée
import { comparePassword, generateTokens } from '../../../lib/auth';
import { loginSchema } from '../../../lib/validation';
import RateLimiter from '../../../lib/rateLimiter';

const limiter = new RateLimiter({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    // Rate limiting plus strict pour la connexion
    await limiter.check(5, req.ip);

    // Validation
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = value;

    // Recherche utilisateur
    const user = await findUserByEmail(email);
    if (!user) {
      // Log de tentative de connexion échouée
      await logSecurityEvent({
        type: 'LOGIN_FAILED',
        email,
        reason: 'USER_NOT_FOUND',
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        timestamp: new Date()
      });
      
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    // Vérification compte verrouillé
    if (user.isLocked && user.lockUntil > new Date()) {
      await logSecurityEvent({
        type: 'LOGIN_BLOCKED',
        userId: user.id,
        reason: 'ACCOUNT_LOCKED',
        ip: req.ip,
        timestamp: new Date()
      });
      
      return res.status(423).json({ error: 'Compte temporairement verrouillé' });
    }

    // Vérification mot de passe
    const isValidPassword = await comparePassword(password, user.hashedPassword);
    if (!isValidPassword) {
      // Incrémenter tentatives échouées
      await incrementFailedAttempts(user.id);
      
      await logSecurityEvent({
        type: 'LOGIN_FAILED',
        userId: user.id,
        reason: 'INVALID_PASSWORD',
        ip: req.ip,
        timestamp: new Date()
      });
      
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    // Vérification compte vérifié
    if (!user.isVerified) {
      return res.status(403).json({ error: 'Compte non vérifié. Vérifiez votre email.' });
    }

    // Réinitialiser tentatives échouées
    await resetFailedAttempts(user.id);

    // Générer tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.role);

    // Sauvegarder le refresh token en base (pour pouvoir le révoquer)
    await saveRefreshToken(user.id, refreshToken);

    // Cookie sécurisé pour refresh token
    const isProduction = process.env.NODE_ENV === 'production';
    res.setHeader('Set-Cookie', [
      \`refreshToken=\${refreshToken}; HttpOnly; Secure=\${isProduction}; SameSite=Strict; Max-Age=604800; Path=/\`,
    ]);

    // Log de connexion réussie
    await logSecurityEvent({
      type: 'LOGIN_SUCCESS',
      userId: user.id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      timestamp: new Date()
    });

    // Mettre à jour dernière connexion
    await updateLastLogin(user.id);

    res.status(200).json({
      success: true,
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        lastLogin: new Date()
      }
    });

  } catch (error) {
    if (error.message === 'Rate limit exceeded') {
      return res.status(429).json({ error: 'Trop de tentatives de connexion' });
    }
    
    console.error('Erreur de connexion:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}

// pages/api/auth/refresh.js - Renouvellement de token
import { verifyToken, generateTokens } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { refreshToken } = req.cookies;
    
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token manquant' });
    }

    // Vérifier que le token existe en base
    const storedToken = await findRefreshToken(refreshToken);
    if (!storedToken || storedToken.isRevoked) {
      return res.status(401).json({ error: 'Refresh token invalide' });
    }

    // Vérifier la signature du token
    const decoded = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Récupérer l'utilisateur
    const user = await findUserById(decoded.userId);
    if (!user || !user.isVerified) {
      return res.status(401).json({ error: 'Utilisateur invalide' });
    }

    // Générer nouveaux tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      user.id, 
      user.email, 
      user.role
    );

    // Révoquer l'ancien refresh token et sauvegarder le nouveau
    await revokeRefreshToken(refreshToken);
    await saveRefreshToken(user.id, newRefreshToken);

    // Mettre à jour le cookie
    const isProduction = process.env.NODE_ENV === 'production';
    res.setHeader('Set-Cookie', [
      \`refreshToken=\${newRefreshToken}; HttpOnly; Secure=\${isProduction}; SameSite=Strict; Max-Age=604800; Path=/\`,
    ]);

    res.status(200).json({ accessToken });

  } catch (error) {
    console.error('Erreur refresh token:', error);
    res.status(401).json({ error: 'Refresh token invalide' });
  }
}

// pages/api/auth/logout.js - Déconnexion sécurisée
import { withAuth } from '../../../middleware/auth';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { refreshToken } = req.cookies;
    
    if (refreshToken) {
      // Révoquer le refresh token
      await revokeRefreshToken(refreshToken);
    }

    // Supprimer le cookie
    res.setHeader('Set-Cookie', [
      'refreshToken=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/',
    ]);

    // Log de déconnexion
    await logSecurityEvent({
      type: 'LOGOUT',
      userId: req.user.userId,
      ip: req.ip,
      timestamp: new Date()
    });

    res.status(200).json({ message: 'Déconnexion réussie' });

  } catch (error) {
    console.error('Erreur de déconnexion:', error);
    res.status(500).json({ error: 'Erreur lors de la déconnexion' });
  }
}

export default withAuth(handler);

// Fonctions utilitaires de base de données (à adapter selon votre ORM)
async function findUserByEmail(email) {
  // Implémentation selon votre base de données
}

async function createUser(userData) {
  // Implémentation selon votre base de données
}

async function incrementFailedAttempts(userId) {
  // Incrémenter les tentatives échouées et verrouiller si nécessaire
}

async function resetFailedAttempts(userId) {
  // Réinitialiser le compteur de tentatives échouées
}

async function saveRefreshToken(userId, token) {
  // Sauvegarder le refresh token en base
}

async function findRefreshToken(token) {
  // Rechercher le refresh token en base
}

async function revokeRefreshToken(token) {
  // Révoquer le refresh token
}

async function logSecurityEvent(event) {
  // Logger les événements de sécurité
}

async function updateLastLogin(userId) {
  // Mettre à jour la date de dernière connexion
}`
  }
}

export default lesson1

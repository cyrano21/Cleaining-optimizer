// src/data/lessons/module13/lesson2.js
const lesson2 = {
  id: '13-2',
  title: 'Protection contre les vulnérabilités courantes',
  description:
    'Prévention des attaques XSS, injection SQL, et autres vulnérabilités de sécurité',
  difficulty: 'avancé',
  duration: 50,
  tags: [
    'Next.js',
    'Sécurité',
    'XSS',
    'SQL Injection',
    'OWASP',
    'Vulnérabilités'
  ],
  prerequisites: ['13-1'],
  content: `
    <h2>Protection contre les vulnérabilités courantes dans Next.js</h2>
    <p>La sécurisation d'une application Next.js nécessite une compréhension approfondie des vulnérabilités les plus courantes et des techniques pour s'en protéger. Nous allons explorer les 10 principales vulnérabilités OWASP et leur prévention.</p>

    <h3>1. Cross-Site Scripting (XSS)</h3>
    <p>XSS permet aux attaquants d'injecter du code JavaScript malveillant dans les pages web vues par d'autres utilisateurs.</p>

    <h4>Types d'attaques XSS</h4>
    <ul>
      <li><strong>XSS Réfléchi</strong> : Le script malveillant est reflété depuis le serveur</li>
      <li><strong>XSS Stocké</strong> : Le script est stocké dans la base de données</li>
      <li><strong>XSS basé sur le DOM</strong> : L'attaque se produit côté client</li>
    </ul>

    <h4>Protection contre XSS dans Next.js</h4>
    <pre><code class="language-javascript">// Échappement automatique avec React
function SafeComponent({ userInput }) {
  // React échappe automatiquement les variables dans JSX
  return <div>{userInput}</div>; // Sécurisé par défaut
}

// Attention avec dangerouslySetInnerHTML
function UnsafeComponent({ htmlContent }) {
  // DANGEREUX - peut permettre XSS
  return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
}

// Version sécurisée avec DOMPurify
import DOMPurify from 'isomorphic-dompurify';

function SafeHTMLComponent({ htmlContent }) {
  const sanitizedHTML = DOMPurify.sanitize(htmlContent, {
    ALLOWED_TAGS: ['p', 'strong', 'em', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: []
  });
  
  return <div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />;
}</code></pre>

    <h3>2. Injection SQL</h3>
    <p>Bien que Next.js soit côté client/serveur, les APIs peuvent être vulnérables aux injections SQL.</p>

    <pre><code class="language-javascript">// VULNÉRABLE - Construction de requête par concaténation
async function getUserBad(userId) {
  const query = \`SELECT * FROM users WHERE id = '\${userId}'\`;
  return await db.query(query); // Vulnérable à l'injection
}

// SÉCURISÉ - Utilisation de requêtes préparées
async function getUserSafe(userId) {
  const query = 'SELECT * FROM users WHERE id = ?';
  return await db.query(query, [userId]); // Paramètre échappé
}

// Avec un ORM comme Prisma (recommandé)
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function getUserPrisma(userId) {
  return await prisma.user.findUnique({
    where: { id: parseInt(userId) } // Type safety + échappement automatique
  });
}</code></pre>

    <h3>3. Cross-Site Request Forgery (CSRF)</h3>
    <p>CSRF force un utilisateur authentifié à exécuter des actions non désirées.</p>

    <pre><code class="language-javascript">// Protection CSRF avec tokens
import { generateCsrfToken, verifyCsrfToken } from '../lib/csrf';

// pages/api/protected-action.js
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { csrfToken, ...data } = req.body;
    
    // Vérifier le token CSRF
    if (!verifyCsrfToken(csrfToken, req.session.csrfSecret)) {
      return res.status(403).json({ error: 'Token CSRF invalide' });
    }
    
    // Traiter l'action sécurisée
    await processAction(data);
    res.status(200).json({ success: true });
  }
}

// Côté client - inclure le token dans les formulaires
export default function SecureForm() {
  const [csrfToken, setCsrfToken] = useState('');
  
  useEffect(() => {
    fetch('/api/csrf-token')
      .then(res => res.json())
      .then(data => setCsrfToken(data.token));
  }, []);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    await fetch('/api/protected-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        csrfToken,
        // autres données
      })
    });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" value={csrfToken} />
      {/* autres champs */}
    </form>
  );
}</code></pre>

    <h3>4. Sécurité des en-têtes HTTP</h3>
    <p>Les en-têtes de sécurité HTTP protègent contre de nombreuses attaques.</p>

    <pre><code class="language-javascript">// next.config.js - Configuration des en-têtes de sécurité
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY' // Prévient le clickjacking
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff' // Prévient le MIME sniffing
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
          {
            key: 'Content-Security-Policy',
            value: \`
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline';
              style-src 'self' 'unsafe-inline';
              img-src 'self' data: https:;
              font-src 'self';
              connect-src 'self';
              frame-src 'none';
            \`.replace(/\\s+/g, ' ').trim()
          }
        ],
      },
    ];
  },
};</code></pre>

    <h3>5. Validation et échappement des données</h3>
    <p>Une validation robuste est essentielle pour prévenir de nombreuses attaques.</p>

    <pre><code class="language-javascript">// lib/validation.js - Validation avancée
import joi from 'joi';
import validator from 'validator';
import DOMPurify from 'isomorphic-dompurify';

// Schémas de validation personnalisés
export const secureStringSchema = joi.string()
  .pattern(/^[a-zA-Z0-9\s\-_.,!?]+$/) // Caractères autorisés uniquement
  .max(1000)
  .custom((value, helpers) => {
    // Vérification anti-XSS
    if (value !== DOMPurify.sanitize(value)) {
      return helpers.error('string.xss');
    }
    return value;
  }, 'XSS protection');

export const emailSchema = joi.string()
  .email()
  .custom((value, helpers) => {
    if (!validator.isEmail(value)) {
      return helpers.error('string.email');
    }
    return validator.normalizeEmail(value);
  }, 'Email normalization');

// Middleware de validation
export function validateInput(schema) {
  return (handler) => {
    return async (req, res) => {
      try {
        const { error, value } = schema.validate(req.body);
        if (error) {
          return res.status(400).json({ 
            error: 'Données invalides',
            details: error.details.map(d => d.message)
          });
        }
        
        req.validatedBody = value;
        return handler(req, res);
      } catch (error) {
        return res.status(400).json({ error: 'Erreur de validation' });
      }
    };
  };
}</code></pre>

    <h3>6. Sécurité des uploads de fichiers</h3>
    <p>Les uploads de fichiers peuvent être un vecteur d'attaque majeur.</p>

    <pre><code class="language-javascript">// lib/fileUpload.js - Upload sécurisé
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'text/plain'
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/secure/');
  },
  filename: (req, file, cb) => {
    // Générer un nom de fichier sécurisé
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, \`\${uniqueSuffix}\${ext}\`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1
  },
  fileFilter: (req, file, cb) => {
    // Vérifier le type MIME
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new Error('Type de fichier non autorisé'));
    }
    
    // Vérifier l'extension
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.txt'];
    if (!allowedExts.includes(ext)) {
      return cb(new Error('Extension de fichier non autorisée'));
    }
    
    cb(null, true);
  }
});

// Analyse de fichier pour détecter les malwares (basique)
import { execSync } from 'child_process';

export function scanFile(filePath) {
  try {
    // Utiliser ClamAV ou un autre scanner (exemple simplifié)
    // const result = execSync(\`clamscan \${filePath}\`);
    // return !result.toString().includes('FOUND');
    
    // Pour l'exemple, vérification basique
    const stats = require('fs').statSync(filePath);
    return stats.size > 0 && stats.size < MAX_FILE_SIZE;
  } catch (error) {
    return false;
  }
}</code></pre>

    <h3>7. Logging et monitoring de sécurité</h3>
    <p>Un système de logging robuste aide à détecter et répondre aux attaques.</p>

    <pre><code class="language-javascript">// lib/securityLogger.js
import winston from 'winston';

const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'security' },
  transports: [
    new winston.transports.File({ filename: 'logs/security.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

export function logSecurityEvent(eventType, details) {
  securityLogger.warn('Security Event', {
    type: eventType,
    timestamp: new Date().toISOString(),
    ip: details.ip,
    userAgent: details.userAgent,
    userId: details.userId,
    action: details.action,
    success: details.success,
    error: details.error
  });
}

// Détection d'anomalies
const suspiciousPatterns = [
  /\<script\>/gi,
  /javascript:/gi,
  /\bor\s+1=1\b/gi,
  /union\s+select/gi
];

export function detectSuspiciousInput(input) {
  return suspiciousPatterns.some(pattern => pattern.test(input));
}</code></pre>
  `,
  example: {
    title: 'API sécurisée avec protection complète contre les vulnérabilités',
    code: `// pages/api/secure/user-profile.js
import { withAuth } from '../../../middleware/auth';
import { validateInput, secureStringSchema } from '../../../lib/validation';
import { logSecurityEvent, detectSuspiciousInput } from '../../../lib/securityLogger';
import DOMPurify from 'isomorphic-dompurify';
import rateLimit from '../../../lib/rateLimiter';

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
});

const updateProfileSchema = joi.object({
  name: secureStringSchema.required(),
  bio: joi.string().max(500).optional(),
  website: joi.string().uri().optional()
});

async function handler(req, res) {
  const { method } = req;
  const userIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  
  try {
    // Rate limiting
    await limiter.check(10, userIp);
    
    // Log de la tentative d'accès
    logSecurityEvent('API_ACCESS', {
      ip: userIp,
      userAgent: req.headers['user-agent'],
      userId: req.user.userId,
      endpoint: '/api/secure/user-profile',
      method
    });

    switch (method) {
      case 'GET':
        return getProfile(req, res);
      case 'PUT':
        return updateProfile(req, res);
      default:
        res.setHeader('Allow', ['GET', 'PUT']);
        return res.status(405).json({ error: \`Méthode \${method} non autorisée\` });
    }
  } catch (error) {
    if (error.message === 'Rate limit exceeded') {
      logSecurityEvent('RATE_LIMIT_EXCEEDED', {
        ip: userIp,
        userId: req.user?.userId,
        endpoint: '/api/secure/user-profile'
      });
      return res.status(429).json({ error: 'Trop de requêtes' });
    }
    
    logSecurityEvent('API_ERROR', {
      ip: userIp,
      userId: req.user?.userId,
      error: error.message
    });
    
    return res.status(500).json({ error: 'Erreur interne' });
  }
}

async function getProfile(req, res) {
  try {
    const user = await findUserById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Retourner seulement les données nécessaires
    const safeUserData = {
      id: user.id,
      name: DOMPurify.sanitize(user.name),
      email: user.email,
      bio: user.bio ? DOMPurify.sanitize(user.bio) : null,
      website: user.website,
      createdAt: user.createdAt
    };

    res.status(200).json({ user: safeUserData });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du profil' });
  }
}

async function updateProfile(req, res) {
  try {
    // Vérification CSRF (si implémentée)
    const csrfToken = req.headers['x-csrf-token'];
    if (!verifyCsrfToken(csrfToken, req.session?.csrfSecret)) {
      logSecurityEvent('CSRF_ATTACK_ATTEMPT', {
        ip: req.headers['x-forwarded-for'],
        userId: req.user.userId
      });
      return res.status(403).json({ error: 'Token CSRF invalide' });
    }

    // Validation des données
    const { error, value } = updateProfileSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Données invalides',
        details: error.details.map(d => d.message)
      });
    }

    // Détection d'input suspect
    const inputString = JSON.stringify(value);
    if (detectSuspiciousInput(inputString)) {
      logSecurityEvent('SUSPICIOUS_INPUT_DETECTED', {
        ip: req.headers['x-forwarded-for'],
        userId: req.user.userId,
        input: inputString.substring(0, 100) // Log partiel pour investigation
      });
      return res.status(400).json({ error: 'Données suspectes détectées' });
    }

    // Sanitisation des données
    const sanitizedData = {
      name: DOMPurify.sanitize(value.name),
      bio: value.bio ? DOMPurify.sanitize(value.bio) : null,
      website: value.website // Déjà validé comme URI
    };

    // Mise à jour en base
    const updatedUser = await updateUserProfile(req.user.userId, sanitizedData);

    logSecurityEvent('PROFILE_UPDATED', {
      ip: req.headers['x-forwarded-for'],
      userId: req.user.userId,
      success: true
    });

    res.status(200).json({ 
      message: 'Profil mis à jour avec succès',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        bio: updatedUser.bio,
        website: updatedUser.website
      }
    });

  } catch (error) {
    logSecurityEvent('PROFILE_UPDATE_ERROR', {
      ip: req.headers['x-forwarded-for'],
      userId: req.user.userId,
      error: error.message,
      success: false
    });

    console.error('Erreur lors de la mise à jour du profil:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
}

// Application des middlewares de sécurité
export default withAuth(handler);

// Configuration de sécurité supplémentaire
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb', // Limite la taille des requêtes
    },
  },
};`,
    explanation:
      'Cet exemple montre une API Next.js complètement sécurisée avec protection contre XSS, injection, CSRF, rate limiting, validation robuste, sanitisation des données, et logging de sécurité. Toutes les bonnes pratiques de sécurité sont implémentées.'
  },
  exercise: {
    title: "Audit de sécurité d'une API vulnérable",
    description:
      "Analysez le code d'API suivant et identifiez toutes les vulnérabilités de sécurité présentes.",
    options: [
      {
        id: 1,
        text: 'Le code ne présente aucune vulnérabilité majeure',
        correct: false
      },
      {
        id: 2,
        text: 'Il y a des vulnérabilités XSS, SQL injection, et manque de validation',
        correct: true
      },
      { id: 3, text: 'Seule la protection CSRF est manquante', correct: false },
      {
        id: 4,
        text: 'Le code est sécurisé mais manque de performance',
        correct: false
      }
    ],
    solution: `// Code vulnérable analysé :
export default async function handler(req, res) {
  const { userId, name, comment } = req.body;
  
  // ❌ VULNÉRABILITÉ 1: Pas de validation d'authentification
  // ❌ VULNÉRABILITÉ 2: Pas de validation des données d'entrée
  // ❌ VULNÉRABILITÉ 3: Injection SQL possible
  const query = \`UPDATE users SET name = '\${name}' WHERE id = \${userId}\`;
  await db.query(query);
  
  // ❌ VULNÉRABILITÉ 4: XSS possible dans la réponse
  const commentQuery = \`INSERT INTO comments (user_id, content) VALUES (\${userId}, '\${comment}')\`;
  await db.query(commentQuery);
  
  // ❌ VULNÉRABILITÉ 5: Exposition d'informations sensibles
  res.status(200).json({ 
    message: 'Mis à jour',
    rawSql: query,
    user: { id: userId, name, password: 'secret123' }
  });
}

// ✅ VERSION CORRIGÉE :
import { withAuth } from '../../../middleware/auth';
import { validateInput } from '../../../lib/validation';
import joi from 'joi';
import DOMPurify from 'isomorphic-dompurify';

const updateSchema = joi.object({
  userId: joi.number().integer().positive().required(),
  name: joi.string().min(1).max(100).pattern(/^[a-zA-Z\s]+$/).required(),
  comment: joi.string().max(500).required()
});

async function handler(req, res) {
  try {
    // ✅ Authentification vérifiée par withAuth
    // ✅ Validation des données
    const { error, value } = updateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: 'Données invalides' });
    }

    const { userId, name, comment } = value;
    
    // ✅ Vérification d'autorisation
    if (userId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    // ✅ Requêtes préparées pour éviter l'injection SQL
    await db.query(
      'UPDATE users SET name = ? WHERE id = ?',
      [DOMPurify.sanitize(name), userId]
    );
    
    await db.query(
      'INSERT INTO comments (user_id, content) VALUES (?, ?)',
      [userId, DOMPurify.sanitize(comment)]
    );

    // ✅ Réponse sécurisée sans données sensibles
    res.status(200).json({ 
      message: 'Profil mis à jour avec succès',
      userId: userId
    });
    
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur interne' });
  }
}

export default withAuth(handler);`
  },
  quiz: {
    title: 'Quiz sur la protection contre les vulnérabilités',
    questions: [
      {
        question:
          'Quelle est la meilleure méthode pour prévenir les attaques XSS dans React/Next.js ?',
        options: [
          'Utiliser dangerouslySetInnerHTML systématiquement',
          'Échapper manuellement tous les caractères spéciaux',
          "Utiliser l'échappement automatique de React et DOMPurify pour le HTML",
          'Désactiver JavaScript côté client'
        ],
        correctAnswer:
          "Utiliser l'échappement automatique de React et DOMPurify pour le HTML"
      },
      {
        question: 'Comment prévenir efficacement les injections SQL ?',
        options: [
          'Utiliser des requêtes préparées avec des paramètres',
          'Échapper tous les guillemets dans les requêtes',
          'Utiliser uniquement des requêtes GET',
          'Chiffrer toutes les données avant insertion'
        ],
        correctAnswer: 'Utiliser des requêtes préparées avec des paramètres'
      },
      {
        question: 'Quel en-tête HTTP prévient le clickjacking ?',
        options: [
          'X-Content-Type-Options',
          'X-Frame-Options',
          'Strict-Transport-Security',
          'Content-Security-Policy'
        ],
        correctAnswer: 'X-Frame-Options'
      },
      {
        question:
          "Quelle est la méthode la plus sûre pour l'upload de fichiers ?",
        options: [
          'Accepter tous les types de fichiers',
          "Vérifier uniquement l'extension du fichier",
          "Valider le type MIME, l'extension, scanner le contenu et limiter la taille",
          'Stocker les fichiers dans le dossier public'
        ],
        correctAnswer:
          "Valider le type MIME, l'extension, scanner le contenu et limiter la taille"
      }
    ]
  },
  project: {
    title: "Audit et sécurisation complète d'une application Next.js",
    description: `Vous devez effectuer un audit de sécurité complet d'une application Next.js existante et implémenter toutes les protections nécessaires :

1. Identifier et corriger les vulnérabilités XSS
2. Sécuriser les API contre les injections
3. Implémenter la protection CSRF
4. Configurer les en-têtes de sécurité HTTP
5. Sécuriser les uploads de fichiers
6. Mettre en place un système de logging de sécurité
7. Implémenter le rate limiting
8. Ajouter la validation et sanitisation des données

L'objectif est de transformer une application vulnérable en une application sécurisée de niveau production.`,
    initialCode: `// Code initial vulnérable à sécuriser
// pages/api/user/update.js
export default async function handler(req, res) {
  const { id, name, email, bio } = req.body;
  
  const query = \`UPDATE users SET name='\${name}', email='\${email}', bio='\${bio}' WHERE id=\${id}\`;
  const result = await db.query(query);
  
  res.json({ success: true, query: query });
}

// components/UserProfile.js
export default function UserProfile({ user }) {
  return (
    <div>
      <h1>{user.name}</h1>
      <div dangerouslySetInnerHTML={{ __html: user.bio }} />
    </div>
  );
}`,
    solution: `// Solution complète sécurisée

// lib/security.js - Utilitaires de sécurité
import DOMPurify from 'isomorphic-dompurify';
import joi from 'joi';
import crypto from 'crypto';
import winston from 'winston';

// Logger de sécurité
export const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/security.log' })
  ]
});

// Schémas de validation
export const updateUserSchema = joi.object({
  id: joi.number().integer().positive().required(),
  name: joi.string().min(1).max(100).pattern(/^[a-zA-Z\s\-']+$/).required(),
  email: joi.string().email().required(),
  bio: joi.string().max(1000).optional()
});

// Détection d'attaques
export function detectMaliciousInput(input) {
  const maliciousPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /\b(union|select|insert|update|delete|drop)\b/gi
  ];
  
  return maliciousPatterns.some(pattern => pattern.test(input));
}

// Sanitisation sécurisée
export function sanitizeInput(input, type = 'text') {
  if (typeof input !== 'string') return input;
  
  switch (type) {
    case 'html':
      return DOMPurify.sanitize(input, {
        ALLOWED_TAGS: ['p', 'strong', 'em', 'ul', 'ol', 'li', 'br'],
        ALLOWED_ATTR: []
      });
    case 'text':
    default:
      return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  }
}

// CSRF Protection
export function generateCsrfToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function verifyCsrfToken(token, secret) {
  if (!token || !secret) return false;
  return crypto.timingSafeEqual(
    Buffer.from(token, 'hex'),
    Buffer.from(secret, 'hex')
  );
}

// middleware/security.js - Middleware de sécurité
import { withAuth } from './auth';
import { detectMaliciousInput, securityLogger } from '../lib/security';
import rateLimit from '../lib/rateLimiter';

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
});

export function withSecurity(handler) {
  return withAuth(async (req, res) => {
    const userIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    try {
      // Rate limiting
      await limiter.check(20, userIp);
      
      // Détection d'inputs malveillants
      const requestBody = JSON.stringify(req.body);
      if (detectMaliciousInput(requestBody)) {
        securityLogger.warn('Malicious input detected', {
          ip: userIp,
          userId: req.user?.userId,
          input: requestBody.substring(0, 200),
          endpoint: req.url
        });
        return res.status(400).json({ error: 'Input malveillant détecté' });
      }
      
      // Log de l'accès
      securityLogger.info('API Access', {
        ip: userIp,
        userId: req.user.userId,
        endpoint: req.url,
        method: req.method
      });
      
      return handler(req, res);
      
    } catch (error) {
      if (error.message === 'Rate limit exceeded') {
        securityLogger.warn('Rate limit exceeded', { ip: userIp });
        return res.status(429).json({ error: 'Trop de requêtes' });
      }
      throw error;
    }
  });
}

// pages/api/user/update.js - API sécurisée
import { withSecurity } from '../../../middleware/security';
import { updateUserSchema, sanitizeInput, verifyCsrfToken } from '../../../lib/security';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    // Vérification CSRF
    const csrfToken = req.headers['x-csrf-token'];
    if (!verifyCsrfToken(csrfToken, req.session?.csrfSecret)) {
      return res.status(403).json({ error: 'Token CSRF invalide' });
    }

    // Validation des données
    const { error, value } = updateUserSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Données invalides',
        details: error.details.map(d => d.message)
      });
    }

    const { id, name, email, bio } = value;

    // Vérification d'autorisation
    if (id !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    // Sanitisation des données
    const sanitizedData = {
      name: sanitizeInput(name),
      email: email.toLowerCase().trim(),
      bio: bio ? sanitizeInput(bio, 'html') : null
    };

    // Mise à jour sécurisée avec Prisma
    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: sanitizedData,
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        updatedAt: true
      }
    });

    securityLogger.info('User updated successfully', {
      userId: req.user.userId,
      targetUserId: id
    });

    res.status(200).json({ 
      success: true,
      user: updatedUser
    });

  } catch (error) {
    securityLogger.error('User update failed', {
      userId: req.user.userId,
      error: error.message
    });

    console.error('Erreur lors de la mise à jour:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}

export default withSecurity(handler);

// components/UserProfile.js - Composant sécurisé
import { sanitizeInput } from '../lib/security';
import { useState, useEffect } from 'react';

export default function UserProfile({ user }) {
  const [sanitizedBio, setSanitizedBio] = useState('');

  useEffect(() => {
    if (user.bio) {
      // Sanitisation côté client aussi par sécurité
      setSanitizedBio(sanitizeInput(user.bio, 'html'));
    }
  }, [user.bio]);

  return (
    <div className="user-profile">
      {/* Échappement automatique de React */}
      <h1>{user.name}</h1>
      <p>Email: {user.email}</p>
      
      {/* Bio sanitisée si contient du HTML */}
      {sanitizedBio && (
        <div 
          className="user-bio"
          dangerouslySetInnerHTML={{ __html: sanitizedBio }} 
        />
      )}
    </div>
  );
}

// next.config.js - Configuration de sécurité
module.exports = {
  // En-têtes de sécurité
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
          {
            key: 'Content-Security-Policy',
            value: \`
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline';
              style-src 'self' 'unsafe-inline';
              img-src 'self' data: https:;
              connect-src 'self';
              frame-src 'none';
            \`.replace(/\\s+/g, ' ').trim()
          }
        ],
      },
    ];
  },
  
  // Configuration des API routes
  experimental: {
    serverComponentsExternalPackages: ['bcryptjs']
  }
};

// pages/api/csrf-token.js - Génération token CSRF
import { generateCsrfToken } from '../../lib/security';

export default function handler(req, res) {
  if (req.method === 'GET') {
    const token = generateCsrfToken();
    
    // Stocker en session (ou adapter selon votre système de session)
    req.session = req.session || {};
    req.session.csrfSecret = token;
    
    res.status(200).json({ token });
  } else {
    res.status(405).json({ error: 'Méthode non autorisée' });
  }
}`
  }
}

export default lesson2

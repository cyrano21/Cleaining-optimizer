// src/data/lessons/module13/lesson3.js
const lesson3 = {
  id: '13-3',
  title: 'Sécurité côté client et protection XSS',
  description:
    'Protection contre les attaques XSS, Content Security Policy et sécurisation du frontend',
  difficulty: 'avancé',
  duration: 50,
  tags: ['Next.js', 'Sécurité', 'XSS', 'CSP', 'Frontend', 'Protection'],
  prerequisites: ['13-2'],
  content: `
    <h2>Sécurité côté client dans Next.js</h2>
    <p>La sécurité côté client est cruciale pour protéger les utilisateurs contre les attaques malveillantes. Next.js offre plusieurs mécanismes pour sécuriser le frontend et prévenir les vulnérabilités comme XSS (Cross-Site Scripting).</p>

    <h3>Attaques XSS (Cross-Site Scripting)</h3>
    <p>Les attaques XSS consistent à injecter du code JavaScript malveillant dans une page web pour voler des données ou compromettre la session utilisateur.</p>

    <h4>Types d'attaques XSS</h4>
    <ul>
      <li><strong>XSS Stocké</strong> : Le code malveillant est stocké sur le serveur (base de données, fichiers)</li>
      <li><strong>XSS Réfléchi</strong> : Le code malveillant est renvoyé immédiatement par le serveur</li>
      <li><strong>XSS DOM</strong> : Le code malveillant modifie directement le DOM côté client</li>
    </ul>

    <h3>Protection XSS avec React et Next.js</h3>
    <p>React offre une protection automatique contre XSS en échappant les données par défaut :</p>

    <pre><code class="language-jsx">// ✅ Sécurisé - React échappe automatiquement les données
function SafeComponent({ userInput }) {
  return <div>{userInput}</div>; // Automatiquement échappé
}

// ⚠️ Dangereux - Contournement de la protection
function DangerousComponent({ htmlContent }) {
  return (
    <div 
      dangerouslySetInnerHTML={{ __html: htmlContent }} 
    />
  );
}

// ✅ Sécurisé avec sanitisation
import DOMPurify from 'dompurify';

function SafeHTMLComponent({ htmlContent }) {
  const sanitizedHTML = DOMPurify.sanitize(htmlContent);
  return (
    <div 
      dangerouslySetInnerHTML={{ __html: sanitizedHTML }} 
    />
  );
}</code></pre>

    <h3>Content Security Policy (CSP)</h3>
    <p>CSP est un mécanisme de sécurité qui aide à prévenir les attaques XSS en contrôlant les ressources que le navigateur peut charger.</p>

    <pre><code class="language-javascript">// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdnjs.cloudflare.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https:",
              "connect-src 'self' https://api.example.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'"
            ].join('; ')
          },
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
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ];
  }
};</code></pre>

    <h3>Validation et sanitisation côté client</h3>
    <p>Il est important de valider et nettoyer les données côté client, même si la validation serveur reste prioritaire :</p>

    <pre><code class="language-javascript">// lib/clientValidation.js
import DOMPurify from 'dompurify';
import validator from 'validator';

export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  
  // Nettoyer les balises HTML malveillantes
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href']
  });
}

export function validateEmail(email) {
  return validator.isEmail(email);
}

export function validateURL(url) {
  return validator.isURL(url, {
    protocols: ['http', 'https'],
    require_protocol: true
  });
}

export function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  
  return text.replace(/[&<>"'/]/g, (s) => map[s]);
}</code></pre>

    <h3>Sécurisation des formulaires</h3>
    <p>Les formulaires sont des points d'entrée critiques qui nécessitent une attention particulière :</p>

    <pre><code class="language-jsx">// components/SecureForm.js
import { useState } from 'react';
import { sanitizeInput, validateEmail } from '../lib/clientValidation';

export default function SecureForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    // Sanitiser immédiatement
    const sanitizedValue = sanitizeInput(value);
    
    setFormData(prev => ({
      ...prev,
      [field]: sanitizedValue
    }));
    
    // Validation en temps réel
    validateField(field, sanitizedValue);
  };

  const validateField = (field, value) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'email':
        if (!validateEmail(value)) {
          newErrors.email = 'Email invalide';
        } else {
          delete newErrors.email;
        }
        break;
      case 'name':
        if (value.length < 2) {
          newErrors.name = 'Le nom doit contenir au moins 2 caractères';
        } else {
          delete newErrors.name;
        }
        break;
      case 'message':
        if (value.length < 10) {
          newErrors.message = 'Le message doit contenir au moins 10 caractères';
        } else {
          delete newErrors.message;
        }
        break;
    }
    
    setErrors(newErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation finale
    Object.keys(formData).forEach(field => {
      validateField(field, formData[field]);
    });
    
    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\\'envoi');
      }
      
      // Réinitialiser le formulaire
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name">Nom :</label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className="w-full p-2 border rounded"
          maxLength={100}
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
      </div>
      
      <div>
        <label htmlFor="email">Email :</label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className="w-full p-2 border rounded"
          maxLength={255}
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
      </div>
      
      <div>
        <label htmlFor="message">Message :</label>
        <textarea
          id="message"
          value={formData.message}
          onChange={(e) => handleInputChange('message', e.target.value)}
          className="w-full p-2 border rounded"
          rows={4}
          maxLength={1000}
        />
        {errors.message && <p className="text-red-500 text-sm">{errors.message}</p>}
      </div>
      
      <button
        type="submit"
        disabled={Object.keys(errors).length > 0}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        Envoyer
      </button>
    </form>
  );
}</code></pre>

    <h3>Protection contre les attaques par injection de dépendances</h3>
    <p>Sécuriser les imports dynamiques et les dépendances externes :</p>

    <pre><code class="language-javascript">// lib/secureImports.js
const ALLOWED_MODULES = [
  'react',
  'next',
  'lodash',
  'date-fns'
];

export async function secureImport(moduleName) {
  // Vérifier que le module est dans la liste autorisée
  if (!ALLOWED_MODULES.includes(moduleName)) {
    throw new Error(\`Module non autorisé: \${moduleName}\`);
  }
  
  try {
    return await import(moduleName);
  } catch (error) {
    console.error(\`Erreur lors de l'import de \${moduleName}:\`, error);
    throw error;
  }
}

// Exemple d'utilisation sécurisée
export async function loadUtilityLibrary(libName) {
  const allowedLibs = {
    'date': () => import('date-fns'),
    'lodash': () => import('lodash'),
  };
  
  if (!allowedLibs[libName]) {
    throw new Error('Librairie non autorisée');
  }
  
  return await allowedLibs[libName]();
}</code></pre>

    <h3>Gestion sécurisée du stockage local</h3>
    <p>Protéger les données stockées côté client :</p>

    <pre><code class="language-javascript">// lib/secureStorage.js
class SecureStorage {
  constructor() {
    this.prefix = 'nextjs_secure_';
  }
  
  // Chiffrement simple (pour des données non critiques)
  encrypt(data) {
    try {
      const jsonString = JSON.stringify(data);
      return btoa(jsonString);
    } catch (error) {
      console.error('Erreur de chiffrement:', error);
      return null;
    }
  }
  
  decrypt(encryptedData) {
    try {
      const jsonString = atob(encryptedData);
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Erreur de déchiffrement:', error);
      return null;
    }
  }
  
  setItem(key, value, sensitive = false) {
    const fullKey = this.prefix + key;
    
    try {
      if (sensitive) {
        // Pour les données sensibles, utiliser sessionStorage
        const encrypted = this.encrypt(value);
        if (encrypted) {
          sessionStorage.setItem(fullKey, encrypted);
        }
      } else {
        localStorage.setItem(fullKey, JSON.stringify(value));
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  }
  
  getItem(key, sensitive = false) {
    const fullKey = this.prefix + key;
    
    try {
      const storage = sensitive ? sessionStorage : localStorage;
      const stored = storage.getItem(fullKey);
      
      if (!stored) return null;
      
      if (sensitive) {
        return this.decrypt(stored);
      } else {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération:', error);
      return null;
    }
  }
  
  removeItem(key) {
    const fullKey = this.prefix + key;
    localStorage.removeItem(fullKey);
    sessionStorage.removeItem(fullKey);
  }
  
  clear() {
    // Supprimer uniquement les clés avec notre préfixe
    const keys = Object.keys(localStorage).filter(key => 
      key.startsWith(this.prefix)
    );
    
    keys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    const sessionKeys = Object.keys(sessionStorage).filter(key => 
      key.startsWith(this.prefix)
    );
    
    sessionKeys.forEach(key => {
      sessionStorage.removeItem(key);
    });
  }
}

export default new SecureStorage();</code></pre>

    <h3>Audit de sécurité automatisé</h3>
    <p>Mettre en place des vérifications automatiques de sécurité :</p>

    <pre><code class="language-javascript">// lib/securityAudit.js
export class SecurityAuditor {
  constructor() {
    this.vulnerabilities = [];
  }
  
  auditCSP() {
    const cspHeader = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    
    if (!cspHeader) {
      this.vulnerabilities.push({
        type: 'CSP_MISSING',
        severity: 'HIGH',
        message: 'Content Security Policy manquante'
      });
    }
  }
  
  auditHTTPS() {
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      this.vulnerabilities.push({
        type: 'INSECURE_PROTOCOL',
        severity: 'HIGH',
        message: 'Site non sécurisé (HTTP au lieu de HTTPS)'
      });
    }
  }
  
  auditCookies() {
    const cookies = document.cookie.split(';');
    
    cookies.forEach(cookie => {
      const [name] = cookie.trim().split('=');
      
      if (name.toLowerCase().includes('session') || name.toLowerCase().includes('auth')) {
        // Vérifier que les cookies sensibles ont les bons attributs
        // (Cette vérification est limitée côté client)
        console.warn(\`Cookie sensible détecté: \${name}\`);
      }
    });
  }
  
  auditExternalResources() {
    const scripts = document.querySelectorAll('script[src]');
    const links = document.querySelectorAll('link[href]');
    
    [...scripts, ...links].forEach(element => {
      const src = element.src || element.href;
      
      if (src && !src.startsWith(location.origin) && !src.startsWith('https://')) {
        this.vulnerabilities.push({
          type: 'INSECURE_EXTERNAL_RESOURCE',
          severity: 'MEDIUM',
          message: \`Ressource externe non sécurisée: \${src}\`
        });
      }
    });
  }
  
  runAudit() {
    this.vulnerabilities = [];
    
    this.auditCSP();
    this.auditHTTPS();
    this.auditCookies();
    this.auditExternalResources();
    
    return {
      vulnerabilities: this.vulnerabilities,
      score: this.calculateSecurityScore()
    };
  }
  
  calculateSecurityScore() {
    const maxScore = 100;
    let deductions = 0;
    
    this.vulnerabilities.forEach(vuln => {
      switch (vuln.severity) {
        case 'HIGH':
          deductions += 30;
          break;
        case 'MEDIUM':
          deductions += 15;
          break;
        case 'LOW':
          deductions += 5;
          break;
      }
    });
    
    return Math.max(0, maxScore - deductions);
  }
}

export default SecurityAuditor;</code></pre>
  `,
  example: {
    title: 'Composant sécurisé avec protection XSS complète',
    code: `// components/SecureBlogPost.js
import { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { sanitizeInput, validateURL } from '../lib/clientValidation';
import secureStorage from '../lib/secureStorage';

export default function SecureBlogPost({ postId }) {
  const [post, setPost] = useState(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPost();
  }, [postId]);

  const loadPost = async () => {
    try {
      setLoading(true);
      
      // Vérifier le cache sécurisé d'abord
      const cachedPost = secureStorage.getItem(\`post_\${postId}\`);
      if (cachedPost) {
        setPost(cachedPost);
        setLoading(false);
        return;
      }

      const response = await fetch(\`/api/posts/\${encodeURIComponent(postId)}\`);
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement du post');
      }
      
      const postData = await response.json();
      
      // Sanitiser le contenu HTML du post
      const sanitizedPost = {
        ...postData,
        content: DOMPurify.sanitize(postData.content, {
          ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'h3', 'h4'],
          ALLOWED_ATTR: ['href', 'target'],
          ALLOW_DATA_ATTR: false
        }),
        title: sanitizeInput(postData.title),
        author: sanitizeInput(postData.author)
      };
      
      setPost(sanitizedPost);
      
      // Mettre en cache de façon sécurisée
      secureStorage.setItem(\`post_\${postId}\`, sanitizedPost);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentChange = (e) => {
    const value = e.target.value;
    
    // Limiter la longueur et sanitiser
    if (value.length <= 500) {
      setComment(sanitizeInput(value));
    }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    
    if (comment.trim().length < 5) {
      alert('Le commentaire doit contenir au moins 5 caractères');
      return;
    }

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Ajouter un token CSRF si disponible
          'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.content || ''
        },
        body: JSON.stringify({
          postId: postId,
          content: comment.trim()
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\\'envoi du commentaire');
      }

      // Réinitialiser le formulaire
      setComment('');
      
      // Recharger les commentaires
      await loadPost();
      
    } catch (err) {
      console.error('Erreur:', err);
      alert('Erreur lors de l\\'envoi du commentaire');
    }
  };

  const renderLinks = (text) => {
    // Fonction sécurisée pour rendre les liens
    const urlRegex = /(https?:\\/\\/[^\\s]+)/g;
    
    return text.replace(urlRegex, (url) => {
      if (validateURL(url)) {
        return \`<a href="\${url}" target="_blank" rel="noopener noreferrer">\${url}</a>\`;
      }
      return url; // Retourner le texte original si l'URL n'est pas valide
    });
  };

  if (loading) {
    return <div className="animate-spin">Chargement...</div>;
  }

  if (error) {
    return <div className="text-red-500">Erreur: {error}</div>;
  }

  if (!post) {
    return <div>Post non trouvé</div>;
  }

  return (
    <article className="max-w-4xl mx-auto p-6">
      {/* En-tête sécurisé */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold mb-2">
          {post.title}
        </h1>
        <p className="text-gray-600">
          Par {post.author} le {new Date(post.createdAt).toLocaleDateString()}
        </p>
      </header>

      {/* Contenu sanitisé */}
      <div 
        className="prose max-w-none mb-8"
        dangerouslySetInnerHTML={{ 
          __html: post.content 
        }}
      />

      {/* Formulaire de commentaire sécurisé */}
      <section className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Ajouter un commentaire</h3>
        
        <form onSubmit={submitComment} className="space-y-4">
          <div>
            <textarea
              value={comment}
              onChange={handleCommentChange}
              placeholder="Votre commentaire..."
              className="w-full p-3 border rounded-lg resize-none"
              rows={4}
              maxLength={500}
              required
            />
            <div className="text-sm text-gray-500 mt-1">
              {comment.length}/500 caractères
            </div>
          </div>
          
          <button
            type="submit"
            disabled={comment.trim().length < 5}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
          >
            Publier le commentaire
          </button>
        </form>
      </section>

      {/* Affichage des commentaires existants */}
      {post.comments && post.comments.length > 0 && (
        <section className="mt-8">
          <h3 className="text-xl font-semibold mb-4">
            Commentaires ({post.comments.length})
          </h3>
          
          <div className="space-y-4">
            {post.comments.map((comment, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium">
                    {sanitizeInput(comment.author)}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p 
                  className="text-gray-700"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(
                      renderLinks(comment.content),
                      { ALLOWED_TAGS: ['a'], ALLOWED_ATTR: ['href', 'target', 'rel'] }
                    )
                  }}
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}`,
    explanation:
      "Ce composant montre comment créer un système de blog sécurisé avec protection XSS complète. Il sanitise tout le contenu HTML, valide les URLs, limite les caractères d'entrée, utilise un stockage sécurisé en cache, et protège contre les attaques par injection de code."
  },
  exercise: {
    title: "Sécurisation d'un composant de chat en temps réel",
    description:
      'Créez un composant de chat sécurisé qui protège contre les attaques XSS, limite les messages, et valide tous les contenus avant affichage.',
    options: [
      {
        id: 1,
        text: 'Afficher directement tous les messages sans sanitisation',
        correct: false
      },
      {
        id: 2,
        text: 'Sanitiser tous les messages avec DOMPurify avant affichage',
        correct: true
      },
      {
        id: 3,
        text: "Faire confiance au contenu provenant d'utilisateurs authentifiés",
        correct: false
      },
      {
        id: 4,
        text: 'Permettre tous les tags HTML dans les messages',
        correct: false
      }
    ],
    solution: `// components/SecureChat.js
import { useState, useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import { sanitizeInput } from '../lib/clientValidation';
import secureStorage from '../lib/secureStorage';

export default function SecureChat({ roomId, userId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);

  // Configuration de sécurité pour les messages
  const MESSAGE_CONFIG = {
    maxLength: 200,
    allowedTags: ['b', 'i', 'em', 'strong'],
    allowedAttr: [],
    rateLimit: 5, // messages par minute
    profanityFilter: true
  };

  useEffect(() => {
    connectToWebSocket();
    loadCachedMessages();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const connectToWebSocket = () => {
    try {
      const wsUrl = \`wss://\${window.location.host}/ws/chat/\${encodeURIComponent(roomId)}\`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        setIsConnected(true);
        setError(null);
      };

      wsRef.current.onmessage = (event) => {
        handleIncomingMessage(event.data);
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
        // Tentative de reconnexion après 3 secondes
        setTimeout(connectToWebSocket, 3000);
      };

      wsRef.current.onerror = (error) => {
        setError('Erreur de connexion WebSocket');
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      setError('Impossible de se connecter au chat');
    }
  };

  const handleIncomingMessage = (data) => {
    try {
      const message = JSON.parse(data);
      
      // Validation du message reçu
      if (!isValidMessage(message)) {
        console.warn('Message invalide reçu:', message);
        return;
      }

      // Sanitisation du message
      const sanitizedMessage = sanitizeMessage(message);
      
      setMessages(prev => {
        const updated = [...prev, sanitizedMessage];
        
        // Limiter le nombre de messages en mémoire
        if (updated.length > 100) {
          return updated.slice(-100);
        }
        
        // Sauvegarder dans le cache sécurisé
        secureStorage.setItem(\`chat_\${roomId}\`, updated.slice(-50));
        
        return updated;
      });

    } catch (error) {
      console.error('Erreur lors du parsing du message:', error);
    }
  };

  const isValidMessage = (message) => {
    return (
      message &&
      typeof message.content === 'string' &&
      typeof message.userId === 'string' &&
      typeof message.username === 'string' &&
      typeof message.timestamp === 'number' &&
      message.content.length <= MESSAGE_CONFIG.maxLength &&
      message.username.length <= 50
    );
  };

  const sanitizeMessage = (message) => {
    return {
      ...message,
      content: DOMPurify.sanitize(message.content, {
        ALLOWED_TAGS: MESSAGE_CONFIG.allowedTags,
        ALLOWED_ATTR: MESSAGE_CONFIG.allowedAttr,
        KEEP_CONTENT: true
      }),
      username: sanitizeInput(message.username)
    };
  };

  const loadCachedMessages = () => {
    const cached = secureStorage.getItem(\`chat_\${roomId}\`);
    if (cached && Array.isArray(cached)) {
      setMessages(cached);
    }
  };

  const checkRateLimit = () => {
    const now = Date.now();
    const recentMessages = secureStorage.getItem('recent_messages') || [];
    
    // Filtrer les messages des 60 dernières secondes
    const recent = recentMessages.filter(time => now - time < 60000);
    
    if (recent.length >= MESSAGE_CONFIG.rateLimit) {
      return false;
    }
    
    // Ajouter ce message à la liste
    recent.push(now);
    secureStorage.setItem('recent_messages', recent);
    
    return true;
  };

  const filterProfanity = (text) => {
    // Liste basique de mots interdits (à étendre selon les besoins)
    const profanityList = ['spam', 'scam', 'hack'];
    
    let filtered = text;
    profanityList.forEach(word => {
      const regex = new RegExp(word, 'gi');
      filtered = filtered.replace(regex, '*'.repeat(word.length));
    });
    
    return filtered;
  };

  const handleMessageSubmit = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !isConnected) {
      return;
    }

    // Vérification du rate limiting
    if (!checkRateLimit()) {
      setError('Vous envoyez des messages trop rapidement. Attendez un moment.');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      // Sanitisation et validation du message
      let processedMessage = sanitizeInput(newMessage.trim());
      
      if (MESSAGE_CONFIG.profanityFilter) {
        processedMessage = filterProfanity(processedMessage);
      }

      if (processedMessage.length > MESSAGE_CONFIG.maxLength) {
        setError(\`Message trop long (max \${MESSAGE_CONFIG.maxLength} caractères)\`);
        return;
      }

      if (processedMessage.length < 1) {
        setError('Le message ne peut pas être vide');
        return;
      }

      // Envoi du message
      const messageData = {
        type: 'message',
        content: processedMessage,
        roomId: roomId,
        userId: userId,
        timestamp: Date.now()
      };

      wsRef.current.send(JSON.stringify(messageData));
      
      // Réinitialiser le champ
      setNewMessage('');
      setError(null);

    } catch (error) {
      setError('Erreur lors de l\\'envoi du message');
      console.error('Erreur envoi message:', error);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    
    // Limiter la longueur pendant la saisie
    if (value.length <= MESSAGE_CONFIG.maxLength) {
      setNewMessage(value);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col h-96 border rounded-lg bg-white">
      {/* En-tête du chat */}
      <div className="flex items-center justify-between p-3 border-b bg-gray-50">
        <h3 className="font-semibold">Chat Room</h3>
        <div className="flex items-center space-x-2">
          <div className={\`w-2 h-2 rounded-full \${isConnected ? 'bg-green-500' : 'bg-red-500'}\`} />
          <span className="text-sm text-gray-600">
            {isConnected ? 'Connecté' : 'Déconnecté'}
          </span>
        </div>
      </div>

      {/* Zone des messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={\`flex \${message.userId === userId ? 'justify-end' : 'justify-start'}\`}
          >
            <div 
              className={\`max-w-xs lg:max-w-md px-3 py-2 rounded-lg \${
                message.userId === userId 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-800'
              }\`}
            >
              {message.userId !== userId && (
                <div className="text-xs font-semibold mb-1">
                  {message.username}
                </div>
              )}
              <div 
                className="text-sm"
                dangerouslySetInnerHTML={{
                  __html: message.content
                }}
              />
              <div className="text-xs opacity-75 mt-1">
                {formatTimestamp(message.timestamp)}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Affichage des erreurs */}
      {error && (
        <div className="px-3 py-2 bg-red-100 border-t border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Formulaire d'envoi */}
      <form onSubmit={handleMessageSubmit} className="p-3 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            placeholder="Tapez votre message..."
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!isConnected}
            maxLength={MESSAGE_CONFIG.maxLength}
          />
          <button
            type="submit"
            disabled={!isConnected || !newMessage.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
          >
            Envoyer
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {newMessage.length}/{MESSAGE_CONFIG.maxLength} caractères
        </div>
      </form>
    </div>
  );
}`
  },
  quiz: {
    title: 'Quiz sur la sécurité côté client',
    questions: [
      {
        question:
          'Quelle est la principale protection automatique de React contre XSS ?',
        options: [
          'Validation automatique des URLs',
          'Échappement automatique des données affichées',
          'Chiffrement des données sensibles',
          'Filtrage des caractères spéciaux'
        ],
        correctAnswer: 'Échappement automatique des données affichées'
      },
      {
        question: 'Que fait Content Security Policy (CSP) ?',
        options: [
          'Chiffre les communications HTTPS',
          'Valide les formulaires côté client',
          'Contrôle les ressources que le navigateur peut charger',
          'Authentifie les utilisateurs automatiquement'
        ],
        correctAnswer: 'Contrôle les ressources que le navigateur peut charger'
      },
      {
        question:
          'Quelle est la meilleure pratique pour utiliser dangerouslySetInnerHTML ?',
        options: [
          "L'utiliser uniquement avec du contenu de confiance",
          'Toujours sanitiser le contenu avec DOMPurify avant usage',
          "L'éviter complètement dans tous les cas",
          "L'utiliser seulement en mode développement"
        ],
        correctAnswer:
          'Toujours sanitiser le contenu avec DOMPurify avant usage'
      },
      {
        question:
          'Pourquoi est-il important de valider côté client même si on valide côté serveur ?',
        options: [
          'Pour remplacer la validation serveur',
          "Pour améliorer l'expérience utilisateur avec des retours immédiats",
          "La validation serveur n'est pas nécessaire",
          'Pour réduire la charge serveur uniquement'
        ],
        correctAnswer:
          "Pour améliorer l'expérience utilisateur avec des retours immédiats"
      }
    ]
  },
  project: {
    title: 'Application de messagerie sécurisée',
    description: `Créez une application de messagerie complète avec toutes les protections de sécurité côté client :

1. Interface de chat en temps réel sécurisée
2. Sanitisation complète des messages
3. Content Security Policy stricte
4. Rate limiting côté client
5. Stockage sécurisé des données
6. Audit de sécurité automatique
7. Protection contre les attaques XSS

L'objectif est de construire une application résistante aux attaques côté client.`,
    initialCode: `// Code initial basique à sécuriser
import { useState } from 'react';

export default function BasicChat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const sendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, {
        content: newMessage,
        timestamp: Date.now()
      }]);
      setNewMessage('');
    }
  };

  return (
    <div>
      <div>
        {messages.map((msg, index) => (
          <div key={index} dangerouslySetInnerHTML={{ __html: msg.content }} />
        ))}
      </div>
      <input 
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}`,
    solution: `// Solution complète : Application de messagerie sécurisée

// components/SecureMessagingApp.js
import { useState, useEffect, useRef, useCallback } from 'react';
import DOMPurify from 'dompurify';
import { sanitizeInput, validateEmail } from '../lib/clientValidation';
import secureStorage from '../lib/secureStorage';
import SecurityAuditor from '../lib/securityAudit';

export default function SecureMessagingApp() {
  // États principaux
  const [user, setUser] = useState(null);
  const [activeRoom, setActiveRoom] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [messages, setMessages] = useState({});
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [securityScore, setSecurityScore] = useState(null);

  // Références
  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);
  const rateLimitRef = useRef(new Map());

  // Configuration de sécurité
  const SECURITY_CONFIG = {
    maxMessageLength: 500,
    maxRoomNameLength: 50,
    rateLimit: 10, // messages par minute
    allowedTags: ['b', 'i', 'em', 'strong', 'code'],
    allowedAttr: [],
    profanityFilter: true,
    linkDetection: true
  };

  useEffect(() => {
    // Audit de sécurité au démarrage
    runSecurityAudit();
    
    // Charger les données utilisateur
    loadUserData();
    
    // Connecter WebSocket si utilisateur authentifié
    if (user) {
      connectWebSocket();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [user]);

  // Audit de sécurité
  const runSecurityAudit = useCallback(() => {
    const auditor = new SecurityAuditor();
    const result = auditor.runAudit();
    setSecurityScore(result.score);
    
    if (result.vulnerabilities.length > 0) {
      console.warn('Vulnérabilités détectées:', result.vulnerabilities);
    }
  }, []);

  // Chargement des données utilisateur
  const loadUserData = () => {
    const savedUser = secureStorage.getItem('messaging_user', true);
    if (savedUser) {
      setUser(savedUser);
    }
  };

  // Connexion WebSocket sécurisée
  const connectWebSocket = useCallback(() => {
    if (!user) return;

    try {
      const wsUrl = \`wss://\${window.location.host}/ws/secure-chat\`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        setIsConnected(true);
        
        // Authentification via WebSocket
        wsRef.current.send(JSON.stringify({
          type: 'auth',
          token: user.token
        }));
      };

      wsRef.current.onmessage = handleWebSocketMessage;
      wsRef.current.onclose = () => setIsConnected(false);
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

    } catch (error) {
      console.error('Erreur de connexion WebSocket:', error);
    }
  }, [user]);

  // Gestion des messages WebSocket
  const handleWebSocketMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'message':
          handleIncomingMessage(data);
          break;
        case 'room_list':
          setRooms(data.rooms);
          break;
        case 'user_joined':
        case 'user_left':
          handleUserActivity(data);
          break;
        default:
          console.warn('Type de message inconnu:', data.type);
      }
    } catch (error) {
      console.error('Erreur parsing WebSocket:', error);
    }
  }, []);

  // Gestion des messages entrants
  const handleIncomingMessage = useCallback((data) => {
    if (!isValidMessage(data)) {
      console.warn('Message invalide reçu');
      return;
    }

    const sanitizedMessage = sanitizeMessage(data);
    
    setMessages(prev => ({
      ...prev,
      [data.roomId]: [
        ...(prev[data.roomId] || []),
        sanitizedMessage
      ].slice(-100) // Limiter à 100 messages par room
    }));

    // Sauvegarder dans le cache
    const roomMessages = messages[data.roomId] || [];
    secureStorage.setItem(\`messages_\${data.roomId}\`, [...roomMessages, sanitizedMessage].slice(-50));
    
  }, [messages]);

  // Validation des messages
  const isValidMessage = (data) => {
    return (
      data &&
      typeof data.content === 'string' &&
      typeof data.userId === 'string' &&
      typeof data.username === 'string' &&
      typeof data.roomId === 'string' &&
      typeof data.timestamp === 'number' &&
      data.content.length <= SECURITY_CONFIG.maxMessageLength &&
      data.username.length <= 50
    );
  };

  // Sanitisation des messages
  const sanitizeMessage = (message) => {
    let content = DOMPurify.sanitize(message.content, {
      ALLOWED_TAGS: SECURITY_CONFIG.allowedTags,
      ALLOWED_ATTR: SECURITY_CONFIG.allowedAttr,
      KEEP_CONTENT: true
    });

    // Détection et sécurisation des liens
    if (SECURITY_CONFIG.linkDetection) {
      content = secureLinks(content);
    }

    // Filtrage de la profanité
    if (SECURITY_CONFIG.profanityFilter) {
      content = filterProfanity(content);
    }

    return {
      ...message,
      content,
      username: sanitizeInput(message.username)
    };
  };

  // Sécurisation des liens
  const secureLinks = (text) => {
    const urlRegex = /(https?:\\/\\/[^\\s]+)/g;
    return text.replace(urlRegex, (url) => {
      // Vérifier que l'URL est sûre
      try {
        const urlObj = new URL(url);
        if (['http:', 'https:'].includes(urlObj.protocol)) {
          return \`<a href="\${url}" target="_blank" rel="noopener noreferrer nofollow">\${url}</a>\`;
        }
      } catch {
        // URL invalide, retourner le texte original
      }
      return url;
    });
  };

  // Filtrage de la profanité
  const filterProfanity = (text) => {
    const profanityList = ['spam', 'scam', 'phishing', 'hack'];
    let filtered = text;
    
    profanityList.forEach(word => {
      const regex = new RegExp(\`\\\\b\${word}\\\\b\`, 'gi');
      filtered = filtered.replace(regex, '*'.repeat(word.length));
    });
    
    return filtered;
  };

  // Vérification du rate limiting
  const checkRateLimit = useCallback((userId) => {
    const now = Date.now();
    const userLimits = rateLimitRef.current.get(userId) || [];
    
    // Filtrer les messages des 60 dernières secondes
    const recent = userLimits.filter(time => now - time < 60000);
    
    if (recent.length >= SECURITY_CONFIG.rateLimit) {
      return false;
    }
    
    recent.push(now);
    rateLimitRef.current.set(userId, recent);
    
    return true;
  }, []);

  // Envoi de message sécurisé
  const sendMessage = useCallback(async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !isConnected || !activeRoom || !user) {
      return;
    }

    // Vérification du rate limiting
    if (!checkRateLimit(user.id)) {
      alert('Vous envoyez des messages trop rapidement. Veuillez patienter.');
      return;
    }

    try {
      // Préparation du message
      let processedMessage = sanitizeInput(newMessage.trim());
      
      if (processedMessage.length > SECURITY_CONFIG.maxMessageLength) {
        alert(\`Message trop long (max \${SECURITY_CONFIG.maxMessageLength} caractères)\`);
        return;
      }

      // Envoi via WebSocket
      const messageData = {
        type: 'send_message',
        content: processedMessage,
        roomId: activeRoom.id,
        timestamp: Date.now()
      };

      wsRef.current.send(JSON.stringify(messageData));
      setNewMessage('');

    } catch (error) {
      console.error('Erreur envoi message:', error);
      alert('Erreur lors de l\\'envoi du message');
    }
  }, [newMessage, isConnected, activeRoom, user, checkRateLimit]);

  // Gestion de la saisie
  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value.length <= SECURITY_CONFIG.maxMessageLength) {
      setNewMessage(value);
    }
  };

  // Connexion utilisateur
  const handleLogin = async (credentials) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        throw new Error('Erreur de connexion');
      }

      const userData = await response.json();
      
      // Sauvegarder de façon sécurisée
      secureStorage.setItem('messaging_user', userData, true);
      setUser(userData);

    } catch (error) {
      console.error('Erreur de connexion:', error);
      alert('Erreur de connexion');
    }
  };

  // Création de room sécurisée
  const createRoom = async (roomName) => {
    const sanitizedName = sanitizeInput(roomName);
    
    if (sanitizedName.length < 3 || sanitizedName.length > SECURITY_CONFIG.maxRoomNameLength) {
      alert(\`Le nom de la room doit contenir entre 3 et \${SECURITY_CONFIG.maxRoomNameLength} caractères\`);
      return;
    }

    try {
      wsRef.current.send(JSON.stringify({
        type: 'create_room',
        name: sanitizedName
      }));
    } catch (error) {
      console.error('Erreur création room:', error);
    }
  };

  // Interface de connexion
  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar avec audit de sécurité */}
      <div className="w-80 bg-white border-r flex flex-col">
        {/* Score de sécurité */}
        {securityScore !== null && (
          <div className={\`p-3 \${securityScore >= 80 ? 'bg-green-100' : securityScore >= 60 ? 'bg-yellow-100' : 'bg-red-100'}\`}>
            <div className="text-sm font-semibold">
              Score de sécurité: {securityScore}/100
            </div>
            {securityScore < 80 && (
              <button 
                onClick={runSecurityAudit}
                className="text-xs text-blue-600 underline"
              >
                Refaire l'audit
              </button>
            )}
          </div>
        )}

        {/* Liste des rooms */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3 border-b">
            <h3 className="font-semibold">Salles de discussion</h3>
          </div>
          
          {rooms.map(room => (
            <div
              key={room.id}
              onClick={() => setActiveRoom(room)}
              className={\`p-3 cursor-pointer hover:bg-gray-50 \${
                activeRoom?.id === room.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
              }\`}
            >
              <div className="font-medium">{room.name}</div>
              <div className="text-sm text-gray-500">
                {room.userCount} utilisateur(s)
              </div>
            </div>
          ))}
        </div>

        {/* Bouton créer room */}
        <div className="p-3 border-t">
          <button
            onClick={() => {
              const name = prompt('Nom de la nouvelle salle:');
              if (name) createRoom(name);
            }}
            className="w-full bg-blue-500 text-white py-2 rounded"
          >
            Créer une salle
          </button>
        </div>
      </div>

      {/* Zone de chat principale */}
      <div className="flex-1 flex flex-col">
        {activeRoom ? (
          <>
            {/* En-tête */}
            <div className="p-4 border-b bg-white flex justify-between items-center">
              <div>
                <h2 className="font-semibold">{activeRoom.name}</h2>
                <div className="text-sm text-gray-500">
                  Connecté: {isConnected ? 'Oui' : 'Non'}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {(messages[activeRoom.id] || []).map((message, index) => (
                <div 
                  key={index}
                  className={\`flex \${message.userId === user.id ? 'justify-end' : 'justify-start'}\`}
                >
                  <div 
                    className={\`max-w-lg px-3 py-2 rounded-lg \${
                      message.userId === user.id 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white border'
                    }\`}
                  >
                    {message.userId !== user.id && (
                      <div className="text-xs font-semibold mb-1 text-gray-600">
                        {message.username}
                      </div>
                    )}
                    <div 
                      dangerouslySetInnerHTML={{ __html: message.content }}
                      className="text-sm"
                    />
                    <div className="text-xs opacity-75 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Formulaire d'envoi */}
            <form onSubmit={sendMessage} className="p-4 border-t bg-white">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleInputChange}
                  placeholder="Tapez votre message..."
                  className="flex-1 px-3 py-2 border rounded-lg"
                  disabled={!isConnected}
                  maxLength={SECURITY_CONFIG.maxMessageLength}
                />
                <button
                  type="submit"
                  disabled={!isConnected || !newMessage.trim()}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
                >
                  Envoyer
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {newMessage.length}/{SECURITY_CONFIG.maxMessageLength} caractères
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Sélectionnez une salle de discussion
          </div>
        )}
      </div>
    </div>
  );
}

// Composant de connexion sécurisé
function LoginForm({ onLogin }) {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!validateEmail(credentials.email)) {
      newErrors.email = 'Email invalide';
    }
    
    if (credentials.password.length < 6) {
      newErrors.password = 'Mot de passe trop court';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onLogin(credentials);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold text-center">Connexion sécurisée</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              value={credentials.email}
              onChange={(e) => setCredentials({...credentials, email: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium">Mot de passe</label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}`
  }
}

export default lesson3

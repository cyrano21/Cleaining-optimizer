/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Ignorer les erreurs de type et de lint pendant le build
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Configuration des en-têtes de sécurité
  async headers() {
    return [
      {
        // Appliquer ces en-têtes à tous les chemins
        source: '/(.*)',
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
  
  // Activer la minification SWC (recommandé pour de meilleures performances)
  swcMinify: true,
  
  // Configuration des options expérimentales
  experimental: {
    // Désactivation de optimizeCss qui peut causer des problèmes
    optimizeCss: false,
    // Améliorer la compatibilité des modules vendeurs
    esmExternals: 'loose'
  },

  // Configuration pour définir quelles pages sont statiques et lesquelles sont dynamiques
  // Pages qui nécessitent une authentification devraient être dynamiques
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  
  // Utiliser le mode de compilation standard au lieu de standalone
  // output: 'standalone', // Commenté pour débogage
  
  // Configuration de webpack pour résoudre les problèmes de modules
  webpack: (config, { isServer }) => {
    // Force webpack à résoudre framer-motion correctement
    config.resolve.alias = {
      ...config.resolve.alias,
      'framer-motion': require.resolve('framer-motion'),
    };
    
    // Rendre le polyfill localStorage/window disponible côté serveur 
    if (isServer) {
      // Mock global window et localStorage côté serveur
      Object.defineProperty(global, 'window', {
        value: {
          location: {
            protocol: 'http:',
            hostname: 'localhost',
            port: '3000',
            href: 'http://localhost:3000',
            origin: 'http://localhost:3000'
          },
          localStorage: {
            getItem: () => null,
            setItem: () => null,
            removeItem: () => null
          },
          matchMedia: () => ({
            matches: false,
            addEventListener: () => {},
            removeEventListener: () => {}
          }),
          navigator: {
            userAgent: 'node'
          },
          document: {
            cookie: '',
            querySelector: () => null,
            querySelectorAll: () => [],
            documentElement: { 
              classList: { 
                add: () => {},
                remove: () => {}
              }
            },
            createElement: () => ({
              style: {}
            })
          }
        },
        writable: true
      });
    }
    
    // Ignorer les avertissements spécifiques
    config.ignoreWarnings = [
      // Ignorer les avertissements de préchargement CSS
      { module: /.*\.css$/, message: /preload but not used within a few seconds/ },
      // Ignorer les avertissements de modules non trouvés (généralement des extensions de navigateur)
      { module: /.*/, message: /Cannot find menu item with id/ },
      { module: /.*/, message: /A listener indicated an asynchronous response/ }
    ];
    
    return config;
  },

  // Configuration des headers HTTP pour améliorer la sécurité
  async headers() {
    return [
      {
        source: '/(.*)',
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
};

module.exports = nextConfig;
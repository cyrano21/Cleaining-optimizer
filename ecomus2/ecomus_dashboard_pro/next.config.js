/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false, // Désactivé pour éviter les redirections 308 sur les APIs

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "templates.iqonic.design",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.gravatar.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ecomusnext-themesflat.vercel.app",
        port: "",
        pathname: "/**",
      },
    ],
    // Configuration pour gérer les timeouts et optimiser les images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ["image/webp"],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Timeout pour les images externes (5 secondes max)
    unoptimized: false,
    loader: 'default',
    // Configuration pour éviter les timeouts
    domains: ["localhost", "ecomusnext-themesflat.vercel.app"],
  },

  // Extensions de pages (ordre par défaut Next.js 15)
  pageExtensions: ["tsx", "ts", "jsx", "js"],

  // Configuration webpack pour gérer les avertissements
  webpack: (config, { dev }) => {
    // Supprimer les avertissements spécifiques
    config.ignoreWarnings = [
      /Duplicate page detected/,
      /lucide-react/,
      /hydration/i,
    ];

    // Améliorer la gestion des chunks pour éviter ChunkLoadError
    config.output = {
      ...config.output,
      chunkLoadTimeout: 30000, // 30 secondes timeout
      crossOriginLoading: false,
    };

    // En développement, désactiver certaines optimisations pour éviter les erreurs
    if (dev) {
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
      };
    }

    return config;
  },

  // Activer le mode strict pour de meilleures performances
  reactStrictMode: true,

  // Configuration pour résoudre les timeouts de compilation et améliorer les performances
  experimental: {
    optimizeCss: true,
    serverActions: {
      allowedOrigins: ["localhost:3000", "localhost:3001"],
      bodySizeLimit: "2mb"
    },
  },

  // Configuration Turbopack (stable)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // Configuration des packages externes
  serverExternalPackages: ["mongoose"],

  // Configuration CORS pour permettre les requêtes depuis ecomusnext
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*', // En production, remplacer par 'http://localhost:3000'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },

  // Optimisations de performance
  poweredByHeader: false,
  generateEtags: false,
  compress: true,

  // Configuration des timeouts API
  serverRuntimeConfig: {
    apiTimeout: 30000, // 30 secondes max par API
  },



  // Optimisations pour réduire les timeouts
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Ignorer les warnings ESLint en build
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Configuration TypeScript pour exclure Cypress
  typescript: {
    ignoreBuildErrors: false,
    tsconfigPath: process.env.NODE_ENV === 'production' ? './tsconfig.production.json' : './tsconfig.json',
  },
};

module.exports = nextConfig;

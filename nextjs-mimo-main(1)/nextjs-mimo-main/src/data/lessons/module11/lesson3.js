// src/data/lessons/module11/lesson3.js
const lesson3 = {
  id: '11-3',
  title: 'Stratégies de déploiement pour applications complexes',
  description:
    'Apprendre à déployer et gérer des applications Next.js complexes à grande échelle',
  difficulty: 'avancé',
  duration: 60,
  tags: ['Next.js', 'Déploiement', 'Architecture', 'CI/CD', 'DevOps'],
  prerequisites: ['11-1', '11-2'],
  content: `
    <h2>Stratégies de déploiement avancées pour Next.js</h2>
    <p>Le déploiement d'applications Next.js complexes nécessite une approche réfléchie pour garantir fiabilité, performance et facilité de maintenance. Cette leçon couvre les meilleures pratiques et stratégies pour déployer des applications Next.js à grande échelle.</p>

    <h3>Architectures de déploiement</h3>
    <ul>
      <li><strong>Déploiement monolithique</strong> : L'application entière est déployée comme une unité unique</li>
      <li><strong>Déploiement par microservices</strong> : L'application est divisée en services indépendants</li>
      <li><strong>Déploiement par microfrontends</strong> : L'interface utilisateur est divisée en modules déployables séparément</li>
    </ul>

    <h3>Stratégies de déploiement continu</h3>
    <p>La mise en place d'un pipeline CI/CD robuste est essentielle pour gérer efficacement les déploiements d'applications complexes :</p>
    <ul>
      <li><strong>Déploiement bleu-vert</strong> : Maintenir deux environnements identiques (bleu et vert) et basculer le trafic de l'un à l'autre</li>
      <li><strong>Déploiement canari</strong> : Déployer progressivement les nouvelles versions à un sous-ensemble d'utilisateurs</li>
      <li><strong>Feature flags</strong> : Activer ou désactiver des fonctionnalités sans nécessiter de redéploiement</li>
    </ul>

    <h3>Infrastructure multi-région</h3>
    <p>Pour les applications à échelle mondiale, le déploiement dans plusieurs régions peut améliorer considérablement les performances :</p>
    <ul>
      <li><strong>CDN global</strong> : Utiliser des réseaux de diffusion de contenu pour servir les ressources statiques</li>
      <li><strong>Edge functions</strong> : Exécuter du code au plus près des utilisateurs</li>
      <li><strong>Réplication de données</strong> : Stratégies pour maintenir la cohérence des données entre régions</li>
    </ul>

    <h3>Monitoring et observabilité</h3>
    <p>La surveillance est cruciale pour maintenir la fiabilité des applications complexes :</p>
    <ul>
      <li><strong>Logging distribué</strong> : Centraliser les logs de tous les composants</li>
      <li><strong>Traçage des requêtes</strong> : Suivre le parcours des requêtes à travers les différents services</li>
      <li><strong>Métriques de performance</strong> : Surveiller les indicateurs clés comme le TTFB, LCP, etc.</li>
      <li><strong>Alerting intelligent</strong> : Configurer des alertes basées sur des seuils et des anomalies</li>
    </ul>

    <h3>Gestion de configuration</h3>
    <p>La gestion efficace des configurations est essentielle pour les environnements complexes :</p>
    <pre><code class="language-javascript">// next.config.js avec configurations conditionnelles
module.exports = {
  // Configuration de base partagée
  reactStrictMode: true,
  
  // Configuration spécifique à l'environnement
  env: {
    API_URL: process.env.API_URL,
    FEATURE_FLAGS: process.env.FEATURE_FLAGS,
  },
  
  // Configuration avancée des builds
  experimental: {
    // Activer uniquement en production
    ...(process.env.NODE_ENV === 'production' ? {
      optimizeCss: true,
      scrollRestoration: true,
    } : {}),
  },
  
  // Configuration des redirections et rewrites
  async redirects() {
    return [
      // Redirections spécifiques à l'environnement
      ...(process.env.ENABLE_BETA_FEATURES === 'true' 
        ? [{ source: '/beta', destination: '/new-feature', permanent: false }]
        : []
      ),
    ];
  },
};</code></pre>
  `,
  example: {
    title: "Configuration d'un pipeline CI/CD pour Next.js avec GitHub Actions",
    code: `# .github/workflows/deploy.yml
name: Deploy Next.js Application

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run test

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - name: Build application # Note: Ensure proper YAML indentation for 'env' block
        run: npm run build
        env:
          # Configurations spécifiques à l'environnement
          API_URL: \${{ secrets.API_URL }} # Correct YAML syntax for secrets
          ANALYTICS_ID: \${{ secrets.ANALYTICS_ID }} # Correct YAML syntax for secrets
      # Déploiement avec stratégie canari
      - name: Deploy Canary (10% traffic)
        if: github.event_name == 'pull_request'
        uses: your-deploy-action@v1 # Replace with your actual deploy action
        with:
          environment: canary
          traffic_percentage: 10

      # Déploiement bleu-vert pour la production
      - name: Deploy to Production
        if: github.event_name == 'push' && github.ref == 'refs/heads/main' # More specific condition
        uses: your-deploy-action@v1 # Replace with your actual deploy action
        with:
          environment: production
          deployment_strategy: blue-green`,
    explanation:
      'Cet exemple montre comment configurer un pipeline CI/CD pour une application Next.js complexe utilisant GitHub Actions. Le workflow inclut des phases de test, build et déploiement avec des stratégies différentes selon le contexte : déploiement canari pour les pull requests et déploiement bleu-vert pour les fusions dans la branche principale.'
  },
  exercise: {
    title: 'Configurer un déploiement multi-environnement',
    description:
      "Créez une configuration Next.js pour gérer différents environnements (développement, staging, production) avec les variables d'environnement appropriées et des optimisations spécifiques à chaque environnement.",
    options: [
      {
        id: 1,
        text: "Stocker toutes les variables d'environnement en dur dans le code source",
        correct: false
      },
      {
        id: 2,
        text: "Utiliser un fichier .env.local pour toutes les configurations, quel que soit l'environnement",
        correct: false
      },
      {
        id: 3,
        text: 'Créer des fichiers .env.development, .env.staging et .env.production avec des variables spécifiques à chaque environnement',
        correct: true
      },
      {
        id: 4,
        text: "Utiliser un seul fichier next.config.js sans conditions basées sur l'environnement",
        correct: false
      }
    ],
    solution: `// Fichiers de configuration d'environnement

// .env.development
API_URL=http://localhost:3000/api
DEBUG=true
FEATURE_FLAGS='{"newUI":true,"analytics":false}' # Encapsulate JSON string in quotes

// .env.staging
API_URL=https://staging-api.example.com
DEBUG=true
FEATURE_FLAGS='{"newUI":true,"analytics":true}' # Encapsulate JSON string in quotes

// .env.production
API_URL=https://api.example.com
DEBUG=false
FEATURE_FLAGS='{"newUI":true,"analytics":true}' # Encapsulate JSON string in quotes

// next.config.js
module.exports = {
  // Configuration de base
  reactStrictMode: true,
  
  // Optimisations conditionnelles selon l'environnement
  ...(process.env.NODE_ENV === 'production' ? {
    compiler: {
      removeConsole: {
        exclude: ['error'],
      },
    },
    swcMinify: true,
  } : {}),
  
  // Variables d'environnement publiques (exposées au client)
  // Note: For client-side exposure, prefix with NEXT_PUBLIC_ in your .env files
  // and access them as process.env.NEXT_PUBLIC_YOUR_VAR
  // The 'env' key in next.config.js is for build-time replacement.
  publicRuntimeConfig: { // Example, better to use NEXT_PUBLIC_ prefix
    ENVIRONMENT: process.env.NODE_ENV,
    API_BASE_URL: process.env.API_URL, // For server-side or build-time use
    // For client-side feature flags, prefer process.env.NEXT_PUBLIC_FEATURE_FLAGS
  },
  serverRuntimeConfig: {
    // Variables only available on the server-side
    FEATURE_FLAGS_SERVER: process.env.FEATURE_FLAGS,
  },
  
  // Images optimizées
  images: {
    domains: [
      'assets.example.com',
      ...(process.env.NODE_ENV !== 'production' ? ['localhost'] : []),
    ],
  },
};`
  },
  quiz: {
    title: 'Quiz sur les stratégies de déploiement',
    questions: [
      {
        question: "Qu'est-ce que le déploiement bleu-vert ?",
        options: [
          'Une méthode de déploiement où le code est progressivement déployé par région géographique',
          "Une méthode de déploiement où deux environnements identiques sont maintenus et le trafic est basculé de l'un à l'autre",
          "Une méthode de déploiement où le code est déployé uniquement la nuit pour minimiser l'impact",
          'Une méthode de déploiement où le code est déployé séparément pour les interfaces mobiles et bureau'
        ],
        correctAnswer:
          "Une méthode de déploiement où deux environnements identiques sont maintenus et le trafic est basculé de l'un à l'autre"
      },
      {
        question: "Quel est l'avantage principal du déploiement canari ?",
        options: [
          'Il est moins coûteux que les autres méthodes de déploiement',
          "Il permet de tester les nouvelles fonctionnalités avec un sous-ensemble d'utilisateurs avant un déploiement complet",
          'Il élimine complètement le besoin de tests automatisés',
          "Il accélère le temps de build de l'application"
        ],
        correctAnswer:
          "Il permet de tester les nouvelles fonctionnalités avec un sous-ensemble d'utilisateurs avant un déploiement complet"
      },
      {
        question:
          'Comment les feature flags contribuent-ils à une stratégie de déploiement efficace ?',
        options: [
          "Ils permettent d'activer ou désactiver des fonctionnalités sans redéployer l'application",
          'Ils augmentent automatiquement les performances du serveur',
          "Ils convertissent l'application en architecture microservices",
          "Ils éliminent la nécessité d'avoir plusieurs environnements"
        ],
        correctAnswer:
          "Ils permettent d'activer ou désactiver des fonctionnalités sans redéployer l'application"
      },
      {
        question:
          "Quelle approche est recommandée pour gérer les variables d'environnement dans une application Next.js multi-environnement ?",
        options: [
          'Stocker toutes les variables dans un fichier JavaScript accessible publiquement',
          'Utiliser des fichiers .env spécifiques à chaque environnement (.env.development, .env.production, etc.)',
          'Coder en dur les variables dans le code source et rebuilder pour chaque environnement',
          "Toujours utiliser uniquement des variables d'environnement runtime définies par la plateforme de déploiement"
        ],
        correctAnswer:
          'Utiliser des fichiers .env spécifiques à chaque environnement (.env.development, .env.production, etc.)'
      }
    ]
  },
  project: {
    title: "Mise en place d'une architecture de déploiement multi-région",
    description: `Dans ce projet, vous allez configurer une application Next.js pour un déploiement multi-région avec une stratégie de déploiement bleu-vert. Vous devrez:
    
1. Configurer les fichiers d'environnement pour différents environnements
2. Mettre en place un pipeline CI/CD avec GitHub Actions
3. Implémenter une logique de feature flags
4. Configurer un système de surveillance avec des métriques de performance
    
L'objectif est de créer une architecture robuste qui permet des déploiements sans interruption de service et une expérience utilisateur optimale à l'échelle mondiale.`,
    initialCode: `// next.config.js - Configuration de base à améliorer
module.exports = {
  reactStrictMode: true,
  env: {
    API_URL: process.env.API_URL, // For build-time replacement
  },
}

// pages/_app.js - Configuration de base de l'application
// import '../styles/globals.css'; // Assuming you have this file

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;`,
    solution: `// next.config.js - Configuration avancée multi-environnement
module.exports = {
  reactStrictMode: true,
  
  // For variables available at build time AND client-side (must be prefixed with NEXT_PUBLIC_ in .env files)
  // publicRuntimeConfig can also be used, but NEXT_PUBLIC_ is standard for client-side env vars
  env: { 
    // These are replaced at build time.
    // For runtime client-side variables, use process.env.NEXT_PUBLIC_YOUR_VARIABLE_NAME
    // For runtime server-side variables, use process.env.YOUR_VARIABLE_NAME
    ENVIRONMENT: process.env.NODE_ENV, 
    // If API_URL is needed client-side, it should be NEXT_PUBLIC_API_URL in .env
    // and accessed as process.env.NEXT_PUBLIC_API_URL in client code.
    // Here, it's for build-time replacement, which is fine for some use cases.
    API_URL: process.env.API_URL, 
    CDN_URL: process.env.NEXT_PUBLIC_CDN_URL, // Example if CDN_URL is needed client-side
    REGION: process.env.VERCEL_REGION || 'default',
  },
  
  images: {
    domains: ['assets.example.com', 'cdn.example.com'],
    ...(process.env.NODE_ENV === 'production' ? {
      minimumCacheTTL: 3600,
    } : {}),
  },
  
  swcMinify: process.env.NODE_ENV === 'production',
  compiler: {
    ...(process.env.NODE_ENV === 'production' ? {
      removeConsole: {
        exclude: ['error', 'warn'],
      }
    } : {}),
  },
  
  async rewrites() {
    return {
      beforeFiles: [
        ...(process.env.ENABLE_CANARY === 'true' ? [
          {
            source: '/api/:path*',
            // Ensure correct escaping for the JS template literal. 
            // This becomes a string in the final JS object.
            destination: \\\`\${process.env.CANARY_API_URL}/:path*\\\`, 
            has: [
              {
                type: 'cookie',
                key: 'canary',
                value: 'true',
              },
            ],
          }
        ] : []),
      ],
      // fallback can also be used for SPA-like behavior if needed
    };
  },
};

// libs/featureFlags.js - Gestionnaire de feature flags
// This would typically access NEXT_PUBLIC_FEATURE_FLAGS if used on client-side
// or process.env.FEATURE_FLAGS if used server-side (e.g., in getServerSideProps or API routes)
export const featureFlags = {
  // For client-side, FEATURE_FLAGS should be NEXT_PUBLIC_FEATURE_FLAGS from .env
  // flags: JSON.parse(process.env.NEXT_PUBLIC_FEATURE_FLAGS || '{}'), 
  // For server-side only (like in an API route or getServerSideProps):
  flags: JSON.parse(process.env.FEATURE_FLAGS || '{}'), 
  
  isEnabled(flagName) {
    return Boolean(this.flags[flagName]);
  },
  
  isEnabledForUser(flagName, userId) {
    if (!this.isEnabled(flagName)) return false;
    
    // PROGRESSIVE_FLAGS would also be process.env.NEXT_PUBLIC_PROGRESSIVE_FLAGS for client
    const progressiveFlags = JSON.parse(process.env.PROGRESSIVE_FLAGS || '{}');
    if (progressiveFlags[flagName]) {
      const percentage = progressiveFlags[flagName];
      const hash = this.hashString(String(userId)); // Ensure userId is a string for hashing
      return (hash % 100) < percentage;
    }
    return true;
  },
  
  hashString(str) {
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
};

// pages/_app.js - Application avec monitoring
// import '../styles/globals.css'; // Assuming globals.css exists
import { useEffect } from 'react';
import Head from 'next/head';
// import { featureFlags } from '../libs/featureFlags'; // Assuming path is correct
// import { initMonitoring } from '../libs/monitoring'; // Assuming this util exists

// Mock featureFlags for _app.js client-side context if not using NEXT_PUBLIC_
const clientSideFeatureFlags = {
    isEnabled: (flag) => {
        // In a real app, this would read from NEXT_PUBLIC_ env vars or a context
        // console.log(\`Client check for flag \${flag}\`);
        return true; // Default to true for example
    },
    isEnabledForUser: (flag, userId) => {
        // console.log(\`Client check for flag \${flag} for user \${userId}\`);
        return true;
    }
}


function withMonitoring(Component) {
  return function MonitoredComponent(props) {
    useEffect(() => {
      // Access NEXT_PUBLIC_ variables for client-side logic
      if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'production' || process.env.NEXT_PUBLIC_ENABLE_MONITORING === 'true') {
        // initMonitoring({
        //   region: process.env.NEXT_PUBLIC_REGION,
        //   sampleRate: process.env.NEXT_PUBLIC_ENVIRONMENT !== 'production' ? 1 : 0.1,
        // });
        console.log('Monitoring initialized (simulated)');
      }
    }, []);
    
    return <Component {...props} />;
  };
}

function MyApp({ Component, pageProps }) { // Removed session, currentUser for simplicity unless defined elsewhere
  // Example: Get currentUser from a context or props if needed for featureFlags.isEnabledForUser
  // const currentUser = { id: 'user123' }; 
  // const enableNewUI = currentUser 
  //   ? clientSideFeatureFlags.isEnabledForUser('newUI', currentUser.id) 
  //   : clientSideFeatureFlags.isEnabled('newUI');
  const enableNewUI = clientSideFeatureFlags.isEnabled('newUI');


  return (
    <>
      <Head>
        {/* For client-side access, this should be NEXT_PUBLIC_CDN_URL */}
        {process.env.NEXT_PUBLIC_CDN_URL && <link rel="preconnect" href={process.env.NEXT_PUBLIC_CDN_URL} />}
        {process.env.NEXT_PUBLIC_REGION && (
          <meta name="region" content={process.env.NEXT_PUBLIC_REGION} />
        )}
        <title>My Next.js App</title>
      </Head>
      
      <div className={enableNewUI ? 'new-ui-theme' : 'classic-theme'}>
        <Component {...pageProps} />
      </div>
    </>
  );
}

export default process.env.NODE_ENV === 'production' // NODE_ENV is fine here for build-time decision
  ? withMonitoring(MyApp) 
  : MyApp;

// .github/workflows/deploy.yml - Pipeline CI/CD avec stratégie bleu-vert
/*
name: Deploy Multi-Region with Blue-Green Strategy

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm' # Added cache for npm
      - run: npm ci
      - run: npm run test
      
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm' # Added cache for npm
      - run: npm ci
      - name: Build application
        run: npm run build
        env:
          # These are GitHub secrets, passed to the build process
          API_URL: \${{ secrets.API_URL }}
          CDN_URL: \${{ secrets.CDN_URL }} 
          FEATURE_FLAGS: \${{ secrets.FEATURE_FLAGS_JSON_STRING }} # Ensure this is a JSON string
          # For NEXT_PUBLIC_ variables, they also need to be set here if used by the build
          NEXT_PUBLIC_CDN_URL: \${{ secrets.CDN_URL }}
          NEXT_PUBLIC_FEATURE_FLAGS: \${{ secrets.FEATURE_FLAGS_JSON_STRING }}
          # ... and other NEXT_PUBLIC_ variables
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-output
          path: .next/
  # ... Deploy steps for blue/green, using your-deployment-action@v1 ...
  # (deploy-blue, smoke-test-blue, deploy-green, switch-traffic)
*/`
  }
};

export default lesson3;

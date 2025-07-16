// src/data/lessons/module12/lesson2.js
const lesson2 = {
  id: '12-2',
  title: 'Containerisation avancée avec Docker et Next.js',
  description: 'Techniques avancées pour optimiser les conteneurs Docker pour applications Next.js',
  difficulty: 'avancé',
  duration: 55,
  tags: ['Next.js', 'Docker', 'Optimisation', 'Sécurité', 'DevOps'],
  prerequisites: ['12-1'],
  content: `
    <h2>Containerisation avancée pour Next.js</h2>
    <p>La containerisation avec Docker offre de nombreux avantages pour les applications Next.js, notamment en matière de cohérence entre les environnements, de simplicité de déploiement et d'isolation des processus. Cette leçon couvre les techniques avancées pour optimiser vos conteneurs Docker pour Next.js.</p>

    <h3>Optimisation des images Docker</h3>
    <p>L'optimisation des images Docker est cruciale pour améliorer les temps de déploiement, réduire les coûts d'infrastructure et améliorer la sécurité :</p>
    <ul>
      <li><strong>Images multi-étapes</strong> : Séparation des phases de build et de runtime</li>
      <li><strong>Sélection des images de base appropriées</strong> : Alpine pour la légèreté, Debian pour la compatibilité</li>
      <li><strong>Stratégies de cache efficaces</strong> : Optimisation de l'ordre des commandes dans le Dockerfile</li>
      <li><strong>Minimisation des couches</strong> : Combinaison des instructions RUN pour réduire le nombre de couches</li>
    </ul>

    <h3>Configuration optimale pour différents modes de rendu Next.js</h3>
    <p>Next.js offre plusieurs modes de rendu (SSR, SSG, ISR), chacun nécessitant une configuration Docker spécifique pour des performances optimales :</p>

    <pre><code class="language-dockerfile"># Dockerfile optimisé pour une application Next.js avec SSG
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Construction statique complète
RUN npm run build && npm run export

# Image légère pour servir du contenu statique
FROM nginx:alpine
COPY --from=builder /app/out /usr/share/nginx/html
# Configuration de NGINX pour le routage Next.js
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]</code></pre>

    <pre><code class="language-dockerfile"># Dockerfile pour une application Next.js avec SSR/ISR
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

# Copie sélective des fichiers nécessaires
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

# Utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
RUN chown -R nextjs:nodejs /app/.next
USER nextjs

# Cache de pages ISR persistant
VOLUME /app/.next/cache
EXPOSE 3000
CMD ["npm", "start"]</code></pre>

    <h3>Sécurisation des conteneurs Next.js</h3>
    <p>La sécurité est un aspect crucial des déploiements en production :</p>
    <ul>
      <li><strong>Utilisation d'un utilisateur non-root</strong> : Limitation des privilèges</li>
      <li><strong>Scan de vulnérabilités</strong> : Vérification des images avec des outils comme Trivy ou Clair</li>
      <li><strong>Minimisation de la surface d'attaque</strong> : Exclusion des fichiers non nécessaires</li>
      <li><strong>Gestion sécurisée des secrets</strong> : Utilisation de solutions comme Docker Secrets ou Vault</li>
    </ul>

    <pre><code class="language-bash"># Scan de vulnérabilités dans l'image Docker
trivy image myapp:latest --severity HIGH,CRITICAL</code></pre>

    <h3>Configuration multi-environnement</h3>
    <p>La gestion des variables d'environnement et des configurations spécifiques à chaque environnement est essentielle pour une architecture robuste :</p>

    <pre><code class="language-bash"># Construction avec ARG pour l'environnement
docker build \\
  --build-arg NEXT_PUBLIC_API_URL=https://api.example.com \\
  --build-arg NODE_ENV=production \\
  -t myapp:production .</code></pre>

    <pre><code class="language-dockerfile"># Utilisation des arguments de build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

ARG NEXT_PUBLIC_API_URL
ARG NODE_ENV
ENV NEXT_PUBLIC_API_URL=\\$\\{NEXT_PUBLIC_API_URL} 
ENV NODE_ENV=\\$\\{NODE_ENV}

RUN npm run build</code></pre>

    <h3>Optimisation des performances des conteneurs</h3>
    <p>L'optimisation des performances assure une expérience utilisateur fluide et réduit les coûts d'infrastructure :</p>
    <ul>
      <li><strong>Configuration des ressources</strong> : Définition appropriée des limites CPU et mémoire</li>
      <li><strong>Mise en cache externe</strong> : Utilisation de Redis pour le cache distribué</li>
      <li><strong>Compression d'image</strong> : Configuration de la compression de contenu</li>
      <li><strong>Mise en cache des dépendances</strong> : Optimisation des builds avec des couches cache</li>
    </ul>
  `,
  example: {
    title: 'Dockerfile multi-étapes optimisé pour Next.js en production',
    code: `# Dockerfile optimisé et sécurisé pour Next.js
# -----------------------------------------------------
# 1. Étape d'installation des dépendances
FROM node:18-alpine AS deps
WORKDIR /app

# Installation des paquets nécessaires pour les dépendances natives
RUN apk add --no-cache libc6-compat python3 make g++

# Copie des fichiers de dépendances
COPY package.json package-lock.json* ./
# Installation optimisée des dépendances
RUN npm ci --only=production && npm cache clean --force

# 2. Étape de build
FROM node:18-alpine AS builder
WORKDIR /app

# Copie des dépendances de l'étape précédente
COPY --from=deps /app/node_modules ./node_modules
# Copie du reste du code source
COPY . .

# Définition des variables d'environnement pour le build
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_GA_ID
ENV NEXT_PUBLIC_API_URL=\\$\\{NEXT_PUBLIC_API_URL} 
ENV NEXT_PUBLIC_GA_ID=\\$\\{NEXT_PUBLIC_GA_ID}

# Exécution du build
RUN npm run build

# 3. Étape de production
FROM node:18-alpine AS runner
WORKDIR /app

# Environnement de production
ENV NODE_ENV production

# Installation des paquets nécessaires pour la supervision
RUN apk add --no-cache tini curl

# Tini est utilisé pour gérer correctement les signaux en tant que PID 1
ENTRYPOINT ["/sbin/tini", "--"]

# Création d'un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copie des fichiers nécessaires à l'exécution uniquement
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Configuration des permissions
RUN chown -R nextjs:nodejs /app
USER nextjs

# Exposition du port et healthcheck
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 CMD curl -f http://localhost:3000/api/health || exit 1

# Définition des variables d'environnement runtime
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Volume pour le cache ISR
VOLUME ["/app/.next/cache"]

# Commande de démarrage avec supervision pour gérer correctement les erreurs
CMD ["node", "server.js"]`,
    explanation: 'Ce Dockerfile avancé pour Next.js utilise une approche en trois étapes pour optimiser la taille et la sécurité de l\'image. La première étape installe uniquement les dépendances de production, la deuxième construit l\'application, et la troisième prépare un environnement d\'exécution minimaliste et sécurisé. Des optimisations comme l\'utilisation de tini pour la gestion des signaux, l\'utilisateur non-root, le healthcheck et le volume pour le cache ISR font de cette configuration un exemple idéal pour la production.'
  },
  exercise: {
    title: 'Optimisation d\'une image Docker pour Next.js',
    description: 'Analysez le Dockerfile suivant pour une application Next.js et identifiez les problèmes potentiels liés à la sécurité, aux performances ou aux bonnes pratiques. Choisissez les problèmes majeurs.',
    options: [
      { id: 1, text: 'L\'application s\'exécute en tant qu\'utilisateur root, ce qui pose un risque de sécurité', correct: true },
      { id: 2, text: 'Tous les fichiers du projet sont copiés dans l\'image finale, y compris les sources et fichiers de développement inutiles', correct: true },
      { id: 3, text: 'L\'absence de stratégie de mise en cache des dépendances ralentit les builds', correct: true },
      { id: 4, text: 'L\'utilisation de l\'image Alpine est problématique pour Next.js', correct: false }
    ],
    solution: `# Dockerfile problématique
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]

# Dockerfile optimisé
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Sécurité: utilisateur non-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
RUN chown -R nextjs:nodejs /app/.next
USER nextjs

EXPOSE 3000
CMD ["npm", "start"]`
  },
  quiz: {
    title: 'Quiz sur Docker et Next.js',
    questions: [
      {
        question: 'Pourquoi est-il recommandé d\'utiliser une approche multi-étapes dans un Dockerfile pour Next.js ?',
        options: [
          'Pour supporter différentes versions de Node.js dans la même image',
          'Pour réduire la taille de l\'image finale en séparant les environnements de build et d\'exécution',
          'Pour augmenter la vitesse d\'exécution de l\'application',
          'Pour faciliter le débogage des applications'
        ],
        correctAnswer: 'Pour réduire la taille de l\'image finale en séparant les environnements de build et d\'exécution'
      },
      {
        question: 'Quelle commande Docker est recommandée pour installer les dépendances NPM dans un environnement de production ?',
        options: [
          'npm install',
          'npm update',
          'npm ci',
          'npm install --production'
        ],
        correctAnswer: 'npm ci'
      },
      {
        question: 'Quelle est la meilleure pratique concernant la gestion des variables d\'environnement sensibles dans Docker ?',
        options: [
          'Les coder en dur dans le Dockerfile',
          'Les passer en tant qu\'ARG lors de la construction',
          'Utiliser des secrets Docker ou des outils de gestion de secrets comme HashiCorp Vault',
          'Les stocker dans le code source de l\'application'
        ],
        correctAnswer: 'Utiliser des secrets Docker ou des outils de gestion de secrets comme HashiCorp Vault'
      },
      {
        question: 'Quelle est l\'utilité d\'un healthcheck dans un conteneur Docker exécutant une application Next.js ?',
        options: [
          'Vérifier que l\'application est disponible et fonctionne correctement',
          'Augmenter les performances de l\'application',
          'Réduire la taille de l\'image Docker',
          'Faciliter la mise à jour des dépendances'
        ],
        correctAnswer: 'Vérifier que l\'application est disponible et fonctionne correctement'
      }
    ]
  },
  project: {
    title: 'Déploiement d\'une application Next.js multi-environnements avec Docker',
    description: `Dans ce projet, vous allez créer une configuration Docker complète pour une application Next.js qui prend en charge différents environnements (développement, staging, production) et intègre les meilleures pratiques en matière de sécurité et de performance.
    
Vous devrez :

1. Créer un Dockerfile multi-étapes optimisé
2. Configurer la gestion sécurisée des variables d'environnement
3. Mettre en place un système de healthcheck efficace
4. Configurer des scripts de déploiement pour différents environnements
5. Implémenter des optimisations de cache pour accélérer les builds`,
    initialCode: `# Dockerfile de base à améliorer
FROM node:latest
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]

# docker-compose.yml de base
version: '3'
services:
  nextjs:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgres://user:password@db:5432/mydb
    depends_on:
      - db
  
  db:
    image: postgres:latest
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=mydb`,
    solution: `# Solution complète pour Docker avec Next.js

# Dockerfile multi-étages optimisé
# --------------------------------
FROM node:18-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat python3 make g++ 
COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_GTM_ID
ENV NEXT_PUBLIC_API_URL=\\$\\{NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_GTM_ID=\\$\\{NEXT_PUBLIC_GTM_ID}
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
RUN apk add --no-cache curl tini
ENTRYPOINT ["/sbin/tini", "--"]
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
VOLUME ["/app/.next/cache"]
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \\
  CMD curl -f http://localhost:3000/api/health || exit 1
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]

# next.config.js (Illustrative - actual content should be in its own file)
# -------------
/*
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  experimental: { outputFileTracing: true },
  serverRuntimeConfig: {
    dbConnectionString: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET,
  },
  publicRuntimeConfig: {
    apiUrl: process.env.NEXT_PUBLIC_API_URL, 
    gtmId: process.env.NEXT_PUBLIC_GTM_ID,
  },
};
module.exports = nextConfig;
*/

# docker-compose.yml (Illustrative - for development)
# ---------------------------------------
/*
version: '3.8'
services:
  nextjs-dev:
    build:
      context: .
      dockerfile: Dockerfile.dev 
    volumes:
      - .:/app
      - /app/node_modules 
      - /app/.next
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgres://devuser:devpass@db-dev:5432/devdb
      - NEXT_PUBLIC_API_URL=http://localhost:3000/api 
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db-dev
      - redis
    command: npm run dev

  db-dev:
    image: postgres:14-alpine
    environment:
      - POSTGRES_USER=devuser
      - POSTGRES_PASSWORD=devpass
      - POSTGRES_DB=devdb
    volumes:
      - postgres-dev-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:alpine
    volumes:
      - redis-data:/data
    ports:
      - "6379:6379"

volumes:
  postgres-dev-data:
  redis-data:
*/

# docker-compose.prod.yml (Illustrative - for production)
# -----------------------------------------
/*
version: '3.8'
services:
  nextjs-prod:
    image: \\$\\{REGISTRY:-myregistry}/nextjs-app:\\$\\{TAG:-latest}
    build:
      context: .
      dockerfile: Dockerfile 
      args:
        - NEXT_PUBLIC_API_URL=https://api.production.example.com 
        - NEXT_PUBLIC_GTM_ID=GTM-PRODXXXX
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
        order: start-first
      restart_policy:
        condition: on-failure 
        delay: 5s
        max_attempts: 3
        window: 120s
    environment:
      - NODE_ENV=production
      - PORT=3000 
    secrets:
      - jwt_secret
      - database_url_secret 
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s 
    networks:
      - app-network 
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

networks:
  app-network:

secrets:
  jwt_secret:
    file: ./secrets/jwt_secret.txt
  database_url_secret:
    file: ./secrets/database_url.txt 
*/

# Dockerfile.dev (Illustrative - for development)
# ----------------------------------
/*
FROM node:18-alpine
WORKDIR /app
RUN apk add --no-cache libc6-compat python3 make g++
COPY package.json package-lock.json* ./
RUN npm install 
EXPOSE 3000
CMD ["npm", "run", "dev"]
*/

# Script de déploiement helper (deploy.sh)
# ---------------------------
#!/bin/bash
# deploy.sh

# Variables
REGISTRY="your-registry.com"
APP_NAME="nextjs-app"
TIMESTAMP=\\$(date +%Y%m%d%H%M%S)

# Fonction d'aide
function print_help {
  echo "Usage: \\$0 [environment] [options]"
  echo "Environments: dev, staging, prod"
  echo "Options:"
  echo "  --no-cache    Build without using cache"
  echo "  --help        Show this help message"
}

# Vérifier les arguments
if [ "\\$1" == "--help" ]; then
  print_help
  exit 0
fi

# Environnement par défaut
ENV=\\$\\{1:-dev}
shift

# Options
NO_CACHE=""
while (( "\\$#" )); do
  case "\\$1" in
    --no-cache)
      NO_CACHE="--no-cache"
      shift
      ;;
    --help)
      print_help
      exit 0
      ;;
    *)
      echo "Unknown option: \\$1"
      print_help
      exit 1
      ;;
  esac
done

# Configuration spécifique à l'environnement
case "\\$ENV" in
  dev)
    TAG="dev-\\$\\{TIMESTAMP}"
    API_URL_ARG="http://localhost:4000/api"
    GTM_ID_ARG="GTM-DEV"
    COMPOSE_FILE="docker-compose.yml"
    ;;
  staging)
    TAG="staging-\\$\\{TIMESTAMP}"
    API_URL_ARG="https://api.staging.example.com"
    GTM_ID_ARG="GTM-STAGING"
    COMPOSE_FILE="docker-compose.staging.yml" 
    ;;
  prod)
    TAG="prod-\\$\\{TIMESTAMP}"
    API_URL_ARG="https://api.production.example.com"
    GTM_ID_ARG="GTM-PROD"
    COMPOSE_FILE="docker-compose.prod.yml"
    ;;
  *)
    echo "Unknown environment: \\$ENV"
    print_help
    exit 1
    ;;
esac

echo "Building for \\$\\{ENV} environment with TAG \\$\\{TAG}..."

# Construction de l'image
docker build \\$\\{NO_CACHE} \\
  --build-arg NEXT_PUBLIC_API_URL="\\$\\{API_URL_ARG}" \\
  --build-arg NEXT_PUBLIC_GTM_ID="\\$\\{GTM_ID_ARG}" \\
  -f Dockerfile \\
  -t \\$\\{REGISTRY}/\\$\\{APP_NAME}:\\$\\{TAG} \\
  -t \\$\\{REGISTRY}/\\$\\{APP_NAME}:\\$\\{ENV}-latest \\
  .

echo "Pushing image to registry..."
docker push \\$\\{REGISTRY}/\\$\\{APP_NAME}:\\$\\{TAG}
docker push \\$\\{REGISTRY}/\\$\\{APP_NAME}:\\$\\{ENV}-latest

if [ "\\$ENV" != "dev" ]; then
  echo "Deploying \\$\\{APP_NAME}:\\$\\{TAG} to \\$\\{ENV} with docker-compose file \\$\\{COMPOSE_FILE}..."
  TAG=\\$\\{TAG} REGISTRY=\\$\\{REGISTRY} docker-compose -f \\$\\{COMPOSE_FILE} up -d --remove-orphans
else
  echo "Dev image built. Run manually: docker-compose -f docker-compose.yml up"
fi

echo "Deployment script for \\$\\{ENV} finished."
`
  }
};

export default lesson2;
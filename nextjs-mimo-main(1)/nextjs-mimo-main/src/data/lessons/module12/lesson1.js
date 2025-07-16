// src/data/lessons/module12/lesson1.js
const lesson1 = {
  id: '12-1',
  title: 'Introduction aux pratiques DevOps pour Next.js',
  description: 'Les fondamentaux de DevOps appliqués aux applications Next.js',
  difficulty: 'intermédiaire',
  duration: 50,
  tags: ['Next.js', 'DevOps', 'CI/CD', 'Docker', 'Automatisation'],
  prerequisites: ['11-3'],
  content: `
    <h2>DevOps pour applications Next.js</h2>
    <p>DevOps est une méthodologie qui combine le développement logiciel (Dev) et l'administration système (Ops) pour optimiser la livraison continue de logiciels de haute qualité. Pour les applications Next.js, l'adoption des pratiques DevOps peut considérablement améliorer l'efficacité du développement et la stabilité des déploiements.</p>

    <h3>Principes fondamentaux de DevOps pour Next.js</h3>
    <ul>
      <li><strong>Intégration continue (CI)</strong> : Automatisation des tests et de la validation du code</li>
      <li><strong>Livraison continue (CD)</strong> : Automatisation du processus de déploiement</li>
      <li><strong>Infrastructure as Code (IaC)</strong> : Gestion de l'infrastructure via du code versionné</li>
      <li><strong>Monitoring et Observabilité</strong> : Surveillance en temps réel des performances et de la santé de l'application</li>
      <li><strong>Communication et collaboration</strong> : Élimination des silos entre équipes de développement et opérations</li>
    </ul>

    <h3>Avantages des pratiques DevOps pour Next.js</h3>
    <ul>
      <li><strong>Déploiements plus rapides et fiables</strong> : Réduction du temps entre l'écriture du code et sa mise en production</li>
      <li><strong>Détection précoce des bugs</strong> : Tests automatisés à chaque étape du processus</li>
      <li><strong>Environnements cohérents</strong> : Même configuration en développement et en production</li>
      <li><strong>Scaling facilité</strong> : Infrastructure élastique adaptée aux besoins de l'application</li>
    </ul>

    <h3>Containerisation avec Docker</h3>
    <p>Docker permet d'encapsuler une application Next.js et toutes ses dépendances dans un conteneur isolé et portable, ce qui facilite les déploiements cohérents entre différents environnements.</p>

    <pre><code class="language-dockerfile"># Dockerfile pour une application Next.js
# Étape de build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Étape de production
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

# Copier uniquement les fichiers nécessaires
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Utilisateur non-root pour des raisons de sécurité
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
RUN chown -R nextjs:nodejs /app/.next
USER nextjs

EXPOSE 3000

# Commande de démarrage
CMD ["npm", "start"]</code></pre>

    <h3>Orchestration avec Kubernetes</h3>
    <p>Kubernetes permet de gérer des clusters de conteneurs Docker, offrant des fonctionnalités comme l'équilibrage de charge, la mise à l'échelle automatique et la reprise après sinistre, essentielles pour les applications Next.js en production.</p>

    <pre><code class="language-yaml"># Exemple de déploiement Kubernetes pour Next.js
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nextjs-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nextjs
  template:
    metadata:
      labels:
        app: nextjs
    spec:
      containers:
      - name: nextjs
        image: your-registry/nextjs-app:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: database-url
        resources:
          limits:
            cpu: "1"
            memory: "512Mi"
          requests:
            cpu: "0.5"
            memory: "256Mi"
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5</code></pre>

    <h3>Automatisation avec GitHub Actions</h3>
    <p>GitHub Actions permet d'automatiser les workflows de CI/CD directement dans le repository GitHub, facilitant le test et le déploiement continu des applications Next.js.</p>
  `,
  example: {
    title: 'Mise en place d\'un pipeline CI/CD pour Next.js',
    code: `# .github/workflows/ci-cd.yml

name: CI/CD Pipeline

on:
  push:
    branches: [ main, dev ]
  pull_request:
    branches: [ main, dev ]

jobs:
  verify:
    name: Verify code quality
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Lint code
        run: npm run lint
        
      - name: Type check
        run: npm run type-check
        
      - name: Run unit tests
        run: npm run test
  
  build-and-push:
    name: Build and push Docker image
    needs: verify
    if: github.event_name == 'push'
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
        
      - name: Login to GitHub Container Registry
        uses: docker/login-action@v2
        with:
          registry: ghcr.io 
          username: \\$\\{\\{ github.actor \\}\\} # CORRECTED
          password: \\$\\{\\{ secrets.GITHUB_TOKEN \\}\\} # CORRECTED
          
      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: ghcr.io/\\$\\{\\{ github.repository_owner \\}\\}/\\$\\{\\{ github.event.repository.name \\}\}:\\$\\{\\{ github.sha \\}\\},ghcr.io/\\$\\{\\{ github.repository_owner \\}\\}/\\$\\{\\{ github.event.repository.name \\}\}:latest # CORRECTED
          cache-from: type=registry,ref=ghcr.io/\\$\\{\\{ github.repository_owner \\}\\}/\\$\\{\\{ github.event.repository.name \\}\}:buildcache # CORRECTED
          cache-to: type=registry,ref=ghcr.io/\\$\\{\\{ github.repository_owner \\}\\}/\\$\\{\\{ github.event.repository.name \\}\}:buildcache,mode=max # CORRECTED
          
  deploy-dev:
    name: Deploy to development
    needs: build-and-push
    if: github.ref == 'refs/heads/dev' && github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Dev environment
        uses: your-deployment-action@v1 # Replace with your actual deployment action
        with:
          environment: development
          image: ghcr.io/\\$\\{\\{ github.repository_owner \\}\\}/\\$\\{\\{ github.event.repository.name \\}\}:\\$\\{\\{ github.sha \\}\\} # CORRECTED
          
  deploy-prod:
    name: Deploy to production
    needs: build-and-push
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Deploy to Production environment
        uses: your-deployment-action@v1 # Replace with your actual deployment action
        with:
          environment: production
          image: ghcr.io/\\$\\{\\{ github.repository_owner \\}\\}/\\$\\{\\{ github.event.repository.name \\}\}:\\$\\{\\{ github.sha \\}\\}`, // CORRECTED
    explanation: 'Cet exemple montre comment configurer un pipeline CI/CD complet pour une application Next.js, incluant la vérification de la qualité du code, la construction d\'une image Docker, puis le déploiement dans différents environnements selon la branche Git. Le pipeline utilise GitHub Actions pour automatiser toutes ces étapes.'
  },
  exercise: {
    title: 'Configuration d\'un Dockerfile optimisé pour Next.js',
    description: 'Créez un Dockerfile multi-étapes pour une application Next.js qui optimise la taille de l\'image et inclut des bonnes pratiques de sécurité.',
    options: [
      { id: 1, text: 'Utiliser une seule étape avec l\'image node:latest', correct: false },
      { id: 2, text: 'Créer une image multi-étapes avec des étapes distinctes pour la construction et l\'exécution', correct: true },
      { id: 3, text: 'Exécuter l\'application en tant qu\'utilisateur root', correct: false },
      { id: 4, text: 'Inclure tous les fichiers du projet dans l\'image finale', correct: false }
    ],
    solution: `# Dockerfile optimisé pour Next.js
# Étape de build
FROM node:18-alpine AS builder
WORKDIR /app

# Installation des dépendances avec cache optimisé
COPY package.json package-lock.json* ./ 
RUN npm ci

# Copie du reste du code source
COPY . .

# Construction de l'application
RUN npm run build

# Étape de production
FROM node:18-alpine AS runner
WORKDIR /app

# Environnement de production
ENV NODE_ENV production

# Copie uniquement des fichiers nécessaires à l'exécution (mode standalone si configuré dans next.config.js)
COPY --from=builder /app/next.config.js ./next.config.js 
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./ 
COPY --from=builder /app/.next/static ./.next/static

# Utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
RUN chown -R nextjs:nodejs /app
USER nextjs

# Vérification de santé
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 CMD curl -f http://localhost:3000/api/health || exit 1

# Port d'exposition
EXPOSE 3000

# Commande de démarrage pour le mode standalone
CMD ["node", "server.js"]`
  },
  quiz: {
    title: 'Quiz sur le DevOps pour Next.js',
    questions: [
      {
        question: 'Quel est l\'avantage principal de la containerisation pour les applications Next.js ?',
        options: [
          'Elle permet d\'économiser des coûts d\'hébergement',
          'Elle assure une cohérence entre les environnements de développement et de production',
          'Elle élimine le besoin de tests',
          'Elle rend le débogage plus facile'
        ],
        correctAnswer: 'Elle assure une cohérence entre les environnements de développement et de production'
      },
      {
        question: 'Pourquoi est-il recommandé d\'utiliser un utilisateur non-root dans un conteneur Docker pour Next.js ?',
        options: [
          'Pour améliorer les performances',
          'Pour réduire la taille de l\'image',
          'Pour des raisons de sécurité',
          'Pour faciliter la configuration réseau'
        ],
        correctAnswer: 'Pour des raisons de sécurité'
      },
      {
        question: 'Quel est le principal avantage d\'une approche multi-étapes dans un Dockerfile pour Next.js ?',
        options: [
          'Réduire la taille finale de l\'image en n\'incluant que les fichiers nécessaires',
          'Accélérer le processus de construction',
          'Permettre le déploiement sur plusieurs plateformes en même temps',
          'Faciliter la mise à jour des dépendances'
        ],
        correctAnswer: 'Réduire la taille finale de l\'image en n\'incluant que les fichiers nécessaires'
      },
      {
        question: 'Qu\'est-ce qu\'une sonde de préparation (readiness probe) dans Kubernetes ?',
        options: [
          'Un outil pour surveiller la performance de l\'application',
          'Un mécanisme qui vérifie si l\'application est prête à recevoir du trafic',
          'Une fonctionnalité qui redémarre automatiquement les pods défaillants',
          'Un système qui alerte les administrateurs en cas de problème'
        ],
        correctAnswer: 'Un mécanisme qui vérifie si l\'application est prête à recevoir du trafic'
      }
    ]
  },
  project: {
    title: 'Automatisation complète du cycle de vie d\'une application Next.js',
    description: `Dans ce projet, vous allez mettre en place une infrastructure DevOps complète pour une application Next.js. Vous devrez:
    
1. Créer un Dockerfile optimisé pour l'application
2. Configurer un pipeline CI/CD avec GitHub Actions
3. Mettre en place un déploiement Kubernetes
4. Implémenter un système de monitoring et d'observabilité

L'objectif est d'automatiser l'ensemble du processus, de la validation du code jusqu'au déploiement en production, tout en assurant la qualité et la fiabilité de l'application.`,
    initialCode: `# Configuration initiale à améliorer

# Dockerfile basique
FROM node:latest

WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]

# Workflow GitHub Actions minimal
# .github/workflows/ci.yml
name: CI
on:
  push:
    branches: [ main ]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test`,
    solution: `# Solution DevOps complète pour Next.js

# Dockerfile optimisé
FROM node:18-alpine AS builder
WORKDIR /app

# Caching des dépendances
COPY package.json package-lock.json* ./
RUN npm ci

# Construction de l'application
COPY . .
RUN npm run build # Assurez-vous que next.config.js a output: 'standalone'

# Image finale leichte
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

# Copie seulement des fichiers nécessaires (mode standalone)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static 
COPY --from=builder /app/public ./public # Si vous avez un dossier public

# Sécurité: utilisateur non-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
RUN chown -R nextjs:nodejs /app
USER nextjs

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \\
  CMD wget -qO- http://localhost:3000/api/health || exit 1

EXPOSE 3000
CMD ["node", "server.js"] # Commande pour le mode standalone

# Workflow CI/CD complet
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, dev, staging ]
  pull_request:
    branches: [ main, dev ]

permissions: 
  contents: read
  packages: write

jobs:
  verify:
    name: Verify code quality
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Lint code
        run: npm run lint
      - name: Type check
        run: npm run type-check
      - name: Run unit tests
        run: npm run test
      - name: Run e2e tests
        run: npm run test:e2e
      # - name: Analyze bundle
      #   run: npm run analyze
  
  security-scan:
    name: Security scanning
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run npm audit
        run: npm audit --omit=dev
      # - name: Run OWASP ZAP scan 
      #   uses: zaproxy/action-baseline@v0.7.0 
      #   with:
      #     target: 'YOUR_DEPLOYED_STAGING_URL_OR_LOCAL_IF_TESTING_DURING_BUILD'
  
  build-and-push:
    name: Build and push Docker image
    needs: [verify, security-scan]
    if: github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      - name: Login to GitHub Container Registry
        uses: docker/login-action@v2
        with:
          registry: ghcr.io
          username: \\$\\{\\{ github.actor \\}\\} # CORRECTED
          password: \\$\\{\\{ secrets.GITHUB_TOKEN \\}\\} # CORRECTED
      - name: Build and push
        id: docker_build
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: |
            ghcr.io/\\$\\{\\{ github.repository_owner \\}\\}/\\$\\{\\{ github.event.repository.name \\}\}:\\$\\{\\{ github.sha \\}\\}
            ghcr.io/\\$\\{\\{ github.repository_owner \\}\\}/\\$\\{\\{ github.event.repository.name \\}\}:latest 
            ghcr.io/\\$\\{\\{ github.repository_owner \\}\\}/\\$\\{\\{ github.event.repository.name \\}\}:\\$\\{\\{ github.ref_name \\}\}
          labels: |
            org.opencontainers.image.source=\\$\\{\\{ github.event.repository.html_url \\}\\}
            org.opencontainers.image.revision=\\$\\{\\{ github.sha \\}\\}
          cache-from: type=registry,ref=ghcr.io/\\$\\{\\{ github.repository_owner \\}\\}/\\$\\{\\{ github.event.repository.name \\}\}:buildcache
          cache-to: type=registry,ref=ghcr.io/\\$\\{\\{ github.repository_owner \\}\\}/\\$\\{\\{ github.event.repository.name \\}\}:buildcache,mode=max
  
  deploy-dev:
    name: Deploy to development
    needs: build-and-push
    if: github.ref == 'refs/heads/dev' && github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - name: Set Kubernetes context (Example)
        uses: azure/k8s-set-context@v3
        with:
          kubeconfig: \\$\\{\\{ secrets.KUBE_CONFIG_DEV \\}\\} # CORRECTED
      - name: Deploy to development
        run: |
          helm upgrade --install nextjs-app ./helm/nextjs-app \\
            --set image.repository=ghcr.io/\\$\\{\\{ github.repository_owner \\}\\}/\\$\\{\\{ github.event.repository.name \\}\\} \\
            --set image.tag=\\$\\{\\{ github.sha \\}\\} \\
            --namespace development

  deploy-staging:
    name: Deploy to staging
    needs: build-and-push
    if: github.ref == 'refs/heads/staging' && github.event_name == 'push'
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - name: Set Kubernetes context (Example)
        uses: azure/k8s-set-context@v3
        with:
          kubeconfig: \\$\\{\\{ secrets.KUBE_CONFIG_STAGING \\}\\} # CORRECTED
      - name: Deploy to staging
        run: |
          helm upgrade --install nextjs-app ./helm/nextjs-app \\
            --set image.repository=ghcr.io/\\$\\{\\{ github.repository_owner \\}\\}/\\$\\{\\{ github.event.repository.name \\}\\} \\
            --set image.tag=\\$\\{\\{ github.sha \\}\\} \\
            --set replicaCount=2 \\
            --namespace staging
      - name: Run smoke tests
        run: |
          npx playwright test smoke.spec.js --baseUrl=https://staging.example.com

  deploy-production:
    name: Deploy to production
    needs: [build-and-push, deploy-staging] # Depends on successful staging deployment
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Set Kubernetes context (Example)
        uses: azure/k8s-set-context@v3
        with:
          kubeconfig: \\$\\{\\{ secrets.KUBE_CONFIG_PROD \\}\\} # CORRECTED
      - name: Deploy to production (Blue-Green)
        run: |
          # Deploy to "green" environment first
          helm upgrade --install nextjs-app-green ./helm/nextjs-app \\
            --set image.repository=ghcr.io/\\$\\{\\{ github.repository_owner \\}\\}/\\$\\{\\{ github.event.repository.name \\}\\} \\
            --set image.tag=\\$\\{\\{ github.sha \\}\\} \\
            --set replicaCount=4 \\
            --set ingress.enabled=false \\ # Assuming green is not exposed directly initially
            --namespace production
          
          # Run validation tests against green environment
          echo "Running smoke tests on green.prod.example.com (Placeholder)"
          # npx playwright test smoke.spec.js --baseUrl=https://green.prod.example.com
          
          # Switch traffic to green
          echo "Switching traffic to green environment (Placeholder)"
          # kubectl patch ingress nextjs-main-ingress --namespace production --type=json \\
          #   -p='[{"op": "replace", "path": "/spec/rules/0/http/paths/0/backend/service/name", "value":"nextjs-app-green"}]'
          
          echo "Waiting for traffic to stabilize..."
          sleep 60
          
          # Scale down blue (or old green)
          echo "Scaling down previous production environment (Placeholder)"
          # helm upgrade --install nextjs-app-blue ./helm/nextjs-app \\
          #   --set replicaCount=1 \\ # Or 0 to remove
          #   --namespace production

# Configuration Kubernetes - Helm Chart (Illustrative - keep this commented out or separate)
# ---
# helm/nextjs-app/templates/deployment.yaml
# apiVersion: apps/v1
# kind: Deployment
# metadata:
#   name: {{ include "nextjs-app.fullname" . }}
# spec:
#   replicas: {{ .Values.replicaCount }}
#   selector:
#     matchLabels:
#       {{- include "nextjs-app.selectorLabels" . | nindent 6 }}
#   template:
#     metadata:
#       labels:
#         {{- include "nextjs-app.selectorLabels" . | nindent 8 }}
#       annotations:
#         prometheus.io/scrape: "true"
#         prometheus.io/port: "3000" 
#         prometheus.io/path: "/api/metrics"
#     spec:
#       containers:
#         - name: {{ .Chart.Name }}
#           image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}"
#           imagePullPolicy: {{ .Values.image.pullPolicy }}
#           ports:
#             - name: http
#               containerPort: 3000
#               protocol: TCP
#           livenessProbe:
#             httpGet:
#               path: /api/health # Your health check endpoint
#               port: http
#             initialDelaySeconds: 45
#             periodSeconds: 15
#           readinessProbe:
#             httpGet:
#               path: /api/health
#               port: http
#             initialDelaySeconds: 30
#             periodSeconds: 10
#           resources:
#             {{- toYaml .Values.resources | nindent 12 }}
#           env:
#             - name: NODE_ENV
#               value: {{ .Values.environmentName | default "production" }}
#             - name: NEXT_PUBLIC_API_URL 
#               value: {{ .Values.config.apiUrl }}
#             # {{- if .Values.redis.enabled }}
#             # - name: REDIS_URL
#             #   valueFrom:
#             #     secretKeyRef:
#             #       name: {{ include "nextjs-app.fullname" . }}-redis
#             #       key: url
#             # {{- end }}
#             # {{- with .Values.extraEnv }}
#             # {{- toYaml . | nindent 12 }}
#             # {{- end }}
#           # volumeMounts:
#           #   - name: tmp
#           #     mountPath: /tmp
#           #   {{- if .Values.configMap.enabled }}
#           #   - name: config
#           #     mountPath: /app/config
#           #   {{- end }}
#       # volumes:
#       #   - name: tmp
#       #     emptyDir: {}
#       #   {{- if .Values.configMap.enabled }}
#       #   - name: config
#       #     configMap:
#       #       name: {{ include "nextjs-app.fullname" . }}-config
#       #   {{- end }}
#       # {{- with .Values.nodeSelector }}
#       # nodeSelector:
#       #   {{- toYaml . | nindent 8 }}
#       # {{- end }}
#       # {{- with .Values.tolerations }}
#       # tolerations:
#       #   {{- toYaml . | nindent 8 }}
#       # {{- end }}
# ---

# Monitoring avec Prometheus (Illustrative - keep this commented out or separate)
# pages/api/metrics.js 
# ---
# import client from 'prom-client';
# const register = new client.Registry();
# client.collectDefaultMetrics({ register });
# // ... custom metrics ...
# export default async function handler(req, res) {
#   res.setHeader('Content-Type', register.contentType);
#   res.end(await register.metrics());
# }
# ---
`
  }
};

export default lesson1;
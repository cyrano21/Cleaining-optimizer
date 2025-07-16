const lesson3 = {
  id: '16-3',
  title: 'Finalisation et Certification - Déploiement et Présentation',
  content: {
    theory: `
# Finalisation et Certification - Déploiement et Présentation

## Objectifs de la leçon
- Finaliser et optimiser votre projet final
- Déployer l'application en production
- Préparer la présentation de votre projet
- Obtenir votre certification Next.js

## Phase de Finalisation

### 1. Optimisation et Polish

**Performance Audit :**
\`\`\`bash
# Analyse des performances
npm run build
npm run analyze

# Test Lighthouse
npx lighthouse http://localhost:3000 --output html --output-path ./lighthouse-report.html

# Bundle analyzer
npm install --save-dev @next/bundle-analyzer
\`\`\`

**Configuration optimisée :**
\`\`\`javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['example.com'],
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

module.exports = withBundleAnalyzer(nextConfig)
\`\`\`

### 2. Tests et Qualité

**Configuration complète des tests :**
\`\`\`json
// package.json
{
  "scripts": {
    "test": "jest --watch",
    "test:ci": "jest --ci --coverage --watchAll=false",
    "test:e2e": "playwright test",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit"
  }
}
\`\`\`

**Tests E2E avec Playwright :**
\`\`\`javascript
// tests/e2e/auth.spec.js
import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('[data-testid="email"]', 'test@example.com')
    await page.fill('[data-testid="password"]', 'password123')
    await page.click('[data-testid="login-button"]')
    
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()
  })

  test('should handle invalid credentials', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('[data-testid="email"]', 'invalid@example.com')
    await page.fill('[data-testid="password"]', 'wrongpassword')
    await page.click('[data-testid="login-button"]')
    
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Identifiants invalides')
  })
})
\`\`\`

### 3. Déploiement Production

**Préparation au déploiement :**
\`\`\`bash
# Variables d'environnement de production
# .env.production
NEXT_PUBLIC_APP_URL=https://yourapp.com
DATABASE_URL=postgresql://user:pass@host:5432/dbname
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://yourapp.com
\`\`\`

**Déploiement sur Vercel :**
\`\`\`json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "functions": {
    "src/app/api/**/*.js": {
      "maxDuration": 30
    }
  },
  "redirects": [
    {
      "source": "/old-page",
      "destination": "/new-page",
      "permanent": true
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "s-maxage=86400"
        }
      ]
    }
  ]
}
\`\`\`

**Déploiement sur Netlify :**
\`\`\`toml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
\`\`\`

**Déploiement sur un VPS avec Docker :**
\`\`\`dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
\`\`\`

### 4. Monitoring et Analytics

**Configuration de monitoring :**
\`\`\`javascript
// src/lib/analytics.js
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export function AppAnalytics() {
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  )
}

// Google Analytics
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID

export const pageview = (url) => {
  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
  })
}

export const event = ({ action, category, label, value }) => {
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  })
}
\`\`\`

**Error tracking avec Sentry :**
\`\`\`javascript
// sentry.client.config.js
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
})
\`\`\`

### 5. Documentation et Maintenance

**README.md complet :**
\`\`\`markdown
# Mon Projet Next.js

## Description
Description détaillée de votre projet, ses fonctionnalités principales et sa valeur ajoutée.

## Technologies Utilisées
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Prisma + PostgreSQL
- NextAuth.js
- React Hook Form
- Zod

## Installation

\\\`\\\`\\\`bash
# Cloner le projet
git clone https://github.com/username/project.git

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local

# Initialiser la base de données
npx prisma migrate dev

# Lancer en développement
npm run dev
\\\`\\\`\\\`

## Scripts Disponibles
- \`npm run dev\` - Mode développement
- \`npm run build\` - Build de production
- \`npm run start\` - Démarrage production
- \`npm run test\` - Tests unitaires
- \`npm run test:e2e\` - Tests E2E
- \`npm run lint\` - Linting

## Architecture
Description de l'architecture de votre application.

## API
Documentation des endpoints API.

## Déploiement
Instructions de déploiement.

## Contribution
Guidelines pour contribuer au projet.
\`\`\`

## Présentation du Projet

### 1. Structure de Présentation

**Plan recommandé :**
1. **Introduction** (2 min)
   - Présentation personnelle
   - Contexte et problématique

2. **Démonstration** (8 min)
   - Tour complet de l'application
   - Fonctionnalités clés
   - Interface utilisateur

3. **Aspect technique** (8 min)
   - Architecture et technologies
   - Défis techniques relevés
   - Optimisations implémentées

4. **Résultats et apprentissages** (2 min)
   - Métriques de performance
   - Compétences acquises
   - Perspectives d'évolution

### 2. Support de Présentation

**Slides essentielles :**
- Slide titre avec capture d'écran
- Problématique et solution
- Démonstration live ou vidéo
- Architecture technique
- Métrics de performance
- Code highlights
- Apprentissages et défis
- Prochaines étapes

### 3. Démonstration Live

**Checklist technique :**
- [ ] Application déployée et accessible
- [ ] Données de démonstration préparées
- [ ] Scénarios d'usage définis
- [ ] Plan B en cas de problème technique
- [ ] Screenshots de sauvegarde

## Critères de Certification

### 1. Critères Techniques
- ✅ Application fonctionnelle déployée en production
- ✅ Architecture Next.js moderne (App Router)
- ✅ Code propre et bien organisé
- ✅ Tests avec couverture suffisante
- ✅ Performance optimisée (Core Web Vitals)
- ✅ Sécurité implémentée
- ✅ Responsive design

### 2. Critères Fonctionnels
- ✅ Fonctionnalités complètes et utiles
- ✅ Interface utilisateur intuitive
- ✅ Gestion d'erreurs appropriée
- ✅ Expérience utilisateur fluide

### 3. Critères de Présentation
- ✅ Présentation claire et structurée
- ✅ Démonstration technique réussie
- ✅ Explication de l'architecture
- ✅ Mise en avant des apprentissages

### 4. Documentation
- ✅ README complet et à jour
- ✅ Code commenté et documenté
- ✅ Instructions de déploiement
- ✅ Guide d'utilisation
    `,
    example: `
## Exemple : Présentation d'un Projet E-commerce

### 1. Introduction
"Bonjour, je suis [Nom] et je vais vous présenter TaskMaster Pro, une application de gestion de projets que j'ai développée avec Next.js 14."

### 2. Contexte et Problématique
"Les équipes ont besoin d'un outil simple mais puissant pour gérer leurs projets sans la complexité des solutions existantes."

### 3. Démonstration Structurée

**a) Authentification :**
\`\`\`
→ Page de connexion
→ Authentification Google/Email
→ Redirection vers dashboard
\`\`\`

**b) Dashboard principal :**
\`\`\`
→ Aperçu des projets actifs
→ Statistiques en temps réel
→ Navigation intuitive
\`\`\`

**c) Gestion de projets :**
\`\`\`
→ Création d'un nouveau projet
→ Attribution de tâches
→ Suivi en temps réel
→ Collaboration d'équipe
\`\`\`

**d) Fonctionnalités avancées :**
\`\`\`
→ Notifications push
→ Exports PDF
→ Intégration calendrier
→ Analytics détaillés
\`\`\`

### 4. Architecture Technique

**Stack technique :**
\`\`\`
Frontend: Next.js 14, TypeScript, Tailwind CSS
Backend: API Routes, Prisma
Database: PostgreSQL
Auth: NextAuth.js
Déploiement: Vercel
Monitoring: Vercel Analytics + Sentry
\`\`\`

**Architecture de l'application :**
\`\`\`
src/
├── app/                  # App Router
│   ├── (auth)/          # Route groups
│   ├── dashboard/       # Pages privées
│   └── api/            # API Routes
├── components/         # Composants réutilisables
├── lib/               # Utilitaires et services
├── hooks/             # Hooks personnalisés
└── types/             # Types TypeScript
\`\`\`

### 5. Défis Techniques Relevés

**Défi 1 : Performance des listes**
- Problème : Rendu lent avec 1000+ tâches
- Solution : Virtualisation avec react-window
- Résultat : Temps de rendu réduit de 80%

**Défi 2 : Collaboration temps réel**
- Problème : Synchronisation des données
- Solution : WebSockets avec Pusher
- Résultat : Mise à jour instantanée

**Défi 3 : Optimisation mobile**
- Problème : Interface complexe sur mobile
- Solution : Design responsive + PWA
- Résultat : Utilisabilité mobile excellente

### 6. Métriques de Performance

\`\`\`
Lighthouse Score: 98/100
First Contentful Paint: 1.2s
Largest Contentful Paint: 1.8s
Time to Interactive: 2.1s
Cumulative Layout Shift: 0.02
\`\`\`

### 7. Code Highlights

**Hook personnalisé optimisé :**
\`\`\`javascript
// Démonstration de la gestion d'état optimisée
export function useProjects() {
  const { data, error, mutate } = useSWR('/api/projects', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 5000,
  })

  const optimisticUpdate = useCallback((action) => {
    mutate(
      (currentData) => {
        // Mise à jour optimiste
        return updateProjectsOptimistically(currentData, action)
      },
      false // Ne pas revalider immédiatement
    )
  }, [mutate])

  return { projects: data, loading: !error && !data, optimisticUpdate }
}
\`\`\`

### 8. Apprentissages Clés

1. **Next.js App Router** : Migration réussie vers la nouvelle architecture
2. **Optimisation Performance** : Techniques avancées de cache et lazy loading
3. **UX/UI Design** : Importance de l'expérience utilisateur
4. **Tests** : TDD pour une meilleure qualité de code
5. **DevOps** : Pipeline CI/CD et monitoring

### 9. Perspectives d'Évolution

- Intégration IA pour suggestions automatiques
- Application mobile native
- Intégrations tierces (Slack, Teams)
- Mode hors-ligne complet
- Analytics avancés avec ML

### 10. Conclusion

"TaskMaster Pro démontre ma maîtrise de Next.js et du développement moderne. Le projet combine performance, UX exceptionnelle et architecture robuste."

### Script de Démonstration

\`\`\`markdown
## Timeline de Démonstration (10 minutes)

### 0:00-0:30 - Connexion
- Ouvrir l'application
- Se connecter avec Google
- Montrer la transition fluide

### 0:30-2:00 - Dashboard
- Tour du dashboard principal
- Expliquer les métriques
- Montrer la responsivité

### 2:00-4:00 - Création Projet
- Créer un nouveau projet
- Ajouter des tâches
- Assigner des membres

### 4:00-6:00 - Collaboration
- Notification temps réel
- Commentaires
- Mise à jour de statut

### 6:00-8:00 - Fonctionnalités Avancées
- Rapports et analytics
- Export PDF
- Intégration calendrier

### 8:00-10:00 - Performance
- Montrer les métriques Lighthouse
- Navigation rapide
- Responsive design
\`\`\`
    `,
    exercise: `
## Exercice Final : Préparation à la Certification

### Objectif
Finaliser votre projet et préparer votre présentation de certification.

### Étape 1 : Audit Final du Projet

**Checklist technique :**
- [ ] Build de production sans erreurs
- [ ] Score Lighthouse > 90 sur toutes les métriques
- [ ] Tests avec couverture > 80%
- [ ] Sécurité : en-têtes de sécurité configurés
- [ ] SEO : métadonnées complètes
- [ ] Accessibilité : tests WCAG validés
- [ ] Performance : optimisations implémentées
- [ ] Mobile : responsive parfait

**Commandes à exécuter :**
\`\`\`bash
# Audit complet
npm run build
npm run test:ci
npm run lint
npm run type-check

# Performance
npm run analyze
npx lighthouse http://localhost:3000

# Sécurité
npm audit
npx next-safe
\`\`\`

### Étape 2 : Déploiement Production

1. **Préparer les variables d'environnement**
   - Créer .env.production
   - Configurer les secrets
   - Tester toutes les intégrations

2. **Déployer sur votre plateforme choisie**
   - Vercel, Netlify, ou VPS
   - Configurer le domaine personnalisé
   - Tester en production

3. **Configurer le monitoring**
   - Analytics
   - Error tracking
   - Performance monitoring

### Étape 3 : Documentation Complète

Créez les fichiers suivants :

**README.md :**
\`\`\`markdown
# [Nom du Projet]

## Description
[Description détaillée]

## Fonctionnalités
- [ ] Feature 1
- [ ] Feature 2
- [ ] Feature 3

## Technologies
- Next.js 14
- [Autres technologies]

## Installation
[Instructions détaillées]

## Utilisation
[Guide d'utilisation]

## API
[Documentation API]

## Tests
[Comment lancer les tests]

## Déploiement
[Instructions de déploiement]
\`\`\`

**CHANGELOG.md :**
Documentez l'évolution de votre projet

**API.md :**
Documentation complète de vos endpoints

### Étape 4 : Préparation de la Présentation

1. **Créer le support visuel :**
   - 8-10 slides maximum
   - Screenshots de l'application
   - Schémas d'architecture
   - Métriques de performance

2. **Préparer la démonstration :**
   - Scénario d'usage complet
   - Données de test préparées
   - Plan B en cas de problème

3. **Rédiger le script :**
   - Introduction (30 sec)
   - Démonstration (4 min)
   - Technique (4 min)
   - Conclusion (30 sec)

### Étape 5 : Test de Présentation

**Simuler la présentation devant :**
- Un ami/collègue
- En vous enregistrant
- Chronométrer chaque partie

**Points d'attention :**
- Débit de parole
- Clarté des explications
- Gestion du temps
- Réponses aux questions

### Livrable Final

1. **Projet déployé et fonctionnel**
2. **Code source sur GitHub**
3. **Documentation complète**
4. **Support de présentation**
5. **Vidéo de démonstration (optionnel)**

### Grille d'Auto-Évaluation

**Technique (40%):**
- [ ] Architecture Next.js moderne
- [ ] Code propre et organisé
- [ ] Performance optimisée
- [ ] Sécurité implémentée
- [ ] Tests suffisants

**Fonctionnel (30%):**
- [ ] Fonctionnalités complètes
- [ ] UX intuitive
- [ ] Responsive design
- [ ] Gestion d'erreurs

**Présentation (20%):**
- [ ] Démonstration claire
- [ ] Explication technique
- [ ] Gestion du temps
- [ ] Communication efficace

**Documentation (10%):**
- [ ] README complet
- [ ] Code documenté
- [ ] Instructions claires
- [ ] API documentée
    `,
    quiz: {
      question:
        'Quels sont les éléments essentiels pour une certification Next.js réussie ?',
      options: [
        'Seulement le code fonctionnel',
        'Code + déploiement + tests + présentation',
        'Uniquement la démonstration live',
        'Code parfait sans erreurs'
      ],
      correct: 1,
      explanation:
        'Une certification réussie nécessite un projet complet avec du code de qualité, un déploiement en production, des tests, et une présentation claire qui démontre vos compétences techniques et votre capacité à communiquer.'
    },
    project: {
      title: 'Certification Next.js - Projet Final',
      description:
        'Finalisez votre projet et préparez votre certification officielle.',
      requirements: [
        'Application complète déployée en production avec domaine personnalisé',
        'Score Lighthouse supérieur à 90 sur tous les critères',
        'Architecture Next.js 14 avec App Router optimisée',
        'Tests avec couverture minimale de 80%',
        'Sécurité : authentification, autorisation, protection CSRF',
        'Performance : optimisation images, lazy loading, cache',
        'SEO : métadonnées, sitemap, structured data',
        'Accessibilité : conformité WCAG AA',
        'Documentation complète (README, API, architecture)',
        'Présentation de 10 minutes avec démonstration live',
        'Code source propre et bien organisé sur GitHub',
        'Monitoring et analytics configurés',
        'Responsive design parfait (mobile-first)',
        "Gestion d'erreurs robuste avec feedback utilisateur",
        'Intégrations tierces fonctionnelles (base de données, APIs)'
      ],
      certification: {
        criteria: {
          technical: {
            weight: 40,
            requirements: [
              'Architecture moderne et scalable',
              'Code propre avec TypeScript',
              'Performance optimisée',
              'Sécurité implémentée',
              'Tests complets'
            ]
          },
          functional: {
            weight: 30,
            requirements: [
              'Fonctionnalités complètes et utiles',
              'Interface utilisateur excellente',
              'Expérience utilisateur fluide',
              'Responsive design',
              'Accessibilité'
            ]
          },
          presentation: {
            weight: 20,
            requirements: [
              'Démonstration technique réussie',
              "Explication claire de l'architecture",
              'Communication efficace',
              'Gestion du temps',
              'Réponses aux questions'
            ]
          },
          documentation: {
            weight: 10,
            requirements: [
              'README complet et professionnel',
              'Code bien documenté',
              'API documentée',
              'Instructions de déploiement',
              "Guide d'utilisation"
            ]
          }
        },
        validation: [
          '✅ Score minimum de 80% dans chaque catégorie',
          '✅ Projet déployé et accessible publiquement',
          '✅ Présentation de 10 minutes réussie',
          '✅ Questions techniques correctement répondues',
          '✅ Code source de qualité professionnelle'
        ]
      }
    }
  }
}

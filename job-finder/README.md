# Job Finder - Application de recherche d'emploi avec IA

Job Finder est une application web complète pour la recherche d'emploi, combinant des outils de création de CV et lettres de motivation avec un chasseur d'emploi intelligent et des fonctionnalités de coaching IA.

## Fonctionnalités principales

### Générateur de CV
- Sections dynamiques (expérience, compétences, diplômes...)
- Modèles visuels (sobre, pro, créatif)
- Aperçu en temps réel
- Téléchargement en PDF/Docx
- Sauvegarde cloud

### Générateur de lettres de motivation
- Basé sur le poste, l'entreprise et le CV sélectionné
- IA qui adapte le ton (formel, naturel...)
- Traduction automatique
- Téléchargement en PDF/Docx

### Générateur de profil professionnel
- Page publique personnalisée (comme Notion ou Linktree)
- Inclut CV, lettres, liens sociaux, projets
- URL personnalisée

### Chasseur d'emploi intelligent
- Scraping automatique d'annonces (Indeed, LinkedIn, etc.)
- Filtres avancés (localisation, métier, contrat, expérience)
- IA qui évalue les correspondances (score de matching)
- Ajout aux favoris et alertes email

### Géolocalisation et temps de trajet
- Carte interactive avec Google Maps API
- Calcul du temps de trajet domicile-travail
- Filtrage par rayon de distance
- Support de différents modes de transport

### Coaching IA
- Simulateur d'entretien avec IA
- Corrections du CV et lettre par IA
- Suggestions d'améliorations de profil
- Générateur d'affirmations positives

## Technologies utilisées

- **Frontend**: Next.js (app/), TailwindCSS, Shadcn/ui
- **Backend**: Next.js API Routes
- **Base de données**: PostgreSQL avec Prisma ORM
- **Authentification**: Supabase Auth
- **IA**: Hugging Face
- **Géolocalisation**: Google Maps API
- **Paiement**: Stripe
- **Export de documents**: React PDF / Docx

## Plans tarifaires

- **Gratuit**: 1 CV, 3 lettres, recherche limitée
- **Pro**: CV/lettres illimités, IA complète, géolocalisation, export PDF/Docx
- **Coach+**: Coaching IA, simulateur d'entretien, alertes personnalisées

## Installation

### Prérequis

- Node.js 18+
- PostgreSQL
- Compte Supabase
- Compte Stripe
- Compte Hugging Face
- Clé API Google Maps

### Configuration

1. Clonez le dépôt
```bash
git clone https://github.com/votre-username/job-finder.git
cd job-finder
```

2. Installez les dépendances
```bash
npm install
```

3. Configurez les variables d'environnement en copiant le fichier `.env.example` vers `.env.local`
```bash
cp .env.example .env.local
```

4. Modifiez le fichier `.env.local` avec vos propres clés API et configurations

5. Exécutez les migrations Prisma
```bash
npx prisma migrate dev
```

6. Lancez le serveur de développement
```bash
npm run dev
```

7. Accédez à l'application sur http://localhost:3000

## Structure du projet

```
job-finder/
├── app/                    # Architecture Next.js app/
│   ├── api/                # Routes API
│   ├── components/         # Composants partagés
│   ├── modules/            # Modules fonctionnels
│   │   ├── cv/             # Module de génération de CV
│   │   ├── lettre/         # Module de génération de lettres
│   │   ├── profil/         # Module de profil professionnel
│   │   ├── jobs/           # Module de recherche d'emploi
│   │   ├── geolocation/    # Module de géolocalisation
│   │   ├── coaching/       # Module de coaching IA
│   │   ├── admin/          # Module d'administration
│   │   └── pricing/        # Module de tarification
│   ├── lib/                # Bibliothèques et utilitaires
│   ├── hooks/              # Hooks React personnalisés
│   └── utils/              # Fonctions utilitaires
├── prisma/                 # Schéma et migrations Prisma
├── public/                 # Fichiers statiques
└── ...
```

## Déploiement

L'application peut être déployée sur Vercel, Netlify ou tout autre service compatible avec Next.js.

```bash
npm run build
```

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## Licence

MIT

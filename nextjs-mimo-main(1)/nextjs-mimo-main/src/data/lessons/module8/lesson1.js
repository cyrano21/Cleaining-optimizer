// src/data/lessons/module8/lesson1.js
const lesson1 = {
  id: '8-1',
  title: 'Internationalisation (i18n) avec Next.js',
  description: 'Apprenez à rendre votre application Next.js multilingue en utilisant le support i18n natif et des bibliothèques populaires.',
  difficulty: 'intermédiaire',
  duration: 60,
  tags: ['Next.js', 'i18n', 'Traduction', 'Multilingue', 'next-intl'],
  prerequisites: ['6-1'],
  content: `
    <h2>Introduction à l'Internationalisation (i18n)</h2>
    <p>L'internationalisation (souvent abrégée en "i18n" - 18 lettres entre 'i' et 'n') est le processus de conception et de développement d'une application de manière à ce qu'elle puisse être facilement adaptée à différentes langues et régions sans modifications techniques majeures.</p>

    <h3>Support i18n Natif de Next.js</h3>
    <p>Next.js offre un support intégré pour l'internationalisation via sa configuration de routage i18n. Cela permet de gérer différentes versions linguistiques de vos pages basées sur des préfixes de locale dans l'URL (ex: \`/en/about\`, \`/fr/about\`) ou des domaines par langue.</p>
    
    <h4>Configuration dans <code>next.config.js</code></h4>
    <pre><code class="language-javascript">// next.config.js
module.exports = {
  i18n: {
    locales: ['en', 'fr', 'es'],
    defaultLocale: 'en',
    // localeDetection: true, 
  },
};</code></pre>
    <p>Avec cette configuration, Next.js gérera automatiquement le routage.</p>

    <h3>Gestion des Traductions avec une Bibliothèque (Ex: <code>next-intl</code>)</h3>
    <p>Pour gérer les chaînes traduites, des bibliothèques comme <code>next-intl</code> sont recommandées, surtout avec l'App Router.</p>

    <h4>1. Installation et Configuration de <code>next-intl</code></h4>
    <pre><code class="language-bash">npm install next-intl</code></pre>
    <p>Créez un fichier <code>i18n.js</code> (ou <code>i18n.ts</code>) à la racine :</p>
    {/* CORRECTION ICI: Échapper les backticks et le dollar pour l'interpolation dans l'exemple de code */}
    <pre><code class="language-javascript">// i18n.js
import {getRequestConfig} from 'next-intl/server';
 
export default getRequestConfig(async ({locale}) => {
  // Charger les messages pour la locale donnée.
  // Note: l'interpolation \`./messages/\${locale}.json\` est pour l'exemple, 
  // elle fonctionnerait dans un vrai fichier i18n.js exécuté par Next.js.
  return {
    messages: (await import(\`./messages/\${locale}.json\`)).default 
  };
});</code></pre>
    <p>Créez un dossier <code>messages</code> avec vos fichiers de traduction (<code>en.json</code>, <code>fr.json</code>)...</p>
    {/* ... (Contenu des fichiers JSON comme avant) ... */}
    <p>Configurez le middleware pour <code>next-intl</code> (<code>middleware.js</code>) :</p>
    <pre><code class="language-javascript">// middleware.js
import createMiddleware from 'next-intl/middleware';
 
export default createMiddleware({
  locales: ['en', 'fr', 'es'],
  defaultLocale: 'en'
});
 
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};</code></pre>

    <h4>2. Utilisation dans les Composants (avec <code>next-intl</code>)</h4>
    <p>Dans les Server Components (App Router) :</p>
    <pre><code class="language-javascript">// app/[locale]/page.jsx (Exemple de page d'accueil)
// 'use client'; // Non nécessaire pour cet exemple de base avec useTranslations dans un Server Component
import {useTranslations} from 'next-intl';
 
export default function HomePage() {
  const t = useTranslations('HomePage');
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  );
}</code></pre>
    <p>Provider dans le layout racine :</p>
    <pre><code class="language-javascript">// app/[locale]/layout.jsx
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
 
export default async function LocaleLayout({children, params: {locale}}) {
  const messages = await getMessages();
 
  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}</code></pre>
    {/* ... (Le reste du contenu est OK, il décrit l'utilisation) ... */}
  `,
  example: {
    title: 'Composant Navbar Multilingue avec Sélecteur de Langue (next-intl & App Router)',
    // CORRECTION ICI: La chaîne de code ne doit pas essayer d'interpoler `locale` ou `pathname`
    // au moment de la définition de l'objet lesson1.
    // Ces variables sont contextuelles à l'exécution du composant Navbar.
    // L'exemple de code doit être une représentation textuelle.
    code: `// components/Navbar.jsx
'use client';

import Link from 'next/link'; // Utiliser next/link pour la navigation de base
// Pour un changement de locale avec next-intl et App Router, 
// on utilise souvent le Link de next-intl/link ou le useRouter de next-intl/client.
import { usePathname, useRouter } from 'next-intl/client'; // useRouter de next-intl
import { useLocale, useTranslations } from 'next-intl';

export default function Navbar() {
  const t = useTranslations('Navbar');
  const currentActiveLocale = useLocale(); // Locale active
  const pathname = usePathname(); // Chemin actuel SANS la locale (géré par next-intl)
  const router = useRouter(); // Pour la navigation programmatique

  const localesToDisplay = ['en', 'fr', 'es']; // Les locales que vous supportez

  const handleLocaleChange = (newLocale) => {
    if (newLocale !== currentActiveLocale) {
      // router.push (de next-intl/client) gère le changement de locale
      router.push(pathname, { locale: newLocale });
    }
  };

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#eee' }}>
      <div>
        {/* Les Links ici pointent vers des chemins relatifs; next-intl gérera le préfixe de locale */}
        <Link href="/" style={{ marginRight: '10px' }}>{t('home')}</Link>
        <Link href="/about">{t('about')}</Link>
      </div>
      <div>
        <span style={{ marginRight: '10px' }}>Langue:</span>
        {localesToDisplay.map((loc) => (
          <button 
            key={loc} 
            onClick={() => handleLocaleChange(loc)}
            disabled={currentActiveLocale === loc}
            style={{ 
              marginRight: '5px', 
              padding: '5px 8px',
              cursor: currentActiveLocale === loc ? 'default' : 'pointer',
              fontWeight: currentActiveLocale === loc ? 'bold' : 'normal',
              border: currentActiveLocale === loc ? '2px solid blue' : '1px solid grey',
              backgroundColor: currentActiveLocale === loc ? '#e0e0ff' : 'white'
            }}
          >
            {loc.toUpperCase()}
          </button>
        ))}
      </div>
    </nav>
  );
}

// Fichiers de messages nécessaires:
// messages/en.json -> { "Navbar": { "home": "Home", "about": "About Us" } }
// messages/fr.json -> { "Navbar": { "home": "Accueil", "about": "À Propos" } }
// etc.
`,
    explanation: 'Ce composant Navbar utilise `useTranslations`, `useLocale` de `next-intl` et `usePathname`, `useRouter` de `next-intl/client` (ou `next/navigation` pour `usePathname` si vous n\'utilisez pas le routeur de `next-intl`). Les boutons permettent de changer la locale en utilisant `router.push` avec l\'option `locale`.'
  },
  exercise: {
    title: 'Créer un Sélecteur de Langue Amélioré',
    description: 'Implémentez un composant `LanguageSwitcher` qui affiche les langues disponibles. La langue active doit être mise en évidence. Utilisez `next-intl` pour traduire les noms des langues (ex: "Français" au lieu de "FR").',
    // CORRECTION ICI: `t(\`\${locale}\`)` est problématique si locale n'est pas défini.
    // Le `locale` dans t(locale) doit être une clé statique comme 'en', 'fr'.
    initialCode: `// components/LanguageSwitcher.jsx
'use client';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next-intl/client'; 

// Simulez vos locales supportées, idéalement elles viendraient de votre config i18n
const supportedLocales = ['en', 'fr', 'es']; 

export default function LanguageSwitcher() {
  // Supposons un namespace 'Global' pour les noms de langue traduits
  const t = useTranslations('Global'); 
  const currentActiveLocale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const changeLanguage = (newLocale) => {
    if (newLocale !== currentActiveLocale) {
      router.push(pathname, { locale: newLocale });
    }
  };

  return (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '8px', border: '1px solid #ddd', borderRadius: '5px' }}>
      <span style={{ fontWeight: 'bold' }}>{/* TODO: Traduire "Select Language" (ex: t('select_language_label')) */}Langue :</span>
      {supportedLocales.map((loc) => {
        const isActive = loc === currentActiveLocale;
        return (
          <button
            key={loc}
            onClick={() => changeLanguage(loc)}
            disabled={isActive}
            style={{
              padding: '6px 12px',
              cursor: isActive ? 'default' : 'pointer',
              backgroundColor: isActive ? '#007bff' : 'white',
              color: isActive ? 'white' : '#333',
              border: isActive ? 'none' : '1px solid #ccc',
              borderRadius: '4px',
              fontWeight: isActive ? 'bold' : 'normal'
            }}
          >
            {/* TODO: Afficher le nom de la langue traduit (ex: t(loc) qui donnerait "English", "Français") */}
            {/* Pour cela, votre JSON doit avoir des clés "en", "fr", "es" dans le namespace 'Global' */}
            {/* Exemple: t('en') ou t('fr') */}
            {loc.toUpperCase()} {/* Placeholder */}
          </button>
        );
      })}
    </div>
  );
}

// Fichier de traduction exemple (ex: messages/en.json):
// {
//   "Global": {
//     "select_language_label": "Language",
//     "en": "English",
//     "fr": "French",
//     "es": "Spanish"
//   }
// }
`,
    solution: `// components/LanguageSwitcher.jsx
'use client';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next-intl/client'; // Utiliser le routeur de next-intl pour la navigation localisée

const supportedLocales = ['en', 'fr', 'es']; // Idéalement, importez ceci depuis votre config i18n

export default function LanguageSwitcher() {
  const t = useTranslations('Global'); // Namespace contenant les traductions des noms de langue
  const currentLocale = useLocale();
  const pathname = usePathname(); // Chemin actuel sans la locale (géré par next-intl)
  const router = useRouter(); // Routeur de next-intl

  const handleChangeLanguage = (newLocale) => {
    if (newLocale !== currentLocale) {
      // router.push de next-intl gère la navigation avec changement de locale
      router.push(pathname, { locale: newLocale });
    }
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.5rem', background: '#f0f0f0', borderRadius: '5px' }}>
      <span style={{ marginRight: '0.5rem', fontWeight: 'bold' }}>{t('language_label')}:</span>
      {supportedLocales.map((loc) => {
        const isActive = loc === currentLocale;
        return (
          <button
            key={loc}
            onClick={() => handleChangeLanguage(loc)}
            disabled={isActive}
            style={{
              padding: '0.4rem 0.8rem',
              textDecoration: 'none',
              color: isActive ? 'white' : '#007bff',
              backgroundColor: isActive ? '#007bff' : 'transparent',
              fontWeight: isActive ? 'bold' : 'normal',
              border: isActive ? '2px solid #007bff' : '2px solid #007bff',
              borderRadius: '4px',
              pointerEvents: isActive ? 'none' : 'auto',
              opacity: isActive ? 0.7 : 1,
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
            }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = '#e0e0ff';}}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';}}
          >
            {t(loc)} {/* Traduit 'en' en "English", 'fr' en "Français", etc. */}
          </button>
        );
      })}
    </div>
  );
}

// Fichier de traduction exemple (ex: messages/en.json):
// {
//   "Global": {
//     "language_label": "Language",
//     "en": "English",
//     "fr": "French",
//     "es": "Spanish"
//   }
// }
// Fichier de traduction exemple (ex: messages/fr.json):
// {
//   "Global": {
//     "language_label": "Langue",
//     "en": "Anglais",
//     "fr": "Français",
//     "es": "Espagnol"
//   }
// }
`,
  },
  quiz: {
    title: 'Quiz sur l\'Internationalisation avec Next.js',
    questions: [
      {
        question: 'Dans `next.config.js`, quelle propriété définit la langue par défaut de l\'application ?',
        options: ['defaultLang', 'primaryLocale', 'defaultLocale', 'mainLanguage'],
        correctAnswer: 'defaultLocale',
      },
      {
        question: 'Si vous utilisez une bibliothèque comme `next-intl`, où sont généralement stockés les fichiers de traduction (ex: `en.json`, `fr.json`) ?',
        options: ['Dans `public/locales/`', 'Dans un dossier `messages/` ou `locales/` à la racine (configurable)', 'Directement dans les composants', 'Dans `next.config.js`'],
        correctAnswer: 'Dans un dossier `messages/` ou `locales/` à la racine (configurable)',
        explanation: 'Avec des bibliothèques comme next-intl, la convention est souvent un dossier `messages/` ou `locales/` à la racine, mais cela peut être configuré.'
      },
      {
        question: 'Quel hook est couramment fourni par des bibliothèques comme `next-intl` ou `next-i18next` pour accéder aux chaînes traduites dans les composants React ?',
        options: ['useRouterLocale()', 'useLanguage()', 'useTranslations() (ou `useTranslation()`)', 'useMessages()'],
        correctAnswer: 'useTranslations() (ou `useTranslation()`)',
      },
    ],
  },
  project: {
    title: 'Site Vitrine Multilingue Simple',
    description: 'Créez un site vitrine de 2-3 pages (Accueil, À Propos, Contact) entièrement traduisible en au moins deux langues (anglais et français). Utilisez `next-intl` ou une bibliothèque similaire.',
    requirements: [
      'Configuration correcte de l\'i18n dans Next.js (`next.config.js`, `middleware.js` pour `next-intl`).',
      'Mise en place des fichiers de messages (ex: `messages/en.json`, `messages/fr.json`).',
      'Traduction de tout le contenu textuel des pages (titres, paragraphes, labels de boutons).',
      'Implémentation d\'un sélecteur de langue fonctionnel et stylisé.',
      'Assurer une navigation correcte entre les versions linguistiques des pages.',
      'Utilisation de `NextIntlClientProvider` pour les Client Components si nécessaire.'
    ],
    tips: [
      'Commencez par structurer vos fichiers de messages avec des namespaces logiques.',
      'Testez fréquemment le changement de langue sur toutes les pages.',
      'Utilisez le composant `Link` fourni par `next-intl` (ou votre bibliothèque i18n) pour une gestion simplifiée des URL localisées.',
      'Pensez à la mise en page qui pourrait devoir s\'adapter à des longueurs de texte différentes selon la langue.'
    ],
    bonus: [
      'Adaptez le format des dates ou des nombres affichés en fonction de la locale (voir leçon 8-3).',
      'Implémentez la traduction des métadonnées de la page (titre de l\'onglet, description) pour le SEO.',
      'Gérez les images ou les médias spécifiques à une langue (si applicable).'
    ]
  },
  hasExercise: true,
  hasQuiz: true,
  hasProject: true
};

export default lesson1;
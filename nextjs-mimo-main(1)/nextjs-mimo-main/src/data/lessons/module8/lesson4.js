// src/data/lessons/module8/lesson4.js
const lesson4 = {
  id: '8-4',
  title: 'Internationalisation Côté Serveur (SSR/SSG) dans Next.js',
  description: 'Apprenez à pré-rendre des pages multilingues côté serveur avec Next.js en utilisant `getStaticProps` ou `getServerSideProps` et une bibliothèque i18n.',
  difficulty: 'avancé',
  duration: 60,
  tags: ['Next.js', 'i18n', 'SSR', 'SSG', 'Traduction', 'Data Fetching', 'next-intl'],
  prerequisites: ['8-1', '8-3'], // Nécessite l'intro i18n, formatage, et connaissance de base de getStaticProps/getServerSideProps (implicite via prérequis de 8-1)
  content: `
    <h2>Internationalisation et Rendu Côté Serveur/Statique</h2>
    <p>Pour les applications Next.js qui utilisent le rendu côté serveur (SSR via <code>getServerSideProps</code>) ou la génération de site statique (SSG via <code>getStaticProps</code>), il est crucial de pouvoir charger les traductions appropriées pour la locale demandée avant que la page ne soit envoyée au client. Cela garantit que le contenu est immédiatement disponible dans la bonne langue, ce qui est excellent pour le SEO et la performance perçue (pas de "flash" de contenu non traduit).</p>

    <h3>Approche avec <code>next-intl</code> (pour App Router & Pages Router)</h3>
    <p>La bibliothèque <code>next-intl</code>, introduite précédemment, est conçue pour fonctionner efficacement avec les Server Components et les stratégies de rendu de Next.js.</p>
    
    <h4>Chargement des Messages dans <code>getStaticProps</code> ou <code>getServerSideProps</code> (Pages Router)</h4>
    <p>Si vous utilisez le Pages Router, vous chargeriez les messages dans ces fonctions de data fetching et les passeriez comme props à votre composant de page. Ensuite, vous initialiseriez le provider de <code>next-intl</code> avec ces messages.</p>
    <pre><code class="language-javascript">// pages/example-page.jsx (Pages Router avec next-intl)
import {useTranslations} from 'next-intl';
import {NextIntlClientProvider} from 'next-intl'; // Ou équivalent pour Pages Router

export async function getStaticProps({locale}) {
  // Charger uniquement les messages pour la locale demandée
  // La structure exacte dépend de la version de next-intl et de votre config i18n.js
  const messages = (await import(\`../messages/\${locale}.json\`)).default;
  
  return {
    props: {
      messages: messages, // Passer tous les messages pour cette locale
      // Ou seulement les messages nécessaires pour cette page:
      // messages: { PageSpecificNamespace: messages.PageSpecificNamespace },
      locale // Passer la locale est aussi une bonne pratique
    }
  };
}

export default function ExamplePage({ messages, locale }) {
  // Initialiser le provider avec les messages pour que useTranslations fonctionne
  // La manière exacte de faire cela peut varier (ex: _app.js pour Pages Router)
  // ou directement si la page est simple.
  // Pour next-intl, on utiliserait <NextIntlClientProvider messages={messages} locale={locale}>
  // autour du contenu qui utilise useTranslations.

  const t = useTranslations('ExamplePageNamespace'); // Supposant ce namespace dans vos messages

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <div>
        <h1>{t('title')}</h1>
        <p>{t('description')}</p>
      </div>
    </NextIntlClientProvider>
  );
}
</code></pre>
    <p><strong>Note pour l'App Router :</strong> Avec l'App Router et les Server Components, <code>next-intl</code> simplifie cela. Les messages sont souvent chargés via la configuration de <code>getRequestConfig</code> dans <code>i18n.js</code>, et <code>useTranslations</code> peut être utilisé directement dans les Server Components sans passer manuellement les messages en props. Pour les Client Components, le <code>NextIntlClientProvider</code> dans le layout racine (<code>app/[locale]/layout.js</code>) gère la mise à disposition des messages.</p>


    <h3>Exemple avec l'App Router et <code>next-intl</code></h3>
    <p>Dans l'App Router, la gestion des messages pour les Server Components est souvent transparente grâce à la configuration de <code>next-intl</code>.</p>
    <pre><code class="language-javascript">// app/[locale]/about/page.jsx (Server Component)
import { useTranslations } from 'next-intl'; // Peut être utilisé directement
// import { getTranslator } from 'next-intl/server'; // Alternative pour Server Components

export default async function AboutPage({params: {locale}}) {
  // Si vous avez besoin de charger des données spécifiques à la locale en plus des messages i18n
  // const aboutContent = await fetch(\`https://api.example.com/about?lang=\${locale}\`).then(res => res.json());

  const t = useTranslations('AboutPage');
  // const translator = await getTranslator(locale, 'AboutPage'); // Alternative

  return (
    <div>
      <h1>{t('title')}</h1>
      {/* <h1>{translator('title')}</h1> */}
      <p>{t('introduction')}</p>
      {/* <p>{aboutContent.text}</p> */}
    </div>
  );
}

// Les messages pour 'AboutPage.title' et 'AboutPage.introduction'
// sont chargés via votre configuration i18n.js et disponibles ici.
// Le NextIntlClientProvider dans app/[locale]/layout.js est nécessaire
// si cette page rend des Client Components qui utilisent aussi useTranslations.
</code></pre>
    
    <h3>Points Clés pour l'i18n SSR/SSG :</h3>
    <ul>
      <li><strong>Chargement Sélectif :</strong> Ne chargez que les messages de la locale active pour optimiser les performances.</li>
      <li><strong>Provider de Contexte :</strong> Assurez-vous que votre bibliothèque i18n (comme <code>next-intl</code>) a son provider configuré correctement avec les messages chargés, surtout pour les Client Components.</li>
      <li><strong>Hydratation :</strong> Les données et traductions passées du serveur au client doivent correspondre pour éviter les erreurs d'hydratation.</li>
    </ul>
  `,
  example: {
    title: "Page d'Accueil Statique Multilingue (App Router avec next-intl)",
    code: `// app/[locale]/page.jsx (Server Component par défaut)
import { useTranslations } from 'next-intl'; // Fonctionne dans les Server Components

// Optionnel: si vous avez besoin de générer des métadonnées dynamiquement traduites
// import { getTranslator } from 'next-intl/server';
// export async function generateMetadata({params: {locale}}) {
//   const t = await getTranslator(locale, 'HomePage');
//   return {
//     title: t('metaTitle'),
//     description: t('metaDescription')
//   };
// }

export default function HomePage() {
  const t = useTranslations('HomePage'); // 'HomePage' est un namespace dans vos fichiers messages

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{t('title')}</h1>
      <p style={{ fontSize: '1.2rem', color: '#555' }}>{t('welcomeMessage')}</p>
      <button 
        style={{ 
          marginTop: '2rem', 
          padding: '0.8rem 1.5rem', 
          fontSize: '1rem', 
          backgroundColor: '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        {t('ctaButton')}
      </button>
    </div>
  );
}

// Fichier de messages exemple (ex: messages/fr.json)
// {
//   "HomePage": {
//     "metaTitle": "Accueil - Mon Site Incroyable",
//     "metaDescription": "Découvrez tout sur notre entreprise et nos services.",
//     "title": "Bienvenue sur Mon Site Incroyable !",
//     "welcomeMessage": "Nous sommes ravis de vous accueillir. Explorez nos offres.",
//     "ctaButton": "En Savoir Plus"
//   }
// }
`,
    explanation: "Cette page d'accueil, conçue pour l'App Router, utilise `useTranslations` de `next-intl` directement dans un Server Component. Les messages sont chargés côté serveur grâce à la configuration de `next-intl` (via `i18n.js` et `middleware.js`). Cela permet de générer une page statique (si aucun data fetching dynamique n'est ajouté) déjà traduite."
  },
  exercise: {
    title: "Implémenter une Page Statique 'À Propos' Multilingue avec SSR/SSG",
    description: "Créez une page `À Propos` qui est générée statiquement (ou rendue côté serveur) avec son contenu traduit. Utilisez une bibliothèque i18n comme `next-intl` et sa méthode pour charger les traductions côté serveur.",
    initialCode: `// Pour l'App Router: app/[locale]/about/page.jsx
// import { useTranslations } from 'next-intl';
// import { getTranslator } from 'next-intl/server'; // Optionnel pour métadonnées ou logique serveur complexe

// export async function generateMetadata({params: {locale}}) {
//   // TODO: Charger le traducteur pour 'AboutPage' et retourner title/description traduits
//   // const t = await getTranslator(locale, 'AboutPage');
//   // return { title: t('metaTitle') };
//   return { title: "About Us" }; // Placeholder
// }

export default function AboutPage() {
  // TODO: Utiliser useTranslations pour obtenir les traductions pour le namespace 'AboutPage'
  // const t = useTranslations('AboutPage');

  return (
    <div>
      {/* TODO: Afficher un titre et un paragraphe traduits en utilisant t('title') et t('content') */}
      <h1>About Us (Placeholder)</h1>
      <p>This is the about page content (Placeholder).</p>
    </div>
  );
}

// N'oubliez pas de créer les fichiers de messages correspondants :
// messages/en.json:
// {
//   "AboutPage": {
//     "metaTitle": "About Us | Our Company",
//     "title": "About Our Company",
//     "content": "We are a leading company in..."
//   }
// }
// messages/fr.json:
// {
//   "AboutPage": {
//     "metaTitle": "À Propos | Notre Entreprise",
//     "title": "À Propos de Notre Entreprise",
//     "content": "Nous sommes une entreprise leader dans..."
//   }
// }

// Assurez-vous que votre i18n.js et middleware.js sont configurés pour next-intl.
`,
    solution: `// Pour l'App Router: app/[locale]/about/page.jsx
import { useTranslations } from 'next-intl';
import { getTranslator } from 'next-intl/server'; // Pour generateMetadata

// Fonction pour générer les métadonnées dynamiquement et traduites
export async function generateMetadata({params: {locale}}) {
  const t = await getTranslator(locale, 'AboutPage'); // 'AboutPage' est le namespace
  return {
    title: t('metaTitle'),
    description: t('metaDescription') // Supposons une clé metaDescription
  };
}

export default function AboutPage() {
  const t = useTranslations('AboutPage'); // Accède aux traductions pour le namespace 'AboutPage'

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', borderBottom: '2px solid #eee', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
        {t('title')}
      </h1>
      <p style={{ lineHeight: 1.7, fontSize: '1.1rem' }}>
        {t('contentParagraph1')}
      </p>
      <p style={{ lineHeight: 1.7, fontSize: '1.1rem', marginTop: '1rem' }}>
        {t('contentParagraph2')}
      </p>
      {/* Ajoutez plus de contenu traduit si nécessaire */}
    </div>
  );
}

// Fichiers de messages correspondants :
// messages/en.json:
// {
//   "AboutPage": {
//     "metaTitle": "About Us | Our Awesome Company",
//     "metaDescription": "Learn more about Our Awesome Company and our mission.",
//     "title": "About Our Awesome Company",
//     "contentParagraph1": "We are a passionate team dedicated to providing the best solutions in our industry. Our journey started in [Year] with a small idea, and has grown into a leading force.",
//     "contentParagraph2": "Our mission is to innovate and inspire, delivering value to our customers and making a positive impact on the world. We believe in collaboration, integrity, and excellence."
//   }
// }

// messages/fr.json:
// {
//   "AboutPage": {
//     "metaTitle": "À Propos | Notre Super Entreprise",
//     "metaDescription": "Apprenez-en plus sur Notre Super Entreprise et notre mission.",
//     "title": "À Propos de Notre Super Entreprise",
//     "contentParagraph1": "Nous sommes une équipe passionnée dédiée à fournir les meilleures solutions dans notre secteur. Notre aventure a commencé en [Année] avec une petite idée, et est devenue une force de premier plan.",
//     "contentParagraph2": "Notre mission est d'innover et d'inspirer, d'apporter de la valeur à nos clients et d'avoir un impact positif sur le monde. Nous croyons en la collaboration, l'intégrité et l'excellence."
//   }
// }

// Rappel: la configuration de i18n.js et middleware.js pour next-intl est essentielle
// pour que cela fonctionne correctement. Le layout racine app/[locale]/layout.js
// doit aussi être configuré avec NextIntlClientProvider si des Client Components
// sur cette page utilisent useTranslations. Pour un Server Component pur comme celui-ci,
// useTranslations fonctionne directement si la config i18n globale est bonne.
`,
  },
  quiz: {
    title: "Quiz sur l'Internationalisation Côté Serveur (SSR/SSG)",
    questions: [
      {
        question: "Lors de l'utilisation de `getStaticProps` (Pages Router) pour une page multilingue, comment les messages de traduction sont-ils généralement passés au composant de page ?",
        options: ["Via un Contexte React global uniquement.", "En les important directement dans le composant de page.", "En les chargeant dans `getStaticProps` et en les passant comme props au composant de page.", "Next.js les injecte automatiquement sans configuration supplémentaire."],
        correctAnswer: "En les chargeant dans `getStaticProps` et en les passant comme props au composant de page.",
        explanation: "Pour SSG/SSR avec le Pages Router, `getStaticProps` ou `getServerSideProps` est l'endroit où charger les données (y compris les messages i18n) pour la locale spécifique et les passer en props."
      },
      {
        question: "Avec l'App Router et `next-intl`, comment `useTranslations` peut-il fonctionner dans un Server Component sans que les messages soient explicitement passés en props à ce composant ?",
        options: ["Ce n'est pas possible, les messages doivent toujours être passés en props.", "Grâce à la configuration globale de `next-intl` (via `i18n.js` et `middleware.js`) qui rend les messages disponibles côté serveur pour la locale demandée.", "`useTranslations` effectue un appel `fetch` côté client pour obtenir les messages.", "Les Server Components ne peuvent pas être traduits."],
        correctAnswer: "Grâce à la configuration globale de `next-intl` (via `i18n.js` et `middleware.js`) qui rend les messages disponibles côté serveur pour la locale demandée.",
        explanation: "`next-intl` est conçu pour s'intégrer avec l'infrastructure de Next.js (y compris les Server Components) pour fournir les traductions de manière optimisée."
      },
      {
        question: "Quel est l'un des principaux avantages de charger les traductions côté serveur pour SSG ou SSR ?",
        options: ["Réduire la taille du bundle JavaScript côté client car les traductions ne sont pas toutes incluses.", "Améliorer le SEO car le contenu traduit est présent dans le HTML initial.", "Améliorer la performance perçue car la page s'affiche directement dans la bonne langue.", "Toutes ces réponses."],
        correctAnswer: "Toutes ces réponses.",
        explanation: "Le chargement des traductions côté serveur pour SSG/SSR offre des avantages en termes de taille de bundle, de SEO, et d'expérience utilisateur initiale."
      },
    ],
  },
  project: { /* ... (projet existant est bon) ... */
    title: 'Blog Multilingue avec Rendu Côté Serveur/Statique',
    description: 'Développez un blog simple où les articles sont générés statiquement (ou rendus côté serveur) et entièrement traduits dans au moins deux langues. Le contenu de l\'article lui-même doit aussi être traduisible ou provenir d\'une source de données localisée.',
    requirements: [
      "Configuration de l'i18n avec Next.js et une bibliothèque comme `next-intl`.",
      "Au moins deux langues (ex: anglais, français).",
      "Pages de liste d'articles (`/blog`) et de détail d'article (`/blog/[slug]`) pré-rendues (SSG ou SSR).",
      "Le contenu des articles (titre, corps) doit être disponible dans les langues supportées. (Simulez cela avec des fichiers JSON/markdown différents par langue, ou une API qui retourne du contenu localisé).",
      "L'interface utilisateur du blog (navigation, labels, etc.) doit être traduite.",
      "Un sélecteur de langue fonctionnel.",
      "Chargement correct des messages de traduction pour le rendu côté serveur/statique."
    ],
    tips: [
      "Pour SSG avec des routes dynamiques (comme `/blog/[slug]`), utilisez `getStaticPaths` pour générer les versions localisées de chaque article.",
      "Structurez vos données de contenu (articles) de manière à pouvoir facilement récupérer la version localisée.",
      "Pensez au SEO multilingue : utilisez des balises `hreflang` et assurez-vous que les métadonnées (titre, description) sont traduites (ex: via `generateMetadata` dans l'App Router).",
      "Si vous utilisez Markdown pour le contenu des articles, vous pourriez avoir des fichiers `article.en.md` et `article.fr.md`."
    ],
    bonus: [
      "Implémentez la détection de la langue du navigateur avec redirection vers la locale préférée (si non déjà géré par le middleware i18n).",
      "Gérez les URLs canoniques pour éviter le contenu dupliqué aux yeux des moteurs de recherche.",
      "Permettez aux contributeurs (simulés) de soumettre des articles dans différentes langues."
    ]
  },
  hasExercise: true,
  hasQuiz: true,
  hasProject: true
};

export default lesson4;
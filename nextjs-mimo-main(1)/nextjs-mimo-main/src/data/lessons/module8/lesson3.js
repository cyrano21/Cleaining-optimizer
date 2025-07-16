// src/data/lessons/module8/lesson3.js
const lesson3 = {
  id: '8-3',
  title: 'Formatage Localisé : Dates, Nombres et Pluriels',
  description: 'Découvrez comment formater les dates, les nombres, les devises et gérer les formes plurielles en fonction de la locale de l\'utilisateur dans Next.js.',
  difficulty: 'intermédiaire',
  duration: 40, // Durée augmentée
  tags: ['Next.js', 'i18n', 'Intl', 'Date', 'Nombre', 'Pluriel', 'Formatage'],
  prerequisites: ['8-1'], // Dépend de l'intro i18n et de la configuration de la locale
  content: `
    <h2>Formatage des Données selon la Locale</h2>
    <p>Afficher des dates, des nombres et des devises dans un format compréhensible et familier à l'utilisateur est un aspect essentiel de l'internationalisation. JavaScript fournit l'objet global <code>Intl</code>, qui est l'espace de noms pour l'API d'internationalisation de ECMAScript, offrant des fonctionnalités de formatage sensibles à la langue.</p>

    <h3>Formatage des Dates et Heures avec <code>Intl.DateTimeFormat</code></h3>
    <p>Cet objet permet de formater les dates et heures en fonction de conventions spécifiques à une locale.</p>
    <pre><code class="language-javascript">// Obtenir la locale actuelle (par exemple, via useLocale() de next-intl)
// const locale = useLocale(); // 'fr-FR', 'en-US', etc.

const date = new Date(); // Tue Jul 27 2024 10:30:00 GMT...

// Formatage simple
const formatter1 = new Intl.DateTimeFormat('fr-FR');
console.log(formatter1.format(date)); // "27/07/2024" (pour une locale fr-FR)

const formatter2 = new Intl.DateTimeFormat('en-US');
console.log(formatter2.format(date)); // "7/27/2024" (pour une locale en-US)

// Formatage avec options
const optionsDate = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
const formatter3 = new Intl.DateTimeFormat('de-DE', optionsDate);
console.log(formatter3.format(date)); // "Dienstag, 27. Juli 2024" (pour une locale de-DE)

const optionsTime = { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' };
const formatter4 = new Intl.DateTimeFormat('en-GB', optionsTime);
console.log(formatter4.format(date)); // "10:30:00 BST" (pour une locale en-GB, heure d'été britannique)
</code></pre>

    <h3>Formatage des Nombres et Devises avec <code>Intl.NumberFormat</code></h3>
    <p>Cet objet permet de formater les nombres, y compris les pourcentages et les devises, selon les conventions d'une locale.</p>
    <pre><code class="language-javascript">const number = 123456.789;

// Formatage de nombre simple
const numFormatter1 = new Intl.NumberFormat('fr-FR');
console.log(numFormatter1.format(number)); // "123 456,789"

const numFormatter2 = new Intl.NumberFormat('en-IN'); // Inde
console.log(numFormatter2.format(number)); // "1,23,456.789"

// Formatage de devise
const price = 1999.99;
const currencyFormatterFR = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
console.log(currencyFormatterFR.format(price)); // "1 999,99 €"

const currencyFormatterUS = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
console.log(currencyFormatterUS.format(price)); // "$1,999.99"

// Formatage de pourcentage
const percentage = 0.85;
const percentFormatter = new Intl.NumberFormat('ja-JP', { style: 'percent', minimumFractionDigits: 1 });
console.log(percentFormatter.format(percentage)); // "85.0%" (en japonais, mais avec chiffres arabes)
</code></pre>

    <h3>Gestion des Pluriels avec <code>Intl.PluralRules</code> et les Bibliothèques i18n</h3>
    <p>La gestion correcte des formes plurielles (zéro, un, deux, peu, beaucoup, autres) varie considérablement entre les langues. <code>Intl.PluralRules</code> peut aider à déterminer quelle forme utiliser, mais il ne fournit pas les chaînes traduites elles-mêmes.</p>
    <pre><code class="language-javascript">const pr = new Intl.PluralRules('fr-FR');
console.log(pr.select(0)); // "one" (en français, 0 est souvent singulier pour "0 pomme")
console.log(pr.select(1)); // "one"
console.log(pr.select(2)); // "other"
console.log(pr.select(5)); // "other"

const prArabic = new Intl.PluralRules('ar-EG'); // L'arabe a plus de formes plurielles
console.log(prArabic.select(0)); // "zero"
console.log(prArabic.select(1)); // "one"
console.log(prArabic.select(2)); // "two"
console.log(prArabic.select(3)); // "few"
console.log(prArabic.select(11)); // "many"
console.log(prArabic.select(100)); // "other"
</code></pre>
    <p>Pour la traduction réelle des chaînes avec pluriels, les bibliothèques i18n comme <code>next-intl</code> ou <code>i18next</code> (utilisée par <code>next-i18next</code>) offrent un support robuste basé sur le format de message ICU. Elles gèrent la sélection de la bonne chaîne traduite en fonction du nombre et de la locale.</p>
    <pre><code class="language-javascript">// Utilisation avec next-intl (conceptuel, t provient de useTranslations)
// Fichier messages/fr.json:
// { "ProductCard": { "itemsInCart": "{count, plural, =0 {Aucun article} one {1 article} other {{count} articles}} dans le panier" } }
//
// const t = useTranslations('ProductCard');
// console.log(t('itemsInCart', { count: 0 })); // "Aucun article dans le panier"
// console.log(t('itemsInCart', { count: 1 })); // "1 article dans le panier"
// console.log(t('itemsInCart', { count: 5 })); // "5 articles dans le panier"
</code></pre>
  `,
  example: {
    title: 'Composant Affichant Métadonnées d\'Article Formatées',
    code: `// components/ArticleMeta.jsx
// Supposons que ce composant reçoit la locale ou l'obtient via un hook (ex: useLocale de next-intl)
// Pour la simplicité, nous allons la coder en dur ici, mais en pratique, elle serait dynamique.

// 'use client'; // Si vous utilisez useLocale ou useTranslations à l'intérieur
// import { useLocale, useTranslations } from 'next-intl'; // Exemple avec next-intl

export default function ArticleMeta({ date, views, commentCount, locale = 'fr-FR' /* locale dynamique */ }) {
  // const locale = useLocale(); // Pour obtenir la locale dynamiquement avec next-intl
  // const t = useTranslations('ArticleMeta'); // Pour les chaînes comme "vues", "commentaires"

  // Formatage de la date
  const formattedDate = new Intl.DateTimeFormat(locale, {
    year: 'numeric', month: 'long', day: 'numeric'
  }).format(new Date(date));

  // Formatage du nombre de vues
  const formattedViews = new Intl.NumberFormat(locale).format(views);
  
  // Gestion simple du pluriel pour "vue(s)" (sans bibliothèque i18n pour cet exemple direct)
  // Idéalement, utiliser t('viewsLabel', { count: views }) avec une bibliothèque i18n
  let viewsLabel;
  if (locale.startsWith('fr')) {
    viewsLabel = views <= 1 ? 'vue' : 'vues';
  } else { // 'en' et autres par défaut
    viewsLabel = views === 1 ? 'view' : 'views';
  }

  // Gestion du pluriel pour "commentaire(s)" avec Intl.PluralRules (pour la catégorie)
  // et ensuite une logique pour la chaîne
  const pr = new Intl.PluralRules(locale);
  const commentPluralCategory = pr.select(commentCount);
  let commentsLabel;
  // Ceci est une simplification. Une bibliothèque i18n est BEAUCOUP mieux pour cela.
  if (locale.startsWith('fr')) {
    switch(commentPluralCategory) {
      case 'one': commentsLabel = (commentCount === 0 ? 'Aucun commentaire' : '1 commentaire'); break;
      default: commentsLabel = \`\${new Intl.NumberFormat(locale).format(commentCount)} commentaires\`;
    }
  } else {
     switch(commentPluralCategory) {
      case 'one': commentsLabel = \`\${new Intl.NumberFormat(locale).format(commentCount)} comment\`; break;
      default: commentsLabel = \`\${new Intl.NumberFormat(locale).format(commentCount)} comments\`;
    }
    if (commentCount === 0) commentsLabel = "No comments";
  }


  return (
    <div style={{ color: '#555', fontSize: '0.9em', marginTop: '0.5em' }}>
      <p>Publié le : {formattedDate}</p>
      <p>{formattedViews} {viewsLabel}</p>
      <p>{commentsLabel}</p>
      {/* Utilisation avec next-intl serait:
      <p>{t('publishedOn', { date: new Date(date) })}</p> // t gérerait le formatage de date
      <p>{t('viewCount', { count: views })}</p>
      <p>{t('commentCount', { count: commentCount })}</p>
      */}
    </div>
  );
}

// Utilisation exemple:
// <ArticleMeta date="2024-07-27T10:00:00Z" views={10532} commentCount={5} locale="fr-FR" />
// <ArticleMeta date="2024-07-27T10:00:00Z" views={1} commentCount={0} locale="en-US" />
`,
    explanation: 'Cet exemple montre comment utiliser `Intl.DateTimeFormat` et `Intl.NumberFormat` pour afficher une date de publication et un nombre de vues dans un format localisé. Il inclut une gestion simple du pluriel qui serait idéalement gérée par une bibliothèque i18n complète pour plus de robustesse et de langues.'
  },
  exercise: {
    title: 'Créer un Formatteur de Prix de Produit Multidevise',
    description: 'Implémentez un composant React `ProductPrice` qui prend un montant, une devise (ex: "USD", "EUR", "JPY") et une locale en props. Le composant doit afficher le prix formaté correctement selon la locale et la devise.',
    initialCode: `// components/ProductPrice.jsx
// 'use client'; // Si vous prévoyez d'utiliser des hooks i18n ici

export default function ProductPrice({ amount, currency, locale }) {
  // TODO:
  // 1. Utiliser Intl.NumberFormat pour formater le 'amount' avec le style 'currency'
  //    et la 'currency' spécifiée.
  // 2. Assurer que le formatage utilise la 'locale' fournie.
  // 3. Retourner le prix formaté dans un élément JSX (ex: <span> ou <p>).

  // Placeholder:
  return (
    <p>
      Prix à implémenter: {amount} {currency} ({locale})
    </p>
  );
}

// Exemple d'utilisation attendu:
// <ProductPrice amount={1299.99} currency="USD" locale="en-US" /> // Devrait afficher $1,299.99
// <ProductPrice amount={89.50} currency="EUR" locale="fr-FR" /> // Devrait afficher 89,50 €
// <ProductPrice amount={15000} currency="JPY" locale="ja-JP" /> // Devrait afficher ￥15,000
`,
    solution: `// components/ProductPrice.jsx
// Pas besoin de 'use client' si le composant reçoit toutes ses données en props
// et n'utilise pas de hooks clients comme useState, useEffect, ou useLocale/useTranslations.

export default function ProductPrice({ amount, currency, locale }) {
  let formattedPrice;

  try {
    formattedPrice = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      // Optionnel: vous pouvez ajouter plus d'options de formatage ici
      // minimumFractionDigits: 2,
      // maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    console.error("Erreur de formatage du prix:", error);
    // Fallback si la locale ou la devise n'est pas supportée (rare avec les devises communes)
    formattedPrice = \`\${amount.toFixed(2)} \${currency}\`; 
  }

  return (
    <span className="product-price" style={{ fontWeight: 'bold', fontSize: '1.2em' }}>
      {formattedPrice}
    </span>
  );
}

// Pour tester:
// function App() {
//   return (
//     <div>
//       <ProductPrice amount={1299.99} currency="USD" locale="en-US" /> <br />
//       <ProductPrice amount={89.50} currency="EUR" locale="fr-FR" /> <br />
//       <ProductPrice amount={15000} currency="JPY" locale="ja-JP" /> <br />
//       <ProductPrice amount={75.25} currency="GBP" locale="en-GB" /> <br />
//       <ProductPrice amount={12345.67} currency="CAD" locale="en-CA" /> <br />
//       <ProductPrice amount={12345.67} currency="CAD" locale="fr-CA" /> <br />
//       {/* Test avec une devise moins commune et une locale spécifique */}
//       <ProductPrice amount={500000} currency="INR" locale="en-IN" /> <br /> 
//     </div>
//   );
// }
`,
  },
  quiz: {
    title: 'Quiz sur le Formatage Localisé des Données',
    questions: [
      {
        question: 'Quel objet JavaScript est principalement utilisé pour formater les dates et heures en fonction de la locale ?',
        options: ['Date.toLocaleFormat()', 'Intl.DateTimeFormat', 'moment.format()', 'Utils.formatDate()'],
        correctAnswer: 'Intl.DateTimeFormat',
      },
      {
        question: 'Pour formater un nombre comme une devise (ex: "12,50 €"), quelle option principale devez-vous spécifier dans `Intl.NumberFormat` ?',
        options: ['`{ type: "currency", unit: "EUR" }`', '`{ style: "currency", currency: "EUR" }`', '`{ format: "money", symbol: "€" }`', '`{ currencyMode: true, currencyCode: "EUR" }`'],
        correctAnswer: '`{ style: "currency", currency: "EUR" }`',
      },
      {
        question: 'Si vous voulez afficher "2 éléments" en français et "2 items" en anglais, quelle approche est la plus robuste et maintenable pour gérer les pluriels ?',
        options: ['Utiliser des conditions `if/else` basées sur le nombre et la langue directement dans le code du composant.', 'Utiliser `Intl.PluralRules` pour déterminer la catégorie plurielle, puis une logique `switch` pour choisir la chaîne codée en dur.', 'Utiliser une bibliothèque i18n (comme `next-intl` ou `i18next`) qui supporte le format de message ICU pour les pluriels.', 'Créer des composants séparés pour chaque langue et chaque forme plurielle.'],
        correctAnswer: 'Utiliser une bibliothèque i18n (comme `next-intl` ou `i18next`) qui supporte le format de message ICU pour les pluriels.',
        explanation: 'Les bibliothèques i18n gèrent la complexité des règles de pluriel pour de nombreuses langues et permettent de définir les traductions dans des fichiers de messages externes.'
      },
    ],
  },
  hasExercise: true,
  hasQuiz: true,
  hasProject: true,
};

export default lesson3;
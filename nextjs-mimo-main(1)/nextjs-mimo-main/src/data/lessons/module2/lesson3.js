const lesson3 = {
  id: '2-3',
  title: 'Tableaux et méthodes de tableau',
  description: 'Manipuler des tableaux avec les méthodes modernes de JavaScript',
  difficulty: 'intermédiaire',
  duration: 40,
  tags: ['JavaScript', 'Tableaux', 'Méthodes', 'Fonctionnel'],
  prerequisites: ['2-1', '2-2'],
  content: `
    <h2>Les tableaux en JavaScript</h2>
    <p>Les tableaux sont des objets spéciaux pour stocker des collections ordonnées d'éléments.</p>
    
    <h3>Création de tableaux</h3>
    <pre><code>// Deux façons de créer un tableau
const fruits = ['pomme', 'banane', 'orange'];
const nombres = new Array(1, 2, 3, 4, 5);</code></pre>

    <h3>Méthodes de tableau essentielles</h3>
    
    <h4>Méthodes d'ajout/suppression</h4>
    <ul>
      <li><code>push()</code> : Ajoute un ou plusieurs éléments à la fin</li>
      <li><code>pop()</code> : Supprime le dernier élément</li>
      <li><code>unshift()</code> : Ajoute un ou plusieurs éléments au début</li>
      <li><code>shift()</code> : Supprime le premier élément</li>
    </ul>

    <h4>Méthodes de transformation</h4>
    <ul>
      <li><code>map()</code> : Crée un nouveau tableau en transformant chaque élément</li>
      <li><code>filter()</code> : Crée un nouveau tableau avec les éléments qui passent un test</li>
      <li><code>reduce()</code> : Réduit le tableau à une seule valeur</li>
      <li><code>sort()</code> : Trie les éléments du tableau</li>
    </ul>

    <h4>Méthodes de recherche</h4>
    <ul>
      <li><code>find()</code> : Trouve le premier élément qui satisfait une condition</li>
      <li><code>findIndex()</code> : Trouve l'index du premier élément qui satisfait une condition</li>
      <li><code>includes()</code> : Vérifie si un élément existe dans le tableau</li>
    </ul>
  `,
  example: {
    title: 'Exemples de manipulation de tableaux',
    code: `// Données de départ
const produits = [
  { id: 1, nom: 'Ordinateur', prix: 999, enStock: true },
  { id: 2, nom: 'Téléphone', prix: 699, enStock: false },
  { id: 3, nom: 'Tablette', prix: 399, enStock: true },
  { id: 4, nom: 'Écran', prix: 249, enStock: true },
  { id: 5, nom: 'Clavier', prix: 99, enStock: false },
];

// Filtrer les produits en stock
const produitsEnStock = produits.filter(produit => produit.enStock);

// Calculer le prix total des produits en stock
const prixTotal = produitsEnStock.reduce((total, produit) => total + produit.prix, 0);

// Créer une liste des noms de produits en majuscules
const nomsProduits = produits.map(produit => produit.nom.toUpperCase());

// Trier les produits par prix (du moins cher au plus cher)
const produitsTries = [...produits].sort((a, b) => a.prix - b.prix);

console.log('Produits en stock:', produitsEnStock);
console.log('Prix total des produits en stock:', prixTotal);
console.log('Noms des produits:', nomsProduits);
console.log('Produits triés par prix:', produitsTries);`,
    explanation: 'Cet exemple montre comment utiliser les méthodes de tableau pour manipuler et transformer des données de manière déclarative.'
  },
  exercise: {
    title: 'Manipulation de données de films',
    description: 'Vous avez un tableau de films. Complétez les fonctions pour effectuer différentes opérations sur ces données.',
    initialCode: `const films = [
  { id: 1, titre: 'Le Parrain', annee: 1972, realisateur: 'Francis Ford Coppola', note: 9.2 },
  { id: 2, titre: 'Les Évadés', annee: 1994, realisateur: 'Frank Darabont', note: 9.3 },
  { id: 3, titre: 'Le Parrain 2', annee: 1974, realisateur: 'Francis Ford Coppola', note: 9.0 },
  { id: 4, titre: 'La Ligne verte', annee: 1999, realisateur: 'Frank Darabont', note: 8.6 },
  { id: 5, titre: 'Forrest Gump', annee: 1994, realisateur: 'Robert Zemeckis', note: 8.8 },
  { id: 6, titre: 'Inception', annee: 2010, realisateur: 'Christopher Nolan', note: 8.8 },
  { id: 7, titre: 'Interstellar', annee: 2014, realisateur: 'Christopher Nolan', note: 8.6 },
];

// 1. Créez une fonction qui retourne la note moyenne des films
function moyenneNotes() {
  // À implémenter
}

// 2. Créez une fonction qui retourne les films d'un réalisateur donné
function filmsParRealisateur(nomRealisateur) {
  // À implémenter
}

// 3. Créez une fonction qui retourne les films triés par année (du plus récent au plus ancien)
function filmsTriesParAnnee() {
  // À implémenter
}

// 4. Créez une fonction qui retourne les titres des films ayant une note supérieure ou égale à 9
function filmsCultes() {
  // À implémenter
}

// 5. Créez une fonction qui retourne un objet avec le nombre de films par réalisateur
function statistiquesRealisateurs() {
  // À implémenter
}`,
    solution: `const films = [
  { id: 1, titre: 'Le Parrain', annee: 1972, realisateur: 'Francis Ford Coppola', note: 9.2 },
  { id: 2, titre: 'Les Évadés', annee: 1994, realisateur: 'Frank Darabont', note: 9.3 },
  { id: 3, titre: 'Le Parrain 2', annee: 1974, realisateur: 'Francis Ford Coppola', note: 9.0 },
  { id: 4, titre: 'La Ligne verte', annee: 1999, realisateur: 'Frank Darabont', note: 8.6 },
  { id: 5, titre: 'Forrest Gump', annee: 1994, realisateur: 'Robert Zemeckis', note: 8.8 },
  { id: 6, titre: 'Inception', annee: 2010, realisateur: 'Christopher Nolan', note: 8.8 },
  { id: 7, titre: 'Interstellar', annee: 2014, realisateur: 'Christopher Nolan', note: 8.6 },
];

// 1. Moyenne des notes
function moyenneNotes() {
  const somme = films.reduce((acc, film) => acc + film.note, 0);
  return (somme / films.length).toFixed(2);
}

// 2. Films par réalisateur
function filmsParRealisateur(nomRealisateur) {
  return films.filter(film => film.realisateur === nomRealisateur);
}

// 3. Films triés par année (du plus récent)
function filmsTriesParAnnee() {
  return [...films].sort((a, b) => b.annee - a.annee);
}

// 4. Titres des films avec note >= 9
function filmsCultes() {
  return films
    .filter(film => film.note >= 9)
    .map(film => film.titre);
}

// 5. Statistiques par réalisateur
function statistiquesRealisateurs() {
  return films.reduce((acc, film) => {
    if (!acc[film.realisateur]) {
      acc[film.realisateur] = 0;
    }
    acc[film.realisateur]++;
    return acc;
  }, {});
}

// Tests
console.log('Note moyenne:', moyenneNotes());
console.log('Films de Christopher Nolan:', filmsParRealisateur('Christopher Nolan'));
console.log('Films triés par année:', filmsTriesParAnnee());
console.log('Films cultes:', filmsCultes());
console.log('Statistiques réalisateurs:', statistiquesRealisateurs());`,
    tasks: [
      'Calculer la moyenne des notes',
      'Filtrer les films par réalisateur',
      'Trier les films par année',
      'Extraire les titres des films avec une note élevée',
      'Compter les films par réalisateur'
    ]
  },
  quiz: {
    title: 'Quiz sur les tableaux',
    questions: [
      {
        question: 'Quelle méthode crée un nouveau tableau avec les résultats de l\'appel d\'une fonction sur chaque élément ?',
        options: [
          'filter()',
          'map()',
          'reduce()',
          'forEach()'
        ],
        correctAnswer: 'map()'
      },
      {
        question: 'Comment faire une copie superficielle (shallow copy) d\'un tableau ?',
        options: [
          'const copie = array;',
          'const copie = [...array];',
          'const copie = array.copy();',
          'const copie = array.clone();'
        ],
        correctAnswer: 'const copie = [...array];',
        explanation: 'L\'opérateur spread (...) crée une copie superficielle du tableau.'
      },
      {
        question: 'Quelle méthode utilise-t-on pour vérifier si au moins un élément d\'un tableau passe un test ?',
        options: [
          'some()',
          'every()',
          'find()',
          'filter()'
        ],
        correctAnswer: 'some()',
        explanation: 'La méthode some() teste si au moins un élément du tableau passe le test implémenté par la fonction fournie.'
      }
    ]
  },
  hasExercise: true,
  hasQuiz: true,
  hasProject: false
};

export default lesson3;

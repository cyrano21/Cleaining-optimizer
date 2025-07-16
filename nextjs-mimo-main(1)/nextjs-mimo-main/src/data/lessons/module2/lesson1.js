const lesson1 = {
  id: '2-1',
  title: 'Variables et types',
  description: 'Les bases des variables et des types de données en JavaScript',
  difficulty: 'débutant',
  duration: 30,
  tags: ['JavaScript', 'Variables', 'Types', 'Fondamentaux'],
  prerequisites: ['1-1', '1-2'],
  content: `
    <h2>Les variables en JavaScript</h2>
    <p>En JavaScript, il existe trois façons de déclarer des variables :</p>
    <ul>
      <li><code>var</code> : portée de fonction (à éviter dans le code moderne)</li>
      <li><code>let</code> : portée de bloc, peut être réaffectée</li>
      <li><code>const</code> : portée de bloc, ne peut pas être réaffectée</li>
    </ul>
    
    <h3>Types de données</h3>
    <p>JavaScript est un langage à typage dynamique. Les types de données primitifs sont :</p>
    <ul>
      <li><code>String</code> : chaînes de caractères</li>
      <li><code>Number</code> : nombres entiers et décimaux</li>
      <li><code>Boolean</code> : <code>true</code> ou <code>false</code></li>
      <li><code>null</code> : valeur intentionnellement vide</li>
      <li><code>undefined</code> : variable déclarée mais non initialisée</li>
      <li><code>Symbol</code> : valeur unique et immuable</li>
      <li><code>BigInt</code> : pour les très grands entiers</li>
    </ul>
    
    <h3>Objets et tableaux</h3>
    <p>Les objets et tableaux sont des types de données non-primitifs :</p>
    <ul>
      <li><code>Object</code> : collection de paires clé-valeur</li>
      <li><code>Array</code> : liste ordonnée de valeurs</li>
    </ul>
  `,
  example: {
    title: 'Exemples de variables et types',
    code: `// Déclaration de variables
const nom = 'Alice';      // String
let age = 25;            // Number
const estEtudiant = true; // Boolean

// Tableau
const couleurs = ['rouge', 'vert', 'bleu'];

// Objet
const utilisateur = {
  prenom: 'Bob',
  age: 30,
  actif: true
};

// Typeof
console.log(typeof nom);        // "string"
console.log(typeof age);        // "number"
console.log(typeof estEtudiant); // "boolean"
console.log(typeof couleurs);    // "object" (les tableaux sont des objets)
console.log(Array.isArray(couleurs)); // true`,
    explanation: 'Cet exemple montre comment déclarer des variables avec différents types de données en JavaScript et comment vérifier leur type avec typeof.'
  },
  exercise: {
    title: 'Manipulation de variables',
    description: 'Créez différentes variables pour stocker des informations sur un produit et affichez-les.',
    initialCode: `// 1. Créez une variable 'nomProduit' contenant le nom d'un produit
// 2. Créez une variable 'prix' contenant le prix du produit
// 3. Créez une variable 'enStock' indiquant si le produit est en stock
// 4. Créez un tableau 'taillesDisponibles' avec les tailles disponibles
// 5. Créez un objet 'details' contenant la marque et la catégorie du produit
// 6. Affichez toutes ces informations dans la console`,
    solution: `// 1. Créez une variable 'nomProduit' contenant le nom d'un produit
const nomProduit = 'T-shirt';

// 2. Créez une variable 'prix' contenant le prix du produit
let prix = 29.99;

// 3. Créez une variable 'enStock' indiquant si le produit est en stock
const enStock = true;

// 4. Créez un tableau 'taillesDisponibles' avec les tailles disponibles
const taillesDisponibles = ['S', 'M', 'L', 'XL'];

// 5. Créez un objet 'details' contenant la marque et la catégorie du produit
const details = {
  marque: 'MaMarque',
  categorie: 'Vêtements'
};

// 6. Affichez toutes ces informations dans la console
console.log('Nom du produit:', nomProduit);
console.log('Prix:', prix, '€');
console.log('En stock:', enStock ? 'Oui' : 'Non');
console.log('Tailles disponibles:', taillesDisponibles.join(', '));
console.log('Détails:', details);`,
    tasks: [
      'Déclarer des variables avec différents types de données',
      'Créer un tableau de valeurs',
      'Créer un objet avec plusieurs propriétés',
      'Afficher les informations dans la console'
    ]
  },
  quiz: {
    title: 'Quiz sur les variables et types',
    questions: [
      {
        question: 'Quelle est la différence entre let et const ?',
        options: [
          'let permet de déclarer des constantes, const des variables',
          'const permet de déclarer des constantes, let des variables',
          'Il n\'y a pas de différence',
          'const est obsolète, il faut utiliser var à la place'
        ],
        correctAnswer: 'const permet de déclarer des constantes, let des variables'
      },
      {
        question: 'Quel opérateur permet de vérifier le type d\'une variable ?',
        options: [
          'typeOf',
          'typeof',
          'type',
          'instanceof'
        ],
        correctAnswer: 'typeof'
      },
      {
        question: 'Quelle est la valeur de x après ce code ? let x = "5" + 2;',
        options: [
          '7',
          '52',
          'Erreur',
          'undefined'
        ],
        correctAnswer: '52',
        explanation: 'L\'opérateur + avec une chaîne et un nombre convertit le nombre en chaîne et effectue une concaténation.'
      }
    ]
  },
  hasExercise: true,
  hasQuiz: true,
  hasProject: false
};

export default lesson1;

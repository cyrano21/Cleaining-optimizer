const lesson2 = {
  id: '2-2',
  title: 'Fonctions et portée',
  description: 'Apprendre à créer et utiliser des fonctions en JavaScript',
  difficulty: 'débutant',
  duration: 35,
  tags: ['JavaScript', 'Fonctions', 'Portée', 'Fermetures'],
  prerequisites: ['2-1'],
  content: `
    <h2>Les fonctions en JavaScript</h2>
    <p>Les fonctions sont des blocs de code réutilisables qui effectuent une tâche spécifique. Il existe plusieurs façons de déclarer une fonction :</p>
    
    <h3>Déclarations de fonction</h3>
    <pre><code>// Déclaration de fonction (hoisted)
function saluer(nom) {
  return 'Bonjour ' + nom;
}</code></pre>

    <h3>Expressions de fonction</h3>
    <pre><code>// Expression de fonction (non hoisted)
const saluer = function(nom) {
  return 'Bonjour ' + nom;
};</code></pre>

    <h3>Fonctions fléchées (ES6+)</h3>
    <pre><code>// Fonction fléchée
const saluer = (nom) => {
  return 'Bonjour ' + nom;
};

// Version raccourcie avec retour implicite
const saluer = nom => 'Bonjour ' + nom;</code></pre>

    <h3>Portée des variables</h3>
    <p>En JavaScript, les variables ont une portée (scope) qui détermine où elles peuvent être utilisées :</p>
    <ul>
      <li><strong>Portée globale</strong> : accessible partout</li>
      <li><strong>Portée de fonction</strong> : accessible uniquement dans la fonction</li>
      <li><strong>Portée de bloc</strong> (avec let/const) : accessible uniquement dans le bloc {}</li>
    </ul>

    <h3>Fermetures (Closures)</h3>
    <p>Une fermeture est une fonction qui a accès à son contexte lexical, même lorsqu'elle est exécutée en dehors de ce contexte.</p>
  `,
  example: {
    title: 'Exemples de fonctions et portée',
    code: `// Exemple de portée
let variableGlobale = 'Je suis globale';

function exemplePortee() {
  let variableLocale = 'Je suis locale';
  
  if (true) {
    let variableBloc = 'Je suis dans un bloc';
    console.log(variableLocale); // Accessible
  }
  
  // console.log(variableBloc); // Erreur: variableBloc n'est pas définie
  console.log(variableGlobale); // Accessible
}

exemplePortee();

// Exemple de fermeture (closure)
function creerCompteur() {
  let compteur = 0;
  
  return function() {
    compteur++;
    return compteur;
  };
}

const incrementer = creerCompteur();
console.log(incrementer()); // 1
console.log(incrementer()); // 2
console.log(incrementer()); // 3`,
    explanation: 'Cet exemple montre comment fonctionnent les portées en JavaScript et comment les fermetures permettent de conserver l\'état entre les appels de fonction.'
  },
  exercise: {
    title: 'Créer une calculatrice simple',
    description: 'Créez un objet calculatrice avec des méthodes pour additionner, soustraire, multiplier et diviser deux nombres.',
    initialCode: `const calculatrice = {
  // Ajoutez ici les méthodes :
  // - additionner(a, b)
  // - soustraire(a, b)
  // - multiplier(a, b)
  // - diviser(a, b)
};

// Exemple d'utilisation :
// console.log(calculatrice.additionner(5, 3)); // Devrait afficher 8`,
    solution: `const calculatrice = {
  additionner: function(a, b) {
    return a + b;
  },
  
  soustraire: function(a, b) {
    return a - b;
  },
  
  multiplier: function(a, b) {
    return a * b;
  },
  
  diviser: function(a, b) {
    if (b === 0) {
      return 'Erreur: division par zéro';
    }
    return a / b;
  }
};

// Tests
console.log(calculatrice.additionner(5, 3));   // 8
console.log(calculatrice.soustraire(10, 4));  // 6
console.log(calculatrice.multiplier(3, 7));   // 21
console.log(calculatrice.diviser(15, 3));     // 5
console.log(calculatrice.diviser(10, 0));     // Erreur: division par zéro`,
    tasks: [
      'Créer un objet calculatrice',
      'Implémenter les quatre opérations de base',
      'Gérer le cas de la division par zéro',
      'Tester toutes les opérations'
    ]
  },
  quiz: {
    title: 'Quiz sur les fonctions et la portée',
    questions: [
      {
        question: 'Quelle est la différence entre une déclaration de fonction et une expression de fonction ?',
        options: [
          'Les déclarations sont hoistées, pas les expressions',
          'Les expressions sont hoistées, pas les déclarations',
          'Il n\'y a pas de différence',
          'Les déclarations utilisent =>, les expressions utilisent function'
        ],
        correctAnswer: 'Les déclarations sont hoistées, pas les expressions'
      },
      {
        question: 'Qu\'affichera ce code ? function test() { console.log(v); console.log(l); var v = 1; let l = 2; } test();',
        options: [
          'undefined et ReferenceError',
          '1 et 2',
          'undefined et 2',
          'ReferenceError et 2'
        ],
        correctAnswer: 'undefined et ReferenceError',
        explanation: 'Les déclarations var sont hoistées mais pas initialisées (donc undefined), alors que let n\'est pas accessible avant sa déclaration (temporal dead zone).'
      },
      {
        question: 'Qu\'est-ce qu\'une fermeture (closure) en JavaScript ?',
        options: [
          'Une fonction qui retourne une valeur',
          'Une fonction qui a accès à son contexte lexical même après que l\'exécution de ce contexte est terminée',
          'Un moyen de fermer une fonction',
          'Une fonction qui ne prend pas de paramètres'
        ],
        correctAnswer: 'Une fonction qui a accès à son contexte lexical même après que l\'exécution de ce contexte est terminée'
      }
    ]
  },
  hasExercise: true,
  hasQuiz: true,
  hasProject: false
};

export default lesson2;

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CodeEditor from "../../components/editor/CodeEditor";
import CodePlayground from "../../components/editor/CodePlayground";
import ExerciseWithPreview from "../../components/editor/ExerciseWithPreview";
import BackButton from "../../components/ui/BackButton";
import LearningSection from "../../components/learning/LearningSection";
import Link from "next/link";

export default function JavaScriptFundamentalsPage() {
  const [activeSection, setActiveSection] = useState("introduction");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [progress, setProgress] = useState(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('jsCourseProgress') || '{}');
    }
    return {};
  });
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('jsCourseProgress', JSON.stringify(progress));
    }
  }, [progress]);

  const markAsCompleted = (sectionKey) => {
    setProgress(prev => ({
      ...prev,
      [sectionKey]: true
    }));
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.3 },
    },
  };

  // Contenu des sections
  const sections = {
    introduction: {
      title: "Introduction à JavaScript",
      icon: "🌟",
      color: "bg-yellow-500",
      content: `
        JavaScript est un langage de programmation de haut niveau, interprété et orienté objet. 
        C'est l'un des trois piliers du développement web moderne, aux côtés de HTML et CSS.
        
        Contrairement à ce que son nom pourrait suggérer, JavaScript n'a pas grand-chose à voir avec Java. 
        Il a été créé en 1995 par Brendan Eich alors qu'il travaillait chez Netscape.
        
        JavaScript est essentiel pour créer des sites web interactifs et est à la base de frameworks 
        comme React et Next.js. Comprendre JavaScript est donc fondamental pour maîtriser Next.js.
      `,
      code: `// Un simple exemple de JavaScript
console.log("Bonjour, monde!");

// Variables et types de données
let nombre = 42;
const texte = "JavaScript est génial";
const estVrai = true;
const liste = [1, 2, 3, 4, 5];
const objet = { 
  nom: "JavaScript", 
  année: 1995 
};

// Affichage des variables
console.log(nombre);
console.log(texte);
console.log(liste[2]); // Affiche 3
console.log(objet.nom); // Affiche "JavaScript"`,
      language: "javascript",
    },
    variables: {
      title: "Variables et Types de données",
      icon: "📊",
      color: "bg-blue-500",
      content: `
        En JavaScript, vous pouvez déclarer des variables de trois façons :
        
        - \`var\` : ancienne façon, évitez de l'utiliser
        - \`let\` : pour les variables qui peuvent changer
        - \`const\` : pour les constantes qui ne changent pas
        
        JavaScript possède plusieurs types de données :
        
        - Primitifs : String, Number, Boolean, null, undefined, Symbol, BigInt
        - Objets : Object, Array, Function, Date, RegExp, etc.
        
        JavaScript est un langage à typage dynamique, ce qui signifie que vous n'avez pas besoin 
        de déclarer le type d'une variable lors de sa création.
      `,
      code: `// Déclaration de variables
let age = 25;
const nom = "Alice";
let estEtudiant = true;

// Modification de variables
age = 26; // Valide
// nom = "Bob"; // Erreur: on ne peut pas réassigner une constante

// Types de données
const chaîne = "Texte";
const nombre = 42;
const décimal = 3.14;
const booléen = true;
const nul = null;
const nonDéfini = undefined;
const tableau = [1, 2, 3];
const objet = { clé: "valeur" };

// Vérification de type
console.log(typeof chaîne); // "string"
console.log(typeof nombre); // "number"
console.log(typeof booléen); // "boolean"
console.log(typeof tableau); // "object" (attention!)
console.log(Array.isArray(tableau)); // true`,
      language: "javascript",
    },
    functions: {
      title: "Fonctions",
      icon: "⚙️",
      color: "bg-purple-500",
      content: `
        Les fonctions sont des blocs de code réutilisables qui effectuent une tâche spécifique.
        En JavaScript, il existe plusieurs façons de définir des fonctions :
        
        - Déclaration de fonction
        - Expression de fonction
        - Fonction fléchée (ES6)
        
        Les fonctions peuvent accepter des paramètres et retourner des valeurs.
        Elles sont essentielles pour structurer votre code et éviter les répétitions.
        
        Dans React et Next.js, vous utiliserez beaucoup les fonctions fléchées, 
        notamment pour définir des composants et des gestionnaires d'événements.
      `,
      code: `// Déclaration de fonction
function saluer(nom) {
  return "Bonjour, " + nom + "!";
}

// Expression de fonction
const direAuRevoir = function(nom) {
  return "Au revoir, " + nom + "!";
};

// Fonction fléchée (ES6)
const saluerFormellement = (titre, nom) => {
  return \`Bonjour, \${titre} \${nom}.\`;
};

// Fonction fléchée avec retour implicite
const additionner = (a, b) => a + b;

// Appel de fonctions
console.log(saluer("Marie")); // "Bonjour, Marie!"
console.log(direAuRevoir("Jean")); // "Au revoir, Jean!"
console.log(saluerFormellement("Dr", "Smith")); // "Bonjour, Dr Smith."
console.log(additionner(5, 3)); // 8

// Fonctions comme paramètres (callbacks)
function exécuterFonction(fn, valeur) {
  return fn(valeur);
}

console.log(exécuterFonction((x) => x * 2, 10)); // 20`,
      language: "javascript",
    },
    objects: {
      title: "Objets et Tableaux",
      icon: "📦",
      color: "bg-green-500",
      content: `
        Les objets et les tableaux sont des structures de données fondamentales en JavaScript.
        
        Les objets sont des collections de paires clé-valeur, où les clés sont des chaînes de caractères 
        et les valeurs peuvent être de n'importe quel type.
        
        Les tableaux sont des listes ordonnées de valeurs, accessibles par leur index (commençant à 0).
        
        La manipulation d'objets et de tableaux est essentielle en React et Next.js, notamment pour 
        gérer l'état de vos composants et les données de votre application.
      `,
      code: `// Objets
const personne = {
  nom: "Dupont",
  prénom: "Jean",
  âge: 30,
  adresse: {
    rue: "123 Rue Principale",
    ville: "Paris",
    codePostal: "75001"
  }
};

// Accès aux propriétés
console.log(personne.nom); // "Dupont"
console.log(personne["prénom"]); // "Jean"
console.log(personne.adresse.ville); // "Paris"

// Modification de propriétés
personne.âge = 31;
personne.adresse.ville = "Lyon";

// Ajout de propriétés
personne.email = "jean.dupont@example.com";

// Tableaux
const nombres = [1, 2, 3, 4, 5];
const fruits = ["pomme", "banane", "orange"];
const mixte = [1, "deux", { trois: 3 }, [4, 5]];

// Accès aux éléments
console.log(nombres[0]); // 1
console.log(fruits[1]); // "banane"
console.log(mixte[2].trois); // 3

// Méthodes de tableau utiles
console.log(nombres.length); // 5
console.log(fruits.join(", ")); // "pomme, banane, orange"
console.log(nombres.map(n => n * 2)); // [2, 4, 6, 8, 10]
console.log(nombres.filter(n => n > 3)); // [4, 5]
console.log(nombres.reduce((acc, n) => acc + n, 0)); // 15`,
      language: "javascript",
    },
    async: {
      title: "Asynchrone et Promesses",
      icon: "⏱️",
      color: "bg-red-500",
      content: `
        JavaScript est un langage à thread unique, mais il peut gérer des opérations asynchrones 
        grâce aux callbacks, aux promesses et à async/await.
        
        Les promesses sont des objets qui représentent la complétion ou l'échec éventuel 
        d'une opération asynchrone. Elles permettent d'écrire du code asynchrone de manière plus lisible.
        
        async/await est une syntaxe introduite en ES2017 qui permet d'écrire du code asynchrone 
        comme s'il était synchrone, ce qui le rend plus facile à lire et à déboguer.
        
        Dans Next.js, vous utiliserez souvent async/await pour récupérer des données depuis une API 
        ou une base de données.
      `,
      code: `// Promesses
const promesse = new Promise((resolve, reject) => {
  setTimeout(() => {
    const réussite = true;
    if (réussite) {
      resolve("Opération réussie!");
    } else {
      reject("Erreur: l'opération a échoué");
    }
  }, 1000);
});

// Utilisation de .then() et .catch()
promesse
  .then(résultat => {
    console.log(résultat); // "Opération réussie!"
    return "Données transformées";
  })
  .then(nouvelleDonnée => {
    console.log(nouvelleDonnée); // "Données transformées"
  })
  .catch(erreur => {
    console.error(erreur);
  });

// async/await
async function récupérerDonnées() {
  try {
    // Simuler un appel API
    const réponse = await fetch('https://api.example.com/data');
    const données = await réponse.json();
    return données;
  } catch (erreur) {
    console.error("Erreur lors de la récupération des données:", erreur);
    throw erreur;
  }
}

// Exemple d'utilisation dans Next.js
async function chargerDonnéesUtilisateur(id) {
  try {
    const utilisateur = await récupérerDonnées(\`/api/utilisateurs/\${id}\`);
    console.log(utilisateur);
  } catch (erreur) {
    console.error("Impossible de charger l'utilisateur:", erreur);
  }
}`,
      language: "javascript",
    },
    es6: {
      title: "Fonctionnalités ES6+",
      icon: "🚀",
      color: "bg-indigo-500",
      content: `
        ECMAScript 6 (ES6), également connu sous le nom d'ECMAScript 2015, a introduit de nombreuses 
        fonctionnalités qui ont révolutionné la façon d'écrire du JavaScript.
        
        Parmi ces fonctionnalités, on trouve :
        - Les fonctions fléchées
        - La déstructuration
        - Les paramètres par défaut
        - Le spread operator
        - Les template literals
        - Les classes
        - Les modules import/export
        
        Ces fonctionnalités sont largement utilisées dans React et Next.js, et les comprendre 
        est essentiel pour écrire du code moderne et efficace.
      `,
      code: `// Déstructuration
const personne = { nom: "Dupont", prénom: "Jean", âge: 30 };
const { nom, prénom } = personne;
console.log(nom, prénom); // "Dupont Jean"

const nombres = [1, 2, 3, 4, 5];
const [premier, deuxième, ...reste] = nombres;
console.log(premier, deuxième, reste); // 1 2 [3, 4, 5]

// Paramètres par défaut
function saluer(nom = "visiteur") {
  return \`Bonjour, \${nom}!\`;
}
console.log(saluer()); // "Bonjour, visiteur!"
console.log(saluer("Marie")); // "Bonjour, Marie!"

// Spread operator
const tableau1 = [1, 2, 3];
const tableau2 = [4, 5, 6];
const combiné = [...tableau1, ...tableau2];
console.log(combiné); // [1, 2, 3, 4, 5, 6]

const objet1 = { a: 1, b: 2 };
const objet2 = { b: 3, c: 4 }; // Notez que b est présent dans les deux objets
const combinéObjet = { ...objet1, ...objet2 };
console.log(combinéObjet); // { a: 1, b: 3, c: 4 } (b de objet2 écrase b de objet1)

// Classes
class Animal {
  constructor(nom) {
    this.nom = nom;
  }
  
  parler() {
    return \`\${this.nom} fait du bruit.\`;
  }
}

class Chien extends Animal {
  constructor(nom, race) {
    super(nom);
    this.race = race;
  }
  
  parler() {
    return \`\${this.nom} aboie!\`;
  }
}

const monChien = new Chien("Rex", "Berger Allemand");
console.log(monChien.parler()); // "Rex aboie!"`,
      language: "javascript",
    },
    exercise1: {
      title: "Exercice - Créer une calculatrice simple",
      icon: "🧮",
      color: "bg-pink-500",
      content: `
        Maintenant que vous avez appris les bases de JavaScript, essayez de résoudre cet exercice pratique.
        
        L'objectif est de créer une calculatrice simple qui :
        1. Prend deux nombres en entrée
        2. Permet d'effectuer les 4 opérations de base (addition, soustraction, multiplication, division)
        3. Gère le cas de la division par zéro
        4. Retourne le résultat de l'opération
        
        Utilisez vos connaissances sur les fonctions, les conditions et les opérateurs pour compléter cet exercice.
        
        Cet exercice vous aidera à consolider votre compréhension des concepts de base de JavaScript.
      `,
      exercise: true,
      initialCode: `// Complétez les fonctions ci-dessous pour créer une calculatrice simple

// Fonction d'addition
function additionner(a, b) {
  // Votre code ici
}

// Fonction de soustraction
function soustraire(a, b) {
  // Votre code ici
}

// Fonction de multiplication
function multiplier(a, b) {
  // Votre code ici
}

// Fonction de division
function diviser(a, b) {
  // Votre code ici
  // N'oubliez pas de gérer la division par zéro
}

// Fonction calculatrice qui utilise les fonctions ci-dessus
function calculer(a, b, operation) {
  // Votre code ici
  // L'opération peut être: 'addition', 'soustraction', 'multiplication', 'division'
}

// Tests (ne pas modifier)
console.log(calculer(5, 3, 'addition')); // Devrait afficher 8
console.log(calculer(5, 3, 'soustraction')); // Devrait afficher 2
console.log(calculer(5, 3, 'multiplication')); // Devrait afficher 15
console.log(calculer(6, 3, 'division')); // Devrait afficher 2
console.log(calculer(5, 0, 'division')); // Devrait afficher "Erreur: Division par zéro"`,
      solutionCode: `// Complétez les fonctions ci-dessous pour créer une calculatrice simple

// Fonction d'addition
function additionner(a, b) {
  return a + b;
}

// Fonction de soustraction
function soustraire(a, b) {
  return a - b;
}

// Fonction de multiplication
function multiplier(a, b) {
  return a * b;
}

// Fonction de division
function diviser(a, b) {
  if (b === 0) {
    return "Erreur: Division par zéro";
  }
  return a / b;
}

// Fonction calculatrice qui utilise les fonctions ci-dessus
function calculer(a, b, operation) {
  switch (operation) {
    case 'addition':
      return additionner(a, b);
    case 'soustraction':
      return soustraire(a, b);
    case 'multiplication':
      return multiplier(a, b);
    case 'division':
      return diviser(a, b);
    default:
      return "Opération non reconnue";
  }
}

// Tests (ne pas modifier)
console.log(calculer(5, 3, 'addition')); // Devrait afficher 8
console.log(calculer(5, 3, 'soustraction')); // Devrait afficher 2
console.log(calculer(5, 3, 'multiplication')); // Devrait afficher 15
console.log(calculer(6, 3, 'division')); // Devrait afficher 2
console.log(calculer(5, 0, 'division')); // Devrait afficher "Erreur: Division par zéro"`,
      language: "javascript",
    },
    exercise2: {
      title: "Quiz - Manipulations de tableaux",
      icon: "📋",
      color: "bg-orange-500",
      content: `
        Maintenant, passons à un exercice plus avancé sur les manipulations de tableaux.
        
        Les méthodes de tableau comme map, filter, reduce, et sort sont essentielles en JavaScript moderne
        et sont très utilisées dans React et Next.js pour manipuler des données.
        
        Dans cet exercice, vous devrez :
        1. Filtrer un tableau pour ne garder que les nombres pairs
        2. Transformer un tableau en doublant chaque valeur
        3. Calculer la somme de tous les éléments d'un tableau
        4. Trier un tableau d'objets selon une propriété
        
        Utilisez exclusivement les méthodes de tableau (pas de boucles for/while) pour résoudre ces problèmes.
      `,
      exercise: true,
      initialCode: `// Travaillez avec les tableaux en utilisant les méthodes map, filter, reduce et sort

// 1. Filtrez le tableau pour ne garder que les nombres pairs
function filtrerPairs(nombres) {
  // Votre code ici
}

// 2. Doublez chaque valeur dans le tableau
function doublerValeurs(nombres) {
  // Votre code ici
}

// 3. Calculez la somme de tous les éléments du tableau
function calculerSomme(nombres) {
  // Votre code ici
}

// 4. Triez le tableau d'objets par âge (du plus jeune au plus âgé)
function trierParAge(personnes) {
  // Votre code ici
}

// Tests (ne pas modifier)
const nombres = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
console.log(filtrerPairs(nombres)); // Devrait afficher [2, 4, 6, 8, 10]
console.log(doublerValeurs(nombres)); // Devrait afficher [2, 4, 6, 8, 10, 12, 14, 16, 18, 20]
console.log(calculerSomme(nombres)); // Devrait afficher 55

const personnes = [
  { nom: "Alice", age: 30 },
  { nom: "Bob", age: 25 },
  { nom: "Charlie", age: 35 },
  { nom: "David", age: 28 }
];
console.log(trierParAge(personnes)); 
// Devrait afficher le tableau trié avec Bob en premier (25 ans) et Charlie en dernier (35 ans)`,
      solutionCode: `// Travaillez avec les tableaux en utilisant les méthodes map, filter, reduce et sort

// 1. Filtrez le tableau pour ne garder que les nombres pairs
function filtrerPairs(nombres) {
  return nombres.filter(nombre => nombre % 2 === 0);
}

// 2. Doublez chaque valeur dans le tableau
function doublerValeurs(nombres) {
  return nombres.map(nombre => nombre * 2);
}

// 3. Calculez la somme de tous les éléments du tableau
function calculerSomme(nombres) {
  return nombres.reduce((somme, nombre) => somme + nombre, 0);
}

// 4. Triez le tableau d'objets par âge (du plus jeune au plus âgé)
function trierParAge(personnes) {
  return [...personnes].sort((a, b) => a.age - b.age);
}

// Tests (ne pas modifier)
const nombres = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
console.log(filtrerPairs(nombres)); // Devrait afficher [2, 4, 6, 8, 10]
console.log(doublerValeurs(nombres)); // Devrait afficher [2, 4, 6, 8, 10, 12, 14, 16, 18, 20]
console.log(calculerSomme(nombres)); // Devrait afficher 55

const personnes = [
  { nom: "Alice", age: 30 },
  { nom: "Bob", age: 25 },
  { nom: "Charlie", age: 35 },
  { nom: "David", age: 28 }
];
console.log(trierParAge(personnes)); 
// Devrait afficher le tableau trié avec Bob en premier (25 ans) et Charlie en dernier (35 ans)`,
      language: "javascript",
    },
    playground: {
      title: "Playground JavaScript",
      icon: "🎮",
      color: "bg-gray-500",
      content: `
        Utilisez ce playground pour expérimenter avec JavaScript. 
        Écrivez votre code dans l'éditeur et voyez le résultat en temps réel.
        
        Vous pouvez utiliser console.log() pour afficher des valeurs dans la prévisualisation.
        
        N'hésitez pas à essayer les exemples des sections précédentes ou à créer vos propres exemples.
        
        C'est un excellent moyen de vous familiariser avec JavaScript avant de passer à React et Next.js.
      `,
      playground: true,
      initialCode: `// Écrivez votre code JavaScript ici
console.log("Bienvenue dans le playground JavaScript!");

// Essayez de créer des variables
const nom = "Utilisateur";
let compteur = 0;

// Créez une fonction
function incrémenter() {
  compteur++;
  return compteur;
}

// Utilisez la fonction
console.log(\`Bonjour, \${nom}!\`);
console.log("Compteur:", incrémenter());
console.log("Compteur:", incrémenter());

// Créez un tableau et utilisez des méthodes de tableau
const nombres = [1, 2, 3, 4, 5];
const doublés = nombres.map(n => n * 2);
console.log("Nombres doublés:", doublés);

// Essayez une promesse
const promesseSimple = Promise.resolve("Promesse résolue!");
promesseSimple.then(résultat => console.log(résultat));`,
      language: "javascript",
    },
  };

  const totalSections = Object.keys(sections).length;
  const completedSections = Object.values(progress).filter(Boolean).length;
  const progressPercentage = Math.round((completedSections / totalSections) * 100);

  const handleSectionChange = (section) => {
    setActiveSection(section);
    setShowMobileMenu(false);
    // Auto-scroll to top when changing sections
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderSectionContent = () => {
    const section = sections[activeSection];

    // Utiliser le composant LearningSection pour les sections avec exercices interactifs
    if (activeSection === "variables" || activeSection === "functions" || 
        activeSection === "objects" || activeSection === "async" || 
        activeSection === "es6") {
      // Ces sections sont déjà structurées avec le composant LearningSection
      // dans le code original, donc nous les laissons intactes
      return (
        <LearningSection
          title={section.title}
          description={`Maîtrisez les ${section.title.toLowerCase()} en JavaScript pour développer des applications modernes`}
          theory={
            <div className="prose max-w-none">
              {section.content.split("\n").map((paragraph, index) => (
                <p key={index} className="mb-2 text-gray-700">
                  {paragraph}
                </p>
              ))}
            </div>
          }
          example={{
            description: `Exemples de code pour comprendre les ${section.title.toLowerCase()} :`,
            code: section.code,
            language: section.language,
            readOnly: true,
          }}
        />
      );
    }

    return (
      <motion.div
        key={activeSection}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="mt-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className={`w-10 h-10 ${section.color} rounded-lg flex items-center justify-center text-white shadow-lg`}>
            <span className="text-xl">{section.icon}</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {section.title}
          </h2>
        </div>
        
        <div className="prose max-w-none mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          {section.content.split("\n").map((paragraph, index) => (
            <p key={index} className="mb-4 text-gray-700">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
          {section.playground ? (
            <CodePlayground
              initialCode={section.initialCode}
              language={section.language}
              title="Playground JavaScript"
              description="Expérimentez avec JavaScript et voyez le résultat en temps réel."
              height="500px"
            />
          ) : section.exercise ? (
            <ExerciseWithPreview
              exercise={{
                id: activeSection === "exercise1" ? 1 : 2,
                title: section.title,
                description: section.content.trim(),
                instructions: section.content
                  .split("\n")
                  .filter((line) => line.trim())
                  .filter((line) => /^\d+\./.test(line.trim()))
                  .map((line) => line.trim()),
                initialCode: section.initialCode,
                solutionCode: section.solutionCode,
                language: section.language,
                difficulty:
                  activeSection === "exercise1" ? "débutant" : "intermédiaire",
                xpReward: activeSection === "exercise1" ? 20 : 40,
              }}
            />
          ) : (
            <CodeEditor
              initialCode={section.code}
              language={section.language}
              height="350px"
              showPreview={true}
              autoPreview={true}
            />
          )}
        </div>

        <div className="flex justify-between items-center mt-8 mb-12">
          <button 
            onClick={() => {
              const sectionKeys = Object.keys(sections);
              const currentIndex = sectionKeys.indexOf(activeSection);
              if (currentIndex > 0) {
                handleSectionChange(sectionKeys[currentIndex - 1]);
              }
            }}
            disabled={activeSection === Object.keys(sections)[0]}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
              activeSection === Object.keys(sections)[0]
                ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                : 'text-indigo-600 border-indigo-200 hover:bg-indigo-50'
            } transition-colors`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Section précédente</span>
          </button>

          <button
            onClick={() => markAsCompleted(activeSection)}
            className={`px-4 py-2 rounded-lg ${
              progress[activeSection]
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            } transition-colors flex items-center space-x-2`}
          >
            {progress[activeSection] ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Section complétée</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Marquer comme complété</span>
              </>
            )}
          </button>

          <button 
            onClick={() => {
              const sectionKeys = Object.keys(sections);
              const currentIndex = sectionKeys.indexOf(activeSection);
              if (currentIndex < sectionKeys.length - 1) {
                handleSectionChange(sectionKeys[currentIndex + 1]);
              }
            }}
            disabled={activeSection === Object.keys(sections)[Object.keys(sections).length - 1]}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
              activeSection === Object.keys(sections)[Object.keys(sections).length - 1]
                ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                : 'text-indigo-600 border-indigo-200 hover:bg-indigo-50'
            } transition-colors`}
          >
            <span>Section suivante</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barre de navigation supérieure */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Link href="/lessons" className="text-indigo-600 hover:text-indigo-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-xl font-bold text-gray-900">Fondamentaux JavaScript</h1>
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              <div className="w-48 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2.5 rounded-full" 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-700">{progressPercentage}% Complété</span>
            </div>
            
            <button 
              className="md:hidden"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>
        </div>
      </header>
      
      {/* Contenu principal avec sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Sidebar pour desktop */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Modules du cours</h2>
                <nav className="space-y-1">
                  {Object.entries(sections).map(([key, section], index) => (
                    <button
                      key={key}
                      onClick={() => handleSectionChange(key)}
                      className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        activeSection === key
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center justify-center w-6 h-6 mr-3">
                        {progress[key] ? (
                          <div className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        ) : (
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${activeSection === key ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
                            {index + 1}
                          </div>
                        )}
                      </div>
                      <span className="truncate">{section.title}</span>
                    </button>
                  ))}
                </nav>
              </div>
              
              <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-3">Votre progression</h2>
                <div className="mb-3">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Complété</span>
                    <span>{completedSections}/{totalSections} sections</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2.5 rounded-full" 
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
                {completedSections === totalSections ? (
                  <div className="text-center py-3 bg-green-50 text-green-700 rounded-lg">
                    <span className="font-medium">Cours terminé! 🎉</span>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    Continuez à apprendre pour compléter ce cours sur JavaScript.
                  </p>
                )}
              </div>
              
              <div className="mt-6 bg-yellow-50 rounded-xl shadow-sm border border-yellow-100 p-6">
                <h3 className="font-medium text-yellow-800 mb-2">Astuce</h3>
                <p className="text-sm text-yellow-700 mb-4">
                  JavaScript est le langage fondamental du web moderne. 
                  Maîtriser ses concepts vous donnera une base solide pour apprendre React et Next.js.
                </p>
                <a 
                  href="https://developer.mozilla.org/fr/docs/Web/JavaScript" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-3 rounded-lg inline-block transition-colors"
                >
                  Documentation MDN
                </a>
              </div>
            </div>
          </aside>
          
          {/* Menu mobile */}
          <AnimatePresence>
            {showMobileMenu && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="lg:hidden fixed inset-0 z-50 bg-gray-900 bg-opacity-50"
              >
                <div className="bg-white p-6 h-auto max-h-[90vh] overflow-y-auto rounded-b-xl">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="font-semibold text-gray-900">Modules du cours</h2>
                    <button onClick={() => setShowMobileMenu(false)}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progression</span>
                      <span>{progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2.5 rounded-full" 
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <nav className="space-y-1">
                    {Object.entries(sections).map(([key, section], index) => (
                      <button
                        key={key}
                        onClick={() => handleSectionChange(key)}
                        className={`flex items-center w-full px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                          activeSection === key
                            ? "bg-indigo-50 text-indigo-700"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center justify-center w-6 h-6 mr-3">
                          {progress[key] ? (
                            <div className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          ) : (
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${activeSection === key ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
                              {index + 1}
                            </div>
                          )}
                        </div>
                        <span className="truncate">{section.title}</span>
                      </button>
                    ))}
                  </nav>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Contenu principal */}
          <main className="lg:col-span-9">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              <AnimatePresence mode="wait">
                {renderSectionContent()}
              </AnimatePresence>
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}

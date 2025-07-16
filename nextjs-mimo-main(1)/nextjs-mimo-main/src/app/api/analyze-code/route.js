
import { NextResponse } from 'next/server';

// Fonction d'analyse de code plus élaborée - à remplacer par IA réelle
const analyzeCodeWithLanguageRules = (code, language) => {
  const results = {
    score: 0,
    suggestions: [],
    bestPractices: []
  };

  // Règles générales
  const generalRules = [
    {
      test: (code) => code.includes('console.log'),
      type: 'debug',
      message: 'Pensez à supprimer les console.log avant la mise en production',
      example: '// Supprimez ou commentez: console.log(...)'
    },
    {
      test: (code) => /\/\/\s*TODO/.test(code),
      type: 'organization',
      message: 'Des TODO sont présents dans le code',
      example: '// Complétez les TODO avant la finalisation'
    }
  ];
  
  // Règles spécifiques aux langages
  const languageRules = {
    javascript: [
      {
        test: (code) => code.includes('var '),
        type: 'modern',
        message: 'Préférez const et let à var pour une meilleure gestion de la portée',
        example: 'const x = 1; // pour les valeurs immuables\nlet y = 2; // pour les variables'
      },
      {
        test: (code) => code.includes('function(') && !code.includes('=>'),
        type: 'style',
        message: 'Considérez utiliser des fonctions fléchées pour plus de concision',
        example: 'const add = (a, b) => a + b;'
      },
      {
        test: (code) => /\.then\(.*\.then\(/.test(code),
        type: 'modern',
        message: 'Envisagez d\'utiliser async/await pour une meilleure lisibilité',
        example: 'async function getData() {\n  const result = await fetch(url);\n  return await result.json();\n}'
      }
    ],
    jsx: [
      {
        test: (code) => code.includes('import React from \'react\';') && !code.includes('React.'),
        type: 'optimization',
        message: "L'import de React n'est pas nécessaire si vous n'utilisez pas directement React.*",
        example: "// Supprimez si inutilisé:\n// import React from 'react';"
      },
      {
        test: (code) => (code.includes('.map(') || code.includes('.forEach(')) && !code.includes('key='),
        type: 'bestpractice',
        message: 'Ajoutez un attribut "key" unique lors de la génération de listes avec map()',
        example: '{items.map((item) => <div key={item.id}>{item.name}</div>)}'
      },
      {
        test: (code) => code.includes('useState(') && !code.includes('use client'),
        type: 'nextjs',
        message: 'Ajoutez la directive "use client" en haut du fichier pour les composants utilisant des hooks React',
        example: '"use client";\n\nimport { useState } from "react";'
      }
    ],
    css: [
      {
        test: (code) => code.includes('!important'),
        type: 'style',
        message: 'Évitez d\'utiliser !important, préférez une spécificité CSS plus élevée',
        example: '.sidebar .button { /* plus spécifique que juste .button */ }'
      }
    ],
    python: [
      {
        test: (code) => /except:/.test(code) && !(/except \w+:/.test(code)),
        type: 'bestpractice',
        message: 'Évitez les blocs except génériques, spécifiez les exceptions à capturer',
        example: 'try:\n    data = process_data()\nexcept ValueError as e:\n    print(f"Erreur de valeur: {e}")'
      }
    ]
  };

  // Appliquer les règles générales
  generalRules.forEach(rule => {
    if (rule.test(code)) {
      results.suggestions.push({
        type: rule.type,
        message: rule.message,
        example: rule.example
      });
    }
  });

  // Appliquer les règles spécifiques au langage
  const specificRules = languageRules[language] || [];
  specificRules.forEach(rule => {
    if (rule.test(code)) {
      results.suggestions.push({
        type: rule.type,
        message: rule.message,
        example: rule.example
      });
    }
  });

  // Pour JSX/React, vérifier également les règles JavaScript
  if (language === 'jsx' && languageRules.javascript) {
    languageRules.javascript.forEach(rule => {
      if (rule.test(code)) {
        results.suggestions.push({
          type: rule.type,
          message: rule.message,
          example: rule.example
        });
      }
    });
  }

  // Bonnes pratiques adaptées au langage
  const languageBestPractices = {
    javascript: [
      'Utilisez des noms de variables descriptifs',
      'Préférez const lorsque les variables ne changent pas',
      'Utilisez les fonctions fléchées pour les callbacks',
      'Découpez les fonctions complexes en fonctions plus petites',
      'Commentez votre code pour expliquer le "pourquoi", pas le "comment"'
    ],
    jsx: [
      'Découpez l\'interface en petits composants réutilisables',
      'Utilisez les hooks React pour une meilleure organisation du code',
      'Évitez les rendus inutiles avec useMemo et useCallback',
      'Préférez les composants fonctionnels aux composants de classe',
      'Gardez l\'état au niveau le plus bas possible dans l\'arborescence des composants'
    ],
    python: [
      'Suivez les conventions PEP 8 pour la lisibilité',
      'Utilisez des noms de variables en snake_case',
      'Préférez les list comprehensions aux boucles for simples',
      'Utilisez les docstrings pour documenter les fonctions et classes',
      'Gérez les exceptions de manière spécifique'
    ]
  };

  results.bestPractices = languageBestPractices[language] || languageBestPractices.javascript;

  // Calcul du score
  const maxScore = 100;
  const penalty = 8 * results.suggestions.length;
  results.score = Math.max(0, maxScore - penalty);
  
  // Limiter le nombre de suggestions à 5
  results.suggestions = results.suggestions.slice(0, 5);

  return results;
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { code, language } = body;
    
    if (!code) {
      return NextResponse.json({ error: 'Le code à analyser est manquant' }, { status: 400 });
    }
    
    // Utiliser un langage par défaut si non spécifié
    const codeLanguage = language || 'javascript';
    
    // Effectuer l'analyse du code
    // Dans une implémentation réelle, vous pourriez appeler une API d'IA ici
    const analysisResults = analyzeCodeWithLanguageRules(code, codeLanguage);
    
    return NextResponse.json(analysisResults);
  } catch (error) {
    console.error('Erreur dans l\'API d\'analyse de code:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'analyse du code' }, { status: 500 });
  }
}

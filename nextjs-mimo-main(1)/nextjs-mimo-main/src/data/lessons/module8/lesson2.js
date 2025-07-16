// src/data/lessons/module8/lesson2.js
const lesson2 = { // Nom de l'objet corrigé
  id: '8-2',
  title: 'Traduction Avancée et Validation de Formulaires Multilingues',
  description: 'Approfondissez la traduction en gérant la validation de formulaires et les messages d\'erreur de manière multilingue avec Next.js et une bibliothèque i18n.',
  difficulty: 'intermédiaire',
  duration: 50, // Durée augmentée
  tags: ['Next.js', 'i18n', 'Validation', 'Formulaires', 'next-intl'],
  prerequisites: ['8-1', '4-2'], // Dépend de l'intro i18n et de Formik/Yup (ou gestion de formulaires)
  content: `
    <h2>Traduction Avancée pour Formulaires et Validation</h2>
    <p>Au-delà de la simple traduction de contenu statique, l'internationalisation des formulaires est cruciale. Cela inclut la traduction des libellés (labels), des placeholders, et surtout des messages de validation et d'erreur.</p>
    <p>En utilisant une bibliothèque i18n comme <code>next-intl</code> (introduite dans la leçon précédente), nous pouvons facilement récupérer les chaînes traduites pour nos messages d'erreur.</p>

    <h3>Principes de Validation Multilingue</h3>
    <ol>
      <li><strong>Clés de Traduction pour Erreurs :</strong> Définissez des clés uniques pour chaque type d'erreur de validation dans vos fichiers de messages (ex: <code>form.errors.name.required</code>, <code>form.errors.email.invalid</code>).</li>
      <li><strong>Logique de Validation :</strong> Votre logique de validation (côté client ou serveur) doit retourner ces clés de traduction plutôt que des messages en dur.</li>
      <li><strong>Affichage Traduit :</strong> Dans votre composant de formulaire, utilisez la fonction <code>t()</code> (fournie par <code>useTranslations</code>) pour afficher le message d'erreur correspondant à la clé, dans la langue active.</li>
    </ol>
    
    <h4>Exemple de Structure de Messages pour la Validation</h4>
    <pre><code class="language-json">// messages/fr.json (extrait)
{
  "FormValidation": {
    "common": {
      "required": "Ce champ est requis.",
      "minLength": "Ce champ doit contenir au moins {count, plural, =0 {0 caractère} one {1 caractère} other {{count} caractères}}.",
      "maxLength": "Ce champ ne doit pas dépasser {count} caractères."
    },
    "email": {
      "invalid": "Veuillez saisir une adresse email valide."
    },
    "password": {
      "weak": "Le mot de passe est trop faible."
    },
    "name": {
      // Peut utiliser common.required, ou être spécifique
      "required": "Veuillez indiquer votre nom." 
    }
  }
}</code></pre>
    <p>Notez l'utilisation de variables (<code>{count}</code>) et de la syntaxe de pluriel ICU, que de nombreuses bibliothèques i18n supportent.</p>

    <h3>Intégration avec des Bibliothèques de Validation (Ex: Yup)</h3>
    <p>Si vous utilisez une bibliothèque de validation comme Yup (vue dans le Module 4), vous pouvez personnaliser les messages d'erreur pour qu'ils utilisent vos clés de traduction.</p>
    <pre><code class="language-javascript">// Exemple avec Yup et next-intl (conceptuel)
import * as Yup from 'yup';
// Supposons que 't' est disponible ou passé à la fonction de schéma

const getSignupValidationSchema = (t) => Yup.object().shape({
  email: Yup.string()
    .email(t('FormValidation.email.invalid'))
    .required(t('FormValidation.common.required')),
  name: Yup.string()
    .min(2, ({ min }) => t('FormValidation.common.minLength', { count: min }))
    .required(t('FormValidation.name.required')),
  // ... autres champs
});

// Dans votre composant Formik:
// const t = useTranslations();
// const validationSchema = getSignupValidationSchema(t);
// <Formik validationSchema={validationSchema} ... >
</code></pre>
  `,
  example: {
    title: 'Formulaire de Contact avec Validation Multilingue (utilisant `next-intl`)',
    code: `// components/ContactForm.jsx
'use client';
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

// Simule une soumission de formulaire
async function submitForm(data) {
  console.log('Données soumises:', data);
  return new Promise(resolve => setTimeout(() => resolve({ success: true }), 1000));
}

export default function ContactForm() {
  const t = useTranslations('ContactForm'); // Namespace pour ce formulaire

  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle, sending, success, error

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Optionnel: effacer l'erreur du champ en cours de modification
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = t('validation.name.required');
    } else if (formData.name.trim().length < 2) {
      newErrors.name = t('validation.name.minLength', { min: 2 });
    }

    if (!formData.email.trim()) {
      newErrors.email = t('validation.email.required');
    } else if (!/\\S+@\\S+\\.\\S+/.test(formData.email)) {
      newErrors.email = t('validation.email.invalid');
    }

    if (!formData.message.trim()) {
      newErrors.message = t('validation.message.required');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setStatus('sending');
    try {
      await submitForm(formData);
      setStatus('success');
      setFormData({ name: '', email: '', message: '' }); // Réinitialiser le formulaire
    } catch (err) {
      setStatus('error');
      // Optionnel: afficher une erreur globale de soumission
      // setErrors(prev => ({ ...prev, form: t('validation.form.submitError') }));
    }
  };

  if (status === 'success') {
    return <p style={{ color: 'green' }}>{t('status.success')}</p>;
  }

  return (
    <form onSubmit={handleSubmit} noValidate style={{ maxWidth: '500px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="name" style={{ display: 'block', marginBottom: '0.25rem' }}>{t('labels.name')}</label>
        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} style={inputStyle(errors.name)} />
        {errors.name && <p style={errorStyle}>{errors.name}</p>}
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="email" style={{ display: 'block', marginBottom: '0.25rem' }}>{t('labels.email')}</label>
        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} style={inputStyle(errors.email)} />
        {errors.email && <p style={errorStyle}>{errors.email}</p>}
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="message" style={{ display: 'block', marginBottom: '0.25rem' }}>{t('labels.message')}</label>
        <textarea id="message" name="message" value={formData.message} onChange={handleChange} rows="4" style={inputStyle(errors.message)} />
        {errors.message && <p style={errorStyle}>{errors.message}</p>}
      </div>

      {status === 'error' && <p style={{...errorStyle, marginBottom: '1rem'}}>{t('status.error')}</p>}

      <button type="submit" disabled={status === 'sending'} style={submitButtonStyle}>
        {status === 'sending' ? t('buttons.sending') : t('buttons.submit')}
      </button>
    </form>
  );
}

const inputStyle = (hasError) => ({
  width: '100%',
  padding: '0.5rem',
  border: hasError ? '1px solid red' : '1px solid #ccc',
  borderRadius: '4px',
  boxSizing: 'border-box'
});
const errorStyle = { color: 'red', fontSize: '0.875rem', marginTop: '0.25rem' };
const submitButtonStyle = { padding: '0.75rem 1.5rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };

/*
Exemple de fichiers de messages:
// messages/en.json
{
  "ContactForm": {
    "labels": {
      "name": "Your Name",
      "email": "Your Email",
      "message": "Your Message"
    },
    "validation": {
      "name": {
        "required": "Name is required.",
        "minLength": "Name must be at least {min} characters."
      },
      "email": {
        "required": "Email is required.",
        "invalid": "Please enter a valid email address."
      },
      "message": {
        "required": "Message cannot be empty."
      },
      "form": {
        "submitError": "An error occurred while submitting the form. Please try again."
      }
    },
    "buttons": {
      "submit": "Send Message",
      "sending": "Sending..."
    },
    "status": {
      "success": "Thank you! Your message has been sent successfully.",
      "error": "Oops! Something went wrong. Please try again later."
    }
  }
}
// messages/fr.json (similaire, mais en français)
*/`,
    explanation: 'Ce formulaire de contact utilise `useTranslations` de `next-intl` pour obtenir les libellés et les messages d\'erreur traduits. La fonction `validate` retourne des clés de traduction qui sont ensuite utilisées pour afficher les messages appropriés dans la langue de l\'utilisateur.'
  },
  exercise: {
    title: 'Créer des Validateurs de Formulaire Multilingues Réutilisables',
    description: 'Créez un ensemble de fonctions de validation réutilisables (ex: pour le nom, email, mot de passe) qui acceptent la fonction `t` de `next-intl` (ou une fonction similaire) et un objet de configuration pour retourner des messages d\'erreur traduits.',
    initialCode: `// utils/validators.js

// Exemple de fonction de validation pour un champ requis
export function validateRequired(value, fieldName, t) {
  // t est la fonction de traduction (ex: de useTranslations('FormValidation'))
  // fieldName est une clé pour un message plus spécifique si besoin, ex: t(\`\${fieldName}.required\`)
  if (!value || (typeof value === 'string' && !value.trim())) {
    return t('common.required', { field: fieldName }); // Ex: "Le champ Nom est requis"
  }
  return null; // Pas d'erreur
}

export function validateMinLength(value, min, fieldName, t) {
  // TODO: Implémenter la validation de longueur minimale.
  // Retourner t('common.minLength', { field: fieldName, count: min }) si erreur.
  return null;
}

export function validateEmailFormat(email, fieldName, t) {
  // TODO: Implémenter la validation du format email.
  // Utiliser une regex. Retourner t('email.invalid', { field: fieldName }) si erreur.
  return null;
}

// Dans votre composant de formulaire :
// import { useTranslations } from 'next-intl';
// import { validateRequired, validateMinLength } from './validators';
//
// function MyForm() {
//   const tValidation = useTranslations('FormValidation'); // Namespace pour les erreurs de validation
//   const [nameError, setNameError] = useState(null);
//
//   const handleNameChange = (e) => {
//     const error = validateRequired(e.target.value, tValidation('fields.name'), tValidation) || 
//                   validateMinLength(e.target.value, 3, tValidation('fields.name'), tValidation);
//     setNameError(error);
//   };
//   // ...
// }

// Fichiers de messages (ex: messages/en.json)
// {
//   "FormValidation": {
//     "fields": {
//       "name": "Name",
//       "email": "Email"
//     },
//     "common": {
//       "required": "{field} is required.",
//       "minLength": "{field} must be at least {count} characters."
//     },
//     "email": {
//       "invalid": "Invalid email format for {field}."
//     }
//   }
// }
`,
    solution: `// utils/validators.js

/**
 * Valide si une valeur est fournie.
 * @param {*} value - La valeur à valider.
 * @param {string} fieldDisplayName - Le nom du champ affiché à l'utilisateur (déjà traduit).
 * @param {function} t - La fonction de traduction de next-intl (ou similaire).
 * @param {string} namespace - (Optionnel) Le namespace i18n pour les messages d'erreur communs.
 * @returns {string|null} Le message d'erreur traduit ou null s'il n'y a pas d'erreur.
 */
export function validateRequired(value, fieldDisplayName, t, namespace = 'FormValidation.common') {
  if (value === null || value === undefined || (typeof value === 'string' && !value.trim())) {
    // Ex: t('FormValidation.common.required', { field: "Nom d'utilisateur" })
    return t(\`\${namespace}.required\`, { field: fieldDisplayName });
  }
  return null;
}

/**
 * Valide la longueur minimale d'une chaîne.
 * @param {string} value - La chaîne à valider.
 * @param {number} min - La longueur minimale requise.
 * @param {string} fieldDisplayName - Le nom du champ affiché.
 * @param {function} t - La fonction de traduction.
 * @param {string} namespace - (Optionnel) Le namespace i18n.
 * @returns {string|null}
 */
export function validateMinLength(value, min, fieldDisplayName, t, namespace = 'FormValidation.common') {
  if (typeof value === 'string' && value.trim().length > 0 && value.trim().length < min) {
    // Ex: t('FormValidation.common.minLength', { field: "Mot de passe", count: 8 })
    return t(\`\${namespace}.minLength\`, { field: fieldDisplayName, count: min });
  }
  return null;
}

/**
 * Valide le format d'une adresse email.
 * @param {string} email - L'email à valider.
 * @param {string} fieldDisplayName - Le nom du champ affiché.
 * @param {function} t - La fonction de traduction.
 * @param {string} namespace - (Optionnel) Le namespace i18n.
 * @returns {string|null}
 */
export function validateEmailFormat(email, fieldDisplayName, t, namespace = 'FormValidation.email') {
  if (typeof email === 'string' && email.trim().length > 0) {
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      // Ex: t('FormValidation.email.invalid', { field: "Adresse Email" })
      return t(\`\${namespace}.invalid\`, { field: fieldDisplayName });
    }
  }
  return null;
}

/**
 * Valide si deux valeurs sont identiques (ex: confirmation de mot de passe).
 * @param {*} value1
 * @param {*} value2
 * @param {string} field1DisplayName
 * @param {string} field2DisplayName
 * @param {function} t
 * @param {string} namespace
 * @returns {string|null}
 */
export function validateMatch(value1, value2, field1DisplayName, field2DisplayName, t, namespace = 'FormValidation.common') {
  if (value1 !== value2) {
    return t(\`\${namespace}.match\`, { field1: field1DisplayName, field2: field2DisplayName });
    // Ex: "Le champ Confirmation du mot de passe doit correspondre au champ Mot de passe."
  }
  return null;
}


// Exemple d'utilisation dans un composant:
// import { useTranslations } from 'next-intl';
// import { validateRequired, validateMinLength, validateEmailFormat } from './validators';
// import { useState } from 'react';

// function MyForm() {
//   const tFV = useTranslations('FormValidation'); // Namespace pour les erreurs de validation
//   const tFields = useTranslations('FormFields'); // Namespace pour les libellés des champs

//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [errors, setErrors] = useState({});

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const currentErrors = {};
    
//     currentErrors.name = 
//       validateRequired(name, tFields('name'), tFV) || 
//       validateMinLength(name, 3, tFields('name'), tFV);

//     currentErrors.email = 
//       validateRequired(email, tFields('email'), tFV) ||
//       validateEmailFormat(email, tFields('email'), tFV);
    
//     // Filtrer les erreurs nulles
//     const finalErrors = Object.fromEntries(Object.entries(currentErrors).filter(([_, v]) => v != null));
//     setErrors(finalErrors);

//     if (Object.keys(finalErrors).length === 0) {
//       console.log("Formulaire valide!", { name, email });
//       // Soumettre le formulaire
//     } else {
//       console.log("Erreurs de validation:", finalErrors);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <div>
//         <label>{tFields('name')}</label>
//         <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
//         {errors.name && <p style={{color: 'red'}}>{errors.name}</p>}
//       </div>
//       <div>
//         <label>{tFields('email')}</label>
//         <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
//         {errors.email && <p style={{color: 'red'}}>{errors.email}</p>}
//       </div>
//       <button type="submit">Envoyer</button>
//     </form>
//   );
// }

// Fichiers de messages (ex: messages/fr.json)
// {
//   "FormFields": {
//     "name": "Nom",
//     "email": "Adresse Email",
//     "password": "Mot de passe"
//   },
//   "FormValidation": {
//     "common": {
//       "required": "Le champ {field} est requis.",
//       "minLength": "Le champ {field} doit contenir au moins {count} caractères.",
//       "match": "Le champ {field1} doit correspondre au champ {field2}."
//     },
//     "email": {
//       "invalid": "Le format du champ {field} est invalide."
//     }
//   }
// }
`,
  },
  quiz: { /* ... (quiz existant est bon) ... */
    title: 'Quiz sur la Validation Multilingue de Formulaires',
    questions: [
      {
        question: 'Quelle est la meilleure approche pour gérer les messages d\'erreur de validation dans une application multilingue ?',
        options: [
          'Coder en dur les messages d\'erreur directement dans la logique de validation.',
          'Utiliser des clés de traduction dans la logique de validation et résoudre ces clés en messages traduits au moment de l\'affichage.',
          'Afficher les messages d\'erreur uniquement dans la langue par défaut de l\'application.',
          'Ne pas afficher de messages d\'erreur, mais seulement indiquer les champs invalides visuellement.'
        ],
        correctAnswer: 'Utiliser des clés de traduction dans la logique de validation et résoudre ces clés en messages traduits au moment de l\'affichage.',
        explanation: 'Cette approche sépare la logique de validation des messages traduits, facilitant la maintenance et l\'ajout de nouvelles langues.'
      },
      {
        question: 'Pourquoi est-il généralement recommandé de valider les données du formulaire à la fois côté client et côté serveur ?',
        options: [
          'La validation côté client est suffisante pour la sécurité.',
          'La validation côté serveur est uniquement pour améliorer l\'UX.',
          'La validation côté client améliore l\'UX avec un retour immédiat, tandis que la validation côté serveur est essentielle pour la sécurité et l\'intégrité des données.',
          'Il n\'est pas nécessaire de valider des deux côtés si une bibliothèque de validation robuste est utilisée.'
        ],
        correctAnswer: 'La validation côté client améliore l\'UX avec un retour immédiat, tandis que la validation côté serveur est essentielle pour la sécurité et l\'intégrité des données.',
        explanation: 'La validation côté client peut être contournée, donc la validation côté serveur est indispensable pour la sécurité. La validation côté client offre une meilleure expérience utilisateur.'
      },
      {
        question: "Si vous utilisez une bibliothèque i18n comme `next-intl`, comment pouvez-vous passer des variables (ex: une longueur minimale) à vos messages d'erreur traduits ?",
        options: [
          "Ce n'est pas possible, les messages d'erreur doivent être statiques.",
          "En concaténant les variables directement dans le code JavaScript avant d'appeler la fonction de traduction.",
          "En utilisant la syntaxe d'interpolation de la bibliothèque i18n dans les chaînes de traduction (ex: \"{count} caractères requis\") et en passant un objet de valeurs à la fonction de traduction.",
          "En créant une version différente du message pour chaque valeur possible de la variable."
        ],
        correctAnswer: 'En utilisant la syntaxe d\'interpolation de la bibliothèque i18n dans les chaînes de traduction (ex: `"{count} caractères requis"`) et en passant un objet de valeurs à la fonction de traduction.',
        explanation: 'La plupart des bibliothèques i18n supportent l\'interpolation de variables (souvent avec la syntaxe ICU MessageFormat) pour des messages dynamiques et traduisibles.'
      }
    ]
  },
  project: { /* ... (projet existant est bon) ... */
    title: 'Formulaire d\'Inscription Multilingue Avancé',
    description: 'Créez un formulaire d\'inscription complet avec plusieurs champs, une validation multilingue robuste, et des messages d\'erreur dynamiques traduits. Utilisez `next-intl` (ou une alternative) et une bibliothèque de gestion de formulaires comme Formik avec Yup (ou React Hook Form).',
    requirements: [
      'Le formulaire doit supporter au moins deux langues (ex: anglais, français).',
      'Champs requis : Nom d\'utilisateur, Email, Mot de passe, Confirmation du mot de passe, Âge (nombre), Acceptation des conditions (case à cocher).',
      'Validation pour chaque champ (ex: nom d\'utilisateur unique (simulé), email valide, mot de passe complexe, âge minimum, confirmation de mot de passe correspondante, conditions acceptées).',
      'Tous les messages d\'erreur et libellés doivent être traduits et provenir de fichiers de messages i18n.',
      'Les messages d\'erreur doivent pouvoir inclure des variables (ex: "L\'âge doit être supérieur à {minAge} ans").',
      'Bonne expérience utilisateur avec un retour clair sur la validation.',
      'Utilisation d\'un sélecteur de langue pour changer la langue du formulaire.'
    ],
    tips: [
      'Structurez vos fichiers de messages i18n par namespace (ex: `forms`, `validation`).',
      'Créez des fonctions de validation réutilisables qui prennent la fonction `t` en argument.',
      'Si vous utilisez Yup avec Formik, configurez Yup pour utiliser vos clés de traduction pour les messages d\'erreur.',
      'Pensez à la localisation des formats pour les nombres (ex: l\'âge) si vous les affichez ou manipulez au-delà de la simple saisie.',
      'Testez minutieusement le formulaire dans chaque langue supportée.'
    ],
    bonus: [
      "Implémentez une validation asynchrone (ex: vérifier si un nom d'utilisateur est déjà pris en simulant un appel API).",
      "Ajoutez des info-bulles ou des aides traduites pour certains champs complexes.",
      "Adaptez les règles de validation elles-mêmes en fonction de la locale si nécessaire (ex: format de code postal différent par pays)."
    ]
  },
  hasExercise: true, // Ajouté, car l'exercice a été amélioré
  hasQuiz: true,
  hasProject: true,
};

export default lesson2;
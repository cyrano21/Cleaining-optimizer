// src/data/lessons/module4/lesson2.js
const lesson2 = {
  id: '4-2',
  title: 'Gestion des formulaires avec Formik et Yup',
  description: 'Apprenez à créer, valider et soumettre des formulaires complexes en React avec les bibliothèques Formik et Yup.',
  difficulty: 'intermédiaire',
  duration: 50,
  tags: ['React', 'Formulaires', 'Validation', 'Formik', 'Yup'],
  prerequisites: ['3-1', '4-1'], // Dépend des composants React et potentiellement useReducer pour des formulaires très complexes
  content: [
    {
      type: 'text',
      content: `## Introduction à la gestion de formulaires en React

La gestion des formulaires en React peut devenir fastidieuse : suivi des valeurs des champs, gestion de la soumission, validation et affichage des erreurs. Des bibliothèques comme Formik et Yup simplifient grandement ce processus.`
    },
    {
      type: 'text',
      content: `### Pourquoi utiliser Formik ?

Formik est une bibliothèque populaire pour React et React Native qui vous aide à :
- Gérer l'état de votre formulaire (valeurs, erreurs, soumission).
- Gérer la soumission du formulaire (désactivation du bouton pendant la soumission, etc.).
- Faciliter la validation des champs.
- Réduire le code répétitif (boilerplate).`
    },
    {
      type: 'text',
      content: `### Intégration avec Yup pour la validation

Yup est un constructeur de schémas JavaScript pour l'analyse et la validation de valeurs. Il s'intègre parfaitement avec Formik pour définir des règles de validation de manière déclarative et puissante.`
    },
    {
      type: 'code',
      language: 'javascript',
      content: `// Exemple de schéma de validation avec Yup
import * as Yup from 'yup';

const loginValidationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Adresse email invalide')
    .required('L\\'email est requis'),
  password: Yup.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .matches(/[a-z]/, 'Doit contenir au moins une minuscule')
    .matches(/[A-Z]/, 'Doit contenir au moins une majuscule')
    .matches(/[0-9]/, 'Doit contenir au moins un chiffre')
    .required('Le mot de passe est requis'),
});`
    },
    {
      type: 'text',
      content: `### Composants principaux de Formik

Formik fournit plusieurs composants et hooks pour construire vos formulaires :
- \`<Formik />\` : Le composant principal qui englobe votre formulaire et gère son état.
- \`<Form />\` : Un wrapper autour de la balise HTML \`<form>\` qui se connecte automatiquement à Formik.
- \`<Field />\` : Un composant pour créer des champs de formulaire (input, select, textarea) connectés à Formik.
- \`<ErrorMessage />\` : Un composant pour afficher les messages d'erreur d'un champ spécifique.`
    }
  ],
  example: { /* ... (l'exemple existant est bon) ... */
    title: 'Formulaire de connexion avec Formik et Yup',
    code: `import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const LoginForm = () => {
  const initialValues = {
    email: '',
    password: '',
    rememberMe: false
  };

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email('Adresse email invalide')
      .required('L\\'email est requis'),
    password: Yup.string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
      .required('Le mot de passe est requis'),
  });

  const handleSubmit = (values, { setSubmitting, resetForm }) => {
    console.log('Soumission du formulaire:', values);
    // Simulation d'une requête API
    setTimeout(() => {
      alert(JSON.stringify(values, null, 2));
      setSubmitting(false);
      resetForm(); // Optionnel: réinitialiser le formulaire après soumission
    }, 1000);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Connexion</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, errors, touched, dirty, isValid }) => (
          <Form style={styles.form}>
            <div style={styles.formGroup}>
              <label htmlFor="email" style={styles.label}>
                Email
              </label>
              <Field
                type="email"
                name="email"
                style={{
                  ...styles.input,
                  ...(errors.email && touched.email ? styles.inputError : {})
                }}
                placeholder="votre@email.com"
                aria-invalid={errors.email && touched.email ? "true" : "false"}
              />
              <ErrorMessage name="email" component="div" style={styles.error} role="alert" />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="password" style={styles.label}>
                Mot de passe
              </label>
              <Field
                type="password"
                name="password"
                style={{
                  ...styles.input,
                  ...(errors.password && touched.password ? styles.inputError : {})
                }}
                placeholder="••••••••"
                aria-invalid={errors.password && touched.password ? "true" : "false"}
              />
              <ErrorMessage name="password" component="div" style={styles.error} role="alert" />
            </div>

            <div style={styles.checkboxGroup}>
              <Field type="checkbox" name="rememberMe" id="rememberMe" style={styles.checkbox} />
              <label htmlFor="rememberMe" style={styles.checkboxLabel}>
                Se souvenir de moi
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !dirty || !isValid}
              style={{
                ...styles.submitButton,
                ...((isSubmitting || !dirty || !isValid) ? styles.submitButtonDisabled : {})
              }}
            >
              {isSubmitting ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

// Styles (simplifiés pour la concision, gardez les styles détaillés de l'original si préféré)
const styles = {
  container: { maxWidth: '400px', margin: '40px auto', padding: '20px', boxShadow: '0 0 10px rgba(0,0,0,0.1)', borderRadius: '8px', backgroundColor: '#fff' },
  title: { textAlign: 'center', color: '#333', marginBottom: '20px' },
  form: { display: 'flex', flexDirection: 'column' },
  formGroup: { marginBottom: '15px' },
  label: { marginBottom: '5px', fontWeight: 'bold', color: '#555' },
  input: { padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem' },
  inputError: { borderColor: 'red' },
  error: { color: 'red', fontSize: '0.8rem', marginTop: '5px' },
  checkboxGroup: { display: 'flex', alignItems: 'center', marginBottom: '15px' },
  checkboxLabel: { marginLeft: '8px', color: '#555' },
  checkbox: { marginRight: '5px' },
  submitButton: { padding: '10px 15px', color: 'white', backgroundColor: '#007bff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem' },
  submitButtonDisabled: { backgroundColor: '#aaa', cursor: 'not-allowed' }
};

export default LoginForm;`,
    explanation: 'Ce composant React utilise Formik pour la structure du formulaire et Yup pour la validation des champs email et mot de passe. Il gère l\'état de soumission et affiche les messages d\'erreur.'
  },
  exercise: { /* ... (l'exercice existant est bon) ... */
    title: 'Formulaire d\'inscription complet avec Formik et Yup',
    description: 'Créez un formulaire d\'inscription avec les champs : prénom, nom, email, mot de passe, confirmation du mot de passe, et une case à cocher pour accepter les termes. Implémentez une validation robuste avec Yup.',
    initialCode: `// components/SignupForm.js
import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const SignupForm = () => {
  const initialValues = {
    // TODO: Définir les valeurs initiales pour:
    // firstName, lastName, email, password, confirmPassword, acceptTerms (boolean)
  };

  const validationSchema = Yup.object().shape({
    // TODO: Définir le schéma de validation avec Yup pour:
    // firstName: requis, min 2 caractères
    // lastName: requis, min 2 caractères
    // email: requis, format email valide
    // password: requis, min 8 caractères, doit contenir au moins une majuscule, une minuscule, un chiffre
    // confirmPassword: requis, doit correspondre au champ password
    // acceptTerms: requis, doit être true
  });

  const handleSubmit = (values, { setSubmitting, resetForm }) => {
    console.log('Données du formulaire d\'inscription:', values);
    // Simuler une requête API
    setTimeout(() => {
      alert('Inscription réussie! (Simulation)');
      setSubmitting(false);
      resetForm();
    }, 1000);
  };

  // TODO: Construire le JSX du formulaire en utilisant les composants Formik
  // (Form, Field, ErrorMessage) et les styles fournis ou les vôtres.
  return (
    <div>
      <h2>Inscription</h2>
      {/* Structure Formik ici */}
    </div>
  );
};

// Styles suggérés (vous pouvez les adapter)
const styles = {
  // ... (styles similaires à l'exemple de LoginForm) ...
};

export default SignupForm;`,
    solution: `// components/SignupForm.js
import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const SignupForm = () => {
  const initialValues = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  };

  const validationSchema = Yup.object().shape({
    firstName: Yup.string()
      .min(2, 'Le prénom doit contenir au moins 2 caractères')
      .max(50, 'Le prénom est trop long')
      .required('Le prénom est requis'),
    lastName: Yup.string()
      .min(2, 'Le nom doit contenir au moins 2 caractères')
      .max(50, 'Le nom est trop long')
      .required('Le nom est requis'),
    email: Yup.string()
      .email('Adresse email invalide')
      .required('L\\'email est requis'),
    password: Yup.string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
      .matches(/[a-z]/, 'Doit contenir au moins une lettre minuscule')
      .matches(/[A-Z]/, 'Doit contenir au moins une lettre majuscule')
      .matches(/[0-9]/, 'Doit contenir au moins un chiffre')
      // .matches(/[^A-Za-z0-9]/, 'Doit contenir au moins un caractère spécial') // Optionnel
      .required('Le mot de passe est requis'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Les mots de passe ne correspondent pas')
      .required('La confirmation du mot de passe est requise'),
    acceptTerms: Yup.boolean()
      .oneOf([true], 'Vous devez accepter les conditions d\'utilisation')
      .required('Vous devez accepter les conditions d\'utilisation')
  });

  const handleSubmit = (values, { setSubmitting, resetForm }) => {
    console.log('Données du formulaire d\'inscription:', values);
    setTimeout(() => {
      alert('Inscription réussie! (Simulation) Vérifiez la console pour les données.');
      setSubmitting(false);
      resetForm();
    }, 1000);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Créer un compte</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, errors, touched, dirty, isValid }) => (
          <Form style={styles.form}>
            <div style={styles.formRow}>
              <div style={{...styles.formGroup, flex: 1, marginRight: '10px'}}>
                <label htmlFor="firstName" style={styles.label}>Prénom</label>
                <Field name="firstName" type="text" style={{...styles.input, ...(errors.firstName && touched.firstName && styles.inputError)}} />
                <ErrorMessage name="firstName" component="div" style={styles.error} />
              </div>
              <div style={{...styles.formGroup, flex: 1}}>
                <label htmlFor="lastName" style={styles.label}>Nom</label>
                <Field name="lastName" type="text" style={{...styles.input, ...(errors.lastName && touched.lastName && styles.inputError)}} />
                <ErrorMessage name="lastName" component="div" style={styles.error} />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="email" style={styles.label}>Email</label>
              <Field name="email" type="email" style={{...styles.input, ...(errors.email && touched.email && styles.inputError)}} />
              <ErrorMessage name="email" component="div" style={styles.error} />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="password" style={styles.label}>Mot de passe</label>
              <Field name="password" type="password" style={{...styles.input, ...(errors.password && touched.password && styles.inputError)}} />
              <ErrorMessage name="password" component="div" style={styles.error} />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="confirmPassword" style={styles.label}>Confirmer le mot de passe</label>
              <Field name="confirmPassword" type="password" style={{...styles.input, ...(errors.confirmPassword && touched.confirmPassword && styles.inputError)}} />
              <ErrorMessage name="confirmPassword" component="div" style={styles.error} />
            </div>
            
            <div style={{...styles.formGroup, ...styles.checkboxContainer}}>
              <Field name="acceptTerms" type="checkbox" id="acceptTerms" style={styles.checkboxInput} />
              <label htmlFor="acceptTerms" style={styles.checkboxLabel}>
                J'accepte les <a href="/terms" target="_blank" style={styles.link}>conditions d'utilisation</a>.
              </label>
              <ErrorMessage name="acceptTerms" component="div" style={{...styles.error, marginTop: '0px'}} />
            </div>

            <button type="submit" disabled={isSubmitting || !dirty || !isValid} style={{...styles.submitButton, ...((isSubmitting || !dirty || !isValid) && styles.submitButtonDisabled)}}>
              {isSubmitting ? 'Inscription en cours...' : 'S\'inscrire'}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

const styles = {
  container: { maxWidth: '550px', margin: '40px auto', padding: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', borderRadius: '10px', backgroundColor: '#fff', fontFamily: 'Arial, sans-serif' },
  title: { textAlign: 'center', color: '#2c3e50', marginBottom: '25px', fontSize: '1.8rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '18px' },
  formRow: { display: 'flex', gap: '15px' },
  formGroup: { display: 'flex', flexDirection: 'column' },
  label: { marginBottom: '6px', fontWeight: '600', color: '#34495e', fontSize: '0.9rem' },
  input: { padding: '12px', border: '1px solid #bdc3c7', borderRadius: '5px', fontSize: '1rem', transition: 'border-color 0.2s ease-in-out' },
  inputError: { borderColor: '#e74c3c', boxShadow: '0 0 0 0.2rem rgba(231, 76, 60, 0.25)' },
  error: { color: '#e74c3c', fontSize: '0.8rem', marginTop: '5px', minHeight: '1.2em' },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginTop: '5px' },
  checkboxInput: { marginRight: '8px', width: '16px', height: '16px', accentColor: '#3498db' },
  checkboxLabel: { color: '#34495e', fontSize: '0.9rem', cursor: 'pointer' },
  link: { color: '#3498db', textDecoration: 'none' },
  submitButton: { padding: '12px 20px', color: 'white', backgroundColor: '#3498db', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold', transition: 'background-color 0.2s ease' },
  submitButtonDisabled: { backgroundColor: '#a9d6f5', cursor: 'not-allowed' }
};
styles.submitButton[':hover'] = { backgroundColor: '#2980b9' };


export default SignupForm;`,
    tasks: [
      'Définir les `initialValues` pour tous les champs du formulaire.',
      'Construire le `validationSchema` avec Yup, incluant la validation de correspondance pour les mots de passe et la case à cocher obligatoire.',
      'Implémenter la fonction `handleSubmit` pour simuler une soumission.',
      'Utiliser les composants `<Formik>`, `<Form>`, `<Field>`, et `<ErrorMessage>` pour afficher le formulaire et les erreurs.',
      'Appliquer des styles pour une présentation claire et conviviale.'
    ]
  },
  quiz: { /* ... (quiz existant est bon) ... */
    title: 'Quiz sur les formulaires avec Formik et Yup',
    questions: [
      {
        question: 'Quel est l\'avantage principal d\'utiliser Formik pour gérer les formulaires en React ?',
        options: [
          'Formik est la seule façon de créer des formulaires en React.',
          'Il réduit la quantité de code répétitif et simplifie la gestion de l\'état, la validation et la soumission des formulaires.',
          'Il améliore automatiquement les performances de rendu de tous les formulaires.',
          'Il remplace le besoin d\'écrire du HTML pour les formulaires.'
        ],
        correctAnswer: 'Il réduit la quantité de code répétitif et simplifie la gestion de l\'état, la validation et la soumission des formulaires.',
        explanation: 'Formik abstrait une grande partie de la complexité liée à la gestion des formulaires, ce qui permet aux développeurs de se concentrer sur la logique métier.'
      },
      {
        question: 'Comment définir une règle de validation avec Yup pour qu\'un champ "email" soit une chaîne de caractères, un email valide et requis ?',
        options: [
          'Yup.string().email().required()',
          'Yup.email().string().required()',
          'Yup.required().email().string()',
          'Yup.string().validEmail().mandatory()'
        ],
        correctAnswer: 'Yup.string().email().required()',
        explanation: 'Avec Yup, vous chaînez les validateurs. `string()` définit le type, `email()` valide le format email, et `required()` s\'assure que le champ n\'est pas vide.'
      },
      {
        question: 'Dans `<Formik />`, quelle prop est utilisée pour passer le schéma de validation Yup ?',
        options: [
          'yupSchema',
          'schema',
          'validationSchema',
          'validateWithYup'
        ],
        correctAnswer: 'validationSchema',
        explanation: 'La prop `validationSchema` du composant `<Formik />` accepte un schéma Yup pour valider les valeurs du formulaire.'
      }
    ]
  },
  project: { /* ... (projet existant est bon) ... */
    title: 'Application de gestion de contacts avec formulaires avancés',
    description: 'Créez une application CRUD complète pour gérer une liste de contacts. Utilisez Formik et Yup pour les formulaires d\'ajout et de modification de contacts, avec une validation robuste.',
    requirements: [
      'Formulaire pour ajouter un nouveau contact (nom, prénom, email, téléphone, adresse) avec validation complète via Yup.',
      'Formulaire pour modifier un contact existant, pré-rempli avec les données du contact.',
      'Affichage de la liste des contacts.',
      'Fonctionnalité de suppression d\'un contact (avec confirmation).',
      'Recherche/filtrage des contacts par nom ou email.',
      'Stockage des données dans le `localStorage` ou une API factice (ex: JSON Server).',
      'Interface utilisateur claire et réactive.'
    ],
    tips: [
      'Structurez votre application avec des composants réutilisables (ex: `ContactForm`, `ContactList`, `ContactItem`).',
      'Utilisez un état global (Context API ou `useReducer` au niveau parent) pour gérer la liste des contacts si vous n\'utilisez pas de solution de gestion d\'état plus avancée.',
      'Pensez à la gestion des ID uniques pour chaque contact.',
      'Fournissez des retours visuels clairs à l\'utilisateur lors des actions (ajout, modification, suppression, chargement).',
      'Optimisez les performances de la liste des contacts avec `React.memo` pour les `ContactItem` si nécessaire.'
    ],
    bonus: [
      'Ajoutez la possibilité d\'importer/exporter des contacts (CSV ou JSON).',
      'Implémentez la pagination ou le chargement infini pour les longues listes de contacts.',
      'Permettez de grouper les contacts par catégorie ou d\'ajouter des étiquettes.',
      'Créez une vue détaillée pour chaque contact affichant toutes ses informations.',
      'Intégrez une bibliothèque de notifications (ex: `react-toastify`) pour les messages de succès/erreur.'
    ]
  }
};

export default lesson2;
// src/data/lessons/module5/lesson3.js
const lesson3 = {
  id: '5-3',
  title: 'Frontend du Blog : Création et Édition d\'Articles avec Formik/Yup',
  description: 'Implémentez les formulaires pour créer de nouveaux articles de blog et modifier les articles existants, en utilisant Formik pour la gestion et Yup pour la validation. Gérez les états de soumission, les indicateurs de chargement et les retours API de manière robuste.',
  difficulty: 'avancé',
  duration: 120,
  tags: ['Next.js', 'Projet', 'Blog', 'Frontend', 'React', 'Formulaires', 'Formik', 'Yup', 'API', 'Error Handling', 'UX'],
  prerequisites: ['5-2', '4-2'], // Affichage frontend (5-2), Formik/Yup (4-2)
  content: `
    <h2>Création et Édition d'Articles : Formulaires Frontend Robustes</h2>
    <p>Nous allons maintenant construire les formulaires React qui permettront aux utilisateurs de créer et de modifier les articles de notre blog. Pour cela, nous utiliserons <strong>Formik</strong> pour une gestion d'état de formulaire simplifiée et <strong>Yup</strong> pour une validation déclarative des données, comme exploré dans le Module 4.</p>
    <p>Une attention particulière sera portée à l'expérience utilisateur (UX) :</p>
    <ul>
      <li>Affichage clair des erreurs de validation.</li>
      <li>Gestion des états de soumission (indicateurs de chargement).</li>
      <li>Retours informatifs après les interactions avec l'API (succès ou erreurs serveur).</li>
    </ul>
    <p>Les formulaires interagiront avec nos API Routes : <code>POST /api/posts</code> pour la création et <code>PUT /api/posts/[id]</code> pour la modification.</p>

    <h3>1. Page de Création d'un Nouvel Article (<code>pages/blog/new.js</code>)</h3>
    <p>Cette page hébergera le formulaire de création. Elle guidera l'utilisateur dans la saisie du titre, de l'auteur (optionnel), et du contenu. Les erreurs de validation seront affichées au fil de la saisie ou à la soumission. Un indicateur de chargement sera visible pendant l'envoi des données à l'API.</p>
    
    <h4>Implémentation Détaillée :</h4>
    <pre><code class="language-javascript">// pages/blog/new.js
import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

// Définir l'URL de base de l'API (peut être dans .env.local)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Schéma de validation avec Yup
const NewPostSchema = Yup.object().shape({
  title: Yup.string()
    .min(5, 'Le titre doit comporter au moins 5 caractères.')
    .max(100, 'Le titre ne doit pas dépasser 100 caractères.')
    .required('Le titre est un champ obligatoire.'),
  author: Yup.string()
    .max(50, 'Le nom de l\\\\'auteur ne doit pas dépasser 50 caractères.'), // Champ optionnel
  content: Yup.string()
    .min(20, 'Le contenu doit comporter au moins 20 caractères.')
    .required('Le contenu de l\\\\'article est obligatoire.'),
});

export default function NewPostPage() {
  const router = useRouter();

  const handleSubmit = async (values, { setSubmitting, setStatus, resetForm, setFieldError }) => {
    setSubmitting(true); // Active l'état de soumission (pour désactiver le bouton, afficher spinner)
    setStatus(undefined); // Réinitialise les messages de statut précédents (succès/erreur globale)

    try {
      const response = await fetch(\\\`\\\${API_BASE_URL}/api/posts\\\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const responseData = await response.json().catch(() => {
        // Gérer le cas où la réponse n'est pas un JSON valide
        // (peut arriver pour des erreurs serveur non gérées par l'API)
        return { message: "Réponse invalide du serveur." };
      });

      if (!response.ok) {
        // Si l'API retourne des erreurs spécifiques aux champs (ex: statut 422)
        if (response.status === 422 && responseData.errors && typeof responseData.errors === 'object') {
          Object.keys(responseData.errors).forEach(key => {
            setFieldError(key, responseData.errors[key]); // Affiche l'erreur sous le champ concerné
          });
          // Message d'erreur global pour guider l'utilisateur
          setStatus({ error: responseData.message || "Veuillez corriger les erreurs indiquées." });
        } else {
          // Erreur API plus générique
          throw new Error(responseData.message || \\\`Erreur HTTP \\\${response.status} lors de la création.\\\`);
        }
        setSubmitting(false); // Réactiver le bouton si l'erreur n'est pas fatale pour le formulaire
        return; // Arrêter le processus ici
      }

      // Succès de la création
      setStatus({ success: \\\`L'article "\\\${responseData.title}" a été créé avec succès ! Redirection en cours...\\\` });
      resetForm(); // Vider le formulaire
      
      // Rediriger vers la page du nouvel article après un court délai pour que l'utilisateur voie le message de succès
      setTimeout(() => {
        router.push(\\\`/blog/\\\${responseData.id}\\\`);
      }, 2000);
      // setSubmitting sera false automatiquement si le composant est démonté par la redirection

    } catch (error) {
      console.error("Erreur lors de la création de l'article:", error);
      setStatus({ error: error.message || 'Une erreur inconnue est survenue lors de la création de l\\\\'article.' });
      setSubmitting(false); // Toujours s'assurer de réactiver le bouton en cas d'erreur non gérée
    }
  };

  return (
    <div style={formPageStyle}>
      <Head>
        <title>Nouvel Article - Mon Super Blog</title>
        <meta name="description" content="Rédigez et publiez un nouvel article sur Mon Super Blog." />
      </Head>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/blog" style={linkStyle}>
          ← Retour à la liste des articles
        </Link>
      </div>
      <h1 style={formTitleStyle}>Rédiger un Nouvel Article</h1>
      
      <Formik
        initialValues={{ title: '', author: '', content: '' }}
        validationSchema={NewPostSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, status, errors, touched }) => (
          <Form noValidate> {/* noValidate pour laisser Formik/Yup gérer la validation HTML5 native */}
            {/* Affichage des messages de statut globaux (succès ou erreur API) */}
            {status && status.error && <div style={statusErrorStyle} role="alert">{status.error}</div>}
            {status && status.success && <div style={statusSuccessStyle} role="alert">{status.success}</div>}

            <div style={fieldGroupStyle}>
              <label htmlFor="title" style={labelStyle}>Titre de l'article <span style={requiredIndicatorStyle}>*</span></label>
              <Field 
                id="title" 
                name="title" 
                type="text" 
                style={inputStyle(errors.title && touched.title)} 
                aria-required="true"
                aria-invalid={errors.title && touched.title ? "true" : "false"}
                aria-describedby={errors.title && touched.title ? "title-error" : undefined}
              />
              <ErrorMessage name="title" component="div" id="title-error" style={errorMessageStyle} />
            </div>

            <div style={fieldGroupStyle}>
              <label htmlFor="author" style={labelStyle}>Votre nom (Auteur - Optionnel)</label>
              <Field 
                id="author" 
                name="author" 
                type="text" 
                style={inputStyle(errors.author && touched.author)}
                aria-invalid={errors.author && touched.author ? "true" : "false"}
                aria-describedby={errors.author && touched.author ? "author-error" : undefined}
              />
              <ErrorMessage name="author" component="div" id="author-error" style={errorMessageStyle} />
            </div>

            <div style={fieldGroupStyle}>
              <label htmlFor="content" style={labelStyle}>Contenu de l'article <span style={requiredIndicatorStyle}>*</span></label>
              <Field 
                id="content" 
                name="content" 
                as="textarea" 
                rows="12" 
                style={textareaStyle(errors.content && touched.content)} 
                aria-required="true"
                aria-invalid={errors.content && touched.content ? "true" : "false"}
                aria-describedby={errors.content && touched.content ? "content-error" : undefined}
              />
              <ErrorMessage name="content" component="div" id="content-error" style={errorMessageStyle} />
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting} 
              style={isSubmitting ? submitButtonDisabledStyle : submitButtonStyleGreen}
              aria-live="polite" // Pour annoncer le changement d'état aux lecteurs d'écran
            >
              {isSubmitting ? (
                <>
                  <span style={spinnerStyle} role="status" aria-hidden="true"></span>
                  Publication en cours...
                </>
              ) : 'Publier l\\\\'Article'}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

// Styles (pour une meilleure lisibilité et UX)
const formPageStyle = { maxWidth: '768px', margin: '2rem auto', padding: '2rem', backgroundColor: '#f9f9f9', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' };
const formTitleStyle = { fontSize: '2.2rem', color: '#333', marginBottom: '2.5rem', textAlign: 'center', fontWeight: 600 };
const fieldGroupStyle = { marginBottom: '1.8rem' };
const labelStyle = { display: 'block', marginBottom: '0.6rem', fontWeight: '500', color: '#454545', fontSize: '1rem' };
const requiredIndicatorStyle = { color: '#e74c3c', marginLeft: '0.2rem' };
const commonInputStyle = { width: '100%', padding: '0.85rem 1rem', border: '1px solid #d1d1d1', borderRadius: '6px', fontSize: '1rem', boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s' };
const inputStyle = (hasError) => ({ ...commonInputStyle, '&:focus': { borderColor: '#3498db', boxShadow: '0 0 0 0.2rem rgba(52,152,219,.25)' }, ...(hasError && { borderColor: '#e74c3c', boxShadow: '0 0 0 0.2rem rgba(231,76,60,.25)' }) });
const textareaStyle = (hasError) => ({ ...inputStyle(hasError), minHeight: '200px', resize: 'vertical', fontFamily: 'inherit' });
const errorMessageStyle = { color: '#d9534f', fontSize: '0.875rem', marginTop: '0.4rem' };
const submitButtonStyleBase = { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '0.9rem 1.5rem', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold', transition: 'background-color 0.2s, opacity 0.2s' };
const submitButtonStyleGreen = { ...submitButtonStyleBase, backgroundColor: '#28a745' }; // Vert pour la création
const submitButtonDisabledStyle = { ...submitButtonStyleBase, backgroundColor: '#95a5a6', opacity: 0.7, cursor: 'not-allowed' };
const statusMsgBaseStyle = { padding: '1rem', marginBottom: '1.5rem', borderRadius: '6px', textAlign: 'center', border: '1px solid transparent', fontSize: '0.95rem' };
const statusErrorStyle = { ...statusMsgBaseStyle, color: '#721c24', backgroundColor: '#f8d7da', borderColor: '#f5c6cb' };
const statusSuccessStyle = { ...statusMsgBaseStyle, color: '#155724', backgroundColor: '#d4edda', borderColor: '#c3e6cb' };
const linkStyle = { color: '#007bff', textDecoration: 'none', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' };
const spinnerStyle = { display: 'inline-block', width: '1.1em', height: '1.1em', verticalAlign: 'text-bottom', border: '.18em solid currentColor', borderRightColor: 'transparent', borderRadius: '50%', animation: 'form-spinner-anim .75s linear infinite', marginRight: '0.6em'};

// N'oubliez pas d'ajouter cette keyframe animation dans un fichier CSS global ou un bloc <style jsx global>
/*
@keyframes form-spinner-anim {
  to {
    transform: rotate(360deg);
  }
}
*/
    </code></pre>

    <h3>2. Page d'Édition d'un Article (<code>pages/blog/[id]/edit.js</code>)</h3>
    <p>Cette page sera très similaire à la page de création, avec la principale différence qu'elle devra d'abord charger les données de l'article existant via <code>getServerSideProps</code> pour pré-remplir le formulaire. La soumission se fera via une requête <code>PUT</code> à l'API <code>/api/posts/[id]</code>.</p>

    <h4>Implémentation Détaillée :</h4>
    <pre><code class="language-javascript">// pages/blog/[id]/edit.js
import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Le schéma de validation peut être le même que pour la création
const EditPostSchema = Yup.object().shape({
  title: Yup.string().min(5, 'Min 5 chars').max(100, 'Max 100 chars').required('Titre requis'),
  author: Yup.string().max(50, 'Max 50 chars'),
  content: Yup.string().min(20, 'Min 20 chars').required('Contenu requis'),
});

export async function getServerSideProps(context) {
  const { id } = context.params;
  try {
    const response = await fetch(\\\`\\\${API_BASE_URL}/api/posts/\\\${id}\\\`);
    if (!response.ok) {
      console.error(\\\`[EditPage] API error for post \\\${id}: \\\${response.status}\\\`);
      return { notFound: true }; // Important pour que Next.js affiche la page 404
    }
    const post = await response.json();
    return { props: { post } };
  } catch (error) {
    console.error(\\\`[EditPage] Fetch error for post \\\${id}:\\\`, error);
    // Retourner une prop d'erreur personnalisée si vous voulez l'afficher sur la page
    return { props: { post: null, error: "Impossible de charger les données de l'article pour l'édition." } };
  }
}

export default function EditPostPage({ post, error: serverError }) {
  const router = useRouter();

  if (serverError) {
     return (
      <div style={formPageStyle}>
        <Head><title>Erreur de Chargement - Mon Blog</title></Head>
        <h1 style={formTitleStyle}>Erreur de Chargement</h1>
        <p style={statusErrorStyle}>{serverError}</p>
        <Link href="/blog" style={linkStyle}>← Retour au Blog</Link>
      </div>
    );
  }
  
  // Si notFound:true a été retourné par getServerSideProps, cette page ne serait pas rendue.
  // Mais cette vérification est une sécurité supplémentaire si post est null pour une autre raison.
  if (!post) { 
    return (
      <div style={formPageStyle}>
        <Head><title>Article Non Trouvé - Mon Blog</title></Head>
        <h1 style={formTitleStyle}>Article Non Trouvé</h1>
        <p>L'article que vous essayez de modifier n'existe pas ou une erreur s'est produite.</p>
        <Link href="/blog" style={linkStyle}>← Retour au Blog</Link>
      </div>
    );
  }

  const handleSubmit = async (values, { setSubmitting, setStatus, setFieldError }) => {
    setSubmitting(true);
    setStatus(undefined);

    try {
      const response = await fetch(\\\`\\\${API_BASE_URL}/api/posts/\\\${post.id}\\\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      
      const responseData = await response.json().catch(() => ({ message: "Réponse invalide de l'API" }));

      if (!response.ok) {
        if (response.status === 422 && responseData.errors && typeof responseData.errors === 'object') {
          Object.keys(responseData.errors).forEach(key => {
            setFieldError(key, responseData.errors[key]);
          });
          setStatus({ error: responseData.message || "Veuillez corriger les erreurs." });
        } else {
          throw new Error(responseData.message || \\\`Erreur HTTP \\\${response.status} lors de la mise à jour.\\\`);
        }
        setSubmitting(false);
        return;
      }
      
      setStatus({ success: 'Article mis à jour avec succès ! Redirection...' });
      setTimeout(() => {
        router.push(\\\`/blog/\\\${post.id}\\\`);
      }, 1500);

    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'article:", error);
      setStatus({ error: error.message || 'Une erreur inconnue est survenue.' });
      setSubmitting(false);
    }
  };

  return (
    <div style={formPageStyle}>
      <Head>
        <title>Modifier : {post.title} - Mon Blog</title>
        <meta name="robots" content="noindex, nofollow" /> {/* Empêcher l'indexation des pages d'édition */}
      </Head>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href={\\\`/blog/\\\${post.id}\\\`} style={linkStyle}>← Annuler et retourner à l'article</Link>
      </div>
      <h1 style={formTitleStyle}>Modifier l'Article : <em style={{color: "#555", fontWeight: 400}}>{post.title}</em></h1>
      
      <Formik
        initialValues={{
          title: post.title || '',
          author: post.author || '',
          content: post.content || '',
        }}
        validationSchema={EditPostSchema}
        onSubmit={handleSubmit}
        enableReinitialize={true} // Important pour que les valeurs initiales se mettent à jour si 'post' change
      >
        {({ isSubmitting, status, errors, touched }) => (
          <Form noValidate>
            {status && status.error && <div style={statusErrorStyle} role="alert">{status.error}</div>}
            {status && status.success && <div style={statusSuccessStyle} role="alert">{status.success}</div>}

            <div style={fieldGroupStyle}>
              <label htmlFor="title" style={labelStyle}>Titre <span style={requiredIndicatorStyle}>*</span></label>
              <Field id="title" name="title" type="text" style={inputStyle(errors.title && touched.title)} />
              <ErrorMessage name="title" component="div" style={errorMessageStyle} />
            </div>

            <div style={fieldGroupStyle}>
              <label htmlFor="author" style={labelStyle}>Auteur</label>
              <Field id="author" name="author" type="text" style={inputStyle(errors.author && touched.author)} />
              <ErrorMessage name="author" component="div" style={errorMessageStyle} />
            </div>

            <div style={fieldGroupStyle}>
              <label htmlFor="content" style={labelStyle}>Contenu <span style={requiredIndicatorStyle}>*</span></label>
              <Field id="content" name="content" as="textarea" rows="12" style={textareaStyle(errors.content && touched.content)} />
              <ErrorMessage name="content" component="div" style={errorMessageStyle} />
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting} 
              style={isSubmitting ? submitButtonDisabledStyle : submitButtonStyleBlue}
              aria-live="polite"
            >
              {isSubmitting ? (
                <>
                  <span style={spinnerStyle} role="status" aria-hidden="true"></span>
                  Sauvegarde en cours...
                </>
              ) : 'Sauvegarder les Modifications'}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

// Styles (réutilisés et légèrement adaptés)
const formPageStyle = { maxWidth: '768px', margin: '2rem auto', padding: '2rem', backgroundColor: '#f9f9f9', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' };
const formTitleStyle = { fontSize: '2.2rem', color: '#333', marginBottom: '2.5rem', textAlign: 'center', fontWeight: 600 };
const fieldGroupStyle = { marginBottom: '1.8rem' };
const labelStyle = { display: 'block', marginBottom: '0.6rem', fontWeight: '500', color: '#454545', fontSize: '1rem' };
const requiredIndicatorStyle = { color: '#e74c3c', marginLeft: '0.2rem' };
const commonInputStyle = { width: '100%', padding: '0.85rem 1rem', border: '1px solid #d1d1d1', borderRadius: '6px', fontSize: '1rem', boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s' };
const inputStyle = (hasError) => ({ ...commonInputStyle, '&:focus': { borderColor: '#3498db', boxShadow: '0 0 0 0.2rem rgba(52,152,219,.25)' }, ...(hasError && { borderColor: '#e74c3c', boxShadow: '0 0 0 0.2rem rgba(231,76,60,.25)' }) });
const textareaStyle = (hasError) => ({ ...inputStyle(hasError), minHeight: '200px', resize: 'vertical', fontFamily: 'inherit' });
const errorMessageStyle = { color: '#d9534f', fontSize: '0.875rem', marginTop: '0.4rem' };
const submitButtonStyleBase = { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '0.9rem 1.5rem', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold', transition: 'background-color 0.2s, opacity 0.2s' };
const submitButtonStyleBlue = { ...submitButtonStyleBase, backgroundColor: '#3498db' }; // Bleu pour l'édition
const submitButtonDisabledStyle = { ...submitButtonStyleBase, backgroundColor: '#a9d6f5', opacity: 0.7, cursor: 'not-allowed' };
const statusMsgBaseStyle = { padding: '1rem', marginBottom: '1.5rem', borderRadius: '6px', textAlign: 'center', border: '1px solid transparent', fontSize: '0.95rem' };
const statusErrorStyle = { ...statusMsgBaseStyle, color: '#721c24', backgroundColor: '#f8d7da', borderColor: '#f5c6cb' };
const statusSuccessStyle = { ...statusMsgBaseStyle, color: '#155724', backgroundColor: '#d4edda', borderColor: '#c3e6cb' };
const linkStyle = { color: '#007bff', textDecoration: 'none', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' };
const spinnerStyle = { display: 'inline-block', width: '1.1em', height: '1.1em', verticalAlign: 'text-bottom', border: '.18em solid currentColor', borderRightColor: 'transparent', borderRadius: '50%', animation: 'form-spinner-anim .75s linear infinite', marginRight: '0.6em'};
// N'oubliez pas d'ajouter cette keyframe animation dans un fichier CSS global ou un bloc <style jsx global>
/*
@keyframes form-spinner-anim {
  to {
    transform: rotate(360deg);
  }
}
*/
    </code></pre>
    <p>Avec ces deux pages, les utilisateurs peuvent désormais ajouter et modifier des articles sur le blog. La gestion des états de soumission, des erreurs (y compris celles retournées par l'API pour des champs spécifiques), et la redirection améliorent significativement l'expérience utilisateur.</p>
  `,
  example: { // L'exemple sur MyFormField reste pertinent
    title: 'Composant Champ de Formulaire Réutilisable (MyFormField)',
    code: `// components/MyFormField.jsx
import React from 'react';
import { Field, ErrorMessage } from 'formik';

const groupStyle = { marginBottom: '1rem' };
const labelStyle = { display: 'block', marginBottom: '0.3rem', fontWeight: '500' };
const inputBaseStyle = { width: '100%', padding: '0.6rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem' }; // Augmenté la taille de la police
const errorMsgStyle = { color: 'crimson', fontSize: '0.85rem', marginTop: '0.2rem' };
const requiredIndicatorStyle = { color: 'crimson', marginLeft: '0.15rem' };


const MyFormField = ({ 
  name, 
  label, 
  type = 'text', 
  as = 'input', 
  rows, 
  placeholder, 
  errors, 
  touched,
  isRequired, 
  ...props 
}) => {
  const hasError = errors && touched && errors[name] && touched[name];
  const fieldSpecificStyle = {
    ...inputBaseStyle,
    ...(as === 'textarea' && { minHeight: rows ? \\\`\\\${rows * 1.75}em\\\` : '120px', resize: 'vertical' }), // Augmenté minHeight pour textarea
    ...(hasError && { borderColor: 'crimson', boxShadow: '0 0 0 0.2rem rgba(220,53,69,.25)' })
  };
  
  return (
    <div style={groupStyle}>
      <label htmlFor={name} style={labelStyle}>
        {label}
        {isRequired && <span style={requiredIndicatorStyle} aria-hidden="true">*</span>}
      </label>
      <Field
        id={name}
        name={name}
        type={type}
        as={as}
        rows={rows}
        placeholder={placeholder || label}
        style={fieldSpecificStyle}
        aria-required={isRequired ? "true" : "false"}
        aria-invalid={hasError ? "true" : "false"}
        aria-describedby={hasError ? \\\`\\\${name}-error\\\` : undefined}
        {...props}
      />
      <ErrorMessage name={name} component="div" id={\\\`\\\${name}-error\\\`} style={errorMsgStyle} role="alert" />
    </div>
  );
};

export default MyFormField;

// Utilisation dans votre formulaire Formik :
// import MyFormField from '../components/MyFormField';
// ...
// <Formik ...>
//   {({ errors, touched }) => (
//     <Form>
//       <MyFormField name="title" label="Titre de l'article" errors={errors} touched={touched} isRequired />
//       <MyFormField name="author" label="Auteur" errors={errors} touched={touched} />
//       <MyFormField name="content" label="Contenu" as="textarea" rows="10" errors={errors} touched={touched} isRequired />
//       <button type="submit">Soumettre</button>
//     </Form>
//   )}
// </Formik>
`,
    explanation: 'Créer un composant réutilisable comme `MyFormField` (avec gestion de `isRequired` pour l\\\'accessibilité et le style) peut grandement simplifier la structure de vos formulaires Formik, en encapsulant la logique du `label`, du `Field`, de l\\`ErrorMessage` et des styles de base, y compris pour les erreurs.'
  },
  exercise: { // L'exercice précédent est bon et couvre déjà ces aspects, je vais le reformuler légèrement.
    title: 'Finaliser les Formulaires de Création et d\\\'Édition avec Gestion d\\\'Erreurs API et Indicateurs de Chargement',
    description: 'Votre tâche est de vous assurer que les pages `pages/blog/new.js` et `pages/blog/[id]/edit.js` sont complètes et robustes. Cela inclut :\\n1. **Pour la page d\\\'édition (`[id]/edit.js`) :** Implémentez `getServerSideProps` pour charger les données de l\\\'article et pré-remplir le formulaire Formik.\\n2. **Pour les deux pages :** \\n    a. Implémentez la fonction `handleSubmit` pour envoyer les données à l\\\'API (POST pour `new.js`, PUT pour `edit.js`).\\n    b. Affichez un indicateur de chargement (spinner) sur le bouton de soumission lorsque `isSubmitting` est `true`.\\n    c. Gérez les réponses de l\\\'API : affichez un message de succès global et redirigez (ou réinitialisez le formulaire pour `new.js`).\\n    d. En cas d\\\'erreur API (ex: statut non-2xx), affichez un message d\\\'erreur global. Si l\\\'API retourne des erreurs spécifiques aux champs (ex: statut 422 avec un objet `errors`), utilisez `setFieldError` de Formik pour afficher ces erreurs sous les champs concernés.',
    initialCode: `// pages/blog/[id]/edit.js (Code de départ pour l'édition)
// ... importations ...
// const API_BASE_URL = ...;
// const EditPostSchema = ...;

// export async function getServerSideProps(context) { /* ... à implémenter ... */ }

export default function EditPostPage({ post, error: serverError }) {
  // ... router, gestion de serverError et !post ...

  // const handleSubmit = async (values, { setSubmitting, setStatus, setFieldError }) => {
    // TODO: Logique de soumission PUT avec gestion d'erreurs API et setFieldError
  // };

  // return ( /* ... Formik Form avec champs et bouton de soumission à modifier pour spinner ... */ );
}

// ----

// pages/blog/new.js (À modifier pour la gestion d'erreur API plus fine et spinner)
// ... importations ...
// const API_BASE_URL = ...;
// const NewPostSchema = ...;

export default function NewPostPage() {
  // ... router ...
  // const handleSubmit = async (values, { setSubmitting, setStatus, resetForm, setFieldError }) => {
    // TODO: Logique de soumission POST avec gestion d'erreurs API (setFieldError) et spinner
  // };

  // return ( /* ... Formik Form avec bouton de soumission à modifier pour spinner ... */ );
}

// Styles (à réutiliser ou définir)
// const spinnerStyle = { /* ... */ };
// @keyframes form-spinner-anim { to { transform: rotate(360deg); } }
`,
    solution: `// La solution est essentiellement le code complet des deux pages (new.js et [id]/edit.js) fourni dans la section "Contenu" de cette leçon.
// Les étudiants doivent s'assurer que:
// 1. getServerSideProps dans [id]/edit.js est correctement implémenté.
// 2. Les fonctions handleSubmit dans les deux fichiers gèrent:
//    - setSubmitting(true) au début, et setSubmitting(false) dans les clauses catch ou après des erreurs non redirigeantes.
//    - Tentent de parser response.json() même pour les erreurs afin de récupérer responseData.
//    - Utilisent setFieldError si response.status est 422 (ou autre code pour erreurs de champ) ET responseData.errors existe.
//    - Utilisent setStatus({ error: ... }) pour les erreurs API globales.
//    - Utilisent setStatus({ success: ... }) et resetForm/router.push en cas de succès.
//    - Le bouton de soumission affiche un spinner et un texte approprié quand isSubmitting est true.

// Exemple pour le bouton de soumission avec spinner (à intégrer dans les deux formulaires):
/*
<button 
  type="submit" 
  disabled={isSubmitting} 
  style={isSubmitting ? submitButtonDisabledStyle : submitButtonStyle}
  aria-live="polite"
>
  {isSubmitting ? (
    <>
      <span style={spinnerStyle} role="status" aria-hidden="true"></span>
      {/* Pour la page de création: */} Envoi en cours...
      {/* Pour la page d'édition: */} Sauvegarde...
    </>
  ) : (
    {/* Pour la page de création: */} 'Publier l\\\\'Article'
    {/* Pour la page d'édition: */} 'Sauvegarder les Modifications'
  )}
</button>
*/
`,
  },
  quiz: { // Garder le quiz pertinent
    title: 'Quiz sur les Formulaires de Création/Édition avec Formik/Yup',
    questions: [
      {
        question: 'Dans un formulaire d\\\'édition pré-rempli avec Formik, quelle prop de `<Formik>` est essentielle pour s\\\'assurer que les `initialValues` sont mises à jour si les données de la prop changent (par exemple, après une navigation ou un re-fetch) ?',
        options: ['`updateInitialValues`', '`enableReinitialize`', '`refreshValues`', '`dynamicInitialValues`'],
        correctAnswer: '`enableReinitialize`'
      },
      {
        question: 'Si votre API retourne un statut 422 (Unprocessable Entity) avec un objet JSON `{ "errors": { "email": "Cet email est déjà utilisé." } }`, quelle fonction de Formik (disponible dans le deuxième argument de `onSubmit`) utiliseriez-vous pour afficher ce message sous le champ email ?',
        options: ['`setStatus({ emailError: "..." })`', '`setErrors({ global: "..." })`', '`setFieldError("email", "Cet email est déjà utilisé.")`', '`setTouched({ email: true })`'],
        correctAnswer: '`setFieldError("email", "Cet email est déjà utilisé.")`'
      },
      {
        question: 'Quel est l\\\'objectif principal de désactiver le bouton de soumission (en utilisant la prop `isSubmitting` de Formik) pendant l\\\'envoi des données du formulaire ?',
        options: ['Pour rendre le formulaire plus joli.', 'Pour empêcher l\\\'utilisateur de soumettre le formulaire plusieurs fois accidentellement pendant que la requête est en cours.', 'Pour améliorer les performances de rendu de la page.', 'C\\\'est une convention sans impact réel.'],
        correctAnswer: 'Pour empêcher l\\\'utilisateur de soumettre le formulaire plusieurs fois accidentellement pendant que la requête est en cours.'
      }
    ]
  },
  hasExercise: true,
  hasQuiz: true,
  hasProject: false // Le projet global du module 5 couvre cela.
};

export default lesson3;
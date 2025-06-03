// Unsplash API utilities
import { createApi } from 'unsplash-js';

// Initialisation de l'API Unsplash
// Vous devrez obtenir votre propre clé d'accès sur https://unsplash.com/developers
const unsplash = createApi({
  accessKey: 'VOTRE_CLÉ_API_UNSPLASH',
});

/**
 * Récupère une image aléatoire d'Unsplash avec une requête de recherche
 * 
 * @param {string} query - Terme de recherche pour l'image
 * @param {number} width - Largeur souhaitée de l'image
 * @param {number} height - Hauteur souhaitée de l'image
 * @returns {Promise<string>} - URL de l'image
 */
export async function getRandomImage(query = '', width = 720, height = 1005) {
  try {
    const result = await unsplash.photos.getRandom({
      query,
      count: 1,
      orientation: 'portrait',
    });

    if (result.errors) {
      console.error('Erreur Unsplash:', result.errors[0]);
      // Fallback vers une image statique en cas d'erreur
      return `/images/products/fallback-${Math.floor(Math.random() * 5) + 1}.jpg`;
    }

    const photo = result.response[0];
    return photo.urls.raw + `&w=${width}&h=${height}&fit=crop`;
  } catch (error) {
    console.error('Erreur lors de la récupération d\'image:', error);
    // Fallback vers une image statique en cas d'erreur
    return `/images/products/fallback-${Math.floor(Math.random() * 5) + 1}.jpg`;
  }
}

/**
 * Génère une URL d'image prévisible basée sur un terme de recherche et un ID
 * Utile pour les images de produits qui doivent rester constantes
 * 
 * @param {string} query - Terme de recherche pour l'image
 * @param {string|number} id - Identifiant unique pour garantir une image constante
 * @returns {string} - URL de l'image
 */
export function getStaticProductImage(query = '', id = '') {
  // Création d'un ID prévisible basé sur la requête et l'ID
  const stableId = String(id).length > 0 ? id : Math.floor(Math.random() * 1000);
  
  // Retourne une URL vers une image locale du dossier public
  // C'est plus fiable que d'appeler Unsplash à chaque fois
  return `/images/products/${query.toLowerCase().replace(/\s+/g, '-')}-${stableId}.jpg`;
}

/**
 * Solution temporaire pour remplacer les URLs source.unsplash.com/random
 * qui causent des erreurs 503
 */
export function getReliableRandomImage(query = '', signature = 0) {
  // Utilisez cette fonction comme alternative temporaire aux URL source.unsplash.com/random
  return `/images/products/placeholder-${(signature % 10) + 1}.jpg`;
}

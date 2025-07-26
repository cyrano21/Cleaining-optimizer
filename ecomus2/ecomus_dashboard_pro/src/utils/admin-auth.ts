/**
 * Utilitaires pour l'authentification admin
 */

/**
 * Vérifie si un token a le format JWT valide
 * @param token - Le token à vérifier
 * @returns true si le format est valide, false sinon
 */
export const isValidJWTFormat = (token: string | null): boolean => {
  if (!token) return false;
  const parts = token.split('.');
  return parts.length === 3 && parts.every(part => part.length > 0);
};

/**
 * Récupère le token admin depuis localStorage avec validation
 * @returns Le token valide ou null
 */
export const getValidAdminToken = (): string | null => {
  const token = localStorage.getItem('adminToken');
  return isValidJWTFormat(token) ? token : null;
};

/**
 * Nettoie le token corrompu et redirige vers la page de connexion
 * @param addNotification - Fonction pour afficher les notifications
 */
export const cleanupCorruptedToken = (addNotification?: (message: string, type: string) => void) => {
  localStorage.removeItem('adminToken');
  
  if (addNotification) {
    addNotification('Token corrompu détecté, veuillez vous reconnecter', 'error');
  }
  
  setTimeout(() => {
    window.location.href = '/admin/login';
  }, 2000);
};

/**
 * Gère les erreurs d'authentification 401
 * @param errorData - Les données d'erreur de la réponse
 * @param addNotification - Fonction pour afficher les notifications
 */
export const handleAuthError = (errorData: any, addNotification: (message: string, type: string) => void) => {
  if (errorData.error?.includes('Session expirée') || 
      errorData.error?.includes('Token') || 
      errorData.error?.includes('invalide')) {
    // Nettoyer le token corrompu/expiré
    localStorage.removeItem('adminToken');
    addNotification('Session expirée, redirection vers la page de connexion', 'error');
    setTimeout(() => {
      window.location.href = '/admin/login';
    }, 2000);
  } else {
    addNotification('Erreur d\'authentification', 'error');
  }
};

/**
 * Effectue une requête API admin avec gestion automatique des erreurs d'auth
 * @param url - L'URL de l'API
 * @param options - Les options de fetch
 * @param addNotification - Fonction pour afficher les notifications
 * @returns La réponse ou null en cas d'erreur d'auth
 */
export const fetchWithAuth = async (
  url: string, 
  options: RequestInit = {}, 
  addNotification: (message: string, type: string) => void
): Promise<Response | null> => {
  const token = getValidAdminToken();
  
  if (!token) {
    cleanupCorruptedToken(addNotification);
    return null;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    const errorData = await response.json();
    handleAuthError(errorData, addNotification);
    return null;
  }

  return response;
};
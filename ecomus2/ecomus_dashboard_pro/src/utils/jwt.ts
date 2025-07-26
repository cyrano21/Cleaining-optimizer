import jwt from 'jsonwebtoken';

interface JWTErrorResponse {
  error: string;
  status: number;
}

/**
 * Vérifie et décode un token JWT avec gestion d'erreurs appropriée
 * @param token - Le token JWT à vérifier
 * @param secret - La clé secrète pour vérifier le token
 * @returns Le payload décodé ou un objet erreur
 */
export function verifyJWTToken(token: string, secret: string): any {
  try {
    return jwt.verify(token, secret);
  } catch (error: any) {
    throw error; // Laisse l'appelant gérer l'erreur
  }
}

/**
 * Gère les erreurs JWT et retourne une réponse appropriée
 * @param error - L'erreur JWT à traiter
 * @returns Un objet avec le message d'erreur et le statut HTTP
 */
export function handleJWTError(error: any): JWTErrorResponse {
  console.error('Erreur JWT:', error);
  
  if (error.name === 'TokenExpiredError') {
    return { 
      error: 'Token expiré - Veuillez vous reconnecter', 
      status: 401 
    };
  } else if (error.name === 'JsonWebTokenError') {
    return { 
      error: 'Token invalide - Format incorrect', 
      status: 401 
    };
  } else if (error.name === 'NotBeforeError') {
    return { 
      error: 'Token pas encore valide', 
      status: 401 
    };
  }
  
  return { 
    error: 'Erreur d\'authentification', 
    status: 401 
  };
}

/**
 * Extrait le token Bearer de l'en-tête Authorization
 * @param authHeader - L'en-tête d'autorisation
 * @returns Le token sans le préfixe "Bearer " ou null
 */
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.replace('Bearer ', '');
}

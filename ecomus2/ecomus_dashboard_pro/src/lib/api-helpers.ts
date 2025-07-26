import { NextRequest, NextResponse } from 'next/server';

// Timeout par défaut pour les API (10 secondes)
const DEFAULT_TIMEOUT = 10000;

export function withTimeout<T extends (...args: any[]) => Promise<any>>(
  handler: T,
  timeoutMs: number = DEFAULT_TIMEOUT
): T {
  return (async (...args: any[]) => {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`API timeout après ${timeoutMs}ms`));
      }, timeoutMs);
    });

    try {
      return await Promise.race([
        handler(...args),
        timeoutPromise
      ]);
    } catch (error) {
      if (error instanceof Error && error.message.includes('timeout')) {
        console.error('API Timeout:', error.message);
        return NextResponse.json(
          { error: 'Délai d\'attente dépassé' },
          { status: 504 }
        );
      }
      throw error;
    }
  }) as T;
}

// Helper pour optimiser les requêtes de base de données
export async function withDatabaseOptimization<T>(
  operation: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  
  try {
    const result = await operation();
    const duration = Date.now() - startTime;
    
    // Log des requêtes lentes (> 2 secondes)
    if (duration > 2000) {
      console.warn(`Requête lente détectée: ${duration}ms`);
    }
    
    return result;
  } catch (error) {
    console.error('Erreur base de données:', error);
    throw error;
  }
}

// Helper pour les réponses JSON standardisées
export function createApiResponse<T>(
  data: T, 
  success: boolean = true, 
  message?: string,
  status: number = 200
) {
  return NextResponse.json(
    {
      success,
      data,
      message,
      timestamp: new Date().toISOString()
    },
    { status }
  );
}

// Helper pour les erreurs API standardisées
export function createApiError(
  message: string,
  status: number = 500,
  details?: any
) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      details,
      timestamp: new Date().toISOString()
    },
    { status }
  );
}

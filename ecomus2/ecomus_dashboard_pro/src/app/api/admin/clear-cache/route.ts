import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { checkAdminAccess } from '@/lib/role-utils';

// Simulateur de cache (en production, utiliser Redis ou un autre système de cache)
let cacheSimulator = {
  size: Math.floor(Math.random() * 100000) + 50000,
  entries: Math.floor(Math.random() * 1000) + 500,
  lastCleared: new Date()
};

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token || !token.role || !checkAdminAccess(token.role as string)) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    // Simuler le vidage du cache
    const previousSize = cacheSimulator.size;
    const previousEntries = cacheSimulator.entries;
    
    cacheSimulator = {
      size: 0,
      entries: 0,
      lastCleared: new Date()
    };

    // En production, vous implémenteriez ici :
    // - Vidage du cache Redis
    // - Vidage du cache Next.js
    // - Nettoyage des fichiers temporaires
    // - etc.

    return NextResponse.json({
      success: true,
      message: 'Cache vidé avec succès',
      clearedSize: previousSize,
      clearedEntries: previousEntries,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur lors du vidage du cache:', error);
    return NextResponse.json(
      { error: 'Erreur lors du vidage du cache' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token || !token.role || !checkAdminAccess(token.role as string)) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    return NextResponse.json({
      cache: cacheSimulator,
      status: 'active'
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des infos du cache:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des informations du cache' },
      { status: 500 }
    );
  }
}

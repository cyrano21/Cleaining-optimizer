import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectDB } from '@/lib/mongodb';
import { checkAdminAccess } from '@/lib/role-utils';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
      const token = await getToken({ req: request });
    if (!token || !token.role || !checkAdminAccess(token.role as string)) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({ error: 'Base de données non disponible' }, { status: 500 });
    }
      // Obtenir les statistiques de la base de données
    const collections = ['users', 'stores', 'products', 'orders', 'notifications', 'messages'];
    const stats: any = {
      collections: {},
      totalDocuments: 0,
      totalSize: 0
    };

    for (const collectionName of collections) {
      try {
        const collection = db.collection(collectionName);
        const documentCount = await collection.countDocuments();
        
        // Statistiques simplifiées pour éviter les erreurs de permissions
        stats.collections[collectionName] = {
          documents: documentCount,
          size: 0, // Non disponible sans permissions avancées
          avgObjSize: 0, // Non disponible sans permissions avancées
          indexes: 0 // Non disponible sans permissions avancées
        };
        
        stats.totalDocuments += documentCount;
      } catch (error) {
        console.warn(`Collection ${collectionName} non accessible:`, error);
        // Si la collection n'existe pas, on continue
        stats.collections[collectionName] = {
          documents: 0,
          size: 0,
          avgObjSize: 0,
          indexes: 0
        };
      }
    }

    // Informations système simplifiées
    stats.serverInfo = {
      version: 'N/A',
      uptime: 0,
      connections: {
        current: 0,
        available: 0
      },
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Erreur lors de la récupération des stats de la base de données:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques de la base de données' },
      { status: 500 }
    );
  }
}

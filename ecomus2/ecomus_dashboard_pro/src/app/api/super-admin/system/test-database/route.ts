import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier que l'utilisateur est super admin
    if (session.user.role !== 'super_admin' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }    // Tester la connexion à la base de données
    await connectDB();
    
    if (!mongoose.connection.db) {
      return NextResponse.json({
        success: false,
        status: 'error',
        message: 'Connexion à la base de données non établie'
      });
    }
    
    // Exécuter une commande ping pour vérifier la connexion
    const pingResult = await mongoose.connection.db.admin().ping();
    
    if (pingResult.ok === 1) {
      // Récupérer quelques statistiques supplémentaires
      const dbStats = await mongoose.connection.db.stats();
      const serverStatus = await mongoose.connection.db.admin().serverStatus();
      
      return NextResponse.json({
        success: true,
        status: 'connected',
        details: {
          ping: pingResult,
          version: serverStatus.version,
          uptime: serverStatus.uptime,
          connections: serverStatus.connections,
          storageSize: Math.round((dbStats.dataSize || 0) / 1024 / 1024 * 100) / 100,
          collections: (await mongoose.connection.db.listCollections().toArray()).length
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        status: 'error',
        message: 'Échec du ping à la base de données'
      });
    }

  } catch (error) {
    console.error('Erreur lors du test de connexion à la base de données:', error);
    return NextResponse.json({
      success: false,
      status: 'error',
      message: error instanceof Error ? error.message : 'Erreur de connexion inconnue'
    });
  }
}

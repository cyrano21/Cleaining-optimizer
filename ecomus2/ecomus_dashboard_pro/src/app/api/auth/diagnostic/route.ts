import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import mongoose from 'mongoose';

interface TestAccountDetail {
  email: string;
  role?: string;
  exists: boolean;
  isActive?: boolean;
  isVerified?: boolean;
  hasValidPassword?: boolean;
  note?: string;
}

export async function GET() {
  try {
    const diagnosticResults = {
      timestamp: new Date().toISOString(),
      success: false,
      database: {
        connected: false,
        connectionString: process.env.MONGODB_URI ? 
          `${process.env.MONGODB_URI.split('@')[0].split(':')[0]}:***@${process.env.MONGODB_URI.split('@')[1]}` : 
          'Non défini',
        status: 'Non testé'
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        nextAuthUrl: process.env.NEXTAUTH_URL || 'Non défini',
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        hasJwtSecret: !!process.env.JWT_SECRET,
      },
      users: {
        testAccountsExist: false,
        testAccountDetails: [] as TestAccountDetail[]
      }
    };

    // Tester la connexion à la base de données
    try {
      await connectDB();
      diagnosticResults.database.connected = true;
      diagnosticResults.database.status = 'Connecté';
      
      // Vérifier l'état de la connexion
      diagnosticResults.database.status = `${mongoose.connection.readyState === 1 ? 'Connecté' : 'Non connecté'} (État: ${mongoose.connection.readyState})`;
    } catch (dbError) {
      diagnosticResults.database.status = `Erreur: ${dbError instanceof Error ? dbError.message : 'Inconnue'}`;
    }

    // Vérifier les comptes de test si la BD est connectée
    if (diagnosticResults.database.connected) {
      try {
        // Vérifier si les comptes de test existent
        const testEmails = ['admin@ecomus.com', 'vendor@ecomus.com', 'user@ecomus.com'];
        const testUsers = await User.find({ email: { $in: testEmails }}, { password: 0 });
        
        diagnosticResults.users.testAccountsExist = testUsers.length > 0;
        diagnosticResults.users.testAccountDetails = testUsers.map(user => ({
          email: user.email,
          role: user.role,
          exists: true,
          isActive: user.isActive,
          isVerified: user.isVerified,
          hasValidPassword: !!user.password // Ne révèle pas le mot de passe, juste s'il existe
        }));
        
        // Ajouter les emails manquants
        const existingEmails = testUsers.map(u => u.email);
        const missingEmails = testEmails.filter(email => !existingEmails.includes(email));
        
        missingEmails.forEach(email => {
          diagnosticResults.users.testAccountDetails.push({
            email,
            exists: false,
            note: "Compte de test manquant"
          });
        });
      } catch (userError) {
        console.error("❌ Erreur lors de la vérification des utilisateurs:", userError);
      }
    }

    // Définir le succès global
    diagnosticResults.success = diagnosticResults.database.connected;

    return NextResponse.json(diagnosticResults, {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("❌ Erreur du diagnostic d'authentification:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Erreur inconnue",
        timestamp: new Date().toISOString()
      }, 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

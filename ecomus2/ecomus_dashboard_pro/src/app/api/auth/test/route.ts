import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    // Test de connexion à la base de données
    await connectDB();
    
    // Compter les utilisateurs
    const userCount = await User.countDocuments();
    
    // Récupérer quelques utilisateurs de test (sans mots de passe)
    const testUsers = await User.find(
      { email: { $in: ['admin@ecomus.com', 'vendor@ecomus.com', 'user@ecomus.com'] } },
      { password: 0 }
    ).limit(10);

    return NextResponse.json({
      success: true,
      database: {
        connected: true,
        userCount,
        testUsers: testUsers.map(user => ({
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt
        }))
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasMongoUri: !!process.env.MONGODB_URI,
        hasJwtSecret: !!process.env.JWT_SECRET,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Erreur de diagnostic:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

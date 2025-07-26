import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    await connectDB();
      // Rechercher l'utilisateur spécifique
    const user = await User.findOne({ email: 'louiscyrano@gmail.com' }).lean() as any;
    
    if (!user) {
      return NextResponse.json({
        found: false,
        message: "Utilisateur 'louiscyrano@gmail.com' non trouvé dans la base de données",
        suggestion: "Vous devez créer cet utilisateur ou vérifier l'email"
      });
    }

    // Typer correctement l'objet user
    const userObj = user as {
      _id: string;
      email: string;
      name: string;
      role: string;
      isActive: boolean;
      isEmailVerified: boolean;
      lastLogin: Date;
      createdAt: Date;
    };

    // Vérifier l'état de l'utilisateur
    return NextResponse.json({
      found: true,
      user: {
        _id: userObj._id,
        email: userObj.email,
        name: userObj.name,
        role: userObj.role,
        isActive: userObj.isActive,
        isEmailVerified: userObj.isEmailVerified,
        lastLogin: userObj.lastLogin,
        createdAt: userObj.createdAt
      },
      diagnosis: {
        canLoginRegular: userObj.isActive && userObj.role,
        canLoginAdmin: userObj.isActive && ['admin', 'super_admin', 'ADMIN', 'SUPER_ADMIN'].includes(userObj.role),
        issues: [
          !userObj.isActive && "❌ Compte inactif",
          !userObj.role && "❌ Aucun rôle défini",
          !userObj.isEmailVerified && "⚠️ Email non vérifié",
        ].filter(Boolean)
      }
    });
  } catch (error) {
    console.error('Erreur lors du diagnostic:', error);
    return NextResponse.json({
      error: true,
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}

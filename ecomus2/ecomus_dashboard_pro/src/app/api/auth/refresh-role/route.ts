import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      );
    }    await connectDB();

    // Récupérer l'utilisateur avec le vrai rôle depuis la DB
    const user = await User.findOne({ 
      $or: [
        { email: session.user.email },
        { _id: session.user.id }
      ]
    }).lean();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Assertion de type pour TypeScript (nous savons que user n'est pas null ici)
    const userData = user as any;

    // Retourner les informations à jour
    return NextResponse.json({
      success: true,
      message: "Rôle mis à jour avec succès",
      data: {
        currentSessionRole: session.user.role,
        realUserRole: userData.role,
        needsUpdate: session.user.role !== userData.role,
        user: {
          id: userData._id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          storeId: userData.storeId
        }
      }
    });
  } catch (error) {
    console.error('Erreur dans refresh-role:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
}

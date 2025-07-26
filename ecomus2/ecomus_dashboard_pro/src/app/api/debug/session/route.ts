import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import User from "@/models/User";
import Role from "@/models/Role";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      );
    }

    await connectDB();

    // Récupérer l'utilisateur avec ses rôles
    const user = await User.findOne({ email: session.user.email }).populate('role').lean();
    
    // Récupérer tous les rôles disponibles
    const allRoles = await Role.find({}).lean();

    return NextResponse.json({
      success: true,
      data: {
        session: session,
        userFromDB: user,
        allRoles: allRoles,
        userIdFromSession: session.user.id,
        emailFromSession: session.user.email
      }
    });
  } catch (error) {
    console.error('Erreur dans debug-session:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import User from "@/models/User";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      );
    }

    await connectDB();

    const { id: userId } = await params;
    
    // Vérifier que l'utilisateur demande ses propres infos ou est admin
    if (session.user.id !== userId) {
      const requestingUser = await User.findById(session.user.id).populate('role');
      if (!requestingUser || requestingUser.role?.name !== 'admin') {
        return NextResponse.json(
          { success: false, error: "Accès refusé" },
          { status: 403 }
        );
      }
    }

    const user = await User.findById(userId)
      .populate('role')
      .populate('store')
      .lean();    if (!user) {
      return NextResponse.json(
        { success: false, error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Retirer le mot de passe de la réponse (conversion en objet plain)
    const userObj = user as any;
    const { password, ...userWithoutPassword } = userObj;

    return NextResponse.json({
      success: true,
      data: userWithoutPassword
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    return NextResponse.json(
      { success: false, error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

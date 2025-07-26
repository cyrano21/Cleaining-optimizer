import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier si l'utilisateur est admin ou super admin
    const userRole = session.user.role;
    if (userRole !== "admin" && userRole !== "super_admin") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { isVerified } = await request.json();
    const { id: vendorId } = await params;

    await connectDB();

    // Vérifier que le vendeur existe et a le rôle vendor
    const vendor = await User.findOne({ _id: vendorId, role: "vendor" });
    if (!vendor) {
      return NextResponse.json(
        { error: "Vendeur non trouvé" },
        { status: 404 }
      );
    }

    // Mettre à jour le statut de vérification
    await User.findByIdAndUpdate(vendorId, {
      isVerified: isVerified,
      verifiedAt: isVerified ? new Date() : null,
      verifiedBy: isVerified ? session.user.id : null
    });

    return NextResponse.json({
      success: true,
      message: `Vendeur ${isVerified ? 'vérifié' : 'non vérifié'} avec succès`
    });

  } catch (error) {
    console.error("Erreur lors de la vérification du vendeur:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
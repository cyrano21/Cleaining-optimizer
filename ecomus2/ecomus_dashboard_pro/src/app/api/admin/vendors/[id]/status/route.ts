import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Store from "@/models/Store";

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

    const { isActive } = await request.json();
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

    // Mettre à jour le statut du vendeur
    await User.findByIdAndUpdate(vendorId, {
      isActive: isActive,
      statusUpdatedAt: new Date(),
      statusUpdatedBy: session.user.id
    });

    // Si le vendeur est désactivé, désactiver aussi ses boutiques
    if (!isActive) {
      await Store.updateMany(
        { owner: vendorId },
        { 
          status: "inactive",
          statusUpdatedAt: new Date(),
          statusUpdatedBy: session.user.id
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Vendeur ${isActive ? 'activé' : 'désactivé'} avec succès`
    });

  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut du vendeur:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
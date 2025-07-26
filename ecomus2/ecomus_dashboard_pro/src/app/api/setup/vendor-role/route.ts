import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import User from "@/models/User";
import Role from "@/models/Role";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      );
    }

    await connectDB();

    // Récupérer l'utilisateur actuel
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Chercher ou créer le rôle vendeur
    let vendorRole = await Role.findOne({ name: 'vendor' });
    if (!vendorRole) {
      vendorRole = new Role({
        name: 'vendor',
        displayName: 'Vendeur',
        description: 'Droits de vendeur - Peut gérer ses produits et commandes',
        permissions: [
          'products.create',
          'products.read',
          'products.update',
          'products.delete',
          'orders.read',
          'orders.update',
          'analytics.read',
          'categories.read'
        ]
      });
      await vendorRole.save();
    }

    // Attribuer le rôle vendeur à l'utilisateur
    user.role = vendorRole._id;
    await user.save();

    // Recharger l'utilisateur avec le rôle populé
    const updatedUser = await User.findById(user._id).populate('role');

    return NextResponse.json({
      success: true,
      message: "Rôle vendeur attribué avec succès",
      data: {
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'attribution du rôle vendeur:', error);
    return NextResponse.json(
      { success: false, error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

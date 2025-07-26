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
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Utilisateur non trouvé dans la base de données" },
        { status: 404 }
      );
    }

    // Chercher ou créer les rôles nécessaires
    let superAdminRole = await Role.findOne({ name: 'super_admin' });
    if (!superAdminRole) {
      superAdminRole = new Role({
        name: 'super_admin',
        displayName: 'Super Administrateur',
        description: 'Tous les droits - Peut tout faire sur la plateforme',
        permissions: [
          'all',
          'users.create',
          'users.read', 
          'users.update',
          'users.delete',
          'products.create',
          'products.read',
          'products.update', 
          'products.delete',
          'orders.create',
          'orders.read',
          'orders.update',
          'orders.delete',
          'analytics.read',
          'categories.create',
          'categories.read',
          'categories.update',
          'categories.delete',
          'roles.create',
          'roles.read',
          'roles.update',
          'roles.delete',
          'system.admin'
        ]
      });
      await superAdminRole.save();
    }

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

    let adminRole = await Role.findOne({ name: 'admin' });
    if (!adminRole) {
      adminRole = new Role({
        name: 'admin',
        displayName: 'Administrateur',
        description: 'Droits d\'administrateur - Peut gérer les utilisateurs et le système',
        permissions: [
          'users.read',
          'users.update',
          'products.read',
          'orders.read',
          'analytics.read',
          'categories.read',
          'system.admin'
        ]
      });
      await adminRole.save();
    }

    // Attribuer le rôle super admin à l'utilisateur
    user.role = superAdminRole._id;
    await user.save();

    // Recharger l'utilisateur avec le rôle populé
    const updatedUser = await User.findById(user._id).populate('role');

    return NextResponse.json({
      success: true,
      message: "Rôle super admin attribué avec succès",
      data: {
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role
        },
        rolesCreated: {
          superAdmin: superAdminRole,
          vendor: vendorRole,
          admin: adminRole
        }
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'attribution du rôle super admin:', error);
    return NextResponse.json(
      { success: false, error: "Erreur interne du serveur: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}

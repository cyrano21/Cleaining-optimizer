import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import Role from "@/models/Role";
import User from "@/models/User";

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

    // Récupérer tous les rôles
    const allRoles = await Role.find({}).sort({ name: 1 }).lean();
    
    // Compter les utilisateurs par rôle
    const roleStats = await Promise.all(
      allRoles.map(async (role) => {
        const userCount = await User.countDocuments({ role: role._id });
        return {
          ...role,
          userCount
        };
      })
    );

    // Récupérer quelques utilisateurs pour chaque rôle
    const rolesWithUsers = await Promise.all(
      roleStats.map(async (role) => {
        const users = await User.find({ role: role._id })
          .select('name email createdAt')
          .limit(5)
          .lean();
        return {
          ...role,
          users
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        totalRoles: allRoles.length,
        roles: rolesWithUsers,
        roleNames: allRoles.map(r => r.name),
        summary: {
          activeRoles: allRoles.filter(r => r.isActive).length,
          inactiveRoles: allRoles.filter(r => !r.isActive).length,
          totalUsers: await User.countDocuments()
        }
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des rôles:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: "Erreur interne du serveur: " + errorMessage },
      { status: 500 }
    );
  }
}

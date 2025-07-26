import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Store from "@/models/Store";

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    await connectDB();

    // Construire la requête de recherche
    const searchQuery = search ? {
      role: "vendor",
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { "companyName": { $regex: search, $options: "i" } }
      ]
    } : { role: "vendor" };    // Récupérer les vendeurs avec pagination
    const vendors = await User.find(searchQuery)
      .select("firstName lastName name email companyName createdAt isActive avatar")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Récupérer le nombre total pour la pagination
    const totalVendors = await User.countDocuments(searchQuery);

    // Pour chaque vendeur, récupérer ses statistiques de boutique
    const vendorsWithStats = await Promise.all(
      vendors.map(async (vendor) => {
        const stores = await Store.find({ owner: vendor._id })
          .select("name status createdAt")
          .lean();

        const activeStores = stores.filter(store => store.status === "active").length;
        const totalStores = stores.length;

        return {
          ...vendor,
          totalStores,
          activeStores,
          stores: stores.map(store => ({
            id: store._id,
            name: store.name,
            status: store.status,
            createdAt: store.createdAt
          }))
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        vendors: vendorsWithStats,
        pagination: {
          page,
          limit,
          total: totalVendors,
          totalPages: Math.ceil(totalVendors / limit),
          hasMore: page * limit < totalVendors
        }
      }
    });

  } catch (error) {
    console.error("Erreur API vendors:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

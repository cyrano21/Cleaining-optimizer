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
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";

    await connectDB();

    // Construire la requête de recherche
    let searchQuery: any = { role: "vendor" };
    
    if (search) {
      searchQuery.$or = [
        { name: { $regex: search, $options: "i" } },
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { "companyName": { $regex: search, $options: "i" } }
      ];
    }

    if (status) {
      if (status === "active") {
        searchQuery.isActive = true;
      } else if (status === "inactive") {
        searchQuery.isActive = false;
      }
    }

    // Définir l'ordre de tri
    let sortOptions: any = {};
    switch (sortBy) {
      case "name":
        sortOptions = { name: 1 };
        break;
      case "email":
        sortOptions = { email: 1 };
        break;
      case "rating":
        sortOptions = { rating: -1 };
        break;
      case "createdAt":
      default:
        sortOptions = { createdAt: -1 };
        break;
    }

    // Récupérer les vendeurs avec pagination
    const vendors = await User.find(searchQuery)
      .select("firstName lastName name email companyName createdAt isActive avatar isVerified rating")
      .sort(sortOptions)
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
          id: vendor._id,
          businessName: vendor.companyName || vendor.name || `${vendor.firstName || ''} ${vendor.lastName || ''}`.trim(),
          ownerName: `${vendor.firstName || ''} ${vendor.lastName || ''}`.trim(),
          name: vendor.name || `${vendor.firstName || ''} ${vendor.lastName || ''}`.trim(),
          firstName: vendor.firstName,
          lastName: vendor.lastName,
          email: vendor.email,
          companyName: vendor.companyName,
          avatar: vendor.avatar,
          isActive: vendor.isActive,
          isVerified: vendor.isVerified || false,
          rating: vendor.rating || 0,
          joinDate: vendor.createdAt,
          createdAt: vendor.createdAt,
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
      vendors: vendorsWithStats,
      pagination: {
        page,
        limit,
        total: totalVendors,
        totalPages: Math.ceil(totalVendors / limit),
        hasMore: page * limit < totalVendors
      }
    });

  } catch (error) {
    console.error("Erreur API admin/vendors:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
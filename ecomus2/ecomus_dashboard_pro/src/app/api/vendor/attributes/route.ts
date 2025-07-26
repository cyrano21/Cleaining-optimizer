import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { connectDB } from "@/lib/mongodb";
import Attribute from "@/models/Attribute";
import Store from "@/models/Store";
import User from "@/models/User";

// GET - Récupérer les attributs du vendeur
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });
    }

    await connectDB();

    // Vérifier que l'utilisateur est un vendeur ou admin
    const user = await User.findById(session.user.id).populate('role');
    if (!user || !['vendor', 'admin'].includes(user.role?.name)) {
      return NextResponse.json(
        { success: false, error: "Accès refusé - Droits vendeur requis" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category");

    // Construction de la requête selon le rôle utilisateur
    const query: any = {
      isActive: true
    };

    // Si un storeId est fourni, l'utiliser
    if (storeId) {
      query.storeId = storeId;
    }

    // Si c'est un vendeur (non admin), filtrer par ses attributs
    if (user.role.name === 'vendor') {
      query.createdBy = user._id;
    }

    if (search) {
      query.$or = [
        { category: { $regex: search, $options: "i" } },
        { value: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    if (category && category !== "all") {
      query.category = category;
    }

    // Pagination
    const skip = (page - 1) * limit;
    
    const [attributes, total, categories] = await Promise.all([
      Attribute.find(query)
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Attribute.countDocuments(query),
      Attribute.distinct("category", query)
    ]);

    return NextResponse.json({
      success: true,
      data: {
        attributes,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        categories
      }
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des attributs:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// POST - Créer un nouvel attribut
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      );
    }

    await connectDB();

    // Vérifier que l'utilisateur est un vendeur ou admin
    const user = await User.findById(session.user.id).populate('role');
    if (!user || !['vendor', 'admin'].includes(user.role?.name)) {
      return NextResponse.json(
        { success: false, error: "Accès refusé - Droits vendeur requis" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { category, value, description, storeId } = body;

    // Validation
    if (!category || !category.trim()) {
      return NextResponse.json(
        { success: false, error: "La catégorie est requise" },
        { status: 400 }
      );
    }

    if (!value || !value.trim()) {
      return NextResponse.json(
        { success: false, error: "La valeur est requise" },
        { status: 400 }
      );
    }

    // Vérifier si l'attribut existe déjà pour ce vendeur
    const query: any = {
      category: category.trim(),
      value: value.trim(),
      isActive: true
    };

    // Si un storeId est fourni, l'inclure dans la vérification
    if (storeId) {
      query.storeId = storeId;
    }

    // Si c'est un vendeur (non admin), vérifier par createdBy
    if (user.role.name === 'vendor') {
      query.createdBy = user._id;
    }

    const existingAttribute = await Attribute.findOne(query);

    if (existingAttribute) {
      return NextResponse.json(
        { success: false, error: "Un attribut avec ces valeurs existe déjà" },
        { status: 409 }
      );
    }

    // Créer le nouvel attribut
    const newAttribute = new Attribute({
      category: category.trim(),
      value: value.trim(),
      description: description?.trim(),
      storeId: storeId || null,
      createdBy: user._id,
      isActive: true
    });

    await newAttribute.save();
    await newAttribute.populate("createdBy", "name email");

    return NextResponse.json({
      success: true,
      data: newAttribute
    }, { status: 201 });

  } catch (error) {
    console.error("Erreur lors de la création de l'attribut:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la création de l'attribut" },
      { status: 500 }
    );
  }
}
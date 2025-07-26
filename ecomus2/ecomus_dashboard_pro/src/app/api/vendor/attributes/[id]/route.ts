import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { connectDB } from "@/lib/mongodb";
import Attribute from "@/models/Attribute";
import Store from "@/models/Store";
import User from "@/models/User";

// GET - Récupérer un attribut spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

    // Construire la requête avec vérification de propriété pour les vendeurs
    const query: any = { _id: id, isActive: true };

    // Si c'est un vendeur (non admin), vérifier qu'il possède cet attribut
    if (user.role.name === 'vendor') {
      query.createdBy = user._id;
    }

    const attribute = await Attribute.findOne(query)
      .populate("createdBy", "name email")
      .lean();

    if (!attribute) {
      return NextResponse.json(
        { success: false, error: "Attribut non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: attribute
    });

  } catch (error) {
    console.error("Erreur lors de la récupération de l'attribut:", error);
    return NextResponse.json(
      { success: false, error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// PUT - Modifier un attribut
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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
    const { category, value, description, isActive } = body;

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

    // Construire la requête avec vérification de propriété pour les vendeurs
    const query: any = { _id: id, isActive: true };

    // Si c'est un vendeur (non admin), vérifier qu'il possède cet attribut
    if (user.role.name === 'vendor') {
      query.createdBy = user._id;
    }

    // Récupérer l'attribut existant
    const existingAttribute = await Attribute.findOne(query);
    if (!existingAttribute) {
      return NextResponse.json(
        { success: false, error: "Attribut non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier si un autre attribut avec les mêmes valeurs existe déjà
    const duplicateQuery: any = {
      _id: { $ne: id },
      category: category.trim(),
      value: value.trim(),
      isActive: true
    };

    // Inclure storeId si présent
    if (existingAttribute.storeId) {
      duplicateQuery.storeId = existingAttribute.storeId;
    }

    // Si c'est un vendeur, vérifier par createdBy
    if (user.role.name === 'vendor') {
      duplicateQuery.createdBy = user._id;
    }

    const duplicateAttribute = await Attribute.findOne(duplicateQuery);

    if (duplicateAttribute) {
      return NextResponse.json(
        { success: false, error: "Un attribut avec ces valeurs existe déjà" },
        { status: 409 }
      );
    }

    // Mettre à jour l'attribut
    const updatedAttribute = await Attribute.findByIdAndUpdate(
      id,
      {
        category: category.trim(),
        value: value.trim(),
        description: description?.trim(),
        isActive: isActive !== undefined ? isActive : existingAttribute.isActive,
        updatedAt: new Date()
      },
      { new: true }
    ).populate("createdBy", "name email");

    return NextResponse.json({
      success: true,
      data: updatedAttribute
    });

  } catch (error) {
    console.error("Erreur lors de la modification de l'attribut:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la modification de l'attribut" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un attribut
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

    // Construire la requête avec vérification de propriété pour les vendeurs
    const query: any = { _id: id, isActive: true };

    // Si c'est un vendeur (non admin), vérifier qu'il possède cet attribut
    if (user.role.name === 'vendor') {
      query.createdBy = user._id;
    }

    // Récupérer l'attribut existant
    const existingAttribute = await Attribute.findOne(query);
    if (!existingAttribute) {
      return NextResponse.json(
        { success: false, error: "Attribut non trouvé" },
        { status: 404 }
      );
    }

    // TODO: Vérifier si l'attribut est utilisé par des produits
    // const productsUsingAttribute = await Product.countDocuments({
    //   storeId: existingAttribute.storeId,
    //   [`attributes.${existingAttribute.category}`]: existingAttribute.value
    // });
    
    // if (productsUsingAttribute > 0) {
    //   return NextResponse.json(
    //     { success: false, error: `Cet attribut est utilisé par ${productsUsingAttribute} produit(s). Suppression impossible.` },
    //     { status: 409 }
    //   );
    // }

    // Supprimer l'attribut (suppression douce - marquer comme inactif)
    await Attribute.findByIdAndUpdate(id, {
      isActive: false,
      deletedAt: new Date()
    });

    // Ou suppression définitive si préféré :
    // await Attribute.findByIdAndDelete(params.id);

    return NextResponse.json({
      success: true,
      message: "Attribut supprimé avec succès"
    });

  } catch (error) {
    console.error("Erreur lors de la suppression de l'attribut:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la suppression de l'attribut" },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import User from "@/models/User";

// Modèle Category temporaire si il n'existe pas
const getCategoryModel = async () => {
  try {
    const mongoose = require('mongoose');
    return mongoose.models.Category || mongoose.model('Category', new mongoose.Schema({
      name: { type: String, required: true },
      slug: { type: String, required: true },
      description: String,
      vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      productCount: { type: Number, default: 0 },
      isActive: { type: Boolean, default: true },
      isDeleted: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    }));
  } catch (error) {
    return null;
  }
};

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

    // Vérifier que l'utilisateur est un vendeur ou admin
    const user = await User.findById(session.user.id).populate('role');
    if (!user || !['vendor', 'admin'].includes(user.role?.name)) {
      return NextResponse.json(
        { success: false, error: "Accès refusé - Droits vendeur requis" },
        { status: 403 }
      );
    }

    const { id: categoryId } = await params;
    const Category = await getCategoryModel();

    if (!Category) {
      return NextResponse.json(
        { success: false, error: "Modèle de catégorie non disponible" },
        { status: 500 }
      );
    }

    // Construire la requête avec vérification de propriété pour les vendeurs
    const query: any = { _id: categoryId, isDeleted: { $ne: true } };

    // Si c'est un vendeur (non admin), vérifier qu'il possède cette catégorie  
    if (user.role.name === 'vendor') {
      query.vendor = user._id;
    }

    const category = await Category.findOne(query).lean();

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Catégorie non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: category
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de la catégorie:', error);
    return NextResponse.json(
      { success: false, error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    // Vérifier que l'utilisateur est un vendeur ou admin
    const user = await User.findById(session.user.id).populate('role');
    if (!user || !['vendor', 'admin'].includes(user.role?.name)) {
      return NextResponse.json(
        { success: false, error: "Accès refusé - Droits vendeur requis" },
        { status: 403 }
      );
    }

    const { id: categoryId } = await params;
    const updateData = await request.json();

    const Category = await getCategoryModel();
    if (!Category) {
      return NextResponse.json(
        { success: false, error: "Modèle de catégorie non disponible" },
        { status: 500 }
      );
    }

    // Construire la requête avec vérification de propriété pour les vendeurs
    const query: any = { _id: categoryId, isDeleted: { $ne: true } };

    // Si c'est un vendeur (non admin), vérifier qu'il possède cette catégorie
    if (user.role.name === 'vendor') {
      query.vendor = user._id;
    }

    // Vérifier que la catégorie existe et appartient au vendeur
    const existingCategory = await Category.findOne(query);
    if (!existingCategory) {
      return NextResponse.json(
        { success: false, error: "Catégorie non trouvée ou accès refusé" },
        { status: 404 }
      );
    }

    // Validation
    if (updateData.name && !updateData.name.trim()) {
      return NextResponse.json(
        { success: false, error: "Le nom de la catégorie ne peut pas être vide" },
        { status: 400 }
      );
    }

    // Générer un slug si le nom change
    if (updateData.name && updateData.name !== existingCategory.name) {
      updateData.slug = updateData.name
        .toLowerCase()
        .replace(/[àáâãäå]/g, 'a')
        .replace(/[èéêë]/g, 'e')
        .replace(/[ìíîï]/g, 'i')
        .replace(/[òóôõö]/g, 'o')
        .replace(/[ùúûü]/g, 'u')
        .replace(/[ýÿ]/g, 'y')
        .replace(/[ñ]/g, 'n')
        .replace(/[ç]/g, 'c')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    // Vérifier l'unicité du slug si il a changé
    if (updateData.slug && updateData.slug !== existingCategory.slug) {
      const duplicateCategory = await Category.findOne({
        slug: updateData.slug,
        vendor: user._id,
        _id: { $ne: categoryId },
        isDeleted: { $ne: true }
      });

      if (duplicateCategory) {
        return NextResponse.json(
          { success: false, error: "Une catégorie avec ce slug existe déjà" },
          { status: 400 }
        );
      }
    }

    // Mettre à jour la catégorie
    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      {
        ...updateData,
        updatedAt: new Date()
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      data: updatedCategory
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la catégorie:', error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la mise à jour de la catégorie" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Vérifier que l'utilisateur est un vendeur ou admin
    const user = await User.findById(session.user.id).populate('role');
    if (!user || !['vendor', 'admin'].includes(user.role?.name)) {
      return NextResponse.json(
        { success: false, error: "Accès refusé - Droits vendeur requis" },
        { status: 403 }
      );
    }

    const { id: categoryId } = await params;
    const Category = await getCategoryModel();

    if (!Category) {
      return NextResponse.json(
        { success: false, error: "Modèle de catégorie non disponible" },
        { status: 500 }
      );
    }

    // Construire la requête avec vérification de propriété pour les vendeurs
    const query: any = { _id: categoryId, isDeleted: { $ne: true } };

    // Si c'est un vendeur (non admin), vérifier qu'il possède cette catégorie
    if (user.role.name === 'vendor') {
      query.vendor = user._id;
    }

    // Vérifier que la catégorie existe
    const category = await Category.findOne(query);
    if (!category) {
      return NextResponse.json(
        { success: false, error: "Catégorie non trouvée ou accès refusé" },
        { status: 404 }
      );
    }

    // Vérifier s'il y a des produits dans cette catégorie
    // (Cette vérification devrait être adaptée selon votre modèle Product)
    try {
      const Product = require('@/models/Product').default;
      const productsCount = await Product.countDocuments({ 
        category: categoryId,
        isDeleted: { $ne: true }
      });

      if (productsCount > 0) {
        return NextResponse.json(
          { success: false, error: `Impossible de supprimer cette catégorie car ${productsCount} produit(s) y sont associés` },
          { status: 400 }
        );
      }
    } catch (error) {
      // Si le modèle Product n'existe pas, on continue
      console.log('Modèle Product non trouvé, suppression autorisée');
    }

    // Supprimer la catégorie (soft delete)
    await Category.findByIdAndUpdate(categoryId, {
      isDeleted: true,
      deletedAt: new Date(),
      updatedAt: new Date()
    });

    return NextResponse.json({
      success: true,
      message: "Catégorie supprimée avec succès"
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de la catégorie:', error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la suppression de la catégorie" },
      { status: 500 }
    );
  }
}

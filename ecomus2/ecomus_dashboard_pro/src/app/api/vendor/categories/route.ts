import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import { authOptions } from '@/lib/auth-config';
import User from '@/models/User';

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

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
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

    const Category = await getCategoryModel();
    
    if (!Category) {
      // Retourner des catégories par défaut si le modèle n'existe pas
      const defaultCategories = [
        { _id: '1', name: 'Électronique', slug: 'electronique', productCount: 0 },
        { _id: '2', name: 'Vêtements', slug: 'vetements', productCount: 0 },
        { _id: '3', name: 'Maison & Jardin', slug: 'maison-jardin', productCount: 0 },
        { _id: '4', name: 'Sports & Loisirs', slug: 'sports-loisirs', productCount: 0 },
        { _id: '5', name: 'Livres', slug: 'livres', productCount: 0 },
        { _id: '6', name: 'Beauté & Santé', slug: 'beaute-sante', productCount: 0 },
        { _id: '7', name: 'Automobile', slug: 'automobile', productCount: 0 },
        { _id: '8', name: 'Jouets & Enfants', slug: 'jouets-enfants', productCount: 0 }
      ];
      
      return NextResponse.json({
        success: true,
        data: defaultCategories
      });
    }

    // Construire la requête selon le rôle utilisateur
    const query: any = { 
      isDeleted: { $ne: true },
      isActive: true 
    };

    // Si c'est un vendeur (non admin), filtrer par ses catégories
    if (user.role.name === 'vendor') {
      query.vendor = user._id;
    }

    const categories = await Category.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: categories
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      );
    }    await connectDB();

    // Vérifier que l'utilisateur est un vendeur ou admin
    const user = await User.findById(session.user.id).populate('role');
    if (!user || !['vendor', 'admin'].includes(user.role?.name)) {
      return NextResponse.json(
        { success: false, error: "Accès refusé - Droits vendeur requis" },
        { status: 403 }
      );
    }

    const categoryData = await request.json();

    // Validation
    if (!categoryData.name || !categoryData.name.trim()) {
      return NextResponse.json(
        { success: false, error: "Le nom de la catégorie est requis" },
        { status: 400 }
      );
    }

    // Générer un slug si non fourni
    if (!categoryData.slug) {
      categoryData.slug = categoryData.name
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

    const Category = await getCategoryModel();
    if (!Category) {
      return NextResponse.json(
        { success: false, error: "Modèle de catégorie non disponible" },
        { status: 500 }
      );
    }

    // Vérifier l'unicité du slug pour ce vendeur
    const existingCategory = await Category.findOne({
      slug: categoryData.slug,
      vendor: user._id,
      isDeleted: { $ne: true }
    });

    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: "Une catégorie avec ce slug existe déjà" },
        { status: 400 }
      );
    }

    // Créer la nouvelle catégorie
    const newCategory = new Category({
      ...categoryData,
      vendor: user._id,
      productCount: 0,
      isActive: true,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newCategory.save();

    return NextResponse.json({
      success: true,
      data: newCategory
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur lors de la création de la catégorie:', error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la création de la catégorie" },
      { status: 500 }
    );
  }
}

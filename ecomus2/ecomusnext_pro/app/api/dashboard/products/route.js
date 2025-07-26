import dbConnect from "../../../../lib/dbConnect";
import Product from "../../../../models/Product";
import Category from "../../../../models/Category";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import mongoose from "mongoose";

// GET /api/dashboard/products - Récupérer les produits pour le dashboard admin
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return Response.json({ 
        success: false, 
        message: "Accès non autorisé" 
      }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Construire la requête de filtre
    let query = {};

    // Recherche textuelle
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } }
      ];
    }

    // Filtrer par catégorie
    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        query.category = new mongoose.Types.ObjectId(category);
      } else {
        // Rechercher par slug de catégorie
        const categoryDoc = await Category.findOne({ slug: category });
        if (categoryDoc) {
          query.category = categoryDoc._id;
        }
      }
    }

    // Filtrer par statut
    if (status) {
      if (status === 'active') {
        query.isActive = true;
      } else if (status === 'inactive') {
        query.isActive = false;
      } else if (status === 'low-stock') {
        query.stock = { $lt: 10 };
      } else if (status === 'out-of-stock') {
        query.stock = { $lte: 0 };
      }
    }

    // Options de tri
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Exécuter les requêtes en parallèle
    const [products, total, categories] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .populate('shop', 'name slug')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
      Category.find({}).select('name slug').lean()
    ]);

    // Calculer les métadonnées de pagination
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return Response.json({
      success: true,
      data: {
        products,
        pagination: {
          current: page,
          total: totalPages,
          hasNext,
          hasPrev,
          totalCount: total
        },
        categories,
        filters: {
          search,
          category,
          status,
          sortBy,
          sortOrder
        }
      }
    });

  } catch (error) {
    console.error('Erreur API dashboard products:', error);
    return Response.json({
      success: false,
      message: "Erreur lors de la récupération des produits",
      error: error.message
    }, { status: 500 });
  }
}

// POST /api/dashboard/products - Créer un nouveau produit
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return Response.json({ 
        success: false, 
        message: "Accès non autorisé" 
      }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    
    // Validation des champs requis
    const { name, description, price, category } = body;
    if (!name || !description || !price || !category) {
      return Response.json({
        success: false,
        message: "Champs requis manquants"
      }, { status: 400 });
    }

    // Générer un slug unique
    const baseSlug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    let slug = baseSlug;
    let counter = 1;
    
    while (await Product.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Créer le produit
    const productData = {
      ...body,
      slug,
      createdBy: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const product = await Product.create(productData);
    
    // Populer les relations
    await product.populate('category', 'name slug');
    if (product.shop) {
      await product.populate('shop', 'name slug');
    }

    return Response.json({
      success: true,
      data: product
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur création produit:', error);
    return Response.json({
      success: false,
      message: "Erreur lors de la création du produit",
      error: error.message
    }, { status: 500 });
  }
}

// PUT /api/dashboard/products - Mettre à jour plusieurs produits
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return Response.json({ 
        success: false, 
        message: "Accès non autorisé" 
      }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { action, productIds, updateData } = body;

    if (!action || !productIds || !Array.isArray(productIds)) {
      return Response.json({
        success: false,
        message: "Paramètres invalides"
      }, { status: 400 });
    }

    let result;

    switch (action) {
      case 'activate':
        result = await Product.updateMany(
          { _id: { $in: productIds } },
          { isActive: true, updatedAt: new Date() }
        );
        break;

      case 'deactivate':
        result = await Product.updateMany(
          { _id: { $in: productIds } },
          { isActive: false, updatedAt: new Date() }
        );
        break;

      case 'delete':
        result = await Product.deleteMany({ _id: { $in: productIds } });
        break;

      case 'update':
        if (!updateData) {
          return Response.json({
            success: false,
            message: "Données de mise à jour manquantes"
          }, { status: 400 });
        }
        
        result = await Product.updateMany(
          { _id: { $in: productIds } },
          { ...updateData, updatedAt: new Date() }
        );
        break;

      default:
        return Response.json({
          success: false,
          message: "Action non reconnue"
        }, { status: 400 });
    }

    return Response.json({
      success: true,
      message: `${result.modifiedCount || result.deletedCount} produit(s) ${action === 'delete' ? 'supprimé(s)' : 'mis à jour'}`,
      data: {
        affected: result.modifiedCount || result.deletedCount,
        action
      }
    });

  } catch (error) {
    console.error('Erreur mise à jour produits:', error);
    return Response.json({
      success: false,
      message: "Erreur lors de la mise à jour des produits",
      error: error.message
    }, { status: 500 });
  }
}

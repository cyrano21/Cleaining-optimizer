import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import { Supplier } from '../../../../models/SaasModels';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

// GET /api/dropshipping/suppliers - Récupérer tous les fournisseurs
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({ 
        success: false, 
        message: "Accès non autorisé" 
      }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const category = searchParams.get('category') || '';

    const skip = (page - 1) * limit;

    // Construire la requête de filtre
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'contact.name': { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      query.status = status;
    }

    if (category) {
      query.categories = { $in: [category] };
    }

    const [suppliers, total] = await Promise.all([
      Supplier.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Supplier.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        suppliers,
        pagination: {
          current: page,
          total: totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
          totalCount: total
        }
      }
    });

  } catch (error) {
    console.error('Erreur API suppliers:', error);
    return NextResponse.json({
      success: false,
      message: "Erreur lors de la récupération des fournisseurs",
      error: error.message
    }, { status: 500 });
  }
}

// POST /api/dropshipping/suppliers - Créer un nouveau fournisseur
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({ 
        success: false, 
        message: "Accès non autorisé" 
      }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    
    // Validation des champs requis
    const { name, email } = body;
    if (!name || !email) {
      return NextResponse.json({
        success: false,
        message: "Nom et email requis"
      }, { status: 400 });
    }

    // Vérifier si l'email existe déjà
    const existingSupplier = await Supplier.findOne({ email });
    if (existingSupplier) {
      return NextResponse.json({
        success: false,
        message: "Un fournisseur avec cet email existe déjà"
      }, { status: 400 });
    }

    // Générer un slug unique
    const baseSlug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    let slug = baseSlug;
    let counter = 1;
    
    while (await Supplier.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Créer le fournisseur
    const supplierData = {
      ...body,
      slug,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const supplier = await Supplier.create(supplierData);

    return NextResponse.json({
      success: true,
      data: supplier,
      message: "Fournisseur créé avec succès"
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur création fournisseur:', error);
    return NextResponse.json({
      success: false,
      message: "Erreur lors de la création du fournisseur",
      error: error.message
    }, { status: 500 });
  }
}

// PUT /api/dropshipping/suppliers - Mettre à jour un fournisseur
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({ 
        success: false, 
        message: "Accès non autorisé" 
      }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        message: "ID du fournisseur requis"
      }, { status: 400 });
    }

    const supplier = await Supplier.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!supplier) {
      return NextResponse.json({
        success: false,
        message: "Fournisseur introuvable"
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: supplier,
      message: "Fournisseur mis à jour avec succès"
    });

  } catch (error) {
    console.error('Erreur mise à jour fournisseur:', error);
    return NextResponse.json({
      success: false,
      message: "Erreur lors de la mise à jour du fournisseur",
      error: error.message
    }, { status: 500 });
  }
}

// DELETE /api/dropshipping/suppliers - Supprimer un fournisseur
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ 
        success: false, 
        message: "Accès non autorisé - Super Admin requis" 
      }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        message: "ID du fournisseur requis"
      }, { status: 400 });
    }

    const supplier = await Supplier.findByIdAndDelete(id);

    if (!supplier) {
      return NextResponse.json({
        success: false,
        message: "Fournisseur introuvable"
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Fournisseur supprimé avec succès"
    });

  } catch (error) {
    console.error('Erreur suppression fournisseur:', error);
    return NextResponse.json({
      success: false,
      message: "Erreur lors de la suppression du fournisseur",
      error: error.message
    }, { status: 500 });
  }
}


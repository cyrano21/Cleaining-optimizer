import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import User from '@/models/User';
import { authOptions } from '@/lib/auth-config';

// GET - Récupérer un produit spécifique
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await connectDB();

    // Vérifier si l'utilisateur est un vendeur
    const user = await User.findById(session.user.id);
    if (!user || (user.role !== 'vendor' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { id } = await params;
    const product = await Product.findOne({
      _id: id,
      vendor: session.user.id
    })
    .populate('category', 'name slug')
    .populate('store', 'name slug')
    .lean();

    if (!product) {
      return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du produit:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour un produit
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await connectDB();

    // Vérifier si l'utilisateur est un vendeur
    const user = await User.findById(session.user.id);
    if (!user || (user.role !== 'vendor' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      description,
      price,
      comparePrice,
      sku,
      barcode,
      quantity,
      lowStockAlert,
      images,
      category,
      tags,
      status,
      featured,
      weight,
      dimensions,
      seoTitle,
      seoDescription,
      variant
    } = body;

    // Vérifier que le produit appartient au vendeur
    const { id } = await params;
    const existingProduct = await Product.findOne({
      _id: id,
      vendor: session.user.id
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 });
    }

    // Vérifier l'unicité du SKU si modifié
    if (sku && sku !== existingProduct.sku) {
      const existingSku = await Product.findOne({ sku, _id: { $ne: id } });
      if (existingSku) {
        return NextResponse.json({ error: 'Ce SKU existe déjà' }, { status: 400 });
      }
    }

    // Préparer les données de mise à jour
    const updateData: any = {
      title,
      description,
      price,
      comparePrice,
      sku,
      barcode,
      quantity,
      lowStockAlert,
      images,
      category,
      tags,
      status,
      featured,
      weight,
      dimensions,
      seoTitle,
      seoDescription,
      variant,
      updatedAt: new Date()
    };

    // Recalculer le pourcentage de remise
    if (comparePrice && price) {
      updateData.discountPercentage = Math.round(((comparePrice - price) / comparePrice) * 100);
    }

    // Générer un nouveau slug si le titre a changé
    if (title && title !== existingProduct.title) {
      const slug = title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      updateData.slug = `${slug}-${Date.now()}`;
    }

    // Mettre à jour le produit
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('category', 'name slug')
    .populate('store', 'name slug');

    return NextResponse.json({
      success: true,
      data: updatedProduct,
      message: 'Produit mis à jour avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du produit:', error);
    
    if (error instanceof Error && error.name === 'ValidationError') {
      const errors = Object.values((error as any).errors).map((err: any) => err.message);
      return NextResponse.json({ error: errors.join(', ') }, { status: 400 });
    }
    
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un produit
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await connectDB();

    // Vérifier si l'utilisateur est un vendeur
    const user = await User.findById(session.user.id);
    if (!user || (user.role !== 'vendor' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Vérifier que le produit appartient au vendeur
    const { id } = await params;
    const product = await Product.findOne({
      _id: id,
      vendor: session.user.id
    });

    if (!product) {
      return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 });
    }

    // Supprimer le produit
    await Product.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Produit supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du produit:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

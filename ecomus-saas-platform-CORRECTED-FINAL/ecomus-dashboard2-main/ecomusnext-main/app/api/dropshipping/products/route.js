import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import { DropshippingProduct, Supplier } from '../../../../models/SaasModels';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

// GET /api/dropshipping/products - Récupérer les produits dropshipping
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'super_admin', 'vendor'].includes(session.user.role)) {
      return NextResponse.json({ 
        success: false, 
        message: "Accès non autorisé" 
      }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const search = searchParams.get('search') || '';
    const supplierId = searchParams.get('supplierId') || '';
    const category = searchParams.get('category') || '';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    const skip = (page - 1) * limit;

    // Construire la requête de filtre
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (supplierId) {
      query.supplierId = supplierId;
    }

    if (category) {
      query.category = category;
    }

    if (minPrice || maxPrice) {
      query['pricing.supplierPrice'] = {};
      if (minPrice) query['pricing.supplierPrice'].$gte = parseFloat(minPrice);
      if (maxPrice) query['pricing.supplierPrice'].$lte = parseFloat(maxPrice);
    }

    const [products, total] = await Promise.all([
      DropshippingProduct.find(query)
        .populate('supplierId', 'name slug logo')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      DropshippingProduct.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        products,
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
    console.error('Erreur API dropshipping products:', error);
    return NextResponse.json({
      success: false,
      message: "Erreur lors de la récupération des produits",
      error: error.message
    }, { status: 500 });
  }
}

// POST /api/dropshipping/products - Importer un produit dropshipping vers le catalogue
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'super_admin', 'vendor'].includes(session.user.role)) {
      return NextResponse.json({ 
        success: false, 
        message: "Accès non autorisé" 
      }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { dropshippingProductId, storeId, customPricing, customName, customDescription } = body;

    if (!dropshippingProductId || !storeId) {
      return NextResponse.json({
        success: false,
        message: "ID produit dropshipping et ID boutique requis"
      }, { status: 400 });
    }

    // Récupérer le produit dropshipping
    const dropshippingProduct = await DropshippingProduct.findById(dropshippingProductId)
      .populate('supplierId');

    if (!dropshippingProduct) {
      return NextResponse.json({
        success: false,
        message: "Produit dropshipping introuvable"
      }, { status: 404 });
    }

    // Calculer le prix de vente
    const supplierPrice = dropshippingProduct.pricing.supplierPrice;
    const margin = customPricing?.margin || dropshippingProduct.pricing.margin;
    const salePrice = customPricing?.price || (supplierPrice * (1 + margin / 100));

    // Générer un slug unique pour le produit
    const productName = customName || dropshippingProduct.name;
    const baseSlug = productName.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    let slug = baseSlug;
    let counter = 1;
    
    while (await Product.findOne({ slug, storeId })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Créer le produit dans le catalogue
    const productData = {
      name: productName,
      slug,
      description: customDescription || dropshippingProduct.description,
      images: dropshippingProduct.images,
      price: salePrice,
      comparePrice: dropshippingProduct.pricing.suggestedRetailPrice,
      cost: supplierPrice,
      sku: `DS-${dropshippingProduct.supplierProductId}`,
      category: dropshippingProduct.category,
      tags: dropshippingProduct.tags,
      storeId,
      
      // Informations dropshipping
      isDropshipping: true,
      dropshippingData: {
        supplierId: dropshippingProduct.supplierId._id,
        supplierProductId: dropshippingProduct.supplierProductId,
        supplierPrice,
        margin,
        processingTime: dropshippingProduct.shipping?.processingTime || 1
      },
      
      // Stock
      stock: dropshippingProduct.inventory.isUnlimited ? 999999 : dropshippingProduct.inventory.quantity,
      trackQuantity: !dropshippingProduct.inventory.isUnlimited,
      
      // Expédition
      weight: dropshippingProduct.shipping?.weight,
      dimensions: dropshippingProduct.shipping?.dimensions,
      
      // Variantes
      variants: dropshippingProduct.variants.map(variant => ({
        ...variant,
        price: variant.price ? variant.price * (1 + margin / 100) : salePrice,
        cost: variant.price || supplierPrice
      })),
      
      isActive: true,
      createdBy: session.user.id
    };

    const product = await Product.create(productData);

    return NextResponse.json({
      success: true,
      data: product,
      message: "Produit importé avec succès dans votre catalogue"
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur import produit dropshipping:', error);
    return NextResponse.json({
      success: false,
      message: "Erreur lors de l'import du produit",
      error: error.message
    }, { status: 500 });
  }
}


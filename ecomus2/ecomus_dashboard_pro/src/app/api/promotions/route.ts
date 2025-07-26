import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";

// Modèle Promotion
const promotionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  type: { 
    type: String, 
    enum: ['percentage', 'fixed', 'bogo', 'free_shipping'], 
    required: true 
  },
  value: { type: Number, required: true },
  code: { type: String, unique: true, sparse: true },
  isActive: { type: Boolean, default: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  usageLimit: { type: Number },
  usageCount: { type: Number, default: 0 },
  minOrderAmount: { type: Number },
  applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  targetCustomers: { 
    type: String, 
    enum: ['all', 'new', 'returning', 'vip'], 
    default: 'all' 
  },
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Promotion = mongoose.models.Promotion || mongoose.model('Promotion', promotionSchema);

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    
    if (!token || !token.sub) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId");
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    await connectDB();

    // Construire le filtre
    const filter: any = {};
    
    if (storeId) {
      filter.store = new mongoose.Types.ObjectId(storeId);
    }

    if (status === 'active') {
      filter.isActive = true;
      filter.startDate = { $lte: new Date() };
      filter.endDate = { $gte: new Date() };
    } else if (status === 'inactive') {
      filter.isActive = false;
    } else if (status === 'expired') {
      filter.endDate = { $lt: new Date() };
    } else if (status === 'scheduled') {
      filter.startDate = { $gt: new Date() };
    }

    if (type) {
      filter.type = type;
    }

    // Récupérer les promotions avec pagination
    const skip = (page - 1) * limit;
    
    const [promotions, total] = await Promise.all([
      Promotion.find(filter)
        .populate('store', 'name slug')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Promotion.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit);

    // Statistiques
    const stats = await Promotion.aggregate([
      { $match: storeId ? { store: new mongoose.Types.ObjectId(storeId) } : {} },
      {
        $group: {
          _id: null,
          totalPromotions: { $sum: 1 },
          activePromotions: { 
            $sum: { 
              $cond: [
                { 
                  $and: [
                    { $eq: ['$isActive', true] },
                    { $lte: ['$startDate', new Date()] },
                    { $gte: ['$endDate', new Date()] }
                  ]
                }, 
                1, 
                0
              ] 
            }
          },
          totalUsage: { $sum: '$usageCount' },
          totalSavings: { $sum: { $multiply: ['$usageCount', '$value'] } }
        }
      }
    ]);

    return NextResponse.json({
      success: true,
      promotions,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      stats: stats[0] || {
        totalPromotions: 0,
        activePromotions: 0,
        totalUsage: 0,
        totalSavings: 0
      }
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des promotions:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération des promotions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    
    if (!token || !token.sub) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const promotionData = await request.json();

    await connectDB();

    // Validation des données
    if (!promotionData.name?.trim()) {
      return NextResponse.json(
        { error: 'Le nom de la promotion est requis' },
        { status: 400 }
      );
    }

    if (!promotionData.type) {
      return NextResponse.json(
        { error: 'Le type de promotion est requis' },
        { status: 400 }
      );
    }

    if (promotionData.type !== 'free_shipping' && (!promotionData.value || promotionData.value <= 0)) {
      return NextResponse.json(
        { error: 'La valeur de la promotion doit être supérieure à 0' },
        { status: 400 }
      );
    }

    if (!promotionData.startDate || !promotionData.endDate) {
      return NextResponse.json(
        { error: 'Les dates de début et fin sont requises' },
        { status: 400 }
      );
    }

    if (new Date(promotionData.startDate) >= new Date(promotionData.endDate)) {
      return NextResponse.json(
        { error: 'La date de fin doit être postérieure à la date de début' },
        { status: 400 }
      );
    }

    // Vérifier l'unicité du code promo
    if (promotionData.code) {
      const existingPromotion = await Promotion.findOne({ 
        code: promotionData.code,
        store: promotionData.storeId 
      });
      
      if (existingPromotion) {
        return NextResponse.json(
          { error: 'Ce code promo existe déjà pour cette boutique' },
          { status: 409 }
        );
      }
    }

    // Créer la promotion
    const promotion = new Promotion({
      name: promotionData.name.trim(),
      description: promotionData.description || '',
      type: promotionData.type,
      value: promotionData.type === 'free_shipping' ? 0 : Number(promotionData.value),
      code: promotionData.code?.trim() || undefined,
      isActive: Boolean(promotionData.isActive),
      startDate: new Date(promotionData.startDate),
      endDate: new Date(promotionData.endDate),
      usageLimit: promotionData.usageLimit ? Number(promotionData.usageLimit) : undefined,
      minOrderAmount: promotionData.minOrderAmount ? Number(promotionData.minOrderAmount) : undefined,
      applicableProducts: promotionData.applicableProducts || [],
      applicableCategories: promotionData.applicableCategories || [],
      targetCustomers: promotionData.targetCustomers || 'all',
      store: promotionData.storeId,
      createdBy: token.sub,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await promotion.save();

    // Populate les relations
    await promotion.populate('store', 'name slug');
    await promotion.populate('createdBy', 'name email');

    return NextResponse.json({
      success: true,
      message: 'Promotion créée avec succès',
      promotion
    }, { status: 201 });

  } catch (error: any) {
    console.error("Erreur lors de la création de la promotion:", error);
    
    // Gestion des erreurs de validation MongoDB
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { 
          error: 'Erreur de validation',
          details: validationErrors,
          message: validationErrors.join(', ')
        },
        { status: 400 }
      );
    }
    
    // Gestion des erreurs de duplication
    if (error.code === 11000) {
      return NextResponse.json(
        { 
          error: 'Conflit de données',
          message: 'Ce code promo existe déjà'
        },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Erreur serveur',
        message: 'Une erreur inattendue s\'est produite lors de la création de la promotion'
      },
      { status: 500 }
    );
  }
}

// Fonction utilitaire pour valider une promotion
export async function validatePromotion(code: string, storeId: string, orderAmount: number, customerId?: string) {
  try {
    await connectDB();

    const promotion = await Promotion.findOne({
      code,
      store: storeId,
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    });

    if (!promotion) {
      return { valid: false, error: 'Code promo invalide ou expiré' };
    }

    // Vérifier la limite d'utilisation
    if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) {
      return { valid: false, error: 'Ce code promo a atteint sa limite d\'utilisation' };
    }

    // Vérifier le montant minimum
    if (promotion.minOrderAmount && orderAmount < promotion.minOrderAmount) {
      return { 
        valid: false, 
        error: `Montant minimum de ${promotion.minOrderAmount}€ requis` 
      };
    }

    // Calculer la réduction
    let discount = 0;
    switch (promotion.type) {
      case 'percentage':
        discount = (orderAmount * promotion.value) / 100;
        break;
      case 'fixed':
        discount = Math.min(promotion.value, orderAmount);
        break;
      case 'free_shipping':
        discount = 0; // La logique de livraison gratuite est gérée ailleurs
        break;
      case 'bogo':
        // Logique BOGO à implémenter selon les besoins
        discount = 0;
        break;
    }

    return {
      valid: true,
      promotion: {
        id: promotion._id,
        name: promotion.name,
        type: promotion.type,
        value: promotion.value,
        discount
      }
    };

  } catch (error) {
    console.error('Erreur lors de la validation de la promotion:', error);
    return { valid: false, error: 'Erreur lors de la validation' };
  }
}


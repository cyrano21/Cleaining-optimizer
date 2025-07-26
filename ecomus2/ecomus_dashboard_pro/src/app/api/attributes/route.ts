import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";

// Modèle DynamicAttribute
const attributeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  key: { type: String, required: true },
  description: { type: String },
  type: { 
    type: String, 
    enum: ['text', 'number', 'boolean', 'select', 'multiselect', 'date', 'color', 'image', 'textarea'], 
    required: true 
  },
  required: { type: Boolean, default: false },
  defaultValue: { type: mongoose.Schema.Types.Mixed },
  options: [{
    value: { type: String, required: true },
    label: { type: String, required: true },
    color: { type: String }
  }],
  validation: {
    min: { type: Number },
    max: { type: Number },
    pattern: { type: String },
    message: { type: String }
  },
  category: { type: String, required: true },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  applicableToProducts: { type: Boolean, default: true },
  applicableToCategories: { type: Boolean, default: false },
  applicableToStores: { type: Boolean, default: false },
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index composé pour éviter les doublons de clés par store
attributeSchema.index({ key: 1, store: 1 }, { unique: true });

const DynamicAttribute = mongoose.models.DynamicAttribute || mongoose.model('DynamicAttribute', attributeSchema);

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    
    if (!token || !token.sub) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId");
    const entityType = searchParams.get("entityType");
    const category = searchParams.get("category");
    const isActive = searchParams.get("isActive");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    await connectDB();

    // Construire le filtre
    const filter: any = {};
    
    if (storeId) {
      filter.store = new mongoose.Types.ObjectId(storeId);
    }

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (isActive !== null) {
      filter.isActive = isActive === 'true';
    }

    // Filtrer par type d'entité
    if (entityType) {
      switch (entityType) {
        case 'product':
          filter.applicableToProducts = true;
          break;
        case 'category':
          filter.applicableToCategories = true;
          break;
        case 'store':
          filter.applicableToStores = true;
          break;
      }
    }

    // Récupérer les attributs avec pagination
    const skip = (page - 1) * limit;
    
    const [attributes, total] = await Promise.all([
      DynamicAttribute.find(filter)
        .populate('store', 'name slug')
        .populate('createdBy', 'name email')
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      DynamicAttribute.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit);

    // Statistiques
    const stats = await DynamicAttribute.aggregate([
      { $match: storeId ? { store: new mongoose.Types.ObjectId(storeId) } : {} },
      {
        $group: {
          _id: null,
          totalAttributes: { $sum: 1 },
          activeAttributes: { $sum: { $cond: ['$isActive', 1, 0] } },
          requiredAttributes: { $sum: { $cond: ['$required', 1, 0] } },
          categoriesCount: { $addToSet: '$category' }
        }
      },
      {
        $project: {
          totalAttributes: 1,
          activeAttributes: 1,
          requiredAttributes: 1,
          categoriesCount: { $size: '$categoriesCount' }
        }
      }
    ]);

    // Grouper par catégorie
    const attributesByCategory = await DynamicAttribute.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$category',
          attributes: { $push: '$$ROOT' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return NextResponse.json({
      success: true,
      attributes,
      attributesByCategory,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      stats: stats[0] || {
        totalAttributes: 0,
        activeAttributes: 0,
        requiredAttributes: 0,
        categoriesCount: 0
      }
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des attributs:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération des attributs" },
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

    const attributeData = await request.json();

    await connectDB();

    // Validation des données
    if (!attributeData.name?.trim()) {
      return NextResponse.json(
        { error: 'Le nom de l\'attribut est requis' },
        { status: 400 }
      );
    }

    if (!attributeData.key?.trim()) {
      return NextResponse.json(
        { error: 'La clé de l\'attribut est requise' },
        { status: 400 }
      );
    }

    if (!attributeData.type) {
      return NextResponse.json(
        { error: 'Le type d\'attribut est requis' },
        { status: 400 }
      );
    }

    if (!attributeData.storeId) {
      return NextResponse.json(
        { error: 'L\'ID de la boutique est requis' },
        { status: 400 }
      );
    }

    // Validation de la clé (format technique)
    const keyPattern = /^[a-z][a-z0-9_]*$/;
    if (!keyPattern.test(attributeData.key)) {
      return NextResponse.json(
        { error: 'La clé doit commencer par une lettre et ne contenir que des lettres minuscules, chiffres et underscores' },
        { status: 400 }
      );
    }

    // Validation des options pour les types select
    if ((attributeData.type === 'select' || attributeData.type === 'multiselect') && 
        (!attributeData.options || attributeData.options.length === 0)) {
      return NextResponse.json(
        { error: 'Au moins une option est requise pour les listes déroulantes' },
        { status: 400 }
      );
    }

    // Vérifier l'unicité de la clé pour cette boutique
    const existingAttribute = await DynamicAttribute.findOne({
      key: attributeData.key,
      store: attributeData.storeId
    });

    if (existingAttribute) {
      return NextResponse.json(
        { error: 'Cette clé d\'attribut existe déjà pour cette boutique' },
        { status: 409 }
      );
    }

    // Déterminer l'ordre suivant
    const lastAttribute = await DynamicAttribute.findOne(
      { store: attributeData.storeId },
      {},
      { sort: { order: -1 } }
    );
    const nextOrder = lastAttribute ? lastAttribute.order + 1 : 0;

    // Créer l'attribut
    const attribute = new DynamicAttribute({
      name: attributeData.name.trim(),
      key: attributeData.key.trim(),
      description: attributeData.description || '',
      type: attributeData.type,
      required: Boolean(attributeData.required),
      defaultValue: attributeData.defaultValue,
      options: attributeData.options || [],
      validation: attributeData.validation || {},
      category: attributeData.category || 'Général',
      order: nextOrder,
      isActive: Boolean(attributeData.isActive ?? true),
      applicableToProducts: Boolean(attributeData.applicableToProducts ?? true),
      applicableToCategories: Boolean(attributeData.applicableToCategories ?? false),
      applicableToStores: Boolean(attributeData.applicableToStores ?? false),
      store: attributeData.storeId,
      createdBy: token.sub,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await attribute.save();

    // Populate les relations
    await attribute.populate('store', 'name slug');
    await attribute.populate('createdBy', 'name email');

    return NextResponse.json({
      success: true,
      message: 'Attribut créé avec succès',
      attribute
    }, { status: 201 });

  } catch (error: any) {
    console.error("Erreur lors de la création de l'attribut:", error);
    
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
          message: 'Cette clé d\'attribut existe déjà pour cette boutique'
        },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Erreur serveur',
        message: 'Une erreur inattendue s\'est produite lors de la création de l\'attribut'
      },
      { status: 500 }
    );
  }
}

// Fonction utilitaire pour valider une valeur d'attribut
export async function validateAttributeValue(attributeId: string, value: any) {
  try {
    await connectDB();

    const attribute = await DynamicAttribute.findById(attributeId);
    if (!attribute) {
      return { valid: false, error: 'Attribut non trouvé' };
    }

    if (!attribute.isActive) {
      return { valid: false, error: 'Attribut inactif' };
    }

    // Vérifier si l'attribut est requis
    if (attribute.required && (value === null || value === undefined || value === '')) {
      return { valid: false, error: `Le champ ${attribute.name} est obligatoire` };
    }

    // Si la valeur est vide et que l'attribut n'est pas requis, c'est valide
    if (value === null || value === undefined || value === '') {
      return { valid: true };
    }

    // Validation par type
    switch (attribute.type) {
      case 'text':
      case 'textarea':
        if (typeof value !== 'string') {
          return { valid: false, error: 'La valeur doit être une chaîne de caractères' };
        }
        if (attribute.validation?.pattern) {
          const regex = new RegExp(attribute.validation.pattern);
          if (!regex.test(value)) {
            return { 
              valid: false, 
              error: attribute.validation.message || 'Format invalide' 
            };
          }
        }
        break;

      case 'number':
        const numValue = Number(value);
        if (isNaN(numValue)) {
          return { valid: false, error: 'La valeur doit être un nombre' };
        }
        if (attribute.validation?.min !== undefined && numValue < attribute.validation.min) {
          return { 
            valid: false, 
            error: `La valeur doit être supérieure ou égale à ${attribute.validation.min}` 
          };
        }
        if (attribute.validation?.max !== undefined && numValue > attribute.validation.max) {
          return { 
            valid: false, 
            error: `La valeur doit être inférieure ou égale à ${attribute.validation.max}` 
          };
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean') {
          return { valid: false, error: 'La valeur doit être un booléen' };
        }
        break;

      case 'date':
        const dateValue = new Date(value);
        if (isNaN(dateValue.getTime())) {
          return { valid: false, error: 'Format de date invalide' };
        }
        break;

      case 'color':
        const colorPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        if (!colorPattern.test(value)) {
          return { valid: false, error: 'Format de couleur invalide (ex: #FF0000)' };
        }
        break;

      case 'select':
        const validOption = attribute.options?.find(option => option.value === value);
        if (!validOption) {
          return { valid: false, error: 'Option non valide' };
        }
        break;

      case 'multiselect':
        if (!Array.isArray(value)) {
          return { valid: false, error: 'La valeur doit être un tableau' };
        }
        const validOptions = attribute.options?.map(option => option.value) || [];
        const invalidValues = value.filter(v => !validOptions.includes(v));
        if (invalidValues.length > 0) {
          return { valid: false, error: `Options non valides: ${invalidValues.join(', ')}` };
        }
        break;
    }

    return { valid: true };

  } catch (error) {
    console.error('Erreur lors de la validation de l\'attribut:', error);
    return { valid: false, error: 'Erreur lors de la validation' };
  }
}


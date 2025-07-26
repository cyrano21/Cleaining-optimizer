import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/mongodb";
import Template from "@/models/Template";

export async function GET(req: NextRequest) {
  await connectDB();
  
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') || 'desc';
  const isPremium = searchParams.get('isPremium');
  
  // Construction du filtre de recherche
  const filter: any = { isActive: true };
  
  // Filtre par recherche
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }
  
  // Filtre par catégorie
  if (category && category !== 'All') {
    filter.category = category;
  }
  
  // Filtre premium
  if (isPremium !== null) {
    filter.isPremium = isPremium === 'true';
  }
  
  try {
    // Calcul du skip pour la pagination
    const skip = (page - 1) * limit;
    
    // Construction du tri
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Récupération des templates avec pagination
    const [templates, total] = await Promise.all([
      Template.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Template.countDocuments(filter)
    ]);
    
    // Récupération des catégories pour les filtres
    const categories = await Template.distinct('category', { isActive: true });
    
    const totalPages = Math.ceil(total / limit);
    
    return NextResponse.json({
      templates,
      pagination: {
        current: page,
        total: totalPages,
        limit,
        totalDocuments: total
      },
      categories: categories.sort(),
      filters: {
        search,
        category,
        isPremium,
        sortBy,
        sortOrder
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des templates:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des templates' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  await connectDB();
  
  try {
    const body = await req.json();
    
    // Validation des champs requis
    if (!body.name || !body.category || !body.author) {
      return NextResponse.json(
        { error: 'Champs requis manquants: name, category, author' },
        { status: 400 }
      );
    }
    
    // Génération du slug si pas fourni
    const slug = body.slug || body.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    // Vérification de l'unicité du slug
    const existingTemplate = await Template.findOne({ slug });
    if (existingTemplate) {
      return NextResponse.json(
        { error: 'Un template avec ce slug existe déjà' },
        { status: 409 }
      );
    }
    
    const template = await Template.create({
      name: body.name,
      slug,
      description: body.description || '',
      category: body.category,
      tags: body.tags || [],
      previewUrl: body.previewUrl || '',
      previewImage: body.previewImage || '',
      components: body.components || { sections: ["hero"] },
      features: body.features || [],
      price: body.price || 0,
      isPremium: body.isPremium || false,
      author: body.author,
      version: body.version || "1.0.0",
      compatibility: body.compatibility || ["latest"],
      isActive: body.isActive !== undefined ? body.isActive : true,
    });
    
    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du template:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du template' },
      { status: 500 }
    );
  }
}

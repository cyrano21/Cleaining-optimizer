import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/dbConnect';
import { SubscriptionPlan } from '../../../models/SaasModels';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET /api/plans - Récupérer tous les plans d'abonnement
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    const role = searchParams.get('role');

    let query = {};
    
    if (activeOnly) {
      query.isActive = true;
    }
    
    if (role) {
      query.allowedRoles = { $in: [role] };
    }

    const plans = await SubscriptionPlan.find(query)
      .sort({ order: 1, 'pricing.monthly': 1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: plans
    });

  } catch (error) {
    console.error('Erreur API plans:', error);
    return NextResponse.json({
      success: false,
      message: "Erreur lors de la récupération des plans",
      error: error.message
    }, { status: 500 });
  }
}

// POST /api/plans - Créer un nouveau plan (Super Admin seulement)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ 
        success: false, 
        message: "Accès non autorisé - Super Admin requis" 
      }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    
    // Validation des champs requis
    const { name, pricing } = body;
    if (!name || !pricing) {
      return NextResponse.json({
        success: false,
        message: "Nom et prix requis"
      }, { status: 400 });
    }

    // Générer un slug unique
    const baseSlug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    let slug = baseSlug;
    let counter = 1;
    
    while (await SubscriptionPlan.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Créer le plan
    const planData = {
      ...body,
      slug,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const plan = await SubscriptionPlan.create(planData);

    return NextResponse.json({
      success: true,
      data: plan,
      message: "Plan créé avec succès"
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur création plan:', error);
    return NextResponse.json({
      success: false,
      message: "Erreur lors de la création du plan",
      error: error.message
    }, { status: 500 });
  }
}

// PUT /api/plans - Mettre à jour un plan
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ 
        success: false, 
        message: "Accès non autorisé - Super Admin requis" 
      }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        message: "ID du plan requis"
      }, { status: 400 });
    }

    const plan = await SubscriptionPlan.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!plan) {
      return NextResponse.json({
        success: false,
        message: "Plan introuvable"
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: plan,
      message: "Plan mis à jour avec succès"
    });

  } catch (error) {
    console.error('Erreur mise à jour plan:', error);
    return NextResponse.json({
      success: false,
      message: "Erreur lors de la mise à jour du plan",
      error: error.message
    }, { status: 500 });
  }
}


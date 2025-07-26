import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import connectDB from '@/lib/mongodb';
import SystemSettings from '@/models/SystemSettings';

// GET - Récupérer tous les paramètres ou par catégorie
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isPublic = searchParams.get('public') === 'true';
    
    await connectDB();

    const query: any = {};
    
    if (category) {
      query.category = category;
    }
    
    if (isPublic) {
      query.isPublic = true;
    } else {
      // Vérifier l'authentification pour les paramètres privés
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
      }
    }

    const settings = await SystemSettings.find(query).sort({ category: 1, settingKey: 1 });
    
    // Organiser par catégorie
    const settingsByCategory = settings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = {};
      }
      acc[setting.category][setting.settingKey] = {
        value: setting.settingValue,
        label: setting.label,
        description: setting.description,
        type: setting.type,
        isEditable: setting.isEditable,
        isPublic: setting.isPublic
      };
      return acc;
    }, {} as any);

    return NextResponse.json({
      success: true,
      data: category ? settingsByCategory[category] || {} : settingsByCategory,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau paramètre
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    await connectDB();

    const body = await request.json();
    const { settingKey, settingValue, category, label, description, type, isEditable = true, isPublic = false } = body;

    if (!settingKey || !settingValue || !category || !label || !type) {
      return NextResponse.json({ 
        error: 'Champs obligatoires manquants' 
      }, { status: 400 });
    }

    // Vérifier si le paramètre existe déjà
    const existingSetting = await SystemSettings.findOne({ settingKey });
    if (existingSetting) {
      return NextResponse.json({ 
        error: 'Un paramètre avec cette clé existe déjà' 
      }, { status: 409 });
    }

    const newSetting = new SystemSettings({
      settingKey,
      settingValue,
      category,
      label,
      description,
      type,
      isEditable,
      isPublic
    });

    await newSetting.save();

    return NextResponse.json({
      success: true,
      message: 'Paramètre créé avec succès',
      data: newSetting
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur lors de la création du paramètre:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour des paramètres
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    await connectDB();

    const body = await request.json();
    const { updates } = body; // Array d'objets { settingKey, settingValue }

    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json({ 
        error: 'Format de mise à jour invalide' 
      }, { status: 400 });
    }

    const results = [];
    
    for (const update of updates) {
      const { settingKey, settingValue } = update;
      
      if (!settingKey || settingValue === undefined) {
        results.push({ settingKey, success: false, error: 'Données manquantes' });
        continue;
      }

      try {
        const setting = await SystemSettings.findOneAndUpdate(
          { settingKey, isEditable: true },
          { settingValue, updatedAt: new Date() },
          { new: true, runValidators: true }
        );

        if (!setting) {
          results.push({ settingKey, success: false, error: 'Paramètre introuvable ou non éditable' });
        } else {
          results.push({ settingKey, success: true, newValue: setting.settingValue });
        }
      } catch (error) {
        results.push({ settingKey, success: false, error: (error as Error).message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    return NextResponse.json({
      success: failureCount === 0,
      message: `${successCount} paramètre(s) mis à jour avec succès${failureCount > 0 ? `, ${failureCount} échec(s)` : ''}`,
      results
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour des paramètres:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}

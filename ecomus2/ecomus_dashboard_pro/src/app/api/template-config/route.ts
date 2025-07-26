import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { ObjectId } from 'mongodb';

// Modèle de configuration de template
interface TemplateConfig {
  _id?: ObjectId;
  storeId?: ObjectId;
  templateId: string;
  sections: Record<string, any>;
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    darkMode?: boolean;
  };
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  isGlobal?: boolean; // Configuration globale (pour la vitrine) ou spécifique à une boutique
  createdAt: Date;
  updatedAt: Date;
}

// GET: Récupérer la configuration d'un template
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('templateId');
    const storeId = searchParams.get('storeId');
    const isGlobal = searchParams.get('global') === 'true';

    if (!templateId) {
      return NextResponse.json({ error: 'templateId requis' }, { status: 400 });
    }

    const mongoose = await connectDB();
    const db = mongoose.connection.db!;
    
    let query: any = { templateId };
    
    if (isGlobal) {
      query.isGlobal = true;
    } else if (storeId) {
      query.storeId = new ObjectId(storeId);
    } else {
      // Si pas de storeId et pas global, chercher une config globale par défaut
      query.isGlobal = true;
    }

    const config = await db.collection('templateConfigs').findOne(query);

    if (!config) {
      return NextResponse.json({ 
        message: 'Aucune configuration trouvée',
        useDefault: true 
      }, { status: 404 });
    }

    return NextResponse.json({ config });

  } catch (error) {
    console.error('Erreur lors de la récupération de la configuration:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}

// POST: Créer ou mettre à jour la configuration d'un template
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { templateId, storeId, sections, theme, seo, isGlobal = false } = body;

    if (!templateId || !sections) {
      return NextResponse.json({ 
        error: 'templateId et sections requis' 
      }, { status: 400 });
    }

    const mongoose = await connectDB();
    const db = mongoose.connection.db!;

    const configData: Partial<TemplateConfig> = {
      templateId,
      sections,
      theme,
      seo,
      isGlobal,
      updatedAt: new Date()
    };

    if (storeId && !isGlobal) {
      configData.storeId = new ObjectId(storeId);
    }

    // Chercher une configuration existante
    let query: any = { templateId };
    if (isGlobal) {
      query.isGlobal = true;
    } else if (storeId) {
      query.storeId = new ObjectId(storeId);
    }

    const existingConfig = await db.collection('templateConfigs').findOne(query);

    let result;
    if (existingConfig) {
      // Mettre à jour
      result = await db.collection('templateConfigs').updateOne(
        { _id: existingConfig._id },
        { $set: configData }
      );
    } else {
      // Créer
      configData.createdAt = new Date();
      result = await db.collection('templateConfigs').insertOne(configData);
    }

    let configId = existingConfig?._id;
    if (!existingConfig && 'insertedId' in result) {
      configId = result.insertedId;
    }
    return NextResponse.json({
      message: existingConfig ? 'Configuration mise à jour' : 'Configuration créée',
      success: true,
      configId
    });

  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la configuration:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}

// DELETE: Supprimer une configuration de template
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const configId = searchParams.get('configId');

    if (!configId) {
      return NextResponse.json({ error: 'configId requis' }, { status: 400 });
    }

    const mongoose = await connectDB();
    const db = mongoose.connection.db!;
    
    const result = await db.collection('templateConfigs').deleteOne({
      _id: new ObjectId(configId)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ 
        error: 'Configuration non trouvée' 
      }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Configuration supprimée avec succès',
      success: true
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de la configuration:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}

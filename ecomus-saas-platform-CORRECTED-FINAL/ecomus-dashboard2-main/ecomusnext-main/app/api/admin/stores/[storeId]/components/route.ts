import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Store from '@/models/Store';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * API GESTION COMPOSANTS DYNAMIQUES - ADMIN
 * 
 * Permet aux admins de gérer les composants dynamiques des stores :
 * - Récupérer la configuration actuelle
 * - Mettre à jour les composants
 * - Ajouter/supprimer des sections
 * - Réorganiser l'ordre des composants
 */

// GET - Récupérer les composants dynamiques d'une store
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Accès non autorisé' },
        { status: 401 }
      );
    }

    await connectDB();
    const { storeId } = await params;

    const store = await Store.findById(storeId).select('dynamicComponents name slug');
    
    if (!store) {
      return NextResponse.json(
        { success: false, error: 'Store non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        storeId: store._id,
        storeName: store.name,
        storeSlug: store.slug,
        dynamicComponents: store.dynamicComponents || {
          layout: {
            type: 'single-page',
            containerWidth: 'container',
            spacing: 'normal',
            gridSystem: '12-col'
          },
          sections: [],
          navigation: {
            header: {
              type: 'classic',
              logo: { type: 'text', content: store.name },
              menu: { items: [], style: 'horizontal' },
              actions: {
                search: { enabled: true },
                cart: { enabled: true },
                account: { enabled: true }
              }
            },
            footer: {
              type: 'detailed',
              columns: [],
              social: { enabled: true, platforms: [] }
            }
          },
          globalSettings: {
            typography: {
              fontFamily: 'Inter, sans-serif',
              baseFontSize: 16,
              lineHeight: 1.5
            },
            colors: {
              primary: '#007bff',
              secondary: '#6c757d',
              accent: '#28a745'
            }
          }
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des composants:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour les composants dynamiques d'une store
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Accès non autorisé' },
        { status: 401 }
      );
    }

    const { dynamicComponents, action } = await request.json();
    const { storeId } = await params;

    await connectDB();

    const store = await Store.findById(storeId);
    
    if (!store) {
      return NextResponse.json(
        { success: false, error: 'Store non trouvée' },
        { status: 404 }
      );
    }

    // Actions spécifiques selon le type d'opération
    switch (action) {
      case 'update-all':
        // Mise à jour complète de la configuration
        store.dynamicComponents = dynamicComponents;
        break;
        
      case 'add-section':
        // Ajouter une nouvelle section
        if (!store.dynamicComponents) {
          store.dynamicComponents = { sections: [] };
        }
        if (!store.dynamicComponents.sections) {
          store.dynamicComponents.sections = [];
        }
        store.dynamicComponents.sections.push(dynamicComponents.newSection);
        break;
        
      case 'update-section':
        // Mettre à jour une section existante
        const sectionIndex = store.dynamicComponents.sections?.findIndex(
          section => section.id === dynamicComponents.sectionId
        );
        if (sectionIndex !== -1) {
          store.dynamicComponents.sections[sectionIndex] = dynamicComponents.sectionData;
        }
        break;
        
      case 'delete-section':
        // Supprimer une section
        store.dynamicComponents.sections = store.dynamicComponents.sections?.filter(
          section => section.id !== dynamicComponents.sectionId
        ) || [];
        break;
        
      case 'reorder-sections':
        // Réorganiser l'ordre des sections
        store.dynamicComponents.sections = dynamicComponents.orderedSections;
        break;
        
      case 'update-navigation':
        // Mettre à jour la navigation
        if (!store.dynamicComponents) {
          store.dynamicComponents = {};
        }
        store.dynamicComponents.navigation = dynamicComponents.navigation;
        break;
        
      case 'update-global-settings':
        // Mettre à jour les paramètres globaux
        if (!store.dynamicComponents) {
          store.dynamicComponents = {};
        }
        store.dynamicComponents.globalSettings = dynamicComponents.globalSettings;
        break;
        
      default:
        return NextResponse.json(
          { success: false, error: 'Action non reconnue' },
          { status: 400 }
        );
    }

    // Sauvegarder les modifications
    await store.save();

    return NextResponse.json({
      success: true,
      message: 'Composants mis à jour avec succès',
      data: {
        storeId: store._id,
        dynamicComponents: store.dynamicComponents
      }
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour des composants:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// POST - Créer un template de composants à partir d'une store existante
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Accès non autorisé' },
        { status: 401 }
      );
    }

    const { templateName, templateDescription } = await request.json();
    const { storeId } = await params;

    await connectDB();

    const store = await Store.findById(storeId);
    
    if (!store) {
      return NextResponse.json(
        { success: false, error: 'Store non trouvée' },
        { status: 404 }
      );
    }

    // Créer un template à partir de la configuration actuelle
    // (Ici on pourrait sauvegarder dans une collection "ComponentTemplates")
    const template = {
      name: templateName,
      description: templateDescription,
      dynamicComponents: store.dynamicComponents,
      createdBy: session.user.id,
      createdAt: new Date(),
      basedOnStore: store._id,
      category: store.homeTheme
    };

    // TODO: Sauvegarder le template dans une collection dédiée
    
    return NextResponse.json({
      success: true,
      message: 'Template créé avec succès',
      data: { template }
    });

  } catch (error) {
    console.error('Erreur lors de la création du template:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

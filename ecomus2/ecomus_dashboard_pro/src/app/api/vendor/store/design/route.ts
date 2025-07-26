import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import dbConnect from '@/lib/mongodb';
import Store from '@/models/Store';

// Interface pour les données de personnalisation
interface Customizations {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  layout?: {
    headerStyle: string;
    footerStyle: string;
  };
}

// Interface pour le body de la requête
interface DesignRequestBody {
  storeId: string;
  customizations: Partial<Customizations>;
}

/**
 * POST /api/vendor/store/design
 * Met à jour les personnalisations de design du store
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }    await dbConnect();

    const body: DesignRequestBody = await request.json();
    const { storeId, customizations } = body;

    if (!storeId || !customizations) {
      return NextResponse.json({ 
        error: 'Store ID et personnalisations requis' 
      }, { status: 400 });
    }

    // Vérifier que le store appartient au vendeur
    const store = await Store.findOne({ 
      _id: storeId, 
      owner: session.user.id 
    });

    if (!store) {
      return NextResponse.json({ 
        error: 'Boutique non trouvée ou accès refusé' 
      }, { status: 404 });
    }    // Validation des personnalisations
    const validatedCustomizations: Customizations = {
      colors: {
        primary: customizations.colors?.primary || '#007bff',
        secondary: customizations.colors?.secondary || '#6c757d',
        accent: customizations.colors?.accent || '#28a745'
      },
      fonts: {
        heading: customizations.fonts?.heading || 'Inter',
        body: customizations.fonts?.body || 'Inter'
      },
      layout: customizations.layout || store.design?.customizations?.layout || {
        headerStyle: 'modern',
        footerStyle: 'simple'
      }
    };

    // Vérifier que les couleurs sont des codes hex valides
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexColorRegex.test(validatedCustomizations.colors.primary) ||
        !hexColorRegex.test(validatedCustomizations.colors.secondary) ||
        !hexColorRegex.test(validatedCustomizations.colors.accent)) {
      return NextResponse.json({ 
        error: 'Format de couleur invalide (utilisez #RRGGBB)' 
      }, { status: 400 });
    }

    // Mettre à jour les personnalisations
    const updatedStore = await Store.findByIdAndUpdate(
      storeId,
      {
        $set: {
          'design.customizations': validatedCustomizations
        }
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Personnalisations sauvegardées avec succès',
      data: {
        customizations: updatedStore.design.customizations,
        store: updatedStore
      }
    });
  } catch (error: unknown) {
    console.error('Erreur sauvegarde design:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la sauvegarde des personnalisations' },
      { status: 500 }
    );
  }
}

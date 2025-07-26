import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import connectDB from '@/lib/mongodb';
import Store from '@/models/Store';
import { createApiResponse, createApiError } from '@/lib/api-helpers';

/**
 * API pour la customisation des stores par les vendeurs
 * GET /api/vendor/stores/customize - Récupérer les customisations actuelles
 * PUT /api/vendor/stores/customize - Mettre à jour les customisations
 */

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    
    // Vérifier que l'utilisateur est vendeur
    if (!session?.user || session.user.role !== 'vendor') {
      return createApiError('Accès non autorisé - Vendeur requis', 403);
    }

    // Trouver la store du vendeur
    const store = await Store.findOne({ 
      vendor: session.user.id,
      vendorStatus: 'approved'
    }).lean() as any;

    if (!store) {
      return createApiError('Aucune store assignée et approuvée', 404);
    }

    return createApiResponse({
      store: {
        id: store._id.toString(),
        name: store.name,
        slug: store.slug,
        homeName: store.homeName,
        homeTheme: store.homeTheme,
        isActive: store.isActive,
        customizations: store.customizations || {
          colors: {
            primary: '#007bff',
            secondary: '#6c757d',
            accent: '#28a745'
          },
          branding: {
            storeName: store.homeName,
            logo: null,
            favicon: null
          },
          layout: {
            style: 'default',
            headerType: 'classic',
            footerType: 'simple'
          }
        },
        seo: store.seo || {
          title: store.homeName,
          description: store.homeDescription,
          keywords: [store.homeTheme],
          ogImage: null
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des customisations:', error);
    return createApiError('Erreur interne du serveur', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    
    // Vérifier que l'utilisateur est vendeur
    if (!session?.user || session.user.role !== 'vendor') {
      return createApiError('Accès non autorisé - Vendeur requis', 403);
    }

    const updateData = await request.json();
    const { customizations, seo } = updateData;

    // Validation des données
    if (customizations) {
      // Validation des couleurs
      if (customizations.colors) {
        const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
        if (customizations.colors.primary && !hexColorRegex.test(customizations.colors.primary)) {
          return createApiError('Couleur primaire invalide (format hex requis)', 400);
        }
        if (customizations.colors.secondary && !hexColorRegex.test(customizations.colors.secondary)) {
          return createApiError('Couleur secondaire invalide (format hex requis)', 400);
        }
        if (customizations.colors.accent && !hexColorRegex.test(customizations.colors.accent)) {
          return createApiError('Couleur d\'accent invalide (format hex requis)', 400);
        }
      }

      // Validation du layout
      if (customizations.layout) {
        const validStyles = ['default', 'modern', 'minimal'];
        const validHeaderTypes = ['classic', 'centered', 'split'];
        const validFooterTypes = ['simple', 'detailed', 'minimal'];

        if (customizations.layout.style && !validStyles.includes(customizations.layout.style)) {
          return createApiError('Style de layout invalide', 400);
        }
        if (customizations.layout.headerType && !validHeaderTypes.includes(customizations.layout.headerType)) {
          return createApiError('Type de header invalide', 400);
        }
        if (customizations.layout.footerType && !validFooterTypes.includes(customizations.layout.footerType)) {
          return createApiError('Type de footer invalide', 400);
        }
      }
    }

    // Trouver la store du vendeur
    const store = await Store.findOne({ 
      vendor: session.user.id,
      vendorStatus: 'approved'
    });

    if (!store) {
      return createApiError('Aucune store assignée et approuvée', 404);
    }

    // Construire les données de mise à jour
    const storeUpdateData: any = {
      updatedAt: new Date()
    };

    if (customizations) {
      // Fusionner avec les customisations existantes
      const existingCustomizations = store.customizations || {};
      storeUpdateData.customizations = {
        colors: {
          ...existingCustomizations.colors,
          ...customizations.colors
        },
        branding: {
          ...existingCustomizations.branding,
          ...customizations.branding
        },
        layout: {
          ...existingCustomizations.layout,
          ...customizations.layout
        }
      };
    }

    if (seo) {
      // Fusionner avec les données SEO existantes
      const existingSeo = store.seo || {};
      storeUpdateData.seo = {
        ...existingSeo,
        ...seo
      };
    }

    // Mettre à jour la store
    const updatedStore = await Store.findByIdAndUpdate(
      store._id,
      storeUpdateData,
      { new: true, runValidators: true }
    ).lean();

    if (!updatedStore) {
      return createApiError('La boutique mise à jour est introuvable', 404);
    }
    if (Array.isArray(updatedStore)) {
      return createApiError('Erreur interne: la boutique mise à jour ne doit pas être un tableau', 500);
    }

    // Log de la customisation
    console.log(`[VENDOR CUSTOMIZE] ${session.user.email} updated customizations for store: ${store.name}`);

    return createApiResponse({
      message: 'Customisations mises à jour avec succès',
      store: {
        id: updatedStore._id?.toString?.() || '',
        name: updatedStore.name,
        slug: updatedStore.slug,
        customizations: updatedStore.customizations,
        seo: updatedStore.seo,
        updatedAt: updatedStore.updatedAt
      }
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour des customisations:', error);
    return createApiError('Erreur interne du serveur', 500);
  }
}

/**
 * POST /api/vendor/stores/customize/preview - Générer une preview des customisations
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    
    // Vérifier que l'utilisateur est vendeur
    if (!session?.user || session.user.role !== 'vendor') {
      return createApiError('Accès non autorisé - Vendeur requis', 403);
    }

    const { customizations } = await request.json();

    // Trouver la store du vendeur
    const store = await Store.findOne({ 
      vendor: session.user.id,
      vendorStatus: 'approved'
    }).lean();

    if (!store) {
      return createApiError('Aucune store assignée et approuvée', 404);
    }
    if (Array.isArray(store)) {
      return createApiError('Erreur interne: la boutique trouvée ne doit pas être un tableau', 500);
    }

    // Générer les styles CSS personnalisés
    const cssVars = generateCustomCSS(customizations);

    return createApiResponse({
      previewData: {
        storeId: store._id?.toString?.() || '',
        storeName: customizations.branding?.storeName || store.homeName,
        homeTemplate: store.homeTemplate,
        cssVars,
        customizations,
        previewUrl: `/preview/store/${store.slug}?preview=true`
      }
    });

  } catch (error) {
    console.error('Erreur lors de la génération de la preview:', error);
    return createApiError('Erreur interne du serveur', 500);
  }
}

/**
 * Fonction utilitaire pour générer le CSS personnalisé
 */
function generateCustomCSS(customizations: any): string {
  const colors = customizations?.colors || {};
  const layout = customizations?.layout || {};

  const cssVars = [
    colors.primary && `--store-primary: ${colors.primary};`,
    colors.secondary && `--store-secondary: ${colors.secondary};`,
    colors.accent && `--store-accent: ${colors.accent};`,
    layout.style === 'modern' && `--store-border-radius: 12px;`,
    layout.style === 'minimal' && `--store-border-radius: 0px;`,
  ].filter(Boolean).join('\n');

  return `:root {\n${cssVars}\n}`;
}

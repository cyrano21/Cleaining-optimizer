import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import connectDB from '@/lib/mongodb';
import SystemSettings from '@/models/SystemSettings';

// POST - Initialiser les paramètres par défaut
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    await connectDB();

    // Paramètres par défaut pour les logos
    const defaultSettings = [
      // LOGOS
      {
        settingKey: 'mainLogo',
        settingValue: '/images/logo.png',
        category: 'logos',
        label: 'Logo Principal',
        description: 'Logo principal de l\'application affiché dans la navigation',
        type: 'image',
        isEditable: true,
        isPublic: true
      },
      {
        settingKey: 'authLogo',
        settingValue: '/auth/logo.png',
        category: 'logos',
        label: 'Logo Authentification',
        description: 'Logo affiché sur les pages de connexion et d\'inscription',
        type: 'image',
        isEditable: true,
        isPublic: true
      },
      {
        settingKey: 'ecommerceLogo',
        settingValue: '/e-commerce/logo.png',
        category: 'logos',
        label: 'Logo E-commerce',
        description: 'Logo pour la section e-commerce',
        type: 'image',
        isEditable: true,
        isPublic: true
      },
      {
        settingKey: 'storeLogo',
        settingValue: '/images/store-logo.png',
        category: 'logos',
        label: 'Logo Boutique par Défaut',
        description: 'Logo par défaut pour les nouvelles boutiques',
        type: 'image',
        isEditable: true,
        isPublic: true
      },
      {
        settingKey: 'adminLogo',
        settingValue: '/images/logo.png',
        category: 'logos',
        label: 'Logo Administration',
        description: 'Logo pour les interfaces d\'administration',
        type: 'image',
        isEditable: true,
        isPublic: false
      },
      {
        settingKey: 'emailLogo',
        settingValue: '/images/logo.png',
        category: 'logos',
        label: 'Logo Email',
        description: 'Logo utilisé dans les emails automatiques',
        type: 'image',
        isEditable: true,
        isPublic: false
      },
      {
        settingKey: 'faviconLogo',
        settingValue: '/favicon.ico',
        category: 'logos',
        label: 'Favicon',
        description: 'Icône affichée dans l\'onglet du navigateur',
        type: 'image',
        isEditable: true,
        isPublic: true
      },

      // BRANDING
      {
        settingKey: 'companyName',
        settingValue: 'Ecomus Dashboard',
        category: 'branding',
        label: 'Nom de l\'Entreprise',
        description: 'Nom de l\'entreprise affiché dans l\'application',
        type: 'text',
        isEditable: true,
        isPublic: true
      },
      {
        settingKey: 'tagline',
        settingValue: 'Plateforme de gestion e-commerce moderne',
        category: 'branding',
        label: 'Slogan',
        description: 'Slogan ou description courte de l\'entreprise',
        type: 'text',
        isEditable: true,
        isPublic: true
      },
      {
        settingKey: 'primaryColor',
        settingValue: '#8b5cf6',
        category: 'branding',
        label: 'Couleur Principale',
        description: 'Couleur principale de la marque',
        type: 'text',
        isEditable: true,
        isPublic: true
      },
      {
        settingKey: 'secondaryColor',
        settingValue: '#06b6d4',
        category: 'branding',
        label: 'Couleur Secondaire',
        description: 'Couleur secondaire de la marque',
        type: 'text',
        isEditable: true,
        isPublic: true
      },
      {
        settingKey: 'accentColor',
        settingValue: '#10b981',
        category: 'branding',
        label: 'Couleur d\'Accent',
        description: 'Couleur d\'accent pour les éléments importants',
        type: 'text',
        isEditable: true,
        isPublic: true
      }
    ];

    const results = [];
    let createdCount = 0;
    let skippedCount = 0;

    for (const settingData of defaultSettings) {
      try {
        // Vérifier si le paramètre existe déjà
        const existingSetting = await SystemSettings.findOne({ settingKey: settingData.settingKey });
        
        if (existingSetting) {
          results.push({ 
            settingKey: settingData.settingKey, 
            status: 'skipped', 
            message: 'Déjà existant' 
          });
          skippedCount++;
        } else {
          const newSetting = new SystemSettings(settingData);
          await newSetting.save();
          
          results.push({ 
            settingKey: settingData.settingKey, 
            status: 'created', 
            message: 'Créé avec succès' 
          });
          createdCount++;
        }
      } catch (error) {
        results.push({ 
          settingKey: settingData.settingKey, 
          status: 'error', 
          message: (error as Error).message 
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Initialisation terminée: ${createdCount} créés, ${skippedCount} ignorés`,
      results,
      summary: {
        total: defaultSettings.length,
        created: createdCount,
        skipped: skippedCount,
        errors: results.filter(r => r.status === 'error').length
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'initialisation des paramètres:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}

// GET - Vérifier l'état d'initialisation
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    await connectDB();

    const totalSettings = await SystemSettings.countDocuments();
    const logoSettings = await SystemSettings.countDocuments({ category: 'logos' });
    const brandingSettings = await SystemSettings.countDocuments({ category: 'branding' });

    const isInitialized = totalSettings > 0;
    const expectedLogoCount = 7; // mainLogo, authLogo, ecommerceLogo, storeLogo, adminLogo, emailLogo, faviconLogo
    const expectedBrandingCount = 5; // companyName, tagline, primaryColor, secondaryColor, accentColor

    return NextResponse.json({
      success: true,
      data: {
        isInitialized,
        totalSettings,
        logoSettings,
        brandingSettings,
        isComplete: logoSettings >= expectedLogoCount && brandingSettings >= expectedBrandingCount,
        expectedCounts: {
          logos: expectedLogoCount,
          branding: expectedBrandingCount
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la vérification de l\'initialisation:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}

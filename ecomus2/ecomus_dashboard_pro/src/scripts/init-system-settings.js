#!/usr/bin/env node

const connectDB = require('../src/lib/mongodb').default;
const SystemSettings = require('../src/models/SystemSettings').default;

async function initializeSystemSettings() {
  console.log('🚀 Initialisation des paramètres système...');
  
  try {
    await connectDB();
    console.log('✅ Connexion à MongoDB établie');

    // Paramètres par défaut
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

    let createdCount = 0;
    let skippedCount = 0;

    for (const settingData of defaultSettings) {
      const existingSetting = await SystemSettings.findOne({ settingKey: settingData.settingKey });
      
      if (existingSetting) {
        console.log(`⏭️  ${settingData.settingKey} existe déjà`);
        skippedCount++;
      } else {
        const newSetting = new SystemSettings(settingData);
        await newSetting.save();
        console.log(`✅ ${settingData.settingKey} créé`);
        createdCount++;
      }
    }

    console.log(`\n🎉 Initialisation terminée!`);
    console.log(`📊 Résumé:`);
    console.log(`   - ${createdCount} paramètres créés`);
    console.log(`   - ${skippedCount} paramètres existants ignorés`);
    console.log(`   - ${defaultSettings.length} paramètres au total\n`);

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Exécuter le script
initializeSystemSettings();

const mongoose = require('mongoose');

// Schema TemplateSection
const templateSectionSchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  templateId: {
    type: String,
    required: true
  },
  sectionType: {
    type: String,
    required: true,
    enum: ['hero', 'collections', 'products', 'testimonials', 'features', 'brands', 'newsletter', 'about']
  },
  sectionId: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  content: {
    title: String,
    subtitle: String,
    description: String,
    items: [{
      title: String,
      subtitle: String,
      description: String,
      image: String,
      link: String,
      buttonText: String,
      isActive: { type: Boolean, default: true }
    }],
    slides: [{
      title: String,
      subtitle: String,
      description: String,
      image: String,
      link: String,
      buttonText: String,
      isActive: { type: Boolean, default: true }
    }],
    layout: {
      type: String,
      enum: ['grid', 'carousel', 'list', 'single'],
      default: 'grid'
    },
    columns: {
      type: Number,
      default: 2,
      min: 1,
      max: 6
    },
    spacing: {
      type: String,
      enum: ['tight', 'normal', 'loose'],
      default: 'normal'
    },
    styles: {
      backgroundColor: String,
      textColor: String,
      accentColor: String,
      borderRadius: String,
      padding: String,
      margin: String
    }
  },
  responsive: {
    mobile: {
      columns: { type: Number, default: 1 },
      spacing: { type: String, default: 'normal' }
    },
    tablet: {
      columns: { type: Number, default: 2 },
      spacing: { type: String, default: 'normal' }
    },
    desktop: {
      columns: { type: Number, default: 2 },
      spacing: { type: String, default: 'normal' }
    }
  }
}, { collection: 'templatesections' });

const TemplateSection = mongoose.model('TemplateSection', templateSectionSchema);

// Schema Store simplifié
const storeSchema = new mongoose.Schema({
  name: String,
  slug: String,
  homeTheme: String
}, { collection: 'stores' });

const Store = mongoose.model('Store', storeSchema);

async function createDemoSections() {
  try {
    await mongoose.connect('mongodb://localhost:27017/ecommerce');
    console.log('✅ Connecté à MongoDB');

    // Trouver la boutique TechVision 3D
    const techvisionStore = await Store.findOne({ slug: 'techvision-3d' });
    
    if (!techvisionStore) {
      console.log('❌ Boutique techvision-3d non trouvée');
      return;
    }

    console.log('🏪 Boutique trouvée:', techvisionStore.name);

    // Supprimer les anciennes sections de démo
    await TemplateSection.deleteMany({ 
      storeId: techvisionStore._id,
      templateId: 'home-electronic'
    });
    console.log('🧹 Anciennes sections supprimées');

    // Créer les sections de démonstration
    const demoSections = [
      {
        storeId: techvisionStore._id,
        templateId: 'home-electronic',
        sectionType: 'collections',
        sectionId: 'collections-main',
        isActive: true,
        order: 1,
        content: {
          title: 'Collections Électroniques',
          subtitle: 'Découvrez nos gammes',
          description: 'Une sélection de produits high-tech pour tous vos besoins',
          layout: 'carousel',
          columns: 2,
          spacing: 'normal',
          items: [
            {
              title: 'Smartphones Premium',
              subtitle: 'Technologie de pointe',
              description: 'Les derniers modèles avec des performances exceptionnelles',
              image: 'https://res.cloudinary.com/dc2lce6ij/image/upload/v1735740000/electronics-smartphone_abc123.jpg',
              link: '/shop-collection-sub?category=smartphones',
              buttonText: 'Découvrir',
              isActive: true
            },
            {
              title: 'Audio & Casques',
              subtitle: 'Son immersif',
              description: 'Écouteurs sans fil et casques haute fidélité',
              image: 'https://res.cloudinary.com/dc2lce6ij/image/upload/v1735740000/electronics-audio_def456.jpg',
              link: '/shop-collection-sub?category=audio',
              buttonText: 'Explorer',
              isActive: true
            },
            {
              title: 'Ordinateurs & Laptops',
              subtitle: 'Performance ultime',
              description: 'Machines puissantes pour travail et gaming',
              image: 'https://res.cloudinary.com/dc2lce6ij/image/upload/v1735740000/electronics-laptop_ghi789.jpg',
              link: '/shop-collection-sub?category=computers',
              buttonText: 'Voir plus',
              isActive: true
            }
          ]
        },
        responsive: {
          mobile: { columns: 1, spacing: 'normal' },
          tablet: { columns: 2, spacing: 'normal' },
          desktop: { columns: 2, spacing: 'normal' }
        }
      },
      {
        storeId: techvisionStore._id,
        templateId: 'home-electronic',
        sectionType: 'features',
        sectionId: 'features-main',
        isActive: true,
        order: 2,
        content: {
          title: 'Pourquoi TechVision 3D ?',
          subtitle: 'Nos avantages',
          description: 'Une expérience d\'achat optimale avec des garanties exclusives',
          layout: 'grid',
          columns: 3,
          spacing: 'normal',
          items: [
            {
              title: 'Livraison Express',
              subtitle: '24h/48h',
              description: 'Livraison rapide et sécurisée partout en France',
              image: '🚚',
              isActive: true
            },
            {
              title: 'Garantie 3 ans',
              subtitle: 'Sérénité totale',
              description: 'Garantie étendue sur tous nos produits électroniques',
              image: '🛡️',
              isActive: true
            },
            {
              title: 'Support 7j/7',
              subtitle: 'Assistance dédiée',
              description: 'Notre équipe technique vous accompagne',
              image: '🎧',
              isActive: true
            }
          ]
        }
      }
    ];

    // Insérer les sections
    const insertedSections = await TemplateSection.insertMany(demoSections);
    console.log(`✅ ${insertedSections.length} sections de démonstration créées`);

    // Afficher un résumé
    console.log('\n📊 Sections créées:');
    insertedSections.forEach((section, index) => {
      console.log(`${index + 1}. ${section.sectionType} - ${section.content.title}`);
      console.log(`   📍 ${section.content.items?.length || 0} éléments`);
    });

    console.log('\n🎉 Sections de démonstration créées avec succès !');
    console.log('💡 Vous pouvez maintenant tester la page: http://localhost:3000/boutique/techvision-3d');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📴 Déconnecté de MongoDB');
  }
}

// Exécuter le script
createDemoSections();
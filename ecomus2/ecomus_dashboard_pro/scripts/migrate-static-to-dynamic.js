/**
 * Script de migration des données statiques vers la base de données
 * Transfère les templates et pages du fichier template-subscriptions.js vers MongoDB
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Données statiques à migrer
const STATIC_TEMPLATES = {
  free: [
    {
      id: 'home-02',
      name: 'Home Fashion Basic',
      description: 'Template basique pour boutique de mode',
      category: 'fashion',
      preview: '/templates/previews/home-02.jpg',
      features: ['Header simple', 'Section produits', 'Footer basique']
    },
    {
      id: 'home-03',
      name: 'Home General',
      description: 'Template généraliste polyvalent',
      category: 'generic',
      preview: '/templates/previews/home-03.jpg',
      features: ['Design épuré', 'Compatible mobile', 'SEO optimisé']
    }
  ],
  basic: [
    {
      id: 'home-accessories',
      name: 'Home Accessoires',
      description: 'Spécialisé pour accessoires de mode',
      category: 'accessories',
      preview: '/templates/previews/home-accessories.jpg',
      features: ['Grille produits', 'Filtres avancés', 'Zoom produit']
    },
    {
      id: 'home-footwear',
      name: 'Home Chaussures',
      description: 'Optimisé pour chaussures et sneakers',
      category: 'footwear',
      preview: '/templates/previews/home-footwear.jpg',
      features: ['Guide des tailles', 'Vue 360°', 'Comparaison modèles']
    },
    {
      id: 'home-handbag',
      name: 'Home Maroquinerie',
      description: 'Dédié aux sacs et maroquinerie',
      category: 'bags',
      preview: '/templates/previews/home-handbag.jpg',
      features: ['Galerie premium', 'Matériaux détaillés', 'Personnalisation']
    },
    {
      id: 'home-jewerly',
      name: 'Home Bijouterie',
      description: 'Élégant pour bijoux et montres',
      category: 'jewelry',
      preview: '/templates/previews/home-jewerly.jpg',
      features: ['Fond élégant', 'Zoom haute qualité', 'Certificats']
    }
  ],
  premium: [
    {
      id: 'home-cosmetic',
      name: 'Home Cosmétiques',
      description: 'Premium pour cosmétiques et beauté',
      category: 'beauty',
      preview: '/templates/previews/home-cosmetic.jpg',
      features: ['Testeur virtuel', 'Ingrédients détaillés', 'Tutoriels vidéo']
    },
    {
      id: 'home-skincare',
      name: 'Home Soins de la peau',
      description: 'Spécialisé soins et bien-être',
      category: 'skincare',
      preview: '/templates/previews/home-skincare.jpg',
      features: ['Diagnostic peau', 'Routine personnalisée', 'Conseils experts']
    },
    {
      id: 'home-electronic',
      name: 'Home Électronique',
      description: 'High-tech et électronique',
      category: 'tech',
      preview: '/templates/previews/home-electronic.jpg',
      features: ['Comparateur technique', 'AR preview', 'Support technique']
    },
    {
      id: 'home-furniture',
      name: 'Home Mobilier',
      description: 'Mobilier et décoration haut de gamme',
      category: 'furniture',
      preview: '/templates/previews/home-furniture.jpg',
      features: ['Configurateur 3D', 'Plan de pièce', 'Livraison premium']
    }
  ],
  enterprise: [
    {
      id: 'home-multi-brand',
      name: 'Home Multi-marques',
      description: 'Marketplace multi-vendeurs',
      category: 'marketplace',
      preview: '/templates/previews/home-multi-brand.jpg',
      features: ['Gestion multi-vendeurs', 'Dashboard avancé', 'Commission système']
    },
    {
      id: 'home-baby',
      name: 'Home Bébé Premium',
      description: 'Spécialisé puériculture premium',
      category: 'baby',
      preview: '/templates/previews/home-baby.jpg',
      features: ['Guide âge', 'Sécurité certifiée', 'Suivi développement']
    },
    {
      id: 'home-personalized-pod',
      name: 'Home Personnalisé POD',
      description: 'Print-on-demand personnalisé',
      category: 'pod',
      preview: '/templates/previews/home-personalized-pod.jpg',
      features: ['Designer intégré', 'Preview temps réel', 'Production automatique']
    }
  ]
};

const STATIC_PAGES = {
  free: [
    {
      id: 'about-us',
      name: 'À propos',
      description: 'Page présentation simple',
      category: 'info'
    },
    {
      id: 'contact-1',
      name: 'Contact basique',
      description: 'Formulaire de contact simple',
      category: 'contact'
    }
  ],
  basic: [
    {
      id: 'contact-2',
      name: 'Contact avancé',
      description: 'Contact avec carte et horaires',
      category: 'contact'
    },
    {
      id: 'faq-1',
      name: 'FAQ Simple',
      description: 'Questions fréquentes basiques',
      category: 'support'
    },
    {
      id: 'our-store',
      name: 'Notre boutique',
      description: 'Présentation magasin physique',
      category: 'info'
    }
  ],
  premium: [
    {
      id: 'faq-2',
      name: 'FAQ Avancée',
      description: 'FAQ avec recherche et catégories',
      category: 'support'
    },
    {
      id: 'store-locations',
      name: 'Nos magasins',
      description: 'Localisateur de magasins',
      category: 'locations'
    },
    {
      id: 'brands',
      name: 'Nos marques',
      description: 'Présentation des marques partenaires',
      category: 'brands'
    },
    {
      id: 'timeline',
      name: 'Notre histoire',
      description: 'Timeline de l\'entreprise',
      category: 'info'
    }
  ],
  enterprise: [
    {
      id: 'brands-v2',
      name: 'Marques Premium',
      description: 'Présentation marques avec analytics',
      category: 'brands'
    },
    {
      id: 'invoice',
      name: 'Factures',
      description: 'Système de facturation avancé',
      category: 'business'
    }
  ]
};

// Schémas Mongoose
const TemplateSubscriptionSchema = new mongoose.Schema({
  templateId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  previewUrl: String,
  features: [{
    name: { type: String, required: true },
    description: String
  }],
  subscriptionTier: {
    type: String,
    required: true,
    enum: ['free', 'basic', 'premium', 'enterprise']
  },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 }
}, { timestamps: true });

const PageSubscriptionSchema = new mongoose.Schema({
  pageId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  subscriptionTier: {
    type: String,
    required: true,
    enum: ['free', 'basic', 'premium', 'enterprise']
  },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 }
}, { timestamps: true });

const TemplateSubscription = mongoose.model('TemplateSubscription', TemplateSubscriptionSchema);
const PageSubscription = mongoose.model('PageSubscription', PageSubscriptionSchema);

async function migrateTemplates() {
  console.log('🔄 Migration des templates...');
  
  let totalTemplates = 0;
  let sortOrder = 0;
  
  for (const [tier, templates] of Object.entries(STATIC_TEMPLATES)) {
    console.log(`📁 Migration des templates ${tier}...`);
    
    for (const template of templates) {
      try {
        // Vérifier si le template existe déjà
        const existing = await TemplateSubscription.findOne({ templateId: template.id });
        if (existing) {
          console.log(`⚠️  Template ${template.id} existe déjà, ignoré`);
          continue;
        }
        
        // Convertir les features en format attendu
        const features = template.features.map(feature => ({
          name: feature,
          description: ''
        }));
        
        const newTemplate = new TemplateSubscription({
          templateId: template.id,
          name: template.name,
          description: template.description,
          category: template.category,
          previewUrl: template.preview,
          features,
          subscriptionTier: tier,
          sortOrder: sortOrder++,
          isActive: true
        });
        
        await newTemplate.save();
        totalTemplates++;
        console.log(`✅ Template ${template.id} migré`);
        
      } catch (error) {
        console.error(`❌ Erreur lors de la migration du template ${template.id}:`, error.message);
      }
    }
  }
  
  console.log(`✨ ${totalTemplates} templates migrés avec succès`);
}

async function migratePages() {
  console.log('🔄 Migration des pages...');
  
  let totalPages = 0;
  let sortOrder = 0;
  
  for (const [tier, pages] of Object.entries(STATIC_PAGES)) {
    console.log(`📁 Migration des pages ${tier}...`);
    
    for (const page of pages) {
      try {
        // Vérifier si la page existe déjà
        const existing = await PageSubscription.findOne({ pageId: page.id });
        if (existing) {
          console.log(`⚠️  Page ${page.id} existe déjà, ignorée`);
          continue;
        }
        
        const newPage = new PageSubscription({
          pageId: page.id,
          name: page.name,
          description: page.description,
          category: page.category,
          subscriptionTier: tier,
          sortOrder: sortOrder++,
          isActive: true
        });
        
        await newPage.save();
        totalPages++;
        console.log(`✅ Page ${page.id} migrée`);
        
      } catch (error) {
        console.error(`❌ Erreur lors de la migration de la page ${page.id}:`, error.message);
      }
    }
  }
  
  console.log(`✨ ${totalPages} pages migrées avec succès`);
}

async function main() {
  try {
    console.log('🚀 Début de la migration des données statiques vers MongoDB');
    
    // Connexion à MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI non défini dans les variables d\'environnement');
    }
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connexion à MongoDB établie');
    
    // Migration des templates
    await migrateTemplates();
    
    // Migration des pages
    await migratePages();
    
    console.log('🎉 Migration terminée avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Connexion MongoDB fermée');
  }
}

// Exécution du script
if (require.main === module) {
  main();
}

module.exports = { main };
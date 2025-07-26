const mongoose = require('mongoose');
require('dotenv').config();

// Schéma TemplateSubscription
const TemplateSubscriptionSchema = new mongoose.Schema({
  templateId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  previewUrl: String,
  features: [{
    name: String,
    description: String
  }],
  subscriptionTier: {
    type: String,
    enum: ['free', 'basic', 'premium', 'enterprise'],
    required: true
  },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 }
}, { timestamps: true });

const TemplateSubscription = mongoose.model('TemplateSubscription', TemplateSubscriptionSchema);

async function fixTemplateAccessibility() {
  try {
    console.log('🔍 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    console.log('\n🔧 Correction de l\'accessibilité des templates...');
    
    // Option 1: Convertir certains templates premium en free/basic
    console.log('\n📝 Option 1: Conversion de templates premium vers free/basic');
    
    const templatesToConvert = [
      { templateId: 'home-fashion', newTier: 'free' },
      { templateId: 'home-cosmetic', newTier: 'basic' },
      { templateId: 'home-skincare', newTier: 'basic' },
      { templateId: 'home-electronic', newTier: 'free' }
    ];
    
    for (const { templateId, newTier } of templatesToConvert) {
      const result = await TemplateSubscription.updateOne(
        { templateId },
        { $set: { subscriptionTier: newTier } }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`✅ ${templateId} converti vers ${newTier}`);
      } else {
        console.log(`⚠️  ${templateId} non trouvé ou déjà à jour`);
      }
    }
    
    // Option 2: Créer de nouveaux templates gratuits
    console.log('\n📝 Option 2: Création de nouveaux templates gratuits');
    
    const newFreeTemplates = [
      {
        templateId: 'home-simple-free',
        name: 'Home Simple Gratuit',
        description: 'Template simple et élégant pour débuter',
        category: 'generic',
        subscriptionTier: 'free',
        features: [
          { name: 'Design épuré', description: 'Interface simple et claire' },
          { name: 'Responsive', description: 'Adapté à tous les écrans' }
        ],
        isActive: true,
        sortOrder: 1
      },
      {
        templateId: 'home-fashion-basic',
        name: 'Home Fashion Basique',
        description: 'Template mode accessible à tous',
        category: 'fashion',
        subscriptionTier: 'free',
        features: [
          { name: 'Galerie produits', description: 'Affichage optimisé des vêtements' },
          { name: 'Filtres basiques', description: 'Recherche par catégorie' }
        ],
        isActive: true,
        sortOrder: 2
      },
      {
        templateId: 'home-accessories-free',
        name: 'Home Accessoires Gratuit',
        description: 'Template pour accessoires de mode',
        category: 'accessories',
        subscriptionTier: 'free',
        features: [
          { name: 'Mise en valeur produits', description: 'Focus sur les détails' },
          { name: 'Navigation simple', description: 'Parcours utilisateur optimisé' }
        ],
        isActive: true,
        sortOrder: 3
      },
      {
        templateId: 'home-beauty-basic',
        name: 'Home Beauté Basique',
        description: 'Template beauté avec fonctionnalités de base',
        category: 'beauty',
        subscriptionTier: 'basic',
        features: [
          { name: 'Présentation soins', description: 'Mise en avant des produits beauté' },
          { name: 'Conseils intégrés', description: 'Section conseils beauté' }
        ],
        isActive: true,
        sortOrder: 4
      }
    ];
    
    for (const template of newFreeTemplates) {
      try {
        await TemplateSubscription.create(template);
        console.log(`✅ Template créé: ${template.name} (${template.subscriptionTier})`);
      } catch (error) {
        if (error.code === 11000) {
          console.log(`⚠️  Template ${template.templateId} existe déjà`);
        } else {
          console.error(`❌ Erreur création ${template.templateId}:`, error.message);
        }
      }
    }
    
    // Vérification finale
    console.log('\n📊 Vérification finale des templates par tier:');
    const tierCounts = await TemplateSubscription.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$subscriptionTier', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    tierCounts.forEach(({ _id, count }) => {
      console.log(`  ${_id}: ${count} template(s)`);
    });
    
    console.log('\n✅ Correction terminée!');
    console.log('💡 Les utilisateurs avec un plan "free" peuvent maintenant accéder à plusieurs templates.');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
  }
}

fixTemplateAccessibility();
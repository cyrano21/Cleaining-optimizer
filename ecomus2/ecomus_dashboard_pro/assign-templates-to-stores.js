#!/usr/bin/env node

/**
 * ASSOCIATION DES TEMPLATES AUX STORES
 * 
 * Ce script associe automatiquement les templates corrigés aux stores existants
 * pour permettre le test de l'API de configuration
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
}

async function assignTemplatesToStores() {
  console.log('🔗 ASSOCIATION DES TEMPLATES AUX STORES');
  console.log('========================================\n');
  
  const db = mongoose.connection.db;
  const storesCollection = db.collection('stores');
  const templatesCollection = db.collection('templates');
  
  // 1. Récupérer tous les stores sans template
  const storesWithoutTemplate = await storesCollection.find({
    $or: [
      { templateId: { $exists: false } },
      { templateId: null },
      { templateId: undefined }
    ]
  }).toArray();
  
  console.log(`📊 ${storesWithoutTemplate.length} stores sans template trouvés\n`);
  
  // 2. Récupérer des templates de base pour l'assignation
  const templates = await templatesCollection.find({
    sections: { $exists: true, $ne: null }
  }).toArray();
  
  console.log(`📄 ${templates.length} templates disponibles avec sections\n`);
  
  if (templates.length === 0) {
    console.log('❌ Aucun template avec sections trouvé');
    return;
  }
  
  // 3. Templates recommandés par type de store
  const templateAssignments = {
    'fashion': ['Fashion Boutique', 'Fashion Basic', 'Women\'s Fashion', 'Men\'s Fashion'],
    'electronics': ['Electronics Store', 'Electronics Hub', '3D Tech Showcase'],
    'beauty': ['Beauty & Cosmetics', 'Cosmetic Paradise', 'Skincare Science'],
    'jewelry': ['Luxury Jewelry', 'Fine Jewelry', 'Jewelry Showcase'],
    'default': ['Fashion Boutique', 'Electronics Store', 'Modern Business']
  };
  
  // 4. Assigner les templates intelligemment
  let assignedCount = 0;
  
  for (const store of storesWithoutTemplate) {
    console.log(`🏪 Processing: ${store.name} (${store.slug})`);
    
    // Déterminer le type de store basé sur le nom/slug
    let storeType = 'default';
    const nameSlug = (store.name + ' ' + store.slug).toLowerCase();
    
    if (nameSlug.includes('fashion') || nameSlug.includes('mode') || nameSlug.includes('vetement')) {
      storeType = 'fashion';
    } else if (nameSlug.includes('electronic') || nameSlug.includes('tech') || nameSlug.includes('gadget')) {
      storeType = 'electronics';
    } else if (nameSlug.includes('beauty') || nameSlug.includes('cosmetic') || nameSlug.includes('beaute')) {
      storeType = 'beauty';
    } else if (nameSlug.includes('jewelry') || nameSlug.includes('bijou') || nameSlug.includes('jewel')) {
      storeType = 'jewelry';
    }
    
    console.log(`   📋 Type détecté: ${storeType}`);
    
    // Trouver un template approprié
    const recommendedTemplates = templateAssignments[storeType] || templateAssignments.default;
    let selectedTemplate = null;
    
    for (const templateName of recommendedTemplates) {
      selectedTemplate = templates.find(t => t.name === templateName);
      if (selectedTemplate) break;
    }
    
    // Fallback sur le premier template disponible
    if (!selectedTemplate && templates.length > 0) {
      selectedTemplate = templates[0];
    }
    
    if (selectedTemplate) {
      try {
        await storesCollection.updateOne(
          { _id: store._id },
          { 
            $set: { 
              templateId: selectedTemplate._id.toString(),
              updatedAt: new Date()
            }
          }
        );
        
        console.log(`   ✅ Template assigné: ${selectedTemplate.name}`);
        assignedCount++;
        
      } catch (error) {
        console.log(`   ❌ Erreur assignation: ${error.message}`);
      }
    } else {
      console.log(`   ⚠️  Aucun template trouvé`);
    }
  }
  
  console.log(`\n📊 RÉSUMÉ:`);
  console.log(`   ✅ Stores mis à jour: ${assignedCount}`);
  console.log(`   ⏭️  Stores ignorés: ${storesWithoutTemplate.length - assignedCount}`);
  
  return assignedCount;
}

async function verifyAssignments() {
  console.log('\n🔍 VÉRIFICATION DES ASSIGNATIONS');
  console.log('=================================\n');
  
  const db = mongoose.connection.db;
  const storesCollection = db.collection('stores');
  const templatesCollection = db.collection('templates');
  
  // Vérifier tous les stores avec template
  const storesWithTemplate = await storesCollection.find({
    templateId: { $exists: true, $ne: null }
  }).toArray();
  
  console.log(`📊 ${storesWithTemplate.length} stores avec template assigné\n`);
  
  for (const store of storesWithTemplate) {
    const template = await templatesCollection.findOne({
      _id: new mongoose.Types.ObjectId(store.templateId)
    });
    
    if (template) {
      console.log(`✅ ${store.name} → ${template.name} (${template.sections?.length || 0} sections)`);
    } else {
      console.log(`❌ ${store.name} → Template ID invalide: ${store.templateId}`);
    }
  }
}

async function generateTestStoreSlug() {
  console.log('\n💡 STORE DE TEST RECOMMANDÉ');
  console.log('============================\n');
  
  const db = mongoose.connection.db;
  const storesCollection = db.collection('stores');
  
  const testStore = await storesCollection.findOne({
    templateId: { $exists: true, $ne: null },
    isActive: true
  });
  
  if (testStore) {
    console.log(`🎯 Store de test recommandé: ${testStore.name}`);
    console.log(`📝 Slug: ${testStore.slug}`);
    console.log(`🔗 URL API: http://localhost:3000/api/stores/public/${testStore.slug}/config`);
    
    console.log('\n📋 Commande curl de test:');
    console.log(`curl -X GET "http://localhost:3000/api/stores/public/${testStore.slug}/config" -H "Content-Type: application/json"`);
  } else {
    console.log('❌ Aucun store de test disponible');
  }
}

async function main() {
  await connectDB();
  
  const assignedCount = await assignTemplatesToStores();
  await verifyAssignments();
  await generateTestStoreSlug();
  
  console.log('\n✅ ASSIGNATION TERMINÉE !');
  console.log('\n📋 PROCHAINES ÉTAPES:');
  console.log('1. Relancer le test de l\'API store template');
  console.log('2. Démarrer le serveur dashboard');
  console.log('3. Tester l\'API avec la vraie route');
  
  mongoose.connection.close();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  assignTemplatesToStores,
  verifyAssignments
};

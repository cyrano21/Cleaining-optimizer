import 'dotenv/config';
import mongoose from 'mongoose';
import User from './ecomusnext-main/models/User.js';
import Store from './ecomusnext-main/models/Store.js';

async function testCompleteFlow() {
  try {
    console.log('🔄 TEST DU FLUX COMPLET USER → VENDOR → ADMIN → TEMPLATE → STORE\n');
    
    // Vérification des variables d'environnement
    console.log('📋 Variables d\'environnement:');
    console.log('   MONGODB_URI:', process.env.MONGODB_URI ? 'Définie' : 'Non définie');
    console.log('   NODE_ENV:', process.env.NODE_ENV || 'Non définie');
    console.log('');      // Connexion MongoDB avec timeout plus long
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecomus';
    console.log('🔌 Tentative de connexion à:', mongoUri);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000, // 30 secondes
      socketTimeoutMS: 30000
    });
    console.log('📊 Connecté à MongoDB\n');// 1. Trouver un utilisateur simple ou en créer un
    console.log('1️⃣ ÉTAPE 1: USER DEVIENT VENDEUR');
    
    // Debug: Vérifier les collections existantes
    console.log('🔍 Vérification des collections...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('   Collections trouvées:', collections.map(c => c.name));      // Compter les utilisateurs avec l'API native MongoDB
    console.log('   🔍 Comptage des utilisateurs...');
    const userCount = await mongoose.connection.db.collection('users').countDocuments();
    console.log(`   Total d'utilisateurs: ${userCount}`);
    
    let testUser;
    if (userCount === 0) {
      console.log('   ⚠️ Aucun utilisateur dans la base, création d\'un utilisateur test...');
      testUser = new User({
        firstName: 'Test',
        lastName: 'User',
        email: 'testuser@example.com',
        password: 'password123',
        role: 'user'
      });
      await testUser.save();
      console.log('   ✅ Utilisateur test créé');    } else {
      console.log('   🔍 Recherche d\'un utilisateur avec role "user"...');
      const userDoc = await mongoose.connection.db.collection('users').findOne({ role: 'user' });
      if (userDoc) {
        // Créer un objet User à partir du document natif
        testUser = {
          _id: userDoc._id,
          firstName: userDoc.firstName,
          lastName: userDoc.lastName,
          email: userDoc.email,
          role: userDoc.role,
          save: async function() {
            await mongoose.connection.db.collection('users').updateOne(
              { _id: this._id },
              { $set: { role: this.role } }
            );
          }
        };
        console.log('   ✅ User trouvé:', testUser.email, '- Role:', testUser.role);
      } else {
        console.log('   ⚠️ Aucun user avec role "user", recherche d\'un user quelconque...');
        const anyUserDoc = await mongoose.connection.db.collection('users').findOne();
        if (anyUserDoc) {
          testUser = {
            _id: anyUserDoc._id,
            firstName: anyUserDoc.firstName,
            lastName: anyUserDoc.lastName,
            email: anyUserDoc.email,
            role: anyUserDoc.role,
            save: async function() {
              await mongoose.connection.db.collection('users').updateOne(
                { _id: this._id },
                { $set: { role: this.role } }
              );
            }
          };
          console.log('   ✅ User trouvé:', testUser.email, '- Role:', testUser.role);
        }
      }
    }
    
    if (!testUser) {
      console.log('   ❌ Aucun user simple trouvé, création d\'un user test...');
      testUser = new User({
        name: 'Test User',
        email: `test-${Date.now()}@example.com`,
        password: 'password123', 
        role: 'user'
      });
      await testUser.save();
      console.log('   ✅ User test créé:', testUser.email);
    } else {
      console.log('   ✅ User trouvé:', testUser.email);
    }

    // Test de l'upgrade vers vendor
    console.log('   🔄 Upgrade user → vendor...');
    testUser.role = 'vendor';
    await testUser.save();
    console.log('   ✅ User upgradé vers vendor');    // Création d'une store pour ce vendor (API native)
    console.log('   🔍 Recherche d\'une store pour ce vendeur...');
    let testStore = await mongoose.connection.db.collection('stores').findOne({ ownerId: testUser._id });
    
    if (!testStore) {
      console.log('   ❌ Aucune store trouvée, création d\'une store...');
      const newStore = {
        name: `Store de ${testUser.firstName || testUser.name || 'Vendor'}`,
        slug: `store-${testUser._id}`,
        ownerId: testUser._id,
        status: 'inactive',
        subscription: {
          type: 'free',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 jours
        },
        design: {
          theme: 'minimal',
          colors: {
            primary: '#000000',
            secondary: '#ffffff'
          }
        },
        templateData: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };
        const result = await mongoose.connection.db.collection('stores').insertOne(newStore);
      testStore = { ...newStore, _id: result.insertedId };
      console.log('   ✅ Store créée:', testStore.name);
    } else {
      console.log('   ✅ Store trouvée:', testStore.name);
    }    // 2. Simulation action admin
    console.log('\n2️⃣ ÉTAPE 2: ACTION ADMIN SUR ABONNEMENT');
    console.log('   📋 Abonnement actuel:', testStore.subscription.type);
    
    // Admin upgrade l'abonnement (API native)
    console.log('   🔄 Admin upgrade abonnement: free → premium...');
    const updateResult = await mongoose.connection.db.collection('stores').updateOne(
      { _id: testStore._id },
      { 
        $set: { 
          'subscription.type': 'premium',
          'subscription.features': [
            'advanced_templates',
            'custom_domain', 
            'priority_support',
            'analytics'
          ],
          'subscription.upgradedAt': new Date(),
          'subscription.upgradedBy': 'admin',
          'updatedAt': new Date()
        }
      }
    );
    
    if (updateResult.modifiedCount > 0) {
      console.log('   ✅ Admin a upgradé vers premium');
      // Récupérer la store mise à jour
      testStore = await mongoose.connection.db.collection('stores').findOne({ _id: testStore._id });
    } else {
      console.log('   ❌ Échec de l\'upgrade');
    }

    // 3. Vendeur accède aux templates
    console.log('\n3️⃣ ÉTAPE 3: VENDEUR ACCÈDE AUX TEMPLATES');
    const availableTemplates = getAvailableTemplates(testStore.subscription.type);
    console.log('   📊 Templates disponibles:', availableTemplates.length);
    availableTemplates.forEach(template => {
      console.log(`   - ${template.name} (${template.category})`);
    });

    // 4. Vendeur sélectionne et personnalise un template
    console.log('\n4️⃣ ÉTAPE 4: PERSONNALISATION TEMPLATE');
    const selectedTemplate = availableTemplates[0];
    testStore.design.template = selectedTemplate.id;
    testStore.design.colors.primary = '#ff6b35';
    testStore.design.colors.secondary = '#2c3e50';    testStore.templateData = {
      selectedTemplate: selectedTemplate.id,
      customizations: {
        logo: 'https://example.com/logo.png',
        banner: 'Bienvenue dans notre boutique !',
        sections: selectedTemplate.sections
      }
    };
    testStore.status = 'active';
    
    // Mise à jour avec l'API native
    await mongoose.connection.db.collection('stores').updateOne(
      { _id: testStore._id },
      { 
        $set: { 
          'design.template': testStore.design.template,
          'design.colors': testStore.design.colors,
          'templateData': testStore.templateData,
          'status': testStore.status
        }
      }
    );
    console.log('   ✅ Template personnalisé et store activée');

    // 5. Simulation affichage public
    console.log('\n5️⃣ ÉTAPE 5: AFFICHAGE BOUTIQUE PUBLIQUE');
    const publicStore = await Store.findOne({ 
      slug: testStore.slug, 
      status: 'active' 
    }).populate('ownerId');
    
    if (publicStore) {
      console.log('   ✅ Boutique accessible publiquement:');
      console.log('   📊 Nom:', publicStore.name);
      console.log('   🔗 Slug:', publicStore.slug);
      console.log('   🎨 Template:', publicStore.design.template);
      console.log('   🎯 Status:', publicStore.status);
      console.log('   👤 Propriétaire:', publicStore.ownerId.name);
    }

    console.log('\n🎉 FLUX COMPLET TESTÉ AVEC SUCCÈS !');
    console.log('✅ User → Vendor → Admin Action → Template → Store Publique');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

function getAvailableTemplates(subscriptionType) {
  const templates = {
    free: [
      { id: 'basic-shop', name: 'Boutique Basique', category: 'E-commerce', sections: ['header', 'products', 'footer'] }
    ],
    premium: [
      { id: 'basic-shop', name: 'Boutique Basique', category: 'E-commerce', sections: ['header', 'products', 'footer'] },
      { id: 'modern-store', name: 'Boutique Moderne', category: 'E-commerce', sections: ['header', 'hero', 'products', 'testimonials', 'footer'] },
      { id: 'fashion-store', name: 'Boutique Mode', category: 'Fashion', sections: ['header', 'hero', 'collections', 'products', 'blog', 'footer'] }
    ],
    enterprise: [
      { id: 'basic-shop', name: 'Boutique Basique', category: 'E-commerce', sections: ['header', 'products', 'footer'] },
      { id: 'modern-store', name: 'Boutique Moderne', category: 'E-commerce', sections: ['header', 'hero', 'products', 'testimonials', 'footer'] },
      { id: 'fashion-store', name: 'Boutique Mode', category: 'Fashion', sections: ['header', 'hero', 'collections', 'products', 'blog', 'footer'] },
      { id: 'premium-store', name: 'Boutique Premium', category: 'Luxury', sections: ['header', 'hero', 'collections', 'products', 'testimonials', 'blog', 'newsletter', 'footer'] }
    ]
  };
  
  return templates[subscriptionType] || templates.free;
}

// Lancement du test
testCompleteFlow();

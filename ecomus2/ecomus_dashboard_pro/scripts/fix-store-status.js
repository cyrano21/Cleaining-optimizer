// Script pour vérifier et corriger le statut des boutiques
const mongoose = require('mongoose');

// Configuration de la base de données
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecomus-dashboard';

// Définition du schéma Store (simplifié)
const StoreSchema = new mongoose.Schema({
  name: String,
  slug: String,
  description: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'pending' },
  featured: { type: Boolean, default: false },
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  contact: {
    email: String,
    phone: String,
    website: String
  },
  settings: {
    allowReviews: { type: Boolean, default: true },
    autoApproveProducts: { type: Boolean, default: false },
    minOrderAmount: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    freeShippingThreshold: { type: Number, default: 0 },
    taxRate: { type: Number, default: 0 },
    currency: { type: String, default: 'EUR' },
    timezone: { type: String, default: 'Europe/Paris' }
  },
  verification: {
    isVerified: { type: Boolean, default: false },
    verifiedAt: Date,
    documents: [String]
  },
  metrics: {
    totalProducts: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 }
  }
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String
});

const Store = mongoose.models.Store || mongoose.model('Store', StoreSchema);
const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function checkAndFixStoreStatus() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to database');

    // Trouver toutes les boutiques
    const stores = await Store.find({}).select('name status owner').populate('owner', 'name email');
    
    console.log('\n=== BOUTIQUES EXISTANTES ===');
    stores.forEach((store, index) => {
      console.log(`${index + 1}. ${store.name}`);
      console.log(`   - Status: ${store.status}`);
      console.log(`   - Owner: ${store.owner?.name || 'N/A'} (${store.owner?.email || 'N/A'})`);
      console.log(`   - ID: ${store._id}`);
      console.log('');
    });

    // Trouver spécifiquement "Ecomus Store"
    const ecomusStore = stores.find(store => 
      store.name.toLowerCase().includes('ecomus')
    );

    if (ecomusStore) {
      console.log('=== BOUTIQUE ECOMUS TROUVÉE ===');
      console.log(`Nom: ${ecomusStore.name}`);
      console.log(`Status actuel: ${ecomusStore.status}`);
      
      if (ecomusStore.status !== 'active') {
        console.log('\n⚠️  La boutique Ecomus n\'est pas active. Correction en cours...');
        
        // Mettre à jour le statut
        await Store.findByIdAndUpdate(ecomusStore._id, {
          status: 'active',
          featured: true,
          'verification.isVerified': true,
          'verification.verifiedAt': new Date()
        });
        
        console.log('✅ Boutique Ecomus mise à jour avec le statut "active"');
      } else {
        console.log('✅ La boutique Ecomus est déjà active');
      }
    } else {
      console.log('❌ Boutique Ecomus non trouvée');
      
      // Créer la boutique Ecomus si elle n'existe pas
      console.log('Création de la boutique Ecomus...');
      
      // Trouver un utilisateur admin pour être le propriétaire
      const adminUser = await User.findOne({ role: 'admin' });
      
      if (!adminUser) {
        console.log('❌ Aucun utilisateur admin trouvé pour créer la boutique');
        return;
      }

      const newStore = new Store({
        name: 'Ecomus Store',
        slug: 'ecomus-store',
        description: 'Boutique officielle Ecomus - Mode et lifestyle de qualité',
        owner: adminUser._id,
        status: 'active',
        featured: true,
        address: {
          street: '123 Fashion Street',
          city: 'Paris',
          state: 'Île-de-France',
          postalCode: '75001',
          country: 'France'
        },
        contact: {
          email: 'contact@ecomus-store.com',
          phone: '+33 1 23 45 67 89',
          website: 'https://ecomus-store.com'
        },
        settings: {
          allowReviews: true,
          autoApproveProducts: true,
          minOrderAmount: 0,
          shippingFee: 5.99,
          freeShippingThreshold: 50,
          taxRate: 20,
          currency: 'EUR',
          timezone: 'Europe/Paris'
        },
        verification: {
          isVerified: true,
          verifiedAt: new Date(),
          documents: []
        },
        metrics: {
          totalProducts: 0,
          totalOrders: 0,
          totalRevenue: 0,
          averageRating: 4.5,
          totalReviews: 0
        }
      });

      await newStore.save();
      console.log('✅ Boutique Ecomus créée avec succès');
    }

  } catch (error) {
    console.error('Erreur lors de la vérification des boutiques:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkAndFixStoreStatus();

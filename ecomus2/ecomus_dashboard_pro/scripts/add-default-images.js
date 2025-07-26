// Script pour ajouter des images et avatars par défaut aux boutiques et utilisateurs
const mongoose = require('mongoose');

// Configuration de la base de données
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecomus-dashboard';

// Définition des schémas
const StoreSchema = new mongoose.Schema({
  name: String,
  slug: String,
  description: String,
  logo: String,
  banner: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'pending' },
  featured: { type: Boolean, default: false },
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  avatar: String,
  role: String
}, { timestamps: true });

const Store = mongoose.models.Store || mongoose.model('Store', StoreSchema);
const User = mongoose.models.User || mongoose.model('User', UserSchema);

// Images par défaut
const defaultStoreLogos = [
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200&h=200&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=200&h=200&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1570303345338-e1f0eddf4946?w=200&h=200&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&h=200&fit=crop&crop=center',
];

const defaultStoreBanners = [
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=300&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=300&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=300&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1570303345338-e1f0eddf4946?w=800&h=300&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=300&fit=crop&crop=center',
];

const defaultAvatars = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1494790108755-2616b30d90d4?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=200&h=200&fit=crop&crop=face',
];

async function addDefaultImages() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to database');

    // Mettre à jour les boutiques sans logo
    const storesWithoutLogo = await Store.find({ 
      $or: [
        { logo: { $exists: false } },
        { logo: '' },
        { logo: null }
      ]
    });

    console.log(`\nTrouver ${storesWithoutLogo.length} boutiques sans logo`);

    for (let i = 0; i < storesWithoutLogo.length; i++) {
      const store = storesWithoutLogo[i];
      const logoIndex = i % defaultStoreLogos.length;
      const bannerIndex = i % defaultStoreBanners.length;
      
      await Store.findByIdAndUpdate(store._id, {
        logo: defaultStoreLogos[logoIndex],
        banner: defaultStoreBanners[bannerIndex],
        status: store.status || 'active', // Activer par défaut si pas de statut
      });
      
      console.log(`✅ Logo ajouté pour: ${store.name}`);
    }

    // Mettre à jour les utilisateurs sans avatar
    const usersWithoutAvatar = await User.find({ 
      $or: [
        { avatar: { $exists: false } },
        { avatar: '' },
        { avatar: null }
      ]
    });

    console.log(`\nTrouver ${usersWithoutAvatar.length} utilisateurs sans avatar`);

    for (let i = 0; i < usersWithoutAvatar.length; i++) {
      const user = usersWithoutAvatar[i];
      const avatarIndex = i % defaultAvatars.length;
      
      await User.findByIdAndUpdate(user._id, {
        avatar: defaultAvatars[avatarIndex]
      });
      
      console.log(`✅ Avatar ajouté pour: ${user.name || user.email}`);
    }

    // Afficher un résumé des boutiques
    const stores = await Store.find({}).populate('owner', 'name email avatar');
    console.log('\n=== RÉSUMÉ DES BOUTIQUES ===');
    stores.forEach((store, index) => {
      console.log(`${index + 1}. ${store.name}`);
      console.log(`   - Status: ${store.status}`);
      console.log(`   - Logo: ${store.logo ? '✅' : '❌'}`);
      console.log(`   - Banner: ${store.banner ? '✅' : '❌'}`);
      console.log(`   - Owner: ${store.owner?.name || 'N/A'}`);
      console.log(`   - Owner Avatar: ${store.owner?.avatar ? '✅' : '❌'}`);
      console.log('');
    });

    console.log('✅ Toutes les images par défaut ont été ajoutées !');

  } catch (error) {
    console.error('Erreur lors de l\'ajout des images:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

addDefaultImages();

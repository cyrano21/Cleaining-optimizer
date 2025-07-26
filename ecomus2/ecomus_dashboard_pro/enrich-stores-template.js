// Script pour enrichir les stores avec des données de template
const connectDB = require('./lib/mongodb');
const Store = require('./models/Store');

async function enrichStoreWithTemplateData() {
  await connectDB();
  
  console.log('📊 Enrichissement des stores avec des données de template...\n');
  
  // Données de template exemple pour différents types de stores
  const templateData = {
    'tshirts-casual': {
      products: [
        {
          id: 1,
          name: 'T-Shirt Casual Blanc',
          description: 'T-shirt en coton bio, coupe regular',
          price: 29.99,
          image: '/images/tshirt-white.jpg',
          category: 'T-Shirts',
          inStock: true,
          rating: 4.5
        },
        {
          id: 2,
          name: 'T-Shirt Casual Noir',
          description: 'T-shirt en coton bio, coupe regular',
          price: 29.99,
          image: '/images/tshirt-black.jpg',
          category: 'T-Shirts',
          inStock: true,
          rating: 4.7
        },
        {
          id: 3,
          name: 'T-Shirt Casual Bleu',
          description: 'T-shirt en coton bio, coupe regular',
          price: 29.99,
          image: '/images/tshirt-blue.jpg',
          category: 'T-Shirts',
          inStock: false,
          rating: 4.3
        },
        {
          id: 4,
          name: 'T-Shirt Casual Gris',
          description: 'T-shirt en coton bio, coupe regular',
          price: 29.99,
          image: '/images/tshirt-gray.jpg',
          category: 'T-Shirts',
          inStock: true,
          rating: 4.6
        }
      ],
      categories: [
        { name: 'T-Shirts', count: 25 },
        { name: 'Polos', count: 15 },
        { name: 'Sweats', count: 10 },
        { name: 'Accessoires', count: 8 }
      ],
      promotions: [
        {
          title: 'Soldes d\'été',
          description: 'Jusqu\'à -50% sur tous les t-shirts',
          discount: 50,
          validUntil: '2025-08-31'
        }
      ],
      testimonials: [
        {
          name: 'Marie L.',
          rating: 5,
          comment: 'Très bonne qualité, je recommande !',
          date: '2025-06-15'
        },
        {
          name: 'Pierre M.',
          rating: 4,
          comment: 'Livraison rapide et produit conforme.',
          date: '2025-06-10'
        }
      ]
    },
    'cosmetiques-beaute': {
      products: [
        {
          id: 1,
          name: 'Crème Hydratante Bio',
          description: 'Crème visage aux ingrédients naturels',
          price: 45.99,
          image: '/images/creme-bio.jpg',
          category: 'Soins visage',
          inStock: true,
          rating: 4.8
        },
        {
          id: 2,
          name: 'Sérum Anti-Âge',
          description: 'Sérum concentré en vitamines',
          price: 89.99,
          image: '/images/serum-anti-age.jpg',
          category: 'Soins visage',
          inStock: true,
          rating: 4.9
        }
      ],
      categories: [
        { name: 'Soins visage', count: 30 },
        { name: 'Maquillage', count: 45 },
        { name: 'Parfums', count: 20 },
        { name: 'Soins corps', count: 25 }
      ]
    }
  };
  
  // Enrichir les stores avec des données de template
  for (const [slug, data] of Object.entries(templateData)) {
    try {
      const store = await Store.findOne({ slug });
      
      if (store) {
        // Ajouter les données de template
        store.templateData = data;
        
        // Enrichir les métriques
        store.metrics = {
          totalProducts: data.products?.length || 0,
          totalOrders: Math.floor(Math.random() * 1000) + 100,
          totalRevenue: Math.floor(Math.random() * 50000) + 10000,
          averageRating: data.products?.reduce((acc, p) => acc + p.rating, 0) / data.products?.length || 4.5,
          totalReviews: Math.floor(Math.random() * 200) + 50
        };
        
        // Ajouter des informations de contact plus riches
        if (!store.contact) store.contact = {};
        store.contact.email = store.contact.email || `contact@${slug}.com`;
        store.contact.phone = store.contact.phone || '+33 1 23 45 67 89';
        
        // Ajouter une adresse formatée
        if (!store.address) {
          store.address = {
            street: '123 Rue de la Boutique',
            city: 'Paris',
            state: 'Île-de-France',
            postalCode: '75001',
            country: 'France'
          };
        }
        
        await store.save();
        console.log(`✅ Store "${store.name}" enrichie avec des données de template`);
      } else {
        console.log(`❌ Store "${slug}" non trouvée`);
      }
    } catch (error) {
      console.error(`❌ Erreur lors de l'enrichissement de "${slug}":`, error.message);
    }
  }
  
  console.log('\n🎉 Enrichissement terminé !');
  process.exit(0);
}

enrichStoreWithTemplateData();

import dbConnect from '../../../lib/dbConnect'
import Collection from '../../../models/Collection'
import Category from '../../../models/Category'

// Collections basées sur les données statiques existantes
const SEED_COLLECTIONS = [
  {
    title: "Women's Collection",
    slug: 'womens-collection',
    description: 'Discover our latest women\'s fashion collection with trendy styles and premium quality.',
    subtitle: 'New Arrivals',
    image: '/images/collections/womens-collection.jpg',
    backgroundImage: '/images/collections/womens-bg.jpg',
    featured: true,
    isActive: true,
    sortOrder: 1,
    tags: ['women', 'fashion', 'new', 'trending'],
    metadata: {
      season: 'All Season',
      targetAudience: 'Women',
      priceRange: 'Mid to High'
    },
    seo: {
      metaTitle: "Women's Fashion Collection - Latest Trends",
      metaDescription: 'Explore our curated women\'s fashion collection featuring the latest trends and styles.',
      metaKeywords: ['women fashion', 'clothing', 'trends', 'style']
    }
  },
  {
    title: "Men's Collection",
    slug: 'mens-collection',
    description: 'Explore our premium men\'s fashion line with sophisticated styles for the modern gentleman.',
    subtitle: 'Best Sellers',
    image: '/images/collections/mens-collection.jpg',
    backgroundImage: '/images/collections/mens-bg.jpg',
    featured: true,
    isActive: true,
    sortOrder: 2,
    tags: ['men', 'fashion', 'bestseller', 'classic'],
    metadata: {
      season: 'All Season',
      targetAudience: 'Men',
      priceRange: 'Mid to High'
    },
    seo: {
      metaTitle: "Men's Fashion Collection - Premium Quality",
      metaDescription: 'Discover our sophisticated men\'s fashion collection with timeless and modern styles.',
      metaKeywords: ['men fashion', 'clothing', 'premium', 'style']
    }
  },
  {
    title: 'Summer Collection',
    slug: 'summer-collection',
    description: 'Fresh styles for the summer season with lightweight fabrics and vibrant colors.',
    subtitle: 'Hot Trends',
    image: '/images/collections/summer-collection.jpg',
    backgroundImage: '/images/collections/summer-bg.jpg',
    featured: false,
    isActive: true,
    sortOrder: 3,
    tags: ['summer', 'seasonal', 'lightweight', 'colorful'],
    metadata: {
      season: 'Summer',
      targetAudience: 'All',
      priceRange: 'Low to Mid'
    },
    seo: {
      metaTitle: 'Summer Fashion Collection - Fresh & Vibrant',
      metaDescription: 'Beat the heat with our summer collection featuring lightweight and colorful fashion.',
      metaKeywords: ['summer fashion', 'lightweight', 'colorful', 'seasonal']
    }
  },
  {
    title: 'Accessories Collection',
    slug: 'accessories-collection',
    description: 'Complete your look with our curated accessories including bags, jewelry, and more.',
    subtitle: 'Must-Have',
    image: '/images/collections/accessories-collection.jpg',
    backgroundImage: '/images/collections/accessories-bg.jpg',
    featured: false,
    isActive: true,
    sortOrder: 4,
    tags: ['accessories', 'bags', 'jewelry', 'complete'],
    metadata: {
      season: 'All Season',
      targetAudience: 'All',
      priceRange: 'Low to High'
    },
    seo: {
      metaTitle: 'Fashion Accessories Collection - Complete Your Look',
      metaDescription: 'Find the perfect accessories to complement your style from our curated collection.',
      metaKeywords: ['accessories', 'bags', 'jewelry', 'fashion']
    }
  },
  {
    title: 'Sneakers Collection',
    slug: 'sneakers-collection',
    description: 'Step up your game with our premium sneakers collection featuring comfort and style.',
    subtitle: 'Comfort Meets Style',
    image: '/images/collections/sneakers-collection.jpg',
    backgroundImage: '/images/collections/sneakers-bg.jpg',
    featured: true,
    isActive: true,
    sortOrder: 5,
    tags: ['sneakers', 'shoes', 'comfort', 'sport'],
    metadata: {
      season: 'All Season',
      targetAudience: 'All',
      priceRange: 'Mid to High'
    },
    seo: {
      metaTitle: 'Premium Sneakers Collection - Comfort & Style',
      metaDescription: 'Discover our sneakers collection combining ultimate comfort with trendy designs.',
      metaKeywords: ['sneakers', 'shoes', 'comfort', 'style']
    }
  },
  {
    title: 'Bags Collection',
    slug: 'bags-collection',
    description: 'Carry your essentials in style with our diverse bags collection for every occasion.',
    subtitle: 'For Every Occasion',
    image: '/images/collections/bags-collection.jpg',
    backgroundImage: '/images/collections/bags-bg.jpg',
    featured: false,
    isActive: true,
    sortOrder: 6,
    tags: ['bags', 'handbags', 'backpacks', 'accessories'],
    metadata: {
      season: 'All Season',
      targetAudience: 'All',
      priceRange: 'Mid to High'
    },
    seo: {
      metaTitle: 'Designer Bags Collection - Style & Function',
      metaDescription: 'Find the perfect bag for every occasion from our stylish and functional collection.',
      metaKeywords: ['bags', 'handbags', 'backpacks', 'designer']
    }
  },
  {
    title: 'Jewelry Collection',
    slug: 'jewelry-collection',
    description: 'Elegant jewelry pieces to add sparkle and sophistication to any outfit.',
    subtitle: 'Elegant Sparkle',
    image: '/images/collections/jewelry-collection.jpg',
    backgroundImage: '/images/collections/jewelry-bg.jpg',
    featured: false,
    isActive: true,
    sortOrder: 7,
    tags: ['jewelry', 'elegant', 'sparkle', 'accessories'],
    metadata: {
      season: 'All Season',
      targetAudience: 'All',
      priceRange: 'Mid to High'
    },
    seo: {
      metaTitle: 'Elegant Jewelry Collection - Timeless Beauty',
      metaDescription: 'Add elegance to your style with our curated jewelry collection.',
      metaKeywords: ['jewelry', 'elegant', 'accessories', 'beauty']
    }
  },
  {
    title: 'Glasses Collection',
    slug: 'glasses-collection',
    description: 'Protect your eyes in style with our fashionable glasses and sunglasses collection.',
    subtitle: 'See in Style',
    image: '/images/collections/glasses-collection.jpg',
    backgroundImage: '/images/collections/glasses-bg.jpg',
    featured: false,
    isActive: true,
    sortOrder: 8,
    tags: ['glasses', 'sunglasses', 'eyewear', 'protection'],
    metadata: {
      season: 'All Season',
      targetAudience: 'All',
      priceRange: 'Low to Mid'
    },
    seo: {
      metaTitle: 'Stylish Glasses Collection - Fashion Eyewear',
      metaDescription: 'Discover our trendy glasses and sunglasses collection for every style.',
      metaKeywords: ['glasses', 'sunglasses', 'eyewear', 'fashion']
    }
  }
]

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Méthode non autorisée. Utilisez POST.'
    })
  }

  try {
    await dbConnect()
    console.log('🌱 [SEED] Connexion à MongoDB réussie')

    // Vérifier si des collections existent déjà
    const existingCollections = await Collection.countDocuments()
    console.log(`🌱 [SEED] Collections existantes: ${existingCollections}`)

    if (existingCollections > 0 && !req.query.force) {
      return res.status(200).json({
        success: true,
        message: 'Des collections existent déjà. Utilisez ?force=true pour les remplacer.',
        existingCount: existingCollections
      })
    }

    // Supprimer les collections existantes si force=true
    if (req.query.force === 'true') {
      await Collection.deleteMany({})
      console.log('🌱 [SEED] Collections existantes supprimées')
    }

    // Récupérer quelques catégories pour les associer aux collections
    const categories = await Category.find({ isActive: true }).limit(5)
    console.log(`🌱 [SEED] Catégories trouvées: ${categories.length}`)

    // Créer les collections
    const collectionsToCreate = SEED_COLLECTIONS.map((collection, index) => {
      // Associer une catégorie aléatoire si disponible
      if (categories.length > 0) {
        collection.category = categories[index % categories.length]._id
      }
      return collection
    })

    const createdCollections = await Collection.insertMany(collectionsToCreate)
    console.log(`🌱 [SEED] ${createdCollections.length} collections créées`)

    return res.status(201).json({
      success: true,
      message: `${createdCollections.length} collections créées avec succès`,
      data: {
        created: createdCollections.length,
        collections: createdCollections.map(c => ({
          id: c._id,
          title: c.title,
          slug: c.slug,
          featured: c.featured
        }))
      }
    })

  } catch (error) {
    console.error('🌱 [SEED] Erreur lors du seed des collections:', error)
    return res.status(500).json({
      success: false,
      error: 'Erreur lors du seed des collections',
      message: error.message
    })
  }
}
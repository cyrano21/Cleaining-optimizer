import dbConnect from '../../../lib/dbConnect'
import Collection from '../../../models/Collection'
import { withAdminAuth } from '../../../middleware/authMiddleware'

// Afficher la valeur de MONGODB_URI (masquée pour la sécurité)
const mongoUriExists = !!process.env.MONGODB_URI
console.log(
  `🔍 [API] MONGODB_URI est ${mongoUriExists ? 'définie' : 'NON DÉFINIE'}`
)

// Import des collections par défaut depuis les données statiques
let DEFAULT_COLLECTIONS = [
  {
    title: "Women's Collection",
    slug: 'womens-collection',
    description: 'Discover our latest women\'s fashion collection',
    subtitle: 'New Arrivals',
    image: '/assets/images/collection/collection-01.jpg',
    isActive: true,
    featured: true,
    sortOrder: 1,
    _id: 'default-col-1'
  },
  {
    title: "Men's Collection",
    slug: 'mens-collection',
    description: 'Explore our premium men\'s fashion line',
    subtitle: 'Best Sellers',
    image: '/assets/images/collection/collection-02.jpg',
    isActive: true,
    featured: true,
    sortOrder: 2,
    _id: 'default-col-2'
  },
  {
    title: 'Summer Collection',
    slug: 'summer-collection',
    description: 'Fresh styles for the summer season',
    subtitle: 'Hot Trends',
    image: '/assets/images/collection/collection-03.jpg',
    isActive: true,
    featured: false,
    sortOrder: 3,
    _id: 'default-col-3'
  },
  {
    title: 'Accessories Collection',
    slug: 'accessories-collection',
    description: 'Complete your look with our accessories',
    subtitle: 'Must-Have',
    image: '/assets/images/collection/collection-04.jpg',
    isActive: true,
    featured: false,
    sortOrder: 4,
    _id: 'default-col-4'
  }
]

async function handler (req, res) {
  // Configuration CORS pour permettre les requêtes cross-origin
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // Répondre directement aux requêtes OPTIONS (pre-flight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const { method } = req
  console.log(`🔍 [API] Traitement de ${method} pour /collections`)

  // Gestionnaire d'erreur pour les problèmes de connexion MongoDB sur Vercel
  let isConnected = false

  try {
    console.log('🔍 [API] Tentative de connexion à MongoDB...')
    // Vérifier si MONGODB_URI est définie
    if (!process.env.MONGODB_URI) {
      console.error(
        "🔍 [API] ERREUR CRITIQUE: MONGODB_URI n'est pas définie dans les variables d'environnement"
      )
      throw new Error('MONGODB_URI manquante')
    }

    // Essayer de se connecter avec un timeout plus court
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error('Timeout de connexion MongoDB après 5000ms')),
        5000
      )
    )

    try {
      await Promise.race([dbConnect(), timeoutPromise])
      isConnected = true
      console.log('🔍 [API] Connexion à MongoDB réussie')
    } catch (dbError) {
      console.error(
        '🔍 [API] Erreur de connexion à MongoDB (timeout):',
        dbError
      )
      console.log('🔍 [API] Nous allons utiliser les collections par défaut')
    }
  } catch (error) {
    console.error('🔍 [API] Erreur de connexion à MongoDB:', error)
    if (method === 'GET') {
      console.log(
        "🔍 [API] Utilisation des collections par défaut en raison de l'erreur"
      )
      return res.status(200).json({
        success: true,
        data: DEFAULT_COLLECTIONS,
        fromFallback: true
      })
    } else {
      return res.status(500).json({
        success: false,
        error: 'Erreur de connexion à la base de données',
        message: error.message
      })
    }
  }

  switch (method) {
    case 'GET':
      try {
        // Si la connexion à MongoDB a échoué, utiliser les données par défaut
        if (!isConnected) {
          console.log(
            '🔍 [API] MongoDB non disponible, utilisation des collections par défaut'
          )
          return res.status(200).json({
            success: true,
            data: DEFAULT_COLLECTIONS,
            fromFallback: true
          })
        }

        console.log('🔍 [API] Recherche de collections avec query:', req.query)

        // Analyser les en-têtes et paramètres pour déterminer si la requête provient d'un admin
        const isAdminRequest =
          req.query.all === 'true' ||
          req.headers.referer?.includes('/admin') ||
          req.headers['x-admin-request'] === 'true' ||
          req.query.admin === 'true'

        console.log('🔍 [API] Détection requête admin:', {
          isAdmin: isAdminRequest,
          'query.all': req.query.all,
          referer: req.headers.referer,
          'x-admin-request': req.headers['x-admin-request'],
          'query.admin': req.query.admin
        })

        // Retourner toutes les collections pour les admins, sinon filtrer par isActive
        const query = isAdminRequest ? {} : { isActive: true }

        console.log(
          `🔍 [API] Filtre de visibilité: ${JSON.stringify(query)}`
        )

        // Construire la requête avec les filtres
        let dbQuery = Collection.find(query)

        // Ajouter les relations si demandées
        if (req.query.populate) {
          const populateFields = req.query.populate.split(',')
          populateFields.forEach(field => {
            if (['category', 'shop', 'seller'].includes(field.trim())) {
              dbQuery = dbQuery.populate(field.trim())
            }
          })
        }

        // Tri par défaut
        dbQuery = dbQuery.sort({ sortOrder: 1, featured: -1, createdAt: -1 })

        const collections = await dbQuery.exec()

        console.log(
          `🔍 [API] Collections trouvées: ${collections.length} éléments`
        )

        return res.status(200).json({
          success: true,
          data: collections,
          count: collections.length
        })
      } catch (error) {
        console.error('🔍 [API] Erreur lors de la récupération des collections:', error)
        return res.status(500).json({
          success: false,
          error: 'Erreur lors de la récupération des collections',
          message: error.message
        })
      }

    case 'POST':
      try {
        if (!isConnected) {
          return res.status(500).json({
            success: false,
            error: 'Base de données non disponible'
          })
        }

        const {
          title,
          slug,
          description,
          subtitle,
          image,
          backgroundImage,
          category,
          shop,
          seller,
          featured = false,
          isActive = true,
          sortOrder = 0,
          tags = [],
          metadata = {},
          seo = {}
        } = req.body

        // Validation des champs requis
        if (!title || !slug || !description || !image) {
          return res.status(400).json({
            success: false,
            error: 'Les champs title, slug, description et image sont requis'
          })
        }

        // Vérifier l'unicité du slug
        const existingCollection = await Collection.findOne({ slug })
        if (existingCollection) {
          return res.status(400).json({
            success: false,
            error: 'Une collection avec ce slug existe déjà'
          })
        }

        const collection = new Collection({
          title,
          slug,
          description,
          subtitle,
          image,
          backgroundImage,
          category,
          shop,
          seller,
          featured,
          isActive,
          sortOrder,
          tags,
          metadata,
          seo
        })

        const savedCollection = await collection.save()

        console.log('🔍 [API] Collection créée:', savedCollection._id)

        return res.status(201).json({
          success: true,
          data: savedCollection
        })
      } catch (error) {
        console.error('🔍 [API] Erreur lors de la création de la collection:', error)
        return res.status(500).json({
          success: false,
          error: 'Erreur lors de la création de la collection',
          message: error.message
        })
      }

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      return res.status(405).json({
        success: false,
        error: `Méthode ${method} non autorisée`
      })
  }
}

export default handler
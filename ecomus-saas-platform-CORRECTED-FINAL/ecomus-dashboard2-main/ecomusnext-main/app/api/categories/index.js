import dbConnect from '../../../lib/dbConnect'
import Category from '../../../models/Category'
import { withAdminAuth } from '../../../middleware/authMiddleware'

// Afficher la valeur de MONGODB_URI (masquée pour la sécurité)
const mongoUriExists = !!process.env.MONGODB_URI
console.log(
  `🔍 [API] MONGODB_URI est ${mongoUriExists ? 'définie' : 'NON DÉFINIE'}`
)

// Import des catégories par défaut depuis le module utilitaire
let DEFAULT_CATEGORIES = [
  {
    name: "Men's Sneaker",
    slug: 'mens-sneaker',
    description: 'Sneakers et chaussures de sport pour hommes',
    imageUrl: '/assets/images/category/01.jpg',
    isActive: true,
    _id: 'default-cat-1'
  },
  {
    name: "Men's Pants",
    slug: 'mens-pants',
    description: 'Pantalons et jeans pour hommes',
    imageUrl: '/assets/images/category/02.jpg',
    isActive: true,
    _id: 'default-cat-2'
  },
  {
    name: "Men's Boot",
    slug: 'mens-boot',
    description: 'Bottes et chaussures de ville pour hommes',
    imageUrl: '/assets/images/category/03.jpg',
    isActive: true,
    _id: 'default-cat-3'
  },
  {
    name: 'Bag',
    slug: 'bag',
    description: 'Sacs, sacoches et accessoires',
    imageUrl: '/assets/images/category/04.jpg',
    isActive: true,
    _id: 'default-cat-4'
  },
  {
    name: 'Cap',
    slug: 'cap',
    description: 'Casquettes et chapeaux',
    imageUrl: '/assets/images/category/05.jpg',
    isActive: true,
    _id: 'default-cat-5'
  },
  {
    name: 'Earphones',
    slug: 'earphones',
    description: 'Écouteurs et accessoires audio',
    imageUrl: '/assets/images/category/01.jpg',
    isActive: true,
    _id: 'default-cat-6'
  }
]

// Essayer de charger les catégories depuis le fichier de catégories par défaut
try {
  const defaultCategoriesModule = require('../../../utils/default-categories')
  if (defaultCategoriesModule && defaultCategoriesModule.getDefaultCategories) {
    const defaultCats = defaultCategoriesModule.getDefaultCategories()
    if (Array.isArray(defaultCats) && defaultCats.length > 0) {
      console.log(
        '🔍 [API] Utilisation des catégories depuis utils/default-categories.js'
      )
      DEFAULT_CATEGORIES = defaultCats
    }
  }
} catch (error) {
  console.log(
    '🔍 [API] Erreur lors du chargement des catégories par défaut depuis le module:',
    error.message
  )
  console.log('🔍 [API] Utilisation des catégories par défaut codées en dur')
}

// Le modèle Category est déjà importé au début du fichier, pas besoin de le redéclarer

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
  console.log(`🔍 [API] Traitement de ${method} pour /categories`)

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
    // pour éviter de bloquer les requêtes trop longtemps
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error('Timeout de connexion MongoDB après 5000ms')),
        5000
      )
    )

    // Essayer de se connecter, mais avec un timeout
    try {
      await Promise.race([dbConnect(), timeoutPromise])
      isConnected = true
      console.log('🔍 [API] Connexion à MongoDB réussie')
    } catch (dbError) {
      console.error(
        '🔍 [API] Erreur de connexion à MongoDB (timeout):',
        dbError
      )
      console.log('🔍 [API] Nous allons utiliser les catégories par défaut')
      // Continuer l'exécution et utiliser les données par défaut si nécessaire
    }
  } catch (error) {
    console.error('🔍 [API] Erreur de connexion à MongoDB:', error)
    // Au lieu de retourner une erreur 500, nous allons utiliser les catégories par défaut
    // pour éviter de bloquer complètement le client
    if (method === 'GET') {
      console.log(
        "🔍 [API] Utilisation des catégories par défaut en raison de l'erreur"
      )
      return res.status(200).json({
        success: true,
        data: DEFAULT_CATEGORIES,
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
            '🔍 [API] MongoDB non disponible, utilisation des catégories par défaut'
          )
          console.log(
            '🔍 [API] Catégories par défaut:',
            JSON.stringify(DEFAULT_CATEGORIES)
          )
          return res.status(200).json({
            success: true,
            data: DEFAULT_CATEGORIES,
            fromFallback: true
          })
        }

        console.log('🔍 [API] Recherche de catégories avec query:', req.query)

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

        // Si le paramètre "active" est spécifié, il a priorité sur les autres règles
        const filterActive = req.query.active === 'true'

        // Retourner toutes les catégories pour les admins, sinon filtrer par isActive
        const query = isAdminRequest ? {} : { isActive: true }

        console.log(
          `🔍 [API] Filtre de visibilité: ${
            isAdminRequest ? 'Désactivé' : 'Activé (uniquement actives)'
          }`
        )
        console.log(`🔍 [API] Paramètres de requête:`, req.query)
        console.log(`🔍 [API] Referer: ${req.headers.referer || 'Non défini'}`)
        console.log(
          `🔍 [API] X-Admin-Request: ${
            req.headers['x-admin-request'] || 'Non défini'
          }`
        )

        // Récupérer toutes les catégories correspondant aux critères
        const categories = await Category.find(query).sort({ name: 1 }).lean()

        console.log(
          `🔍 [API] ${categories.length} catégories trouvées dans la base de données`
        )

        // Si aucune catégorie n'est trouvée et que nous ne sommes pas en mode admin, utiliser les catégories par défaut
        if (categories.length === 0 && !isAdminRequest) {
          console.log('🔍 [API] Utilisation des catégories par défaut')
          return res.status(200).json({
            success: true,
            data: DEFAULT_CATEGORIES,
            fromFallback: true
          })
        }

        console.log(`🔍 [API] ${categories.length} catégories trouvées`)

        // Vérifier si la requête a été envoyée par le client ou le serveur
        const isServerSide = !req.headers['x-requested-with']

        // Si aucune catégorie n'a été trouvée, utiliser les catégories par défaut
        if (categories.length === 0) {
          console.warn(
            '🔍 [API] Aucune catégorie trouvée dans la BDD, utilisation des données par défaut'
          )
          return res.status(200).json({
            success: true,
            data: DEFAULT_CATEGORIES,
            fromFallback: true
          })
        }

        console.log('🔍 [API] Réponse: 200 OK avec catégories de la BDD')
        console.log('🔍 [API] Traitement terminé pour /categories')

        // Désactiver le cache pour éviter les réponses 304
        res.setHeader(
          'Cache-Control',
          'no-store, no-cache, must-revalidate, proxy-revalidate'
        )
        res.setHeader('Pragma', 'no-cache')
        res.setHeader('Expires', '0')
        res.setHeader('Surrogate-Control', 'no-store')

        // Ajouter un timestamp pour s'assurer que chaque réponse est considérée comme nouvelle
        return res.status(200).json({
          success: true,
          data: categories,
          timestamp: new Date().getTime()
        })
      } catch (error) {
        console.error(
          '❌ [API] Erreur lors de la récupération des catégories:',
          error
        )
        return res.status(400).json({
          success: false,
          error: error.message
        })
      }

    case 'POST':
      // Vérifier si la requête vient d'un administrateur (déjà fait par withAdminAuth)

      // Créer une nouvelle catégorie
      const {
        name,
        slug,
        description,
        imageUrl,
        cloudinaryId,
        isActive,
        order
      } = req.body

      console.log(
        `🔍 [API] Tentative de création de catégorie avec données:`,
        req.body
      )

      // Vérifier si la catégorie existe déjà
      const existingCategory = await Category.findOne({
        $or: [{ name }, { slug }]
      })

      if (existingCategory) {
        console.log('🔍 [API] Une catégorie avec ce nom ou ce slug existe déjà')
        return res
          .status(400)
          .json({ error: 'Une catégorie avec ce nom ou ce slug existe déjà' })
      }

      const newCategory = new Category({
        name,
        slug,
        description,
        imageUrl,
        cloudinaryId,
        isActive,
        order
      })

      await newCategory.save()
      console.log('🔍 [API] Nouvelle catégorie créée:', newCategory)
      return res.status(201).json(newCategory)

    default:
      console.log(`🔍 [API] Méthode non autorisée: ${req.method}`)
      return res.status(405).json({ error: 'Méthode non autorisée' })
  }
}

// Appliquer le middleware d'authentification admin pour les méthodes POST
export default function (req, res) {
  console.log(
    `📥 [API] Requête entrante vers /api/categories - Méthode: ${req.method}`
  )

  // Pour éviter les erreurs de redirection, vérifier si la réponse a déjà été envoyée
  res.on('finish', () => {
    console.log(
      `📤 [API] Réponse envoyée pour /api/categories avec statut: ${res.statusCode}`
    )
  })

  if (req.method === 'POST') {
    console.log("🔑 [API] Application du middleware d'authentification admin")
    return withAdminAuth(handler)(req, res)
  } else {
    console.log("🔓 [API] Pas de middleware d'authentification nécessaire")
    return handler(req, res)
  }
}

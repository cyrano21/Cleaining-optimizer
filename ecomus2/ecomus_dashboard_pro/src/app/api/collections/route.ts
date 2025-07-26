import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/mongodb";
import Collection from "@/models/Collection";
import { checkAdminAccess } from "@/lib/role-utils";

/**
 * @swagger
 * /api/collections:
 *   get:
 *     summary: Récupérer toutes les collections
 *     description: Retourne la liste des collections avec pagination et filtres
 *     tags: [Collections]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Nombre d'éléments par page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Recherche par titre ou description
 *       - in: query
 *         name: featured
 *         schema:
 *           type: boolean
 *         description: Filtrer par collections en vedette
 *       - in: query
 *         name: storeId
 *         schema:
 *           type: string
 *         description: ID du magasin
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: ID de la catégorie
 *     responses:
 *       200:
 *         description: Liste des collections
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Collection'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalCollections:
 *                       type: integer
 *                     hasNextPage:
 *                       type: boolean
 *                     hasPrevPage:
 *                       type: boolean
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const featured = searchParams.get('featured');
    const storeId = searchParams.get('storeId');
    const categoryId = searchParams.get('categoryId');
    const status = searchParams.get('status') || 'active';

    // Construction de la requête
    const query: any = {};

    // Filtrer par statut (par défaut: active)
    if (status !== 'all') {
      query.status = status;
    }

    // Filtrer par magasin
    if (storeId) {
      query.storeId = storeId;
    }

    // Filtrer par catégorie
    if (categoryId) {
      query.category = categoryId;
    }

    // Filtrer par collections en vedette
    if (featured !== null) {
      query.featured = featured === 'true';
    }

    // Recherche textuelle
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { heading: { $regex: search, $options: 'i' } },
        { subheading: { $regex: search, $options: 'i' } }
      ];
    }

    // Calcul de la pagination
    const skip = (page - 1) * limit;

    // Exécution des requêtes en parallèle
    const [collections, totalCollections] = await Promise.all([
      Collection.find(query)
        .populate('category', 'name slug')
        .populate('products', 'title price images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Collection.countDocuments(query)
    ]);

    // Calcul des métadonnées de pagination
    const totalPages = Math.ceil(totalCollections / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      data: collections,
      pagination: {
        currentPage: page,
        totalPages,
        totalCollections,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la récupération des collections',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/collections:
 *   post:
 *     summary: Créer une nouvelle collection
 *     description: Crée une nouvelle collection (accès admin requis)
 *     tags: [Collections]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - storeId
 *             properties:
 *               title:
 *                 type: string
 *                 description: Titre de la collection
 *               description:
 *                 type: string
 *                 description: Description de la collection
 *               imgSrc:
 *                 type: string
 *                 description: URL de l'image
 *               altText:
 *                 type: string
 *                 description: Texte alternatif de l'image
 *               subheading:
 *                 type: string
 *                 description: Sous-titre
 *               heading:
 *                 type: string
 *                 description: Titre principal
 *               price:
 *                 type: number
 *                 description: Prix de la collection
 *               backgroundColor:
 *                 type: string
 *                 description: Couleur de fond
 *               featured:
 *                 type: boolean
 *                 description: Collection en vedette
 *               storeId:
 *                 type: string
 *                 description: ID du magasin
 *               categoryId:
 *                 type: string
 *                 description: ID de la catégorie
 *               products:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: IDs des produits
 *               seoTitle:
 *                 type: string
 *                 description: Titre SEO
 *               seoDescription:
 *                 type: string
 *                 description: Description SEO
 *               seoKeywords:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Mots-clés SEO
 *     responses:
 *       201:
 *         description: Collection créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Collection'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé
 */
export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    
    if (!token || !checkAdminAccess(token.role as string)) {
      return NextResponse.json(
        { error: 'Accès refusé. Seuls les administrateurs peuvent créer des collections.' },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();
    const {
      title,
      description,
      imgSrc,
      altText,
      subheading,
      heading,
      price,
      backgroundColor,
      featured = false,
      storeId,
      categoryId,
      products = [],
      status = 'active',
      seoTitle,
      seoDescription,
      seoKeywords = []
    } = body;

    // Validation des champs requis
    if (!title || !storeId) {
      return NextResponse.json(
        { error: 'Le titre et l\'ID du magasin sont requis' },
        { status: 400 }
      );
    }

    // Vérifier si une collection avec le même titre existe déjà pour ce magasin
    const existingCollection = await Collection.findOne({ 
      title, 
      storeId 
    });

    if (existingCollection) {
      return NextResponse.json(
        { error: 'Une collection avec ce titre existe déjà pour ce magasin' },
        { status: 400 }
      );
    }

    // Créer la nouvelle collection
    const newCollection = new Collection({
      title,
      description,
      imgSrc,
      altText,
      subheading,
      heading,
      price,
      backgroundColor,
      featured,
      storeId,
      category: categoryId,
      products,
      status,
      seoTitle,
      seoDescription,
      seoKeywords
    });

    await newCollection.save();

    // Populer les références pour la réponse
    await newCollection.populate([
      { path: 'category', select: 'name slug' },
      { path: 'products', select: 'title price images' }
    ]);

    return NextResponse.json({
      success: true,
      data: newCollection
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating collection:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la création de la collection',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}
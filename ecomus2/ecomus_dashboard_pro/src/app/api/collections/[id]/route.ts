import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Collection from '@/models/Collection';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * @swagger
 * /api/collections/{id}:
 *   get:
 *     summary: Récupérer une collection par ID
 *     description: Retourne les détails d'une collection spécifique
 *     tags: [Collections]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la collection
 *     responses:
 *       200:
 *         description: Détails de la collection
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Collection'
 *       404:
 *         description: Collection non trouvée
 *       500:
 *         description: Erreur serveur
 */
// GET /api/collections/[id] - Récupérer une collection spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const collection = await Collection.findById(params.id)
      .populate('categoryId', 'name slug')
      .populate('storeId', 'name slug')
      .populate('products', 'title price images slug')
      .lean();

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: collection
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la collection:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération de la collection' },
      { status: 500 }
    );
  }
}

// PUT /api/collections/[id] - Mettre à jour une collection
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accès non autorisé. Droits administrateur requis.' },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();
    const {
      title,
      slug,
      description,
      subheading,
      heading,
      imgSrc,
      altText,
      backgroundColor,
      price,
      originalPrice,
      featured,
      isActive,
      categoryId,
      storeId,
      products,
      tags,
      seoTitle,
      seoDescription,
      seoKeywords
    } = body;

    // Validation des champs requis
    if (!title || !storeId) {
      return NextResponse.json(
        { error: 'Le titre et le magasin sont requis' },
        { status: 400 }
      );
    }

    // Vérifier si la collection existe
    const existingCollection = await Collection.findById(params.id);
    if (!existingCollection) {
      return NextResponse.json(
        { error: 'Collection non trouvée' },
        { status: 404 }
      );
    }

    // Vérifier l'unicité du titre pour le même magasin (sauf pour cette collection)
    if (title !== existingCollection.title || storeId !== existingCollection.storeId.toString()) {
      const duplicateCollection = await Collection.findOne({
        title,
        storeId,
        _id: { $ne: params.id }
      });

      if (duplicateCollection) {
        return NextResponse.json(
          { error: 'Une collection avec ce titre existe déjà pour ce magasin' },
          { status: 400 }
        );
      }
    }

    // Préparer les données de mise à jour
    const updateData: any = {
      title,
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description: description || '',
      subheading: subheading || '',
      heading: heading || '',
      imgSrc: imgSrc || '',
      altText: altText || '',
      backgroundColor: backgroundColor || '#ffffff',
      featured: Boolean(featured),
      isActive: Boolean(isActive),
      storeId,
      tags: Array.isArray(tags) ? tags : [],
      seoTitle: seoTitle || title,
      seoDescription: seoDescription || '',
      seoKeywords: Array.isArray(seoKeywords) ? seoKeywords : [],
      updatedAt: new Date()
    };

    // Ajouter les champs optionnels s'ils sont fournis
    if (price !== undefined && price !== null && price !== '') {
      updateData.price = Number(price);
    }
    if (originalPrice !== undefined && originalPrice !== null && originalPrice !== '') {
      updateData.originalPrice = Number(originalPrice);
    }
    if (categoryId) {
      updateData.categoryId = categoryId;
    }
    if (Array.isArray(products)) {
      updateData.products = products;
    }

    // Mettre à jour la collection
    const updatedCollection = await Collection.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('categoryId', 'name slug')
      .populate('storeId', 'name slug')
      .populate('products', 'title price images slug');

    return NextResponse.json({
      success: true,
      message: 'Collection mise à jour avec succès',
      data: updatedCollection
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la collection:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la mise à jour de la collection' },
      { status: 500 }
    );
  }
}

// DELETE /api/collections/[id] - Supprimer une collection
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accès non autorisé. Droits administrateur requis.' },
        { status: 403 }
      );
    }

    await connectDB();

    // Vérifier si la collection existe
    const collection = await Collection.findById(params.id);
    if (!collection) {
      return NextResponse.json(
        { error: 'Collection non trouvée' },
        { status: 404 }
      );
    }

    // Supprimer la collection
    await Collection.findByIdAndDelete(params.id);

    return NextResponse.json({
      success: true,
      message: 'Collection supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la collection:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la suppression de la collection' },
      { status: 500 }
    );
  }
}

// PATCH /api/collections/[id] - Actions spécifiques (toggle status, featured, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accès non autorisé. Droits administrateur requis.' },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { action, value } = body;

    // Vérifier si la collection existe
    const collection = await Collection.findById(params.id);
    if (!collection) {
      return NextResponse.json(
        { error: 'Collection non trouvée' },
        { status: 404 }
      );
    }

    let updateData: any = { updatedAt: new Date() };
    let message = '';

    switch (action) {
      case 'toggleActive':
        updateData.isActive = !collection.isActive;
        message = `Collection ${updateData.isActive ? 'activée' : 'désactivée'} avec succès`;
        break;
      
      case 'toggleFeatured':
        updateData.featured = !collection.featured;
        message = `Collection ${updateData.featured ? 'mise en vedette' : 'retirée de la vedette'} avec succès`;
        break;
      
      case 'setActive':
        updateData.isActive = Boolean(value);
        message = `Statut de la collection mis à jour avec succès`;
        break;
      
      case 'setFeatured':
        updateData.featured = Boolean(value);
        message = `Statut vedette de la collection mis à jour avec succès`;
        break;
      
      default:
        return NextResponse.json(
          { error: 'Action non reconnue' },
          { status: 400 }
        );
    }

    // Mettre à jour la collection
    const updatedCollection = await Collection.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('categoryId', 'name slug')
      .populate('storeId', 'name slug')
      .populate('products', 'title price images slug');

    return NextResponse.json({
      success: true,
      message,
      data: updatedCollection
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la collection:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la mise à jour de la collection' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/collections/{id}:
 *   put:
 *     summary: Mettre à jour une collection
 *     description: Met à jour une collection existante (accès admin requis)
 *     tags: [Collections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la collection
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
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
 *               categoryId:
 *                 type: string
 *                 description: ID de la catégorie
 *               products:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: IDs des produits
 *               status:
 *                 type: string
 *                 enum: [active, inactive, draft]
 *                 description: Statut de la collection
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
 *       200:
 *         description: Collection mise à jour avec succès
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
 *       404:
 *         description: Collection non trouvée
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({ req: request });
    
    if (!token || !checkAdminAccess(token.role as string)) {
      return NextResponse.json(
        { error: 'Accès refusé. Seuls les administrateurs peuvent modifier des collections.' },
        { status: 403 }
      );
    }

    await connectDB();
    
    const { id } = await params;
    const body = await request.json();

    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'ID de collection invalide' },
        { status: 400 }
      );
    }

    const {
      title,
      description,
      imgSrc,
      altText,
      subheading,
      heading,
      price,
      backgroundColor,
      featured,
      categoryId,
      products,
      status,
      seoTitle,
      seoDescription,
      seoKeywords
    } = body;

    // Préparer les données de mise à jour
    const updateData: any = {};
    
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (imgSrc !== undefined) updateData.imgSrc = imgSrc;
    if (altText !== undefined) updateData.altText = altText;
    if (subheading !== undefined) updateData.subheading = subheading;
    if (heading !== undefined) updateData.heading = heading;
    if (price !== undefined) updateData.price = price;
    if (backgroundColor !== undefined) updateData.backgroundColor = backgroundColor;
    if (featured !== undefined) updateData.featured = featured;
    if (categoryId !== undefined) updateData.category = categoryId;
    if (products !== undefined) updateData.products = products;
    if (status !== undefined) updateData.status = status;
    if (seoTitle !== undefined) updateData.seoTitle = seoTitle;
    if (seoDescription !== undefined) updateData.seoDescription = seoDescription;
    if (seoKeywords !== undefined) updateData.seoKeywords = seoKeywords;

    // Si le titre change, vérifier l'unicité
    if (title) {
      const existingCollection = await Collection.findOne({ 
        title, 
        _id: { $ne: id },
        storeId: (await Collection.findById(id))?.storeId
      });

      if (existingCollection) {
        return NextResponse.json(
          { error: 'Une collection avec ce titre existe déjà pour ce magasin' },
          { status: 400 }
        );
      }
    }

    const updatedCollection = await Collection.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('category', 'name slug description')
    .populate('products', 'title price images slug description');

    if (!updatedCollection) {
      return NextResponse.json(
        { success: false, error: 'Collection non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedCollection
    });
  } catch (error) {
    console.error('Error updating collection:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la mise à jour de la collection',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/collections/{id}:
 *   delete:
 *     summary: Supprimer une collection
 *     description: Supprime une collection existante (accès admin requis)
 *     tags: [Collections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la collection
 *     responses:
 *       200:
 *         description: Collection supprimée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Collection non trouvée
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({ req: request });
    
    if (!token || !checkAdminAccess(token.role as string)) {
      return NextResponse.json(
        { error: 'Accès refusé. Seuls les administrateurs peuvent supprimer des collections.' },
        { status: 403 }
      );
    }

    await connectDB();
    
    const { id } = await params;

    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'ID de collection invalide' },
        { status: 400 }
      );
    }

    const deletedCollection = await Collection.findByIdAndDelete(id);

    if (!deletedCollection) {
      return NextResponse.json(
        { success: false, error: 'Collection non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Collection supprimée avec succès'
    });
  } catch (error) {
    console.error('Error deleting collection:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la suppression de la collection',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}
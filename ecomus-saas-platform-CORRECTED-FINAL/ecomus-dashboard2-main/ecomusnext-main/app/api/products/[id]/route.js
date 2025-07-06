import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectDB } from '../../../../lib/mongodb'
import Product from '../../../../models/Product'
import { isValidObjectId } from 'mongoose'

// GET /api/products/[id] - Récupérer un produit spécifique
export async function GET(request, { params }) {
  try {
    await connectDB()
    
    const { id } = params
    
    if (!isValidObjectId(id)) {
      return NextResponse.json({
        success: false,
        error: 'ID de produit invalide'
      }, { status: 400 })
    }

    const product = await Product.findById(id)
      .populate('storeId', 'name slug isActive')
      .populate('category', 'name slug')
      .lean()

    if (!product) {
      return NextResponse.json({
        success: false,
        error: 'Produit non trouvé'
      }, { status: 404 })
    }

    // Incrémenter les vues
    await Product.findByIdAndUpdate(id, { 
      $inc: { 'analytics.views': 1 } 
    })

    return NextResponse.json({
      success: true,
      data: product
    })

  } catch (error) {
    console.error('Erreur lors de la récupération du produit:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur lors de la récupération du produit'
    }, { status: 500 })
  }
}

// PUT /api/products/[id] - Mettre à jour un produit
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession()
    
    if (!session || !['admin', 'vendor'].includes(session.user.role)) {
      return NextResponse.json({
        success: false,
        error: 'Accès non autorisé'
      }, { status: 401 })
    }

    await connectDB()
    
    const { id } = params
    const body = await request.json()
    
    if (!isValidObjectId(id)) {
      return NextResponse.json({
        success: false,
        error: 'ID de produit invalide'
      }, { status: 400 })
    }

    // Vérifier que le produit existe
    const existingProduct = await Product.findById(id)
    if (!existingProduct) {
      return NextResponse.json({
        success: false,
        error: 'Produit non trouvé'
      }, { status: 404 })
    }

    // Vérifier les permissions
    if (session.user.role === 'vendor') {
      if (!session.user.storeId || existingProduct.storeId.toString() !== session.user.storeId) {
        return NextResponse.json({
          success: false,
          error: 'Vous ne pouvez modifier que vos propres produits'
        }, { status: 403 })
      }
    }

    // Supprimer les champs protégés
    delete body._id
    delete body.createdAt
    delete body.createdBy
    if (session.user.role === 'vendor') {
      delete body.storeId
    }

    // Mettre à jour le produit
    const product = await Product.findByIdAndUpdate(
      id,
      { 
        ...body,
        updatedAt: new Date()
      },
      { 
        new: true,
        runValidators: true
      }
    )
    .populate('storeId', 'name slug')
    .populate('category', 'name slug')

    return NextResponse.json({
      success: true,
      data: product,
      message: 'Produit mis à jour avec succès'
    })

  } catch (error) {
    console.error('Erreur lors de la mise à jour du produit:', error)
    
    if (error.code === 11000) {
      return NextResponse.json({
        success: false,
        error: 'Un produit avec ce slug existe déjà'
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Erreur serveur lors de la mise à jour du produit'
    }, { status: 500 })
  }
}

// DELETE /api/products/[id] - Supprimer un produit
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession()
    
    if (!session || !['admin', 'vendor'].includes(session.user.role)) {
      return NextResponse.json({
        success: false,
        error: 'Accès non autorisé'
      }, { status: 401 })
    }

    await connectDB()
    
    const { id } = params
    
    if (!isValidObjectId(id)) {
      return NextResponse.json({
        success: false,
        error: 'ID de produit invalide'
      }, { status: 400 })
    }

    // Vérifier que le produit existe
    const existingProduct = await Product.findById(id)
    if (!existingProduct) {
      return NextResponse.json({
        success: false,
        error: 'Produit non trouvé'
      }, { status: 404 })
    }

    // Vérifier les permissions
    if (session.user.role === 'vendor') {
      if (!session.user.storeId || existingProduct.storeId.toString() !== session.user.storeId) {
        return NextResponse.json({
          success: false,
          error: 'Vous ne pouvez supprimer que vos propres produits'
        }, { status: 403 })
      }
    }

    // Soft delete (marquer comme inactif)
    await Product.findByIdAndUpdate(id, { 
      isActive: false,
      deletedAt: new Date()
    })

    return NextResponse.json({
      success: true,
      message: 'Produit supprimé avec succès'
    })

  } catch (error) {
    console.error('Erreur lors de la suppression du produit:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur lors de la suppression du produit'
    }, { status: 500 })
  }
}

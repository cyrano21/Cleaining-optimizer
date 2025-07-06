import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectDB } from '../../../lib/mongodb'
import Store from '../../../models/Store'
import User from '../../../models/User'

// GET /api/stores - Récupérer toutes les boutiques
export async function GET(request) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 12
    const search = searchParams.get('search')
    const isActive = searchParams.get('isActive')

    // Construction du filtre
    const filter = {}
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }
    
    if (isActive !== null && isActive !== undefined) {
      filter.isActive = isActive === 'true'
    }

    // Récupération des boutiques avec pagination
    const skip = (page - 1) * limit
    const stores = await Store.find(filter)
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await Store.countDocuments(filter)
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      data: {
        stores,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des boutiques:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur lors de la récupération des boutiques'
    }, { status: 500 })
  }
}

// POST /api/stores - Créer une nouvelle boutique
export async function POST(request) {
  try {
    const session = await getServerSession()
    
    if (!session || !['admin', 'vendor'].includes(session.user.role)) {
      return NextResponse.json({
        success: false,
        error: 'Accès non autorisé'
      }, { status: 401 })
    }

    await connectDB()
    
    const body = await request.json()
    
    // Validation des données requises
    const requiredFields = ['name', 'description']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({
          success: false,
          error: `Le champ ${field} est requis`
        }, { status: 400 })
      }
    }

    // Si c'est un vendor, il devient automatiquement propriétaire
    let ownerId = body.ownerId
    if (session.user.role === 'vendor') {
      ownerId = session.user.id
      
      // Vérifier qu'il n'a pas déjà une boutique
      const existingStore = await Store.findOne({ ownerId: session.user.id })
      if (existingStore) {
        return NextResponse.json({
          success: false,
          error: 'Vous avez déjà une boutique'
        }, { status: 400 })
      }
    }

    // Vérifier que le propriétaire existe
    if (ownerId) {
      const owner = await User.findById(ownerId)
      if (!owner) {
        return NextResponse.json({
          success: false,
          error: 'Propriétaire introuvable'
        }, { status: 400 })
      }
    }

    // Créer la boutique
    const store = new Store({
      ...body,
      ownerId,
      createdBy: session.user.id
    })

    await store.save()
    await store.populate('ownerId', 'name email')

    // Mettre à jour l'utilisateur propriétaire
    if (ownerId) {
      await User.findByIdAndUpdate(ownerId, { 
        storeId: store._id,
        role: 'vendor'
      })
    }

    return NextResponse.json({
      success: true,
      data: store,
      message: 'Boutique créée avec succès'
    }, { status: 201 })

  } catch (error) {
    console.error('Erreur lors de la création de la boutique:', error)
    
    if (error.code === 11000) {
      return NextResponse.json({
        success: false,
        error: 'Une boutique avec ce slug existe déjà'
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Erreur serveur lors de la création de la boutique'
    }, { status: 500 })
  }
}

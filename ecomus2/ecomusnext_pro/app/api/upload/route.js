import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { v2 as cloudinary } from 'cloudinary'

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// POST /api/upload - Upload d'images
export async function POST(request) {
  try {
    const session = await getServerSession()
    
    if (!session || !['admin', 'vendor'].includes(session.user.role)) {
      return NextResponse.json({
        success: false,
        error: 'Accès non autorisé'
      }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file')
    const folder = formData.get('folder') || 'general'
    
    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'Aucun fichier fourni'
      }, { status: 400 })
    }

    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        success: false,
        error: 'Type de fichier non autorisé. Seules les images sont acceptées.'
      }, { status: 400 })
    }

    // Vérifier la taille du fichier (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({
        success: false,
        error: 'Fichier trop volumineux. Taille maximale: 10MB'
      }, { status: 400 })
    }

    // Convertir le fichier en buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Définir le dossier selon le rôle et le type
    let uploadFolder = `ecomus/${folder}`
    if (session.user.role === 'vendor' && session.user.storeId) {
      uploadFolder = `ecomus/stores/${session.user.storeId}/${folder}`
    }

    // Upload vers Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: uploadFolder,
          resource_type: 'image',
          transformation: [
            { quality: 'auto:good' },
            { format: 'webp' }
          ],
          tags: [
            'ecomus',
            session.user.role,
            folder
          ]
        },
        (error, result) => {
          if (error) {
            reject(error)
          } else {
            resolve(result)
          }
        }
      ).end(buffer)
    })

    return NextResponse.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes
      },
      message: 'Image uploadée avec succès'
    })

  } catch (error) {
    console.error('Erreur lors de l\'upload:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur lors de l\'upload'
    }, { status: 500 })
  }
}

// DELETE /api/upload - Supprimer une image
export async function DELETE(request) {
  try {
    const session = await getServerSession()
    
    if (!session || !['admin', 'vendor'].includes(session.user.role)) {
      return NextResponse.json({
        success: false,
        error: 'Accès non autorisé'
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const publicId = searchParams.get('publicId')
    
    if (!publicId) {
      return NextResponse.json({
        success: false,
        error: 'ID public de l\'image requis'
      }, { status: 400 })
    }

    // Vérifier les permissions (vendor ne peut supprimer que ses images)
    if (session.user.role === 'vendor' && session.user.storeId) {
      const expectedPrefix = `ecomus/stores/${session.user.storeId}/`
      if (!publicId.startsWith(expectedPrefix)) {
        return NextResponse.json({
          success: false,
          error: 'Vous ne pouvez supprimer que vos propres images'
        }, { status: 403 })
      }
    }

    // Supprimer de Cloudinary
    const result = await cloudinary.uploader.destroy(publicId)

    if (result.result === 'ok') {
      return NextResponse.json({
        success: true,
        message: 'Image supprimée avec succès'
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Impossible de supprimer l\'image'
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur lors de la suppression'
    }, { status: 500 })
  }
}

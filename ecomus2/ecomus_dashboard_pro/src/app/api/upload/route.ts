import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const uploadType = formData.get('type') as string || 'image'; // image, 3d, video
    const category = formData.get('category') as string || 'general'; // products, users, etc.
    const storeId = formData.get('storeId') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    // Configuration des types de fichiers et tailles autorisées
    const allowedTypes = {
      image: {
        mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        maxSize: 10 * 1024 * 1024, // 10MB
        folder: 'images'
      },
      '3d': {
        mimeTypes: ['model/gltf+json', 'model/gltf-binary', 'application/octet-stream'],
        extensions: ['.gltf', '.glb', '.obj'],
        maxSize: 50 * 1024 * 1024, // 50MB
        folder: '3d-models'
      },
      video: {
        mimeTypes: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
        maxSize: 100 * 1024 * 1024, // 100MB
        folder: 'videos'
      }
    };

    const typeConfig = allowedTypes[uploadType as keyof typeof allowedTypes];
    if (!typeConfig) {
      return NextResponse.json(
        { success: false, error: 'Type de fichier non supporté' },
        { status: 400 }
      );
    }

    // Vérifier le type de fichier
    const isValidMimeType = typeConfig.mimeTypes.includes(file.type);
    const isValidExtension = uploadType === '3d' ? 
      ('extensions' in typeConfig && typeConfig.extensions?.some((ext: string) => file.name.toLowerCase().endsWith(ext))) : true;

    if (!isValidMimeType && !isValidExtension) {
      return NextResponse.json(
        { success: false, error: `Type de fichier non autorisé pour ${uploadType}` },
        { status: 400 }
      );
    }

    // Vérifier la taille du fichier
    if (file.size > typeConfig.maxSize) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Le fichier ne doit pas dépasser ${typeConfig.maxSize / (1024 * 1024)}MB pour ${uploadType}` 
        },
        { status: 400 }
      );
    }

    // Convertir le fichier en buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Configuration d'upload selon le type
    const cloudinaryConfig = {
      image: {
        resource_type: 'image' as const,
        transformation: [
          { width: 1200, height: 1200, crop: 'limit', quality: 'auto', format: 'webp' }
        ]
      },
      '3d': {
        resource_type: 'raw' as const,
        // Pas de transformation pour les modèles 3D
      },
      video: {
        resource_type: 'video' as const,
        transformation: [
          { width: 1920, height: 1080, crop: 'limit', quality: 'auto' }
        ]
      }
    };

    const uploadConfig = cloudinaryConfig[uploadType as keyof typeof cloudinaryConfig];

    // Upload vers Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadOptions = {
        ...uploadConfig,
        folder: storeId ? `ecomus/stores/${storeId}/${typeConfig.folder}` : `ecomus/users/${session.user.id || session.user.email}/${typeConfig.folder}`,
        public_id: `${storeId || session.user.id || session.user.email}_${uploadType}_${Date.now()}`,
      };

      cloudinary.uploader.upload_stream(
        uploadOptions,
        (error: any, result: any) => {
          if (error) {
            console.error('Erreur Cloudinary:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      ).end(buffer);
    });

    const result = uploadResult as any;

    console.log('📸 UPLOAD RÉUSSI:', {
      public_id: result.public_id,
      secure_url: result.secure_url,
      user: session.user.email,
      type: uploadType
    });

    return NextResponse.json({
      success: true,
      data: {
        url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
      },
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de l\'upload de l\'image' 
      },
      { status: 500 }
    );
  }
}

// Endpoint pour supprimer une image
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('public_id');

    if (!publicId) {
      return NextResponse.json(
        { success: false, error: 'Public ID requis' },
        { status: 400 }
      );
    }

    // Supprimer de Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    console.log('🗑️ SUPPRESSION:', {
      public_id: publicId,
      result: result.result,
      user: session.user.email
    });

    return NextResponse.json({
      success: true,
      data: { result: result.result },
    });
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la suppression de l\'image' 
      },
      { status: 500 }
    );
  }
}
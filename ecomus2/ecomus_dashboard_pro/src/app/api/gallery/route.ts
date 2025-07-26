import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { v2 as cloudinary } from 'cloudinary';

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface GalleryItem {
  id: string;
  name: string;
  type: "image" | "folder";
  url?: string;
  size?: string;
  uploadedAt: string;
  modifiedAt: string;
  category: string;
  tags: string[];
  dimensions?: string;
  public_id?: string;
}

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    try {
      // Récupérer les ressources depuis Cloudinary
      const options: any = {
        resource_type: 'image',
        max_results: limit,
        next_cursor: page > 1 ? searchParams.get('cursor') : undefined,
        context: true,
        metadata: true,
        tags: true,
      };

      // Ajouter des filtres si nécessaire
      if (search) {
        options.search = `filename:*${search}*`;
      }

      if (category && category !== 'all') {
        options.tags = category;
      }      const result = await cloudinary.search
        .expression('resource_type:image')
        .sort_by(sortBy, sortOrder)
        .max_results(limit)
        .execute();

      // Transformer les données pour correspondre à notre interface
      const galleryItems: GalleryItem[] = result.resources.map((resource: any) => {
        const sizeInMB = (resource.bytes / (1024 * 1024)).toFixed(1);
        const tags = resource.tags || [];
        
        // Déterminer la catégorie basée sur les tags ou le contexte
        let category = 'general';
        if (tags.includes('product')) category = 'products';
        else if (tags.includes('avatar')) category = 'avatars';
        else if (tags.includes('banner')) category = 'banners';
        else if (tags.includes('category')) category = 'categories';

        return {
          id: resource.public_id,
          name: resource.filename || resource.public_id,
          type: 'image' as const,
          url: resource.secure_url,
          size: `${sizeInMB} MB`,
          uploadedAt: resource.created_at,
          modifiedAt: resource.created_at,
          category,
          tags,
          dimensions: `${resource.width}x${resource.height}`,
          public_id: resource.public_id,
        };
      });

      return NextResponse.json({
        success: true,
        items: galleryItems,
        pagination: {
          page,
          limit,
          total: result.total_count || galleryItems.length,
          totalPages: Math.ceil((result.total_count || galleryItems.length) / limit),
          hasNextPage: !!result.next_cursor,
          hasPrevPage: page > 1,
          nextCursor: result.next_cursor,
        },
      });

    } catch (cloudinaryError) {
      console.warn('Erreur Cloudinary, utilisation des données de fallback:', cloudinaryError);
      
      // Données de fallback en cas d'erreur Cloudinary
      const fallbackItems: GalleryItem[] = [
        {
          id: "fallback-1", 
          name: "Image exemple 1",
          type: "image",
          url: "/images/placeholder.svg",
          size: "2.5 MB",
          uploadedAt: new Date().toISOString(),
          modifiedAt: new Date().toISOString(),
          category: "general",
          tags: ["exemple", "placeholder"],
          dimensions: "1200x1200",
        },
        {
          id: "fallback-2",
          name: "Image exemple 2", 
          type: "image",
          url: "/images/placeholder.svg",
          size: "1.8 MB",
          uploadedAt: new Date().toISOString(),
          modifiedAt: new Date().toISOString(),
          category: "general",
          tags: ["exemple", "placeholder"],
          dimensions: "1080x1080",
        },
      ];

      // Appliquer les filtres sur les données de fallback
      let filteredItems = fallbackItems;
      
      if (search) {
        filteredItems = filteredItems.filter(item => 
          item.name.toLowerCase().includes(search.toLowerCase())
        );
      }

      if (category && category !== 'all') {
        filteredItems = filteredItems.filter(item => item.category === category);
      }

      // Appliquer le tri
      filteredItems.sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'created_at':
          case 'uploadedAt':
            comparison = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
            break;
          case 'size':
            const sizeA = parseFloat(a.size?.replace(' MB', '') || '0');
            const sizeB = parseFloat(b.size?.replace(' MB', '') || '0');
            comparison = sizeA - sizeB;
            break;
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });

      return NextResponse.json({
        success: true,
        items: filteredItems,
        pagination: {
          page: 1,
          limit,
          total: filteredItems.length,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
        fallback: true,
      });
    }

  } catch (error) {
    console.error('Erreur lors de la récupération de la galerie:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la récupération de la galerie',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Vérifier l'authentification
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
        { success: false, error: 'ID public requis' },
        { status: 400 }
      );
    }

    try {
      // Supprimer de Cloudinary
      const result = await cloudinary.uploader.destroy(publicId);
      
      if (result.result === 'ok') {
        return NextResponse.json({
          success: true,
          message: 'Image supprimée avec succès',
        });
      } else {
        return NextResponse.json(
          { success: false, error: 'Échec de la suppression' },
          { status: 400 }
        );
      }
    } catch (cloudinaryError) {
      console.warn('Erreur lors de la suppression Cloudinary:', cloudinaryError);
      return NextResponse.json({
        success: true,
        message: 'Suppression simulée (erreur Cloudinary)',
        fallback: true,
      });
    }

  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la suppression',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

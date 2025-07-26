import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectDB } from '@/lib/mongodb';
import { checkAdminAccess } from '@/lib/role-utils';
import Category from '@/models/Category';

// Interface pour les catégories
interface CategoryData {
  _id: string;
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  level: number;
  status: 'active' | 'inactive' | 'draft';
  createdAt: string;
  updatedAt: string;
  productsCount?: number;
  storeId?: string;
}

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    
    const userRole = token?.role as string | undefined;
    if (!token || !checkAdminAccess(userRole || '')) {
      return NextResponse.json(
        { error: 'Access denied. Only administrators can view categories.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const parentId = searchParams.get('parentId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const storeId = searchParams.get('storeId');
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    try {
      await connectDB();
      
      // Construction de la requête MongoDB
      const matchQuery: any = {};
      
      if (parentId) {
        matchQuery.parentId = parentId;
      }
      
      if (status) {
        matchQuery.status = status;
      }
      
      if (storeId) {
        matchQuery.storeId = storeId;
      }
      
      if (search) {
        matchQuery.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      // Calcul de l'offset pour la pagination
      const skip = (page - 1) * limit;
      
      // Définition du tri
      const sortOptions: any = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Requête avec agrégation pour compter les produits
      const pipeline = [
        { $match: matchQuery },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: 'categoryId',
            as: 'products'
          }
        },
        {
          $addFields: {
            productsCount: { $size: '$products' }
          }
        },
        {
          $project: {
            products: 0 // Exclure les produits du résultat final
          }
        },
        { $sort: sortOptions },
        { $skip: skip },
        { $limit: limit }
      ];

      const categories = await Category.aggregate(pipeline);
      
      // Compter le total pour la pagination
      const totalCategories = await Category.countDocuments(matchQuery);
      const totalPages = Math.ceil(totalCategories / limit);

      return NextResponse.json({
        success: true,
        data: categories,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalCategories,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      });

    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Categories API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    
    const userRole = token?.role as string | undefined;
    if (!token || !checkAdminAccess(userRole || '')) {
      return NextResponse.json(
        { error: 'Access denied. Only administrators can create categories.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, parentId, storeId, status = 'active' } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    try {
      await connectDB();

      // Générer un slug unique
      const slug = name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Vérifier l'unicité du slug
      const existingCategory = await Category.findOne({ slug, storeId });
      if (existingCategory) {
        return NextResponse.json(
          { error: 'A category with this name already exists' },
          { status: 409 }
        );
      }

      // Déterminer le niveau de la catégorie
      let level = 0;
      if (parentId) {
        const parentCategory = await Category.findById(parentId);
        if (parentCategory) {
          level = parentCategory.level + 1;
        }
      }

      // Créer la nouvelle catégorie
      const newCategory = new Category({
        name,
        slug,
        description,
        parentId: parentId || null,
        level,
        status,
        storeId,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const savedCategory = await newCategory.save();

      return NextResponse.json({
        success: true,
        data: savedCategory,
        message: 'Category created successfully'
      }, { status: 201 });

    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to create category' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Create category API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    
    const userRole = token?.role as string | undefined;
    if (!token || !checkAdminAccess(userRole || '')) {
      return NextResponse.json(
        { error: 'Access denied. Only administrators can update categories.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, name, description, parentId, status } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    try {
      await connectDB();

      const updateData: any = {
        updatedAt: new Date()
      };

      if (name) {
        updateData.name = name;
        updateData.slug = name.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }

      if (description !== undefined) {
        updateData.description = description;
      }

      if (parentId !== undefined) {
        updateData.parentId = parentId;
        
        // Recalculer le niveau si le parent change
        if (parentId) {
          const parentCategory = await Category.findById(parentId);
          if (parentCategory) {
            updateData.level = parentCategory.level + 1;
          }
        } else {
          updateData.level = 0;
        }
      }

      if (status) {
        updateData.status = status;
      }

      const updatedCategory = await Category.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!updatedCategory) {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: updatedCategory,
        message: 'Category updated successfully'
      });

    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to update category' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Update category API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    
    const userRole = token?.role as string | undefined;
    if (!token || !checkAdminAccess(userRole || '')) {
      return NextResponse.json(
        { error: 'Access denied. Only administrators can delete categories.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    try {
      await connectDB();

      // Vérifier si la catégorie a des sous-catégories
      const hasSubcategories = await Category.findOne({ parentId: id });
      if (hasSubcategories) {
        return NextResponse.json(
          { error: 'Cannot delete category with subcategories' },
          { status: 409 }
        );
      }

      // Vérifier si la catégorie a des produits (optionnel)
      // const hasProducts = await Product.findOne({ categoryId: id });
      // if (hasProducts) {
      //   return NextResponse.json(
      //     { error: 'Cannot delete category with products' },
      //     { status: 409 }
      //   );
      // }

      const deletedCategory = await Category.findByIdAndDelete(id);

      if (!deletedCategory) {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Category deleted successfully'
      });

    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to delete category' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Delete category API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
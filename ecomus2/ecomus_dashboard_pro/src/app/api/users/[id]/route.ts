import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { checkAdminAccess } from '@/lib/role-utils';

// GET - Get specific user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({ req: request });
    
    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    await connectDB();

    const { id: userId } = await params;

    // Only admins can view all users
    // Other users can only view their own profile
    const userRole = token.role as string | undefined;
    if (!checkAdminAccess(userRole || '') && token.sub !== userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const user = await User.findById(userId).select('-password').lean();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user
    });

  } catch (error: unknown) {
    console.error('Error retrieving user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({ req: request });
    
    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    await connectDB();

    const { id: userId } = await params;
    const body = await request.json();

    // Only admins can modify all users
    // Other users can only modify their own profile
    const userRole = token.role as string | undefined;
    if (!checkAdminAccess(userRole || '') && token.sub !== userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // If not admin, limit modifiable fields
    const updateData = { ...body };
    if (!checkAdminAccess(userRole || '')) {
      // Non-admins cannot change their role or active status
      delete updateData.role;
      delete updateData.isActive;
    }

    // Remove sensitive fields
    delete updateData.password; // Password modification must be done via dedicated API
    
    updateData.updatedAt = new Date();

    // Si le rôle devient 'vendor', imposer la présence d'un storeId et créer StoreVendor si besoin
    if (updateData.role === 'vendor') {
      const storeId = updateData.storeId;
      if (!storeId) {
        return NextResponse.json(
          { error: 'A storeId is required to assign vendor role.' },
          { status: 400 }
        );
      }
      const Store = (await import('@/models/Store')).default;
      const store = await Store.findById(storeId);
      if (!store) {
        return NextResponse.json(
          { error: 'The provided storeId does not exist.' },
          { status: 400 }
        );
      }
      // Créer l'association StoreVendor si elle n'existe pas déjà
      const StoreVendor = (await import('@/models/StoreVendor')).default;
      const existing = await StoreVendor.findOne({ storeId, vendorId: userId });
      if (!existing) {
        await StoreVendor.create({
          storeId,
          vendorId: userId,
          role: 'owner',
          status: 'active'
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    ).select('-password').lean();

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'User updated successfully'
    });

  } catch (error: unknown) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({ req: request });
    
    const userRole = token?.role as string | undefined;
    if (!token || !checkAdminAccess(userRole || '')) {
      return NextResponse.json(
        { error: 'Access denied. Only administrators can delete users.' },
        { status: 403 }
      );
    }

    await connectDB();

    const { id: userId } = await params;

    // Prevent admin from deleting themselves
    if (token.sub === userId) {
      return NextResponse.json(
        { error: 'You cannot delete your own account' },
        { status: 400 }
      );
    }

    // Supprimer aussi les StoreVendor associés
    const StoreVendor = (await import('@/models/StoreVendor')).default;
    await StoreVendor.deleteMany({ vendorId: userId });

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error: unknown) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

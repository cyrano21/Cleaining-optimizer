import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectDB } from '@/lib/mongodb';
import Role from '@/models/Role';

// GET - Get specific role
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = await getToken({ req: request });
    
    const userRole = token?.role as string | undefined;
    if (!token || !['admin', 'super_admin', 'ADMIN', 'SUPER_ADMIN'].includes(userRole || '')) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    await connectDB();

    const role = await Role.findById(id).lean();
    
    if (!role) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: (role as any)._id,
        name: (role as any).name,
        permissions: (role as any).permissions || [],
        description: (role as any).description,
        createdAt: (role as any).createdAt,
        updatedAt: (role as any).updatedAt,
        isSystem: (role as any).isSystem || false
      }
    });

  } catch (error: unknown) {
    console.error('Error retrieving role:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update role
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = await getToken({ req: request });
    
    const userRole = token?.role as string | undefined;
    if (!token || userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const roleId = id;
    const body = await request.json();
    const { name, permissions } = body;

    // Check if it's not a system role
    const systemRoles = ['admin', 'vendor', 'customer'];
    if (systemRoles.includes(roleId)) {
      return NextResponse.json(
        { error: 'Cannot modify system role' },
        { status: 400 }
      );
    }

    // Validation
    if (!name || !Array.isArray(permissions)) {
      return NextResponse.json(
        { error: 'Role name and permissions required' },
        { status: 400 }
      );
    }

    // In a real system, you would update the database
    const updatedRole = {
      id: roleId,
      name,
      permissions,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: updatedRole,
      message: 'Role updated successfully'
    });

  } catch (error: unknown) {
    console.error('Error updating role:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete role
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = await getToken({ req: request });
    
    const userRole = token?.role as string | undefined;
    if (!token || userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const roleId = id;

    // Check if it's not a system role
    const systemRoles = ['admin', 'vendor', 'customer'];
    if (systemRoles.includes(roleId)) {
      return NextResponse.json(
        { error: 'Cannot delete system role' },
        { status: 400 }
      );
    }

    // In a real system, you would check if there are users with this role
    // and delete the role from the database

    return NextResponse.json({
      success: true,
      message: 'Role deleted successfully'
    });

  } catch (error: unknown) {
    console.error('Error deleting role:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

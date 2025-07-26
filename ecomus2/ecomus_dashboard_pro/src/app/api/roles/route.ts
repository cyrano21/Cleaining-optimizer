import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectDB from '@/lib/mongodb';
import Role from '@/models/Role';

// Types for roles and permissions
interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

// Available permissions in the system
const systemPermissions: Permission[] = [
  { id: "read", name: "Read", description: "View data", category: "Base" },
  { id: "write", name: "Write", description: "Create and modify", category: "Base" },
  { id: "delete", name: "Delete", description: "Delete data", category: "Base" },
  { id: "manage_users", name: "User Management", description: "Manage user accounts", category: "Administration" },
  { id: "manage_roles", name: "Role Management", description: "Create and modify roles", category: "Administration" },
  { id: "manage_products", name: "Product Management", description: "Manage product catalog", category: "Commerce" },
  { id: "manage_orders", name: "Order Management", description: "Process orders", category: "Commerce" },
  { id: "manage_stores", name: "Store Management", description: "Administer stores", category: "Commerce" },
  { id: "view_analytics", name: "Analytics", description: "Access reports and statistics", category: "Analysis" },
  { id: "manage_settings", name: "System Settings", description: "Configure application", category: "Administration" },
  { id: "manage_categories", name: "Category Management", description: "Manage product categories", category: "Commerce" },
];

// GET - Get all roles
export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    const userRole = token?.role as string | undefined;
    if (!token || userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied. Only administrators can view roles.' },
        { status: 403 }
      );
    }

    await connectDB();

    // Get all roles from database
    const roles = await Role.find({}).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      data: {
        roles: roles,
        permissions: systemPermissions
      }
    });

  } catch (error: unknown) {
    console.error('Error retrieving roles:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new role
export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    const userRole = token?.role as string | undefined;
    if (!token || userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied. Only administrators can create roles.' },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { name, description, permissions } = body;

    // Validation
    if (!name || !Array.isArray(permissions) || permissions.length === 0) {
      return NextResponse.json(
        { error: 'Role name and permissions required' },
        { status: 400 }
      );
    }

    // Check that all permissions exist
    const validPermissions = systemPermissions.map(p => p.id);
    const invalidPermissions = permissions.filter(p => !validPermissions.includes(p));
    
    if (invalidPermissions.length > 0) {
      return NextResponse.json(
        { error: `Invalid permissions: ${invalidPermissions.join(', ')}` },
        { status: 400 }
      );
    }

    // Create new role
    const newRole = new Role({
      name,
      description,
      permissions,
      createdBy: token.sub,
      isSystem: false
    });

    await newRole.save();

    return NextResponse.json({
      success: true,
      data: newRole,
      message: 'Role created successfully'
    });
  } catch (error: unknown) {
    console.error('Error creating role:', error);
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      return NextResponse.json(
        { error: 'A role with this name already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

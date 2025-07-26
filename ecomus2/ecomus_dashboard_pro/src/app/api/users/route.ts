import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { checkAdminAccess } from '@/lib/role-utils';

// Interface for user search filter
interface UserFilter {
  $or?: Array<{
    firstName?: { $regex: string, $options: string };
    lastName?: { $regex: string, $options: string };
    email?: { $regex: string, $options: string };
  }>;
  role?: string;
}

// GET - Get all users with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    
    const userRole = token?.role as string | undefined;
    if (!token || !checkAdminAccess(userRole || '')) {
      return NextResponse.json(
        { error: 'Access denied. Only administrators can view users.' },
        { status: 403 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';

    // Build filter query
    const filter: UserFilter = {};
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      filter.role = role;
    }

    // Count total for pagination
    const total = await User.countDocuments(filter);

    // Get users with pagination
    const users = await User.find(filter)
      .select('-password') // Exclude password
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });

  } catch (error: unknown) {
    console.error('Error retrieving users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    
    const userRole = token?.role as string | undefined;
    if (!token || userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied. Only administrators can create users.' },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      role, 
      isActive = true,
      storeId // <-- Ajouté pour l'association vendeur-boutique
    } = body;

    // Validation
    if (!firstName || !lastName || !email || !password || !role) {
      return NextResponse.json(
        { error: 'All required fields must be filled' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 400 }
      );
    }

    // Check if role is valid
    const validRoles = ['admin', 'vendor', 'customer'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Si le rôle est vendor, imposer la présence d'un storeId valide
    let storeVendorEntry = null;
    if (role === 'vendor') {
      if (!storeId) {
        return NextResponse.json(
          { error: 'A storeId is required to create a vendor.' },
          { status: 400 }
        );
      }
      // Vérifier que la boutique existe
      const Store = (await import('@/models/Store')).default;
      const store = await Store.findById(storeId);
      if (!store) {
        return NextResponse.json(
          { error: 'The provided storeId does not exist.' },
          { status: 400 }
        );
      }
    }

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password, // Model handles hashing
      role,
      isActive,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newUser.save();

    // Si vendor, créer l'association StoreVendor
    if (role === 'vendor' && storeId) {
      const StoreVendor = (await import('@/models/StoreVendor')).default;
      storeVendorEntry = await StoreVendor.create({
        storeId,
        vendorId: newUser._id,
        role: 'owner',
        status: 'active'
      });
    }

    // Return user without password
    const userResponse = await User.findById(newUser._id).select('-password').lean();

    return NextResponse.json({
      success: true,
      data: userResponse,
      message: 'User created successfully',
      storeVendor: storeVendorEntry
    });

  } catch (error: unknown) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

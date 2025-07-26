import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { checkAdminAccess } from '@/lib/role-utils';

// Interface for customer search filter
interface CustomerFilter {
  $or?: Array<{
    firstName?: { $regex: string, $options: string };
    lastName?: { $regex: string, $options: string };
    email?: { $regex: string, $options: string };
  }>;
  role: string; // Always 'customer' for this endpoint
}

// GET - Get all customers with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    
    const userRole = token?.role as string | undefined;
    if (!token || !checkAdminAccess(userRole || '')) {
      return NextResponse.json(
        { error: 'Access denied. Only administrators can view customers.' },
        { status: 403 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    // Build filter query - always filter for customers only
    const filter: CustomerFilter = {
      role: 'customer'
    };
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    // Get customers with pagination
    const [customers, totalCount] = await Promise.all([
      User.find(filter)
        .select('-password -__v')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      customers,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'Erreur lors du chargement des clients'
      },
      { status: 500 }
    );
  }
}

// POST - Create a new customer (if needed)
export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    
    const userRole = token?.role as string | undefined;
    if (!token || !checkAdminAccess(userRole || '')) {
      return NextResponse.json(
        { error: 'Access denied. Only administrators can create customers.' },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { firstName, lastName, email, phone } = body;

    // Check if customer already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Customer already exists',
          message: 'Un client avec cet email existe déjà'
        },
        { status: 400 }
      );
    }

    // Create new customer
    const newCustomer = new User({
      firstName,
      lastName,
      email,
      phone,
      role: 'customer',
      isActive: true
    });

    await newCustomer.save();

    // Remove sensitive data before sending response
    const customerResponse = newCustomer.toObject();
    delete customerResponse.password;
    delete customerResponse.__v;

    return NextResponse.json({
      success: true,
      customer: customerResponse,
      message: 'Client créé avec succès'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'Erreur lors de la création du client'
      },
      { status: 500 }
    );
  }
}
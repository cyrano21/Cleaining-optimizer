import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { DropshippingSupplier } from '@/models/DropshippingProduct';
import { dropshippingService } from '@/services/dropshippingService';
import { connectDB } from '@/lib/mongodb';

// GET /api/dropshipping/suppliers - Get all suppliers
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const country = searchParams.get('country');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');

    // Build filters
    const filters: any = {};
    if (status) filters.status = status;
    if (country) filters.country = country;
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // For vendors, filter only their connected suppliers
    if (session.user.role === 'vendor') {
      // Here you could add logic to filter by store/vendor
      // filters.connectedStores = { $in: [session.user.storeId] };
    }

    const skip = (page - 1) * limit;

    const [suppliers, total] = await Promise.all([
      DropshippingSupplier.find(filters)
        .select('-apiCredentials.apiKey -apiCredentials.apiSecret')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      DropshippingSupplier.countDocuments(filters)
    ]);

    return NextResponse.json({
      suppliers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

// POST /api/dropshipping/suppliers - Create a new supplier
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can create global suppliers
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();
    const {
      name,
      country,
      website,
      description,
      commission,
      shippingTime,
      minOrder,
      categories,
      contactInfo,
      apiCredentials,
      shippingRates,
      returnPolicy
    } = body;

    // Validate required data
    if (!name || !country || !description || !commission || !shippingTime || !contactInfo?.email) {
      return NextResponse.json(
        { error: 'Missing data' },
        { status: 400 }
      );
    }

    // Create supplier directly using the model since the service method expects different data structure
    const supplier = new DropshippingSupplier({
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      country,
      website,
      description,
      rating: 0,
      totalProducts: 0,
      activeStores: 0,
      status: 'active',
      commission,
      shippingTime,
      minOrder: minOrder || 1,
      categories: categories || [],
      joinedDate: new Date(),
      totalRevenue: 0,
      compliance: {
        taxCompliant: true,
        certifications: [],
        lastAudit: new Date()
      },
      contactInfo,
      apiCredentials,
      shippingRates: shippingRates || [],
      returnPolicy
    });

    await supplier.save();

    return NextResponse.json(supplier, { status: 201 });
  } catch (error) {
    console.error('Error creating supplier:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { DropshippingOrder, DropshippingProduct } from '@/models/DropshippingProduct';
import { dropshippingService } from '@/services/dropshippingService';
import { connectDB } from '@/lib/mongodb';

// GET /api/dropshipping/orders - Get dropshipping orders
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const supplierId = searchParams.get('supplier');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const storeId = searchParams.get('store');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Build filters
    const filters: Record<string, unknown> = {};
    if (status) filters.dropshippingStatus = status;
    if (supplierId) filters.supplier = supplierId;

    // Filter by dates
    if (dateFrom || dateTo) {
      const dateFilter: Record<string, unknown> = {};
      if (dateFrom) dateFilter.$gte = new Date(dateFrom);
      if (dateTo) dateFilter.$lte = new Date(dateTo);
      filters.createdAt = dateFilter;
    }

    const skip = (page - 1) * limit;

    // Aggregation pipeline to join with complete information
    const pipeline: Array<Record<string, unknown>> = [
      { $match: filters },
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $lookup: {
          from: 'dropshippingsuppliers',
          localField: 'supplier',
          foreignField: '_id',
          as: 'supplierInfo'
        }
      },
      { $unwind: '$supplierInfo' },
      {
        $lookup: {
          from: 'orders',
          localField: 'order',
          foreignField: '_id',
          as: 'orderInfo'
        }
      },
      { $unwind: '$orderInfo' }
    ];

    // Filter by store for vendors
    if (session.user.role === 'vendor' || storeId) {
      const targetStoreId = storeId || (session.user as Record<string, unknown>)?.storeId;
      if (targetStoreId) {
        pipeline.push({
          $match: { 'productInfo.store': targetStoreId }
        });
      }
    }

    // Remove sensitive information
    pipeline.push({
      $addFields: {
        'supplierInfo.apiCredentials': '$$REMOVE'
      }
    });

    const [orders, totalCount] = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      DropshippingOrder.aggregate([
        ...pipeline,
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit }
      ] as any),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      DropshippingOrder.aggregate([
        ...pipeline,
        { $count: 'total' }
      ] as any)
    ]);

    const total = totalCount[0]?.total || 0;

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error retrieving dropshipping orders:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

// POST /api/dropshipping/orders - Create a dropshipping order
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const {
      orderId,
      orderItemId,
      productId,
      quantity,
      shippingAddress
    } = body;

    // Validation
    if (!orderId || !orderItemId || !productId || !quantity || !shippingAddress) {
      return NextResponse.json(
        { error: 'Missing data' },
        { status: 400 }
      );
    }

    // Check that the product is a dropshipping product
    const dropshippingProduct = await DropshippingProduct.findOne({ product: productId });
    if (!dropshippingProduct) {
      return NextResponse.json(
        { error: 'Dropshipping product not found' },
        { status: 404 }
      );
    }

    // Create the dropshipping order
    const dropshippingOrder = await dropshippingService.createDropshippingOrder(
      orderId,
      orderItemId,
      productId,
      quantity,
      shippingAddress
    );

    return NextResponse.json(dropshippingOrder, { status: 201 });
  } catch (error) {
    console.error('Error creating dropshipping order:', error);
    const errorMessage = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// PUT /api/dropshipping/orders - Update order status
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { orderIds, action, trackingData } = body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json(
        { error: 'Missing order IDs' },
        { status: 400 }
      );
    }

    const results = [];

    for (const orderId of orderIds) {
      try {
        let result;
        
        switch (action) {
          case 'send_to_supplier':
            result = await dropshippingService.sendOrderToSupplier(orderId);
            results.push({
              orderId,
              success: true,
              message: 'Order sent to supplier',
              data: result
            });
            break;
            
          case 'update_tracking':
            if (!trackingData) {
              throw new Error('Missing tracking data');
            }
            result = await dropshippingService.updateShippingStatus(orderId, trackingData);
            results.push({
              orderId,
              success: true,
              message: 'Shipping status updated'
            });
            break;
            
          case 'cancel':
            await DropshippingOrder.findByIdAndUpdate(orderId, {
              dropshippingStatus: 'cancelled',
              $push: {
                supplierCommunication: {
                  type: 'manual',
                  direction: 'sent',
                  message: 'Order cancelled',
                  status: 'sent'
                }
              }
            });
            results.push({
              orderId,
              success: true,
              message: 'Order cancelled'
            });
            break;
            
          default:
            throw new Error('Unknown action');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.push({
          orderId,
          success: false,
          error: errorMessage
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return NextResponse.json({
      message: `Action completed: ${successCount} successes, ${failureCount} failures`,
      results
    });
  } catch (error) {
    console.error('Error updating orders:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from "@/lib/mongodb";
import { DropshippingSupplier, DropshippingProduct, DropshippingOrder } from '@/models/DropshippingProduct';
import Product from "@/models/Product";
import User from "@/models/User";
import mongoose from "mongoose";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Get the connected user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if test data already exists
    const existingSuppliers = await DropshippingSupplier.find({ name: { $in: ['AliExpress Test', 'Oberlo Test'] } });
    if (existingSuppliers.length > 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Test data already exists' 
      });
    }

    // Create test suppliers
    const testSuppliers = [
      {
        name: 'AliExpress Test',
        slug: 'aliexpress-test',
        country: 'China',
        website: 'https://aliexpress.com',
        description: 'Test supplier for electronics and gadgets.',
        rating: 4.2,
        totalProducts: 1542,
        activeStores: 45,
        status: 'verified',
        commission: 8.5,
        shippingTime: '7-15 days',
        minOrder: 1,
        categories: ['Electronics', 'Gadgets', 'Accessories'],
        joinedDate: new Date('2023-06-15'),
        totalRevenue: 12450,
        compliance: {
          taxCompliant: true,
          certifications: ['ISO 9001'],
          lastAudit: new Date()
        },
        contactInfo: {
          email: 'contact@aliexpress-test.com',
          phone: '+86 123 456 7890',
          supportHours: '9h-18h',
          timezone: 'Asia/Shanghai'
        }
      },
      {
        name: 'Oberlo Test',
        slug: 'oberlo-test',
        country: 'Global',
        website: 'https://oberlo.com',
        description: 'Test supplier for fashion and beauty premium.',
        rating: 4.5,
        totalProducts: 893,
        activeStores: 32,
        status: 'verified',
        commission: 12.0,
        shippingTime: '5-12 days',
        minOrder: 1,
        categories: ['Fashion', 'Beauty', 'Accessories'],
        joinedDate: new Date('2023-08-20'),
        totalRevenue: 8930,
        compliance: {
          taxCompliant: true,
          certifications: ['Fair Trade'],
          lastAudit: new Date()
        },
        contactInfo: {
          email: 'contact@oberlo-test.com',
          phone: '+1 555 123 4567',
          supportHours: '8h-20h',
          timezone: 'UTC'
        }
      }
    ];

    const createdSuppliers = await DropshippingSupplier.insertMany(testSuppliers);

    // Create test products
    const testProducts = [
      {
        name: 'Wireless Bluetooth Headphones Test',
        description: 'High-quality bluetooth headphones with noise cancellation',
        price: 29.99,
        images: ['/api/placeholder/400/400'],
        category: 'Electronics',
        stock: 150,
        vendor: user._id
      },
      {
        name: 'Smart Sports Watch Test',
        description: 'Smart watch with fitness tracking and notifications',
        price: 79.99,
        images: ['/api/placeholder/400/400'],
        category: 'Electronics',
        stock: 89,
        vendor: user._id
      }
    ];

    const createdProducts = await Product.insertMany(testProducts);

    // Create test dropshipping products
    const testDropshippingProducts = [
      {
        product: createdProducts[0]._id,
        supplier: createdSuppliers[0]._id,
        supplierProductId: 'AE_TEST_001',
        supplierSku: 'AE-BT-001',
        supplierPrice: 12.50,
        supplierCurrency: 'EUR',
        minimumOrderQuantity: 1,
        supplierStock: 150,
        lastStockUpdate: new Date(),
        stockSyncEnabled: true,
        shippingTime: {
          min: 7,
          max: 15,
          unit: 'days'
        },
        shippingFrom: 'China',
        dropshippingStatus: 'active',
        profitMargin: 58.3,
        qualityScore: 4.2,
        supplierRating: 4.2,
        customerReviews: {
          averageRating: 4.1,
          totalReviews: 45,
          lastReviewDate: new Date()
        },
        importDate: new Date(),
        lastModified: new Date(),
        importedBy: user._id,
        analytics: {
          totalOrders: 45,
          totalRevenue: 1349.55,
          averageOrderValue: 29.99,
          conversionRate: 2.3,
          returnRate: 0.5,
          lastOrderDate: new Date()
        }
      },
      {
        product: createdProducts[1]._id,
        supplier: createdSuppliers[1]._id,
        supplierProductId: 'OB_TEST_001',
        supplierSku: 'OB-WATCH-001',
        supplierPrice: 35.00,
        supplierCurrency: 'EUR',
        minimumOrderQuantity: 1,
        supplierStock: 89,
        lastStockUpdate: new Date(),
        stockSyncEnabled: true,
        shippingTime: {
          min: 5,
          max: 12,
          unit: 'days'
        },
        shippingFrom: 'Global',
        dropshippingStatus: 'active',
        profitMargin: 56.3,
        qualityScore: 4.5,
        supplierRating: 4.5,
        customerReviews: {
          averageRating: 4.3,
          totalReviews: 23,
          lastReviewDate: new Date()
        },
        importDate: new Date(),
        lastModified: new Date(),
        importedBy: user._id,
        analytics: {
          totalOrders: 23,
          totalRevenue: 1839.77,
          averageOrderValue: 79.99,
          conversionRate: 1.8,
          returnRate: 0.3,
          lastOrderDate: new Date()
        }
      }
    ];

    const createdDropshippingProducts = await DropshippingProduct.insertMany(testDropshippingProducts);

    // Create test orders
    const testOrders = [
      {
        order: new mongoose.Types.ObjectId(),
        orderItem: new mongoose.Types.ObjectId(),
        product: createdProducts[0]._id,
        dropshippingProduct: createdDropshippingProducts[0]._id,
        supplier: createdSuppliers[0]._id,
        quantity: 2,
        supplierPrice: 12.50,
        sellingPrice: 29.99,
        profit: 34.98,
        dropshippingStatus: 'shipped',
        supplierOrderId: 'AE123456789CN',
        supplierOrderDate: new Date('2024-01-18'),
        shippingInfo: {
          carrier: 'AliExpress Standard Shipping',
          trackingNumber: 'AE123456789CN',
          trackingUrl: 'https://tracking.aliexpress.com/AE123456789CN',
          shippedDate: new Date('2024-01-19'),
          estimatedDelivery: new Date('2024-02-02')
        },
        shippingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          address1: '123 Peace Street',
          city: 'Paris',
          province: 'Île-de-France',
          country: 'France',
          zip: '75001',
          phone: '+33 1 23 45 67 89'
        },
        supplierCommunication: [],
        errors: []
      },
      {
        order: new mongoose.Types.ObjectId(),
        orderItem: new mongoose.Types.ObjectId(),
        product: createdProducts[1]._id,
        dropshippingProduct: createdDropshippingProducts[1]._id,
        supplier: createdSuppliers[1]._id,
        quantity: 1,
        supplierPrice: 35.00,
        sellingPrice: 79.99,
        profit: 44.99,
        dropshippingStatus: 'delivered',
        supplierOrderId: 'OB987654321US',
        supplierOrderDate: new Date('2024-01-15'),
        shippingInfo: {
          carrier: 'Oberlo Express',
          trackingNumber: 'OB987654321US',
          trackingUrl: 'https://tracking.oberlo.com/OB987654321US',
          shippedDate: new Date('2024-01-16'),
          estimatedDelivery: new Date('2024-01-25'),
          actualDelivery: new Date('2024-01-23')
        },
        shippingAddress: {
          firstName: 'Mary',
          lastName: 'Martin',
          address1: '456 Champs Avenue',
          city: 'Lyon',
          province: 'Auvergne-Rhône-Alpes',
          country: 'France',
          zip: '69001',
          phone: '+33 4 56 78 90 12'
        },
        supplierCommunication: [],
        errors: []
      }
    ];

    await DropshippingOrder.insertMany(testOrders);

    return NextResponse.json({
      success: true,
      message: 'Test dropshipping data created successfully',
      data: {
        suppliers: createdSuppliers.length,
        products: createdProducts.length,
        dropshippingProducts: createdDropshippingProducts.length,
        orders: testOrders.length
      }
    });

  } catch (error) {
    console.error('Error initializing test dropshipping data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Get the connected user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete test data
    const deletedSuppliers = await DropshippingSupplier.deleteMany({ 
      name: { $in: ['AliExpress Test', 'Oberlo Test'] } 
    });

    const deletedProducts = await Product.deleteMany({ 
      name: { $in: ['Wireless Bluetooth Headphones Test', 'Smart Sports Watch Test'] } 
    });

    const deletedDropshippingProducts = await DropshippingProduct.deleteMany({ 
      supplierProductId: { $in: ['AE_TEST_001', 'OB_TEST_001'] } 
    });

    const deletedOrders = await DropshippingOrder.deleteMany({ 
      supplierOrderId: { $in: ['AE123456789CN', 'OB987654321US'] } 
    });

    return NextResponse.json({
      success: true,
      message: 'Test data deleted successfully',
      data: {
        suppliers: deletedSuppliers.deletedCount,
        products: deletedProducts.deletedCount,
        dropshippingProducts: deletedDropshippingProducts.deletedCount,
        orders: deletedOrders.deletedCount
      }
    });

  } catch (error) {
    console.error('Error deleting test dropshipping data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
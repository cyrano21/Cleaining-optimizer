import { DropshippingSupplier, DropshippingProduct, DropshippingOrder } from '@/models/DropshippingProduct';
import Product from '@/models/Product';

export interface SupplierApiConfig {
  apiKey: string;
  apiSecret?: string;
  endpoint: string;
  authType: 'api_key' | 'oauth' | 'basic_auth';
  rateLimit?: {
    requests: number;
    period: number; // in seconds
  };
}

export interface ProductImportData {
  supplierProductId: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  sku: string;
  stock: number;
  category: string;
  attributes?: { [key: string]: unknown };
  variants?: Array<{
    id: string;
    sku: string;
    price: number;
    stock: number;
    attributes: { [key: string]: unknown };
  }>;
}

export interface OrderSyncData {
  supplierOrderId: string;
  status: string;
  trackingNumber?: string;
  carrier?: string;
  shippedDate?: Date;
  estimatedDelivery?: Date;
}

class DropshippingService {
  /**
   * Connect to a supplier and store credentials
   */
  async connectSupplier(supplierData: SupplierApiConfig) {
    try {
      // Check if supplier exists
      const existingSupplier = await DropshippingSupplier.findOne({
        name: supplierData.endpoint
      });

      if (existingSupplier) {
        throw new Error('Supplier already connected');
      }

      // Create new supplier
      const supplier = new DropshippingSupplier({
        name: supplierData.endpoint,
        slug: this.generateSlug(supplierData.endpoint),
        country: 'Unknown',
        description: `Connected supplier: ${supplierData.endpoint}`,
        apiCredentials: {
          apiKey: supplierData.apiKey,
          apiSecret: supplierData.apiSecret,
          endpoint: supplierData.endpoint,
          authType: supplierData.authType
        },
        contactInfo: {
          email: 'api@supplier.com'
        }
      });

      await supplier.save();
      return supplier;
    } catch (error) {
      console.error('Error during supplier connection:', error);
      throw error;
    }
  }

  /**
   * Import products from supplier
   */
  async importProductsFromSupplier(
    supplierId: string, 
    products: ProductImportData[], 
    storeId: string,
    userId: string,
    options: {
      profitMargin: number;
      autoSync: {
        price: boolean;
        stock: boolean;
        description: boolean;
        images: boolean;
      };
    }
  ) {
    try {
      const supplier = await DropshippingSupplier.findById(supplierId);
      if (!supplier) {
        throw new Error('Supplier not found');
      }

      const importedProducts = [];

      for (const productData of products) {
        // Create main product
        const product = new Product({
          name: productData.title,
          description: productData.description,
          price: this.calculateSellingPrice(productData.price, options.profitMargin),
          images: productData.images,
          category: productData.category,
          stock: productData.stock,
          vendor: userId,
          store: storeId,
          sku: productData.sku
        });

        await product.save();

        // Create dropshipping product
        const dropshippingProduct = new DropshippingProduct({
          product: product._id,
          supplier: supplier._id,
          supplierProductId: productData.supplierProductId,
          supplierSku: productData.sku,
          supplierPrice: productData.price,
          supplierStock: productData.stock,
          shippingTime: { min: 7, max: 15, unit: 'days' },
          shippingFrom: 'Global',
          dropshippingStatus: 'active',
          profitMargin: options.profitMargin,
          autoSync: options.autoSync,
          importedBy: userId
        });

        // Handle variants if they exist
        if (productData.variants && productData.variants.length > 0) {
          dropshippingProduct.variantMapping = productData.variants.map(variant => ({
            localVariantId: variant.id,
            supplierVariantId: variant.id,
            supplierSku: variant.sku,
            supplierPrice: variant.price,
            supplierStock: variant.stock
          }));
        }

        await dropshippingProduct.save();
        importedProducts.push(dropshippingProduct);
      }

      // Update supplier statistics
      await DropshippingSupplier.findByIdAndUpdate(supplierId, {
        $inc: { totalProducts: products.length }
      });

      return importedProducts;
    } catch (error) {
      console.error('Error importing products from supplier:', error);
      throw error;
    }
  }

  /**
   * Sync product data with supplier
   */
  async syncProductData(productId: string, supplierData: Partial<ProductImportData>) {
    try {
      const dropshippingProduct = await DropshippingProduct.findOne({
        product: productId
      }).populate('supplier');

      if (!dropshippingProduct) {
        throw new Error('Dropshipping product not found');
      }

      const updateData: Record<string, unknown> = {};
      const syncChanges: Record<string, unknown> = {};

      // Sync price if enabled
      if (dropshippingProduct.autoSync.price && supplierData.price !== undefined) {
        updateData.supplierPrice = supplierData.price;
        syncChanges.price = supplierData.price;
      }

      // Sync stock if enabled
      if (dropshippingProduct.autoSync.stock && supplierData.stock !== undefined) {
        updateData.supplierStock = supplierData.stock;
        syncChanges.stock = supplierData.stock;
      }

      // Sync description if enabled
      if (dropshippingProduct.autoSync.description && supplierData.description) {
        updateData.description = supplierData.description;
        syncChanges.description = supplierData.description;
      }

      // Update the dropshipping product
      if (Object.keys(updateData).length > 0) {
        await DropshippingProduct.findByIdAndUpdate(
          dropshippingProduct._id,
          {
            ...updateData,
            lastStockUpdate: new Date(),
            $push: {
              syncHistory: {
                date: new Date(),
                type: 'full',
                status: 'success',
                changes: syncChanges
              }
            }
          }
        );
      }

      return { success: true, changes: syncChanges };
    } catch (error) {
      console.error('Error during product synchronization:', error);
      
      // Save the error
      await DropshippingProduct.findOneAndUpdate(
        { product: productId },
        {
          $push: {
            syncHistory: {
              date: new Date(),
              type: 'full',
              status: 'failed',
              error: error instanceof Error ? error.message : 'Unknown error'
            }
          }
        }
      );
      
      throw error;
    }
  }

  /**
   * Create a dropshipping order
   */
  async createDropshippingOrder(
    orderId: string,
    orderItemId: string,
    productId: string,
    quantity: number,
    shippingAddress: Record<string, unknown>
  ) {
    try {
      const dropshippingProduct = await DropshippingProduct.findOne({
        product: productId
      }).populate('supplier');
      
      if (!dropshippingProduct) {
        throw new Error('Dropshipping product not found');
      }

      const product = await Product.findById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      const profit = (product.price - dropshippingProduct.supplierPrice) * quantity;
      
      const dropshippingOrder = new DropshippingOrder({
        order: orderId,
        orderItem: orderItemId,
        product: productId,
        dropshippingProduct: dropshippingProduct._id,
        supplier: dropshippingProduct.supplier._id,
        quantity,
        supplierPrice: dropshippingProduct.supplierPrice,
        sellingPrice: product.price,
        profit,
        shippingAddress,
        dropshippingStatus: 'pending'
      });
      
      await dropshippingOrder.save();
      
      // Update analytics
      await DropshippingProduct.findByIdAndUpdate(
        dropshippingProduct._id,
        {
          $inc: {
            'analytics.totalOrders': 1,
            'analytics.totalRevenue': profit
          },
          'analytics.lastOrderDate': new Date()
        }
      );
      
      return dropshippingOrder;
    } catch (error) {
      console.error('Error creating dropshipping order:', error);
      throw error;
    }
  }

  /**
   * Send order to supplier
   */
  async sendOrderToSupplier(dropshippingOrderId: string) {
    try {
      const dropshippingOrder = await DropshippingOrder.findById(dropshippingOrderId)
        .populate('supplier')
        .populate('product')
        .populate('dropshippingProduct');
      
      if (!dropshippingOrder) {
        throw new Error('Dropshipping order not found');
      }

      // Simulate sending to supplier API
      const supplierOrderData = {
        productId: dropshippingOrder.dropshippingProduct.supplierProductId,
        quantity: dropshippingOrder.quantity,
        shippingAddress: dropshippingOrder.shippingAddress,
        orderReference: dropshippingOrder._id
      };
      
      // Here you would integrate with the real supplier API
      const supplierResponse = await this.callSupplierAPI();
      
      // Update order with supplier response
      await DropshippingOrder.findByIdAndUpdate(dropshippingOrderId, {
        supplierOrderId: supplierResponse.orderId,
        supplierOrderDate: new Date(),
        dropshippingStatus: 'sent_to_supplier',
        $push: {
          supplierCommunication: {
            type: 'api',
            direction: 'sent',
            message: `Order sent: ${JSON.stringify(supplierOrderData)}`,
            status: 'delivered',
            response: JSON.stringify(supplierResponse)
          }
        }
      });
      
      return supplierResponse;
    } catch (error) {
      console.error('Error sending to supplier:', error);
      
      // Save the error
      await DropshippingOrder.findByIdAndUpdate(dropshippingOrderId, {
        $push: {
          errors: {
            type: 'api',
            message: error instanceof Error ? error.message : 'Unknown error',
            resolved: false
          }
        }
      });
      
      throw error;
    }
  }

  /**
   * Update shipping status
   */
  async updateShippingStatus(dropshippingOrderId: string, trackingData: OrderSyncData) {
    try {
      const updateData: Record<string, unknown> = {
        dropshippingStatus: this.mapSupplierStatusToLocal(trackingData.status)
      };
      
      if (trackingData.trackingNumber) {
        updateData['shippingInfo.trackingNumber'] = trackingData.trackingNumber;
        updateData['shippingInfo.carrier'] = trackingData.carrier;
        updateData['shippingInfo.shippedDate'] = trackingData.shippedDate;
        updateData['shippingInfo.estimatedDelivery'] = trackingData.estimatedDelivery;
      }
      
      await DropshippingOrder.findByIdAndUpdate(dropshippingOrderId, updateData);
      
      return { success: true };
    } catch (error) {
      console.error('Error updating status:', error);
      throw error;
    }
  }

  /**
   * Get dropshipping statistics
   */
  async getDropshippingStats(storeId?: string, supplierId?: string) {
    try {
      const matchConditions: Record<string, unknown> = {};
      
      if (storeId) {
        // Filter by store via products
        const storeProducts = await Product.find({ store: storeId }).select('_id');
        const productIds = storeProducts.map(p => p._id);
        matchConditions.product = { $in: productIds };
      }
      
      if (supplierId) {
        matchConditions.supplier = supplierId;
      }
      
      const stats = await DropshippingProduct.aggregate([
        { $match: matchConditions },
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            activeProducts: {
              $sum: { $cond: [{ $eq: ['$dropshippingStatus', 'active'] }, 1, 0] }
            },
            totalRevenue: { $sum: '$analytics.totalRevenue' },
            totalOrders: { $sum: '$analytics.totalOrders' },
            averageMargin: { $avg: '$profitMargin' }
          }
        }
      ]);

      return stats[0] || {
        totalProducts: 0,
        activeProducts: 0,
        totalRevenue: 0,
        totalOrders: 0,
        averageMargin: 0
      };
    } catch (error) {
      console.error('Error calculating statistics:', error);
      throw error;
    }
  }

  // Private utility methods
  private generateSlug(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  private calculateSellingPrice(supplierPrice: number, profitMargin: number): number {
    return supplierPrice * (1 + profitMargin / 100);
  }

  private mapSupplierStatusToLocal(supplierStatus: string): string {
    const statusMap: Record<string, string> = {
      'pending': 'pending',
      'processing': 'processing',
      'shipped': 'shipped',
      'delivered': 'delivered',
      'cancelled': 'cancelled'
    };
    return statusMap[supplierStatus] || 'pending';
  }

  private async callSupplierAPI(): Promise<Record<string, unknown>> {
    // Replace with real implementation
    // This is a mock implementation
    return {
      orderId: `ORDER_${Date.now()}`,
      status: 'success'
    };
  }
}

export const dropshippingService = new DropshippingService();
export default dropshippingService;
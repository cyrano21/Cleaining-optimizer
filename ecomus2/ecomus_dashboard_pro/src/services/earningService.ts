import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect';
import Earning from '@/models/Earning';
import Seller from '@/models/Seller';
import Order from '@/models/Order';
import Product from '@/models/Product';

export interface EarningsSummary {
  totalEarnings: number;
  commission: number;
  monthlyEarnings: number;
  quarterlyEarnings: number;
  yearlyEarnings: number;
  earningsByMonth: Array<{ month: string; earnings: number }>;
  topProducts: Array<{ name: string; earnings: number }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    total: number;
    commission: number;
    status: string;
    createdAt: Date;
  }>;
  stats: {
    totalOrders: number;
    completedOrders: number;
    averageOrderValue: number;
  };
}

export class EarningService {
  /**
   * Créer un earning à partir d'une commande
   */
  static async createEarningFromOrder(orderId: string, sellerId: string): Promise<void> {
    await dbConnect();
    
    const order = await Order.findById(orderId).populate('items.productId');
    const seller = await Seller.findById(sellerId);
    
    if (!order || !seller) {
      throw new Error('Order or Seller not found');
    }

    const now = new Date();
    const period = {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      quarter: Math.ceil((now.getMonth() + 1) / 3)
    };

    // Créer un earning pour chaque produit du vendeur dans la commande
    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      
      if (product && product.vendor.toString() === sellerId) {
        const commissionAmount = (item.price * item.quantity * seller.commission) / 100;
        
        await Earning.create({
          seller: sellerId,
          order: orderId,
          product: item.productId,
          orderNumber: order.orderNumber,
          productName: item.title,
          quantity: item.quantity,
          unitPrice: item.price,
          totalAmount: item.price * item.quantity,
          commissionRate: seller.commission,
          commissionAmount,
          status: order.status === 'delivered' ? 'approved' : 'pending',
          period
        });
      }
    }
  }

  /**
   * Récupérer les données d'earnings d'un vendeur
   */
  static async getSellerEarnings(sellerId: string, period: string = '30', includeTest: boolean = true): Promise<EarningsSummary> {
    await dbConnect();
    
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      throw new Error('Seller not found');
    }

    const now = new Date();
    let startDate: Date;

    switch (period) {
      case '7':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '365':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Construire la requête de base
    const baseQuery: any = {
      seller: sellerId,
      createdAt: { $gte: startDate }
    };

    // Si on ne veut pas inclure les données de test, filtrer
    if (!includeTest) {
      baseQuery.orderNumber = { $not: /^TEST-/ };
    }

    // Récupérer tous les earnings du vendeur
    const earnings = await Earning.find(baseQuery).populate('order').sort({ createdAt: -1 });

    // Calculer les totaux
    const totalEarnings = earnings.reduce((sum, earning) => sum + earning.commissionAmount, 0);
    
    // Calculer les earnings par période
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const last3Months = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    const lastYear = new Date(now.getFullYear() - 1, 0, 1);

    const monthlyEarnings = earnings
      .filter(earning => earning.createdAt >= lastMonth)
      .reduce((sum, earning) => sum + earning.commissionAmount, 0);

    const quarterlyEarnings = earnings
      .filter(earning => earning.createdAt >= last3Months)
      .reduce((sum, earning) => sum + earning.commissionAmount, 0);

    const yearlyEarnings = earnings
      .filter(earning => earning.createdAt >= lastYear)
      .reduce((sum, earning) => sum + earning.commissionAmount, 0);

    // Données pour les graphiques (12 derniers mois)
    const earningsByMonth = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthEarnings = earnings
        .filter(earning => {
          return earning.createdAt >= monthStart && earning.createdAt <= monthEnd;
        })
        .reduce((sum, earning) => sum + earning.commissionAmount, 0);

      earningsByMonth.push({
        month: monthStart.toLocaleDateString('fr-FR', { month: 'short' }),
        earnings: monthEarnings
      });
    }

    // Top produits par earnings
    const productEarnings: Record<string, number> = {};
    earnings.forEach(earning => {
      if (!productEarnings[earning.productName]) {
        productEarnings[earning.productName] = 0;
      }
      productEarnings[earning.productName] += earning.commissionAmount;
    });

    const topProducts = Object.entries(productEarnings)
      .map(([name, earnings]) => ({ name, earnings }))
      .sort((a, b) => b.earnings - a.earnings)
      .slice(0, 5);

    // Commandes récentes
    const recentOrders = earnings
      .slice(0, 10)
      .map(earning => ({
        id: earning.order ? earning.order.toString() : earning._id.toString(),
        orderNumber: earning.orderNumber,
        total: earning.totalAmount,
        commission: earning.commissionAmount,
        status: earning.status,
        createdAt: earning.createdAt
      }));

    // Statistiques
    const uniqueOrders = [...new Set(earnings.map(e => e.order ? e.order.toString() : e._id.toString()))];
    const completedOrders = earnings.filter(e => e.status === 'approved' || e.status === 'paid').length;
    const averageOrderValue = uniqueOrders.length > 0 
      ? earnings.reduce((sum, e) => sum + e.totalAmount, 0) / uniqueOrders.length 
      : 0;

    return {
      totalEarnings: seller.totalEarnings,
      commission: seller.commission,
      monthlyEarnings,
      quarterlyEarnings,
      yearlyEarnings,
      earningsByMonth,
      topProducts,
      recentOrders,
      stats: {
        totalOrders: uniqueOrders.length,
        completedOrders,
        averageOrderValue
      }
    };
  }

  /**
   * Mettre à jour le total des earnings d'un vendeur
   */
  static async updateSellerTotalEarnings(sellerId: string): Promise<void> {
    await dbConnect();
    
    const totalEarnings = await Earning.aggregate([
      { $match: { seller: new mongoose.Types.ObjectId(sellerId) } },
      { $group: { _id: null, total: { $sum: '$commissionAmount' } } }
    ]);

    const total = totalEarnings.length > 0 ? totalEarnings[0].total : 0;
    
    await Seller.findByIdAndUpdate(sellerId, { totalEarnings: total });
  }

  /**
   * Générer des données de test pour un vendeur
   */
  static async generateTestData(sellerId: string): Promise<void> {
    try {
      console.log('Connecting to database...');
      await dbConnect();
      console.log('Database connected successfully');
      
      const seller = await Seller.findById(sellerId);
      if (!seller) {
        throw new Error(`Seller with ID ${sellerId} not found`);
      }
      console.log('Seller found:', seller.businessName);

      const now = new Date();
      const testData = [];

      // Générer des données pour les 12 derniers mois
      for (let i = 11; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        
        // Générer 5-15 earnings par mois
        const earningsCount = Math.floor(Math.random() * 10) + 5;
        
        for (let j = 0; j < earningsCount; j++) {
          const randomDate = new Date(
            monthStart.getTime() + Math.random() * (monthEnd.getTime() - monthStart.getTime())
          );
          
          const totalAmount = Math.floor(Math.random() * 500) + 50;
          const commissionAmount = (totalAmount * seller.commission) / 100;
          
          // Générer des ObjectId valides
          const orderId = new mongoose.Types.ObjectId();
          const productId = new mongoose.Types.ObjectId();
          
          testData.push({
            seller: sellerId,
            order: orderId,
            product: productId,
            orderNumber: `TEST-${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}-${String(j + 1).padStart(3, '0')}`,
            productName: `Produit Test ${j + 1}`,
            quantity: Math.floor(Math.random() * 3) + 1,
            unitPrice: totalAmount / (Math.floor(Math.random() * 3) + 1),
            totalAmount,
            commissionRate: seller.commission,
            commissionAmount,
            status: Math.random() > 0.3 ? 'approved' : 'pending',
            period: {
              year: randomDate.getFullYear(),
              month: randomDate.getMonth() + 1,
              quarter: Math.ceil((randomDate.getMonth() + 1) / 3)
            },
            createdAt: randomDate,
            updatedAt: randomDate
          });
        }
      }

      console.log(`Generated ${testData.length} test earnings records`);
      
      if (testData.length > 0) {
        console.log('Inserting test data into database...');
        await Earning.insertMany(testData);
        console.log('Test data inserted successfully');
      }

      console.log('Updating seller total earnings...');
      await this.updateSellerTotalEarnings(sellerId);
      console.log('Seller total earnings updated successfully');
      
    } catch (error) {
      console.error('Error in generateTestData:', error);
      throw new Error(`Failed to generate test data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
} 
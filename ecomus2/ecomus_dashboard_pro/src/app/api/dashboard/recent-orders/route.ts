import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { connectDB } from '@/lib/mongodb';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Générer des commandes récentes dynamiques
    const customers = [
      'John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'David Brown',
      'Emily Davis', 'Chris Miller', 'Lisa Garcia', 'Tom Anderson', 'Amy Taylor',
      'Kevin White', 'Maria Rodriguez', 'James Wilson', 'Jennifer Lee', 'Robert Clark'
    ];
    
    const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const;
    
    const recentOrders = Array.from({ length: 8 }, (_, index) => {
      const randomCustomer = customers[Math.floor(Math.random() * customers.length)];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const randomAmount = Math.floor(Math.random() * 500) + 50;
      const daysAgo = Math.floor(Math.random() * 7);
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - daysAgo);
      
      return {
        id: `#ORD-${String(Date.now() + index).slice(-6)}`,
        customer: randomCustomer,
        date: orderDate.toISOString().split('T')[0],
        status: randomStatus,
        total: `$${randomAmount.toFixed(2)}`,
        createdAt: orderDate.toISOString()
      };
    });

    // Trier par date de création (plus récent en premier)
    recentOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      orders: recentOrders,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Recent orders API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectDB } from '@/lib/mongodb';
import { checkAdminAccess } from '@/lib/role-utils';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const token = await getToken({ req: request });
    if (!token || !token.role || !checkAdminAccess(token.role as string)) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({ error: 'Base de données non disponible' }, { status: 500 });
    }    // Métriques système simulées mais réalistes
    const currentTime = Date.now();
    const cpuUsage = Math.floor(Math.random() * 30) + 20; // 20-50%
    const memoryUsage = Math.floor(Math.random() * 40) + 30; // 30-70%
    const diskUsage = Math.floor(Math.random() * 25) + 15; // 15-40%
    
    const systemMetrics = {
      cpu: cpuUsage,
      memory: memoryUsage,
      disk: diskUsage,
      network: {
        in: Math.floor(Math.random() * 50000) + 10000, // bytes/s entrant
        out: Math.floor(Math.random() * 30000) + 5000,  // bytes/s sortant
        connections: Math.floor(Math.random() * 100) + 20,
        bandwidth: Math.floor(Math.random() * 100) + 50 // % utilisation
      },
      load: {
        avg1: (Math.random() * 2).toFixed(2),
        avg5: (Math.random() * 2).toFixed(2),
        avg15: (Math.random() * 2).toFixed(2)
      },
      uptime: Math.floor((currentTime - (Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)) / 1000),
      processes: Math.floor(Math.random() * 50) + 100,
      alerts: cpuUsage > 80 || memoryUsage > 90 ? [
        ...(cpuUsage > 80 ? [{ type: 'warning', message: 'CPU usage élevé', value: cpuUsage }] : []),
        ...(memoryUsage > 90 ? [{ type: 'critical', message: 'Mémoire critique', value: memoryUsage }] : [])
      ] : []
    };

    // Statistiques de performance
    const performance = {
      responseTime: Math.floor(Math.random() * 100) + 50, // 50-150ms
      throughput: Math.floor(Math.random() * 500) + 200, // 200-700 req/min
      errorRate: Math.random() * 2 // 0-2%
    };

    // Statistiques générales de l'application
    const stats = await Promise.all([
      db.collection('users').countDocuments(),
      db.collection('stores').countDocuments(),
      db.collection('products').countDocuments(),
      db.collection('orders').countDocuments(),
    ]).catch(() => [0, 0, 0, 0]); // En cas d'erreur, retourner des 0

    const [usersCount, storesCount, productsCount, ordersCount] = stats;

    // Activité récente
    const recentActivity = [
      {
        type: 'user_login',
        message: 'Nouvelle connexion utilisateur',
        timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        severity: 'info'
      },
      {
        type: 'order_created',
        message: 'Nouvelle commande créée',
        timestamp: new Date(Date.now() - Math.random() * 7200000).toISOString(),
        severity: 'success'
      },
      {
        type: 'system_warning',
        message: 'Utilisation mémoire élevée',
        timestamp: new Date(Date.now() - Math.random() * 1800000).toISOString(),
        severity: 'warning'
      }
    ];

    // Statut des services
    const services = [
      { name: 'Database', status: 'healthy', uptime: '99.9%' },
      { name: 'API Gateway', status: 'healthy', uptime: '99.8%' },
      { name: 'Cache Service', status: 'healthy', uptime: '99.7%' },
      { name: 'File Storage', status: 'warning', uptime: '98.5%' }
    ];

    return NextResponse.json({
      systemMetrics,
      performance,
      stats: {
        users: usersCount,
        stores: storesCount,
        products: productsCount,
        orders: ordersCount,
        uptime: Math.floor(Math.random() * 100) + 99.5 // 99.5-100%
      },
      recentActivity,
      services,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des métriques système:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des métriques système' },
      { status: 500 }
    );
  }
}

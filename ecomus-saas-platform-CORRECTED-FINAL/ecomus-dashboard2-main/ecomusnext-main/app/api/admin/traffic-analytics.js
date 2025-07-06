
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import dbConnect from '../../../utils/dbConnect';
import AdminActivityLog from '../../../models/AdminActivityLog';

export default async function handler(req, res) {
  try {
    // Vérification d'authentification
    const session = await getServerSession(req, res, authOptions);
    
    console.log('[API traffic-analytics] Session:', session ? 'Existe' : 'N\'existe pas');
    console.log('[API traffic-analytics] Role utilisateur:', session?.user?.role || 'Non défini');

    // Vérification que l'utilisateur est connecté
    if (!session) {
      return res.status(401).json({ success: false, message: 'Non authentifié' });
    }

    // Vérification que l'utilisateur est un administrateur
    if (session.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Accès non autorisé' });
    }

    if (req.method !== 'GET') {
      return res.status(405).json({ success: false, message: `Méthode ${req.method} non autorisée` });
    }
  } catch (error) {
    console.error('[API traffic-analytics] Erreur d\'authentification:', error);
    return res.status(500).json({ success: false, message: 'Erreur lors de la vérification de l\'authentification' });
  }

  try {
    await dbConnect();

    // Récupérer les paramètres de filtrage
    const { startDate, endDate, source } = req.query;

    // Préparer les filtres pour la requête MongoDB
    const filter = {};
    
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (source && source !== 'all') {
      filter.source = source;
    }

    // Note: Ce code est un exemple. Dans une application réelle, vous auriez besoin
    // de créer un modèle spécifique pour le trafic ou d'utiliser un service d'analyse
    // comme Google Analytics, Matomo, etc.
    
    // Pour cet exemple, nous utilisons AdminActivityLog pour simuler les données de trafic
    const logs = await AdminActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(1000);

    // Simuler des données d'analyse de trafic
    const overview = {
      totalVisits: Math.floor(Math.random() * 10000) + 5000,
      uniqueVisitors: Math.floor(Math.random() * 5000) + 2000,
      pageViews: Math.floor(Math.random() * 30000) + 10000,
      bounceRate: parseFloat((Math.random() * 30 + 30).toFixed(1)),
      avgSessionDuration: `${Math.floor(Math.random() * 3) + 1}m ${Math.floor(Math.random() * 60)}s`,
      conversionRate: parseFloat((Math.random() * 5 + 1).toFixed(1))
    };

    // Sources de trafic simulées
    const sources = [
      { name: 'Direct', value: Math.floor(Math.random() * 40 + 20) },
      { name: 'Organic Search', value: Math.floor(Math.random() * 30 + 10) },
      { name: 'Social Media', value: Math.floor(Math.random() * 20 + 5) },
      { name: 'Referral', value: Math.floor(Math.random() * 15 + 5) },
      { name: 'Email', value: Math.floor(Math.random() * 10 + 5) }
    ];

    // Normaliser les pourcentages pour qu'ils totalisent 100%
    const totalSourceValue = sources.reduce((sum, src) => sum + src.value, 0);
    sources.forEach(src => {
      src.value = parseFloat(((src.value / totalSourceValue) * 100).toFixed(1));
    });

    // Données de tendances simulées
    const today = new Date();
    const trends = {
      dates: [],
      visits: [],
      pageViews: []
    };

    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      
      trends.dates.push(date.toISOString().split('T')[0]);
      trends.visits.push(Math.floor(Math.random() * 500 + 100));
      trends.pageViews.push(Math.floor(Math.random() * 1500 + 300));
    }

    // Simuler les pages les plus visitées
    const topPages = [
      { path: '/', title: 'Accueil', views: Math.floor(Math.random() * 3000 + 2000), avgTime: `${Math.floor(Math.random() * 2) + 1}m ${Math.floor(Math.random() * 60)}s` },
      { path: '/shop', title: 'Boutique', views: Math.floor(Math.random() * 2000 + 1000), avgTime: `${Math.floor(Math.random() * 3) + 1}m ${Math.floor(Math.random() * 60)}s` },
      { path: '/shop/mens-sneaker', title: 'Chaussures Homme', views: Math.floor(Math.random() * 1500 + 500), avgTime: `${Math.floor(Math.random() * 4) + 1}m ${Math.floor(Math.random() * 60)}s` },
      { path: '/blog', title: 'Blog', views: Math.floor(Math.random() * 1000 + 500), avgTime: `${Math.floor(Math.random() * 2) + 1}m ${Math.floor(Math.random() * 60)}s` },
      { path: '/about', title: 'À propos', views: Math.floor(Math.random() * 800 + 400), avgTime: `${Math.floor(Math.random() * 1) + 1}m ${Math.floor(Math.random() * 60)}s` }
    ];

    // Statistiques des appareils
    const deviceStats = [
      { type: 'Mobile', percentage: Math.floor(Math.random() * 30 + 40) },
      { type: 'Desktop', percentage: Math.floor(Math.random() * 20 + 30) },
      { type: 'Tablet', percentage: Math.floor(Math.random() * 10 + 5) }
    ];

    // Normaliser les pourcentages pour qu'ils totalisent 100%
    const totalDevicePercentage = deviceStats.reduce((sum, dev) => sum + dev.percentage, 0);
    deviceStats.forEach(dev => {
      dev.percentage = Math.round((dev.percentage / totalDevicePercentage) * 100);
    });

    // Données géographiques simulées
    const geoData = [
      { country: 'France', visits: Math.floor(Math.random() * 5000 + 3000) },
      { country: 'États-Unis', visits: Math.floor(Math.random() * 2000 + 1000) },
      { country: 'Allemagne', visits: Math.floor(Math.random() * 1500 + 500) },
      { country: 'Royaume-Uni', visits: Math.floor(Math.random() * 1000 + 500) },
      { country: 'Canada', visits: Math.floor(Math.random() * 800 + 200) }
    ];

    res.status(200).json({
      success: true,
      data: {
        overview,
        sources,
        trends,
        topPages,
        deviceStats,
        geoData,
        recent: logs.map(log => ({
          id: log._id,
          action: log.action,
          target: log.target,
          timestamp: log.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des données de trafic:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
}

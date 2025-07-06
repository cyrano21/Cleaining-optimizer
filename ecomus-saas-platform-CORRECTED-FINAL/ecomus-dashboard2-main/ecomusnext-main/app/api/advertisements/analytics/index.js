import Advertisement from '../../../../models/Advertisement';
import dbConnect from '../../../../utils/dbConnect';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';

export default async function handler(req, res) {
  const { method } = req;

  if (method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: `La méthode ${method} n'est pas autorisée.`
    });
  }

  try {
    // Vérifier l'authentification et les autorisations admin
    const session = await getServerSession(req, res, authOptions);

    if (!session || session.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé. Accès administrateur requis.'
      });
    }

    // Extraire tous les paramètres de filtrage/tri
    const { 
      startDate, 
      endDate, 
      types = [], 
      positions = [], 
      status,
      targetAudience = [],
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      limit = '10',
      groupBy = 'daily'
    } = req.query;

    console.log("Paramètres reçus:", { startDate, endDate, types, positions, status, targetAudience, sortBy, sortOrder, limit, groupBy });

    // Connecter à la base de données
    await dbConnect();

    // Construire le filtre
    const query = {};

    // Filtrer par dates
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999);
        query.createdAt.$lte = endDateObj;
      }
    }

    // Filtrer par type
    if (types.length > 0 && !types.includes('all')) {
      query.type = { $in: Array.isArray(types) ? types : [types] };
    }

    // Filtrer par position
    if (positions.length > 0 && !positions.includes('all')) {
      query.position = { $in: Array.isArray(positions) ? positions : [positions] };
    }

    // Filtrer par statut
    if (status && status !== 'all') {
      query.status = status;
    }

    // Filtrer par audience cible
    if (targetAudience && targetAudience.length > 0) {
      query['targetAudience.interests'] = { $in: Array.isArray(targetAudience) ? targetAudience : [targetAudience] };
    }

    // ============================
    // 1. Aperçu général
    // ============================
    const totalStats = await Advertisement.aggregate([
      { $match: query },
      { $group: {
          _id: null,
          totalImpressions: { $sum: '$analytics.impressions' },
          totalClicks: { $sum: '$analytics.clicks' },
          totalConversions: { $sum: '$analytics.conversions' },
          totalAds: { $sum: 1 },
          totalSpent: { $sum: '$budget.spent' },
          totalBudget: { $sum: '$budget.total' }
      }}
    ]);

    const overview = totalStats.length > 0 ? {
      totalImpressions: totalStats[0].totalImpressions || 0,
      totalClicks: totalStats[0].totalClicks || 0,
      totalConversions: totalStats[0].totalConversions || 0,
      totalAds: totalStats[0].totalAds || 0,
      totalSpent: totalStats[0].totalSpent || 0,
      totalBudget: totalStats[0].totalBudget || 0,
      averageCTR: totalStats[0].totalImpressions > 0 
        ? (totalStats[0].totalClicks / totalStats[0].totalImpressions * 100).toFixed(2) 
        : 0,
      averageCPC: totalStats[0].totalClicks > 0 && totalStats[0].totalSpent
        ? (totalStats[0].totalSpent / totalStats[0].totalClicks).toFixed(2)
        : 0,
      budgetUtilization: totalStats[0].totalBudget > 0
        ? (totalStats[0].totalSpent / totalStats[0].totalBudget * 100).toFixed(2)
        : 0
    } : {
      totalImpressions: 0,
      totalClicks: 0,
      totalConversions: 0,
      totalAds: 0,
      totalSpent: 0,
      totalBudget: 0,
      averageCTR: 0,
      averageCPC: 0,
      budgetUtilization: 0
    };

    // ============================
    // 2. Tendances temporelles
    // ============================
    let startDateObj = startDate ? new Date(startDate) : new Date();
    startDateObj.setMonth(startDateObj.getMonth() - 1);

    let endDateObj = endDate ? new Date(endDate) : new Date();

    // Format de date et intervalle selon groupBy
    let dateFormat = "%Y-%m-%d";
    let dateField = "$analytics.dailyStats.date";

    if (groupBy === 'weekly') {
      dateFormat = "%Y-%U"; // Année-Semaine
    } else if (groupBy === 'monthly') {
      dateFormat = "%Y-%m"; // Année-Mois
    }

    const trends = await Advertisement.aggregate([
      { $match: query },
      { $unwind: "$analytics.dailyStats" },
      { $match: { 
          "analytics.dailyStats.date": { 
            $gte: startDateObj, 
            $lte: endDateObj 
          } 
      }},
      { $group: {
          _id: { $dateToString: { format: dateFormat, date: dateField } },
          impressions: { $sum: "$analytics.dailyStats.impressions" },
          clicks: { $sum: "$analytics.dailyStats.clicks" },
          conversions: { $sum: "$analytics.dailyStats.conversions" },
          viewDuration: { $avg: "$analytics.dailyStats.viewDuration" },
          spent: { $sum: "$analytics.dailyStats.spent" || 0 }
      }},
      { $addFields: {
          ctr: { 
            $cond: [
              { $gt: ["$impressions", 0] },
              { $multiply: [{ $divide: ["$clicks", "$impressions"] }, 100] },
              0
            ]
          },
          cpc: { 
            $cond: [
              { $gt: ["$clicks", 0] },
              { $divide: ["$spent", "$clicks"] },
              0
            ]
          }
      }},
      { $sort: { _id: 1 } }
    ]);

    // ============================
    // 3. Stats par type
    // ============================
    const statsByType = await Advertisement.aggregate([
      { $match: query },
      { $group: {
          _id: "$type",
          impressions: { $sum: "$analytics.impressions" },
          clicks: { $sum: "$analytics.clicks" },
          conversions: { $sum: "$analytics.conversions" },
          count: { $sum: 1 },
          spent: { $sum: "$budget.spent" },
          ctr: { 
            $avg: { 
              $cond: [
                { $gt: ["$analytics.impressions", 0] },
                { $multiply: [{ $divide: ["$analytics.clicks", "$analytics.impressions"] }, 100] },
                0
              ]
            } 
          }
      }},
      { $sort: { clicks: -1 } }
    ]);

    // ============================
    // 4. Stats par position
    // ============================
    const statsByPosition = await Advertisement.aggregate([
      { $match: query },
      { $group: {
          _id: "$position",
          impressions: { $sum: "$analytics.impressions" },
          clicks: { $sum: "$analytics.clicks" },
          conversions: { $sum: "$analytics.conversions" },
          count: { $sum: 1 },
          spent: { $sum: "$budget.spent" },
          ctr: { 
            $avg: { 
              $cond: [
                { $gt: ["$analytics.impressions", 0] },
                { $multiply: [{ $divide: ["$analytics.clicks", "$analytics.impressions"] }, 100] },
                0
              ]
            } 
          }
      }},
      { $sort: { ctr: -1 } }
    ]);

    // ============================
    // 5. Stats par audience
    // ============================
    const statsByAudience = await Advertisement.aggregate([
      { $match: query },
      { $unwind: { path: "$targetAudience.interests", preserveNullAndEmptyArrays: true } },
      { $group: {
          _id: "$targetAudience.interests",
          impressions: { $sum: "$analytics.impressions" },
          clicks: { $sum: "$analytics.clicks" },
          conversions: { $sum: "$analytics.conversions" },
          count: { $sum: 1 },
          ctr: { 
            $avg: { 
              $cond: [
                { $gt: ["$analytics.impressions", 0] },
                { $multiply: [{ $divide: ["$analytics.clicks", "$analytics.impressions"] }, 100] },
                0
              ]
            } 
          }
      }},
      { $match: { _id: { $ne: null } } },
      { $sort: { clicks: -1 } },
      { $limit: 10 }
    ]);

    // ============================
    // 6. Meilleures publicités
    // ============================
    const topAds = await Advertisement.find(query)
      .sort({ "analytics.clicks": -1 })
      .limit(parseInt(limit))
      .select('name type position status analytics targetAudience budget');

    // ============================
    // 7. Statistiques de performance
    // ============================
    const performanceStats = await Advertisement.aggregate([
      { $match: query },
      { $project: {
          name: 1,
          type: 1,
          position: 1,
          impressions: "$analytics.impressions",
          clicks: "$analytics.clicks",
          conversions: "$analytics.conversions",
          spent: "$budget.spent",
          ctr: { 
            $cond: [
              { $gt: ["$analytics.impressions", 0] },
              { $multiply: [{ $divide: ["$analytics.clicks", "$analytics.impressions"] }, 100] },
              0
            ]
          },
          cpc: { 
            $cond: [
              { $gt: ["$analytics.clicks", 0] },
              { $divide: ["$budget.spent", "$analytics.clicks"] },
              0
            ]
          },
          conversionRate: { 
            $cond: [
              { $gt: ["$analytics.clicks", 0] },
              { $multiply: [{ $divide: ["$analytics.conversions", "$analytics.clicks"] }, 100] },
              0
            ]
          },
          costPerConversion: { 
            $cond: [
              { $gt: ["$analytics.conversions", 0] },
              { $divide: ["$budget.spent", "$analytics.conversions"] },
              0
            ]
          }
      }},
      { $sort: { [sortBy]: sortOrder === 'asc' ? 1 : -1 } },
      { $limit: parseInt(limit) }
    ]);

    // ============================
    // 8. Données contextuelles (où les publicités performent le mieux)
    // ============================
    const contextPerformance = await Advertisement.aggregate([
      { $match: query },
      { $unwind: { path: "$analytics.contextStats", preserveNullAndEmptyArrays: true } },
      { $group: {
          _id: "$analytics.contextStats.context",
          impressions: { $sum: "$analytics.contextStats.impressions" },
          clicks: { $sum: "$analytics.contextStats.clicks" },
          count: { $sum: 1 },
          ctr: { 
            $avg: { 
              $cond: [
                { $gt: ["$analytics.contextStats.impressions", 0] },
                { $multiply: [{ $divide: ["$analytics.contextStats.clicks", "$analytics.contextStats.impressions"] }, 100] },
                0
              ]
            } 
          }
      }},
      { $match: { _id: { $ne: null } } },
      { $sort: { ctr: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview,
        trends,
        statsByType,
        statsByPosition,
        statsByAudience,
        topAds,
        performanceStats,
        contextPerformance
      }
    });

  } catch (error) {
    console.error("Erreur API analytics:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des analytiques",
      error: error.message
    });
  }
}
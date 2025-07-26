import dbConnect from "../../../../lib/dbConnect";
import Order from "../../../../models/Order";
import User from "../../../../models/User";
import Product from "../../../../models/Product";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import mongoose from "mongoose";

// GET /api/dashboard/orders - Récupérer les commandes pour le dashboard admin
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return Response.json({ 
        success: false, 
        message: "Accès non autorisé" 
      }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const paymentStatus = searchParams.get('paymentStatus') || '';
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const minTotal = searchParams.get('minTotal');
    const maxTotal = searchParams.get('maxTotal');
    const exportType = searchParams.get('export');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Construire la requête de filtre
    let query = {};

    // Recherche textuelle (ID commande, email client, nom)
    if (search) {
      const isObjectId = mongoose.Types.ObjectId.isValid(search);
      if (isObjectId) {
        query._id = new mongoose.Types.ObjectId(search);
      } else {
        // Rechercher dans les informations client
        const users = await User.find({
          $or: [
            { email: { $regex: search, $options: 'i' } },
            { name: { $regex: search, $options: 'i' } }
          ]
        }).select('_id');
        
        const userIds = users.map(u => u._id);
        
        query.$or = [
          { orderNumber: { $regex: search, $options: 'i' } },
          { user: { $in: userIds } },
          { 'shippingAddress.name': { $regex: search, $options: 'i' } },
          { 'billingAddress.name': { $regex: search, $options: 'i' } }
        ];
      }
    }

    // Filtrer par statut
    if (status) {
      query.status = status;
    }

    // Filtrer par statut de paiement
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    // Filtrer par date
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) {
        query.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.createdAt.$lte = new Date(dateTo);
      }
    }

    // Filtrer par montant
    if (minTotal || maxTotal) {
      query.total = {};
      if (minTotal) {
        query.total.$gte = parseFloat(minTotal);
      }
      if (maxTotal) {
        query.total.$lte = parseFloat(maxTotal);
      }
    }

    // Options de tri
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Si export demandé, retourner toutes les commandes filtrées
    if (exportType === 'csv') {
      const orders = await Order.find(query)
        .populate('user', 'name email')
        .sort(sortOptions)
        .lean();

      return Response.json({
        success: true,
        data: {
          orders,
          export: true,
          totalCount: orders.length
        }
      });
    }

    // Exécuter les requêtes en parallèle
    const [orders, total, statusStats] = await Promise.all([
      Order.find(query)
        .populate('user', 'name email avatar')
        .populate('items.product', 'name slug images')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query),
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ]);

    // Calculer les métadonnées de pagination
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    // Transformer les stats en objet
    const statusCounts = statusStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});

    return Response.json({
      success: true,
      data: {
        orders,
        pagination: {
          current: page,
          total: totalPages,
          hasNext,
          hasPrev,
          totalCount: total
        },
        stats: {
          statusCounts,
          total
        },
        filters: {
          search,
          status,
          paymentStatus,
          dateFrom,
          dateTo,
          minTotal,
          maxTotal,
          sortBy,
          sortOrder
        }
      }
    });

  } catch (error) {
    console.error('Erreur API dashboard orders:', error);
    return Response.json({
      success: false,
      message: "Erreur lors de la récupération des commandes",
      error: error.message
    }, { status: 500 });
  }
}

// PUT /api/dashboard/orders - Mettre à jour une ou plusieurs commandes
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return Response.json({ 
        success: false, 
        message: "Accès non autorisé" 
      }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { action, orderIds, updateData } = body;

    if (!action || !orderIds || !Array.isArray(orderIds)) {
      return Response.json({
        success: false,
        message: "Paramètres invalides"
      }, { status: 400 });
    }

    let result;

    switch (action) {
      case 'updateStatus':
        if (!updateData.status) {
          return Response.json({
            success: false,
            message: "Statut manquant"
          }, { status: 400 });
        }
        
        result = await Order.updateMany(
          { _id: { $in: orderIds } },
          { 
            status: updateData.status,
            updatedAt: new Date(),
            ...(updateData.status === 'shipped' && { shippedAt: new Date() }),
            ...(updateData.status === 'delivered' && { deliveredAt: new Date() })
          }
        );
        break;

      case 'updatePaymentStatus':
        if (!updateData.paymentStatus) {
          return Response.json({
            success: false,
            message: "Statut de paiement manquant"
          }, { status: 400 });
        }
        
        result = await Order.updateMany(
          { _id: { $in: orderIds } },
          { 
            paymentStatus: updateData.paymentStatus,
            updatedAt: new Date(),
            ...(updateData.paymentStatus === 'paid' && { paidAt: new Date() })
          }
        );
        break;

      case 'addTracking':
        if (!updateData.trackingNumber) {
          return Response.json({
            success: false,
            message: "Numéro de suivi manquant"
          }, { status: 400 });
        }
        
        result = await Order.updateMany(
          { _id: { $in: orderIds } },
          { 
            trackingNumber: updateData.trackingNumber,
            trackingUrl: updateData.trackingUrl || '',
            status: 'shipped',
            shippedAt: new Date(),
            updatedAt: new Date()
          }
        );
        break;

      case 'cancel':
        result = await Order.updateMany(
          { _id: { $in: orderIds } },
          { 
            status: 'cancelled',
            cancelledAt: new Date(),
            cancelReason: updateData.cancelReason || 'Annulée par l\'administrateur',
            updatedAt: new Date()
          }
        );
        break;

      case 'delete':
        result = await Order.deleteMany({ _id: { $in: orderIds } });
        break;

      default:
        return Response.json({
          success: false,
          message: "Action non reconnue"
        }, { status: 400 });
    }

    return Response.json({
      success: true,
      message: `${result.modifiedCount || result.deletedCount} commande(s) ${action === 'delete' ? 'supprimée(s)' : 'mise(s) à jour'}`,
      data: {
        affected: result.modifiedCount || result.deletedCount,
        action
      }
    });

  } catch (error) {
    console.error('Erreur mise à jour commandes:', error);
    return Response.json({
      success: false,
      message: "Erreur lors de la mise à jour des commandes",
      error: error.message
    }, { status: 500 });
  }
}

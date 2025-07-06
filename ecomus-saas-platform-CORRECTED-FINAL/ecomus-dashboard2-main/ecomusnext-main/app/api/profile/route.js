import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { connectDB } from '../../../lib/mongodb';
import User from '../../../models/User';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id).select('-password');
    
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Calculer les permissions du dashboard selon le rôle
    const dashboardPermissions = getDashboardPermissions(user.role);

    return NextResponse.json({
      user: {
        ...user.toJSON(),
        dashboardAccess: {
          ...user.dashboardAccess,
          permissions: dashboardPermissions
        }
      }
    });

  } catch (error) {
    console.error('Erreur récupération profil:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du profil' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await connectDB();

    const updateData = await request.json();
    
    // Supprimer les champs sensibles qui ne peuvent pas être modifiés
    delete updateData.password;
    delete updateData.role;
    delete updateData.email;
    delete updateData._id;

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: updatedUser.toJSON(),
      message: 'Profil mis à jour avec succès'
    });

  } catch (error) {
    console.error('Erreur mise à jour profil:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du profil' },
      { status: 500 }
    );
  }
}

function getDashboardPermissions(role) {
  const permissions = [];

  switch (role) {
    case 'admin':
      permissions.push(
        { resource: 'products', actions: ['read', 'write', 'delete', 'admin'] },
        { resource: 'orders', actions: ['read', 'write', 'delete', 'admin'] },
        { resource: 'users', actions: ['read', 'write', 'delete', 'admin'] },
        { resource: 'analytics', actions: ['read', 'write', 'admin'] },
        { resource: 'ai', actions: ['read', 'write', 'admin'] },
        { resource: '3d', actions: ['read', 'write', 'delete', 'admin'] },
        { resource: 'settings', actions: ['read', 'write', 'admin'] }
      );
      break;

    case 'vendor':
      permissions.push(
        { resource: 'products', actions: ['read', 'write'] },
        { resource: 'orders', actions: ['read'] },
        { resource: 'analytics', actions: ['read'] },
        { resource: 'ai', actions: ['read', 'write'] },
        { resource: '3d', actions: ['read', 'write'] }
      );
      break;

    case 'client':
      permissions.push(
        { resource: 'orders', actions: ['read'] },
        { resource: 'ai', actions: ['read'] }
      );
      break;

    default:
      permissions.push(
        { resource: 'orders', actions: ['read'] }
      );
  }

  return permissions;
}

// API pour gérer les préférences du dashboard
export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await connectDB();

    const { dashboardPreferences } = await request.json();

    if (!dashboardPreferences) {
      return NextResponse.json({ error: 'Préférences du dashboard requises' }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { $set: { 'dashboardAccess.customDashboard': dashboardPreferences } },
      { new: true }
    ).select('dashboardAccess');

    return NextResponse.json({
      success: true,
      dashboardAccess: updatedUser.dashboardAccess,
      message: 'Préférences du dashboard mises à jour'
    });

  } catch (error) {
    console.error('Erreur mise à jour préférences dashboard:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour des préférences' },
      { status: 500 }
    );
  }
}

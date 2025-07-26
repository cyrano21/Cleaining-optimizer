import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { achievementId } = await req.json();
    
    if (!achievementId) {
      return NextResponse.json({ error: 'ID d\'achievement requis' }, { status: 400 });
    }

    await connectDB();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Initialiser les achievements si nécessaire
    if (!user.unlockedAchievements) {
      user.unlockedAchievements = [];
    }

    // Vérifier si l'achievement n'est pas déjà débloqué
    if (user.unlockedAchievements.includes(achievementId)) {
      return NextResponse.json({ error: 'Achievement déjà débloqué' }, { status: 400 });
    }

    // Calculer les XP gagnés (basé sur le type d'achievement)
    const achievementRewards: Record<string, { xp: number; title: string }> = {
      'first-sale': { xp: 100, title: 'Première Vente' },
      'sales-master': { xp: 500, title: 'Maître des Ventes' },
      'product-creator': { xp: 200, title: 'Créateur de Produits' },
      'customer-favorite': { xp: 300, title: 'Favori des Clients' },
      'user-manager': { xp: 1000, title: 'Gestionnaire d\'Utilisateurs' },
      'system-guardian': { xp: 500, title: 'Gardien du Système' },
      'first-purchase': { xp: 50, title: 'Premier Achat' },
      'loyal-customer': { xp: 200, title: 'Client Fidèle' },
    };

    const achievement = achievementRewards[achievementId];
    if (!achievement) {
      return NextResponse.json({ error: 'Achievement non reconnu' }, { status: 400 });
    }

    // Mettre à jour l'utilisateur
    user.unlockedAchievements.push(achievementId);
    user.gamificationXP = (user.gamificationXP || 0) + achievement.xp;
    user.gamificationLevel = Math.floor((user.gamificationXP || 0) / 1000) + 1;

    await user.save();

    return NextResponse.json({
      success: true,
      xpGained: achievement.xp,
      achievementTitle: achievement.title,
      totalXP: user.gamificationXP,
      level: user.gamificationLevel
    });

  } catch (error) {
    console.error('Erreur lors du déblocage de l\'achievement:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

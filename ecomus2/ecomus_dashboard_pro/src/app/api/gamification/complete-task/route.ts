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

    const { taskId } = await req.json();
    
    if (!taskId) {
      return NextResponse.json({ error: 'ID de tâche requis' }, { status: 400 });
    }

    await connectDB();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Initialiser les tâches complétées si nécessaire
    if (!user.completedTasks) {
      user.completedTasks = [];
    }

    // Vérifier si la tâche n'est pas déjà complétée
    if (user.completedTasks.includes(taskId)) {
      return NextResponse.json({ error: 'Tâche déjà complétée' }, { status: 400 });
    }

    // Calculer les XP gagnés (basé sur le type de tâche)
    let xpGained = 10; // XP par défaut
    
    const taskRewards: Record<string, number> = {
      'daily-check': 10,
      'process-orders': 50,
      'system-check': 50,
      'user-support': 30,
      'browse-products': 10,
    };

    xpGained = taskRewards[taskId] || 10;

    // Mettre à jour l'utilisateur
    user.completedTasks.push(taskId);
    user.gamificationXP = (user.gamificationXP || 0) + xpGained;
    user.gamificationLevel = Math.floor((user.gamificationXP || 0) / 1000) + 1;

    await user.save();

    return NextResponse.json({
      success: true,
      xpGained,
      totalXP: user.gamificationXP,
      level: user.gamificationLevel
    });

  } catch (error) {
    console.error('Erreur lors de la completion de la tâche:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

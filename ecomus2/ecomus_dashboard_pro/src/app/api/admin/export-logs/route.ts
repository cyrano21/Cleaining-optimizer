import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { checkAdminAccess } from '@/lib/role-utils';

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token || !token.role || !checkAdminAccess(token.role as string)) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    // Générer des logs simulés pour la démo
    const currentDate = new Date();
    const logs = [];
    
    for (let i = 0; i < 100; i++) {
      const logDate = new Date(currentDate.getTime() - (i * 60000)); // Logs des dernières heures
      const levels = ['INFO', 'WARNING', 'ERROR', 'DEBUG'];
      const level = levels[Math.floor(Math.random() * levels.length)];
      const messages = {
        INFO: ['Utilisateur connecté', 'Commande créée', 'Produit mis à jour', 'Cache actualisé'],
        WARNING: ['Tentative de connexion échouée', 'Stock faible', 'Temps de réponse élevé'],
        ERROR: ['Erreur de base de données', 'API externe indisponible', 'Erreur de validation'],
        DEBUG: ['Query exécutée', 'Variable initialisée', 'Fonction appelée']
      };
      
      logs.push({
        timestamp: logDate.toISOString(),
        level,
        message: messages[level as keyof typeof messages][Math.floor(Math.random() * messages[level as keyof typeof messages].length)],
        source: ['auth.service', 'database.service', 'api.controller', 'cache.service'][Math.floor(Math.random() * 4)],
        userId: Math.random() > 0.5 ? `user_${Math.floor(Math.random() * 1000)}` : null
      });
    }

    // Créer un fichier CSV
    const csvHeader = 'Timestamp,Level,Message,Source,UserId\n';
    const csvContent = logs.map(log => 
      `${log.timestamp},${log.level},"${log.message}",${log.source},${log.userId || ''}`
    ).join('\n');
    
    const csvData = csvHeader + csvContent;

    // Retourner le fichier CSV
    return new NextResponse(csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="system-logs-${currentDate.toISOString().split('T')[0]}.csv"`
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'export des logs:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'export des logs' },
      { status: 500 }
    );
  }
}

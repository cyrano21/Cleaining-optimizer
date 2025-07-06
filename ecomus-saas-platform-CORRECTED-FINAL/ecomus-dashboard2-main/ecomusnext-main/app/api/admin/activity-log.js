import connectDB from '../../../config/db';
import AdminActivityLog from '../../../models/AdminActivityLog';
// Configuration pour limiter les logs et améliorer les performances
const SAMPLE_RATE = process.env.ACTIVITY_LOG_SAMPLE_RATE || 1; // 1 = tous les logs, 2 = 50%, 10 = 10%
const LOG_MAX_PER_MINUTE = process.env.ACTIVITY_LOG_MAX_PER_MINUTE || 500;

// Cache pour limiter le débit
let logCounter = 0;
let lastResetTime = Date.now();

export default async function handler(req, res) {
  // Réinitialiser le compteur chaque minute
  if (Date.now() - lastResetTime > 60000) {
    logCounter = 0;
    lastResetTime = Date.now();
  }

  // Vérifier si nous avons atteint la limite
  if (logCounter >= LOG_MAX_PER_MINUTE) {
    // Répondre avec succès même si nous ne sauvegardons pas pour ne pas causer de problèmes côté client
    return res.status(200).json({ success: true, message: 'Rate limited, skipping log' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
  }

  // Échantillonnage - ne pas enregistrer tous les logs pour réduire la charge
  if (Math.random() * SAMPLE_RATE > 1) {
    return res.status(200).json({ success: true, message: 'Skipped by sampling' });
  }

  // Incrémenter le compteur
  logCounter++;

  try {
    await connectDB();

    const logData = req.body;

    // Valider les données d'entrée pour éviter les erreurs
    if (!logData || typeof logData !== 'object') {
      return res.status(200).json({ success: false, message: 'Données invalides' });
    }

    try {
      const activityLog = new AdminActivityLog({
        url: logData.url || req.url || 'unknown',
        method: logData.method || req.method || 'GET',
        userAgent: logData.userAgent || req.headers['user-agent'] || 'unknown',
        referrer: logData.referrer || req.headers.referer || '',
        userId: logData.userId || null,
        userType: logData.userType || 'visitor',
        timestamp: new Date(),
        // Données supplémentaires pour le traçage et l'analyse
        clientData: {
          screenSize: logData.screenSize,
          clientTimestamp: logData.clientTimestamp,
          type: logData.type || 'page_view',
          action: logData.action || 'view',
        }
      });

      await activityLog.save();
      
      return res.status(200).json({ success: true, message: 'Activité enregistrée' });
    } catch (dbError) {
      console.error('Erreur lors de l\'enregistrement dans la base de données:', dbError);
      return res.status(200).json({ success: false, message: 'Erreur DB traitée' });
    }
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de l\'activité:', error);
    // Toujours retourner 200 pour éviter les erreurs côté client
    return res.status(200).json({ success: false, message: 'Erreur traitée' });
  }
}
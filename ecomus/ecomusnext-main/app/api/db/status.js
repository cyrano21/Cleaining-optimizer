import db from 'config/db';

export default async function handler(req, res) {
  try {
    // Tenter de se connecter à MongoDB
    const conn = await db();
    
    // Renvoyer le statut de la connexion
    if (conn) {
      return res.status(200).json({ 
        connected: true, 
        message: 'Connecté à MongoDB',
        host: conn.connection.host
      });
    } else {
      return res.status(200).json({ 
        connected: false, 
        message: 'Non connecté à MongoDB'
      });
    }
  } catch (error) {
    console.error('Erreur de vérification de la connexion:', error);
    return res.status(500).json({ 
      connected: false, 
      message: 'Erreur lors de la vérification de la connexion',
      error: error.message
    });
  }
}

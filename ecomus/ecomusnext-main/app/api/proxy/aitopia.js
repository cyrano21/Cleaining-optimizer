
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req, res) {
  // N'autoriser que les méthodes POST pour cette route proxy
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    // URL du service distant que nous voulons appeler
    const targetUrl = 'https://extensions.aitopia.ai/ai/prompts';
    
    // On transmet la requête avec fetch
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Vous pouvez ajouter d'autres en-têtes nécessaires ici
      },
      body: JSON.stringify(req.body)
    });

    // On récupère le corps de la réponse
    const data = await response.json();
    
    // On renvoie la réponse au client
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Erreur lors de la requête proxy:', error);
    return res.status(500).json({ 
      error: 'Erreur lors de la communication avec le service externe',
      details: error.message 
    });
  }
}

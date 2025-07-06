// pages/api/local/prompts.js - Remplace la dépendance à extensions.aitopia.ai
import { NextApiRequest, NextApiResponse } from 'next';

// Données statiques pour simuler les réponses du service externe
const mockPrompts = {
  product: [
    "Ce produit est parfait pour...",
    "Idéal pour les personnes cherchant...",
    "Notre meilleur produit pour...",
    "Un excellent choix si vous avez besoin de...",
    "Parfait pour compléter votre collection de...",
  ],
  category: [
    "Cette catégorie contient des produits pour...",
    "Découvrez notre gamme de produits pour...",
    "Les meilleurs articles pour...",
    "Tout ce dont vous avez besoin pour...",
  ],
  description: [
    "Un produit de haute qualité qui...",
    "Conçu spécifiquement pour répondre aux besoins de...",
    "Fabriqué avec les meilleurs matériaux pour assurer...",
    "Ce produit se distingue par sa...",
    "Caractéristiques principales incluant...",
  ]
};

export default async function handler(req, res) {
  // N'autoriser que les méthodes POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { type, context } = req.body;
    
    // Validation des entrées
    if (!type || !mockPrompts[type]) {
      return res.status(400).json({ 
        error: 'Type de prompt invalide',
        validTypes: Object.keys(mockPrompts)
      });
    }

    // Sélectionner aléatoirement des prompts en fonction du type
    const availablePrompts = mockPrompts[type];
    const selectedPrompts = [];
    
    // Sélectionner 3 prompts aléatoires sans répétition
    const count = Math.min(3, availablePrompts.length);
    const indices = new Set();
    
    while (indices.size < count) {
      indices.add(Math.floor(Math.random() * availablePrompts.length));
    }
    
    indices.forEach(index => {
      selectedPrompts.push(availablePrompts[index]);
    });

    // Retourner les prompts générés au format attendu par l'application
    return res.status(200).json({
      success: true,
      prompts: selectedPrompts
    });
    
  } catch (error) {
    console.error('Erreur lors de la génération des prompts:', error);
    return res.status(500).json({ 
      error: 'Erreur lors de la génération des prompts',
      details: error.message 
    });
  }
}

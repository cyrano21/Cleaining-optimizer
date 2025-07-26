/**
 * Services IA pour Ecomus SaaS
 * Support Ollama local + Hugging Face cloud
 */

import { HfInference } from '@huggingface/inference';

// Configuration des services IA
const AI_CONFIG = {
  ollama: {
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    model: process.env.OLLAMA_MODEL || 'llama2',
    timeout: 30000
  },
  huggingface: {
    apiKey: process.env.HUGGINGFACE_API_KEY,
    model: process.env.HUGGINGFACE_MODEL || 'microsoft/DialoGPT-medium',
    timeout: 15000
  }
};

// Instance Hugging Face
let hf = null;
if (AI_CONFIG.huggingface.apiKey) {
  hf = new HfInference(AI_CONFIG.huggingface.apiKey);
}

/**
 * Vérifier la disponibilité d'Ollama
 */
export async function checkOllamaStatus() {
  try {
    const response = await fetch(`${AI_CONFIG.ollama.baseUrl}/api/tags`, {
      timeout: 5000
    });
    return response.ok;
  } catch (error) {
    console.warn('Ollama non disponible:', error.message);
    return false;
  }
}

/**
 * Générer du texte avec Ollama (local)
 */
export async function generateWithOllama(prompt, options = {}) {
  try {
    const response = await fetch(`${AI_CONFIG.ollama.baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options.model || AI_CONFIG.ollama.model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 500,
          ...options.ollamaOptions
        }
      }),
      timeout: AI_CONFIG.ollama.timeout
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      response: data.response,
      model: data.model,
      provider: 'ollama'
    };
  } catch (error) {
    console.error('Erreur Ollama:', error);
    return {
      success: false,
      error: error.message,
      provider: 'ollama'
    };
  }
}

/**
 * Générer du texte avec Hugging Face (cloud)
 */
export async function generateWithHuggingFace(prompt, options = {}) {
  if (!hf) {
    return {
      success: false,
      error: 'Hugging Face API key non configurée',
      provider: 'huggingface'
    };
  }

  try {
    const model = options.model || AI_CONFIG.huggingface.model;
    
    // Utiliser le bon endpoint selon le modèle
    let result;
    if (model.includes('DialoGPT') || model.includes('gpt')) {
      // Modèles conversationnels
      result = await hf.conversational({
        model: model,
        inputs: {
          text: prompt,
          generated_responses: [],
          past_user_inputs: []
        },
        parameters: {
          temperature: options.temperature || 0.7,
          max_length: options.maxTokens || 500,
          ...options.hfOptions
        }
      });
      
      return {
        success: true,
        response: result.generated_text || result.conversation?.generated_responses?.[0] || 'Pas de réponse générée',
        model: model,
        provider: 'huggingface'
      };
    } else {
      // Modèles de génération de texte standard
      result = await hf.textGeneration({
        model: model,
        inputs: prompt,
        parameters: {
          temperature: options.temperature || 0.7,
          max_new_tokens: options.maxTokens || 500,
          return_full_text: false,
          ...options.hfOptions
        }
      });

      return {
        success: true,
        response: result.generated_text || 'Pas de réponse générée',
        model: model,
        provider: 'huggingface'
      };
    }
  } catch (error) {
    console.error('Erreur Hugging Face:', error);
    return {
      success: false,
      error: error.message,
      provider: 'huggingface'
    };
  }
}

/**
 * Générer du texte avec fallback automatique
 */
export async function generateText(prompt, options = {}) {
  const { preferredProvider = 'auto', ...genOptions } = options;
  
  // Auto: essayer Ollama puis Hugging Face
  if (preferredProvider === 'auto' || preferredProvider === 'ollama') {
    const ollamaAvailable = await checkOllamaStatus();
    if (ollamaAvailable) {
      const result = await generateWithOllama(prompt, genOptions);
      if (result.success) {
        return result;
      }
    }
  }
  
  // Fallback vers Hugging Face
  if (preferredProvider === 'auto' || preferredProvider === 'huggingface') {
    return await generateWithHuggingFace(prompt, genOptions);
  }
  
  // Provider spécifique demandé
  if (preferredProvider === 'ollama') {
    return await generateWithOllama(prompt, genOptions);
  }
  
  return {
    success: false,
    error: 'Aucun provider IA disponible',
    provider: 'none'
  };
}

/**
 * Chat intelligent avec contexte
 */
export async function chatWithAI(message, context = {}) {
  const { history = [], userProfile = {}, productContext = {} } = context;
  
  // Construire le prompt avec contexte
  let prompt = '';
  
  // Contexte utilisateur
  if (userProfile.name) {
    prompt += `Utilisateur: ${userProfile.name}\n`;
  }
  if (userProfile.role) {
    prompt += `Rôle: ${userProfile.role}\n`;
  }
  
  // Contexte produit si disponible
  if (productContext.name) {
    prompt += `Produit en cours: ${productContext.name}\n`;
    if (productContext.category) {
      prompt += `Catégorie: ${productContext.category}\n`;
    }
    if (productContext.price) {
      prompt += `Prix: ${productContext.price}€\n`;
    }
  }
  
  // Historique de conversation
  if (history.length > 0) {
    prompt += '\nHistorique:\n';
    history.slice(-5).forEach(msg => {
      prompt += `${msg.role}: ${msg.content}\n`;
    });
  }
  
  prompt += `\nTu es un assistant e-commerce intelligent pour Ecomus. Réponds de manière utile et professionnelle.\nQuestion: ${message}`;
  
  return await generateText(prompt, {
    temperature: 0.8,
    maxTokens: 300
  });
}

/**
 * Générer une description produit automatique
 */
export async function generateProductDescription(productData) {
  const { name, category, price, features = [], materials = [] } = productData;
  
  let prompt = `Génère une description produit attractive et professionnelle pour un e-commerce.

Produit: ${name}
Catégorie: ${category}
Prix: ${price}€`;

  if (features.length > 0) {
    prompt += `\nCaractéristiques: ${features.join(', ')}`;
  }
  
  if (materials.length > 0) {
    prompt += `\nMatériaux: ${materials.join(', ')}`;
  }
  
  prompt += '\n\nDescription (2-3 paragraphes, ton marketing, français):';
  
  return await generateText(prompt, {
    temperature: 0.7,
    maxTokens: 400
  });
}

/**
 * Analyser les sentiments d'un avis client
 */
export async function analyzeSentiment(reviewText) {
  if (!hf) {
    return {
      success: false,
      error: 'Service d\'analyse non disponible'
    };
  }

  try {
    const result = await hf.textClassification({
      model: 'cardiffnlp/twitter-roberta-base-sentiment-latest',
      inputs: reviewText
    });

    const sentiment = result[0];
    return {
      success: true,
      sentiment: sentiment.label,
      confidence: sentiment.score,
      provider: 'huggingface'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Obtenir des recommandations produits basées sur l'IA
 */
export async function getProductRecommendations(userProfile, currentProduct, options = {}) {
  const { limit = 5 } = options;
  
  let prompt = `Génère ${limit} recommandations de produits similaires ou complémentaires.

Produit actuel: ${currentProduct.name}
Catégorie: ${currentProduct.category}
Prix: ${currentProduct.price}€`;

  if (userProfile.purchaseHistory) {
    prompt += `\nHistorique d'achat: ${userProfile.purchaseHistory.slice(-3).map(p => p.name).join(', ')}`;
  }
  
  if (userProfile.preferences) {
    prompt += `\nPréférences: ${userProfile.preferences.join(', ')}`;
  }
  
  prompt += '\n\nListe 5 recommandations avec nom et raison (format: "Nom - Raison"):';
  
  const result = await generateText(prompt, {
    temperature: 0.6,
    maxTokens: 300
  });
  
  if (result.success) {
    // Parser les recommandations
    const recommendations = result.response
      .split('\n')
      .filter(line => line.includes('-'))
      .slice(0, limit)
      .map(line => {
        const [name, ...reasonParts] = line.split('-');
        return {
          name: name.trim(),
          reason: reasonParts.join('-').trim()
        };
      });
    
    return {
      success: true,
      recommendations,
      provider: result.provider
    };
  }
  
  return result;
}

/**
 * Vérifier l'état de tous les services IA
 */
export async function checkAIServicesStatus() {
  const status = {
    ollama: {
      available: false,
      url: AI_CONFIG.ollama.baseUrl,
      model: AI_CONFIG.ollama.model
    },
    huggingface: {
      available: !!AI_CONFIG.huggingface.apiKey,
      model: AI_CONFIG.huggingface.model,
      apiKey: AI_CONFIG.huggingface.apiKey ? '***configurée***' : 'manquante'
    }
  };
  
  // Test Ollama
  status.ollama.available = await checkOllamaStatus();
  
  return status;
}

// Export par défaut avec toutes les fonctions
export default {
  generateText,
  chatWithAI,
  generateProductDescription,
  analyzeSentiment,
  getProductRecommendations,
  generateWithOllama,
  generateWithHuggingFace,
  checkOllamaStatus,
  checkAIServicesStatus
};

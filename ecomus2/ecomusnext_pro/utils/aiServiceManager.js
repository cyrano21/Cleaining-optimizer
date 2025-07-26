/**
 * Utilitaire de gestion des services IA pour Ecomus SaaS
 * Gère les connexions Ollama et Hugging Face
 */

import aiConfig from '../config/ai-config.json';

class AIServiceManager {
  constructor() {
    this.config = aiConfig;
    this.ollamaAvailable = false;
    this.huggingFaceAvailable = false;
    this.initialized = false;
  }

  // Initialisation des services IA
  async initialize() {
    if (this.initialized) return;

    console.log('🔄 Initialisation des services IA...');
    
    // Test de connexion Ollama
    await this.checkOllamaConnection();
    
    // Test de connexion Hugging Face
    await this.checkHuggingFaceConnection();
    
    this.initialized = true;
    console.log('✅ Services IA initialisés');
  }

  // Vérification de la connexion Ollama
  async checkOllamaConnection() {
    try {
      const response = await fetch(`${this.config.ollama.baseUrl}/api/tags`, {
        method: 'GET',
        timeout: 5000
      });
      
      if (response.ok) {
        const data = await response.json();
        this.ollamaAvailable = true;
        console.log('✅ Ollama connecté -', data.models?.length || 0, 'modèles disponibles');
        return true;
      }
    } catch (error) {
      console.log('❌ Ollama non disponible:', error.message);
      this.ollamaAvailable = false;
    }
    return false;
  }

  // Vérification de la connexion Hugging Face
  async checkHuggingFaceConnection() {
    try {
      const apiKey = process.env.HUGGINGFACE_API_KEY || this.config.huggingface.apiKey;
      
      if (!apiKey || apiKey === 'YOUR_HUGGING_FACE_API_KEY') {
        console.log('⚠️  Clé API Hugging Face non configurée');
        this.huggingFaceAvailable = false;
        return false;
      }

      // Test simple avec un modèle léger
      const response = await fetch(`${this.config.huggingface.baseUrl}/models/microsoft/DialoGPT-medium`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        },
        timeout: 5000
      });

      if (response.ok) {
        this.huggingFaceAvailable = true;
        console.log('✅ Hugging Face connecté');
        return true;
      }
    } catch (error) {
      console.log('❌ Hugging Face non disponible:', error.message);
      this.huggingFaceAvailable = false;
    }
    return false;
  }

  // Chat avec le modèle local (Ollama)
  async chatWithOllama(message, model = 'llama3.2', context = []) {
    if (!this.ollamaAvailable) {
      throw new Error('Service Ollama non disponible');
    }

    try {
      const response = await fetch(`${this.config.ollama.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content: this.config.chat.systemPrompt
            },
            ...context,
            {
              role: 'user',
              content: message
            }
          ],
          options: {
            temperature: this.config.chat.temperature,
            num_predict: this.config.chat.maxTokens
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur Ollama: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        response: data.message?.content || '',
        model: model,
        timestamp: new Date().toISOString(),
        source: 'ollama'
      };
    } catch (error) {
      console.error('Erreur chat Ollama:', error);
      throw error;
    }
  }

  // Chat avec Hugging Face
  async chatWithHuggingFace(message, model = 'microsoft/DialoGPT-medium') {
    if (!this.huggingFaceAvailable) {
      throw new Error('Service Hugging Face non disponible');
    }

    try {
      const apiKey = process.env.HUGGINGFACE_API_KEY || this.config.huggingface.apiKey;
      
      const response = await fetch(`${this.config.huggingface.baseUrl}/models/${model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: message,
          parameters: {
            max_new_tokens: this.config.chat.maxTokens,
            temperature: this.config.chat.temperature,
            return_full_text: false
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur Hugging Face: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        response: data[0]?.generated_text || data.generated_text || '',
        model: model,
        timestamp: new Date().toISOString(),
        source: 'huggingface'
      };
    } catch (error) {
      console.error('Erreur chat Hugging Face:', error);
      throw error;
    }
  }

  // Génération d'image avec Hugging Face
  async generateImage(prompt, model = 'stabilityai/stable-diffusion-2-1') {
    if (!this.huggingFaceAvailable) {
      throw new Error('Service Hugging Face non disponible');
    }

    try {
      const apiKey = process.env.HUGGINGFACE_API_KEY || this.config.huggingface.apiKey;
      
      const response = await fetch(`${this.config.huggingface.baseUrl}/models/${model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            width: 512,
            height: 512,
            num_inference_steps: 20
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur génération d'image: ${response.statusText}`);
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      
      return {
        imageUrl: imageUrl,
        prompt: prompt,
        model: model,
        timestamp: new Date().toISOString(),
        source: 'huggingface'
      };
    } catch (error) {
      console.error('Erreur génération d\'image:', error);
      throw error;
    }
  }

  // Chat intelligent avec fallback automatique
  async smartChat(message, context = [], preferences = {}) {
    await this.initialize();

    const chatContext = [
      ...context,
      {
        role: 'system',
        content: `Contexte e-commerce: ${JSON.stringify(this.config.chat.ecommerceContext)}`
      }
    ];

    // Priorité: Ollama local d'abord, puis Hugging Face
    if (this.ollamaAvailable && !preferences.forceOnline) {
      try {
        return await this.chatWithOllama(message, preferences.model, chatContext);
      } catch (error) {
        console.log('Fallback vers Hugging Face après échec Ollama');
      }
    }

    if (this.huggingFaceAvailable) {
      try {
        return await this.chatWithHuggingFace(message, preferences.model);
      } catch (error) {
        console.error('Échec des deux services IA');
        throw new Error('Aucun service IA disponible actuellement');
      }
    }

    throw new Error('Aucun service IA configuré');
  }

  // Génération de description produit
  async generateProductDescription(productData) {
    const prompt = `
Génère une description attrayante pour ce produit e-commerce:
- Nom: ${productData.name}
- Catégorie: ${productData.category}
- Prix: ${productData.price}
- Caractéristiques: ${JSON.stringify(productData.features || {})}

La description doit être:
- Professionnelle et engageante
- Entre 100-300 mots
- Optimisée SEO
- Adaptée à la vente en ligne
`;

    try {
      const result = await this.smartChat(prompt, [], { 
        model: 'llama3.2',
        forceLocal: true 
      });
      
      return {
        description: result.response,
        generatedAt: result.timestamp,
        productId: productData.id
      };
    } catch (error) {
      console.error('Erreur génération description:', error);
      throw error;
    }
  }

  // Obtention du statut des services
  getServicesStatus() {
    return {
      ollama: {
        available: this.ollamaAvailable,
        url: this.config.ollama.baseUrl,
        models: this.config.ollama.models
      },
      huggingface: {
        available: this.huggingFaceAvailable,
        configured: this.config.huggingface.apiKey !== 'YOUR_HUGGING_FACE_API_KEY'
      },
      initialized: this.initialized
    };
  }

  // Analyse de sentiment pour reviews
  async analyzeSentiment(text) {
    try {
      const result = await this.smartChat(
        `Analyse le sentiment de ce texte et donne un score de 1-5 (1=très négatif, 5=très positif): "${text}"`
      );
      
      // Extraction du score numérique de la réponse
      const scoreMatch = result.response.match(/\d+/);
      const score = scoreMatch ? parseInt(scoreMatch[0]) : 3;
      
      return {
        score: Math.max(1, Math.min(5, score)),
        analysis: result.response,
        timestamp: result.timestamp
      };
    } catch (error) {
      console.error('Erreur analyse sentiment:', error);
      return { score: 3, analysis: 'Analyse non disponible', error: error.message };
    }
  }
}

// Instance singleton
const aiServiceManager = new AIServiceManager();

export default aiServiceManager;

// Export des fonctions utilitaires
export {
  AIServiceManager
};

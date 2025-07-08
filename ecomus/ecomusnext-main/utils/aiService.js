// Service de gestion IA pour Ecomus SaaS
export class AIService {
  constructor() {
    this.ollamaEndpoint = process.env.NEXT_PUBLIC_OLLAMA_ENDPOINT || 'http://localhost:11434';
    this.huggingFaceToken = process.env.NEXT_PUBLIC_HUGGINGFACE_TOKEN;
    this.defaultModel = 'llama2';
  }

  // Test de connexion Ollama
  async testOllamaConnection() {
    try {
      const response = await fetch(`${this.ollamaEndpoint}/api/tags`);
      if (response.ok) {
        const data = await response.json();
        return {
          status: 'connected',
          models: data.models || [],
          endpoint: this.ollamaEndpoint
        };
      }
      throw new Error('Impossible de se connecter à Ollama');
    } catch (error) {
      return {
        status: 'disconnected',
        error: error.message,
        endpoint: this.ollamaEndpoint
      };
    }
  }

  // Test de connexion Hugging Face
  async testHuggingFaceConnection() {
    if (!this.huggingFaceToken) {
      return {
        status: 'no_token',
        error: 'Token Hugging Face manquant'
      };
    }

    try {
      const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.huggingFaceToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: "Test connection"
        })
      });

      if (response.ok) {
        return {
          status: 'connected',
          token: this.huggingFaceToken ? 'Configuré' : 'Manquant'
        };
      }
      throw new Error('Token invalide ou limite atteinte');
    } catch (error) {
      return {
        status: 'error',
        error: error.message
      };
    }
  }

  // Génération de texte avec Ollama
  async generateTextOllama(prompt, model = this.defaultModel) {
    try {
      const response = await fetch(`${this.ollamaEndpoint}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model,
          prompt: prompt,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error('Erreur de génération Ollama');
      }

      const data = await response.json();
      return {
        success: true,
        text: data.response,
        model: model,
        provider: 'ollama'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        provider: 'ollama'
      };
    }
  }

  // Génération de texte avec Hugging Face
  async generateTextHuggingFace(prompt, model = 'gpt2') {
    if (!this.huggingFaceToken) {
      return {
        success: false,
        error: 'Token Hugging Face manquant',
        provider: 'huggingface'
      };
    }

    try {
      const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.huggingFaceToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_length: 200,
            temperature: 0.7,
            top_p: 0.9
          }
        })
      });

      if (!response.ok) {
        throw new Error('Erreur de génération Hugging Face');
      }

      const data = await response.json();
      return {
        success: true,
        text: data[0]?.generated_text || data.generated_text,
        model: model,
        provider: 'huggingface'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        provider: 'huggingface'
      };
    }
  }

  // Génération d'images avec Hugging Face
  async generateImageHuggingFace(prompt, model = 'runwayml/stable-diffusion-v1-5') {
    if (!this.huggingFaceToken) {
      return {
        success: false,
        error: 'Token Hugging Face manquant',
        provider: 'huggingface'
      };
    }

    try {
      const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.huggingFaceToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: prompt
        })
      });

      if (!response.ok) {
        throw new Error('Erreur de génération d\'image');
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      
      return {
        success: true,
        imageUrl: imageUrl,
        model: model,
        provider: 'huggingface'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        provider: 'huggingface'
      };
    }
  }

  // Chat avec Ollama
  async chatOllama(messages, model = this.defaultModel) {
    try {
      const prompt = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
      
      const response = await fetch(`${this.ollamaEndpoint}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model,
          prompt: prompt + '\nassistant:',
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error('Erreur de chat Ollama');
      }

      const data = await response.json();
      return {
        success: true,
        message: {
          role: 'assistant',
          content: data.response
        },
        model: model,
        provider: 'ollama'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        provider: 'ollama'
      };
    }
  }

  // Analyse de produit par IA
  async analyzeProduct(productData) {
    const analysisPrompt = `
    Analyse ce produit e-commerce et fournis des insights marketing:
    
    Nom: ${productData.title || productData.name}
    Prix: ${productData.price}
    Catégorie: ${productData.category}
    Description: ${productData.description || 'Non fournie'}
    
    Fournis:
    1. Suggestions d'amélioration de la description
    2. Mots-clés SEO recommandés
    3. Groupes cibles potentiels
    4. Stratégies de prix
    5. Recommandations de cross-selling
    `;

    // Essayer d'abord avec Ollama, puis Hugging Face en fallback
    let result = await this.generateTextOllama(analysisPrompt);
    
    if (!result.success) {
      result = await this.generateTextHuggingFace(analysisPrompt, 'gpt2');
    }

    return result;
  }

  // Génération de description produit
  async generateProductDescription(productData) {
    const prompt = `
    Génère une description marketing attrayante pour ce produit:
    
    Nom: ${productData.title || productData.name}
    Catégorie: ${productData.category}
    Prix: ${productData.price}
    Caractéristiques: ${productData.features?.join(', ') || 'Non spécifiées'}
    
    La description doit être:
    - Engageante et persuasive
    - Optimisée pour le SEO
    - Entre 100-200 mots
    - Mettant en avant les bénéfices client
    `;

    let result = await this.generateTextOllama(prompt);
    
    if (!result.success) {
      result = await this.generateTextHuggingFace(prompt, 'gpt2');
    }

    return result;
  }

  // Support client automatisé
  async customerSupport(question, context = {}) {
    const supportPrompt = `
    Tu es un assistant e-commerce pour Ecomus. Réponds à cette question client:
    
    Question: ${question}
    
    Contexte client:
    - Commandes récentes: ${context.recentOrders || 'Aucune'}
    - Statut: ${context.customerStatus || 'Client standard'}
    
    Fournis une réponse utile et professionnelle.
    `;

    let result = await this.chatOllama([
      { role: 'system', content: 'Tu es un assistant e-commerce professionnel.' },
      { role: 'user', content: supportPrompt }
    ]);
    
    if (!result.success) {
      result = await this.generateTextHuggingFace(supportPrompt, 'microsoft/DialoGPT-medium');
    }

    return result;
  }

  // Recommandations personnalisées
  async getPersonalizedRecommendations(userProfile, products) {
    const recommendationPrompt = `
    Basé sur ce profil utilisateur, recommande les meilleurs produits:
    
    Profil:
    - Achats précédents: ${userProfile.previousPurchases?.join(', ') || 'Aucun'}
    - Catégories préférées: ${userProfile.preferredCategories?.join(', ') || 'Non spécifiées'}
    - Budget moyen: ${userProfile.averageBudget || 'Non spécifié'}
    
    Produits disponibles: ${products.slice(0, 10).map(p => p.title).join(', ')}
    
    Fournis 3-5 recommandations avec explications.
    `;

    let result = await this.generateTextOllama(recommendationPrompt);
    
    if (!result.success) {
      result = await this.generateTextHuggingFace(recommendationPrompt, 'gpt2');
    }

    return result;
  }

  // Statut global des services IA
  async getAIStatus() {
    const [ollamaStatus, huggingFaceStatus] = await Promise.all([
      this.testOllamaConnection(),
      this.testHuggingFaceConnection()
    ]);

    return {
      ollama: ollamaStatus,
      huggingface: huggingFaceStatus,
      timestamp: new Date().toISOString()
    };
  }
}

// Instance par défaut
export const aiService = new AIService();

// Utilitaires pour les composants React
export const useAI = () => {
  return {
    generateText: (prompt, provider = 'ollama') => {
      if (provider === 'ollama') {
        return aiService.generateTextOllama(prompt);
      } else {
        return aiService.generateTextHuggingFace(prompt);
      }
    },
    generateImage: (prompt) => aiService.generateImageHuggingFace(prompt),
    chat: (messages) => aiService.chatOllama(messages),
    analyzeProduct: (product) => aiService.analyzeProduct(product),
    getStatus: () => aiService.getAIStatus()
  };
};

export default AIService;

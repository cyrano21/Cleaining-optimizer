// Configuration et utilitaires pour l'intégration Hugging Face
class HuggingFaceService {
  constructor() {
    this.apiKey = process.env.HUGGINGFACE_API_KEY;
    this.baseUrl = 'https://api-inference.huggingface.co/models';
    this.headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  // Génération de descriptions de produits
  async generateProductDescription(productName, category, features = []) {
    try {
      const prompt = `Créez une description de produit attrayante et professionnelle pour:
Nom du produit: ${productName}
Catégorie: ${category}
Caractéristiques: ${features.join(', ')}

La description doit être:
- Engageante et persuasive
- Optimisée pour le SEO
- Entre 100-200 mots
- En français
- Mettant en valeur les bénéfices client

Description:`;

      const response = await fetch(`${this.baseUrl}/microsoft/DialoGPT-large`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_length: 200,
            temperature: 0.7,
            do_sample: true
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur API Hugging Face: ${response.status}`);
      }

      const result = await response.json();
      return this.cleanGeneratedText(result[0]?.generated_text || '');
    } catch (error) {
      console.error('Erreur génération description:', error);
      return this.getFallbackDescription(productName, category);
    }
  }

  // Génération de tags/mots-clés
  async generateProductTags(productName, description, category) {
    try {
      const text = `${productName} ${description} ${category}`;
      
      const response = await fetch(`${this.baseUrl}/dbmdz/bert-large-cased-finetuned-conll03-english`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          inputs: text
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur API Hugging Face: ${response.status}`);
      }

      const result = await response.json();
      return this.extractTagsFromNER(result);
    } catch (error) {
      console.error('Erreur génération tags:', error);
      return this.getFallbackTags(category);
    }
  }

  // Analyse de sentiment des avis clients
  async analyzeSentiment(reviewText) {
    try {
      const response = await fetch(`${this.baseUrl}/cardiffnlp/twitter-roberta-base-sentiment-latest`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          inputs: reviewText
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur API Hugging Face: ${response.status}`);
      }

      const result = await response.json();
      return this.processSentimentResult(result);
    } catch (error) {
      console.error('Erreur analyse sentiment:', error);
      return { sentiment: 'neutral', confidence: 0.5 };
    }
  }

  // Recommandations de produits basées sur l'IA
  async generateRecommendations(userHistory, currentProduct, allProducts) {
    try {
      // Utiliser un modèle de similarité pour les recommandations
      const userPreferences = this.extractUserPreferences(userHistory);
      const productFeatures = this.extractProductFeatures(currentProduct);
      
      const similarities = allProducts.map(product => ({
        product,
        score: this.calculateSimilarity(productFeatures, this.extractProductFeatures(product))
      }));

      return similarities
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map(item => item.product);
    } catch (error) {
      console.error('Erreur génération recommandations:', error);
      return [];
    }
  }

  // Génération automatique de variantes de produits
  async generateProductVariants(baseProduct) {
    try {
      const prompt = `Générez des variantes créatives pour ce produit:
Nom: ${baseProduct.name}
Catégorie: ${baseProduct.category}
Description: ${baseProduct.description}

Générez 5 variantes avec des noms, couleurs, tailles ou styles différents:`;

      const response = await fetch(`${this.baseUrl}/gpt2`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_length: 150,
            temperature: 0.8
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur API Hugging Face: ${response.status}`);
      }

      const result = await response.json();
      return this.parseVariants(result[0]?.generated_text || '');
    } catch (error) {
      console.error('Erreur génération variantes:', error);
      return [];
    }
  }

  // Optimisation SEO automatique
  async optimizeSEO(productData) {
    try {
      const { name, description, category } = productData;
      
      // Générer titre SEO optimisé
      const seoTitle = await this.generateSEOTitle(name, category);
      
      // Générer meta description
      const metaDescription = await this.generateMetaDescription(description);
      
      // Générer mots-clés
      const keywords = await this.generateProductTags(name, description, category);
      
      return {
        seoTitle,
        metaDescription,
        keywords,
        slug: this.generateSEOSlug(name)
      };
    } catch (error) {
      console.error('Erreur optimisation SEO:', error);
      return null;
    }
  }

  // Méthodes utilitaires
  cleanGeneratedText(text) {
    return text
      .replace(/^.*Description:\s*/i, '')
      .trim()
      .substring(0, 500);
  }

  getFallbackDescription(productName, category) {
    return `Découvrez ${productName}, un produit de qualité dans la catégorie ${category}. Conçu pour répondre à vos besoins avec excellence et durabilité.`;
  }

  getFallbackTags(category) {
    const categoryTags = {
      'Mode': ['fashion', 'style', 'tendance', 'vêtement'],
      'Électronique': ['tech', 'électronique', 'gadget', 'innovation'],
      'Maison': ['décoration', 'maison', 'intérieur', 'confort'],
      'Sport': ['sport', 'fitness', 'activité', 'performance']
    };
    return categoryTags[category] || ['produit', 'qualité', 'nouveau'];
  }

  extractTagsFromNER(nerResult) {
    if (!Array.isArray(nerResult)) return [];
    
    return nerResult
      .filter(item => item.entity_group && item.score > 0.5)
      .map(item => item.word.toLowerCase())
      .slice(0, 10);
  }

  processSentimentResult(result) {
    if (!Array.isArray(result) || result.length === 0) {
      return { sentiment: 'neutral', confidence: 0.5 };
    }

    const topResult = result[0];
    const sentiment = topResult.label.toLowerCase().includes('positive') ? 'positive' :
                     topResult.label.toLowerCase().includes('negative') ? 'negative' : 'neutral';
    
    return {
      sentiment,
      confidence: topResult.score,
      raw: result
    };
  }

  extractUserPreferences(userHistory) {
    // Analyser l'historique utilisateur pour extraire les préférences
    const categories = {};
    const brands = {};
    const priceRanges = [];

    userHistory.forEach(item => {
      categories[item.category] = (categories[item.category] || 0) + 1;
      brands[item.brand] = (brands[item.brand] || 0) + 1;
      priceRanges.push(item.price);
    });

    return {
      preferredCategories: Object.keys(categories).sort((a, b) => categories[b] - categories[a]),
      preferredBrands: Object.keys(brands).sort((a, b) => brands[b] - brands[a]),
      averagePrice: priceRanges.reduce((a, b) => a + b, 0) / priceRanges.length
    };
  }

  extractProductFeatures(product) {
    return {
      category: product.category,
      price: product.price,
      tags: product.tags || [],
      brand: product.brand || '',
      rating: product.rating || 0
    };
  }

  calculateSimilarity(features1, features2) {
    let score = 0;
    
    // Similarité de catégorie
    if (features1.category === features2.category) score += 0.3;
    
    // Similarité de prix
    const priceDiff = Math.abs(features1.price - features2.price);
    const priceScore = Math.max(0, 1 - (priceDiff / Math.max(features1.price, features2.price)));
    score += priceScore * 0.2;
    
    // Similarité de tags
    const commonTags = features1.tags.filter(tag => features2.tags.includes(tag));
    const tagScore = commonTags.length / Math.max(features1.tags.length, features2.tags.length, 1);
    score += tagScore * 0.3;
    
    // Similarité de marque
    if (features1.brand === features2.brand && features1.brand) score += 0.2;
    
    return score;
  }

  parseVariants(generatedText) {
    // Parser le texte généré pour extraire les variantes
    const lines = generatedText.split('\n').filter(line => line.trim());
    return lines.slice(0, 5).map((line, index) => ({
      name: line.trim(),
      sku: `VAR-${index + 1}`,
      price: 0, // À définir
      attributes: {}
    }));
  }

  async generateSEOTitle(productName, category) {
    return `${productName} - ${category} de Qualité | Boutique en Ligne`;
  }

  async generateMetaDescription(description) {
    const cleaned = description.replace(/<[^>]*>/g, '').substring(0, 150);
    return `${cleaned}... Livraison rapide et retours gratuits.`;
  }

  generateSEOSlug(name) {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}

export default HuggingFaceService;


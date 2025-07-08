import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '../../../../lib/mongodb';
import Product from '../../../../models/Product';
import User from '../../../../models/User';
import { HfInference } from '@huggingface/inference';

// Configuration Hugging Face
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// Configuration pour Ollama (local)
const OLLAMA_BASE_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await connectDB();

    const { type, prompt, model, productId, options = {} } = await request.json();

    if (!type || !prompt) {
      return NextResponse.json(
        { error: 'Type et prompt requis' },
        { status: 400 }
      );
    }

    let result = {};

    switch (type) {
      case 'image':
        result = await generateImage(prompt, model, options);
        break;
      case 'description':
        result = await generateDescription(prompt, model, options);
        break;
      case 'product-analysis':
        result = await analyzeProduct(prompt, model, options);
        break;
      default:
        return NextResponse.json({ error: 'Type non supporté' }, { status: 400 });
    }

    // Enregistrer l'interaction IA
    await User.findByIdAndUpdate(session.user.id, {
      $inc: { 'aiInteractions.totalQueries': 1 },
      $set: { 'aiInteractions.lastInteraction': new Date() },
      $push: {
        'aiInteractions.chatHistory': {
          message: prompt,
          response: JSON.stringify(result),
          model: model || 'default',
          timestamp: new Date()
        }
      }
    });

    // Si un productId est fourni et que c'est une génération d'image, l'ajouter au produit
    if (productId && type === 'image' && result.imageUrl) {
      await Product.findByIdAndUpdate(productId, {
        $set: { 'aiGenerated.hasAiImages': true },
        $push: {
          'aiGenerated.aiPrompts': {
            prompt,
            model: model || 'huggingface',
            generatedImageUrl: result.imageUrl,
            generatedAt: new Date(),
            isUsed: false
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      result,
      type,
      model: model || 'default'
    });

  } catch (error) {
    console.error('Erreur génération IA:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération IA' },
      { status: 500 }
    );
  }
}

async function generateImage(prompt, model = 'huggingface', options = {}) {
  try {
    if (model === 'ollama') {
      // Utiliser Ollama pour la génération d'images (nécessite un modèle de diffusion)
      const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: options.ollamaModel || 'llava',
          prompt: `Generate an image: ${prompt}`,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error('Erreur Ollama API');
      }

      const data = await response.json();
      return {
        imageUrl: data.response || null,
        description: data.response,
        model: 'ollama'
      };
    } else {
      // Utiliser Hugging Face
      const imageBlob = await hf.textToImage({
        model: options.hfModel || 'stabilityai/stable-diffusion-2-1',
        inputs: prompt,
        parameters: {
          negative_prompt: 'low quality, blurry, distorted',
          num_inference_steps: options.steps || 20,
          guidance_scale: options.guidance || 7.5
        }
      });

      // Convertir le blob en base64 ou l'uploader vers Cloudinary
      const buffer = await imageBlob.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      const imageUrl = `data:image/png;base64,${base64}`;

      return {
        imageUrl,
        description: prompt,
        model: 'huggingface',
        size: buffer.byteLength
      };
    }
  } catch (error) {
    console.error('Erreur génération image:', error);
    throw new Error('Impossible de générer l\'image');
  }
}

async function generateDescription(prompt, model = 'ollama', options = {}) {
  try {
    if (model === 'ollama') {
      const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: options.ollamaModel || 'llama3.2',
          prompt: `Génère une description de produit e-commerce en français pour: ${prompt}`,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error('Erreur Ollama API');
      }

      const data = await response.json();
      return {
        text: data.response,
        model: 'ollama',
        language: 'fr'
      };
    } else {
      // Utiliser Hugging Face
      const response = await hf.textGeneration({
        model: options.hfModel || 'microsoft/DialoGPT-large',
        inputs: `Génère une description de produit e-commerce en français pour: ${prompt}`,
        parameters: {
          max_new_tokens: options.maxTokens || 200,
          temperature: options.temperature || 0.7,
          return_full_text: false
        }
      });

      return {
        text: response.generated_text,
        model: 'huggingface',
        language: 'fr'
      };
    }
  } catch (error) {
    console.error('Erreur génération description:', error);
    throw new Error('Impossible de générer la description');
  }
}

async function analyzeProduct(prompt, model = 'ollama', options = {}) {
  try {
    const analysisPrompt = `Analyse ce produit e-commerce et fournis des recommandations d'amélioration: ${prompt}`;

    if (model === 'ollama') {
      const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: options.ollamaModel || 'llama3.2',
          prompt: analysisPrompt,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error('Erreur Ollama API');
      }

      const data = await response.json();
      
      return {
        analysis: data.response,
        recommendations: extractRecommendations(data.response),
        model: 'ollama'
      };
    } else {
      const response = await hf.textGeneration({
        model: options.hfModel || 'microsoft/DialoGPT-large',
        inputs: analysisPrompt,
        parameters: {
          max_new_tokens: 300,
          temperature: 0.7
        }
      });

      return {
        analysis: response.generated_text,
        recommendations: extractRecommendations(response.generated_text),
        model: 'huggingface'
      };
    }
  } catch (error) {
    console.error('Erreur analyse produit:', error);
    throw new Error('Impossible d\'analyser le produit');
  }
}

function extractRecommendations(text) {
  // Extraire les recommandations du texte généré
  const recommendations = [];
  const lines = text.split('\n');
  
  lines.forEach(line => {
    if (line.includes('recommand') || line.includes('conseil') || line.includes('améliorer')) {
      recommendations.push(line.trim());
    }
  });

  return recommendations.length > 0 ? recommendations : ['Améliorer les images', 'Optimiser la description', 'Ajuster le prix'];
}

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '../../../lib/mongodb';
import User from '../../../models/User';
import Product from '../../../models/Product';

const OLLAMA_BASE_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    const { message, context = 'general', model = 'ollama' } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message requis' }, { status: 400 });
    }

    await connectDB();

    // Préparer le contexte selon le type de conversation
    let systemPrompt = '';
    let contextData = '';

    switch (context) {
      case 'product-help':
        systemPrompt = 'Tu es un assistant e-commerce spécialisé dans l\'aide aux produits. Réponds en français et aide les utilisateurs avec leurs questions sur les produits.';
        break;
      case 'customer-service':
        systemPrompt = 'Tu es un agent du service client pour une boutique e-commerce. Sois professionnel, aimable et résous les problèmes des clients en français.';
        break;
      case 'technical-support':
        systemPrompt = 'Tu es un support technique pour une plateforme e-commerce. Aide les utilisateurs avec les problèmes techniques en français.';
        break;
      default:
        systemPrompt = 'Tu es un assistant IA polyvalent pour une boutique e-commerce. Réponds en français et aide les utilisateurs avec leurs questions.';
    }

    // Si l'utilisateur est connecté, récupérer son historique
    let userHistory = [];
    if (session?.user?.id) {
      const user = await User.findById(session.user.id);
      userHistory = user?.aiInteractions?.chatHistory?.slice(-5) || [];
    }

    // Construire le prompt avec l'historique
    let fullPrompt = systemPrompt + '\n\n';
    
    if (userHistory.length > 0) {
      fullPrompt += 'Historique récent de la conversation:\n';
      userHistory.forEach(chat => {
        fullPrompt += `Utilisateur: ${chat.message}\nAssistant: ${chat.response}\n\n`;
      });
    }

    fullPrompt += `Utilisateur: ${message}\nAssistant: `;

    let response;

    if (model === 'ollama') {
      response = await chatWithOllama(fullPrompt, message);
    } else {
      response = await chatWithHuggingFace(fullPrompt, message);
    }

    // Enregistrer la conversation si l'utilisateur est connecté
    if (session?.user?.id) {
      await User.findByIdAndUpdate(session.user.id, {
        $inc: { 'aiInteractions.totalQueries': 1 },
        $set: { 'aiInteractions.lastInteraction': new Date() },
        $push: {
          'aiInteractions.chatHistory': {
            $each: [{
              message,
              response: response.text,
              model,
              timestamp: new Date()
            }],
            $slice: -20 // Garder seulement les 20 dernières conversations
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      response: response.text,
      model,
      context,
      timestamp: new Date().toISOString(),
      suggestions: response.suggestions || []
    });

  } catch (error) {
    console.error('Erreur chatbot:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la conversation' },
      { status: 500 }
    );
  }
}

async function chatWithOllama(prompt, userMessage) {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2',
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 500
        }
      })
    });

    if (!response.ok) {
      throw new Error('Erreur Ollama API');
    }

    const data = await response.json();
    
    return {
      text: data.response || 'Désolé, je n\'ai pas pu générer une réponse.',
      suggestions: generateSuggestions(userMessage)
    };
  } catch (error) {
    console.error('Erreur Ollama:', error);
    return {
      text: 'Désolé, le service IA local n\'est pas disponible actuellement. Veuillez réessayer plus tard.',
      suggestions: []
    };
  }
}

async function chatWithHuggingFace(prompt, userMessage) {
  try {
    // Utiliser l'API Hugging Face pour la génération de texte
    const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-large', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 200,
          temperature: 0.7,
          return_full_text: false
        }
      })
    });

    if (!response.ok) {
      throw new Error('Erreur Hugging Face API');
    }

    const data = await response.json();
    const generatedText = data[0]?.generated_text || 'Désolé, je n\'ai pas pu générer une réponse.';

    return {
      text: generatedText,
      suggestions: generateSuggestions(userMessage)
    };
  } catch (error) {
    console.error('Erreur Hugging Face:', error);
    return {
      text: 'Désolé, le service IA en ligne n\'est pas disponible actuellement.',
      suggestions: []
    };
  }
}

function generateSuggestions(userMessage) {
  const suggestions = [];
  const message = userMessage.toLowerCase();

  if (message.includes('produit') || message.includes('article')) {
    suggestions.push('Voir nos nouveautés');
    suggestions.push('Filtrer par catégorie');
    suggestions.push('Comparer les produits');
  }

  if (message.includes('commande') || message.includes('livraison')) {
    suggestions.push('Suivre ma commande');
    suggestions.push('Délais de livraison');
    suggestions.push('Retours et échanges');
  }

  if (message.includes('prix') || message.includes('coût')) {
    suggestions.push('Voir les promotions');
    suggestions.push('Moyens de paiement');
    suggestions.push('Codes de réduction');
  }

  if (suggestions.length === 0) {
    suggestions.push('Comment puis-je vous aider ?');
    suggestions.push('Voir nos produits populaires');
    suggestions.push('Contacter le support');
  }

  return suggestions.slice(0, 3);
}

// API pour récupérer l'historique de chat
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id).select('aiInteractions.chatHistory');
    
    return NextResponse.json({
      history: user?.aiInteractions?.chatHistory || [],
      totalQueries: user?.aiInteractions?.totalQueries || 0
    });

  } catch (error) {
    console.error('Erreur récupération historique:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'historique' },
      { status: 500 }
    );
  }
}

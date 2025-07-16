import { NextResponse } from 'next/server';

// Cette API route gère les requêtes à l'assistant IA en utilisant Hugging Face
export async function POST(request) {
  try {
    const { query, lessonContext, history } = await request.json();
    
    if (!query) {
      return NextResponse.json(
        { error: 'Une question est requise' }, 
        { status: 400 }
      );
    }
    
    // Appel à l'API Hugging Face avec la clé depuis les variables d'environnement
    const response = await getHuggingFaceResponse(query, lessonContext, history);
    
    return NextResponse.json({ response });
  } catch (error) {
    console.error('Erreur dans l\'API de l\'assistant IA:', error);
    return NextResponse.json(
      { error: 'Erreur lors du traitement de votre demande' }, 
      { status: 500 }
    );
  }
}

async function getHuggingFaceResponse(query, context, history) {
  try {
    // Récupérer la clé API Hugging Face depuis les variables d'environnement
    const API_KEY = process.env.HUGGINGFACE_KEY;
    
    if (!API_KEY) {
      throw new Error("Clé API Hugging Face non configurée");
    }
    
    // Construire le prompt avec le contexte de la leçon
    let prompt = "Tu es un assistant pédagogique spécialisé en développement web avec Next.js. ";
    
    // Ajouter le contexte de la leçon s'il est disponible
    if (context?.title) {
      prompt += `L'étudiant travaille actuellement sur une leçon intitulée "${context.title}" `;
      
      if (context.difficulty) {
        prompt += `de niveau ${context.difficulty}. `;
      }
      
      if (context.concepts && context.concepts.length > 0) {
        prompt += `Les concepts clés de cette leçon sont : ${context.concepts.join(', ')}. `;
      }
    }
    
    // Ajouter l'historique de conversation si disponible
    if (history && history.length > 0) {
      prompt += "\n\nConversation précédente :\n";
      history.forEach(msg => {
        prompt += `${msg.role === 'user' ? 'Étudiant' : 'Assistant'}: ${msg.content}\n`;
      });
    }
    
    // Ajouter la question actuelle
    prompt += `\nÉtudiant: ${query}\nAssistant:`;
    
    // Appel à l'API Hugging Face
    const response = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          top_p: 0.9,
          do_sample: true
        }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erreur API Hugging Face: ${JSON.stringify(errorData)}`);
    }
    
    const result = await response.json();
    
    // Extraire et formater la réponse
    let aiResponse = "";
    if (result && result[0] && result[0].generated_text) {
      // Extraire la partie de la réponse après "Assistant:"
      const fullText = result[0].generated_text;
      const assistantPrefix = "Assistant:";
      
      if (fullText.includes(assistantPrefix)) {
        aiResponse = fullText.split(assistantPrefix).pop().trim();
      } else {
        aiResponse = fullText.substring(prompt.length).trim();
      }
    } else {
      throw new Error("Format de réponse inattendu de l'API Hugging Face");
    }
    
    return aiResponse;
  } catch (error) {
    console.error("Erreur lors de l'appel à Hugging Face:", error);
    return "Désolé, je n'ai pas pu traiter votre demande. Veuillez réessayer ou contacter le support si le problème persiste.";
  }
}
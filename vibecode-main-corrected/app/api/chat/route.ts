import { type NextRequest, NextResponse } from "next/server"
import { HuggingFaceAI, HUGGINGFACE_MODELS } from "@/lib/huggingface-ai"
import { OllamaAI, OLLAMA_MODELS } from "@/lib/ollama-ai"
import { GeminiAI, GEMINI_MODELS } from "@/lib/gemini-ai"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

interface ChatRequest {
  messages: ChatMessage[]
  provider?: 'huggingface' | 'ollama' | 'gemini'
  model?: string
}

interface EnhancePromptRequest {
  prompt: string
  context?: {
    fileName?: string
    language?: string
    codeContent?: string
  }
}

function generateFallbackResponse(messages: ChatMessage[]): string {
  const lastMessage = messages[messages.length - 1]?.content || ""
  
  // Simple pattern-based responses
  if (lastMessage.toLowerCase().includes("hello") || lastMessage.toLowerCase().includes("hi")) {
    return "Hello! I'm here to help you with coding questions and development tasks. How can I assist you today?"
  }
  
  if (lastMessage.toLowerCase().includes("error") || lastMessage.toLowerCase().includes("bug")) {
    return "I'd be happy to help you debug that issue. Could you please share the specific error message and the relevant code?"
  }
  
  if (lastMessage.toLowerCase().includes("javascript") || lastMessage.toLowerCase().includes("js")) {
    return "I can help you with JavaScript! Whether it's syntax, best practices, or debugging, feel free to ask your specific question."
  }
  
  if (lastMessage.toLowerCase().includes("react") || lastMessage.toLowerCase().includes("next")) {
    return "Great! I can assist with React and Next.js development. What specific aspect would you like help with?"
  }
  
  // Default response
  return "I'm here to help with your coding questions! The AI service is currently slow, but I can still assist you. Could you please provide more details about what you're working on?"
}

async function generateAIResponse(messages: ChatMessage[], provider: 'huggingface' | 'ollama' | 'gemini' = 'ollama', model?: string) {
  const systemPrompt = `You are an expert AI coding assistant. You help developers with:
- Code explanations and debugging
- Best practices and architecture advice
- Writing clean, efficient code
- Troubleshooting errors
- Code reviews and optimizations

Always provide clear, practical answers. When showing code, use proper formatting with language-specific syntax.
Keep responses concise but comprehensive. Use code blocks with language specification when providing code examples.`

  const fullMessages = [{ role: "system", content: systemPrompt }, ...messages]

  try {
    let ai: HuggingFaceAI | OllamaAI | GeminiAI
    
    if (provider === 'ollama') {
      ai = new OllamaAI('http://localhost:11434', model || OLLAMA_MODELS.MISTRAL_LATEST)
    } else if (provider === 'gemini') {
      ai = new GeminiAI(model || GEMINI_MODELS.FLASH)
    } else {
      ai = new HuggingFaceAI(model || HUGGINGFACE_MODELS.CODE)
    }

    const response = await ai.generateResponse(fullMessages, {
      temperature: 0.7,
      maxTokens: 2048,
      top_p: 0.9
    })

    return response
  } catch (error) {
    const timestamp = new Date().toISOString()
    console.error(`\n🚨 [${timestamp}] ERREUR GÉNÉRATION IA (${provider}):`);
    console.error(`❌ Détails:`, error);
    console.error(`🤖 Modèle: ${model || 'default'}\n`);
    throw error
  }
}

async function enhancePrompt(request: EnhancePromptRequest) {
  const enhancementPrompt = `You are a prompt enhancement assistant. Take the user's basic prompt and enhance it to be more specific, detailed, and effective for a coding AI assistant.

Original prompt: "${request.prompt}"

Context: ${request.context ? JSON.stringify(request.context, null, 2) : "No additional context"}

Enhanced prompt should:
- Be more specific and detailed
- Include relevant technical context
- Ask for specific examples or explanations
- Be clear about expected output format
- Maintain the original intent

Return only the enhanced prompt, nothing else.`

  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "ArturBieniek/qwen3-coder:latest",
        prompt: enhancementPrompt,
        stream: false,
        options: {
          temperature: 0.3,
          max_tokens: 4096,
          num_predict: 4096,
          context_length: 8192,
          num_gpu: 1,
          num_thread: 8,
          use_mlock: true,
          use_mmap: true,
          num_batch: 1024,
        },
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to enhance prompt")
    }

    const data = await response.json()
    return data.response?.trim() || request.prompt
  } catch (error) {
    console.error("Prompt enhancement error:", error)
    return request.prompt // Return original if enhancement fails
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Handle prompt enhancement
    if (body.action === "enhance") {
      const enhancedPrompt = await enhancePrompt(body as EnhancePromptRequest)
      return NextResponse.json({ enhancedPrompt })
    }

    // Handle regular chat
    const { message, history, provider = 'ollama', model } = body

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required and must be a string" }, { status: 400 })
    }

    // Validate provider
    if (provider && !['huggingface', 'ollama', 'gemini'].includes(provider)) {
      return NextResponse.json({ error: "Invalid provider. Must be 'huggingface', 'ollama', or 'gemini'" }, { status: 400 })
    }

    const validHistory = Array.isArray(history)
      ? history.filter(
          (msg: unknown): msg is ChatMessage => {
            if (!msg || typeof msg !== "object" || msg === null) {
              return false;
            }
            const msgObj = msg as Record<string, unknown>;
            return (
              "role" in msgObj &&
              "content" in msgObj &&
              typeof msgObj.role === "string" &&
              typeof msgObj.content === "string" &&
              ["user", "assistant"].includes(msgObj.role)
            );
          }
        )
      : []

    const recentHistory = validHistory.slice(-10)
    const messages: ChatMessage[] = [...recentHistory, { role: "user", content: message }]

    let aiResponse: string
    
    try {
      aiResponse = await generateAIResponse(messages, provider, model)
      
      if (!aiResponse) {
        throw new Error("Empty response from AI model")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      
      // Log détaillé de l'erreur avec timestamp
      const timestamp = new Date().toISOString()
      console.error(`\n🚨 [${timestamp}] ERREUR API CHAT:`);
      console.error(`📋 Message d'erreur: ${errorMessage}`);
      console.error(`🔍 Type d'erreur: ${error instanceof Error ? error.constructor.name : 'Unknown'}`);
      
      // Fournir des messages d'erreur plus spécifiques et visibles
      if (errorMessage.includes("Ollama server is not available")) {
        console.error(`❌ PROBLÈME: Serveur Ollama non disponible`);
        console.error(`💡 SOLUTION: Démarrez Ollama avec 'ollama serve'`);
      } else if (errorMessage.includes("Request timeout")) {
        console.error(`⏱️ PROBLÈME: Timeout du modèle IA (60s dépassé)`);
        console.error(`💡 SOLUTION: Utilisez un modèle plus léger ou augmentez le timeout`);
        console.error(`🤖 MODÈLE ACTUEL: mistral:latest`);
      } else if (errorMessage.includes("AI model API error")) {
        console.error(`🔌 PROBLÈME: Erreur API du modèle IA`);
        console.error(`💡 SOLUTION: Vérifiez que le modèle 'mistral:latest' est disponible`);
      } else {
        console.error(`❓ ERREUR INCONNUE: ${errorMessage}`);
      }
      
      console.error(`🔄 Utilisation de la réponse de secours...\n`);
      
      aiResponse = generateFallbackResponse(messages)
    }

    return NextResponse.json({
      response: aiResponse,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    const timestamp = new Date().toISOString()
    console.error(`\n💥 [${timestamp}] ERREUR CRITIQUE API CHAT:`);
    console.error(`❌ Erreur non gérée dans la route:`, error);
    console.error(`📍 Endpoint: POST /api/chat`);
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    console.error(`📋 Message: ${errorMessage}`);
    console.error(`🔍 Stack trace:`, error instanceof Error ? error.stack : 'N/A');
    console.error(`🔄 Retour d'une erreur 500 au client\n`);
    
    return NextResponse.json(
      {
        error: "Failed to generate AI response",
        details: errorMessage,
        timestamp: timestamp,
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: "AI Chat API is running",
    timestamp: new Date().toISOString(),
    info: "Use POST method to send chat messages or enhance prompts",
  })
}

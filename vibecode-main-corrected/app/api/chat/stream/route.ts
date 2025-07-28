import { NextRequest } from 'next/server'
import { WebSocketServer } from 'ws'
import { HuggingFaceAI, HUGGINGFACE_MODELS } from '@/lib/huggingface-ai'
import { OllamaAI, OLLAMA_MODELS } from '@/lib/ollama-ai'
import { GeminiAI, GEMINI_MODELS } from '@/lib/gemini-ai'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface StreamRequest {
  messages: ChatMessage[]
  provider?: 'huggingface' | 'ollama' | 'gemini'
  model?: string
  sessionId?: string
}

interface WSMessage {
  type: 'chunk' | 'complete' | 'error' | 'start'
  content?: string
  error?: string
  sessionId?: string
  metadata?: {
    model?: string
    provider?: string
    tokens?: number
  }
}

// Global WebSocket server instance
let wss: WebSocketServer | null = null

// Initialize WebSocket server if not already created
function initializeWebSocketServer() {
  if (!wss) {
    wss = new WebSocketServer({ 
      port: 8080,
      path: '/api/chat/stream'
    })
    
    console.log('🚀 WebSocket server initialized on port 8080')
    
    wss.on('connection', (ws, req) => {
      console.log('📡 New WebSocket connection established')
      
      ws.on('message', async (data) => {
        try {
          const request: StreamRequest = JSON.parse(data.toString())
          await handleStreamingChat(ws, request)
        } catch (error) {
          console.error('❌ WebSocket message error:', error)
          ws.send(JSON.stringify({
            type: 'error',
            error: 'Invalid message format'
          } as WSMessage))
        }
      })
      
      ws.on('close', () => {
        console.log('📡 WebSocket connection closed')
      })
      
      ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error)
      })
    })
  }
  
  return wss
}

async function handleStreamingChat(ws: any, request: StreamRequest) {
  const { messages, provider = 'ollama', model, sessionId } = request
  
  try {
    // Send start message
    ws.send(JSON.stringify({
      type: 'start',
      sessionId,
      metadata: {
        provider,
        model: model || getDefaultModel(provider)
      }
    } as WSMessage))
    
    const systemPrompt = `You are an expert AI coding assistant. You help developers with:
- Code explanations and debugging
- Best practices and architecture advice
- Writing clean, efficient code
- Troubleshooting errors
- Code reviews and optimizations

Always provide clear, practical answers. When showing code, use proper formatting with language-specific syntax.
Keep responses concise but comprehensive. Use code blocks with language specification when providing code examples.`

    const fullMessages = [{ role: "system", content: systemPrompt }, ...messages]
    
    // Initialize AI provider
    let ai: HuggingFaceAI | OllamaAI | GeminiAI
    
    if (provider === 'ollama') {
      ai = new OllamaAI('http://localhost:11434', model || OLLAMA_MODELS.MISTRAL_LATEST)
    } else if (provider === 'gemini') {
      ai = new GeminiAI(model || GEMINI_MODELS.FLASH)
    } else {
      ai = new HuggingFaceAI(model || HUGGINGFACE_MODELS.CODE)
    }
    
    // Check if AI provider supports streaming
    if (typeof ai.generateStreamingResponse === 'function') {
      // Use streaming if available
      const stream = ai.generateStreamingResponse(fullMessages, {
        temperature: 0.7,
        maxTokens: 2048,
        top_p: 0.9
      })
      
      for await (const chunk of stream) {
        if (ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify({
            type: 'chunk',
            content: chunk,
            sessionId
          } as WSMessage))
        }
      }
    } else {
      // Fallback to regular response with simulated streaming
      const response = await ai.generateResponse(fullMessages, {
        temperature: 0.7,
        maxTokens: 2048,
        top_p: 0.9
      })
      
      // Simulate streaming by sending chunks
      const words = response.split(' ')
      const chunkSize = 3 // Send 3 words at a time
      
      for (let i = 0; i < words.length; i += chunkSize) {
        const chunk = words.slice(i, i + chunkSize).join(' ') + ' '
        
        if (ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify({
            type: 'chunk',
            content: chunk,
            sessionId
          } as WSMessage))
          
          // Add small delay to simulate real streaming
          await new Promise(resolve => setTimeout(resolve, 50))
        }
      }
    }
    
    // Send completion message
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({
        type: 'complete',
        sessionId,
        metadata: {
          provider,
          model: model || getDefaultModel(provider)
        }
      } as WSMessage))
    }
    
  } catch (error) {
    console.error('❌ Streaming chat error:', error)
    
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        sessionId
      } as WSMessage))
    }
  }
}

function getDefaultModel(provider: string): string {
  switch (provider) {
    case 'ollama':
      return OLLAMA_MODELS.MISTRAL_LATEST
    case 'gemini':
      return GEMINI_MODELS.FLASH
    case 'huggingface':
      return HUGGINGFACE_MODELS.CODE
    default:
      return OLLAMA_MODELS.MISTRAL_LATEST
  }
}

// HTTP endpoint for WebSocket upgrade
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const upgrade = request.headers.get('upgrade')
  
  if (upgrade !== 'websocket') {
    return new Response('WebSocket upgrade required', { status: 426 })
  }
  
  // Initialize WebSocket server
  initializeWebSocketServer()
  
  return new Response('WebSocket server ready', { 
    status: 200,
    headers: {
      'Content-Type': 'text/plain'
    }
  })
}

// Handle WebSocket upgrade
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // For non-WebSocket requests, provide fallback
    return new Response(JSON.stringify({
      message: 'Use WebSocket connection for streaming chat',
      websocketUrl: 'ws://localhost:8080/api/chat/stream'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Invalid request format'
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}

// Cleanup function
process.on('SIGTERM', () => {
  if (wss) {
    wss.close()
    console.log('🔌 WebSocket server closed')
  }
})

process.on('SIGINT', () => {
  if (wss) {
    wss.close()
    console.log('🔌 WebSocket server closed')
  }
})
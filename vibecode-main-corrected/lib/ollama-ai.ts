interface OllamaOptions {
  temperature?: number;
  top_p?: number;
  maxTokens?: number;
}

export class OllamaAI {
  private baseUrl: string
  private model: string

  constructor(baseUrl: string = 'http://localhost:11434', model: string = 'codellama:7b') {
    this.baseUrl = baseUrl
    this.model = model
  }

  async generateResponse(messages: Array<{ role: string; content: string }>, options: OllamaOptions = {}) {
    try {
      // Check if Ollama is available first
      const healthCheck = await this.checkHealth()
      if (!healthCheck) {
        throw new Error('Ollama server is not available. Please make sure Ollama is running on ' + this.baseUrl)
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 300000) // 5 minutes timeout

      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: this.model,
          prompt: messages.map(m => `${m.role}: ${m.content}`).join('\n'),
          stream: false,
          options: {
            temperature: options.temperature || 0.2,
            top_p: options.top_p || 0.9,
            max_tokens: options.maxTokens || 2048,
            num_predict: options.maxTokens || 2048,
            repeat_penalty: 1.1,
            context_length: 8192,
            num_gpu: 1, // Use GPU
            num_thread: 8, // RTX 3090 has many cores
            use_mlock: true,
            use_mmap: true,
            num_batch: 1024,
            // RTX 3090 specific optimizations
            gpu_layers: 35, // Use all layers on GPU
            main_gpu: 0, // Primary GPU
            tensor_split: [1.0], // Use single GPU
            rope_freq_base: 10000,
            rope_freq_scale: 1.0,
          },
        }),
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Ollama API error (${response.status}): ${errorText}`)
      }

      const data = await response.json()
      if (!data.response) {
        throw new Error('Invalid response from Ollama API')
      }
      
      return data.response.trim()
    } catch (error) {
      console.error('Ollama AI Error:', error)
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Ollama request timed out after 5 minutes')
        }
        throw new Error(`Ollama Error: ${error.message}`)
      }
      throw new Error('Unknown Ollama error occurred')
    }
  }

  async checkHealth() {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 seconds timeout for health check

      const response = await fetch(`${this.baseUrl}/api/tags`, {
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) return false
      
      const data = await response.json()
      return data.models && data.models.length > 0
    } catch (error) {
      console.warn('Ollama health check failed:', error)
      return false
    }
  }

  async listModels() {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`)
      if (!response.ok) return []
      
      const data = await response.json()
      return data.models || []
    } catch {
      return []
    }
  }

  async pullModel(modelName: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/pull`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: modelName,
        }),
      })

      return response.ok
    } catch {
      return false
    }
  }

  async fixError(error: string, code: string, language: string = 'typescript') {
    const fixPrompt = `Fix this ${language} error:

Error: ${error}

Code:
${code}

Provide the corrected code with explanation of what was wrong.`

    return await this.generateResponse([
      { role: 'user', content: fixPrompt }
    ], {
      temperature: 0.2,
      maxTokens: 1200
    })
  }
}

// RTX 3090 optimized models
export const OLLAMA_MODELS = {
  CODE: 'codellama:7b',
  CODE_LARGE: 'codellama:13b',
  CODE_HUGE: 'codellama:34b',
  MIXTRAL: 'mixtral:8x7b',
  LLAMA2: 'llama2:7b',
  LLAMA2_CHAT: 'llama2:13b-chat',
  MISTRAL: 'mistral:7b',
  PHIND: 'phind-codellama:34b-python',
  WIZARD: 'wizardcoder:34b-python',
  
  // Modèles installés localement
  QWEN3_CODER: 'ArturBieniek/qwen3-coder:latest',
  DEEPSEEK_R1_14B: 'deepseek-r1:14b',
  GEMMA3_27B: 'gemma3:27b',
  QWEN3_30B: 'qwen3:30b',
  DEEPSEEK_CODER_V2_16B: 'deepseek-coder-v2:16b',
  GLM_4_32B: 'aratan/GLM-4-32B-0414:latest',
  LLAMA3_1_8B: 'llama3.1:8b',
  STABLE_CODE_3B: 'stable-code:3b-code-q4_0',
  DEEPSEEK_CODER_33B: 'deepseek-coder:33b-instruct',
  QWEN2_5_CODER_1_5B: 'qwen2.5-coder:1.5b-base',
  REKA_FLASH_3: 'omercelik/reka-flash-3:latest',
  QWQ_EUREKA_35B: 'Qwen2.5-QwQ-35B-Eureka-Cubed-abliterated-uncensored-D_AU-Q6_k:latest',
  DEEPSEEK_R1_DISTILL_QWEN_32B: 'DeepSeek-R1-Distill-Qwen-32B-Q5_K_S:latest',
  QWQ: 'qwq:latest',
  QWEN2_5_14B: 'Qwen2.5-14B-Instruct-1M-Q8_0:latest',
  DEEPSEEK_R1_DISTILL_QWEN_14B: 'DeepSeek-R1-Distill-Qwen-14B-Q6_K_L:latest',
  DEEPSEEK_R1_DISTILL_QWEN_14B_UNCENSORED: 'DeepSeek-R1-Distill-Qwen-14B-Uncensored.Q8_0:latest',
  WAN2_1_T2V_14B: 'wan2.1-t2v-14b-Q8_0:latest',
  LLAMA3_2_11B_VISION: 'Llama-3.2-11B-Vision-Instruct.Q8_0:latest',
  OPENTHINKER_32B: 'openthinker:32b',
  DEEPSEEK_R1_GOOSE: 'michaelneale/deepseek-r1-goose:latest',
  MISTRAL_LATEST: 'mistral:latest',
  LLAMA3_2_VISION: 'llama3.2-vision:latest',
  LLAVA: 'llava:latest'
} as const

export const RTX_3090_CONFIG = {
  gpuMemory: 24, // GB
  maxContext: 8192,
  recommendedModels: [
    'codellama:7b',
    'codellama:13b',
    'mistral:7b',
    'mixtral:8x7b',
  ],
  gpuLayers: {
    'codellama:7b': 35,
    'codellama:13b': 40,
    'mistral:7b': 32,
    'mixtral:8x7b': 45,
  }
}

export const createOllamaAI = (model?: string) => {
  return new OllamaAI('http://localhost:11434', model || OLLAMA_MODELS.CODE)
}

import { GoogleGenerativeAI } from '@google/generative-ai'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY
const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash'

interface GenerationOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  stopSequences?: string[];
}

interface ProjectFile {
  name: string;
  type: 'file';
}

interface ProjectFolder {
  name: string;
  type: 'folder';
  children: (ProjectFile | ProjectFolder)[];
}

interface RecentChange {
  file: string;
  change: string;
}

interface AgentContext {
  currentFile?: string;
  projectStructure?: ProjectFolder;
  recentChanges?: RecentChange[];
}

export class GeminiAI {
  private genAI: GoogleGenerativeAI
  private model: string

  constructor(model: string = DEFAULT_MODEL) {
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is required. Please set it in your environment variables.')
    }
    this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
    this.model = model
  }

  async generateResponse(messages: Array<{ role: string; content: string }>, options: GenerationOptions = {}) {
    try {
      const model = this.genAI.getGenerativeModel({ model: this.model })
      
      // Convert messages to Gemini format
      const conversation = messages.map(msg => {
        if (msg.role === 'system') {
          return { role: 'user', parts: [{ text: `System: ${msg.content}` }] }
        }
        return {
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        }
      })

      const generationConfig = {
        temperature: options.temperature || 0.7,
        topP: options.topP || 0.8,
        topK: options.topK || 40,
        maxOutputTokens: options.maxTokens || 2048,
        stopSequences: options.stopSequences || [],
      }

      const chat = model.startChat({
        generationConfig,
        history: conversation.slice(0, -1), // All messages except the last one
      })

      const lastMessage = conversation[conversation.length - 1]
      const result = await chat.sendMessage(lastMessage.parts[0].text)
      const response = await result.response
      
      return response.text()
    } catch (error) {
      console.error('Gemini AI Error:', error)
      throw error
    }
  }

  async generateCode(prompt: string, language: string = 'typescript', context?: string) {
    const codePrompt = `Generate ${language} code for the following request:
${prompt}

${context ? `Context: ${context}` : ''}

Please provide only the code without explanations.`
    
    return this.generateResponse([{ role: 'user', content: codePrompt }])
  }

  async reviewCode(code: string, language: string = 'typescript') {
    const reviewPrompt = `Review this ${language} code and provide suggestions for improvement:

\`\`\`${language}
${code}
\`\`\`

Please provide:
1. Code quality assessment
2. Potential bugs or issues
3. Performance improvements
4. Best practices recommendations`
    
    return this.generateResponse([{ role: 'user', content: reviewPrompt }])
  }

  async fixError(error: string, code: string, language: string = 'typescript') {
    const fixPrompt = `Fix this ${language} code error:

Error: ${error}

Code:
\`\`\`${language}
${code}
\`\`\`

Please provide the corrected code with explanations.`
    
    return this.generateResponse([{ role: 'user', content: fixPrompt }])
  }

  async suggestArchitecture(description: string) {
    const architecturePrompt = `Based on this project description, suggest a software architecture:

${description}

Please provide:
1. Recommended tech stack
2. Project structure
3. Key components and their responsibilities
4. Data flow and API design
5. Best practices for scalability`
    
    return this.generateResponse([{ role: 'user', content: architecturePrompt }])
  }

  async createAgentAction(prompt: string, context: AgentContext) {
    const agentPrompt = `As a coding assistant, analyze this request and provide actionable steps:

Request: ${prompt}

Context:
${context.currentFile ? `Current file: ${context.currentFile}` : ''}
${context.recentChanges ? `Recent changes: ${JSON.stringify(context.recentChanges)}` : ''}

Provide a structured response with specific actions to take.`
    
    return this.generateResponse([{ role: 'user', content: agentPrompt }])
  }

  async checkHealth(): Promise<boolean> {
    try {
      const model = this.genAI.getGenerativeModel({ model: this.model })
      const result = await model.generateContent('Hello')
      return !!result.response.text()
    } catch (error) {
      console.error('Gemini health check failed:', error)
      return false
    }
  }
}

// Available Gemini models
export const GEMINI_MODELS = {
  FLASH: 'gemini-1.5-flash',
  FLASH_8B: 'gemini-1.5-flash-8b',
  PRO: 'gemini-1.5-pro',
  PRO_002: 'gemini-1.5-pro-002',
  FLASH_002: 'gemini-1.5-flash-002',
  FLASH_EXP: 'gemini-1.5-flash-exp-0827',
  PRO_EXP: 'gemini-1.5-pro-exp-0827',
  GEMINI_2_FLASH_EXP: 'gemini-2.0-flash-exp'
} as const

export const createGeminiAI = (model?: string) => {
  return new GeminiAI(model || GEMINI_MODELS.FLASH)
}

// Configuration for different use cases
export const GEMINI_CONFIG = {
  CODE_GENERATION: {
    model: GEMINI_MODELS.FLASH,
    temperature: 0.2,
    maxTokens: 4096,
    topP: 0.8
  },
  CHAT: {
    model: GEMINI_MODELS.FLASH,
    temperature: 0.7,
    maxTokens: 2048,
    topP: 0.9
  },
  CODE_REVIEW: {
    model: GEMINI_MODELS.PRO,
    temperature: 0.3,
    maxTokens: 3072,
    topP: 0.8
  },
  ARCHITECTURE: {
    model: GEMINI_MODELS.PRO,
    temperature: 0.5,
    maxTokens: 4096,
    topP: 0.9
  }
}
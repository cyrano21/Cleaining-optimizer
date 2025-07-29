import { HfInference } from '@huggingface/inference'
import { KIMI_AGENT_CONFIG } from './kimi-agent-config'

const HF_TOKEN = process.env.HUGGINGFACE_API_TOKEN || process.env.NEXT_PUBLIC_HUGGINGFACE_API_TOKEN
const KIMI_MODEL = process.env.DEFAULT_AI_MODEL || 'distilgpt2'

interface GenerationOptions {
  temperature?: number;
  maxTokens?: number;
  top_p?: number;
  parameters?: Record<string, unknown>;
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

export class HuggingFaceAI {
  private hf: HfInference
  private model: string

  constructor(model: string = KIMI_MODEL) {
    this.hf = new HfInference(HF_TOKEN)
    this.model = model
  }

  async generateResponse(messages: Array<{ role: string; content: string }>, options: GenerationOptions = {}) {
    try {
      const systemPrompt = KIMI_AGENT_CONFIG.systemPrompt

      const conversation = [
        { role: 'system', content: systemPrompt },
        ...messages
      ]

      // Calculate estimated cost
      const estimatedInputTokens = conversation.reduce((acc, msg) => acc + msg.content.length / 4, 0)
      const estimatedOutputTokens = options.maxTokens || KIMI_AGENT_CONFIG.defaultSettings.maxTokens
      
      // Check budget
      const dailyBudget = parseFloat(process.env.KIMI_DAILY_BUDGET_CNY || '10.0')
      if (KIMI_AGENT_CONFIG.costCalculator.estimateCost(estimatedInputTokens, estimatedOutputTokens) >= dailyBudget) {
        return '[BUDGET_EXCEEDED]'
      }

      const response = await this.hf.textGeneration({
        model: this.model,
        inputs: conversation.map(m => `${m.role}: ${m.content}`).join('\n') + '\nassistant:',
        parameters: {
          max_new_tokens: options.maxTokens || KIMI_AGENT_CONFIG.defaultSettings.maxTokens,
          temperature: options.temperature || KIMI_AGENT_CONFIG.defaultSettings.temperature,
          top_p: options.top_p || KIMI_AGENT_CONFIG.defaultSettings.topP,
          return_full_text: false,
          ...options.parameters
        }
      })

      // Log usage
      const actualInputTokens = estimatedInputTokens
      const actualOutputTokens = response.generated_text.length / 4
      const actualCost = KIMI_AGENT_CONFIG.costCalculator.estimateCost(
        actualInputTokens,
        actualOutputTokens
      )
      
      // Log to console (in real implementation, append to file)
      console.log('[KIMI_USAGE]', `${new Date().toISOString()},${actualInputTokens},${actualOutputTokens},${actualCost.toFixed(4)}`)

      return response.generated_text.trim()
    } catch (error) {
      console.error('HuggingFace AI Error:', error)
      throw error
    }
  }

  async generateCode(prompt: string, language: string = 'typescript', context?: string) {
    const codePrompt = `Generate ${language} code for: ${prompt}
${context ? `\nContext: ${context}` : ''}

Provide complete, working code with proper formatting and comments.`
    
    const response = await this.generateResponse([
      { role: 'user', content: codePrompt }
    ], {
      temperature: 0.3,
      maxTokens: 1500
    })

    return response
  }

  async reviewCode(code: string, language: string = 'typescript') {
    const reviewPrompt = `Review this ${language} code and provide suggestions:

${code}

Please provide:
1. Code quality assessment
2. Potential bugs or issues
3. Performance improvements
4. Best practices suggestions
5. Refactoring recommendations`

    return await this.generateResponse([
      { role: 'user', content: reviewPrompt }
    ], {
      temperature: 0.4,
      maxTokens: 1000
    })
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

  async suggestArchitecture(description: string) {
    const archPrompt = `Suggest a software architecture for: ${description}

Consider:
- Scalability
- Maintainability
- Performance
- Security
- Best practices

Provide specific file structure, technologies, and implementation approach.`

    return await this.generateResponse([
      { role: 'user', content: archPrompt }
    ], {
      temperature: 0.5,
      maxTokens: 1500
    })
  }

  async createAgentAction(prompt: string, context: AgentContext) {
    const agentPrompt = `As a coding agent, analyze this request:

Request: ${prompt}
Context: ${JSON.stringify(context, null, 2)}

Determine what actions to take:
1. Create new files
2. Modify existing files
3. Run commands
4. Install dependencies
5. Set up configuration

Provide specific, actionable steps with exact file paths and commands.`

    return await this.generateResponse([
      { role: 'user', content: agentPrompt }
    ], {
      temperature: 0.3,
      maxTokens: 2000
    })
  }

  async *generateStreamingResponse(messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>, options: {
    temperature?: number;
    maxTokens?: number;
    top_p?: number;
  } = {}): AsyncIterable<string> {
    try {
      const systemPrompt = KIMI_AGENT_CONFIG.systemPrompt

      const conversation = [
        { role: 'system', content: systemPrompt },
        ...messages
      ]

      // Calculate estimated cost
      const estimatedInputTokens = conversation.reduce((acc, msg) => acc + msg.content.length / 4, 0)
      const estimatedOutputTokens = options.maxTokens || KIMI_AGENT_CONFIG.defaultSettings.maxTokens
      
      // Check budget
      const dailyBudget = parseFloat(process.env.KIMI_DAILY_BUDGET_CNY || '10.0')
      if (KIMI_AGENT_CONFIG.costCalculator.estimateCost(estimatedInputTokens, estimatedOutputTokens) >= dailyBudget) {
        yield '[BUDGET_EXCEEDED]'
        return
      }

      // For HuggingFace, we'll simulate streaming by returning the full response at once
      // since the API doesn't support true streaming
      const response = await this.hf.textGeneration({
        model: this.model,
        inputs: conversation.map(m => `${m.role}: ${m.content}`).join('\n') + '\nassistant:',
        parameters: {
          max_new_tokens: options.maxTokens || KIMI_AGENT_CONFIG.defaultSettings.maxTokens,
          temperature: options.temperature || KIMI_AGENT_CONFIG.defaultSettings.temperature,
          top_p: options.top_p || KIMI_AGENT_CONFIG.defaultSettings.topP,
          return_full_text: false,
        }
      })

      // Log usage
      const actualInputTokens = estimatedInputTokens
      const actualOutputTokens = response.generated_text.length / 4
      const actualCost = KIMI_AGENT_CONFIG.costCalculator.estimateCost(
        actualInputTokens,
        actualOutputTokens
      )
      
      // Log to console (in real implementation, append to file)
      console.log('[KIMI_USAGE]', `${new Date().toISOString()},${actualInputTokens},${actualOutputTokens},${actualCost.toFixed(4)}`)

      // Return the full response as a single chunk
      yield response.generated_text.trim()
    } catch (error) {
      console.error('HuggingFace AI Streaming Error:', error)
      throw error
    }
  }
}

// Available models
export const HUGGINGFACE_MODELS = {
  CODE: 'distilgpt2',
  CODE_SMALL: 'distilgpt2',
  CODE_LARGE: 'gpt2-medium',
  CODEGEN: 'distilgpt2',
  CODEBERT: 'distilgpt2',
  GPT2: 'gpt2',
  GPT2_MEDIUM: 'gpt2-medium',
  GPT2_LARGE: 'gpt2-large',
  DISTILGPT2: 'distilgpt2',
  KIMIK2: 'distilgpt2', // Using distilgpt2 as simple alternative
  STARCODER: 'distilgpt2',
  CODELLAMA: 'distilgpt2'
}

export const createHuggingFaceAI = (model?: string) => {
  return new HuggingFaceAI(model || HUGGINGFACE_MODELS.CODE)
}

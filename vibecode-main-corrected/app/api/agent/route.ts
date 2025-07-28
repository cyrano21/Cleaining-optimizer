import { NextRequest, NextResponse } from "next/server"
import { HuggingFaceAI, HUGGINGFACE_MODELS } from "@/lib/huggingface-ai"
import { OllamaAI, OLLAMA_MODELS } from "@/lib/ollama-ai"
import { GeminiAI, GEMINI_MODELS } from "@/lib/gemini-ai"
import { currentUser } from "@/features/auth/actions"

interface AgentAction {
  type: "create_file" | "modify_file" | "delete_file" | "run_command" | "install_dependency" | "create_folder"
  filePath?: string
  content?: string
  command?: string
  dependency?: string
  folderPath?: string
  description: string
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

interface AgentRequest {
  prompt: string;
  context?: {
    currentFile?: string;
    projectStructure?: ProjectFolder;
    recentChanges?: RecentChange[];
  };
  model?: string;
  provider?: 'huggingface' | 'ollama' | 'gemini';
}

interface AgentResponse {
  actions: AgentAction[]
  explanation: string
  warnings?: string[]
  suggestions?: string[]
}

class ClineAgent {
  private ai: HuggingFaceAI | OllamaAI | GeminiAI
  private provider: 'huggingface' | 'ollama' | 'gemini'

  constructor(model?: string, provider: 'huggingface' | 'ollama' | 'gemini' = 'huggingface') {
    this.provider = provider
    
    if (provider === 'ollama') {
      this.ai = new OllamaAI('http://localhost:11434', model || OLLAMA_MODELS.CODE)
    } else if (provider === 'gemini') {
      this.ai = new GeminiAI(model || GEMINI_MODELS.FLASH)
    } else {
      this.ai = new HuggingFaceAI(model || HUGGINGFACE_MODELS.CODE)
    }
  }

  async processRequest(request: AgentRequest): Promise<AgentResponse> {
    const systemPrompt = `You are Cline, an expert AI coding agent. You analyze requests and provide specific, actionable steps to accomplish coding tasks.

Your capabilities:
- Create new files with complete, working code
- Modify existing files with precise changes
- Run commands and install dependencies
- Create project structures and folders
- Debug and fix errors
- Optimize and refactor code
- Write tests and documentation

Always provide:
1. Specific file paths and exact content
2. Complete commands to run
3. Clear explanations for each action
4. Warnings about potential issues
5. Alternative approaches when relevant

Format your response as JSON with:
{
  "actions": [...],
  "explanation": "...",
  "warnings": [...],
  "suggestions": [...]
}`

    const agentPrompt = `Analyze this request and provide specific actions:

Request: ${request.prompt}

Context: ${JSON.stringify(request.context || {}, null, 2)}

Provide a complete plan with exact file paths, commands, and code.`

    try {
      const response = await this.ai.generateResponse([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: agentPrompt }
      ], {
        temperature: 0.2,
        maxTokens: 3000
      })

      // Parse the AI response into structured actions
      return this.parseAgentResponse(response)
    } catch (error) {
      console.error('Agent processing error:', error)
      return this.createFallbackResponse(request.prompt)
    }
  }

  private parseAgentResponse(response: string): AgentResponse {
    try {
      // Try to parse JSON response
      const parsed = JSON.parse(response)
      return {
        actions: parsed.actions || [],
        explanation: parsed.explanation || response,
        warnings: parsed.warnings || [],
        suggestions: parsed.suggestions || []
      }
    } catch {
      // Fallback to text parsing
      return this.parseTextResponse(response)
    }
  }

  private parseTextResponse(response: string): AgentResponse {
    const lines = response.split('\n')
    const actions: AgentAction[] = []
    const warnings: string[] = []
    const suggestions: string[] = []

    // Simple parsing for common patterns
    lines.forEach(line => {
      line = line.trim()
      
      // Create file
      if (line.includes('create file') || line.includes('Create file')) {
        const fileMatch = line.match(/(?:create|Create) file ['"]([^'"]+)['"]/)
        if (fileMatch) {
          actions.push({
            type: 'create_file',
            filePath: fileMatch[1],
            description: `Create file: ${fileMatch[1]}`
          })
        }
      }

      // Modify file
      if (line.includes('modify file') || line.includes('update file')) {
        const fileMatch = line.match(/(?:modify|update) file ['"]([^'"]+)['"]/)
        if (fileMatch) {
          actions.push({
            type: 'modify_file',
            filePath: fileMatch[1],
            description: `Modify file: ${fileMatch[1]}`
          })
        }
      }

      // Run command
      if (line.includes('run command') || line.includes('execute')) {
        const cmdMatch = line.match(/(?:run|execute) ['"]([^'"]+)['"]/)
        if (cmdMatch) {
          actions.push({
            type: 'run_command',
            command: cmdMatch[1],
            description: `Run command: ${cmdMatch[1]}`
          })
        }
      }

      // Install dependency
      if (line.includes('install') && line.includes('npm')) {
        const depMatch = line.match(/npm install ([\w-@/]+)/)
        if (depMatch) {
          actions.push({
            type: 'install_dependency',
            dependency: depMatch[1],
            description: `Install dependency: ${depMatch[1]}`
          })
        }
      }

      // Warnings
      if (line.toLowerCase().includes('warning') || line.toLowerCase().includes('caution')) {
        warnings.push(line)
      }

      // Suggestions
      if (line.toLowerCase().includes('suggestion') || line.toLowerCase().includes('consider')) {
        suggestions.push(line)
      }
    })

    return {
      actions,
      explanation: response,
      warnings,
      suggestions
    }
  }

  private createFallbackResponse(prompt: string): AgentResponse {
    return {
      actions: [
        {
          type: 'create_file',
          filePath: 'agent-response.md',
          content: `# Agent Response\n\n## Request\n${prompt}\n\n## Analysis\nThe AI agent is processing your request. Please check the detailed explanation above.`,
          description: 'Create agent response file'
        }
      ],
      explanation: `Processing your request: ${prompt}`,
      warnings: ['AI response parsing failed, using fallback'],
      suggestions: ['Try rephrasing your request for better results']
    }
  }
}

// API Routes
export async function POST(req: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    const body: AgentRequest = await req.json()
    
    if (!body.prompt || typeof body.prompt !== 'string') {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    const agent = new ClineAgent(body.model, body.provider || 'huggingface')
    const response = await agent.processRequest(body)

    // Log agent actions for debugging
    console.log('Agent actions:', response.actions)

    return NextResponse.json({
      ...response,
      timestamp: new Date().toISOString(),
      userId: user.id
    })
  } catch (error) {
    console.error('Agent API error:', error)
    return NextResponse.json(
      { 
        error: "Failed to process agent request", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: "Cline Agent API is running",
    timestamp: new Date().toISOString(),
    endpoints: {
      POST: "/api/agent - Send agent requests"
    },
    providers: {
      huggingface: {
        models: Object.keys(HUGGINGFACE_MODELS)
      },
      ollama: {
        models: Object.keys(OLLAMA_MODELS),
        baseUrl: "http://localhost:11434"
      }
    },
    capabilities: [
      "Create files and folders",
      "Modify existing files",
      "Run commands",
      "Install dependencies",
      "Code generation",
      "Error fixing",
      "Architecture suggestions"
    ]
  })
}

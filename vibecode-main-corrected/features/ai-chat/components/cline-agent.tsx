"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Send, FileCode, Terminal, Package, FolderPlus, CheckCircle } from "lucide-react"
import { toast } from "sonner"

interface AgentAction {
  type: "create_file" | "modify_file" | "delete_file" | "run_command" | "install_dependency" | "create_folder"
  filePath?: string
  content?: string
  command?: string
  dependency?: string
  folderPath?: string
  description: string
  status?: "pending" | "executing" | "completed" | "failed"
}

interface AgentMessage {
  id: string
  type: "user" | "agent"
  content: string
  actions?: AgentAction[]
  timestamp: Date
}

interface ClineAgentProps {
  currentFile?: string
  projectStructure?: Record<string, unknown>
}

export function ClineAgent({ currentFile, projectStructure }: ClineAgentProps) {
  
  const [messages, setMessages] = useState<AgentMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [executingActions, setExecutingActions] = useState<Set<string>>(new Set())
  const [provider, setProvider] = useState<'huggingface' | 'ollama'>('ollama')
  const [model, setModel] = useState('ArturBieniek/qwen3-coder:latest')
  const [mode, setMode] = useState<'manual' | 'auto'>('manual')
  const [agentMode, setAgentMode] = useState<'chat' | 'agent'>('agent')
  const [autoApprove, setAutoApprove] = useState(false)
  const [syncMode, setSyncMode] = useState(false)
  // Available models for future use
  // const [availableModels, setAvailableModels] = useState<string[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    console.log("🤖 ClineAgent Component Debug:");
    console.log("- Component mounted:", true);
    console.log("- currentFile:", currentFile);
    console.log("- projectStructure:", projectStructure);
    console.log("- provider:", provider);
    console.log("- model:", model);
    console.log("- mode:", mode);
    console.log("- agentMode:", agentMode);
    console.log("- messages count:", messages.length);
  }, [currentFile, projectStructure, provider, model, mode, agentMode, messages.length]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    console.log("📤 Sending message to Cline Agent:", input);

    const userMessage: AgentMessage = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: input,
          provider,
          model,
          context: {
            currentFile,
            projectStructure,
            recentChanges: messages.slice(-5)
          }
        })
      })

      if (!response.ok) {
        throw new Error("Failed to get agent response")
      }

      const data = await response.json()
      
      const agentMessage: AgentMessage = {
        id: (Date.now() + 1).toString(),
        type: "agent",
        content: data.explanation,
        actions: data.actions || [],
        timestamp: new Date()
      }

      setMessages(prev => [...prev, agentMessage])
    } catch (err) {
      console.error('Agent communication error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      toast.error(`Failed to communicate with agent: ${errorMessage}`)
      
      // Add error message to chat
      const errorAgentMessage: AgentMessage = {
        id: Date.now().toString(),
        type: 'agent',
        content: `Sorry, I encountered an error while processing your request: ${errorMessage}. Please try again or check your configuration.`,
        timestamp: new Date(),
        actions: []
      }
      setMessages(prev => [...prev, errorAgentMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const executeAction = async (action: AgentAction, messageId: string) => {
    const actionId = `${messageId}-${action.type}-${action.filePath || action.command || action.dependency}`
    
    if (executingActions.has(actionId)) return

    setExecutingActions(prev => new Set(prev).add(actionId))
    
    try {
      // Simulate action execution (in real implementation, this would call backend APIs)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success(`Action completed: ${action.description}`)
      
      // Update action status
      setMessages(prev => prev.map(msg => {
        if (msg.id === messageId && msg.actions) {
          return {
            ...msg,
            actions: msg.actions.map(a => 
              a === action ? { ...a, status: "completed" } : a
            )
          }
        }
        return msg
      }))
      
    } catch (err) {
      console.error('Action execution error:', err)
      toast.error(`Failed to execute: ${action.description}`)
      
      setMessages(prev => prev.map(msg => {
        if (msg.id === messageId && msg.actions) {
          return {
            ...msg,
            actions: msg.actions.map(a => 
              a === action ? { ...a, status: "failed" } : a
            )
          }
        }
        return msg
      }))
    } finally {
      setExecutingActions(prev => {
        const newSet = new Set(prev)
        newSet.delete(actionId)
        return newSet
      })
    }
  }

  const getActionIcon = (type: AgentAction['type']) => {
    switch (type) {
      case 'create_file':
      case 'modify_file':
        return <FileCode className="h-4 w-4" />
      case 'run_command':
        return <Terminal className="h-4 w-4" />
      case 'install_dependency':
        return <Package className="h-4 w-4" />
      case 'create_folder':
        return <FolderPlus className="h-4 w-4" />
      default:
        return <FileCode className="h-4 w-4" />
    }
  }

  const getActionColor = (type: AgentAction['type']) => {
    switch (type) {
      case 'create_file':
        return 'bg-green-100 text-green-800'
      case 'modify_file':
        return 'bg-blue-100 text-blue-800'
      case 'delete_file':
        return 'bg-red-100 text-red-800'
      case 'run_command':
        return 'bg-purple-100 text-purple-800'
      case 'install_dependency':
        return 'bg-orange-100 text-orange-800'
      case 'create_folder':
        return 'bg-indigo-100 text-indigo-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="flex flex-col h-full">
      <Card className="flex-1 flex flex-col bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-3 border-b border-zinc-800">
          <CardTitle className="text-lg flex items-center gap-2 text-zinc-100">
            <Terminal className="h-5 w-5 text-zinc-400" />
            Cline AI Agent
          </CardTitle>
          <p className="text-sm text-zinc-400">
            Ask me to create, modify, or analyze your code
          </p>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0 bg-zinc-900">
          <div className="p-4 border-b border-zinc-800 bg-zinc-900">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium mb-1 block text-zinc-200">Mode</label>
                <Select value={mode} onValueChange={(value: 'manual' | 'auto') => setMode(value)}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="auto">Auto (AI chooses)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block text-zinc-200">Agent Mode</label>
                <Select value={agentMode} onValueChange={(value: 'chat' | 'agent') => setAgentMode(value)}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chat">Chat (read-only)</SelectItem>
                    <SelectItem value="agent">Agent (execute actions)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {mode === 'manual' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block text-zinc-200">Provider</label>
                  <Select value={provider} onValueChange={(value: 'huggingface' | 'ollama' | 'gemini') => setProvider(value)}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="huggingface">HuggingFace</SelectItem>
                      <SelectItem value="ollama">Ollama</SelectItem>
                      <SelectItem value="gemini">Gemini</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block text-zinc-200">Model</label>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {provider === 'ollama' ? (
                        <>
                          <SelectItem value="ArturBieniek/qwen3-coder:latest">Qwen3 Coder</SelectItem>
                          <SelectItem value="deepseek-r1:14b">DeepSeek R1 14B</SelectItem>
                          <SelectItem value="gemma3:27b">Gemma3 27B</SelectItem>
                          <SelectItem value="qwen3:30b">Qwen3 30B</SelectItem>
                          <SelectItem value="deepseek-coder-v2:16b">DeepSeek Coder V2 16B</SelectItem>
                          <SelectItem value="aratan/GLM-4-32B-0414:latest">GLM-4 32B</SelectItem>
                          <SelectItem value="llama3.1:8b">Llama3.1 8B</SelectItem>
                          <SelectItem value="deepseek-coder:33b-instruct">DeepSeek Coder 33B</SelectItem>
                          <SelectItem value="mistral:latest">Mistral</SelectItem>
                          <SelectItem value="openthinker:32b">OpenThinker 32B</SelectItem>
                        </>
                      ) : provider === 'gemini' ? (
                        <>
                          <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
                          <SelectItem value="gemini-1.5-flash-8b">Gemini 1.5 Flash 8B</SelectItem>
                          <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                          <SelectItem value="gemini-1.5-pro-002">Gemini 1.5 Pro 002</SelectItem>
                          <SelectItem value="gemini-1.5-flash-002">Gemini 1.5 Flash 002</SelectItem>
                          <SelectItem value="gemini-2.0-flash-exp">Gemini 2.0 Flash Exp</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="microsoft/DialoGPT-large">DialoGPT Large</SelectItem>
                          <SelectItem value="microsoft/DialoGPT-medium">DialoGPT Medium</SelectItem>
                          <SelectItem value="kimik2">Kimik2</SelectItem>
                          <SelectItem value="gpt2">GPT-2</SelectItem>
                          <SelectItem value="distilgpt2">DistilGPT-2</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="auto-approve"
                  checked={autoApprove}
                  onChange={(e) => setAutoApprove(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-zinc-100"
                />
                <label htmlFor="auto-approve" className="text-sm font-medium text-zinc-200">
                  Auto-approve actions
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="sync-mode"
                  checked={syncMode}
                  onChange={(e) => setSyncMode(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-zinc-100"
                />
                <label htmlFor="sync-mode" className="text-sm font-medium text-zinc-200">
                  Sync mode (multi-model)
                </label>
              </div>
            </div>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="space-y-2">
                  <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                        message.type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>

                  {message.actions && message.actions.length > 0 && (
                    <div className="ml-4 space-y-2">
                      <div className="text-xs font-medium text-muted-foreground">Actions:</div>
                      {message.actions.map((action, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getActionColor(action.type)}`}
                          >
                            {getActionIcon(action.type)}
                            {action.type.replace('_', ' ')}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {action.description}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-xs"
                            onClick={() => executeAction(action, message.id)}
                            disabled={executingActions.has(`${message.id}-${action.type}-${action.filePath || action.command || action.dependency}`)}
                          >
                            {executingActions.has(`${message.id}-${action.type}-${action.filePath || action.command || action.dependency}`) ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <CheckCircle className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Agent is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          <Separator />

          <div className="p-4">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && sendMessage()}
                placeholder="Ask me to create a component, fix a bug, or set up a project..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button 
                onClick={sendMessage} 
                disabled={isLoading || !input.trim()}
                size="icon"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Quick actions component
interface ClineQuickActionsProps {
  onActionSelect?: (prompt: string) => void;
}

export function ClineQuickActions({ onActionSelect }: ClineQuickActionsProps) {
  const quickActions = [
    { label: "Create React Component", prompt: "Create a new React component with TypeScript and Tailwind CSS" },
    { label: "Setup Next.js API", prompt: "Set up a new Next.js API route with proper structure" },
    { label: "Fix TypeScript Error", prompt: "Help me fix TypeScript compilation errors" },
    { label: "Optimize Performance", prompt: "Review and optimize my code for better performance" },
    { label: "Write Tests", prompt: "Write comprehensive tests for my current component" },
    { label: "Setup Database", prompt: "Set up a new database schema with Prisma" }
  ]

  return (
    <div className="grid grid-cols-2 gap-2">
      {quickActions.map((action) => (
        <Button
          key={action.label}
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() => onActionSelect?.(action.prompt)}
        >
          {action.label}
        </Button>
      ))}
    </div>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bot, Zap, Code, Terminal } from "lucide-react"
import { toast } from "sonner"

interface AgentDemoProps {
  onOpenAgent: () => void
}

export function AgentDemo({ onOpenAgent }: AgentDemoProps) {
  const [isLoading, setIsLoading] = useState(false)

  const quickExamples = [
    {
      title: "Create React Component",
      prompt: "Create a new React component with TypeScript and Tailwind CSS for a user profile card",
      icon: Code,
      color: "text-blue-500"
    },
    {
      title: "Setup API Route",
      prompt: "Set up a Next.js API route for handling user authentication with JWT tokens",
      icon: Terminal,
      color: "text-green-500"
    },
    {
      title: "Fix TypeScript Error",
      prompt: "Help me fix TypeScript compilation errors in my React project",
      icon: Zap,
      color: "text-yellow-500"
    },
    {
      title: "Optimize Performance",
      prompt: "Review and optimize my React component for better performance and memory usage",
      icon: Bot,
      color: "text-purple-500"
    }
  ]

  const handleQuickAction = async (prompt: string) => {
    setIsLoading(true)
    try {
      // This would typically open the agent with the prompt
      toast.success(`Opening agent with: ${prompt}`)
      onOpenAgent()
    } catch (error) {
      toast.error("Failed to open agent")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Cline AI Agent
          </CardTitle>
          <CardDescription>
            Your intelligent coding assistant that can create, modify, and analyze code like Cline
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="text-sm text-muted-foreground">
              The Cline Agent can help you with:
            </div>
            <div className="grid grid-cols-2 gap-3">
              {quickExamples.map((example, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-4 text-left justify-start"
                  onClick={() => handleQuickAction(example.prompt)}
                  disabled={isLoading}
                >
                  <div className="flex items-start gap-3">
                    <example.icon className={`h-5 w-5 mt-0.5 ${example.color}`} />
                    <div>
                      <div className="font-medium text-sm">{example.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {example.prompt.substring(0, 60)}...
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Agent Capabilities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">File Operations</h4>
              <div className="space-y-1">
                <Badge variant="outline" className="text-xs">Create Files</Badge>
                <Badge variant="outline" className="text-xs">Modify Files</Badge>
                <Badge variant="outline" className="text-xs">Delete Files</Badge>
                <Badge variant="outline" className="text-xs">Create Folders</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Development Tasks</h4>
              <div className="space-y-1">
                <Badge variant="outline" className="text-xs">Install Dependencies</Badge>
                <Badge variant="outline" className="text-xs">Run Commands</Badge>
                <Badge variant="outline" className="text-xs">Code Generation</Badge>
                <Badge variant="outline" className="text-xs">Error Fixing</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How to Use</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 text-sm">
            <li>1. Click on the AI Assistant button in the sidebar</li>
            <li>2. Switch to the "Cline Agent" tab</li>
            <li>3. Ask the agent to perform tasks like "Create a React component"</li>
            <li>4. Review the suggested actions and execute them</li>
            <li>5. The agent will create files, run commands, and set up your project</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}

// Quick start guide
export function AgentQuickStart() {
  return (
    <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-purple-400" />
          Get Started with Cline Agent
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Transform your IDE into a Cline-like experience with AI-powered development assistance.
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-zinc-800/50 rounded-lg">
              <h4 className="font-medium text-sm mb-2">🎯 Ask Anything</h4>
              <p className="text-xs text-muted-foreground">
                "Create a Next.js API route with authentication"
              </p>
            </div>
            
            <div className="p-3 bg-zinc-800/50 rounded-lg">
              <h4 className="font-medium text-sm mb-2">⚡ Get Actions</h4>
              <p className="text-xs text-muted-foreground">
                Receive specific file creation and command suggestions
              </p>
            </div>
            
            <div className="p-3 bg-zinc-800/50 rounded-lg">
              <h4 className="font-medium text-sm mb-2">✅ Execute</h4>
              <p className="text-xs text-muted-foreground">
                Run actions with one click to build your project
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

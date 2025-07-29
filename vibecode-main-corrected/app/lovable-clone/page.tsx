'use client'

import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Loader2,
  Send,
  User,
  Bot,
  Sparkles,
  Code,
  Eye,
  Download,
  Share,
  Settings,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { EnhancedCodeBlock } from '@/features/ai-chat/components/ai-chat-code-blocks'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  generatedCode?: string
  generatedFiles?: GeneratedFile[]
}

interface GeneratedFile {
  name: string
  content: string
  language: string
  path: string
}

const SUGGESTED_PROMPTS = [
  {
    icon: '🎬',
    title: 'Build a Netflix clone',
    description: 'Create a streaming platform with movie browsing and video player'
  },
  {
    icon: '📊',
    title: 'Build an admin dashboard',
    description: 'Create a comprehensive admin panel with charts and data management'
  },
  {
    icon: '📋',
    title: 'Build a kanban board',
    description: 'Create a project management tool with drag-and-drop functionality'
  },
  {
    icon: '📁',
    title: 'Build a file manager',
    description: 'Create a file management system with upload and organization features'
  },
  {
    icon: '📺',
    title: 'Build a YouTube clone',
    description: 'Create a video sharing platform with upload and streaming capabilities'
  },
  {
    icon: '🛒',
    title: 'Build a store page',
    description: 'Create an e-commerce store with product catalog and shopping cart'
  },
  {
    icon: '🏠',
    title: 'Build an Airbnb clone',
    description: 'Create a property rental platform with booking functionality'
  },
  {
    icon: '🎵',
    title: 'Build a Spotify clone',
    description: 'Create a music streaming platform with playlists and player controls'
  }
]

export default function LovableClonePage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [generatedApp, setGeneratedApp] = useState<GeneratedFile[] | null>(null)
  // const [showPreview, setShowPreview] = useState(false)

  const generateSampleCode = useCallback((prompt: string): string => {
    return `// Generated App: ${prompt}\n\nimport React, { useState } from 'react'\nimport { Button } from '@/components/ui/button'\nimport { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'\n\nexport default function GeneratedApp() {\n  const [count, setCount] = useState(0)\n\n  return (\n    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">\n      <div className="max-w-4xl mx-auto">\n        <Card className="shadow-xl">\n          <CardHeader>\n            <CardTitle className="text-3xl font-bold text-center">\n              ${prompt}\n            </CardTitle>\n          </CardHeader>\n          <CardContent className="space-y-6">\n            <div className="text-center">\n              <p className="text-lg text-gray-600 mb-4">\n                Welcome to your generated application!\n              </p>\n              <Button \n                onClick={() => setCount(count + 1)}\n                className="bg-blue-600 hover:bg-blue-700"\n              >\n                Click me! ({count})\n              </Button>\n            </div>\n          </CardContent>\n        </Card>\n      </div>\n    </div>\n  )\n}`
  }, [])

  const generateSampleFiles = useCallback((prompt: string): GeneratedFile[] => {
    return [
      {
        name: 'App.tsx',
        content: generateSampleCode(prompt),
        language: 'typescript',
        path: '/src/App.tsx'
      },
      {
        name: 'package.json',
        content: JSON.stringify({
          "name": "generated-app",
          "version": "1.0.0",
          "dependencies": {
            "react": "^18.0.0",
            "react-dom": "^18.0.0",
            "tailwindcss": "^3.0.0"
          }
        }, null, 2),
        language: 'json',
        path: '/package.json'
      }
    ]
  }, [generateSampleCode])

  const handleSendMessage = useCallback(async (messageContent?: string) => {
    const content = messageContent || input.trim()
    if (!content || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Simulate AI response for app generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I\'ll help you build that! Let me create a complete application for you.\n\nI\'m generating:\n- React components with modern UI\n- Responsive design with Tailwind CSS\n- Interactive functionality\n- Clean, production-ready code\n\nYour app will be ready in a moment...",
        timestamp: new Date(),
        generatedCode: generateSampleCode(content),
        generatedFiles: generateSampleFiles(content)
      }

      setMessages(prev => [...prev, assistantMessage])
      setGeneratedApp(assistantMessage.generatedFiles || null)
    } catch (error) {
      console.error('Error generating app:', error)
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, generateSampleCode, generateSampleFiles])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold">Lovable Clone</h1>
              <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                Beta
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Share className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {messages.length === 0 ? (
          /* Welcome Screen */
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl mx-auto flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Build something with Lovable Clone
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Create apps and websites by chatting with AI
              </p>
            </div>

            {/* Input Section */}
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="What would you like to build?"
                  className="min-h-[120px] bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 text-lg resize-none pr-16"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!input.trim() || isLoading}
                  className="absolute bottom-4 right-4 bg-orange-500 hover:bg-orange-600 text-white"
                  size="sm"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <div className="flex items-center justify-center mt-4 text-sm text-gray-500">
                <span className="flex items-center">
                  ⌘ + Enter to submit
                </span>
              </div>
            </div>

            {/* Suggested Prompts */}
            <div className="max-w-6xl mx-auto">
              <h2 className="text-lg font-semibold mb-6 text-gray-300">Try building one of these:</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {SUGGESTED_PROMPTS.map((prompt, index) => (
                  <Card
                    key={index}
                    className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors cursor-pointer group p-0"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      console.log('Card clicked:', prompt.title)
                      handleSendMessage(prompt.title)
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="text-2xl mb-2">{prompt.icon}</div>
                      <h3 className="font-semibold text-white group-hover:text-orange-300 transition-colors">
                        {prompt.title}
                      </h3>
                      <p className="text-sm text-gray-400 mt-1">
                        {prompt.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Chat Interface */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-200px)]">
            {/* Chat Messages */}
            <div className="flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3",
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {message.role === 'assistant' && (
                      <Avatar className="w-8 h-8 bg-orange-500">
                        <AvatarFallback>
                          <Bot className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        "max-w-[80%] rounded-lg px-4 py-3",
                        message.role === 'user'
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-800 text-white'
                      )}
                    >
                      <div className="prose prose-invert max-w-none">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                      
                      {message.generatedCode && (
                        <div className="mt-4">
                          <EnhancedCodeBlock
                            className="language-typescript"
                            fileName="App.tsx"
                          >
                            {message.generatedCode}
                          </EnhancedCodeBlock>
                        </div>
                      )}
                    </div>
                    {message.role === 'user' && (
                      <Avatar className="w-8 h-8 bg-blue-500">
                        <AvatarFallback>
                          <User className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <Avatar className="w-8 h-8 bg-orange-500">
                      <AvatarFallback>
                        <Bot className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-gray-800 text-white rounded-lg px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Generating your app...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Input */}
              <div className="relative">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Describe changes or ask questions..."
                  className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 resize-none pr-16"
                  rows={3}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!input.trim() || isLoading}
                  className="absolute bottom-3 right-3 bg-orange-500 hover:bg-orange-600 text-white"
                  size="sm"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Preview Panel */}
            <div className="bg-gray-800/30 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span className="font-medium">Live Preview</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Code className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="p-4">
                {generatedApp ? (
                  <div className="space-y-4">
                    <div className="text-center text-gray-400">
                      <div className="w-16 h-16 bg-gray-700 rounded-lg mx-auto mb-4 flex items-center justify-center">
                        <Zap className="w-8 h-8" />
                      </div>
                      <p>Your app has been generated!</p>
                      <p className="text-sm mt-2">{generatedApp.length} files created</p>
                    </div>
                    <div className="space-y-2">
                      {generatedApp.map((file, index) => (
                        <div key={index} className="bg-gray-800/50 rounded p-3">
                          <div className="flex items-center gap-2">
                            <Code className="w-4 h-4 text-orange-400" />
                            <span className="text-sm font-medium">{file.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-12">
                    <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No preview available</p>
                    <p className="text-sm mt-2">Start creating to see your app here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
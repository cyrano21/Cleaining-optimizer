// Types partagés pour le système de chat

export interface ChatAttachment {
  id: string
  name: string
  type: string
  size: number
  url?: string
  content?: string
}

export interface ChatMetadata {
  provider?: string
  model?: string
  tokens?: number
  temperature?: number
  maxTokens?: number
  [key: string]: unknown
}

export interface ChatSuggestion {
  id: string
  text: string
  type?: 'quick_reply' | 'action' | 'command'
  action?: string
}

export interface BaseChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: Date
  createdAt?: string
  updatedAt?: string
}

export interface ChatMessage extends BaseChatMessage {
  sessionId?: string
  userId?: string
  attachments?: ChatAttachment[]
  metadata?: ChatMetadata
  suggestions?: ChatSuggestion[]
  tokens?: number
  model?: string
  type?: 'suggestion' | 'optimization' | 'chat' | 'code_review' | 'error_fix'
}

export interface StreamingChatMessage extends BaseChatMessage {
  type?: string
  attachments?: ChatAttachment[]
  suggestions?: ChatSuggestion[]
  tokens?: number
  model?: string
}

export interface WSMessage {
  type: 'start' | 'chunk' | 'complete' | 'error'
  content?: string
  sessionId?: string
  metadata?: {
    provider?: string
    model?: string
    tokens?: number
  }
  error?: string
}

export interface StreamingChatOptions {
  onMessageUpdate?: (message: ChatMessage) => void
  onError?: (error: string) => void
  onComplete?: () => void
}
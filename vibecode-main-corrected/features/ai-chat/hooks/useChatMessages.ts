"use client"

import { useState, useEffect, useCallback } from 'react'
import { ChatMessage } from '@prisma/client'

interface CreateMessageData {
  content: string
  role: 'user' | 'assistant'
  sessionId: string
  type?: string
  metadata?: Record<string, any>
}

interface UpdateMessageData {
  content?: string
  type?: string
  metadata?: Record<string, any>
}

export interface ChatMessageWithSession extends ChatMessage {
  session?: {
    id: string
    title: string
    aiProvider: string
    aiModel: string
  }
}

export const useChatMessages = (sessionId?: string) => {
  const [messages, setMessages] = useState<ChatMessageWithSession[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch messages for a specific session
  const fetchMessages = useCallback(async (sessionId: string, limit = 50, offset = 0) => {
    if (!sessionId) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(
        `/api/chat/sessions/${sessionId}/messages?limit=${limit}&offset=${offset}`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages')
      }
      
      const data = await response.json()
      setMessages(data.messages || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Error fetching messages:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Create a new message
  const createMessage = useCallback(async (data: CreateMessageData): Promise<ChatMessageWithSession | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        throw new Error('Failed to create message')
      }
      
      const message = await response.json()
      
      // Add to local state if it's for the current session
      if (data.sessionId === sessionId) {
        setMessages(prev => [...prev, message])
      }
      
      return message
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Error creating message:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [sessionId])

  // Update a message
  const updateMessage = useCallback(async (messageId: string, data: UpdateMessageData): Promise<ChatMessageWithSession | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/chat/messages/${messageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update message')
      }
      
      const updatedMessage = await response.json()
      
      // Update local state
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? updatedMessage : msg
        )
      )
      
      return updatedMessage
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Error updating message:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // Delete a message
  const deleteMessage = useCallback(async (messageId: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/chat/messages/${messageId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete message')
      }
      
      // Remove from local state
      setMessages(prev => prev.filter(msg => msg.id !== messageId))
      
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Error deleting message:', err)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // Clear all messages for current session
  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  // Load messages when sessionId changes
  useEffect(() => {
    if (sessionId) {
      fetchMessages(sessionId)
    } else {
      setMessages([])
    }
  }, [sessionId, fetchMessages])

  return {
    messages,
    loading,
    error,
    fetchMessages,
    createMessage,
    updateMessage,
    deleteMessage,
    clearMessages,
    setMessages
  }
}
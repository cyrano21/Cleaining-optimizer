import { useState, useRef, useCallback } from 'react'
import { ChatMessage, StreamingChatOptions, WSMessage } from '@/lib/types/chat'

export const useStreamingChat = (options: StreamingChatOptions = {}) => {
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamedContent, setStreamedContent] = useState('')
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState<ChatMessage | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const sessionIdRef = useRef<string>(Date.now().toString())

  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return wsRef.current
    }

    // Create WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/api/chat/stream`
    
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      console.log('🔌 WebSocket connected for streaming chat')
    }

    ws.onmessage = (event) => {
      try {
        const data: WSMessage = JSON.parse(event.data)
        
        switch (data.type) {
          case 'start':
            setIsStreaming(true)
            setStreamedContent('')
            const newMessage: ChatMessage = {
              role: 'assistant',
              content: '',
              timestamp: new Date(),
              id: Date.now().toString(),
              model: data.metadata?.model || 'AI Assistant'
            }
            setCurrentStreamingMessage(newMessage)
            break
            
          case 'chunk':
            if (data.content) {
              setStreamedContent(prev => {
                const newContent = prev + data.content
                if (currentStreamingMessage) {
                  const updatedMessage = {
                    ...currentStreamingMessage,
                    content: newContent
                  }
                  setCurrentStreamingMessage(updatedMessage)
                  options.onMessageUpdate?.(updatedMessage)
                }
                return newContent
              })
            }
            break
            
          case 'complete':
            setIsStreaming(false)
            if (currentStreamingMessage) {
              const finalMessage = {
                ...currentStreamingMessage,
                content: streamedContent
              }
              setCurrentStreamingMessage(null)
              options.onComplete?.()
            }
            break
            
          case 'error':
            setIsStreaming(false)
            setCurrentStreamingMessage(null)
            options.onError?.(data.error || 'Streaming error occurred')
            break
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
        options.onError?.('Failed to parse streaming response')
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      setIsStreaming(false)
      setCurrentStreamingMessage(null)
      options.onError?.('WebSocket connection error')
    }

    ws.onclose = () => {
      console.log('🔌 WebSocket disconnected')
      setIsStreaming(false)
      setCurrentStreamingMessage(null)
    }

    return ws
  }, [options, currentStreamingMessage, streamedContent])

  const sendStreamingMessage = useCallback(async (
    messages: ChatMessage[],
    provider: string = 'ollama',
    model?: string
  ) => {
    try {
      const ws = connectWebSocket()
      
      if (ws.readyState !== WebSocket.OPEN) {
        // Wait for connection
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('WebSocket connection timeout')), 5000)
          
          ws.onopen = () => {
            clearTimeout(timeout)
            resolve(void 0)
          }
          
          ws.onerror = () => {
            clearTimeout(timeout)
            reject(new Error('WebSocket connection failed'))
          }
        })
      }

      // Send streaming request
      const request = {
        type: 'chat',
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        provider,
        model,
        sessionId: sessionIdRef.current
      }

      ws.send(JSON.stringify(request))
      
    } catch (error) {
      console.error('Error sending streaming message:', error)
      options.onError?.('Failed to send streaming message')
      setIsStreaming(false)
    }
  }, [connectWebSocket, options])

  const stopStreaming = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    setIsStreaming(false)
    setCurrentStreamingMessage(null)
    setStreamedContent('')
  }, [])

  const cleanup = useCallback(() => {
    stopStreaming()
  }, [stopStreaming])

  return {
    isStreaming,
    streamedContent,
    currentStreamingMessage,
    sendStreamingMessage,
    stopStreaming,
    cleanup
  }
}